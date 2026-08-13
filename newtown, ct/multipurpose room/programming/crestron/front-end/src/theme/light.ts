import { createTheme } from '@mui/material/styles';
import { sharedComponents, sharedShape, sharedTypography } from './_shared';

export const lightTheme = createTheme({
	shape: sharedShape,
	typography: sharedTypography,
	palette: {
		mode: 'light',
		primary: {
			main: '#1976d2',
		},
		secondary: {
			main: '#dc004e',
		},
		background: {
			default: '#f5f5f5',
			paper: '#ffffff',
		},
		text: {
			primary: '#1976d2',
		},
	},
	components: {
		...sharedComponents,
	},
});
