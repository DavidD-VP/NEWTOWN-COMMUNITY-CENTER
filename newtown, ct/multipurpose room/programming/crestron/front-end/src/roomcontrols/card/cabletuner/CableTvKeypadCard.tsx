import * as React from 'react';
import ButtonGroupCard from '../../component/ButtonGroupCard';
import { ctBtn } from '../ctCardStyles';
import { CardProps } from '../Card';
import type { CableTvRemoteProps } from './cableTvRemoteProps';
import DialpadIcon from '@mui/icons-material/Dialpad';
import KeyboardReturnIcon from '@mui/icons-material/KeyboardReturn';

const CableTvKeypadCard = (props: CableTvRemoteProps): CardProps | null =>
ButtonGroupCard({
label: 'Keypad',
cardIcon: <DialpadIcon />,
buttons: [
{ key: 'cabletv-d1', signal: props.Digit1, children: '1' },
{ key: 'cabletv-d2', signal: props.Digit2, children: '2' },
{ key: 'cabletv-d3', signal: props.Digit3, children: '3' },
{ key: 'cabletv-d4', signal: props.Digit4, children: '4' },
{ key: 'cabletv-d5', signal: props.Digit5, children: '5' },
{ key: 'cabletv-d6', signal: props.Digit6, children: '6' },
{ key: 'cabletv-d7', signal: props.Digit7, children: '7' },
{ key: 'cabletv-d8', signal: props.Digit8, children: '8' },
{ key: 'cabletv-d9', signal: props.Digit9, children: '9' },
{ key: 'cabletv-d0', signal: props.Digit0, children: '0' },
{ key: 'cabletv-enter', signal: props.Enter, children: ctBtn(<KeyboardReturnIcon />, 'Enter') },
],
});

export default CableTvKeypadCard;