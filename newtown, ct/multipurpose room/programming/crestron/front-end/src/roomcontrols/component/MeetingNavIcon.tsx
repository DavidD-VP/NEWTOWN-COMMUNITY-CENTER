import { Box } from '@mui/material';
import EventIcon from '@mui/icons-material/Event';
import NotificationImportantIcon from '@mui/icons-material/NotificationImportant';

import { useSignalStore } from '../../crestron/CrComLib';
import { signalConfig } from '../../config/signals';

const MeetingNavIcon = (): JSX.Element => {
	const joinable = useSignalStore(
		(s) => s.booleans[signalConfig.nextMeeting.joinable] ?? false,
	);

	return (
		<Box className='meeting-nav-icon-shell' sx={{ display: 'inline-flex', lineHeight: 0 }}>
			<EventIcon />
			{joinable ? (
				<NotificationImportantIcon className='meeting-nav-joinable-alert' />
			) : null}
		</Box>
	);
};

export default MeetingNavIcon;
