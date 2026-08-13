import * as React from 'react';
import ButtonGroupCard from '../../component/ButtonGroupCard';
import { ctBtn } from '../ctCardStyles';
import { CardProps } from '../Card';
import type { CableTvRemoteProps } from './cableTvRemoteProps';
import AppsIcon from '@mui/icons-material/Apps';
import MenuIcon from '@mui/icons-material/Menu';
import VideoLibraryIcon from '@mui/icons-material/VideoLibrary';
import ListIcon from '@mui/icons-material/List';
import PictureInPictureAltIcon from '@mui/icons-material/PictureInPictureAlt';
import TuneIcon from '@mui/icons-material/Tune';
import CloseIcon from '@mui/icons-material/Close';
import InfoOutlineIcon from '@mui/icons-material/InfoOutlined';
import OndemandVideoIcon from '@mui/icons-material/OndemandVideo';

const CableTvMenusCard = (props: CableTvRemoteProps): CardProps | null =>
ButtonGroupCard({
label: 'Menus',
cardIcon: <AppsIcon />,
buttons: [
{ key: 'cabletuner-guide', signal: props.Guide, children: ctBtn(<ListIcon />, 'Guide') },
{ key: 'cabletv-apps', signal: props.Apps, children: ctBtn(<AppsIcon />, 'Apps') },
{ key: 'cabletv-main-menu', signal: props.MainMenu, children: ctBtn(<MenuIcon />, 'Main') },
{ key: 'cabletv-dvr-menu', signal: props.DvrMenu, children: ctBtn(<VideoLibraryIcon />, 'DVR') },
{ key: 'cabletv-pip-menu', signal: props.PipMenu, children: ctBtn(<PictureInPictureAltIcon />, 'PIP') },
{ key: 'cabletv-options', signal: props.Options, children: ctBtn(<TuneIcon />, 'Options') },
{ key: 'cabletuner-exit', signal: props.Exit, children: ctBtn(<CloseIcon />, 'Exit') },
{ key: 'cabletuner-info', signal: props.Info, children: ctBtn(<InfoOutlineIcon />, 'Info') },
{ key: 'cabletv-vod', signal: props.VideoOnDemand, children: ctBtn(<OndemandVideoIcon />, 'VOD') },
],
});

export default CableTvMenusCard;