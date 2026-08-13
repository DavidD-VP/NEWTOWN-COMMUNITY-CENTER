import { createTheme } from '@mui/material/styles';
import { sharedComponents, sharedShape, sharedTypography } from './_shared';

/**
 * Google Meet Light theme.
 *
 * Uses Google Meet green as the accent colour. CSS custom
 * properties for gradients/shadows are injected by ThemeWrapper.
 */
export const googleMeetLightTheme = createTheme({
	shape: sharedShape,
	typography: sharedTypography,
	palette: {
		mode: 'light',
		primary: {
			main: '#188038',
			light: '#1E8E3E',
			dark: '#137333',
		},
		secondary: {
			main: '#34A853',
		},
		background: {
			default: '#F8F9FA',
			paper: '#FFFFFF',
		},
		text: {
			primary: '#202124',
		},
	},
	components: {
		...sharedComponents,
	},
});

/**
 * Google Meet accent palette (shared between light and dark Meet themes).
 */
export const googleMeetVarsBase = {
	'--ui-gradient-active':
		'linear-gradient(135deg, #137333 0%, #188038 50%, #1E8E3E 100%)',
	'--ui-shadow-active': '0 4px 12px rgba(24, 128, 56, 0.45)',
	'--ui-shadow-active-hover': '0 6px 16px rgba(24, 128, 56, 0.55)',
	'--ui-shadow-active-strong': '0 4px 20px rgba(24, 128, 56, 0.55)',
	'--ui-shadow-nav-btn': '0 4px 12px rgba(24, 128, 56, 0.45)',
	'--ui-shadow-nav-btn-hover': '0 6px 16px rgba(24, 128, 56, 0.55)',
	'--ui-overlay-btn-color': '#188038',
} as const;
