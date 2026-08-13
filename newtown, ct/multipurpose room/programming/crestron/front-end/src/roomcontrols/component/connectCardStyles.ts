import {
	sxCtrlBtn,
	ctrlBtnIconSize,
	overlayButtonContainedColor,
	cardInnerGap,
	sxCardBtnGroupSlot,
} from '../theme/tokens';

export { sxCardBtnGroupSlot } from '../theme/tokens';

export const connectCardHeaderSx = {
	display: 'flex',
	flexDirection: 'row',
	alignItems: 'center',
	gap: cardInnerGap,
} as const;

export const connectBtnSx = {
	...sxCtrlBtn,
	'&.MuiButton-outlined': {
		...sxCtrlBtn['&.MuiButton-outlined'],
		'& .MuiSvgIcon-root': { fontSize: ctrlBtnIconSize, color: '#fff' },
		'&.Mui-disabled': {
			backgroundColor: 'rgba(255,255,255,0.08)',
			color: 'rgba(255,255,255,0.38)',
			borderColor: 'rgba(255,255,255,0.2)',
			'& .MuiSvgIcon-root': { color: 'rgba(255,255,255,0.38)' },
			'& .MuiTypography-root': { color: 'rgba(255,255,255,0.38)' },
		},
	},
	'&.MuiButton-contained': {
		...sxCtrlBtn['&.MuiButton-contained'],
		'& .MuiSvgIcon-root': { fontSize: ctrlBtnIconSize, color: overlayButtonContainedColor },
		'&.Mui-disabled': {
			backgroundColor: 'rgba(255,255,255,0.28)',
			color: 'rgba(255,255,255,0.45)',
			borderColor: 'transparent',
			'& .MuiSvgIcon-root': { color: 'rgba(255,255,255,0.45)' },
			'& .MuiTypography-root': { color: 'rgba(255,255,255,0.45)' },
		},
	},
} as const;

/** Dialog header actions — auto height so title row stays stable when visibility toggles. */
export const dialogHeaderBtnSx = {
	...connectBtnSx,
	minHeight: 'auto',
	height: 'auto',
} as const;

export const dialogHeaderActionSlotSx = sxCardBtnGroupSlot;
