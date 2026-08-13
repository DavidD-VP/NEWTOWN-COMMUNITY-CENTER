import * as React from 'react';
import ButtonGroupCard from '../../component/ButtonGroupCard';
import { ctBtn } from '../ctCardStyles';
import { CardProps } from '../Card';
import type { CableTvRemoteProps } from './cableTvRemoteProps';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import SkipPreviousIcon from '@mui/icons-material/SkipPrevious';
import LiveTvIcon from '@mui/icons-material/LiveTv';

const CableTvChannelCard = (props: CableTvRemoteProps): CardProps | null =>
ButtonGroupCard({
label: 'Channels',
title: 'Channel',
cardIcon: <LiveTvIcon />,
buttons: [
{ key: 'cabletv-ch-up', signal: props.ChannelUp, children: ctBtn(<KeyboardArrowUpIcon />, 'Up') },
{ key: 'cabletv-ch-down', signal: props.ChannelDown, children: ctBtn(<KeyboardArrowDownIcon />, 'Down') },
{ key: 'cabletv-prev-ch', signal: props.PreviousChannel, children: ctBtn(<SkipPreviousIcon />, 'Prev') },
{ key: 'cabletv-favorite', signal: props.Favorite, children: ctBtn(<LiveTvIcon />, 'Fav') },
],
});

export default CableTvChannelCard;