import * as React from 'react';
import ButtonGroupCard from '../../component/ButtonGroupCard';
import { CardProps } from '../Card';
import type { BluRayRemoteProps } from './bluRayRemoteProps';
import DialpadIcon from '@mui/icons-material/Dialpad';

const BluRayKeypadCard = (props: BluRayRemoteProps): CardProps | null =>
ButtonGroupCard({
label: 'Keypad',
cardIcon: <DialpadIcon />,
buttons: [
{ key: 'bluray-d1', signal: props.Digit1, children: '1' },
{ key: 'bluray-d2', signal: props.Digit2, children: '2' },
{ key: 'bluray-d3', signal: props.Digit3, children: '3' },
{ key: 'bluray-d4', signal: props.Digit4, children: '4' },
{ key: 'bluray-d5', signal: props.Digit5, children: '5' },
{ key: 'bluray-d6', signal: props.Digit6, children: '6' },
{ key: 'bluray-d7', signal: props.Digit7, children: '7' },
{ key: 'bluray-d8', signal: props.Digit8, children: '8' },
{ key: 'bluray-d9', signal: props.Digit9, children: '9' },
{ key: 'bluray-d0', signal: props.Digit0, children: '0' },
],
});

export default BluRayKeypadCard;