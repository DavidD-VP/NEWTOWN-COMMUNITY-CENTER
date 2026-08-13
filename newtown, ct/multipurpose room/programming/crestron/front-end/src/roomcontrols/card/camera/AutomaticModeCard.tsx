import React from 'react';
import { Box } from '@mui/material';
import AutoModeIcon from '@mui/icons-material/AutoMode';
import TouchAppIcon from '@mui/icons-material/TouchApp';

import { CardProps } from '../Card';
import { ctBtn } from '../ctCardStyles';
import {
	sxCtrlBtn,
	ctrlBtnIconSize,
	overlayButtonContainedColor,
	sxCardBtnSlot,
} from '../../theme/tokens';
import CrestronButton from '../../component/CrestronButton';
import SelectCard from '../../component/SelectCard';
import type { CameraOption } from './types';

// ── Types ─────────────────────────────────────────────────────────────────────

export type AutomaticModeCardProps = {
	select: {
		signal: string;
		options: CameraOption[];
	};
	/** When defined, renders an "Auto" toggle button that switches to automatic mode. */
	automaticSignal?: string;
	/** When defined, renders a "Manual" toggle button that switches to manual mode. */
	manualSignal?: string;
};

// ── Shared sx ────────────────────────────────────────────────────────────────

const btnSx = {
	...sxCtrlBtn,
	'&.MuiButton-outlined': {
		...sxCtrlBtn['&.MuiButton-outlined'],
		'& .MuiSvgIcon-root': { fontSize: ctrlBtnIconSize, color: '#fff' },
	},
	'&.MuiButton-contained': {
		...sxCtrlBtn['&.MuiButton-contained'],
		'& .MuiSvgIcon-root': { fontSize: ctrlBtnIconSize, color: overlayButtonContainedColor },
	},
} as const;

// ── Public API ────────────────────────────────────────────────────────────────

const AutomaticModeCard = (props: AutomaticModeCardProps): CardProps => {
	const options = props.select.options
		.filter((o) => o.Label)
		.map((o) => ({ value: o.Value, label: o.Label, icon: <AutoModeIcon /> as React.ReactNode, preview: o.Preview }));

	const additionalButtons: React.ReactNode[] | undefined = (() => {
		const btns: React.ReactNode[] = [
			...(props.automaticSignal ? [
				<Box
					key='automaticmodecard-automatic'
					onClick={(e) => e.stopPropagation()}
					onPointerDown={(e) => e.stopPropagation()}
					sx={sxCardBtnSlot}
				>
					<CrestronButton
						signal={props.automaticSignal}
						ButtonProps={{ sx: btnSx, children: ctBtn(<AutoModeIcon />, 'Automatic') }}
					/>
				</Box>,
			] : []),
			...(props.manualSignal ? [
				<Box
					key='automaticmodecard-manual'
					onClick={(e) => e.stopPropagation()}
					onPointerDown={(e) => e.stopPropagation()}
					sx={sxCardBtnSlot}
				>
					<CrestronButton
						signal={props.manualSignal}
						ButtonProps={{ sx: btnSx, children: ctBtn(<TouchAppIcon />, 'Manual') }}
					/>
				</Box>,
			] : []),
		];
		return btns.length > 0 ? btns : undefined;
	})();

	return {
		label: 'Mode',
		children: (
			<Box sx={{ width: '100%', position: 'relative' }}>
				<SelectCard
					signal={props.select.signal}
					title='Mode'
					cardIcon={<AutoModeIcon />}
					options={options}
                    optionType='mode'
					additionalButtons={additionalButtons}
				/>
			</Box>
		),
	};
};

export default AutomaticModeCard;
