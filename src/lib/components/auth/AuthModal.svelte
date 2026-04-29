<script lang="ts">
	import type { Snippet } from 'svelte';
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
	import AppleLogo from '$lib/components/ui/icons/AppleLogo.svelte';
	import ChevronLeftIcon from '$lib/components/ui/icons/ChevronLeftIcon.svelte';
	import CloseIcon from '$lib/components/ui/icons/CloseIcon.svelte';
	import EyeClosedIcon from '$lib/components/ui/icons/EyeClosedIcon.svelte';
	import EyeOpenIcon from '$lib/components/ui/icons/EyeOpenIcon.svelte';
	import FacebookLogo from '$lib/components/ui/icons/FacebookLogo.svelte';
	import GoogleLogo from '$lib/components/ui/icons/GoogleLogo.svelte';
	import { auth } from '$lib/stores/auth.svelte';

	const googleEnabled = isGoogleConfigured();
	const facebookEnabled = isFacebookConfigured();
	const appleEnabled = isAppleConfigured();

	type View =
		| 'signup'
		| 'login'
		| 'email-form'
		| 'email-verify'
		| 'personal-details'
		| 'preferences'
		| 'welcome';

	type Props = {
		open: boolean;
		onClose: () => void;
		initialView?: 'signup' | 'login';
	};

	let { open, onClose, initialView = 'signup' }: Props = $props();

	let view = $state<View>('signup');

	let email = $state('');
	let password = $state('');
	let confirmPassword = $state('');
	let showPassword = $state(false);
	let showConfirmPassword = $state(false);
	let otp = $state(['', '', '', '', '', '']);
	let otpRefs: HTMLInputElement[] = $state([]);

	let firstName = $state('');
	let lastName = $state('');
	let dateOfBirth = $state('');
	let currency = $state('USD');
	let marketingEmails = $state(true);

	let submitting = $state(false);
	let error = $state<string | null>(null);

	function describeError(err: unknown): string {
		if (err instanceof ApiError) return err.message;
		if (err instanceof Error) return err.message;
		return 'Something went wrong. Please try again.';
	}

	const headingClass = 'w-full text-title-sm font-semibold text-gray-800 dark:text-white/90';
	const subtitleClass = 'w-full text-theme-sm text-gray-500 dark:text-gray-400';
	const labelClass = 'text-theme-sm font-medium text-gray-700 dark:text-gray-400';
	const hintClass = 'text-theme-xs text-gray-500 dark:text-gray-400';
	const inputClass =
		'h-11 w-full rounded-xl border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:ring-3 focus:ring-brand-500/10 focus:outline-hidden dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800';
	const primaryBtnClass =
		'flex h-11 w-full items-center justify-center rounded-xl bg-brand-500 px-4 text-theme-sm font-medium text-white shadow-theme-xs transition-colors hover:bg-brand-600';
	const secondaryBtnClass =
		'flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-gray-300 bg-white px-4 text-theme-sm font-medium text-gray-700 shadow-theme-xs transition-colors hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 dark:hover:bg-gray-800';
	const socialBtnClass =
		'inline-flex h-11 w-full items-center justify-center gap-3 rounded-xl bg-gray-100 px-4 text-theme-sm font-normal text-gray-700 transition-colors hover:bg-gray-200 hover:text-gray-800 dark:bg-white/5 dark:text-white/90 dark:hover:bg-white/10';
	const backLinkClass =
		'inline-flex items-center justify-center gap-1.5 text-theme-sm font-medium text-gray-500 transition-colors hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200';
	const inlineLinkClass =
		'cursor-pointer text-theme-sm font-medium text-brand-500 hover:text-brand-600 dark:text-brand-400';

	function resetState() {
		view = initialView;
		email = '';
		password = '';
		confirmPassword = '';
		otp = ['', '', '', '', '', ''];
		showPassword = false;
		showConfirmPassword = false;
		firstName = '';
		lastName = '';
		dateOfBirth = '';
		currency = 'USD';
		marketingEmails = true;
		submitting = false;
		error = null;
	}

	async function handleSignup(e: SubmitEvent) {
		e.preventDefault();
		error = null;
		if (password !== confirmPassword) {
			error = 'Passwords do not match.';
			return;
		}
		submitting = true;
		try {
			await auth.register(email, password);
			view = 'email-verify';
		} catch (err) {
			error = describeError(err);
		} finally {
			submitting = false;
		}
	}

	async function handleVerify(e: SubmitEvent) {
		e.preventDefault();
		error = null;
		const code = otp.join('');
		if (code.length !== 6) {
			error = 'Enter the 6-digit code.';
			return;
		}
		submitting = true;
		try {
			await auth.verifyEmail(email, code);
			view = 'personal-details';
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
			onClose();
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
			onClose();
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
			onClose();
		} catch (err) {
			if (err instanceof AppleSignInCancelled) return;
			error = describeError(err);
		} finally {
			submitting = false;
		}
	}

	async function handleResendOtp() {
		error = null;
		try {
			await auth.resendOtp(email);
		} catch (err) {
			error = describeError(err);
		}
	}

	async function handleLogin(e: SubmitEvent) {
		e.preventDefault();
		error = null;
		submitting = true;
		try {
			await auth.login(email, password);
			onClose();
		} catch (err) {
			error = describeError(err);
		} finally {
			submitting = false;
		}
	}

	async function handlePersonalDetails(e: SubmitEvent) {
		e.preventDefault();
		error = null;
		submitting = true;
		try {
			await auth.updateMe({
				first_name: firstName,
				last_name: lastName,
				...(dateOfBirth ? { date_of_birth: dateOfBirth } : {})
			});
			view = 'preferences';
		} catch (err) {
			error = describeError(err);
		} finally {
			submitting = false;
		}
	}

	async function handlePreferences(e: SubmitEvent) {
		e.preventDefault();
		error = null;
		submitting = true;
		try {
			await auth.updateMe({ currency, marketing_emails: marketingEmails });
			view = 'welcome';
		} catch (err) {
			error = describeError(err);
		} finally {
			submitting = false;
		}
	}

	function handleOtpInput(index: number, e: Event) {
		const target = e.target as HTMLInputElement;
		const digit = target.value.replace(/\D/g, '').slice(-1);
		otp[index] = digit;
		target.value = digit;
		if (digit && index < 5) otpRefs[index + 1]?.focus();
	}

	function handleOtpKeydown(index: number, e: KeyboardEvent) {
		if (e.key === 'Backspace' && !otp[index] && index > 0) {
			otpRefs[index - 1]?.focus();
		} else if (e.key === 'ArrowLeft' && index > 0) {
			otpRefs[index - 1]?.focus();
		} else if (e.key === 'ArrowRight' && index < 5) {
			otpRefs[index + 1]?.focus();
		}
	}

	function handleOtpPaste(e: ClipboardEvent) {
		e.preventDefault();
		const text = e.clipboardData?.getData('text').replace(/\D/g, '').slice(0, 6) ?? '';
		for (let i = 0; i < 6; i++) otp[i] = text[i] ?? '';
		otpRefs[Math.min(text.length, 5)]?.focus();
	}

	function goToSignup() {
		view = 'signup';
	}

	function goToLogin() {
		view = 'login';
	}

	function startEmailFlow() {
		view = 'email-form';
	}

	$effect(() => {
		if (!open) return;
		resetState();

		const onKey = (e: KeyboardEvent) => {
			if (e.key === 'Escape') onClose();
		};
		document.addEventListener('keydown', onKey);
		const prevOverflow = document.body.style.overflow;
		document.body.style.overflow = 'hidden';
		return () => {
			document.removeEventListener('keydown', onKey);
			document.body.style.overflow = prevOverflow;
		};
	});
</script>

{#snippet socialButtons(prefix: string)}
	<div class="flex w-full flex-col gap-3">
		<button
			type="button"
			onclick={handleGoogle}
			disabled={submitting || !googleEnabled}
			title={googleEnabled ? undefined : 'Google sign-in is not configured.'}
			class="{socialBtnClass} disabled:cursor-not-allowed disabled:opacity-60"
		>
			<GoogleLogo />
			{prefix} with Google
		</button>
		<button
			type="button"
			onclick={handleFacebook}
			disabled={submitting || !facebookEnabled}
			title={facebookEnabled ? undefined : 'Facebook sign-in is not configured.'}
			class="{socialBtnClass} disabled:cursor-not-allowed disabled:opacity-60"
		>
			<FacebookLogo />
			{prefix} with Facebook
		</button>
		<button
			type="button"
			onclick={handleApple}
			disabled={submitting || !appleEnabled}
			title={appleEnabled ? undefined : 'Apple sign-in is not configured.'}
			class="{socialBtnClass} disabled:cursor-not-allowed disabled:opacity-60"
		>
			<AppleLogo />
			{prefix} with Apple
		</button>
	</div>
{/snippet}

{#snippet orDivider()}
	<div class="flex w-full items-center gap-2">
		<div class="h-px flex-1 bg-gray-200 dark:bg-gray-800"></div>
		<p class="text-theme-xs font-medium text-gray-400">OR</p>
		<div class="h-px flex-1 bg-gray-200 dark:bg-gray-800"></div>
	</div>
{/snippet}

{#snippet inlinePrompt(prompt: string, linkLabel: string, onclick: () => void)}
	<div class="flex items-center justify-center gap-1.5">
		<p class="text-theme-sm text-gray-500 dark:text-gray-400">{prompt}</p>
		<button type="button" {onclick} class={inlineLinkClass}>{linkLabel}</button>
	</div>
{/snippet}

{#snippet backLink(label: string, onclick: () => void)}
	<button type="button" {onclick} class={backLinkClass}>
		<ChevronLeftIcon class="size-4 stroke-current" />
		{label}
	</button>
{/snippet}

{#snippet viewHeader(title: string, subtitle: Snippet)}
	<div class="flex flex-col items-start gap-2 text-center">
		<h2 id="auth-modal-title" class={headingClass}>{title}</h2>
		<p class={subtitleClass}>{@render subtitle()}</p>
	</div>
{/snippet}

{#snippet errorBanner()}
	{#if error}
		<div
			role="alert"
			class="border-error-200 dark:text-error-400 w-full rounded-xl border bg-error-50 px-4 py-2.5 text-theme-sm text-error-600 dark:border-error-500/30 dark:bg-error-500/10"
		>
			{error}
		</div>
	{/if}
{/snippet}

{#snippet otpInputs()}
	<div class="flex w-full flex-col gap-1.5">
		<p class={labelClass}>Enter code</p>
		<div class="flex items-center justify-between gap-2">
			{#each otp, i (i)}
				<input
					bind:this={otpRefs[i]}
					inputmode="numeric"
					maxlength="1"
					value={otp[i]}
					oninput={(e) => handleOtpInput(i, e)}
					onkeydown={(e) => handleOtpKeydown(i, e)}
					onpaste={handleOtpPaste}
					placeholder="0"
					aria-label={`Digit ${i + 1}`}
					class="size-12 rounded-xl border border-gray-300 bg-transparent text-center text-xl font-medium text-gray-800 shadow-theme-xs placeholder:text-gray-300 focus:border-brand-300 focus:ring-3 focus:ring-brand-500/10 focus:outline-hidden dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/20 dark:focus:border-brand-800"
				/>
			{/each}
		</div>
	</div>
{/snippet}

{#snippet eyeIcon(showing: boolean)}
	{#if showing}
		<EyeClosedIcon />
	{:else}
		<EyeOpenIcon />
	{/if}
{/snippet}

{#snippet passwordField(opts: {
	label: string;
	value: string;
	onUpdate: (v: string) => void;
	show: boolean;
	onToggleShow: () => void;
	placeholder: string;
	hint?: string;
	minlength?: number;
})}
	<label class="flex w-full flex-col gap-1.5">
		<span class={labelClass}>{opts.label}</span>
		<div class="relative w-full">
			<input
				type={opts.show ? 'text' : 'password'}
				required
				minlength={opts.minlength}
				value={opts.value}
				oninput={(e) => opts.onUpdate((e.currentTarget as HTMLInputElement).value)}
				placeholder={opts.placeholder}
				class="h-11 w-full rounded-xl border border-gray-300 bg-transparent py-2.5 pr-11 pl-4 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:ring-3 focus:ring-brand-500/10 focus:outline-hidden dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
			/>
			<button
				type="button"
				aria-label={opts.show ? 'Hide password' : 'Show password'}
				aria-pressed={opts.show}
				onclick={opts.onToggleShow}
				class="absolute top-1/2 right-3 flex size-6 -translate-y-1/2 items-center justify-center text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-white"
			>
				{@render eyeIcon(opts.show)}
			</button>
		</div>
		{#if opts.hint}<span class={hintClass}>{opts.hint}</span>{/if}
	</label>
{/snippet}

{#if open}
	<div
		class="fixed inset-0 z-99999 flex items-center justify-center bg-gray-900/50 p-4"
		role="dialog"
		aria-modal="true"
		aria-labelledby="auth-modal-title"
		onclick={(e) => {
			if (e.target === e.currentTarget) onClose();
		}}
		onkeydown={(e) => {
			if (e.key === 'Escape') onClose();
		}}
		tabindex="-1"
	>
		<div
			class="relative w-full max-w-md overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-theme-xl dark:border-gray-800 dark:bg-gray-dark"
		>
			<button
				type="button"
				aria-label="Close"
				onclick={onClose}
				class="absolute top-3 right-3 z-10 flex size-10 items-center justify-center rounded-xl text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-gray-200"
			>
				<CloseIcon class="size-5 fill-current" />
			</button>

			<div class="flex flex-col items-center gap-7 px-6 pt-12 pb-8 sm:px-8">
				{#if view === 'signup'}
					<div class="flex w-full flex-col items-center gap-7">
						{@render viewHeader('Create an account', signupSub)}
						{#snippet signupSub()}Sign up to get started{/snippet}

						<div class="flex w-full flex-col items-center gap-5">
							{@render socialButtons('Sign up')}
							{@render orDivider()}
							<button type="button" onclick={startEmailFlow} class={secondaryBtnClass}>
								Continue with Email
							</button>
						</div>

						{@render inlinePrompt('Already have an account?', 'Log in', goToLogin)}
					</div>
				{:else if view === 'login'}
					<div class="flex w-full flex-col items-center gap-7">
						{@render viewHeader('Welcome back', loginSub)}
						{#snippet loginSub()}Log in to your account{/snippet}

						<div class="flex w-full flex-col items-center gap-5">
							<form class="flex w-full flex-col gap-4" onsubmit={handleLogin}>
								{@render errorBanner()}
								<label class="flex w-full flex-col gap-1.5">
									<span class={labelClass}>Email</span>
									<input
										type="email"
										required
										bind:value={email}
										placeholder="info@gmail.com"
										class={inputClass}
									/>
								</label>
								{@render passwordField({
									label: 'Password',
									value: password,
									onUpdate: (v) => (password = v),
									show: showPassword,
									onToggleShow: () => (showPassword = !showPassword),
									placeholder: 'Enter your password'
								})}
								<button type="submit" disabled={submitting} class={primaryBtnClass}>
									{submitting ? 'Signing in…' : 'Sign in'}
								</button>
							</form>

							{@render orDivider()}
							{@render socialButtons('Continue')}
						</div>

						{@render inlinePrompt("Don't have an account?", 'Sign up', goToSignup)}
					</div>
				{:else if view === 'email-form'}
					<div class="flex w-full flex-col items-center gap-7">
						{@render viewHeader('Create your account', emailFormSub)}
						{#snippet emailFormSub()}
							Enter your email and create a password
						{/snippet}

						<form class="flex w-full flex-col gap-7" onsubmit={handleSignup}>
							{@render errorBanner()}
							<div class="flex flex-col gap-4">
								<label class="flex w-full flex-col gap-1.5">
									<span class={labelClass}>Email<span class="text-error-500">*</span></span>
									<input
										type="email"
										required
										bind:value={email}
										placeholder="email@example.com"
										class={inputClass}
									/>
								</label>
								{@render passwordField({
									label: 'Password*',
									value: password,
									onUpdate: (v) => (password = v),
									show: showPassword,
									onToggleShow: () => (showPassword = !showPassword),
									placeholder: 'Create a password',
									hint: 'Min 8 chars with upper, lower, and a number.',
									minlength: 8
								})}
								{@render passwordField({
									label: 'Confirm password*',
									value: confirmPassword,
									onUpdate: (v) => (confirmPassword = v),
									show: showConfirmPassword,
									onToggleShow: () => (showConfirmPassword = !showConfirmPassword),
									placeholder: 'Re-enter your password'
								})}
							</div>
							<button type="submit" disabled={submitting} class={primaryBtnClass}>
								{submitting ? 'Creating account…' : 'Continue'}
							</button>
						</form>

						{@render backLink('Back to log in', goToLogin)}
					</div>
				{:else if view === 'email-verify'}
					<div class="flex w-full flex-col items-center gap-7">
						{@render viewHeader('Verify your email', emailVerifySub)}
						{#snippet emailVerifySub()}
							We sent a 6-digit code to
							<span class="font-medium text-gray-800 dark:text-white/90"
								>{email || 'your email'}</span
							>
						{/snippet}

						<form class="flex w-full flex-col gap-7" onsubmit={handleVerify}>
							{@render errorBanner()}
							{@render otpInputs()}
							<p class={hintClass}>
								Email isn't sent in this template — use <span
									class="font-mono font-medium text-gray-700 dark:text-gray-300">000000</span
								> to verify.
							</p>
							<button type="submit" disabled={submitting} class={primaryBtnClass}>
								{submitting ? 'Verifying…' : 'Verify email'}
							</button>
						</form>

						{@render inlinePrompt("Didn't receive the email?", 'Click to resend', handleResendOtp)}

						{@render backLink('Back to log in', goToLogin)}
					</div>
				{:else if view === 'personal-details'}
					<div class="flex w-full flex-col items-center gap-7">
						{@render viewHeader('Tell us about yourself', personalSub)}
						{#snippet personalSub()}
							This helps us personalize your experience
						{/snippet}

						<form class="flex w-full flex-col gap-7" onsubmit={handlePersonalDetails}>
							{@render errorBanner()}
							<div class="flex flex-col gap-4">
								<div class="flex gap-3">
									<label class="flex flex-1 flex-col gap-1.5">
										<span class={labelClass}>First name<span class="text-error-500">*</span></span>
										<input
											type="text"
											required
											bind:value={firstName}
											placeholder="First name"
											class={inputClass}
										/>
									</label>
									<label class="flex flex-1 flex-col gap-1.5">
										<span class={labelClass}>Last name<span class="text-error-500">*</span></span>
										<input
											type="text"
											required
											bind:value={lastName}
											placeholder="Last name"
											class={inputClass}
										/>
									</label>
								</div>
								<label class="flex w-full flex-col gap-1.5">
									<span class={labelClass}>Date of birth</span>
									<input type="date" bind:value={dateOfBirth} class={inputClass} />
									<span class={hintClass}
										>Used for safety and trust verification. Not shared publicly.</span
									>
								</label>
							</div>
							<button type="submit" disabled={submitting} class={primaryBtnClass}>
								{submitting ? 'Saving…' : 'Continue'}
							</button>
						</form>

						{@render backLink('Back', () => (view = 'email-verify'))}
					</div>
				{:else if view === 'preferences'}
					<div class="flex w-full flex-col items-center gap-7">
						{@render viewHeader('Set your preferences', preferencesSub)}
						{#snippet preferencesSub()}
							Customize your experience. You can change these anytime.
						{/snippet}

						<form class="flex w-full flex-col gap-7" onsubmit={handlePreferences}>
							{@render errorBanner()}
							<div class="flex flex-col gap-4">
								<label class="flex w-full flex-col gap-1.5">
									<span class={labelClass}>Default currency</span>
									<input type="text" bind:value={currency} class={inputClass} />
								</label>
								<div class="flex items-center justify-between gap-4 pt-1">
									<div class="flex flex-col">
										<span class={labelClass}>Marketing emails</span>
										<span class={hintClass}> Get product news, tips, and exclusive offers </span>
									</div>
									<button
										type="button"
										role="switch"
										aria-checked={marketingEmails}
										aria-label="Marketing emails"
										onclick={() => (marketingEmails = !marketingEmails)}
										class={[
											'relative flex h-6 w-11 shrink-0 items-center rounded-full p-0.5 transition-colors',
											marketingEmails ? 'bg-brand-500' : 'bg-gray-200 dark:bg-gray-700'
										]}
									>
										<span
											class={[
												'block size-5 rounded-full bg-white shadow-theme-sm transition-transform',
												marketingEmails ? 'translate-x-5' : 'translate-x-0'
											]}
										></span>
									</button>
								</div>
							</div>
							<button type="submit" class={primaryBtnClass}>Save & continue</button>
						</form>

						{@render backLink('Back', () => (view = 'personal-details'))}
					</div>
				{:else if view === 'welcome'}
					<div class="flex w-full flex-col items-center gap-7">
						{@render viewHeader(`Welcome ${firstName || 'there'}`, welcomeSub)}
						{#snippet welcomeSub()}
							Your account has been created and signed in as
							<span class="font-medium text-gray-800 dark:text-white/90"
								>{email || 'your email'}</span
							>.
						{/snippet}

						<div class="flex w-full items-center gap-3">
							<button type="button" onclick={onClose} class={secondaryBtnClass}>
								Set up profile
							</button>
							<button type="button" onclick={onClose} class={primaryBtnClass}>Continue</button>
						</div>
					</div>
				{/if}
			</div>
		</div>
	</div>
{/if}
