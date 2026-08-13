import * as React from 'react';
import ButtonGroupCard from '../../component/ButtonGroupCard';
import { ctBtn } from '../ctCardStyles';
import { CardProps } from '../Card';
import type { BluRayRemoteProps } from './bluRayRemoteProps';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PauseIcon from '@mui/icons-material/Pause';
import StopIcon from '@mui/icons-material/Stop';
import FastRewindIcon from '@mui/icons-material/FastRewind';
import FastForwardIcon from '@mui/icons-material/FastForward';
import SkipPreviousIcon from '@mui/icons-material/SkipPrevious';
import SkipNextIcon from '@mui/icons-material/SkipNext';
import ReplayIcon from '@mui/icons-material/Replay';

const BluRayPlaybackCard = (props: BluRayRemoteProps): CardProps | null =>
ButtonGroupCard({
label: 'Playback',
cardIcon: <PlayArrowIcon />,
buttons: [
{ key: 'bluray-play', signal: props.Play, children: ctBtn(<PlayArrowIcon />, 'Play') },
{ key: 'bluray-pause', signal: props.Pause, children: ctBtn(<PauseIcon />, 'Pause') },
{ key: 'bluray-stop', signal: props.Stop, children: ctBtn(<StopIcon />, 'Stop') },
{ key: 'bluray-reverse', signal: props.Reverse, children: ctBtn(<FastRewindIcon />, 'Rew') },
{ key: 'bluray-forward', signal: props.Forward, children: ctBtn(<FastForwardIcon />, 'Fwd') },
{ key: 'bluray-previous', signal: props.Previous, children: ctBtn(<SkipPreviousIcon />, 'Prev') },
{ key: 'bluray-next', signal: props.Next, children: ctBtn(<SkipNextIcon />, 'Next') },
{ key: 'bluray-replay', signal: props.Replay, children: ctBtn(<ReplayIcon />, 'Replay') },
],
});

export default BluRayPlaybackCard;