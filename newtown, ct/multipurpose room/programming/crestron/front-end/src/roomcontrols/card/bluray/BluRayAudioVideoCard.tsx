import * as React from 'react';
import ButtonGroupCard from '../../component/ButtonGroupCard';
import { ctBtn } from '../ctCardStyles';
import { CardProps } from '../Card';
import type { BluRayRemoteProps } from './bluRayRemoteProps';
import AudiotrackIcon from '@mui/icons-material/Audiotrack';
import SubtitlesIcon from '@mui/icons-material/Subtitles';
import TvIcon from '@mui/icons-material/Tv';
import SettingsIcon from '@mui/icons-material/Settings';
import TheaterComedyIcon from '@mui/icons-material/TheaterComedy';

const BluRayAudioVideoCard = (props: BluRayRemoteProps): CardProps | null =>
ButtonGroupCard({
label: 'Audio / Video',
cardIcon: <AudiotrackIcon />,
buttons: [
{ key: 'bluray-audio', signal: props.Audio, children: ctBtn(<AudiotrackIcon />, 'Audio') },
{ key: 'bluray-subtitle', signal: props.Subtitle, children: ctBtn(<SubtitlesIcon />, 'Subtitle') },
{ key: 'bluray-display', signal: props.Display, children: ctBtn(<TvIcon />, 'Display') },
{ key: 'bluray-theater', signal: props.Theater, children: ctBtn(<TheaterComedyIcon />, 'Theater') },
{ key: 'bluray-advanced', signal: props.Advanced, children: ctBtn(<SettingsIcon />, 'Advanced') },
],
});

export default BluRayAudioVideoCard;