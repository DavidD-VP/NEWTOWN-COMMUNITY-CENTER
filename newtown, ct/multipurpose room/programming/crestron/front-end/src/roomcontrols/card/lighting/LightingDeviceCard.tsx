import * as React from 'react';
import MicIcon from '@mui/icons-material/Mic';
import MicOffIcon from '@mui/icons-material/MicOff';
import CampaignIcon from '@mui/icons-material/Campaign';
import VolumeOffIcon from '@mui/icons-material/VolumeOff';
import VolumeUpIcon from '@mui/icons-material/VolumeUp';
import HeadphonesIcon from '@mui/icons-material/Headphones';
import EarbudsIcon from '@mui/icons-material/Earbuds';
import TuneIcon from '@mui/icons-material/Tune';
import GraphicEqIcon from '@mui/icons-material/GraphicEq';
import VoicemailIcon from '@mui/icons-material/Voicemail';
import RadioIcon from '@mui/icons-material/Radio';
import LightIcon from '@mui/icons-material/Light';
import FlashlightOnIcon from '@mui/icons-material/FlashlightOn';
import FlashlightOffIcon from '@mui/icons-material/FlashlightOff';

import SliderCard from '../../component/SliderCard';
import { CrestronSliderProps } from '../../component/CrestronSlider';
import { CrestronButtonProps } from '../../component/CrestronButton';
import { CrestronBatteryIconProps } from '../../component/BatteryIcon';
import { CardProps } from '../Card';

export type LightingDeviceCardProps = {
    Label: string;
    BrightnessSliderProps?: CrestronSliderProps;
    MuteButtonProps?: CrestronButtonProps;
};

const LightingDeviceCard = (props: LightingDeviceCardProps): CardProps =>
    SliderCard({
        label: props.Label,
        cardIcon: <LightIcon />,
        mutedIcon: <FlashlightOffIcon />,
        unmutedIcon: <FlashlightOnIcon />,
        mutedLabel: 'Off',
        unmutedLabel: 'On',
        sliderProps: props.BrightnessSliderProps,
        muteButtonProps: props.MuteButtonProps,
    });

export default LightingDeviceCard;