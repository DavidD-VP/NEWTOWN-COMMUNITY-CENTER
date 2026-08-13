import * as React from 'react';
import ButtonGroupCard from '../../component/ButtonGroupCard';
import { ctBtn } from '../ctCardStyles';
import { CardProps } from '../Card';
import type { CableTvRemoteProps } from './cableTvRemoteProps';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import FormatSizeIcon from '@mui/icons-material/FormatSize';
import SearchIcon from '@mui/icons-material/Search';
import InfoOutlineIcon from '@mui/icons-material/InfoOutlined';

const CableTvInfoCard = (props: CableTvRemoteProps): CardProps | null =>
ButtonGroupCard({
label: 'Info / Functions',
title: 'Info',
cardIcon: <HelpOutlineIcon />,
buttons: [
{ key: 'cabletv-help', signal: props.Help, children: ctBtn(<HelpOutlineIcon />, 'Help') },
{ key: 'cabletv-search', signal: props.Search, children: ctBtn(<SearchIcon />, 'Search') },
{ key: 'cabletv-system-info', signal: props.SystemInfo, children: ctBtn(<InfoOutlineIcon />, 'System') },
{ key: 'cabletv-format-scroll', signal: props.FormatScroll, children: ctBtn(<FormatSizeIcon />, 'Format') },
],
});

export default CableTvInfoCard;