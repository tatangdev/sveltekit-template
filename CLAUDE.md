# Frontend (SvelteKit)

SvelteKit 2 + Svelte 5 runes + Tailwind v4 + TypeScript. Lockfile: `package-lock.json` (npm).

## Quality gates

Every change must keep these green:

```sh
npm run format && npm run check && npm run lint
```

Zero-warning policy — fix every ESLint warning, Svelte compiler diagnostic, and TypeScript hint, not just errors. Don't suppress with `eslint-disable`, `@ts-ignore`, or `// svelte-ignore` — fix the underlying issue. Common patterns:

- Missing route for `resolve()` type-check → add a stub `+page.svelte` (see `console/(auth)/reset-password/+page.svelte`).
- `svelte/no-navigation-without-resolve` → wrap internal hrefs with `resolve('/path')` from `$app/paths`.
- `suggestCanonicalClasses` (Tailwind IntelliSense) → use canonical numeric form (e.g. `max-w-7xl` not `max-w-screen-xl`, `size-11` not `h-11 w-11`). For breakpoint-scale max-widths use the bracket-var form: `max-w-(--breakpoint-2xl)`.
- `state_referenced_locally` → don't initialize `$state` from a prop directly; reset inside an `$effect` instead.

## Routing layout

```
src/routes/
  +layout.svelte           root — loads layout.css and favicon, no chrome
  layout.css               Tailwind v4 @theme tokens, @utility menu-* rules, @custom-variant dark, sidebar:hover CSS

  (app)/                   public marketing area
    +layout.svelte         Navbar + main + Footer
    +page.svelte           landing hero

  console/                 admin area
    +layout.svelte         ConsoleLayout = Sidebar + Header + main
    (padded)/+layout.svelte         max-w-(--breakpoint-2xl) p-4 md:p-6 wrapper for content pages
    (padded)/+page.svelte           dashboard placeholder
    (auth)/+layout@.svelte          @-suffix resets to root layout — bypasses ConsoleLayout for sign-in/up
    (auth)/signin/+page.svelte
    (auth)/signup/+page.svelte
    (auth)/reset-password/+page.svelte
```

The `(auth)` route group's `+layout@.svelte` filename uses SvelteKit's named-layout reset syntax — the `@` (with empty target) skips intermediate layouts and inherits straight from root. That's how auth pages avoid getting wrapped in the dashboard sidebar/header.

## Theme tokens (`src/routes/layout.css`)

Tailwind v4 `@theme` block declares every color, font, radius companion, shadow, and breakpoint token. Use the named utilities (`bg-brand-500`, `text-gray-700`, `shadow-theme-md`, `text-theme-sm`) — never inline hex.

If a needed color doesn't exist as a token, add it to `@theme` rather than using a `bg-[#...]` arbitrary value.

`--color-black: #101828` is intentional — `bg-black` is redefined to a deep slate, not literal black. The sidebar relies on this.

`@custom-variant dark (&:is(.dark *))` enables class-based dark mode keyed off `<html>.dark`. The toggle is in `$lib/stores/theme.svelte.ts`. `app.html` has an inline script that reads `localStorage['darkMode']` before render to avoid a flash of light content.

## Border radius convention

We use a strict two-tier convention so containers always read as nested:

| Element                                                                                   | Radius | Tailwind       |
| ----------------------------------------------------------------------------------------- | ------ | -------------- |
| Buttons (primary, secondary, social, icon, dropdown items, mobile-menu items)             | 12px   | `rounded-xl`   |
| Form fields (text/email/password inputs, OTP boxes, search bar, newsletter input)         | 12px   | `rounded-xl`   |
| Checkbox indicators                                                                       | 8px    | `rounded-lg`   |
| Panels (modal, navbar dropdown, header notification panel, user-menu panel)               | 24px   | `rounded-3xl`  |
| Pills / icon buttons (theme toggle, navbar action buttons, status dots, OTP toggle thumb) | full   | `rounded-full` |

The 12px / 24px parent–child gap reads as a soft container holding controls. Never make a panel the same radius as the controls it contains — flattens the visual nesting. If you add a tighter mini-container (a card-in-modal, for example), use `rounded-2xl` (16px) so it sits between the two tiers.

## Class constants pattern

Repeated class strings inside one component live as `const xxxClass = '...'` in the `<script>`. See [AuthModal.svelte](src/lib/components/auth/AuthModal.svelte) (`primaryBtnClass`, `secondaryBtnClass`, `socialBtnClass`, `inputClass`, `labelClass`) and [Navbar.svelte](src/lib/components/layout/Navbar.svelte) (`iconBtnClass`, `menuItemClass`).

If two or more components use the exact same string, promote to a shared `$lib/styles.ts` instead.

## Stores

- [`$lib/stores/theme.svelte.ts`](src/lib/stores/theme.svelte.ts) — dark mode toggle, persists to `localStorage['darkMode']`, sets `<html>.dark`.
- [`$lib/stores/sidebar.svelte.ts`](src/lib/stores/sidebar.svelte.ts) — `{ toggle: boolean }` for admin sidebar mobile/desktop state.
- [`$lib/stores/persisted.svelte.ts`](src/lib/stores/persisted.svelte.ts) — generic localStorage-backed reactive store; theme and sidebar branch state both use this.

## Click-outside action

[`$lib/actions/clickOutside.ts`](src/lib/actions/clickOutside.ts) listens on `document` in capture phase. Trigger buttons that toggle the panel they live outside of must carry `data-clickoutside-ignore`, otherwise capture phase fires before the button's onclick and the toggle ends up stuck open. Used on the admin sidebar hamburger, mobile menu, notification bell, and user-menu trigger. The Navbar's hamburger uses an inline `$effect` instead of the action — same effect, kept local because it's only one place.

## Auth surfaces

Two separate auth UIs:

- **Admin auth** (`/console/signin`, `/console/signup`): full-page split layout with brand panel on the right. Used to access the admin console.
- **Public auth** ([AuthModal.svelte](src/lib/components/auth/AuthModal.svelte)): multi-step modal opened from the public Navbar's Sign in / Sign up buttons. Flow: `signup → email-form → email-verify → personal-details → preferences → welcome`, plus a dedicated `login` view. Email-only — no phone-number flow.

The modal accepts an `initialView` prop and resets internal state inside the `$effect` that runs on each open. Body scroll is locked while open via `document.body.style.overflow`.

## Icons

**One source of truth per glyph.** If an SVG is used in 2+ files, extract it to [`$lib/components/ui/icons/<Name>.svelte`](src/lib/components/ui/icons/) and `<Name />` from both places. Pasting the same path data twice is how icons drift (e.g. truncated subpaths, mismatched stroke widths).

Existing extracted icons: `SunIcon`, `MoonIcon`, `CloseIcon`, `ChevronDownIcon`, `ChevronLeftIcon`, `EyeOpenIcon`, `EyeClosedIcon`, `GoogleLogo`, `FacebookLogo`, `AppleLogo`. Truly single-use icons stay inline (search glyph in `Header`, hamburger, social marks in `Footer`, sidebar nav-group dots, menu glyphs) — extraction adds files for no benefit.

Component shape — accept a `class` prop with a sensible default and render the SVG:

```svelte
<script lang="ts">
	let { class: className = 'fill-current' }: { class?: string } = $props();
</script>

<svg class={className} width="20" height="20" viewBox="0 0 20 20" ...>
	<path d="..." fill="currentColor" />
</svg>
```

When an SVG path has `fill="currentColor"`, set color via `text-*` on the SVG element, not `fill-*` — the latter doesn't cascade through the path's explicit attribute.

## Scripts

- `npm run dev` — vite dev server.
- `npm run check` — `svelte-kit sync && svelte-check`. Always green before committing.
- `npm run lint` — prettier + eslint.
- `npm run format` — prettier write.
- `npm run build` / `npm run preview`.
