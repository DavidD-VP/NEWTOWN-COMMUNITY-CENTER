import * as React from 'react';
import ButtonGroupCard from '../../component/ButtonGroupCard';
import { ctBtn } from '../ctCardStyles';
import { CardProps } from '../Card';
import type { BluRayRemoteProps } from './bluRayRemoteProps';
import AlbumIcon from '@mui/icons-material/Album';
import EjectIcon from '@mui/icons-material/Eject';

const BluRayDiscCard = (props: BluRayRemoteProps): CardProps | null =>
ButtonGroupCard({
label: 'Disc',
cardIcon: <AlbumIcon />,
buttons: [
{ key: 'bluray-eject', signal: props.Eject, children: ctBtn(<EjectIcon />, 'Eject') },
],
});

export default BluRayDiscCard;
