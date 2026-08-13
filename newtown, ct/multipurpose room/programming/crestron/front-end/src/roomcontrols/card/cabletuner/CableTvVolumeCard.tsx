import * as React from 'react';
import ButtonGroupCard from '../../component/ButtonGroupCard';
import { ctBtn } from '../ctCardStyles';
import { CardProps } from '../Card';
import type { CableTvRemoteProps } from './cableTvRemoteProps';
import VolumeUpIcon from '@mui/icons-material/VolumeUp';
import VolumeDownIcon from '@mui/icons-material/VolumeDown';
import VolumeMuteIcon from '@mui/icons-material/VolumeOff';

const CableTvVolumeCard = (props: CableTvRemoteProps): CardProps | null =>
ButtonGroupCard({
label: 'Volume',
cardIcon: <VolumeUpIcon />,
buttons: [
{ key: 'cabletv-vol-up', signal: props.VolumeUp, children: ctBtn(<VolumeUpIcon />, 'Increase') },
{ key: 'cabletv-vol-down', signal: props.VolumeDown, children: ctBtn(<VolumeDownIcon />, 'Decrease') },
{ key: 'cabletv-vol-mute', signal: props.VolumeMute, children: ctBtn(<VolumeMuteIcon />, 'Mute') },
],
});

export default CableTvVolumeCard;