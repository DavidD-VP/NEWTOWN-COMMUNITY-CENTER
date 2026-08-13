import * as React from 'react';
import ButtonGroupCard from '../../component/ButtonGroupCard';
import { ctBtn } from '../ctCardStyles';
import { CardProps } from '../Card';
import type { CableTvRemoteProps } from './cableTvRemoteProps';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PauseIcon from '@mui/icons-material/Pause';
import StopIcon from '@mui/icons-material/Stop';
import FastRewindIcon from '@mui/icons-material/FastRewind';
import FastForwardIcon from '@mui/icons-material/FastForward';
import ReplayIcon from '@mui/icons-material/Replay';
import SkipNextIcon from '@mui/icons-material/SkipNext';
import FiberManualRecordIcon from '@mui/icons-material/FiberManualRecord';
import LiveTvIcon from '@mui/icons-material/LiveTv';

const CableTvPlaybackCard = (props: CableTvRemoteProps): CardProps | null =>
ButtonGroupCard({
label: 'Playback',
cardIcon: <PlayArrowIcon />,
buttons: [
{ key: 'cabletv-play', signal: props.Play, children: ctBtn(<PlayArrowIcon />, 'Play') },
{ key: 'cabletv-pause', signal: props.Pause, children: ctBtn(<PauseIcon />, 'Pause') },
{ key: 'cabletv-stop', signal: props.Stop, children: ctBtn(<StopIcon />, 'Stop') },
{ key: 'cabletv-reverse', signal: props.Reverse, children: ctBtn(<FastRewindIcon />, 'Rew') },
{ key: 'cabletv-forward', signal: props.Forward, children: ctBtn(<FastForwardIcon />, 'Fwd') },
{ key: 'cabletv-replay', signal: props.Replay, children: ctBtn(<ReplayIcon />, 'Replay') },
{ key: 'cabletv-skip', signal: props.Skip, children: ctBtn(<SkipNextIcon />, 'Skip') },
{ key: 'cabletv-record', signal: props.Record, children: ctBtn(<FiberManualRecordIcon />, 'Rec') },
{ key: 'cabletv-live', signal: props.Live, children: ctBtn(<LiveTvIcon />, 'Live') },
],
});

export default CableTvPlaybackCard;