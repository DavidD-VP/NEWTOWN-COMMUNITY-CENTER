import * as React from 'react';
import ButtonGroupCard from '../../component/ButtonGroupCard';
import { ctBtn } from '../ctCardStyles';
import { CardProps } from '../Card';
import type { BluRayRemoteProps } from './bluRayRemoteProps';
import PaletteIcon from '@mui/icons-material/Palette';
import CircleIcon from '@mui/icons-material/Circle';

const BluRayFunctionsCard = (props: BluRayRemoteProps): CardProps | null =>
ButtonGroupCard({
label: 'Functions',
cardIcon: <PaletteIcon />,
buttons: [
{ key: 'bluray-fn-red', signal: props.FunctionRed, children: ctBtn(<CircleIcon sx={{ color: '#ef5350' }} />, 'Red') },
{ key: 'bluray-fn-green', signal: props.FunctionGreen, children: ctBtn(<CircleIcon sx={{ color: '#66bb6a' }} />, 'Green') },
{ key: 'bluray-fn-yellow', signal: props.FunctionYellow, children: ctBtn(<CircleIcon sx={{ color: '#ffca28' }} />, 'Yellow') },
{ key: 'bluray-fn-blue', signal: props.FunctionBlue, children: ctBtn(<CircleIcon sx={{ color: '#42a5f5' }} />, 'Blue') },
],
});

export default BluRayFunctionsCard;