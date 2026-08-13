import React from 'react';
import type { Theme } from '@mui/material/styles';
import { useAppStore } from '../../store/appStore';
import { ThemeProvider } from '@mui/material/styles';
import GlobalStyles from '@mui/material/GlobalStyles';
import CssBaseline from '@mui/material/CssBaseline';
import { lightTheme } from '../../theme/light';

type ThemeMode =
	| 'light'
	| 'dark'
	| 'teams'
	| 'zoomLight'
	| 'zoomDark'
	| 'monochrome'
	| 'googleMeetLight'
	| 'googleMeetDark';

type ThemeData = {
	theme: Theme;
	vars?: Record<string, string>;
};

/**
 * Resolve a theme mode to its theme + optional CSS-var palette.
 * Non-default themes are loaded via dynamic import so each becomes
 * its own Vite chunk and is only fetched/parsed when actually used.
 */
async function loadTheme(mode: ThemeMode): Promise<ThemeData> {
	switch (mode) {
		case 'dark': {
			const m = await import('../../theme/dark');
			return { theme: m.darkTheme };
		}
		case 'teams': {
			const m = await import('../../theme/teams');
			return { theme: m.teamsTheme, vars: { ...m.teamsVars } };
		}
		case 'zoomLight': {
			const m = await import('../../theme/zoomLight');
			return { theme: m.zoomLightTheme, vars: { ...m.zoomVarsBase } };
		}
		case 'zoomDark': {
			const m = await import('../../theme/zoomDark');
			return { theme: m.zoomDarkTheme, vars: { ...m.zoomDarkVars } };
		}
		case 'monochrome': {
			const m = await import('../../theme/monochrome');
			return { theme: m.monochromeTheme, vars: { ...m.monochromeVars } };
		}
		case 'googleMeetLight': {
			const m = await import('../../theme/googleMeetLight');
			return { theme: m.googleMeetLightTheme, vars: { ...m.googleMeetVarsBase } };
		}
		case 'googleMeetDark': {
			const m = await import('../../theme/googleMeetDark');
			return { theme: m.googleMeetDarkTheme, vars: { ...m.googleMeetDarkVars } };
		}
		case 'light':
		default:
			return { theme: lightTheme };
	}
}

export const ThemeWrapper: React.FC<{ children: React.ReactNode }> = ({
	children,
}) => {
	const themeMode = useAppStore((state: any) => state.themeMode) as ThemeMode;

	// Default light theme is imported synchronously so the very first paint
	// has a real theme — no flicker, no Suspense fallback required.
	const [themeData, setThemeData] = React.useState<ThemeData>({
		theme: lightTheme,
	});

	React.useEffect(() => {
		let cancelled = false;
		loadTheme(themeMode).then((data) => {
			if (!cancelled) setThemeData(data);
		});
		return () => {
			cancelled = true;
		};
	}, [themeMode]);

	return (
		<ThemeProvider theme={themeData.theme}>
			<CssBaseline />
			{themeData.vars && (
				<GlobalStyles styles={{ ':root': themeData.vars }} />
			)}
			{children}
		</ThemeProvider>
	);
};
