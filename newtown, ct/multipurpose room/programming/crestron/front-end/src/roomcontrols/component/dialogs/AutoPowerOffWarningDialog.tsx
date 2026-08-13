import * as React from 'react';

import {
	Box,
	Button,
	Typography,
} from '@mui/material';
import TimerOffIcon from '@mui/icons-material/TimerOff';
import SnoozeIcon from '@mui/icons-material/Snooze';
import CloseIcon from '@mui/icons-material/Close';

import CrestronButton from '../CrestronButton';
import TouchPanelOverlay from '../TouchPanelOverlay';
import {
	overlayBodyCopyCenterSx,
} from '../touchPanelOverlayStyles';
import { publishEvent } from '../../../crestron/CrComLib';
import { ctBtn } from '../../card/ctCardStyles';
import { dialogHeaderBtnSx } from '../connectCardStyles';
import {
	formatCountdown,
	secondsUntilTrigger,
} from '../../utils/timeCompare';

export type AutoPowerOffWarningDialogProps = {
	open: boolean;
	onDismiss: () => void;
	stayAwakeSignal: string;
	activateStandbySignal: string;
	nowTime: string;
	offTime: string;
};

const AutoPowerOffWarningDialog: React.FC<AutoPowerOffWarningDialogProps> = (props) => {
	const [secondsLeft, setSecondsLeft] = React.useState(0);
	const expiryHandledRef = React.useRef(false);
	const armedForExpiryRef = React.useRef(false);

	const syncCountdown = React.useCallback(() => {
		const seconds = secondsUntilTrigger(props.nowTime, props.offTime);
		if (seconds !== null) {
			setSecondsLeft(seconds);
		}
		return seconds;
	}, [props.nowTime, props.offTime]);

	React.useEffect(() => {
		if (!props.open) {
			expiryHandledRef.current = false;
			armedForExpiryRef.current = false;
			return;
		}

		syncCountdown();
	}, [props.open, props.nowTime, props.offTime, syncCountdown]);

	React.useEffect(() => {
		if (!props.open) return;

		const id = window.setInterval(syncCountdown, 1000);
		return () => window.clearInterval(id);
	}, [props.open, syncCountdown]);

	React.useEffect(() => {
		if (!props.open) {
			return;
		}

		if (secondsLeft > 0) {
			armedForExpiryRef.current = true;
			return;
		}

		if (!armedForExpiryRef.current || expiryHandledRef.current) {
			return;
		}

		expiryHandledRef.current = true;
		publishEvent('boolean', props.activateStandbySignal, true);
		publishEvent('boolean', props.activateStandbySignal, false);
	}, [props.open, secondsLeft, props.activateStandbySignal]);

	return (
		<TouchPanelOverlay
			open={props.open}
			onClose={props.onDismiss}
			title='Auto Power Off'
			icon={<TimerOffIcon />}
			zIndex={9000}
			headerActions={
				<>
					<CrestronButton
						signal={props.stayAwakeSignal}
						ButtonProps={{
							variant: 'contained',
							sx: dialogHeaderBtnSx,
							children: ctBtn(<SnoozeIcon />, 'Stay Awake'),
							onPointerUp: () => {
								props.onDismiss();
							},
						}}
					/>
					<Button
						variant='outlined'
						onClick={props.onDismiss}
						sx={dialogHeaderBtnSx}
					>
						{ctBtn(<CloseIcon />, 'Dismiss')}
					</Button>
				</>
			}
			showCloseButton={false}
		>
			<Box
				sx={{
					display: 'flex',
					flexDirection: 'column',
					alignItems: 'center',
					gap: 1,
				}}
			>
				<Typography sx={overlayBodyCopyCenterSx}>
					The system will automatically power off in
				</Typography>
				<Typography
					component='div'
					sx={{
						fontFamily: 'monospace',
						fontWeight: 700,
						fontSize: 'clamp(28px, 4vw, 56px)',
						letterSpacing: '0.08em',
						textAlign: 'center',
						color: 'primary.main',
						userSelect: 'none',
					}}
				>
					{formatCountdown(secondsLeft)}
				</Typography>
			</Box>
		</TouchPanelOverlay>
	);
};

export default AutoPowerOffWarningDialog;
