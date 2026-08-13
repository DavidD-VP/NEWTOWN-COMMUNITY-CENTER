import * as React from 'react';
import ButtonGroupCard from '../../component/ButtonGroupCard';
import { ctBtn } from '../ctCardStyles';
import { CardProps } from '../Card';
import type { CableTvRemoteProps } from './cableTvRemoteProps';
import CircleIcon from '@mui/icons-material/Circle';
import PaletteIcon from '@mui/icons-material/Palette';

const CableTvFunctionsCard = (props: CableTvRemoteProps): CardProps | null =>
ButtonGroupCard({
label: 'Functions',
cardIcon: <PaletteIcon />,
buttons: [
{ key: 'cabletv-fn-red', signal: props.FunctionRed, children: ctBtn(<CircleIcon sx={{ color: '#ef5350' }} />, 'Red') },
{ key: 'cabletv-fn-green', signal: props.FunctionGreen, children: ctBtn(<CircleIcon sx={{ color: '#66bb6a' }} />, 'Green') },
{ key: 'cabletv-fn-yellow', signal: props.FunctionYellow, children: ctBtn(<CircleIcon sx={{ color: '#ffca28' }} />, 'Yellow') },
{ key: 'cabletv-fn-blue', signal: props.FunctionBlue, children: ctBtn(<CircleIcon sx={{ color: '#42a5f5' }} />, 'Blue') },
],
});

export default CableTvFunctionsCard;