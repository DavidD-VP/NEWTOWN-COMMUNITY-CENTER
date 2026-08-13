import PhoneIcon from '@mui/icons-material/Phone';

import PhoneInTalkIcon from '@mui/icons-material/PhoneInTalk';



import { useSignalStore } from '../../crestron/CrComLib';

import { signalConfig } from '../../config/signals';



const CallNavIcon = (): JSX.Element => {

	const videoConnected = useSignalStore(

		(s) => s.booleans[signalConfig.call.video.connected] ?? false,

	);

	const audioConnected = useSignalStore(

		(s) => s.booleans[signalConfig.call.audio.connected] ?? false,

	);

	const connected = videoConnected || audioConnected;

	return connected ? (

		<PhoneInTalkIcon className='call-nav-connected' />

	) : (

		<PhoneIcon />

	);

};



export default CallNavIcon;

