import * as React from 'react';
import ButtonGroupCard from '../../component/ButtonGroupCard';
import { ctBtn } from '../ctCardStyles';
import { CardProps } from '../Card';
import type { AppleTvRemoteProps } from './appleTvRemoteProps';
import PlayCircleIcon from '@mui/icons-material/PlayCircle';
import MenuIcon from '@mui/icons-material/Menu';
import SkipNextIcon from '@mui/icons-material/SkipNext';
import SkipPreviousIcon from '@mui/icons-material/SkipPrevious';

const AppleTvMediaCard = (props: AppleTvRemoteProps): CardProps | null =>
ButtonGroupCard({
label: 'Media',
cardIcon: <PlayCircleIcon />,
buttons: [
{ key: 'appletv-menu', signal: props.Menu, children: ctBtn(<MenuIcon />, 'Menu') },
{ key: 'appletv-play-pause', signal: props.PlayPause, children: ctBtn(<PlayCircleIcon />, 'Play/Pause') },
{ key: 'appletv-track-previous', signal: props.TrackPrevious, children: ctBtn(<SkipPreviousIcon />, 'Previous') },
{ key: 'appletv-track-next', signal: props.TrackNext, children: ctBtn(<SkipNextIcon />, 'Next') },
],
});

export default AppleTvMediaCard;
