import * as React from 'react';
import ButtonGroupCard from '../../component/ButtonGroupCard';
import { ctBtn } from '../ctCardStyles';
import { CardProps } from '../Card';
import type { BluRayRemoteProps } from './bluRayRemoteProps';
import VolumeUpIcon from '@mui/icons-material/VolumeUp';
import VolumeDownIcon from '@mui/icons-material/VolumeDown';
import VolumeMuteIcon from '@mui/icons-material/VolumeOff';

const BluRayVolumeCard = (props: BluRayRemoteProps): CardProps | null =>
ButtonGroupCard({
label: 'Volume',
cardIcon: <VolumeUpIcon />,
buttons: [
{ key: 'bluray-vol-up', signal: props.VolumeUp, children: ctBtn(<VolumeUpIcon />, 'Increase') },
{ key: 'bluray-vol-down', signal: props.VolumeDown, children: ctBtn(<VolumeDownIcon />, 'Decrease') },
{ key: 'bluray-vol-mute', signal: props.VolumeMute, children: ctBtn(<VolumeMuteIcon />, 'Mute') },
],
});

export default BluRayVolumeCard;