import { createTheme } from '@mui/material/styles';
import { sharedComponents, sharedShape, sharedTypography } from './_shared';

/**
 * Zoom Rooms Dark theme.
 *
 * Same Zoom brand blue accent on a dark charcoal background.  CSS custom
 * properties for gradients/shadows are injected by ThemeWrapper.
 */
export const zoomDarkTheme = createTheme({
	shape: sharedShape,
	typography: sharedTypography,
	palette: {
		mode: 'dark',
		primary: {
			main: '#0E71EB',
			light: '#2D8EF5',
			dark: '#0A52C5',
		},
		secondary: {
			main: '#26A0F0',
		},
		background: {
			default: '#131415',
			paper: '#292929',
		},
		text: {
			primary: '#2D8EF5',
		},
	},
	components: {
		...sharedComponents,
	},
});

export const zoomDarkVars = {
	'--ui-gradient-active':
		'linear-gradient(135deg, #0A52C5 0%, #0E71EB 50%, #2D8EF5 100%)',
	'--ui-shadow-active': '0 4px 12px rgba(14, 113, 235, 0.45)',
	'--ui-shadow-active-hover': '0 6px 16px rgba(14, 113, 235, 0.55)',
	'--ui-shadow-active-strong': '0 4px 20px rgba(14, 113, 235, 0.55)',
	'--ui-shadow-nav-btn': '0 4px 12px rgba(14, 113, 235, 0.45)',
	'--ui-shadow-nav-btn-hover': '0 6px 16px rgba(14, 113, 235, 0.55)',
	'--ui-overlay-btn-color': '#0E71EB',
	'--ui-gradient-nav-dark':
		'linear-gradient(180deg, #1C2028 0%, #14181F 100%)',
	'--ui-shadow-nav-bar-dark': '0px -4px 12px -2px rgba(0,0,0,0.5)',
} as const;
