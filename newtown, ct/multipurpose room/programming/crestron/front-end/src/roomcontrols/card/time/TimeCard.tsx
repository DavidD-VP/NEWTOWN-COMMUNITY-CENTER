import React from 'react';
import AccessTimeIcon from '@mui/icons-material/AccessTime';

import { useSignalStore } from '../../../crestron/CrComLib';
import BaseTimeCard from '../../component/TimeCard';
import { CardProps } from '../Card';

export type TimeCardProps = {
	/** Crestron serial — HHMMSS; published on Set in the picker. */
	timeSignal: string;
	/** Card header and nav label. */
	title: string;
	/** Icon on the card row. Defaults to clock. */
	cardIcon?: React.ReactNode;
	/** Crestron digital — when true, time picker is locked (no edit access). */
	settingsLocked: string;
};

const TimeCardInner: React.FC<TimeCardProps> = (props) => {
	const settingsLocked = useSignalStore((s) => s.booleans[props.settingsLocked] ?? false);
	return (
		<BaseTimeCard
			signal={props.timeSignal}
			title={props.title}
			cardIcon={props.cardIcon ?? <AccessTimeIcon />}
			disableSelect={settingsLocked}
		/>
	);
};

const TimeCard = (props: TimeCardProps): CardProps => ({
	label: props.title,
	children: <TimeCardInner {...props} />,
});

export default TimeCard;
