import * as React from 'react';
import ButtonGroupCard from '../../component/ButtonGroupCard';
import { ctBtn } from '../ctCardStyles';
import { CardProps } from '../Card';
import type { AppleTvRemoteProps } from './appleTvRemoteProps';
import OpenWithIcon from '@mui/icons-material/OpenWith';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowLeftIcon from '@mui/icons-material/KeyboardArrowLeft';
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';
import CheckIcon from '@mui/icons-material/Check';

const AppleTvCursorCard = (props: AppleTvRemoteProps): CardProps | null =>
ButtonGroupCard({
label: 'Cursor',
cardIcon: <OpenWithIcon />,
buttons: [
{ key: 'appletv-cur-up', signal: props.CursorUp, children: ctBtn(<KeyboardArrowUpIcon />, 'Up') },
{ key: 'appletv-cur-down', signal: props.CursorDown, children: ctBtn(<KeyboardArrowDownIcon />, 'Down') },
{ key: 'appletv-cur-left', signal: props.CursorLeft, children: ctBtn(<KeyboardArrowLeftIcon />, 'Left') },
{ key: 'appletv-cur-right', signal: props.CursorRight, children: ctBtn(<KeyboardArrowRightIcon />, 'Right') },
{ key: 'appletv-cur-enter', signal: props.CursorEnter, children: ctBtn(<CheckIcon />, 'OK') },
],
});

export default AppleTvCursorCard;
