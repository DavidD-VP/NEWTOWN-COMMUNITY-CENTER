import * as React from 'react';
import ButtonGroupCard from '../../component/ButtonGroupCard';
import { ctBtn } from '../ctCardStyles';
import { CardProps } from '../Card';
import type { CableTvRemoteProps } from './cableTvRemoteProps';
import PowerSettingsNewIcon from '@mui/icons-material/PowerSettingsNew';

const CableTvPowerCard = (props: CableTvRemoteProps): CardProps | null =>
ButtonGroupCard({
label: 'Power',
cardIcon: <PowerSettingsNewIcon />,
buttons: [
{ key: 'cabletv-power-on', signal: props.PowerOn, children: ctBtn(<PowerSettingsNewIcon />, 'On') },
{ key: 'cabletv-power-toggle', signal: props.PowerToggle, children: ctBtn(<PowerSettingsNewIcon />, 'Toggle') },
],
});

export default CableTvPowerCard;