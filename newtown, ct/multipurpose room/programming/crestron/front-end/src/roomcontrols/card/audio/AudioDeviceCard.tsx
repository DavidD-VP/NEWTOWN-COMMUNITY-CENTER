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
import CallIcon from '@mui/icons-material/Call';
import PhoneDisabledIcon from '@mui/icons-material/PhoneDisabled';
import HeadsetOffIcon from '@mui/icons-material/HeadsetOff';
import VideocamIcon from '@mui/icons-material/Videocam';
import VideocamOffIcon from '@mui/icons-material/VideocamOff';

import SliderCard from '../../component/SliderCard';
import { CrestronSliderProps } from '../../component/CrestronSlider';
import { CrestronButtonProps } from '../../component/CrestronButton';
import { CrestronBatteryIconProps } from '../../component/BatteryIcon';
import { CardProps } from '../Card';

export type AudioDeviceCardProps = {
    Type:
    | 'Microphone'
    | 'Speaker'
    | 'Headphone'
    | 'Earbud'
    | 'Mixer'
    | 'Amplifier'
    | 'Recorder'
    | 'Radio'
    | 'Call'
    | 'Camera';
    Label: string;
    BatteryIconProps?: CrestronBatteryIconProps;
    VolumeSliderProps?: CrestronSliderProps;
    MuteButtonProps?: CrestronButtonProps;
};

// GetAudioDeviceType has moved to ./typeHelpers. It is intentionally
// NOT re-exported from here so this heavy card module stays out of
// App.tsx's static dep graph.

function deviceIcon(type: AudioDeviceCardProps['Type']): React.ReactNode {
    switch (type) {
        case 'Microphone': return <MicIcon />;
        case 'Speaker': return <CampaignIcon />;
        case 'Headphone': return <HeadphonesIcon />;
        case 'Earbud': return <EarbudsIcon />;
        case 'Mixer': return <TuneIcon />;
        case 'Amplifier': return <GraphicEqIcon />;
        case 'Recorder': return <VoicemailIcon />;
        case 'Radio': return <RadioIcon />;
        case 'Call': return <CallIcon />;
        case 'Camera': return <VideocamIcon />;
    }
}

function mutedIcon(type: AudioDeviceCardProps['Type']): React.ReactNode {
    switch (type) {
        case 'Microphone': return <MicOffIcon />;
        case 'Speaker': return <VolumeOffIcon />;
        case 'Headphone': return <HeadsetOffIcon />;
        case 'Earbud': return <HeadsetOffIcon />;
        case 'Mixer': return <VolumeOffIcon />;
        case 'Amplifier': return <VolumeOffIcon />;
        case 'Recorder': return <MicOffIcon />;
        case 'Radio': return <VolumeOffIcon />;
        case 'Call': return <PhoneDisabledIcon />;
        case 'Camera': return <VideocamOffIcon />;
    }
}

function unmutedIcon(type: AudioDeviceCardProps['Type']): React.ReactNode {
    switch (type) {
        case 'Microphone': return <MicIcon />;
        case 'Speaker': return <CampaignIcon />;
        case 'Headphone': return <HeadphonesIcon />;
        case 'Earbud': return <HeadphonesIcon />;
        case 'Mixer': return <CampaignIcon />;
        case 'Amplifier': return <CampaignIcon />;
        case 'Recorder': return <MicIcon />;
        case 'Radio': return <CampaignIcon />;
        case 'Call': return <CallIcon />;
        case 'Camera': return <VideocamIcon />;
    }
}

const AudioDeviceCard = (props: AudioDeviceCardProps): CardProps =>
    SliderCard({
        label: props.Label,
        cardIcon: deviceIcon(props.Type),
        mutedIcon: mutedIcon(props.Type),
        unmutedIcon: unmutedIcon(props.Type),
        mutedLabel: 'Mute',
        unmutedLabel: 'Mute',
        sliderProps: props.VolumeSliderProps,
        muteButtonProps: props.MuteButtonProps,
        batteryIconProps: props.BatteryIconProps,
    });

export default AudioDeviceCard;