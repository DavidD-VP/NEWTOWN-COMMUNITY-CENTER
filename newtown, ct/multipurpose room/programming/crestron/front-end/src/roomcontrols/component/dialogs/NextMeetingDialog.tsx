import * as React from 'react';
import {
	Box,
	Typography,
} from '@mui/material';
import VideoCallIcon from '@mui/icons-material/VideoCall';

import { DialogProps } from './BottomNavigationActionDialog';
import CrestronButton from '../CrestronButton';
import TouchPanelOverlay from '../TouchPanelOverlay';
import {
	overlayFieldLabelSx,
	overlayFieldValueSx,
} from '../touchPanelOverlayStyles';
import MeetingNavIcon from '../MeetingNavIcon';
import { ctBtn } from '../../card/ctCardStyles';
import {
	dialogHeaderActionSlotSx,
	dialogHeaderBtnSx,
} from '../connectCardStyles';
import { useSignalStore } from '../../../crestron/CrComLib';
import { signalConfig } from '../../../config/signals';

export type NextMeetingDialogProps = {
	title: string;
	organizer: string;
	address: string;
	protocol: string;
	startTime: string;
	endTime: string;
	join: string;
	Standby: boolean;
};

type MeetingField = {
	label: string;
	value: string;
};

const fieldGridSx = {
	display: 'grid',
	gridTemplateColumns: 'minmax(96px, 34%) 1fr',
	columnGap: 2,
	rowGap: 1.25,
	alignItems: 'baseline',
	width: '100%',
} as const;

function buildMeetingFields(props: NextMeetingDialogProps): MeetingField[] {
	const fields: MeetingField[] = [];

	const title = props.title.trim();
	const organizer = props.organizer.trim();
	const startTime = props.startTime.trim();
	const endTime = props.endTime.trim();
	const address = props.address.trim();
	const protocol = props.protocol.trim();

	if (title) {
		fields.push({ label: 'Title', value: title });
	}
	if (organizer) {
		fields.push({ label: 'Organizer', value: organizer });
	}

	const timeRange = [startTime, endTime].filter(Boolean).join(' – ');
	if (timeRange) {
		fields.push({ label: 'Time', value: timeRange });
	}

	const location = [address, protocol].filter(Boolean).join(' · ');
	if (location) {
		fields.push({ label: 'Address', value: location });
	}

	return fields;
}

type NextMeetingJoinButtonProps = {
	joinSignal: string;
	onJoin: () => void;
	joinable: boolean;
};

const NextMeetingJoinButton = ({
	joinSignal,
	onJoin,
	joinable,
}: NextMeetingJoinButtonProps): JSX.Element => (
	<Box
		sx={{
			...dialogHeaderActionSlotSx,
			visibility: joinable ? 'visible' : 'hidden',
			pointerEvents: joinable ? 'auto' : 'none',
		}}
	>
		<CrestronButton
			signal={joinSignal}
			ButtonProps={{
				disabled: !joinable,
				sx: dialogHeaderBtnSx,
				onPointerDown: onJoin,
				children: ctBtn(<VideoCallIcon />, 'Join'),
			}}
		/>
	</Box>
);

const NextMeetingDialog = (props: NextMeetingDialogProps): DialogProps => {
	const [open, setOpen] = React.useState(false);
	const fields = buildMeetingFields(props);
	const joinable = useSignalStore(
		(s) => s.booleans[signalConfig.nextMeeting.joinable] ?? false,
	);

	React.useEffect(() => {
		if (props.Standby) {
			setOpen(false);
		}
	}, [props.Standby]);

	const handleClose = () => setOpen(false);

	return {
		BottomNavigationActionProps: {
			icon: <MeetingNavIcon />,
			label: 'Meeting',
			onClick: () => {
				if (document.activeElement instanceof HTMLElement) {
					document.activeElement.blur();
				}
				setOpen(true);
			},
		},
		navActive: open,
		DialogProps: {
			open,
			onClose: handleClose,
		},
		Overlay: (
			<TouchPanelOverlay
				open={open}
				onClose={handleClose}
				title='Next Meeting'
				icon={<VideoCallIcon />}
				headerActions={
					<NextMeetingJoinButton
						joinSignal={props.join}
						onJoin={handleClose}
						joinable={joinable}
					/>
				}
			>
				<Box sx={fieldGridSx}>
					{fields.length > 0 ? (
						fields.map((field) => (
							<React.Fragment key={field.label}>
								<Typography sx={overlayFieldLabelSx}>{field.label}</Typography>
								<Typography sx={overlayFieldValueSx}>{field.value}</Typography>
							</React.Fragment>
						))
					) : (
						<Typography sx={overlayFieldValueSx}>
							{joinable
								? 'No meeting details available.'
								: 'There are no upcoming meetings.'}
						</Typography>
					)}
				</Box>
			</TouchPanelOverlay>
		),
	};
};

export default NextMeetingDialog;
