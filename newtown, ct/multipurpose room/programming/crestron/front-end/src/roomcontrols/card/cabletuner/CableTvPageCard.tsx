import * as React from 'react';
import ButtonGroupCard from '../../component/ButtonGroupCard';
import { ctBtn } from '../ctCardStyles';
import { CardProps } from '../Card';
import type { CableTvRemoteProps } from './cableTvRemoteProps';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';

const CableTvPageCard = (props: CableTvRemoteProps): CardProps | null =>
ButtonGroupCard({
label: 'Pages',
title: 'Page',
cardIcon: <MenuBookIcon />,
buttons: [
{ key: 'cabletv-pg-up', signal: props.PageUp, children: ctBtn(<KeyboardArrowUpIcon />, 'Up') },
{ key: 'cabletv-pg-down', signal: props.PageDown, children: ctBtn(<KeyboardArrowDownIcon />, 'Down') },
],
});

export default CableTvPageCard;