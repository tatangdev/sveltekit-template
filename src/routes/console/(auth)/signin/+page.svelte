<script lang="ts">
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { ApiError } from '$lib/api/client';
	import { AppleSignInCancelled, isAppleConfigured, requestAppleAuth } from '$lib/auth/apple-sdk';
	import {
		FacebookSignInCancelled,
		isFacebookConfigured,
		requestFacebookAccessToken
	} from '$lib/auth/facebook-sdk';
	import {
		GoogleSignInCancelled,
		isGoogleConfigured,
		requestGoogleAuthCode
	} from '$lib/auth/google-sdk';
	import CommonGridShape from '$lib/components/ui/CommonGridShape.svelte';
	import AppleLogo from '$lib/components/ui/icons/AppleLogo.svelte';
	import CheckIcon from '$lib/components/ui/icons/CheckIcon.svelte';
	import ChevronLeftIcon from '$lib/components/ui/icons/ChevronLeftIcon.svelte';
	import EyeClosedIcon from '$lib/components/ui/icons/EyeClosedIcon.svelte';
	import EyeOpenIcon from '$lib/components/ui/icons/EyeOpenIcon.svelte';
	import FacebookLogo from '$lib/components/ui/icons/FacebookLogo.svelte';
	import GoogleLogo from '$lib/components/ui/icons/GoogleLogo.svelte';
	import { auth } from '$lib/stores/auth.svelte';

	const googleEnabled = isGoogleConfigured();
	const facebookEnabled = isFacebookConfigured();
	const appleEnabled = isAppleConfigured();

	let email = $state('');
	let password = $state('');
	let showPassword = $state(false);
	let keepLoggedIn = $state(false);
	let submitting = $state(false);
	let error = $state<string | null>(null);

	function describeError(err: unknown): string {
		if (err instanceof ApiError) return err.message;
		if (err instanceof Error) return err.message;
		return 'Something went wrong.';
	}

	async function handleSubmit(e: SubmitEvent) {
		e.preventDefault();
		error = null;
		submitting = true;
		try {
			await auth.login(email, password);
			await goto(resolve('/console'));
		} catch (err) {
			error = describeError(err);
		} finally {
			submitting = false;
		}
	}

	async function handleGoogle() {
		if (!googleEnabled) {
			error = 'Google sign-in is not configured.';
			return;
		}
		error = null;
		submitting = true;
		try {
			const code = await requestGoogleAuthCode();
			await auth.googleLogin(code);
			await goto(resolve('/console'));
		} catch (err) {
			if (err instanceof GoogleSignInCancelled) return;
			error = describeError(err);
		} finally {
			submitting = false;
		}
	}

	async function handleFacebook() {
		if (!facebookEnabled) {
			error = 'Facebook sign-in is not configured.';
			return;
		}
		error = null;
		submitting = true;
		try {
			const accessToken = await requestFacebookAccessToken();
			await auth.facebookLogin(accessToken);
			await goto(resolve('/console'));
		} catch (err) {
			if (err instanceof FacebookSignInCancelled) return;
			error = describeError(err);
		} finally {
			submitting = false;
		}
	}

	async function handleApple() {
		if (!appleEnabled) {
			error = 'Apple sign-in is not configured.';
			return;
		}
		error = null;
		submitting = true;
		try {
			const result = await requestAppleAuth();
			await auth.appleLogin(result.idToken, result.userName);
			await goto(resolve('/console'));
		} catch (err) {
			if (err instanceof AppleSignInCancelled) return;
			error = describeError(err);
		} finally {
			submitting = false;
		}
	}
</script>

<svelte:head>
	<title>Sign In | Console</title>
</svelte:head>

<div class="relative z-1 bg-white p-6 sm:p-0 dark:bg-gray-900">
	<div
		class="relative flex h-screen w-full flex-col justify-center sm:p-0 lg:flex-row dark:bg-gray-900"
	>
		<div class="flex w-full flex-1 flex-col lg:w-1/2">
			<div class="mx-auto w-full max-w-md pt-10">
				<a
					href={resolve('/console')}
					class="inline-flex items-center text-sm text-gray-500 transition-colors hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
				>
					<ChevronLeftIcon />
					Back to dashboard
				</a>
			</div>
			<div class="mx-auto flex w-full max-w-md flex-1 flex-col justify-center">
				<div>
					<div class="mb-5 sm:mb-8">
						<h1
							class="mb-2 text-title-sm font-semibold text-gray-800 sm:text-title-md dark:text-white/90"
						>
							Sign In
						</h1>
						<p class="text-sm text-gray-500 dark:text-gray-400">
							Enter your email and password to sign in!
						</p>
					</div>
					<div>
						<div class="flex flex-col gap-3">
							<button
								type="button"
								onclick={handleGoogle}
								disabled={submitting || !googleEnabled}
								title={googleEnabled ? undefined : 'Google sign-in is not configured.'}
								class="inline-flex items-center justify-center gap-3 rounded-xl bg-gray-100 px-7 py-3 text-sm font-normal text-gray-700 transition-colors hover:bg-gray-200 hover:text-gray-800 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-white/5 dark:text-white/90 dark:hover:bg-white/10"
							>
								<GoogleLogo />
								Sign in with Google
							</button>
							<button
								type="button"
								onclick={handleFacebook}
								disabled={submitting || !facebookEnabled}
								title={facebookEnabled ? undefined : 'Facebook sign-in is not configured.'}
								class="inline-flex items-center justify-center gap-3 rounded-xl bg-gray-100 px-7 py-3 text-sm font-normal text-gray-700 transition-colors hover:bg-gray-200 hover:text-gray-800 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-white/5 dark:text-white/90 dark:hover:bg-white/10"
							>
								<FacebookLogo />
								Sign in with Facebook
							</button>
							<button
								type="button"
								onclick={handleApple}
								disabled={submitting || !appleEnabled}
								title={appleEnabled ? undefined : 'Apple sign-in is not configured.'}
								class="inline-flex items-center justify-center gap-3 rounded-xl bg-gray-100 px-7 py-3 text-sm font-normal text-gray-700 transition-colors hover:bg-gray-200 hover:text-gray-800 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-white/5 dark:text-white/90 dark:hover:bg-white/10"
							>
								<AppleLogo />
								Sign in with Apple
							</button>
						</div>
						<div class="relative py-3 sm:py-5">
							<div class="absolute inset-0 flex items-center">
								<div class="w-full border-t border-gray-200 dark:border-gray-800"></div>
							</div>
							<div class="relative flex justify-center text-sm">
								<span class="bg-white p-2 text-gray-400 sm:px-5 sm:py-2 dark:bg-gray-900">Or</span>
							</div>
						</div>
						<form onsubmit={handleSubmit}>
							<div class="space-y-5">
								{#if error}
									<div
										role="alert"
										class="border-error-200 dark:text-error-400 rounded-xl border bg-error-50 px-4 py-2.5 text-sm text-error-600 dark:border-error-500/30 dark:bg-error-500/10"
									>
										{error}
									</div>
								{/if}
								<div>
									<label
										for="email"
										class="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400"
									>
										Email<span class="text-error-500">*</span>
									</label>
									<input
										type="email"
										id="email"
										name="email"
										required
										bind:value={email}
										placeholder="info@gmail.com"
										class="h-11 w-full rounded-xl border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:ring-3 focus:ring-brand-500/10 focus:outline-hidden dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
									/>
								</div>
								<div>
									<label
										for="password"
										class="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400"
									>
										Password<span class="text-error-500">*</span>
									</label>
									<div class="relative">
										<input
											id="password"
											type={showPassword ? 'text' : 'password'}
											required
											bind:value={password}
											placeholder="Enter your password"
											class="h-11 w-full rounded-xl border border-gray-300 bg-transparent py-2.5 pr-11 pl-4 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:ring-3 focus:ring-brand-500/10 focus:outline-hidden dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
										/>
										<button
											type="button"
											onclick={() => (showPassword = !showPassword)}
											aria-label="Toggle password visibility"
											class="absolute top-1/2 right-4 z-30 -translate-y-1/2 cursor-pointer text-gray-500 dark:text-gray-400"
										>
											{#if !showPassword}
												<EyeOpenIcon />
											{:else}
												<EyeClosedIcon />
											{/if}
										</button>
									</div>
								</div>
								<div class="flex items-center justify-between">
									<div>
										<label
											for="keep-logged-in"
											class="flex cursor-pointer items-center text-sm font-normal text-gray-700 select-none dark:text-gray-400"
										>
											<div class="relative">
												<input
													type="checkbox"
													id="keep-logged-in"
													class="sr-only"
													onchange={() => (keepLoggedIn = !keepLoggedIn)}
												/>
												<div
													class="mr-3 flex h-5 w-5 items-center justify-center rounded-lg border-[1.25px] {keepLoggedIn
														? 'border-brand-500 bg-brand-500'
														: 'border-gray-300 bg-transparent dark:border-gray-700'}"
												>
													<span class={keepLoggedIn ? '' : 'opacity-0'}>
														<CheckIcon class="stroke-white" />
													</span>
												</div>
											</div>
											Keep me logged in
										</label>
									</div>
									<a
										href={resolve('/console/reset-password')}
										class="text-sm text-brand-500 hover:text-brand-600 dark:text-brand-400"
										>Forgot password?</a
									>
								</div>
								<div>
									<button
										type="submit"
										disabled={submitting}
										class="flex w-full items-center justify-center rounded-xl bg-brand-500 px-4 py-3 text-sm font-medium text-white shadow-theme-xs transition hover:bg-brand-600 disabled:opacity-60"
									>
										{submitting ? 'Signing in…' : 'Sign In'}
									</button>
								</div>
							</div>
						</form>
						<div class="mt-5">
							<p
								class="text-center text-sm font-normal text-gray-700 sm:text-start dark:text-gray-400"
							>
								Don't have an account?
								<a
									href={resolve('/console/signup')}
									class="text-brand-500 hover:text-brand-600 dark:text-brand-400">Sign Up</a
								>
							</p>
						</div>
					</div>
				</div>
			</div>
		</div>

		<div
			class="relative hidden h-full w-full items-center bg-brand-950 lg:grid lg:w-1/2 dark:bg-white/5"
		>
			<div class="z-1 flex items-center justify-center">
				<CommonGridShape />
				<div class="flex max-w-xs flex-col items-center">
					<a href={resolve('/console')} class="mb-4 block">
						<img src="/images/logo/auth-logo.svg" alt="Logo" />
					</a>
					<p class="text-center text-gray-400 dark:text-white/60">
						Free and Open-Source Tailwind CSS Admin Dashboard Template
					</p>
				</div>
			</div>
		</div>
	</div>
</div>
