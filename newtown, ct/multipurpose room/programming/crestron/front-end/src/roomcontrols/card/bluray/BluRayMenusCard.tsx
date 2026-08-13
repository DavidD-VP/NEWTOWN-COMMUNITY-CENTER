import * as React from 'react';
import ButtonGroupCard from '../../component/ButtonGroupCard';
import { ctBtn } from '../ctCardStyles';
import { CardProps } from '../Card';
import type { BluRayRemoteProps } from './bluRayRemoteProps';
import MenuIcon from '@mui/icons-material/Menu';
import HomeIcon from '@mui/icons-material/Home';
import VerticalAlignTopIcon from '@mui/icons-material/VerticalAlignTop';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import CloseIcon from '@mui/icons-material/Close';
import TuneIcon from '@mui/icons-material/Tune';
import KeyboardReturnIcon from '@mui/icons-material/KeyboardReturn';
import StarIcon from '@mui/icons-material/Star';

const BluRayMenusCard = (props: BluRayRemoteProps): CardProps | null =>
ButtonGroupCard({
label: 'Menus',
cardIcon: <MenuIcon />,
buttons: [
{ key: 'bluray-home-menu', signal: props.HomeMenu, children: ctBtn(<HomeIcon />, 'Home') },
{ key: 'bluray-top-menu', signal: props.TopMenu, children: ctBtn(<VerticalAlignTopIcon />, 'Top') },
{ key: 'bluray-main-menu', signal: props.MainMenu, children: ctBtn(<MenuIcon />, 'Main') },
{ key: 'bluray-popup-menu', signal: props.PopupMenu, children: ctBtn(<OpenInNewIcon />, 'Popup') },
{ key: 'bluray-return', signal: props.Return, children: ctBtn(<KeyboardReturnIcon />, 'Return') },
{ key: 'bluray-exit', signal: props.Exit, children: ctBtn(<CloseIcon />, 'Exit') },
{ key: 'bluray-options', signal: props.Options, children: ctBtn(<TuneIcon />, 'Options') },
{ key: 'bluray-favorites', signal: props.Favorites, children: ctBtn(<StarIcon />, 'Favorites') },
],
});

export default BluRayMenusCard;