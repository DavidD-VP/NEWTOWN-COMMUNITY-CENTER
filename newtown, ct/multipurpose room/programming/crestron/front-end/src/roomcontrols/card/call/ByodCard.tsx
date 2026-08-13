import * as React from 'react';

import LaptopIcon from '@mui/icons-material/Laptop';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import StopIcon from '@mui/icons-material/Stop';

import ButtonGroupCard from '../../component/ButtonGroupCard';
import { ctBtn } from '../ctCardStyles';
import { CardProps } from '../Card';
import { useSignalStore } from '../../../crestron/CrComLib';
import type { CallChannelConnectConfig } from '../../../config/signals';

const ByodToggleLabel: React.FC<{ interactionSignal: string }> = ({ interactionSignal }) => {
	const active = useSignalStore((s) => s.booleans[interactionSignal] ?? false);
	return (
		<>
			{ctBtn(
				active ? <StopIcon /> : <PlayArrowIcon />,
				active ? 'Stop' : 'Start',
			)}
		</>
	);
};

const ByodCard = (byod: CallChannelConnectConfig['byod']): CardProps | null =>
	ButtonGroupCard({
		label: 'Bring Your Own Device',
		cardIcon: <LaptopIcon />,
		buttons: [
			{
				key: 'byod-toggle',
				signal: byod.interaction,
				children: <ByodToggleLabel interactionSignal={byod.interaction} />,
			},
		],
	});

export default ByodCard;
