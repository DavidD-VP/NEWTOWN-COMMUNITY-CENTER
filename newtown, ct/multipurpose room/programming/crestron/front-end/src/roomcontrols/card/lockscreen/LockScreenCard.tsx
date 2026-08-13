import React from 'react';
import { Button } from '@mui/material';
import LockIcon from '@mui/icons-material/Lock';
import LockOpenIcon from '@mui/icons-material/LockOpen';

import {
	useSignalStore,
	publishEvent,
} from '../../../crestron/CrComLib';

import {
	sxCtrlBtn,
	ctrlBtnIconSize,
	overlayButtonContainedColor,
} from '../../theme/tokens';

import NumericKeypadCard from '../../component/NumericKeypadCard';
import { ctBtn } from '../ctCardStyles';
import { CardProps } from '../Card';
// ── Types ────────────────────────────────────────────────────────────

export type LockScreenCardProps = {
	/** Crestron serial signal holding the lock screen PIN/password. */
	passwordSignal: string;
	/** Crestron digital — lock screen armed feedback (drives enable button state). */
	interaction: string;
	/** Crestron digital — pulsed on enable/disable toggle. */
	toggleSignal: string;
	/** Crestron digital — when true, keypad is locked (no edit access). */
	settingsLocked: string;
};

// ── Inner component (owns useSignalStore) ────────────────────────────

const LockScreenCardInner: React.FC<LockScreenCardProps> = (props) => {
	const isEnabled = useSignalStore((s) => s.booleans[props.interaction] ?? false);
	const settingsLocked = useSignalStore((s) => s.booleans[props.settingsLocked] ?? false);

	const handleToggle = React.useCallback(
		(e: React.MouseEvent) => {
			e.stopPropagation();
			publishEvent('boolean', props.toggleSignal, true);
			publishEvent('boolean', props.toggleSignal, false);
		},
		[props.toggleSignal],
	);

	const enableButton = (
		<Button
			variant={isEnabled ? 'contained' : 'outlined'}
			onClick={handleToggle}
			aria-label={isEnabled ? 'Disable lock screen' : 'Enable lock screen'}
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
			{ctBtn(isEnabled ? <LockIcon /> : <LockOpenIcon />, isEnabled ? 'Enabled' : 'Disabled')}
		</Button>
	);

	return (
		<NumericKeypadCard
			signal={props.passwordSignal}
			title='Lock Screen'
			cardIcon={<LockIcon />}
			disableSelect={settingsLocked}
			additionalButton={enableButton}
		/>
	);
};

// ── Public API ───────────────────────────────────────────────────────

const LockScreenCard = (props: LockScreenCardProps): CardProps => ({
	label: 'Lock Screen',
	children: <LockScreenCardInner {...props} />,
});

export default LockScreenCard;
