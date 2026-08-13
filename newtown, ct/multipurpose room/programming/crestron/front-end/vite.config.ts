import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
	const env = loadEnv(mode, process.cwd(), '');
	const debugConsoleNotifications =
		env.VITE_DEBUG_CONSOLE_NOTIFICATIONS === 'true';

	return {
		plugins: [react()],
		base: './',
		envPrefix: 'VITE_',
		server: {
			port: 3000,
			open: true,
			proxy: {
				'/crestron-proxy': {
					target: 'http://localhost',
					changeOrigin: true,
					rewrite: (path) => path.replace(/^\/crestron-proxy/, ''),
				},
			},
		},
		build: {
			outDir: 'build',
			// Embedded Chromium on the TS-1070 supports modern syntax; targeting
			// a newer baseline lets esbuild/terser skip polyfills and produces
			// a smaller, faster-to-parse bundle.
			target: 'es2020',
			// CSS code splitting is on by default; keep it on so per-page CSS
			// only loads when the page chunk is fetched.
			cssCodeSplit: true,
			// Terser gives us fine-grained control over which console calls to
			// strip. We keep console.error / console.warn so the Crestron
			// device-side log surface still gets real problems.
			minify: 'terser',
			terserOptions: {
				compress: {
					pure_funcs: debugConsoleNotifications
						? []
						: [
								'console.log',
								'console.info',
								'console.debug',
								'console.trace',
							],
					passes: 2,
				},
				format: {
					comments: false,
				},
			},
			rollupOptions: {
				output: {
					// Manual chunk splitting keeps the initial bundle small and
					// lets the browser parse heavy vendor code in parallel with
					// our app code. Each split also gets independent file
					// caching so a code change in App.tsx doesn't invalidate
					// the MUI/React/CrComLib chunks.
					manualChunks(id) {
						// node_modules → vendor chunks.
						// Lump react / react-dom / scheduler / zustand into one
						// "vendor-react" chunk to avoid circular-chunk warnings
						// (zustand statically imports react-dom internals).
						if (id.includes('node_modules')) {
							if (id.includes('@mui/icons-material')) {
								return 'vendor-mui-icons';
							}
							if (
								id.includes('@mui/material') ||
								id.includes('@mui/lab') ||
								id.includes('@mui/system') ||
								id.includes('@mui/utils') ||
								id.includes('@mui/private-theming') ||
								id.includes('@mui/styled-engine') ||
								id.includes('@mui/base') ||
								id.includes('@emotion')
							) {
								return 'vendor-mui';
							}
							if (
								id.includes('node_modules/react-dom') ||
								id.includes('node_modules/react/') ||
								id.includes('node_modules\\react-dom') ||
								id.includes('node_modules\\react\\') ||
								id.includes('node_modules/scheduler') ||
								id.includes('node_modules\\scheduler') ||
								id.includes('node_modules/zustand') ||
								id.includes('node_modules\\zustand') ||
								id.includes('node_modules/use-sync-external-store') ||
								id.includes('node_modules\\use-sync-external-store')
							) {
								return 'vendor-react';
							}
							if (id.includes('@crestron')) {
								return 'vendor-crestron';
							}
							if (id.includes('lodash')) {
								return 'vendor-lodash';
							}
							return 'vendor-other';
						}

						// typeHelpers files MUST be checked first, before the
						// generic `/roomcontrols/card/` rule, so they don't get
						// lumped into the heavy per-feature card chunk. They
						// reference card types via `import type` only (no
						// runtime dep on the heavy card module) so it's safe
						// to ship them in the entry/helpers chunk.
						if (/[/\\]typeHelpers\.(t|j)sx?$/.test(id)) {
							return 'helpers';
						}

						// CrComLib + WebXPanel wiring, the global app store, and
						// the shared roomcontrols/component leaf widgets are
						// needed by both the entry chunk and the lazy card
						// chunks.  Pin them to a single shared chunk so Rollup
						// doesn't bury them inside e.g. cards-audio (the first
						// lazy chunk that happens to need CrestronButton),
						// which would force that lazy chunk to be eagerly
						// preloaded by the entry.
						if (
							id.includes('/src/crestron/') ||
							id.includes('\\src\\crestron\\') ||
							id.includes('/src/store/') ||
							id.includes('\\src\\store\\') ||
							id.includes('/src/config/') ||
							id.includes('\\src\\config\\') ||
							id.includes('/roomcontrols/component/') ||
							id.includes('\\roomcontrols\\component\\') ||
							id.includes('/roomcontrols/card/Card') ||
							id.includes('\\roomcontrols\\card\\Card') ||
							id.includes('/roomcontrols/card/ctCardStyles') ||
							id.includes('\\roomcontrols\\card\\ctCardStyles')
						) {
							return 'app-runtime';
						}

						// Shared theme option list — small data file consumed by
						// App.tsx (statically) and SettingsPage (lazily).
						// Without this rule its path matches the cards-theme
						// rule below and gets bundled into the heavy
						// ThemeCard chunk, forcing the entry to preload
						// cards-theme.  Pin it to app-runtime so it ships
						// cheaply alongside the other always-needed bits.
						if (
							id.includes('/card/theme/themeOptions') ||
							id.includes('\\card\\theme\\themeOptions')
						) {
							return 'app-runtime';
						}

						// Project-side chunks — keep heavy feature areas out of
						// the entry bundle. These are only effective when the
						// importing call sites use dynamic import() (see
						// App.tsx page loading and ThemeWrapper theme loading).
						if (id.includes('/roomcontrols/card/')) {
							// One chunk per card subdirectory so e.g. bluray
							// cards don't pull in camera cards.
							const m = id.match(/\/roomcontrols\/card\/([^/]+)\//);
							if (m) return `cards-${m[1]}`;
						}
						if (id.includes('/roomcontrols/page/')) {
							const m = id.match(/\/roomcontrols\/page\/([^/]+)\//);
							if (m) return `page-${m[1]}`;
						}
						if (id.includes('/theme/')) {
							const m = id.match(/\/theme\/([^/.]+)/);
							if (m && m[1] !== '_shared') return `theme-${m[1]}`;
						}
						return undefined;
					},
				},
			},
		},
	};
});
