import * as React from 'react';
import BrightnessAutoIcon from '@mui/icons-material/BrightnessAuto';
import Brightness1Icon from '@mui/icons-material/Brightness1';
import Brightness2Icon from '@mui/icons-material/Brightness2';
import Brightness3Icon from '@mui/icons-material/Brightness3';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness5Icon from '@mui/icons-material/Brightness5';
import Brightness6Icon from '@mui/icons-material/Brightness6';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import type { LightingPresetOption } from './LightingPresetCard';

export function GetLightingPresetIconType(
	type: number,
): LightingPresetOption['Icon'] {
	switch (type) {
		case 0: return <BrightnessAutoIcon />;
		case 1: return <Brightness1Icon />;
		case 2: return <Brightness2Icon />;
		case 3: return <Brightness3Icon />;
		case 4: return <Brightness4Icon />;
		case 5: return <Brightness5Icon />;
		case 6: return <Brightness6Icon />;
		case 7: return <Brightness7Icon />;
		default: return undefined;
	}
}
