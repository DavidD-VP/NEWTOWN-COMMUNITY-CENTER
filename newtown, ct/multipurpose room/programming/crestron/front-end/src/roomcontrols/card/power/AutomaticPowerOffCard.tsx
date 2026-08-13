import React from 'react';
import { Button } from '@mui/material';
import PowerSettingsNewIcon from '@mui/icons-material/PowerSettingsNew';
import TimerOffIcon from '@mui/icons-material/TimerOff';

import {
	useSignalStore,
	publishEvent,
} from '../../../crestron/CrComLib';

import {
	sxCtrlBtn,
	ctrlBtnIconSize,
	overlayButtonContainedColor,
} from '../../theme/tokens';

import TimeCard from '../../component/TimeCard';
import { ctBtn } from '../ctCardStyles';
import { CardProps } from '../Card';

// ── Types ────────────────────────────────────────────────────────────

export type AutomaticPowerOffCardProps = {
	/**
	 * Crestron serial signal holding the auto-off time in HHMMSS format.
	 * Read for the current value; published with the updated time on confirm.
	 */
	timeSignal: string;
	/** Crestron digital — show enable/disable control when true. */
	enable: string;
	/** Crestron digital — latched enabled state; pulsed on toggle. */
	interaction: string;
	/** Crestron digital — when true, time picker is locked (no edit access). */
	settingsLocked: string;
};

// ── Inner component (owns useSignalStore) ────────────────────────────

const AutomaticPowerOffCardInner: React.FC<AutomaticPowerOffCardProps> = (props) => {
	const showEnable = useSignalStore((s) => s.booleans[props.enable] ?? false);
	const isEnabled = useSignalStore((s) => s.booleans[props.interaction] ?? false);
	const settingsLocked = useSignalStore((s) => s.booleans[props.settingsLocked] ?? false);

	const handleToggle = React.useCallback(
		(e: React.MouseEvent) => {
			e.stopPropagation();
			publishEvent('boolean', props.interaction, true);
			publishEvent('boolean', props.interaction, false);
		},
		[props.interaction],
	);

	const enableButton = showEnable ? (
		<Button
			variant={isEnabled ? 'contained' : 'outlined'}
			onClick={handleToggle}
			aria-label={isEnabled ? 'Disable automatic power off' : 'Enable automatic power off'}
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
			{ctBtn(<PowerSettingsNewIcon />, isEnabled ? 'Enabled' : 'Disabled')}
		</Button>
	) : undefined;

	return (
		<TimeCard
			signal={props.timeSignal}
			title='Auto Power Off'
			cardIcon={<TimerOffIcon />}
			disableSelect={settingsLocked}
			additionalButton={enableButton}
		/>
	);
};

// ── Public API ───────────────────────────────────────────────────────

const AutomaticPowerOffCard = (props: AutomaticPowerOffCardProps): CardProps => ({
	label: 'Auto Power Off',
	children: <AutomaticPowerOffCardInner {...props} />,
});

export default AutomaticPowerOffCard;
