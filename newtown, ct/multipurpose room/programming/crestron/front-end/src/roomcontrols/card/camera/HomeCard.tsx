import React from 'react';
import { Box, Card, Typography } from '@mui/material';
import HomeIcon from '@mui/icons-material/Home';

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
} from '../../theme/tokens';
import CrestronButton from '../../component/CrestronButton';

// ── Types ─────────────────────────────────────────────────────────────────────

export type HomeCardProps = {
	signal: string;
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

// ── Inner component ───────────────────────────────────────────────────────────

const HomeCardInner: React.FC<HomeCardProps> = (props) => (
	<Box sx={{ width: '100%', position: 'relative' }}>
		<Card variant='outlined' sx={{ ...sxCardBase, ...sxCardActive }}>
			<Box sx={sxCardInner}>
				<Box sx={sxCardIcon}><HomeIcon /></Box>
				<Typography variant='body2' sx={{ ...sxCardLabel, flex: 1 }}>Home</Typography>
				<CrestronButton signal={props.signal} ButtonProps={{ sx: btnSx, children: ctBtn(<HomeIcon />, 'Home') }} />
			</Box>
		</Card>
	</Box>
);

// ── Public API ────────────────────────────────────────────────────────────────

const HomeCard = (props: HomeCardProps): CardProps => ({
	label: 'Home',
	children: <HomeCardInner {...props} />,
});

export default HomeCard;
