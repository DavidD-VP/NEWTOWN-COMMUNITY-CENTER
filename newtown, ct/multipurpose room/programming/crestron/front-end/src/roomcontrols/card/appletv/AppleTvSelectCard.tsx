import React from 'react';

import SelectCard from '../../component/SelectCard';
import AppleTvIcon from '../../component/AppleTvIcon';
import { CardProps } from '../Card';

export type AppleTvSelectCardProps = {
	Select: string;
	Devices: Array<string>;
	DisableSelect?: boolean;
};

export const AppleTvSelectCard = (props: AppleTvSelectCardProps): CardProps => ({
	label: 'Apple TV Selection',
	children: (
		<SelectCard
			signal={props.Select}
			title='Apple TV Selection'
			cardIcon={<AppleTvIcon />}
			options={props.Devices
				.map((d, i) => ({ value: i + 1, label: d.trim(), icon: <AppleTvIcon /> as React.ReactNode }))
				.filter((o) => o.label.length > 0)}
			optionType='device'
			disableSelect={props.DisableSelect}
			locked={props.DisableSelect}
		/>
	),
	pin: 1,
});

export default AppleTvSelectCard;
