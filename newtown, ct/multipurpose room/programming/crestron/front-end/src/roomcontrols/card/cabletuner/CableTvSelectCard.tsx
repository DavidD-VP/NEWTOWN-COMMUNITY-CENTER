import React from 'react';

import SelectCard from '../../component/SelectCard';
import LiveTvIcon from '@mui/icons-material/LiveTv';
import { CardProps } from '../Card';

// ── Types ────────────────────────────────────────────────────────────

export type CableTvSelectCardProps = {
Select: string;
Devices: Array<string>;
DisableSelect?: boolean;
};

// ── Public API ───────────────────────────────────────────────────────

export const CableTvSelectCard = (props: CableTvSelectCardProps): CardProps => ({
label: 'Cable TV Tuner Selection',
children: (
<SelectCard
signal={props.Select}
title='Cable TV Tuner Selection'
cardIcon={<LiveTvIcon />}
options={props.Devices
.map((d, i) => ({ value: i + 1, label: d.trim(), icon: <LiveTvIcon /> as React.ReactNode }))
.filter((o) => o.label.length > 0)}
disableSelect={props.DisableSelect}
locked={props.DisableSelect}
optionType='device'
/>
),
pin: 1,
});

export default CableTvSelectCard;