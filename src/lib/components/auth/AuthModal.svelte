<script lang="ts">
	import type { Snippet } from 'svelte';
	import { ApiError } from '$lib/api/client';
	import CloseIcon from '$lib/components/ui/icons/CloseIcon.svelte';
	import { auth } from '$lib/stores/auth.svelte';

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

{#snippet googleIcon()}
	<svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
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
{/snippet}

{#snippet facebookIcon()}
	<svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
		<path
			d="M11.6663 12.1366H13.7497L14.583 8.80322H11.6663V7.13656C11.6663 6.27874 11.6663 5.46989 13.333 5.46989H14.583V2.66997C14.3116 2.63393 13.2855 2.55322 12.2021 2.55322C9.94001 2.55322 8.33301 3.93394 8.33301 6.46965V8.80322H5.83301V12.1366H8.33301V19.2199H11.6663V12.1366Z"
			fill="#1877F2"
		/>
	</svg>
{/snippet}

{#snippet appleIcon()}
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
{/snippet}

{#snippet socialButtons(prefix: string)}
	<div class="flex w-full flex-col gap-3">
		<button type="button" class={socialBtnClass}>
			{@render googleIcon()}
			{prefix} with Google
		</button>
		<button type="button" class={socialBtnClass}>
			{@render facebookIcon()}
			{prefix} with Facebook
		</button>
		<button type="button" class={socialBtnClass}>
			{@render appleIcon()}
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
		<svg
			class="fill-current"
			width="16"
			height="16"
			viewBox="0 0 20 20"
			fill="none"
			xmlns="http://www.w3.org/2000/svg"
			aria-hidden="true"
		>
			<path
				d="M12.7083 5L7.5 10.2083L12.7083 15.4167"
				stroke="currentColor"
				stroke-width="1.5"
				stroke-linecap="round"
				stroke-linejoin="round"
			/>
		</svg>
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
		<svg
			class="fill-current"
			width="20"
			height="20"
			viewBox="0 0 20 20"
			fill="none"
			xmlns="http://www.w3.org/2000/svg"
			aria-hidden="true"
		>
			<path
				fill-rule="evenodd"
				clip-rule="evenodd"
				d="M4.63803 3.57709C4.34513 3.2842 3.87026 3.2842 3.57737 3.57709C3.28447 3.86999 3.28447 4.34486 3.57737 4.63775L4.85323 5.91362C3.74609 6.84199 2.89363 8.06395 2.4155 9.45936C2.3615 9.61694 2.3615 9.78801 2.41549 9.94558C3.49488 13.0957 6.48191 15.3619 10.0002 15.3619C11.255 15.3619 12.4422 15.0737 13.4994 14.5598L15.3625 16.4229C15.6554 16.7158 16.1302 16.7158 16.4231 16.4229C16.716 16.13 16.716 15.6551 16.4231 15.3622L4.63803 3.57709ZM12.3608 13.4212L10.4475 11.5079C10.3061 11.5423 10.1584 11.5606 10.0064 11.5606H9.99151C8.96527 11.5606 8.13333 10.7286 8.13333 9.70237C8.13333 9.5461 8.15262 9.39434 8.18895 9.24933L5.91885 6.97923C5.03505 7.69015 4.34057 8.62704 3.92328 9.70247C4.86803 12.1373 7.23361 13.8619 10.0002 13.8619C10.8326 13.8619 11.6287 13.7058 12.3608 13.4212Z"
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
			aria-hidden="true"
		>
			<path
				fill-rule="evenodd"
				clip-rule="evenodd"
				d="M10.0002 13.8619C7.23361 13.8619 4.86803 12.1372 3.92328 9.70241C4.86804 7.26761 7.23361 5.54297 10.0002 5.54297C12.7667 5.54297 15.1323 7.26762 16.0771 9.70243C15.1323 12.1372 12.7667 13.8619 10.0002 13.8619ZM10.0002 4.04297C6.48191 4.04297 3.49489 6.30917 2.4155 9.4593C2.3615 9.61687 2.3615 9.78794 2.41549 9.94552C3.49488 13.0957 6.48191 15.3619 10.0002 15.3619C13.5184 15.3619 16.5055 13.0957 17.5849 9.94555C17.6389 9.78797 17.6389 9.6169 17.5849 9.45932C16.5055 6.30919 13.5184 4.04297 10.0002 4.04297Z"
			/>
		</svg>
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
