import * as React from 'react';
import ButtonGroupCard from '../../component/ButtonGroupCard';
import { ctBtn } from '../ctCardStyles';
import { CardProps } from '../Card';
import type { BluRayRemoteProps } from './bluRayRemoteProps';
import PowerSettingsNewIcon from '@mui/icons-material/PowerSettingsNew';

const BluRayPowerCard = (props: BluRayRemoteProps): CardProps | null =>
ButtonGroupCard({
label: 'Power',
cardIcon: <PowerSettingsNewIcon />,
buttons: [
{ key: 'bluray-power-toggle', signal: props.PowerToggle, children: ctBtn(<PowerSettingsNewIcon />, 'Toggle') },
],
});

export default BluRayPowerCard;