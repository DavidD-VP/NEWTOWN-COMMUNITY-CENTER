import React from 'react';
import { Box, Button, Card, Typography } from '@mui/material';
import VideocamIcon from '@mui/icons-material/Videocam';
import AutoModeIcon from '@mui/icons-material/AutoMode';
import TouchAppIcon from '@mui/icons-material/TouchApp';

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
import { useSignalStore, publishEvent } from '../../../crestron/CrComLib';

// ── Types ─────────────────────────────────────────────────────────────────────

export type ControlCardProps = {
	manual: { signal: string };
	automatic: { signal: string };
};

// ── Inner component ───────────────────────────────────────────────────────────

const ControlCardInner: React.FC<ControlCardProps> = ({ manual, automatic }) => {
	const isAuto = useSignalStore((s) => s.booleans[automatic.signal] ?? false);

	const handleToggle = React.useCallback((e: React.MouseEvent) => {
		e.stopPropagation();
		const signal = isAuto ? manual.signal : automatic.signal;
		publishEvent('boolean', signal, true);
		publishEvent('boolean', signal, false);
	}, [isAuto, manual.signal, automatic.signal]);

	return (
		<Box sx={{ width: '100%', position: 'relative' }}>
			<Card variant='outlined' sx={{ ...sxCardBase, ...sxCardActive }}>
				<Box sx={sxCardInner}>
					<Box sx={sxCardIcon}>
						<VideocamIcon />
					</Box>
					<Typography variant='body2' sx={{ ...sxCardLabel, flex: 1 }}>
						Camera Control
					</Typography>
					<Button
						variant={isAuto ? 'contained' : 'outlined'}
						onClick={handleToggle}
						aria-label={isAuto ? 'Switch to manual' : 'Switch to automatic'}
						sx={{
							...sxCtrlBtn,
							'&.MuiButton-outlined': {
								...sxCtrlBtn['&.MuiButton-outlined'],
								'& .MuiSvgIcon-root': { fontSize: ctrlBtnIconSize, color: '#fff' },
							},
							'&.MuiButton-contained': {
								...sxCtrlBtn['&.MuiButton-contained'],
								'& .MuiSvgIcon-root': { fontSize: ctrlBtnIconSize, color: overlayButtonContainedColor },
							},
						}}
					>
						{isAuto ? ctBtn(<AutoModeIcon />, 'Auto') : ctBtn(<TouchAppIcon />, 'Manual')}
					</Button>
				</Box>
			</Card>
		</Box>
	);
};

// ── Public API ────────────────────────────────────────────────────────────────

const ControlCard = (props: ControlCardProps): CardProps => ({
	label: 'Camera Control',
	pin: 1,
	children: <ControlCardInner {...props} />,
});

export default ControlCard;

