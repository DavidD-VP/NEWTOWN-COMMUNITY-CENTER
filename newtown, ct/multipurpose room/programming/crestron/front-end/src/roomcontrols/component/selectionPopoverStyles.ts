import {
	overlayButtonBg,
	overlayButtonBgHover,
	overlayButtonBorder,
	overlayButtonBorderHover,
	overlayButtonContainedBg,
	overlayButtonContainedBgHover,
	overlayButtonContainedColor,
	overlayButtonContainedSecondaryColor,
	cardGap,
} from '../theme/tokens';

/** Shared sizing for keypad/time picker popovers. */
export const popoverPad = cardGap;
export const popoverControlSize = 'clamp(44px, min(5.5vw, 7vh), 80px)';
export const popoverGap = 'clamp(6px, min(0.8vw, 1vh), 14px)';
export const popoverFont = 'clamp(16px, min(2.2vw, 2.8vh), 36px)';
export const popoverDigitFont = 'clamp(20px, min(2.6vw, 3.2vh), 40px)';

/** List row styling — mirrors card control buttons (outlined / contained). */
export const selectionMenuItemSx = {
	borderRadius: '8px',
	mx: 0,
	my: 0,
	border: '1px solid',
	borderColor: overlayButtonBorder,
	backgroundColor: overlayButtonBg,
	color: '#fff',
	'& .MuiSvgIcon-root': { color: '#fff' },
	'& .MuiListItemText-secondary': { color: 'rgba(255,255,255,0.85)' },
	'&:hover:not(.Mui-selected):not(.Mui-disabled)': {
		backgroundColor: overlayButtonBgHover,
		borderColor: overlayButtonBorderHover,
	},
	'&.Mui-selected': {
		border: '1px solid transparent',
		backgroundColor: overlayButtonContainedBg,
		color: overlayButtonContainedColor,
		'& .MuiSvgIcon-root': { color: overlayButtonContainedColor },
		'& .MuiListItemText-primary': { color: overlayButtonContainedColor },
		'& .MuiListItemText-secondary': { color: overlayButtonContainedSecondaryColor },
	},
	'&.Mui-selected:hover': {
		backgroundColor: overlayButtonContainedBgHover,
	},
	'&.Mui-disabled': {
		opacity: 1,
		backgroundColor: 'rgba(255,255,255,0.08)',
		borderColor: 'rgba(255,255,255,0.2)',
		color: 'rgba(255,255,255,0.38)',
		'& .MuiSvgIcon-root': { color: 'rgba(255,255,255,0.38)' },
		'& .MuiListItemText-primary': { color: 'rgba(255,255,255,0.38)' },
		'& .MuiListItemText-secondary': { color: 'rgba(255,255,255,0.38)' },
	},
} as const;
