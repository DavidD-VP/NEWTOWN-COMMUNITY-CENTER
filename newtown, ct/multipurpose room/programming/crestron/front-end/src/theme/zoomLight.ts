import { createTheme } from '@mui/material/styles';
import { sharedComponents, sharedShape, sharedTypography } from './_shared';

/**
 * Zoom Rooms Light theme.
 *
 * Uses Zoom's brand blue (#0E71EB) as the accent colour.  CSS custom
 * properties for gradients/shadows are injected by ThemeWrapper.
 */
export const zoomLightTheme = createTheme({
	shape: sharedShape,
	typography: sharedTypography,
	palette: {
		mode: 'light',
		primary: {
			main: '#0E71EB',
			light: '#2D8EF5',
			dark: '#0A52C5',
		},
		secondary: {
			main: '#26A0F0',
		},
		background: {
			default: '#F4F4F4',
			paper: '#FFFFFF',
		},
		text: {
			primary: '#1F1F1F',
		},
	},
	components: {
		...sharedComponents,
	},
});

/**
 * Zoom Rooms accent palette (shared between light and dark Zoom themes).
 */
export const zoomVarsBase = {
	'--ui-gradient-active':
		'linear-gradient(135deg, #0A52C5 0%, #0E71EB 50%, #2D8EF5 100%)',
	'--ui-shadow-active': '0 4px 12px rgba(14, 113, 235, 0.45)',
	'--ui-shadow-active-hover': '0 6px 16px rgba(14, 113, 235, 0.55)',
	'--ui-shadow-active-strong': '0 4px 20px rgba(14, 113, 235, 0.55)',
	'--ui-shadow-nav-btn': '0 4px 12px rgba(14, 113, 235, 0.45)',
	'--ui-shadow-nav-btn-hover': '0 6px 16px rgba(14, 113, 235, 0.55)',
	'--ui-overlay-btn-color': '#0E71EB',
} as const;
