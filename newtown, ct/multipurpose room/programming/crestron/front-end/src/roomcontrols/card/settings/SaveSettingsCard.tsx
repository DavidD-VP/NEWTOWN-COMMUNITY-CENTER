import React from 'react';
import { Box, Card, Typography } from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import CheckIcon from '@mui/icons-material/Check';

import { useSignalStore } from '../../../crestron/CrComLib';

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

export type SaveSettingsCardProps = {
	interaction: string;
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

const SaveSettingsCardInner: React.FC<SaveSettingsCardProps> = (props) => {
	const isSaved = useSignalStore((s) => s.booleans[props.interaction] ?? false);

	return (
		<Box sx={{ width: '100%', position: 'relative' }}>
			<Card variant='outlined' sx={{ ...sxCardBase, ...sxCardActive }}>
				<Box sx={sxCardInner}>
					<Box sx={sxCardIcon}><SaveIcon /></Box>
					<Typography variant='body2' sx={{ ...sxCardLabel, flex: 1 }}>Save Settings</Typography>
					<CrestronButton
						signal={props.interaction}
						ButtonProps={{
							sx: btnSx,
							children: isSaved
								? ctBtn(<CheckIcon />, 'Saved')
								: ctBtn(<SaveIcon />, 'Save'),
							'aria-label': isSaved ? 'Settings saved' : 'Save settings',
						}}
					/>
				</Box>
			</Card>
		</Box>
	);
};

// ── Public API ────────────────────────────────────────────────────────────────

const SaveSettingsCard = (props: SaveSettingsCardProps): CardProps => ({
	label: 'Save Settings',
	children: <SaveSettingsCardInner {...props} />,
});

export default SaveSettingsCard;
