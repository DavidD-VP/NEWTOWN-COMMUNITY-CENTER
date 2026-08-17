import React from 'react';
import { Box, Card, Typography } from '@mui/material';
import SyncAltIcon from '@mui/icons-material/SyncAlt';
import SwapVertIcon from '@mui/icons-material/SwapVert';
import ZoomInIcon from '@mui/icons-material/ZoomIn';
import ZoomOutIcon from '@mui/icons-material/ZoomOut';
import CenterFocusStrongIcon from '@mui/icons-material/CenterFocusStrong';
import CenterFocusWeakIcon from '@mui/icons-material/CenterFocusWeak';
import FilterCenterFocusIcon from '@mui/icons-material/FilterCenterFocus';
import HomeIcon from '@mui/icons-material/Home';
import NorthIcon from '@mui/icons-material/North';
import SouthIcon from '@mui/icons-material/South';
import EastIcon from '@mui/icons-material/East';
import WestIcon from '@mui/icons-material/West';
import NorthEastIcon from '@mui/icons-material/NorthEast';
import NorthWestIcon from '@mui/icons-material/NorthWest';
import SouthEastIcon from '@mui/icons-material/SouthEast';
import SouthWestIcon from '@mui/icons-material/SouthWest';
import ControlCameraIcon from '@mui/icons-material/ControlCamera';

import { CardProps } from '../Card';
import { CardButtonGroup, ctBtn } from '../ctCardStyles';
import {
	sxCardActive,
	sxCardBase,
	sxCardIcon,
	sxCardLabel,
	sxCardInner,
	sxCtrlBtn,
	ctrlBtnIconSize,
	ctrlBtnMinWidth,
	overlayButtonBg,
	overlayButtonBgHover,
	overlayButtonBorder,
	overlayButtonContainedColor,
	cardBorderRadius,
	cardPaddingV,
	cardPaddingH,
	cardInnerGap,
	cardSectionGap,
	sliderRail,
	sliderTrack,
	sliderThumb,
	sliderThumbFocus,
} from '../../theme/tokens';
import CrestronButton from '../../component/CrestronButton';
import CrestronSlider, { CrestronSliderProps } from '../../component/CrestronSlider';

// ── Types ─────────────────────────────────────────────────────────────────────

export type PTZCardProps = {
	pan?: { left: string; right: string; speed?: CrestronSliderProps };
	tilt?: { up: string; down: string; speed?: CrestronSliderProps };
	pantilt?: { upLeft?: string; upRight?: string; downLeft?: string; downRight?: string };
	zoom?: { in: string; out: string; speed?: CrestronSliderProps };
	focus?: { near?: string; far?: string; automatic?: string; speed?: CrestronSliderProps };
	home?: string;
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

const speedSliderSx = {
	'& .MuiSlider-rail': { backgroundColor: sliderRail, opacity: 1 },
	'& .MuiSlider-track': { backgroundColor: sliderTrack, borderColor: sliderTrack },
	'& .MuiSlider-thumb': {
		backgroundColor: sliderThumb,
		'&:hover, &.Mui-focusVisible': { boxShadow: sliderThumbFocus },
	},
} as const;

const discIconSize = ctrlBtnIconSize;

// Square disc — cells larger than standard card button width.
const discSize = `calc(5 * ${ctrlBtnMinWidth})`;

const discBtnSx = {
	width: '100%',
	height: '100%',
	minWidth: 0,
	padding: 'clamp(4px, 0.6vh, 9px)',
	borderRadius: 0,
	display: 'flex',
	flexDirection: 'column' as const,
	alignItems: 'center',
	justifyContent: 'center',
	'&.MuiButton-outlined': {
		backgroundColor: 'transparent',
		border: 'none',
		color: '#fff',
		'& .MuiSvgIcon-root': { fontSize: discIconSize, color: '#fff' },
		'&:hover': {
			backgroundColor: overlayButtonBgHover,
			border: 'none',
		},
	},
	'&.MuiButton-contained': {
		...sxCtrlBtn['&.MuiButton-contained'],
		boxShadow: 'none',
		'& .MuiSvgIcon-root': { fontSize: discIconSize, color: overlayButtonContainedColor },
		'&:hover': {
			...sxCtrlBtn['&.MuiButton-contained']['&:hover'],
			boxShadow: 'none',
		},
	},
} as const;

const controlColumnSx = {
	display: 'flex',
	flexDirection: 'column',
	alignItems: 'center',
	justifyContent: 'flex-start',
	width: '100%',
	minWidth: 0,
} as const;

const auxButtonColumnSx = {
	...controlColumnSx,
	justifyContent: 'space-evenly',
	alignSelf: 'stretch',
} as const;

// ── Inner component ───────────────────────────────────────────────────────────

const PTZCardInner: React.FC<PTZCardProps> = (props) => {
	const hasDpad = !!(props.pan || props.tilt || props.home || props.pantilt);
	const hasZoomButtons = !!props.zoom;
	const hasFocusButtons = !!(props.focus?.near || props.focus?.far || props.focus?.automatic);
	const hasAuxButtons = hasFocusButtons || hasZoomButtons;
	const hasButtonSection = hasDpad || hasAuxButtons;
	const hasSliders = !!(props.pan?.speed || props.tilt?.speed || props.zoom?.speed || props.focus?.speed);
	const useTwoColumns = hasDpad && hasAuxButtons;

	const discCells: Array<{ signal: string | undefined; icon: React.ReactNode; label?: string }> = [
		{ signal: props.pantilt?.upLeft,    icon: <NorthWestIcon sx={{ fontSize: discIconSize }} /> },
		{ signal: props.tilt?.up,            icon: <NorthIcon    sx={{ fontSize: discIconSize }} /> },
		{ signal: props.pantilt?.upRight,   icon: <NorthEastIcon sx={{ fontSize: discIconSize }} /> },
		{ signal: props.pan?.left,           icon: <WestIcon     sx={{ fontSize: discIconSize }} /> },
		{ signal: props.home,                icon: <HomeIcon     sx={{ fontSize: discIconSize }} />, label: 'Home' },
		{ signal: props.pan?.right,          icon: <EastIcon     sx={{ fontSize: discIconSize }} /> },
		{ signal: props.pantilt?.downLeft,  icon: <SouthWestIcon sx={{ fontSize: discIconSize }} /> },
		{ signal: props.tilt?.down,          icon: <SouthIcon    sx={{ fontSize: discIconSize }} /> },
		{ signal: props.pantilt?.downRight, icon: <SouthEastIcon sx={{ fontSize: discIconSize }} /> },
	];

	return (
		<Box sx={{ width: '100%', position: 'relative' }}>
			<Card variant='outlined' sx={{ ...sxCardBase, ...sxCardActive, flexDirection: 'column', height: 'auto' }}>

				{/* Card header */}
				<Box sx={{
					...sxCardInner,
					...(hasButtonSection ? { minHeight: 0, paddingBottom: cardSectionGap } : {}),
				}}>
					<Box sx={sxCardIcon}><ControlCameraIcon /></Box>
					<Typography variant='body2' sx={{ ...sxCardLabel, flex: 1 }}>Control</Typography>
				</Box>

				{/* PTZ disc (col 1) + stacked focus/zoom (col 2) */}
				{hasButtonSection && (
					<Box sx={{
						display: 'grid',
						gridTemplateColumns: useTwoColumns ? '1fr 1fr' : '1fr',
						columnGap: cardSectionGap,
						alignItems: useTwoColumns ? 'stretch' : 'start',
						width: '100%',
						boxSizing: 'border-box',
						paddingLeft: cardPaddingH,
						paddingRight: cardPaddingH,
						paddingBottom: hasSliders ? cardSectionGap : cardPaddingV,
					}}>
						{hasDpad && (
							<Box sx={controlColumnSx}>
								<Box sx={{
									width: discSize,
									height: discSize,
									borderRadius: cardBorderRadius,
									backgroundColor: overlayButtonBg,
									border: `1px solid ${overlayButtonBorder}`,
									display: 'grid',
									gridTemplateColumns: '1fr 1fr 1fr',
									gridTemplateRows: '1fr 1fr 1fr',
									flexShrink: 0,
								}}>
									{discCells.map(({ signal, icon, label }, i) =>
										signal
											? <CrestronButton key={i} signal={signal} ButtonProps={{
												sx: discBtnSx,
												children: label
													? <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1px' }}>
														{icon}
														<Typography component='span' sx={{ fontSize: 'clamp(14px, 1.94vw, 38px)', lineHeight: 1, color: 'inherit', fontWeight: 600, textTransform: 'none' }}>{label}</Typography>
													  </Box>
													: icon,
											}} />
											: <Box key={i} />
									)}
								</Box>
							</Box>
						)}
						{hasAuxButtons && (
							<Box sx={auxButtonColumnSx}>
								{hasFocusButtons && (
									<CardButtonGroup centered sx={{ maxWidth: '100%' }}>
										{props.focus!.near && (
											<CrestronButton signal={props.focus!.near} ButtonProps={{ sx: btnSx, children: ctBtn(<CenterFocusStrongIcon />, 'Focus Near') }} />
										)}
										{props.focus!.far && (
											<CrestronButton signal={props.focus!.far} ButtonProps={{ sx: btnSx, children: ctBtn(<CenterFocusWeakIcon />, 'Focus Far') }} />
										)}
										{props.focus!.automatic && (
											<CrestronButton signal={props.focus!.automatic} ButtonProps={{ sx: btnSx, children: ctBtn(<FilterCenterFocusIcon />, 'Auto Focus') }} />
										)}
									</CardButtonGroup>
								)}
								{hasZoomButtons && (
									<CardButtonGroup centered sx={{ maxWidth: '100%' }}>
										<CrestronButton signal={props.zoom!.in} ButtonProps={{ sx: btnSx, children: ctBtn(<ZoomInIcon />, 'Zoom In') }} />
										<CrestronButton signal={props.zoom!.out} ButtonProps={{ sx: btnSx, children: ctBtn(<ZoomOutIcon />, 'Zoom Out') }} />
									</CardButtonGroup>
								)}
							</Box>
						)}
					</Box>
				)}
				{/* Sliders: CSS grid so icon/label/slider columns align across all rows */}
				{hasSliders && (
					<Box sx={{
						display: 'grid',
						gridTemplateColumns: 'auto auto 1fr',
						columnGap: cardInnerGap,
						rowGap: 'clamp(2px, 0.38vh, 5px)',
						alignItems: 'center',
						paddingBottom: cardPaddingV,
						paddingLeft: cardPaddingH,
						paddingRight: cardPaddingH,
						width: '100%',
						boxSizing: 'border-box',
					}}>
						{props.pan?.speed && <>
							<Box sx={sxCardIcon}><SyncAltIcon /></Box>
							<Typography variant='body2' sx={sxCardLabel}>Pan Speed</Typography>
							<Box sx={{ pl: 'clamp(6px, 0.8vw, 14px)' }}>
								<CrestronSlider
									{...props.pan.speed}
									SliderProps={{ ...props.pan.speed.SliderProps, sx: { ...speedSliderSx, ...props.pan.speed.SliderProps?.sx } }}
								/>
							</Box>
						</>}
						{props.tilt?.speed && <>
							<Box sx={sxCardIcon}><SwapVertIcon /></Box>
							<Typography variant='body2' sx={sxCardLabel}>Tilt Speed</Typography>
							<Box sx={{ pl: 'clamp(6px, 0.8vw, 14px)' }}>
								<CrestronSlider
									{...props.tilt.speed}
									SliderProps={{ ...props.tilt.speed.SliderProps, sx: { ...speedSliderSx, ...props.tilt.speed.SliderProps?.sx } }}
								/>
							</Box>
						</>}
						{props.zoom?.speed && <>
							<Box sx={sxCardIcon}><ZoomInIcon /></Box>
							<Typography variant='body2' sx={sxCardLabel}>Zoom Speed</Typography>
							<Box sx={{ pl: 'clamp(6px, 0.8vw, 14px)' }}>
								<CrestronSlider
									{...props.zoom.speed}
									SliderProps={{ ...props.zoom.speed.SliderProps, sx: { ...speedSliderSx, ...props.zoom.speed.SliderProps?.sx } }}
								/>
							</Box>
						</>}
						{props.focus?.speed && <>
							<Box sx={sxCardIcon}><CenterFocusStrongIcon /></Box>
							<Typography variant='body2' sx={sxCardLabel}>Focus Speed</Typography>
							<Box sx={{ pl: 'clamp(6px, 0.8vw, 14px)' }}>
								<CrestronSlider
									{...props.focus.speed}
									SliderProps={{ ...props.focus.speed.SliderProps, sx: { ...speedSliderSx, ...props.focus.speed.SliderProps?.sx } }}
								/>
							</Box>
						</>}
					</Box>
				)}

			</Card>
		</Box>
	);
};

// ── Public API ────────────────────────────────────────────────────────────────

const PTZCard = (props: PTZCardProps): CardProps => ({
	label: 'Control',
	children: <PTZCardInner {...props} />,
});

export default PTZCard;
