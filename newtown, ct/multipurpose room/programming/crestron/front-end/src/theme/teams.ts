import { createTheme } from '@mui/material/styles';
import { sharedComponents, sharedShape, sharedTypography } from './_shared';

/**
 * Microsoft Teams Room theme.
 *
 * Accent colours are injected as CSS custom properties (--ui-gradient-active,
 * --ui-shadow-nav-btn, etc.) by ThemeWrapper via GlobalStyles, so every
 * component that references those tokens automatically uses Teams purple
 * without any component-level changes.
 */
export const teamsTheme = createTheme({
	shape: sharedShape,
	typography: sharedTypography,
	palette: {
		mode: 'dark',
		primary: {
			main: '#6264A7',
			light: '#8B8CC7',
			dark: '#444775',
		},
		secondary: {
			main: '#7B83EB',
		},
		background: {
			default: '#201F1F',
			paper: '#2D2C2B',
		},
		text: {
			primary: '#8B8CC7',
		},
	},
	components: {
		...sharedComponents,
	},
});

/**
 * CSS custom properties that define the Teams Room accent palette.
 * Injected at :root when the Teams theme is active.  Every token that
 * references var(--ui-*) picks these up automatically — no component
 * changes required to switch accent colours.
 */
export const teamsVars = {
	'--ui-gradient-active':
		'linear-gradient(135deg, #444775 0%, #6264A7 50%, #7B83EB 100%)',
	'--ui-shadow-active': '0 4px 12px rgba(98, 100, 167, 0.45)',
	'--ui-shadow-active-hover': '0 6px 16px rgba(98, 100, 167, 0.55)',
	'--ui-shadow-active-strong': '0 4px 20px rgba(98, 100, 167, 0.55)',
	'--ui-shadow-nav-btn': '0 4px 12px rgba(98, 100, 167, 0.45)',
	'--ui-shadow-nav-btn-hover': '0 6px 16px rgba(98, 100, 167, 0.55)',
	'--ui-gradient-nav-dark': 'linear-gradient(180deg, #1B1A1A 0%, #141414 100%)',
	'--ui-shadow-nav-bar-dark': '0px -4px 12px -2px rgba(0,0,0,0.5)',
	'--ui-overlay-btn-color': '#6264A7',
} as const;
