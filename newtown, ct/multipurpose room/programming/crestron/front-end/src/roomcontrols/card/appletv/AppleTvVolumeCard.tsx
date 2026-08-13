import * as React from 'react';
import ButtonGroupCard from '../../component/ButtonGroupCard';
import { ctBtn } from '../ctCardStyles';
import { CardProps } from '../Card';
import type { AppleTvRemoteProps } from './appleTvRemoteProps';
import VolumeUpIcon from '@mui/icons-material/VolumeUp';
import VolumeDownIcon from '@mui/icons-material/VolumeDown';

const AppleTvVolumeCard = (props: AppleTvRemoteProps): CardProps | null =>
ButtonGroupCard({
label: 'Volume',
cardIcon: <VolumeUpIcon />,
buttons: [
{ key: 'appletv-vol-up', signal: props.VolumeUp, children: ctBtn(<VolumeUpIcon />, 'Increase') },
{ key: 'appletv-vol-down', signal: props.VolumeDown, children: ctBtn(<VolumeDownIcon />, 'Decrease') },
],
});

export default AppleTvVolumeCard;
