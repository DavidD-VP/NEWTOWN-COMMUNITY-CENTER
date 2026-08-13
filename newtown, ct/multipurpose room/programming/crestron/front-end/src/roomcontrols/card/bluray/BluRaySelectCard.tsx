import React from 'react';

import SelectCard from '../../component/SelectCard';
import AlbumIcon from '@mui/icons-material/Album';
import { CardProps } from '../Card';

// ── Types ────────────────────────────────────────────────────────────

export type BluRaySelectCardProps = {
Select: string;
Devices: Array<string>;
DisableSelect?: boolean;
};

// ── Public API ───────────────────────────────────────────────────────

export const BluRaySelectCard = (props: BluRaySelectCardProps): CardProps => ({
label: 'Blu-ray Player Selection',
children: (
<SelectCard
signal={props.Select}
title='Blu-ray Player Selection'
cardIcon={<AlbumIcon />}
options={props.Devices
.map((d, i) => ({ value: i + 1, label: d.trim(), icon: <AlbumIcon /> as React.ReactNode }))
.filter((o) => o.label.length > 0)}
optionType='device'
disableSelect={props.DisableSelect}
locked={props.DisableSelect}
/>
),
pin: 1,
});

export default BluRaySelectCard;