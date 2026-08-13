import * as React from 'react';
import ButtonGroupCard from '../../component/ButtonGroupCard';
import { ctBtn } from '../ctCardStyles';
import { CardProps } from '../Card';
import type { CableTvRemoteProps } from './cableTvRemoteProps';
import PictureInPictureAltIcon from '@mui/icons-material/PictureInPictureAlt';
import CropFreeIcon from '@mui/icons-material/CropFree';
import SwapHorizIcon from '@mui/icons-material/SwapHoriz';

const CableTvPIPCard = (props: CableTvRemoteProps): CardProps | null =>
ButtonGroupCard({
label: 'PIP',
cardIcon: <PictureInPictureAltIcon />,
buttons: [
{ key: 'cabletv-pip', signal: props.Pip, children: ctBtn(<PictureInPictureAltIcon />, 'PIP') },
{ key: 'cabletv-pip-pos', signal: props.PipPosition, children: ctBtn(<CropFreeIcon />, 'Position') },
{ key: 'cabletv-pip-swap', signal: props.PipSwap, children: ctBtn(<SwapHorizIcon />, 'Swap') },
],
});

export default CableTvPIPCard;