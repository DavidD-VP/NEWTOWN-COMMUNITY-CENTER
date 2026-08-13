import * as React from 'react';
import ButtonGroupCard from '../../component/ButtonGroupCard';
import { ctBtn } from '../ctCardStyles';
import { CardProps } from '../Card';
import WindowIcon from '@mui/icons-material/Window';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import { useSignalStore } from '../../../crestron/CrComLib';

export type PrivacyGlassCardProps = {
	/** Crestron digital signal that holds the current active/private state.
	 *  Drives the icon/label.  Typically the same signal as ToggleSignal. */
	ActiveSignal: string;
	/** Crestron digital signal pulsed when the user taps the toggle button. */
	ToggleSignal: string;
};

const PrivacyToggleLabel: React.FC<{ signal: string }> = ({ signal }) => {
	const active = useSignalStore((s) => s.booleans[signal] ?? false);
	return <>{ctBtn(active ? <VisibilityOffIcon /> : <VisibilityIcon />, active ? 'Private' : 'Public')}</>;
};

const PrivacyGlassCard = (props: PrivacyGlassCardProps): CardProps | null => {
	return ButtonGroupCard({
		label: 'Privacy Glass',
		cardIcon: <WindowIcon />,
		buttons: [
			{
				key: 'privacy-glass-toggle',
				signal: props.ToggleSignal,
				children: <PrivacyToggleLabel signal={props.ActiveSignal} />,
			},
		],
	});
};

export default PrivacyGlassCard;
