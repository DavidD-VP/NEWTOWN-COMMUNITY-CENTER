import React from 'react';
import { Box, Button, Typography } from '@mui/material';
import RecordVoiceOverIcon from '@mui/icons-material/RecordVoiceOver';
import WallpaperIcon from '@mui/icons-material/Wallpaper';
import CropFreeIcon from '@mui/icons-material/CropFree';
import GridOnIcon from '@mui/icons-material/GridOn';
import GroupsIcon from '@mui/icons-material/Groups';
import FitScreenIcon from '@mui/icons-material/FitScreen';
import DrawIcon from '@mui/icons-material/Draw';

import { CardProps } from '../Card';
import { CardButtonGroup, ctBtn } from '../ctCardStyles';
import {
	sxCardIcon,
	sxCardInner,
	sxCtrlBtn,
	ctrlBtnIconSize,
	overlayButtonContainedColor,
	sxCardBtnGroupSlot,
} from '../../theme/tokens';
import { publishEvent, useSignalStore } from '../../../crestron/CrComLib';

// ── Types ─────────────────────────────────────────────────────────────────────

export type SpeakerTrackCardProps = {
	activeBehavior: string;
	backgroundMode?: string;
	closeUp?: string;
	frames?: string;
	groupAndSpeaker?: string;
	viewLimits?: string;
	whiteboard?: string;
};

type FeatureToggleButtonProps = {
	interaction: string;
	label: string;
	icon: React.ReactNode;
};

// ── Toggle button ─────────────────────────────────────────────────────────────

const FeatureToggleButton: React.FC<FeatureToggleButtonProps> = ({ interaction, label, icon }) => {
	const isEnabled = useSignalStore((s) => s.booleans[interaction] ?? false);

	const handleToggle = React.useCallback(
		(e: React.MouseEvent) => {
			e.stopPropagation();
			publishEvent('boolean', interaction, true);
			publishEvent('boolean', interaction, false);
		},
		[interaction],
	);

	return (
		<Button
			variant={isEnabled ? 'contained' : 'outlined'}
			onClick={handleToggle}
			aria-label={isEnabled ? `Disable ${label}` : `Enable ${label}`}
			sx={{
				...sxCtrlBtn,
				'&.MuiButton-outlined': {
					...sxCtrlBtn['&.MuiButton-outlined'],
					'& .MuiSvgIcon-root': { fontSize: ctrlBtnIconSize, color: '#fff' },
				},
				'&.MuiButton-contained': {
					...sxCtrlBtn['&.MuiButton-contained'],
					'& .MuiSvgIcon-root': { fontSize: ctrlBtnIconSize, color: overlayButtonContainedColor },
				},
			}}
		>
			{ctBtn(icon, label)}
		</Button>
	);
};

// ── Inner component ───────────────────────────────────────────────────────────

const SpeakerTrackCardInner: React.FC<SpeakerTrackCardProps> = (props) => {
	const activeBehavior = useSignalStore((s) => s.strings[props.activeBehavior]?.trim() ?? '');

	const toggles: Array<{ key: string; interaction?: string; label: string; icon: React.ReactNode }> = [
		{ key: 'backgroundMode', interaction: props.backgroundMode, label: 'Background Mode', icon: <WallpaperIcon /> },
		{ key: 'closeUp', interaction: props.closeUp, label: 'Close Up', icon: <CropFreeIcon /> },
		{ key: 'frames', interaction: props.frames, label: 'Frames', icon: <GridOnIcon /> },
		{ key: 'groupAndSpeaker', interaction: props.groupAndSpeaker, label: 'Group and Speaker', icon: <GroupsIcon /> },
		{ key: 'viewLimits', interaction: props.viewLimits, label: 'View Limits', icon: <FitScreenIcon /> },
		{ key: 'whiteboard', interaction: props.whiteboard, label: 'Whiteboard', icon: <DrawIcon /> },
	];

	const activeToggles = toggles.filter((t) => t.interaction);

	return (
		<Box sx={sxCardInner}>
			<Box sx={sxCardIcon}><RecordVoiceOverIcon /></Box>
			<Box sx={{
				display: 'flex',
				flexDirection: 'column',
				justifyContent: 'center',
				gap: '2px',
				flex: 1,
				minWidth: 0,
			}}>
				<Typography
					variant='body2'
					sx={{ fontWeight: 600, lineHeight: 1.2, color: '#fff' }}
					noWrap
				>
					SpeakerTrack
				</Typography>
				<Typography
					variant='caption'
					sx={{ lineHeight: 1.1, fontWeight: 600, color: 'rgba(255,255,255,0.9)' }}
					noWrap
				>
					{activeBehavior || '—'}
				</Typography>
			</Box>
			{activeToggles.length > 0 && (
				<Box
					onClick={(e) => e.stopPropagation()}
					onPointerDown={(e) => e.stopPropagation()}
					sx={sxCardBtnGroupSlot}
				>
					<CardButtonGroup>
						{activeToggles.map(({ key, interaction, label, icon }) => (
							<FeatureToggleButton
								key={key}
								interaction={interaction!}
								label={label}
								icon={icon}
							/>
						))}
					</CardButtonGroup>
				</Box>
			)}
		</Box>
	);
};

// ── Public API ────────────────────────────────────────────────────────────────

const SpeakerTrackCard = (props: SpeakerTrackCardProps): CardProps => ({
	label: 'SpeakerTrack',
	variant: 'active',
	MuiCardProps: {
		sx: {
			height: 'auto',
			padding: 0,
		},
	},
	children: <SpeakerTrackCardInner {...props} />,
});

export default SpeakerTrackCard;
