import React from 'react';
import { Box, Typography } from '@mui/material';

import VideoCameraFrontIcon from '@mui/icons-material/VideoCameraFront';
import FullscreenIcon from '@mui/icons-material/Fullscreen';
import TvIcon from '@mui/icons-material/Tv';
import LocationOnIcon from '@mui/icons-material/LocationOn';

import { CardProps } from '../Card';
import { CardButtonGroup, ctBtn } from '../ctCardStyles';
import SelectCard from '../../component/SelectCard';
import {
	sxCardActive,
	sxCardBase,
	sxCardIcon,
	sxCardLabel,
	sxCtrlBtn,
	ctrlBtnIconSize,
	overlayButtonContainedColor,
	sxCardHeaderRow,
	sxCardBtnGroupSlot,
	sxCompoundCardInner,
} from '../../theme/tokens';

import CrestronButton from '../../component/CrestronButton';
import type { CameraOption } from './types';

import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import VideocamIcon from '@mui/icons-material/Videocam';
import VideocamOffIcon from '@mui/icons-material/VideocamOff';
import { useSignalStore } from '../../../crestron/CrComLib';

// ── Types ─────────────────────────────────────────────────────────────────────

export type SelfviewCardProps = {
	signal: string;
	location?: {
		select: {
			signal: string;
			options: CameraOption[];
		};
	};
	fullscreen?: {
		signal: string;
	};
	mute?: {
		signal: string;
	};
	monitor?: {
		select: {
			signal: string;
			options: CameraOption[];
		};
	};
};

// ── Inner component ───────────────────────────────────────────────────────────

const SelfviewCardInner: React.FC<SelfviewCardProps> = (props) => {
    const isOn = useSignalStore((s) => s.booleans[props.signal] ?? false);
	const isMuted = useSignalStore((s) => s.booleans[props.mute?.signal ?? ''] ?? false);

	const locationSelectOptions = (props.location?.select.options.filter((o) => o.Label) ?? [])
		.map((o) => ({ value: o.Value, label: o.Label, icon: <LocationOnIcon /> as React.ReactNode }));
	const monitorSelectOptions = (props.monitor?.select.options.filter((o) => o.Label) ?? [])
		.map((o) => ({ value: o.Value, label: o.Label, icon: <TvIcon /> as React.ReactNode }));

	const toggleBtnSx = {
		...sxCtrlBtn,
		'&.MuiButton-outlined': {
			...sxCtrlBtn['&.MuiButton-outlined'],
			'& .MuiSvgIcon-root': { fontSize: ctrlBtnIconSize, color: '#fff' },
		},
		'&.MuiButton-contained': {
			...sxCtrlBtn['&.MuiButton-contained'],
			'& .MuiSvgIcon-root': { fontSize: ctrlBtnIconSize, color: overlayButtonContainedColor },
		},
	};

	return (
		<Box sx={sxCompoundCardInner}>

			{/* ── Header: selfview + fullscreen toggles ── */}
			<Box sx={sxCardHeaderRow}>
				<Box sx={sxCardIcon}>
					<VideoCameraFrontIcon />
				</Box>
				<Typography variant='body2' sx={{ ...sxCardLabel, flex: 1 }}>
					Selfview
				</Typography>
				<Box
					onClick={(e) => e.stopPropagation()}
					onPointerDown={(e) => e.stopPropagation()}
					sx={sxCardBtnGroupSlot}
				>
					<CardButtonGroup>
						<CrestronButton
							signal={props.signal}
							ButtonProps={{
								sx: toggleBtnSx,
								children: ctBtn(isOn ? <VisibilityIcon/> : <VisibilityOffIcon />, isOn ? 'Visible' : 'Hidden'),
							}}
						/>
						{props.fullscreen && (
							<CrestronButton
								signal={props.fullscreen.signal}
								ButtonProps={{
									sx: toggleBtnSx,
									children: ctBtn(<FullscreenIcon />, 'Fullscreen'),
								}}
							/>
						)}
						{props.mute && (
							<CrestronButton
								signal={props.mute.signal}
								ButtonProps={{
									sx: toggleBtnSx,
									children: ctBtn(isMuted ? <VideocamOffIcon /> : <VideocamIcon />, isMuted ? 'Muted' : 'Mute'),
								}}
							/>
						)}
					</CardButtonGroup>
				</Box>
			</Box>

			{/* ── Location select ── */}
			{locationSelectOptions.length > 0 && (
				<SelectCard
					signal={props.location!.select.signal}
					title='Location'
					cardIcon={<LocationOnIcon />}
					options={locationSelectOptions}
                    optionType='location'
				/>
			)}

			{/* ── Monitor select ── */}
			{monitorSelectOptions.length > 0 && (
				<SelectCard
					signal={props.monitor!.select.signal}
					title='Monitor'
					cardIcon={<TvIcon />}
					options={monitorSelectOptions}
                    optionType='monitor'
				/>
			)}
		</Box>
	);
};

// ── Public API ────────────────────────────────────────────────────────────────

const SelfviewCard = (props: SelfviewCardProps): CardProps => ({
	label: 'Selfview',
	MuiCardProps: {
		sx: {
			...sxCardBase,
			...sxCardActive,
			flexDirection: 'column',
			alignItems: 'stretch',
			height: 'auto',
			padding: 0,
		},
	},
	children: <SelfviewCardInner {...props} />,
});

export default SelfviewCard;
