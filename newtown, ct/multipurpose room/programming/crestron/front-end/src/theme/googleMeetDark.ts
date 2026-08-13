import { createTheme } from '@mui/material/styles';
import { sharedComponents, sharedShape, sharedTypography } from './_shared';

/**
 * Google Meet Dark theme.
 *
 * Same Meet green accent on a Google dark charcoal background. CSS custom
 * properties for gradients/shadows are injected by ThemeWrapper.
 */
export const googleMeetDarkTheme = createTheme({
	shape: sharedShape,
	typography: sharedTypography,
	palette: {
		mode: 'dark',
		primary: {
			main: '#81C995',
			light: '#A8DAB5',
			dark: '#5BB974',
		},
		secondary: {
			main: '#34A853',
		},
		background: {
			default: '#202124',
			paper: '#292929',
		},
		text: {
			primary: '#E8EAED',
		},
	},
	components: {
		...sharedComponents,
	},
});

export const googleMeetDarkVars = {
	'--ui-gradient-active':
		'linear-gradient(135deg, #137333 0%, #188038 50%, #1E8E3E 100%)',
	'--ui-shadow-active': '0 4px 12px rgba(24, 128, 56, 0.45)',
	'--ui-shadow-active-hover': '0 6px 16px rgba(24, 128, 56, 0.55)',
	'--ui-shadow-active-strong': '0 4px 20px rgba(24, 128, 56, 0.55)',
	'--ui-shadow-nav-btn': '0 4px 12px rgba(24, 128, 56, 0.45)',
	'--ui-shadow-nav-btn-hover': '0 6px 16px rgba(24, 128, 56, 0.55)',
	'--ui-overlay-btn-color': '#81C995',
	'--ui-gradient-nav-dark':
		'linear-gradient(180deg, #292929 0%, #202124 100%)',
	'--ui-shadow-nav-bar-dark': '0px -4px 12px -2px rgba(0,0,0,0.5)',
} as const;
