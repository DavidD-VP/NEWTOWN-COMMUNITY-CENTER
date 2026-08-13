import {

	overlayButtonBg,

	overlayButtonBgHover,

	overlayButtonBorder,

	overlayButtonBorderHover,

	overlayButtonContainedBg,

	overlayButtonContainedBgHover,

	overlayButtonContainedColor,

	overlayButtonContainedSecondaryColor,

	pageContentOverlayBottom,

	pageContentOverlayHeight,

	pageContentOverlayMinWidth,

	pageContentOverlayTop,

	pageContentPaddingX,

	pageContentWidth,

	pageFullBandOverlayBottom,

	pageFullBandOverlayHeight,

	pageFullBandOverlayTop,

	pageScrollArrowButtonSx,

	sxCardActive,

	sxCardMuted,

	shadowMutedHover,

	cardBorderRadius,

	cardPaddingH,

	cardPaddingV,

} from '../theme/tokens';



/** Strip MUI Paper elevation shadow/overlay from transparent dialog shells. */
export const overlayDialogShellResetSx = {
	boxShadow: 'none',
	backgroundImage: 'none',
	filter: 'none',
} as const;

/** Strip card glow on overlay panels — keep gradient background. */
export const overlayPanelShadowResetSx = {
	boxShadow: 'none',
	'&:hover': { boxShadow: 'none' },
} as const;

/** Card-active shell colors for overlay dialog paper. */
export const overlayPanelPaperSx = {

	...sxCardActive,

	...overlayPanelShadowResetSx,

	color: '#fff',

	'& .MuiTypography-root': {

		color: '#fff',

	},

	'& .MuiListItemText-primary': {

		color: '#fff',

	},

	'& .MuiListItemText-secondary': {

		color: 'rgba(255,255,255,0.85)',

	},

	'& .MuiSvgIcon-root': {

		color: '#fff',

	},

	'& .MuiButton-contained .MuiTypography-root': {

		color: overlayButtonContainedColor,

	},

	'& .MuiButton-contained .MuiSvgIcon-root': {

		color: overlayButtonContainedColor,

	},

	'& .MuiMenuItem-root.Mui-selected': {

		'& .MuiTypography-root, & .MuiListItemText-primary, & .MuiSvgIcon-root': {

			color: overlayButtonContainedColor,

		},

		'& .MuiListItemText-secondary': {

			color: overlayButtonContainedSecondaryColor,

		},

	},

} as const;



/** Glass outlined key / secondary action — matches card control buttons. */

export const overlayKeyButtonSx = {

	border: '2px solid',

	borderColor: overlayButtonBorder,

	backgroundColor: overlayButtonBg,

	color: '#fff',

	'& .MuiSvgIcon-root': { color: '#fff' },

	cursor: 'pointer',

	userSelect: 'none' as const,

	'&:hover': {

		backgroundColor: overlayButtonBgHover,

		borderColor: overlayButtonBorderHover,

	},

} as const;



/** Draft / display input field on overlay panels. */

export const overlayInputFieldSx = {

	border: '2px solid',

	borderColor: overlayButtonBorder,

	backgroundColor: overlayButtonBg,

	color: '#fff',

} as const;



/** White contained Set / Confirm / Send footer action. */

export const overlayConfirmButtonSx = {

	border: '1px solid transparent',

	backgroundColor: overlayButtonContainedBg,

	color: overlayButtonContainedColor,

	fontWeight: 700,

	cursor: 'pointer',

	userSelect: 'none' as const,

	'&:hover': {

		backgroundColor: overlayButtonContainedBgHover,

	},

	'&:disabled': {

		backgroundColor: 'rgba(255,255,255,0.28)',

		color: 'rgba(255,255,255,0.45)',

		cursor: 'default',

	},

} as const;



/** Full-width footer action on overlay panels (Save / Update / Confirm). */
export const overlayFooterActionButtonSx = {
	...overlayConfirmButtonSx,
	width: '100%',
	fontSize: 'clamp(13px, 1.8vw, 35px)',
	py: 'clamp(6px, 0.83vw, 16px)',
	lineHeight: 1.2,
	textTransform: 'none',
	borderRadius: cardBorderRadius,
} as const;

/** Full-width destructive footer action — matches powered-off share destination (red). */
export const overlayDestructiveFooterActionButtonSx = {
	...sxCardMuted,
	width: '100%',
	fontSize: 'clamp(13px, 1.8vw, 35px)',
	py: 'clamp(6px, 0.83vw, 16px)',
	lineHeight: 1.2,
	textTransform: 'none',
	borderRadius: cardBorderRadius,
	border: '2px solid',
	fontWeight: 700,
	cursor: 'pointer',
	userSelect: 'none' as const,
	color: '#fff',
	'&.MuiButton-outlined, &.MuiButton-contained': {
		background: sxCardMuted.background,
		borderColor: sxCardMuted.borderColor,
		boxShadow: sxCardMuted.boxShadow,
		color: '#fff',
		'&:hover': {
			background: sxCardMuted.background,
			borderColor: sxCardMuted.borderColor,
			boxShadow: shadowMutedHover,
		},
	},
} as const;



/** Standard overlay body copy font size (centered messages). */
export const overlayBodyFontSize = 'clamp(16px, min(2.2vw, 3vh), 36px)';

/** Standard overlay field font size — matches theme body2. */
export const overlayFieldFontSize = 'clamp(14px, 1.94vw, 38px)';

/** Body copy on overlay panels. */
export const overlayBodyTextSx = {
	color: '#fff',
	fontWeight: 600,
} as const;

/** Standard overlay body paragraph styling. */
export const overlayBodyCopySx = {
	...overlayBodyTextSx,
	fontSize: overlayBodyFontSize,
	lineHeight: 1.4,
} as const;

/** Centered body copy for instructional popup text. */
export const overlayBodyCopyCenterSx = {
	...overlayBodyCopySx,
	textAlign: 'center',
	width: '100%',
} as const;

/** Field label in overlay detail grids. */
export const overlayFieldLabelSx = {
	fontWeight: 600,
	color: 'rgba(255,255,255,0.72)',
	fontSize: overlayFieldFontSize,
	lineHeight: 1.2,
} as const;

/** Field value in overlay detail grids. */
export const overlayFieldValueSx = {
	...overlayBodyTextSx,
	fontSize: overlayFieldFontSize,
	lineHeight: 1.2,
	wordBreak: 'break-word',
} as const;

/** Outer inset for overlay body content — matches card edge padding. */
export const overlayBodyContentInsetSx = {
	px: cardPaddingH,
	pt: cardPaddingV,
	pb: cardPaddingV,
	boxSizing: 'border-box',
	width: '100%',
} as const;

/** Standard padding for overlay message/content blocks. */
export const overlayContentInsetSx = {
	px: cardPaddingH,
	py: cardPaddingV,
	boxSizing: 'border-box',
	width: '100%',
} as const;



/** Horizontal inset for overlay content — matches page card column (2.5% each side). */

export const overlayPageContentInsetSx = {

	px: pageContentPaddingX,

	boxSizing: 'border-box',

	width: '100%',

} as const;



const overlayPaperBaseSx = {

	...overlayPanelPaperSx,

	position: 'fixed' as const,

	left: pageContentPaddingX,

	width: pageContentWidth,

	maxWidth: pageContentWidth,

	minWidth: pageContentOverlayMinWidth,

	height: 'auto' as const,

	margin: 0,

	display: 'flex' as const,

	flexDirection: 'column' as const,

	overflow: 'hidden' as const,

};



/** Dialog paper sx — inset page content band + card-active colors. */

export const touchPanelOverlayPaperSx = {

	...overlayPaperBaseSx,

	top: pageContentOverlayTop,

	maxHeight: pageContentOverlayHeight,

} as const;



/** Transparent outer shell — page band with scroll arrows outside the card. */

export const touchPanelOverlayPageBandShellSx = {

	position: 'fixed',

	top: pageFullBandOverlayTop,

	bottom: pageFullBandOverlayBottom,

	left: 0,

	width: '100%',

	maxWidth: '100%',

	maxHeight: pageFullBandOverlayHeight,

	height: 'auto',

	margin: 0,

	borderRadius: 0,

	background: 'transparent',

	...overlayDialogShellResetSx,

	border: 'none',

	display: 'flex',

	flexDirection: 'column',

	overflow: 'hidden',

	'& .overlay-scroll-arrow': pageScrollArrowButtonSx,

} as const;



/** Inset card panel inside scrollable overlay — matches page TextKeyboardCard. */

export const touchPanelOverlayCardSx = {

	...overlayPanelPaperSx,

	borderRadius: cardBorderRadius,

	width: '100%',

	display: 'flex',

	flexDirection: 'column',

	overflow: 'hidden',

	flexShrink: 1,

	alignSelf: 'flex-start',

	maxHeight: '100%',

	minHeight: 0,

	boxSizing: 'border-box',

} as const;



/** Dialog paper sx — full page band for scrollable overlays (edge-to-edge shell). */

export const touchPanelOverlayFullBandPaperSx = {

	...overlayPanelPaperSx,

	position: 'fixed',

	top: pageFullBandOverlayTop,

	left: 0,

	width: '100%',

	maxWidth: '100%',

	maxHeight: pageFullBandOverlayHeight,

	height: 'auto',

	margin: 0,

	borderRadius: 0,

	display: 'flex',

	flexDirection: 'column',

	overflow: 'hidden',

	'& .overlay-scroll-arrow': pageScrollArrowButtonSx,

} as const;



/** Fixed rect covering the page content band — hides cards behind overlay corner radius. */

export const touchPanelOverlayBackingSx = {

	position: 'fixed',

	top: pageContentOverlayTop,

	bottom: pageContentOverlayBottom,

	left: pageContentPaddingX,

	width: pageContentWidth,

	maxWidth: pageContentWidth,

	minWidth: pageContentOverlayMinWidth,

	maxHeight: pageContentOverlayHeight,

	backgroundColor: 'background.default',

	pointerEvents: 'none',

} as const;



/** Backing plate for full-band scrollable overlays. */

export const touchPanelOverlayFullBandBackingSx = {

	position: 'fixed',

	top: pageFullBandOverlayTop,

	bottom: pageFullBandOverlayBottom,

	left: 0,

	width: '100%',

	maxHeight: pageFullBandOverlayHeight,

	backgroundColor: 'background.default',

	pointerEvents: 'none',

} as const;



/** Dialog container sx — paper is self-positioned; do not center in viewport. */

export const touchPanelOverlayContainerSx = {

	alignItems: 'flex-start',

	justifyContent: 'flex-start',

} as const;



/** Transparent backdrop with opaque plate behind the overlay — full page band. */
export const touchPanelOverlayBackdropProps = {

	sx: {

		backgroundColor: 'transparent',

		'&::before': {

			content: '""',

			...touchPanelOverlayFullBandBackingSx,

		},

	},

} as const;



/** Backdrop for full-band scrollable overlays. */

export const touchPanelOverlayFullBandBackdropProps = {

	sx: {

		backgroundColor: 'transparent',

		'&::before': {

			content: '""',

			...touchPanelOverlayFullBandBackingSx,

		},

	},

} as const;


