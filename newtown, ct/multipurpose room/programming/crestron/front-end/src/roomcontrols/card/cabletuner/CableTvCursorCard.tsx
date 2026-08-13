import * as React from 'react';
import ButtonGroupCard from '../../component/ButtonGroupCard';
import { ctBtn } from '../ctCardStyles';
import { CardProps } from '../Card';
import type { CableTvRemoteProps } from './cableTvRemoteProps';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowLeftIcon from '@mui/icons-material/KeyboardArrowLeft';
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';
import CheckIcon from '@mui/icons-material/Check';
import OpenWithIcon from '@mui/icons-material/OpenWith';

const CableTvCursorCard = (props: CableTvRemoteProps): CardProps | null =>
ButtonGroupCard({
label: 'Cursor',
cardIcon: <OpenWithIcon />,
buttons: [
{ key: 'cabletv-cur-up', signal: props.CursorUp, children: ctBtn(<KeyboardArrowUpIcon />, 'Up') },
{ key: 'cabletv-cur-down', signal: props.CursorDown, children: ctBtn(<KeyboardArrowDownIcon />, 'Down') },
{ key: 'cabletv-cur-left', signal: props.CursorLeft, children: ctBtn(<KeyboardArrowLeftIcon />, 'Left') },
{ key: 'cabletv-cur-right', signal: props.CursorRight, children: ctBtn(<KeyboardArrowRightIcon />, 'Right') },
{ key: 'cabletv-cur-enter', signal: props.CursorEnter, children: ctBtn(<CheckIcon />, 'OK') },
],
});

export default CableTvCursorCard;