/**
 * Design tokens for the room-controls UI.
 *
 * Import from here instead of inlining hard-coded colour/size strings in
 * components.  Updating a value here propagates everywhere automatically.
 */

// ── Gradients ─────────────────────────────────────────────────────────────────

/** Blue "active / selected" gradient used on cards, nav buttons, dialogs, etc.
 * Uses a CSS custom property so any theme can override by setting --ui-gradient-active on :root. */
export const gradientActive =
	'var(--ui-gradient-active, linear-gradient(135deg, #1565c0 0%, #1e88e5 50%, #42a5f5 100%))';

/** Red "muted / error" gradient used on muted audio cards. */
export const gradientMuted =
	'linear-gradient(135deg, #b71c1c 0%, #e53935 50%, #ef5350 100%)';

/** Dark nav-bar gradient (dark theme). */
export const gradientNavDark =
	'var(--ui-gradient-nav-dark, linear-gradient(180deg, #1e2330 0%, #161b22 100%))';

/** Light nav-bar gradient (light theme). */
export const gradientNavLight =
	'linear-gradient(180deg, rgba(245,248,255,1) 0%, rgba(255,255,255,1) 100%)';

// ── Shadows ───────────────────────────────────────────────────────────────────

export const shadowActive = 'var(--ui-shadow-active, 0 4px 12px rgba(21, 101, 192, 0.35))';
export const shadowActiveHover = 'var(--ui-shadow-active-hover, 0 6px 16px rgba(21, 101, 192, 0.45))';
export const shadowActiveStrong = 'var(--ui-shadow-active-strong, 0 4px 20px rgba(21, 101, 192, 0.4))';
export const shadowActiveSel = 'var(--ui-shadow-active, 0 4px 12px rgba(21, 101, 192, 0.35))';
export const shadowActiveSelHover = 'var(--ui-shadow-active-hover, 0 6px 16px rgba(21, 101, 192, 0.45))';

export const shadowMuted = '0 4px 12px rgba(183, 28, 28, 0.35)';
export const shadowMutedHover = '0 6px 16px rgba(183, 28, 28, 0.45)';

export const shadowNavBar = '0px -4px 12px -2px rgba(21, 101, 192, 0.12)';
export const shadowNavBarDark = 'var(--ui-shadow-nav-bar-dark, 0px -4px 12px -2px rgba(0,0,0,0.4))';

export const shadowNavBtn = 'var(--ui-shadow-nav-btn, 0 4px 12px rgba(21, 101, 192, 0.35))';
export const shadowNavBtnHover = 'var(--ui-shadow-nav-btn-hover, 0 6px 16px rgba(21, 101, 192, 0.45))';

// ── Colour tokens ─────────────────────────────────────────────────────────────

/** Semi-transparent white used as the un-pressed button background on coloured cards. */
export const overlayButtonBg = 'rgba(255,255,255,0.15)';
export const overlayButtonBgHover = 'rgba(255,255,255,0.25)';
export const overlayButtonBorder = 'rgba(255,255,255,0.4)';
export const overlayButtonBorderHover = 'rgba(255,255,255,0.6)';

/** Pressed / contained button face colour (white) and its text colour. */
export const overlayButtonContainedBg = 'rgba(255,255,255,0.9)';
export const overlayButtonContainedBgHover = '#fff';
export const overlayButtonContainedColor = 'var(--ui-overlay-btn-color, #1565c0)';
/** Muted caption on selected contained rows — follows theme accent, not a fixed blue. */
export const overlayButtonContainedSecondaryColor = 'color-mix(in srgb, var(--ui-overlay-btn-color, #1565c0) 75%, transparent)';

/** Power / status indicator colours. */
export const colorPoweredOn = '#66bb6a';
export const colorPoweredOff = '#ef5350';
export const colorMuted = '#c62828';

/** Slider colours used on the audio volume slider. */
export const sliderRail = 'rgba(255,255,255,0.25)';
export const sliderTrack = 'rgba(255,255,255,0.75)';
export const sliderThumb = '#fff';
export const sliderThumbFocus = '0 0 0 8px rgba(255,255,255,0.2)';

/** Slider rail/track height. */
export const sliderRailHeight = 'clamp(4px, 0.76vh, 9px)';

/** Slider thumb width and height. */
export const sliderThumbSize = 'clamp(16px, 3.05vw, 37px)';

/** Vertical gap between card label row and slider track. */
export const cardSliderGap = 'clamp(4px, 0.55vw, 10px)';

/** Horizontal inset for slider track so the thumb clears the card icon at min/max. */
export const cardSliderPaddingX = 'clamp(8px, 1.11vw, 18px)';

/** Icon size inside a menu ListItemIcon. */
export const menuIconSize = 'clamp(16px, 2.21vw, 43px)';

/** MinWidth of menu ListItemIcon container (scales with icon size). */
export const menuIconWidth = 'clamp(56px, 7.75vw, 100px)';

/** sx for ListItemIcon inside a menu — ensures consistent icon/label spacing across all select menus. */
export const menuListItemIconSx = {
	minWidth: menuIconWidth,
	'& .MuiSvgIcon-root': { fontSize: menuIconSize },
} as const;

// ── Sizing tokens (clamp strings) ─────────────────────────────────────────────
//
// All fluid values use purely proportional viewport units, derived from the
// base design resolution of 723 × 524.  The preferred value is a direct
// percentage of the viewport (e.g. 11.45vh = 60px ÷ 524px) so the UI scales
// at exactly the same rate as the screen.  The clamp min is the floor for
// sub-minimum viewports; the clamp max is the value reached at the maximum
// supported resolution (1920 × 1200) so the cap never truncates within the
// supported range.

/** Minimum supported touch-panel viewport (base design resolution). */
export const pageMinWidth = '723px';
export const pageMinHeight = '524px';

/** Standard card min-height — content-driven; avoid vh so cards don't stretch with viewport height. */
export const cardMinHeight = 'min-content';

/** Standard card/navigation border-radius (MUI spacing units, passed to sx). */
export const cardBorderRadius = 2;

/** Uniform spacing between stacked cards and card inner inset (top/bottom/left/right). */
export const cardGap = 'clamp(10px, 1.25vw, 20px)';

/** Horizontal inner padding of a card row. */
export const cardPaddingH = cardGap;

/** Vertical inner padding of a card row — matches horizontal for uniform inset. */
export const cardPaddingV = cardGap;

/** Gap between items inside a card row. */
export const cardInnerGap = 'clamp(8px, 1.11vw, 22px)';

/** Gap between stacked cards on a page. */
export const pageCardGap = cardGap;

/** Vertical gap between stacked sections inside a multi-part card — matches card inset. */
export const cardSectionGap = cardGap;

/** Standard icon font-size inside cards. */
export const cardIconSize = 'clamp(24px, 3.32vw, 64px)';

/** Control-button min/max height (cable-tuner / blu-ray style). Width-scaled only — not vh. */
export const ctrlBtnHeight = 'clamp(42px, 7.5vw, 90px)';

/** Control-button inset — matches card padding for uniform spacing. */
export const ctrlBtnPaddingV = cardPaddingV;
export const ctrlBtnPaddingH = cardPaddingH;

/** Minimum card row height — matches padding + control-button height on button-group cards. */
export const cardRowMinHeight = `calc(2 * ${cardPaddingV} + ${ctrlBtnHeight} + 2 * ${cardPaddingV})`;

/** Control-button icon size. */
export const ctrlBtnIconSize = 'clamp(18px, 2.25vw, 44px)';

/** Control-button caption label size (icon + label stacked in ctBtn). */
export const ctrlBtnLabelSize = 'clamp(12px, 1.66vw, 32px)';

/** Circular overlay-button size (mute, power). */
export const circularBtnSize = ctrlBtnHeight;

/** Circular overlay-button icon size. */
export const circularBtnIconSize = 'clamp(20px, 3.82vh, 46px)';

/** Right padding offset to leave room for a circular overlay button. */
export const cardPaddingHWithOverlay = 'clamp(64px, 8.85vw, 170px)';

/** Nav-bar height. */
export const navBarHeight = 'auto';//'clamp(80px, 15.27vh, 184px)';

/** Scroll-arrow strip height. */
export const scrollArrowHeight = 'clamp(28px, 5.34vh, 65px)';

/** Page / overlay scroll-arrow strip — reserves band height; paper + divider when active. */
export const pageScrollArrowStripSx = {
	flexShrink: 0,
	width: '100%',
	height: scrollArrowHeight,
	borderRadius: 0,
	display: 'flex',
	alignItems: 'center',
	justifyContent: 'center',
} as const;

/** Paper band + divider for a scroll-arrow strip when navigation is available. */
export const pageScrollArrowStripActiveSx = (
	direction: 'up' | 'down',
	active: boolean,
) => ({
	background: active ? 'background.paper' : 'transparent',
	borderBottom: active && direction === 'up' ? '1px solid' : 'none',
	borderTop: active && direction === 'down' ? '1px solid' : 'none',
	borderColor: active ? 'divider' : undefined,
});

/** Page / overlay scroll-arrow button — primary chevron on paper strip. */
export const pageScrollArrowButtonSx = {
	width: '100%',
	height: '100%',
	borderRadius: 0,
	background: 'transparent',
	color: 'primary.main',
	'&& .MuiSvgIcon-root': {
		fontSize: 'clamp(18px, 2.49vw, 48px)',
		color: 'primary.main',
	},
} as const;

/** Page scroll-arrow IconButton — single control (RoomControls up/down arrows). */
export const pageScrollArrowPageSx = {
	...pageScrollArrowStripSx,
	color: 'primary.main',
	'&& .MuiSvgIcon-root': {
		fontSize: 'clamp(18px, 2.49vw, 48px)',
		color: 'primary.main',
	},
} as const;

/** Horizontal inset of page card content (each side). */
export const pageContentPaddingX = '2.5%';

/** Width of page card column (matches Page scroll area inner width). */
export const pageContentWidth = '95%';

/** Top offset for overlays aligned to the page content band. */
export const pageContentOverlayTop = scrollArrowHeight;

/** Height of the page content band between scroll arrows and bottom nav. */
export const pageContentOverlayHeight =
	`calc(100dvh - var(--rc-nav-bar-height, 0px) - 2 * ${scrollArrowHeight})`;

/** Bottom inset — bottom scroll arrow + measured nav bar (Dialog portals read from :root). */
export const pageContentOverlayBottom =
	`calc(var(--rc-nav-bar-height, 0px) + ${scrollArrowHeight})`;

/** Full page band (viewport top through bottom nav) — scrollable overlays only. */
export const pageFullBandOverlayTop = '0';
export const pageFullBandOverlayBottom = 'var(--rc-nav-bar-height, 0px)';
export const pageFullBandOverlayHeight =
	'calc(100dvh - var(--rc-nav-bar-height, 0px))';

/** Minimum overlay width — matches MUI dialog paper (keyboard uses full inner width). */
export const pageContentOverlayMinWidth = 'clamp(280px, 45vw, 720px)';

/** Gap between keyboard keys (shared with overlay keyboard layout). */
export const keyboardKeyGap = 'clamp(4px, 0.5vw, 8px)';

/** Compact keyboard key row height — shorter than card control buttons to fit all rows. */
export const keyboardKeyMinHeight = 'clamp(32px, 5.5vw, 68px)';

/** Modifier icon size on keyboard keys. */
export const keyboardKeyIconSize = 'clamp(16px, 2vw, 36px)';

/** Letter/symbol font on keyboard keys. */
export const keyboardKeyFontSize = 'clamp(13px, 1.6vw, 28px)';

/** Action label font (Enter, Space, Shift). */
export const keyboardKeyActionFontSize = 'clamp(10px, 1.2vw, 20px)';

/** Inner padding on keyboard keys. */
export const keyboardKeyPadding = 'clamp(4px, 0.55vw, 8px)';

/** Vertical padding around keyboard panel content. */
export const keyboardPanelPaddingY = 'clamp(6px, 0.83vw, 14px)';

/** Draft input field min-height inside keyboard panel. */
export const keyboardInputMinHeight = keyboardKeyMinHeight;

/** CSS custom property name for measured bottom-nav height (published on documentElement). */
export const navBarHeightCssVar = '--rc-nav-bar-height';

// ── Composite style objects ───────────────────────────────────────────────────
//
// These are ready-made `sx`-compatible objects assembled from the tokens above.
// Import and spread them directly into `sx` props.

/** sx for an "active" (blue gradient) card. */
export const sxCardActive = {
	background: gradientActive,
	borderColor: 'primary.main',
	borderWidth: 2,
	boxShadow: shadowActive,
	color: '#fff',
	'&:hover': { boxShadow: shadowActiveHover },
} as const;

/** sx for a "muted" (red gradient) card. */
export const sxCardMuted = {
	background: gradientMuted,
	borderColor: 'error.main',
	borderWidth: 2,
	boxShadow: shadowMuted,
	color: '#fff',
	'&:hover': { boxShadow: shadowMutedHover },
} as const;

/** sx for a "disconnected" card. */
export const sxCardDisconnected = {
	backgroundColor: 'action.hover',
	borderStyle: 'dashed',
	borderColor: 'text.disabled',
	borderWidth: 2,
	opacity: 0.6,
} as const;

/** sx for the default (neutral) card. */
export const sxCardDefault = {
	backgroundColor: 'action.hover',
	'&:hover': { borderColor: 'primary.light', boxShadow: 3 },
} as const;

/** Base sx shared by every card variant. */
export const sxCardBase = {
	display: 'flex',
	flexDirection: 'row',
	alignItems: 'center',
	flexShrink: 0,
	alignSelf: 'flex-start',
	width: '100%',
	borderRadius: cardBorderRadius,
} as const;

/** sx for compound cards that stack a header row with nested SelectCard / input rows. */
export const sxCompoundCardInner = {
	width: '100%',
	display: 'flex',
	flexDirection: 'column',
	gap: cardSectionGap,
	padding: `${cardPaddingV} ${cardPaddingH}`,
} as const;

/** sx for the inner Box that lays out icon + label + button group inside a card. */
export const sxCardInner = {
	display: 'flex',
	flexDirection: 'row',
	alignItems: 'center',
	width: '100%',
	flexWrap: 'nowrap' as const,
	boxSizing: 'border-box',
	minHeight: cardRowMinHeight,
	paddingTop: cardPaddingV,
	paddingBottom: cardPaddingV,
	paddingLeft: cardPaddingH,
	paddingRight: cardPaddingH,
	gap: cardInnerGap,
} as const;

/** sx for a card row header (icon + label + actions) without outer padding. */
export const sxCardHeaderRow = {
	display: 'flex',
	flexDirection: 'row',
	alignItems: 'center',
	gap: cardInnerGap,
	width: '100%',
} as const;

/** Outer slot wrapping a CardButtonGroup so buttons fill row height. */
export const sxCardBtnGroupSlot = {
	flexShrink: 0,
	minWidth: 0,
	alignSelf: 'stretch',
	display: 'flex',
} as const;

/** Inner slot around a single button inside a group (e.g. stopPropagation wrapper). */
export const sxCardBtnSlot = {
	flexShrink: 0,
	alignSelf: 'stretch',
	display: 'flex',
	width: 'max-content',
	'& .MuiButton-root': {
		flex: '0 0 auto',
		alignSelf: 'stretch',
		boxSizing: 'border-box',
		width: 'max-content',
		maxWidth: 'none',
		display: 'grid',
		placeItems: 'center',
		placeContent: 'center',
		lineHeight: 1,
		fontSize: ctrlBtnLabelSize,
		textTransform: 'none',
		letterSpacing: 0,
		'& > *': {
			gridArea: '1 / 1',
		},
	},
} as const;

/** sx for the card-icon Box. */
export const sxCardIcon = {
	'& .MuiSvgIcon-root': { fontSize: cardIconSize, color: '#fff' },
	display: 'flex',
	alignItems: 'center',
	alignSelf: 'center',
	flexShrink: 0,
} as const;

/** sx for the card-label Typography.
 * fontSize is intentionally omitted — it is inherited from the theme's
 * typography.body2 definition, keeping sizing in one place.
 */
export const sxCardLabel = {
	fontWeight: 600,
	lineHeight: 1.2,
	color: '#fff',
	flexShrink: 0,
	alignSelf: 'center',
} as const;

export const ctrlBtnMinWidth = 'clamp(44px, 5.5vw, 112px)';

/** Icon + label stack rendered inside a control button (ctBtn). */
export const sxCtrlBtnContent = {
	display: 'flex',
	flexDirection: 'column',
	alignItems: 'center',
	justifyContent: 'center',
	gap: '2px',
	flex: '0 0 auto',
	flexShrink: 0,
	width: 'max-content',
	maxWidth: 'none',
	'& .MuiSvgIcon-root': {
		fontSize: ctrlBtnIconSize,
		display: 'block',
	},
	'& .MuiTypography-root': {
		display: 'block',
		lineHeight: 1.1,
		whiteSpace: 'nowrap',
	},
} as const;

/** sx for control buttons rendered inside a card (cable-tuner / blu-ray style). */
export const sxCtrlBtn = {
	alignSelf: 'stretch',
	width: 'max-content',
	maxWidth: 'none',
	height: 'auto',
	minHeight: ctrlBtnHeight,
	minWidth: ctrlBtnMinWidth,
	boxSizing: 'border-box',
	display: 'grid',
	placeItems: 'center',
	placeContent: 'center',
	padding: `${ctrlBtnPaddingV} ${ctrlBtnPaddingH}`,
	lineHeight: 1,
	fontSize: ctrlBtnLabelSize,
	fontWeight: 600,
	letterSpacing: 0,
	textTransform: 'none',
	'& > *': {
		gridArea: '1 / 1',
		flexShrink: 0,
	},
	'&.MuiButton-outlined': {
		backgroundColor: overlayButtonBg,
		color: '#fff',
		borderColor: overlayButtonBorder,
		'&:hover': {
			backgroundColor: overlayButtonBgHover,
			borderColor: overlayButtonBorderHover,
		},
	},
	'&.MuiButton-contained': {
		border: '1px solid transparent',
		backgroundColor: overlayButtonContainedBg,
		color: overlayButtonContainedColor,
		'&:hover': { backgroundColor: overlayButtonContainedBgHover },
	},
} as const;

/** sx for the circular overlay button (mute / power). */
export const sxCircularOverlayBtn = {
	minWidth: circularBtnSize,
	width: circularBtnSize,
	height: circularBtnSize,
	maxHeight: circularBtnSize,
	borderRadius: '50%',
	padding: 0,
	flexShrink: 0,
	//transition: 'all 0.25s ease',
	'&.MuiButton-outlined': {
		backgroundColor: overlayButtonBg,
		borderColor: overlayButtonBorder,
		'& .MuiSvgIcon-root': { fontSize: circularBtnIconSize },
		'&:hover': {
			backgroundColor: overlayButtonBgHover,
			borderColor: overlayButtonBorderHover,
		},
	},
	'&.MuiButton-contained': {
		border: '1px solid transparent',
		backgroundColor: overlayButtonContainedBg,
		'& .MuiSvgIcon-root': { fontSize: circularBtnIconSize },
		'&:hover': { backgroundColor: overlayButtonContainedBgHover },
	},
} as const;

/** Absolute-positioning wrapper for an overlay button on the right of a card. */
export const sxOverlayBtnWrapper = {
	position: 'absolute',
	top: '50%',
	right: cardPaddingH,
	transform: 'translateY(-50%)',
	zIndex: 1,
} as const;
