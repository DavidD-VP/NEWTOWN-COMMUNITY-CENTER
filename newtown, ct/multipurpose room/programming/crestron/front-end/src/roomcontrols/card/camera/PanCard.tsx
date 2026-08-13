import React from 'react';
import { Box, Card, Typography } from '@mui/material';
import SyncAltIcon from '@mui/icons-material/SyncAlt';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';

import { CardProps } from '../Card';
import { ctBtn } from '../ctCardStyles';
import {
	sxCardActive,
	sxCardBase,
	sxCardIcon,
	sxCardLabel,
	sxCardInner,
	sxCtrlBtn,
	ctrlBtnIconSize,
	overlayButtonContainedColor,
	sliderRail,
	sliderTrack,
	sliderThumb,
	sliderThumbFocus,
} from '../../theme/tokens';
import CrestronButton from '../../component/CrestronButton';
import CrestronSlider, { CrestronSliderProps } from '../../component/CrestronSlider';

// ── Types ─────────────────────────────────────────────────────────────────────

export type PanCardProps = {
	left: string;
	right: string;
	speed?: CrestronSliderProps;
};

// ── Shared sx ────────────────────────────────────────────────────────────────

const btnSx = {
	...sxCtrlBtn,
	'&.MuiButton-outlined': {
		...sxCtrlBtn['&.MuiButton-outlined'],
		'& .MuiSvgIcon-root': { fontSize: ctrlBtnIconSize, color: '#fff' },
	},
	'&.MuiButton-contained': {
		...sxCtrlBtn['&.MuiButton-contained'],
		'& .MuiSvgIcon-root': { fontSize: ctrlBtnIconSize, color: overlayButtonContainedColor },
	},
} as const;

const speedSliderSx = {
	'& .MuiSlider-rail': { backgroundColor: sliderRail, opacity: 1 },
	'& .MuiSlider-track': { backgroundColor: sliderTrack, borderColor: sliderTrack },
	'& .MuiSlider-thumb': {
		backgroundColor: sliderThumb,
		'&:hover, &.Mui-focusVisible': { boxShadow: sliderThumbFocus },
	},
} as const;

// ── Inner component ───────────────────────────────────────────────────────────

const PanCardInner: React.FC<PanCardProps> = (props) => (
	<Box sx={{ width: '100%', position: 'relative' }}>
		<Card variant='outlined' sx={{ ...sxCardBase, ...sxCardActive }}>
			<Box sx={sxCardInner}>
				<Box sx={sxCardIcon}><SyncAltIcon /></Box>
				<Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 'clamp(2px, 0.38vh, 5px)', flex: 1, minWidth: 0 }}>
					<Typography variant='body2' sx={sxCardLabel}>Pan</Typography>
					{props.speed && (
						<Box sx={{ padding: '0 clamp(4px, 1vw, 12px)' }}>
							<CrestronSlider
								{...props.speed}
								SliderProps={{ ...props.speed.SliderProps, sx: { ...speedSliderSx, ...props.speed.SliderProps?.sx } }}
							/>
						</Box>
					)}
				</Box>
				<Box sx={{ display: 'flex', flexDirection: 'row', gap: 'clamp(4px, 0.76vh, 9px)', flexShrink: 0 }}>
					<CrestronButton signal={props.left} ButtonProps={{ sx: btnSx, children: ctBtn(<ArrowBackIcon />, 'Left') }} />
					<CrestronButton signal={props.right} ButtonProps={{ sx: btnSx, children: ctBtn(<ArrowForwardIcon />, 'Right') }} />
				</Box>
			</Box>
		</Card>
	</Box>
);

// ── Public API ────────────────────────────────────────────────────────────────

const PanCard = (props: PanCardProps): CardProps => ({
	label: 'Pan',
	children: <PanCardInner {...props} />,
});

export default PanCard;
