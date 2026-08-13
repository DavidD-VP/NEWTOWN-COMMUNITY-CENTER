import { createTheme } from '@mui/material/styles';
import { sharedComponents, sharedShape, sharedTypography } from './_shared';

/**
 * Black & White / Monochrome theme.
 *
 * Pure #000000 background, #ffffff foreground, grey accents.
 * CSS custom properties override the default blue gradients/shadows.
 */
export const monochromeTheme = createTheme({
	shape: sharedShape,
	typography: sharedTypography,
	palette: {
		mode: 'dark',
		primary: {
			main: '#ffffff',
			light: '#ffffff',
			dark: '#cccccc',
		},
		secondary: {
			main: '#aaaaaa',
		},
		background: {
			default: '#000000',
			paper: '#111111',
		},
		text: {
			primary: '#ffffff',
			secondary: '#aaaaaa',
		},
	},
	components: {
		...sharedComponents,
	},
});

export const monochromeVars = {
	'--ui-gradient-active': 'linear-gradient(135deg, #333333 0%, #666666 50%, #999999 100%)',
	'--ui-shadow-active': '0 4px 12px rgba(255,255,255,0.15)',
	'--ui-shadow-active-hover': '0 6px 16px rgba(255,255,255,0.22)',
	'--ui-shadow-active-strong': '0 4px 20px rgba(255,255,255,0.2)',
	'--ui-shadow-nav-btn': '0 4px 12px rgba(255,255,255,0.15)',
	'--ui-shadow-nav-btn-hover': '0 6px 16px rgba(255,255,255,0.22)',
	'--ui-gradient-nav-dark': 'linear-gradient(180deg, #0a0a0a 0%, #000000 100%)',
	'--ui-shadow-nav-bar-dark': '0px -4px 12px -2px rgba(255,255,255,0.08)',
	'--ui-overlay-btn-color': '#333333',
} as const;
