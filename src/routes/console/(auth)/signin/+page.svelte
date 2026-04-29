<script lang="ts">
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { ApiError } from '$lib/api/client';
	import {
		GoogleSignInCancelled,
		isGoogleConfigured,
		requestGoogleAuthCode
	} from '$lib/auth/google-sdk';
	import CommonGridShape from '$lib/components/ui/CommonGridShape.svelte';
	import { auth } from '$lib/stores/auth.svelte';

	const googleEnabled = isGoogleConfigured();

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
					<svg
						class="stroke-current"
						xmlns="http://www.w3.org/2000/svg"
						width="20"
						height="20"
						viewBox="0 0 20 20"
						fill="none"
					>
						<path
							d="M12.7083 5L7.5 10.2083L12.7083 15.4167"
							stroke-width="1.5"
							stroke-linecap="round"
							stroke-linejoin="round"
						/>
					</svg>
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
								<svg
									width="20"
									height="20"
									viewBox="0 0 20 20"
									fill="none"
									xmlns="http://www.w3.org/2000/svg"
								>
									<path
										d="M18.7511 10.1944C18.7511 9.47495 18.6915 8.94995 18.5626 8.40552H10.1797V11.6527H15.1003C15.0011 12.4597 14.4654 13.675 13.2749 14.4916L13.2582 14.6003L15.9087 16.6126L16.0924 16.6305C17.7788 15.1041 18.7511 12.8583 18.7511 10.1944Z"
										fill="#4285F4"
									/>
									<path
										d="M10.1788 18.75C12.5895 18.75 14.6133 17.9722 16.0915 16.6305L13.274 14.4916C12.5201 15.0068 11.5081 15.3666 10.1788 15.3666C7.81773 15.3666 5.81379 13.8402 5.09944 11.7305L4.99473 11.7392L2.23868 13.8295L2.20264 13.9277C3.67087 16.786 6.68674 18.75 10.1788 18.75Z"
										fill="#34A853"
									/>
									<path
										d="M5.10014 11.7305C4.91165 11.186 4.80257 10.6027 4.80257 9.99992C4.80257 9.3971 4.91165 8.81379 5.09022 8.26935L5.08523 8.1534L2.29464 6.02954L2.20333 6.0721C1.5982 7.25823 1.25098 8.5902 1.25098 9.99992C1.25098 11.4096 1.5982 12.7415 2.20333 13.9277L5.10014 11.7305Z"
										fill="#FBBC05"
									/>
									<path
										d="M10.1789 4.63331C11.8554 4.63331 12.9864 5.34303 13.6312 5.93612L16.1511 3.525C14.6035 2.11528 12.5895 1.25 10.1789 1.25C6.68676 1.25 3.67088 3.21387 2.20264 6.07218L5.08953 8.26943C5.81381 6.15972 7.81776 4.63331 10.1789 4.63331Z"
										fill="#EB4335"
									/>
								</svg>
								Sign in with Google
							</button>
							<button
								class="inline-flex items-center justify-center gap-3 rounded-xl bg-gray-100 px-7 py-3 text-sm font-normal text-gray-700 transition-colors hover:bg-gray-200 hover:text-gray-800 dark:bg-white/5 dark:text-white/90 dark:hover:bg-white/10"
							>
								<svg
									width="20"
									height="20"
									viewBox="0 0 20 20"
									fill="none"
									xmlns="http://www.w3.org/2000/svg"
								>
									<path
										d="M11.6663 12.1366H13.7497L14.583 8.80322H11.6663V7.13656C11.6663 6.27874 11.6663 5.46989 13.333 5.46989H14.583V2.66997C14.3116 2.63393 13.2855 2.55322 12.2021 2.55322C9.94001 2.55322 8.33301 3.93394 8.33301 6.46965V8.80322H5.83301V12.1366H8.33301V19.2199H11.6663V12.1366Z"
										fill="#1877F2"
									/>
								</svg>
								Sign in with Facebook
							</button>
							<button
								class="inline-flex items-center justify-center gap-3 rounded-xl bg-gray-100 px-7 py-3 text-sm font-normal text-gray-700 transition-colors hover:bg-gray-200 hover:text-gray-800 dark:bg-white/5 dark:text-white/90 dark:hover:bg-white/10"
							>
								<svg
									class="fill-current"
									width="20"
									height="20"
									viewBox="0 0 20 20"
									fill="none"
									xmlns="http://www.w3.org/2000/svg"
								>
									<path
										d="M16.365 1.43c.018 1.066-.475 2.046-1.215 2.78-.736.731-1.815 1.222-2.785 1.072-.123-1.05.378-2.133 1.117-2.836.823-.787 1.953-1.146 2.883-1.016zM18.71 14.5c-.45 1.038-1.018 2.052-1.882 3.06-.864 1.008-1.95 1.762-3.115 1.78-1.118.018-1.482-.643-2.764-.643-1.282 0-1.683.625-2.745.661-1.106.036-1.952-.84-2.823-1.84-1.78-2.038-3.143-5.764-1.31-8.272.91-1.245 2.535-2.034 4.27-2.06 1.107-.018 2.151.7 2.835.7.685 0 1.95-.864 3.27-.737.553.022 2.108.215 3.106 1.612-.082.05-1.864 1.06-1.844 3.143.022 2.5 2.232 3.343 2.255 3.353-.018.054-.343.96-.838 2.005z"
									/>
								</svg>
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
												<svg
													class="fill-current"
													width="20"
													height="20"
													viewBox="0 0 20 20"
													fill="none"
													xmlns="http://www.w3.org/2000/svg"
												>
													<path
														fill-rule="evenodd"
														clip-rule="evenodd"
														d="M10.0002 13.8619C7.23361 13.8619 4.86803 12.1372 3.92328 9.70241C4.86804 7.26761 7.23361 5.54297 10.0002 5.54297C12.7667 5.54297 15.1323 7.26762 16.0771 9.70243C15.1323 12.1372 12.7667 13.8619 10.0002 13.8619ZM10.0002 4.04297C6.48191 4.04297 3.49489 6.30917 2.4155 9.4593C2.3615 9.61687 2.3615 9.78794 2.41549 9.94552C3.49488 13.0957 6.48191 15.3619 10.0002 15.3619C13.5184 15.3619 16.5055 13.0957 17.5849 9.94555C17.6389 9.78797 17.6389 9.6169 17.5849 9.45932C16.5055 6.30919 13.5184 4.04297 10.0002 4.04297ZM9.99151 7.84413C8.96527 7.84413 8.13333 8.67606 8.13333 9.70231C8.13333 10.7286 8.96527 11.5605 9.99151 11.5605H10.0064C11.0326 11.5605 11.8646 10.7286 11.8646 9.70231C11.8646 8.67606 11.0326 7.84413 10.0064 7.84413H9.99151Z"
														fill="#98A2B3"
													/>
												</svg>
											{:else}
												<svg
													class="fill-current"
													width="20"
													height="20"
													viewBox="0 0 20 20"
													fill="none"
													xmlns="http://www.w3.org/2000/svg"
												>
													<path
														fill-rule="evenodd"
														clip-rule="evenodd"
														d="M4.63803 3.57709C4.34513 3.2842 3.87026 3.2842 3.57737 3.57709C3.28447 3.86999 3.28447 4.34486 3.57737 4.63775L4.85323 5.91362C3.74609 6.84199 2.89363 8.06395 2.4155 9.45936C2.3615 9.61694 2.3615 9.78801 2.41549 9.94558C3.49488 13.0957 6.48191 15.3619 10.0002 15.3619C11.255 15.3619 12.4422 15.0737 13.4994 14.5598L15.3625 16.4229C15.6554 16.7158 16.1302 16.7158 16.4231 16.4229C16.716 16.13 16.716 15.6551 16.4231 15.3622L4.63803 3.57709ZM12.3608 13.4212L10.4475 11.5079C10.3061 11.5423 10.1584 11.5606 10.0064 11.5606H9.99151C8.96527 11.5606 8.13333 10.7286 8.13333 9.70237C8.13333 9.5461 8.15262 9.39434 8.18895 9.24933L5.91885 6.97923C5.03505 7.69015 4.34057 8.62704 3.92328 9.70247C4.86803 12.1373 7.23361 13.8619 10.0002 13.8619C10.8326 13.8619 11.6287 13.7058 12.3608 13.4212ZM16.0771 9.70249C15.7843 10.4569 15.3552 11.1432 14.8199 11.7311L15.8813 12.7925C16.6329 11.9813 17.2187 11.0143 17.5849 9.94561C17.6389 9.78803 17.6389 9.61696 17.5849 9.45938C16.5055 6.30925 13.5184 4.04303 10.0002 4.04303C9.13525 4.04303 8.30244 4.17999 7.52218 4.43338L8.75139 5.66259C9.1556 5.58413 9.57311 5.54303 10.0002 5.54303C12.7667 5.54303 15.1323 7.26768 16.0771 9.70249Z"
														fill="#98A2B3"
													/>
												</svg>
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
														<svg
															width="14"
															height="14"
															viewBox="0 0 14 14"
															fill="none"
															xmlns="http://www.w3.org/2000/svg"
														>
															<path
																d="M11.6666 3.5L5.24992 9.91667L2.33325 7"
																stroke="white"
																stroke-width="1.94437"
																stroke-linecap="round"
																stroke-linejoin="round"
															/>
														</svg>
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
