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

import SliderCard from '../../component/SliderCard';
import { CrestronSliderProps } from '../../component/CrestronSlider';
import { CrestronButtonProps } from '../../component/CrestronButton';
import { CrestronBatteryIconProps } from '../../component/BatteryIcon';
import { CardProps } from '../Card';

import ButtonGroupCard from '../../component/ButtonGroupCard';

import RollerShadesIcon from '@mui/icons-material/RollerShades';
import RollerShadesClosedIcon from '@mui/icons-material/RollerShadesClosed';
import VerticalShadesIcon from '@mui/icons-material/VerticalShades';
import VerticalShadesClosedIcon from '@mui/icons-material/VerticalShadesClosed';
import WbShadeIcon from '@mui/icons-material/WbShade';
import BlindsIcon from '@mui/icons-material/Blinds';
import BlindsClosedIcon from '@mui/icons-material/BlindsClosed';
import CurtainsIcon from '@mui/icons-material/Curtains';
import CurtainsClosedIcon from '@mui/icons-material/CurtainsClosed';
import { ctBtn } from '../ctCardStyles';

import OpenInFullIcon from '@mui/icons-material/OpenInFull';
import CloseFullscreenIcon from '@mui/icons-material/CloseFullscreen';
import StopIcon from '@mui/icons-material/Stop';

export type ShadeDeviceCardProps = {
    Label: string;
    /** Optional icon shown in the selection list. Defaults to a bullet. */
    Icon?: React.ReactNode;
    Open: string,
    Close: string,
    Stop?: string,
};

export function deviceIcon(type: number): React.ReactNode {
    switch (type) {
        case 1: return <RollerShadesIcon />;
        case 2: return <RollerShadesClosedIcon />;
        case 3: return <VerticalShadesIcon />;
        case 4: return <VerticalShadesClosedIcon />;
        case 5: return <WbShadeIcon />;
        case 6: return <BlindsIcon />;
        case 7: return <BlindsClosedIcon />;
        case 8: return <CurtainsIcon />;
        case 9: return <CurtainsClosedIcon />
        default: return <RollerShadesIcon />;
    }
}

const ShadeDeviceCard = (props: ShadeDeviceCardProps): CardProps | null =>
    ButtonGroupCard({
        label: props.Label,
        cardIcon: props.Icon || deviceIcon(1),
        buttons: [
            {
                key: 'shade-open',
                signal: props.Open,
                children: ctBtn(<OpenInFullIcon />,'Open'),
            },
            {
                key: 'shade-close',
                signal: props.Close,
                children: ctBtn(<CloseFullscreenIcon />,'Close'),
            },
            {
                key: 'shade-stop',
                signal: props.Stop,
                children: ctBtn(<StopIcon />,'Stop'),
            }
        ],
    });

export default ShadeDeviceCard;