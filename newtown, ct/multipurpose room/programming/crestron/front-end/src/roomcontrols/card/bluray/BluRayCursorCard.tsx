import * as React from 'react';
import ButtonGroupCard from '../../component/ButtonGroupCard';
import { ctBtn } from '../ctCardStyles';
import { CardProps } from '../Card';
import type { BluRayRemoteProps } from './bluRayRemoteProps';
import OpenWithIcon from '@mui/icons-material/OpenWith';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowLeftIcon from '@mui/icons-material/KeyboardArrowLeft';
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';
import CheckIcon from '@mui/icons-material/Check';

const BluRayCursorCard = (props: BluRayRemoteProps): CardProps | null =>
ButtonGroupCard({
label: 'Cursor',
cardIcon: <OpenWithIcon />,
buttons: [
{ key: 'bluray-cur-up', signal: props.CursorUp, children: ctBtn(<KeyboardArrowUpIcon />, 'Up') },
{ key: 'bluray-cur-down', signal: props.CursorDown, children: ctBtn(<KeyboardArrowDownIcon />, 'Down') },
{ key: 'bluray-cur-left', signal: props.CursorLeft, children: ctBtn(<KeyboardArrowLeftIcon />, 'Left') },
{ key: 'bluray-cur-right', signal: props.CursorRight, children: ctBtn(<KeyboardArrowRightIcon />, 'Right') },
{ key: 'bluray-cur-enter', signal: props.CursorEnter, children: ctBtn(<CheckIcon />, 'OK') },
],
});

export default BluRayCursorCard;