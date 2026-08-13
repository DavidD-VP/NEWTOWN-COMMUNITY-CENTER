import {
	gradientActive,
	overlayButtonBg,
	overlayButtonBgHover,
	overlayButtonBorder,
	overlayButtonBorderHover,
	overlayButtonContainedBg,
	overlayButtonContainedColor,
	overlayButtonContainedBgHover,
	shadowNavBtn,
	shadowNavBtnHover,
	sliderRailHeight,
	sliderThumbSize,
	ctrlBtnMinWidth,
	cardPaddingH,
	cardPaddingV,
	navBarHeight,
} from '../roomcontrols/theme/tokens';

export const sharedComponents = {
	MuiCard: {
		styleOverrides: {
			root: {
				backgroundImage: 'none',
				borderRadius: 8,
			},
		},
	},
	MuiButton: {
		defaultProps: { disableRipple: true },
		styleOverrides: {
			root: {
				borderRadius: '8px',
				fontSize: 'clamp(13px, 1.80vw, 35px)',
				minHeight: 'clamp(36px, 6.87vh, 83px)',
			},
		},
	},
	MuiButtonGroup: {
		styleOverrides: {
			grouped: {
				minWidth: ctrlBtnMinWidth,
			},
		},
	},
	MuiMenuItem: {
		defaultProps: { disableRipple: true },
		styleOverrides: {
			root: {
				fontSize: 'clamp(14px, 1.94vw, 38px)',
				minHeight: 'clamp(40px, 7.63vh, 92px)',
			},
		},
	},
	MuiDialog: {
		styleOverrides: {
			paper: {
				background: gradientActive,
				border: '2px solid rgba(255,255,255,0.25)',
				borderRadius: 12,
				boxShadow: 'none',
				backgroundImage: 'none',
				overflow: 'hidden',
				minWidth: 'clamp(280px, 45vw, 720px)',
				color: '#fff',
				'& .MuiDialogContent-dividers': {
					borderColor: 'rgba(255,255,255,0.25)',
				},
				'& .MuiDialogContent-root .MuiTypography-root': {
					color: '#fff',
				},
				'& .MuiButton-outlined': {
					backgroundColor: overlayButtonBg,
					borderColor: overlayButtonBorder,
					color: '#fff',
					'&:hover': {
						backgroundColor: overlayButtonBgHover,
						borderColor: overlayButtonBorderHover,
					},
				},
				'& .MuiButton-contained': {
					backgroundColor: overlayButtonContainedBg,
					color: overlayButtonContainedColor,
					'&:hover': {
						backgroundColor: overlayButtonContainedBgHover,
					},
				},
				'& .MuiButton-text': {
					color: '#fff',
					'&:hover': {
						backgroundColor: 'rgba(255,255,255,0.1)',
					},
				},
			},
		},
	},
	MuiDialogTitle: {
		styleOverrides: {
			root: {
				fontSize: 'clamp(16px, 2.21vw, 43px)',
				fontWeight: 600,
				color: '#fff',
				borderBottom: '2px solid rgba(255,255,255,0.25)',
				padding: `${cardPaddingV} ${cardPaddingH}`,
			},
		},
	},
	MuiDialogContentText: {
		styleOverrides: {
			root: {
				color: 'rgba(255,255,255,0.92)',
				fontSize: 'clamp(13px, 1.80vw, 35px)',
			},
		},
	},
	MuiBottomNavigation: {
		styleOverrides: {
			root: {
				height: navBarHeight,
			},
		},
	},
	MuiBottomNavigationAction: {
		defaultProps: { disableRipple: true },
		styleOverrides: {
			root: {
				'&.Mui-selected': {
					background: gradientActive,
					boxShadow: shadowNavBtn,
					color: '#fff',
				},
				'&.Mui-selected:hover': {
					boxShadow: shadowNavBtnHover,
				},
			},
		},
	},
	MuiSlider: {
		styleOverrides: {
			rail: { height: sliderRailHeight },
			track: { height: sliderRailHeight },
			thumb: { width: sliderThumbSize, height: sliderThumbSize },
		},
	},
	MuiListItemText: {
		styleOverrides: {
			primary: { fontSize: 'clamp(14px, 1.94vw, 38px)' },
		},
	},
	MuiButtonBase: {
		defaultProps: {
			disableRipple: true,
			disableTouchRipple: true,
		},
	},
	MuiIconButton: { defaultProps: { disableRipple: true } },
	MuiCardActionArea: { defaultProps: { disableRipple: true } },
	MuiListItemButton: { defaultProps: { disableRipple: true } },
	MuiTab: { defaultProps: { disableRipple: true } },
};

export const sharedTypography = {
	body2: {
		fontSize: 'clamp(14px, 1.94vw, 38px)',
	},
	caption: {
		fontSize: 'clamp(12px, 1.66vw, 32px)',
	},
};

export const sharedShape = {
	borderRadius: 8,
};
