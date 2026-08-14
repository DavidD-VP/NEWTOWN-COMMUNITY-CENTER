import React from 'react';
import { useShallow } from 'zustand/react/shallow';

import {
	useSignalStore,
	publishEvent,
} from '../../../crestron/CrComLib';

import {
	Box,
	Card,
	CardActionArea,
	Typography,
	MenuItem,
	ListItemIcon,
	ListItemText,
	Tooltip,
	Button,
} from '@mui/material';

import TouchPanelOverlay from '../../component/TouchPanelOverlay';
import { useCloseOverlayWhenLocked } from '../../hooks/useCloseOverlayWhenLocked';

import CheckIcon from '@mui/icons-material/Check';
import TvOffIcon from '@mui/icons-material/TvOff';
import ViewQuiltIcon from '@mui/icons-material/ViewQuilt';
import GridViewIcon from '@mui/icons-material/GridView';
import PowerSettingsNewIcon from '@mui/icons-material/PowerSettingsNew';
import LockIcon from '@mui/icons-material/Lock';
import LockOpenIcon from '@mui/icons-material/LockOpen';
import {
	SourceProps,
	DestinationCardProps,
	DestinationIcon,
	SourceIcon,
} from './DestinationCard';
import { CardProps } from '../Card';
import {
	sxCardBase,
	sxCardActive,
	sxCardMuted,
	cardPaddingV,
	cardPaddingH,
	cardInnerGap,
	cardIconSize,
	pageCardGap,
	menuListItemIconSx,
	menuIconSize,
	sxCtrlBtn,
	ctrlBtnIconSize,
	overlayButtonBg,
	overlayButtonBgHover,
	overlayButtonBorder,
	overlayButtonBorderHover,
	shadowActiveHover,
	gradientActive,
} from '../../theme/tokens';
import { selectionMenuItemSx } from '../../component/selectionPopoverStyles';

import { ctBtn } from '../ctCardStyles';
import SourcePreviewImage from '../../component/SourcePreviewImage';

const menuItemSx = selectionMenuItemSx;

// ── Types ─────────────────────────────────────────────────────────────────────

export type DestinationProps = {
	Type?: DestinationCardProps['Type'];
	Label: string;
	/** Per-destination source list; falls back to the parent card's Sources. */
	Sources?: Array<SourceProps>;
	Select: string;
	/** Crestron digital signal that, when true, locks this cell's select control. */
	DisableSelectSignal?: string;
	/** Crestron analog — one-based row in the grid (read live when set). */
	RowSignal?: string;
	/** Crestron analog — one-based column in the grid (read live when set). */
	ColumnSignal?: string;
	/** Crestron analog — row span (default 1). */
	HeightSignal?: string;
	/** Crestron analog — column span (default 1). */
	WidthSignal?: string;
};

export type VideoWallLayoutProps = {
	/** Display name shown in the layout picker, e.g. "2×2". */
	Label: string;
	/** Analog signal value that selects this layout (published to LayoutSelect). */
	Value: number;
};

export type VideoWallCardProps = {
	/** Label shown on the header row, e.g. "Video Wall". */
	Label: string;
	/** Source list for the wall header and all grid cells (from videoWall.select). */
	Sources: Array<SourceProps>;
	/** Destinations rendered in the grid. */
	Destinations: Array<DestinationProps>;
	/** Crestron analog — grid column count (read live when set). */
	ColumnsSignal?: string;
	/** Crestron analog — grid row count (read live when set). */
	RowsSignal?: string;
	/** Layout presets to switch between via the layout picker button. */
	Layouts: Array<VideoWallLayoutProps>;
	/** Crestron analog signal name that holds the active layout Value. */
	LayoutSelect: string;
	/** Crestron digital signal that, when true, shows the layout picker button. */
	LayoutVisibleSignal?: string;
	/** Crestron digital signal that, when true, locks source selection on the header and all destinations. */
	DisableSelectSignal?: string;
	/** Crestron digital signal that, when true, shows a lock / unlock toggle
	 * button next to the Power button.  The button latches `DisableSelectSignal`
	 * between true and false on every press. */
	DisableSelectVisibleSignal?: string;
	/** Crestron digital signal that, when true, prepends a "No Source" entry. */
	NoSourceSignal?: string;
	/** Crestron digital signal that gates whether the Power button is shown. */
	PowerEnableSignal?: string;
	/** Crestron digital signal that holds the current power state (drives muted styling). */
	PowerStateSignal?: string;
};

const GRID_SLOT_ASPECT_W = 16;
const GRID_SLOT_ASPECT_H = 9;

function cellAspectRatio(width: number, height: number): string {
	return `${GRID_SLOT_ASPECT_W * width} / ${GRID_SLOT_ASPECT_H * height}`;
}

// ── Power button sub-component ────────────────────────────────────────────────

const VideoWallPowerButton: React.FC<{ signal: string }> = ({ signal }) => {
	const isPowered = useSignalStore((s) => s.booleans[signal] ?? false);
	const handleClick = React.useCallback(
		(e: React.MouseEvent) => {
			e.stopPropagation();
			publishEvent('boolean', signal, true);
			publishEvent('boolean', signal, false);
		},
		[signal],
	);
	return (
		<Button
			variant={isPowered ? 'contained' : 'outlined'}
			onClick={handleClick}
			aria-label={isPowered ? 'Power off' : 'Power on'}
			sx={{
				...sxCtrlBtn,
				'&.MuiButton-outlined': {
					...sxCtrlBtn['&.MuiButton-outlined'],
					'& .MuiSvgIcon-root': { fontSize: ctrlBtnIconSize },
				},
				'&.MuiButton-contained': {
					...sxCtrlBtn['&.MuiButton-contained'],
					'& .MuiSvgIcon-root': { fontSize: ctrlBtnIconSize },
				},
			}}
		>
			{ctBtn(<PowerSettingsNewIcon />, 'Power')}
		</Button>
	);
};

// ── DisableSelect toggle button ───────────────────────────────────────────────
// Pulses the boolean signal (true then false) on every press, mirroring the
// Power button's momentary-press pattern.  The Crestron program owns the
// latched state and echoes it back on the same signal name, which drives
// this button's icon + variant.  Only rendered when DisableSelectVisibleSignal
// is true.
const VideoWallDisableSelectToggleButton: React.FC<{ signal: string }> = ({ signal }) => {
	const isLocked = useSignalStore((s) => s.booleans[signal] ?? false);
	const handleClick = React.useCallback(
		(e: React.MouseEvent) => {
			e.stopPropagation();
			publishEvent('boolean', signal, true);
			publishEvent('boolean', signal, false);
		},
		[signal],
	);
	return (
		<Button
			variant={isLocked ? 'contained' : 'outlined'}
			onClick={handleClick}
			aria-label={isLocked ? 'Unlock source select' : 'Lock source select'}
			sx={{
				...sxCtrlBtn,
				'&.MuiButton-outlined': {
					...sxCtrlBtn['&.MuiButton-outlined'],
					'& .MuiSvgIcon-root': { fontSize: ctrlBtnIconSize },
				},
				'&.MuiButton-contained': {
					...sxCtrlBtn['&.MuiButton-contained'],
					'& .MuiSvgIcon-root': { fontSize: ctrlBtnIconSize },
				},
			}}
		>
			{ctBtn(isLocked ? <LockIcon /> : <LockOpenIcon />, isLocked ? 'Locked' : 'Unlocked')}
		</Button>
	);
};

// ── Inner component ───────────────────────────────────────────────────────────

const VideoWallCardInner: React.FC<VideoWallCardProps> = (props) => {
	const [menuOpen, setMenuOpen] = React.useState(false);

	// Leaf-level signal reads (each selector re-renders the card only when
	// that specific signal changes).
	const disableSelect = useSignalStore((s) =>
		props.DisableSelectSignal ? (s.booleans[props.DisableSelectSignal] ?? false) : false,
	);
	const disableSelectToggleVisible = useSignalStore((s) =>
		props.DisableSelectVisibleSignal ? (s.booleans[props.DisableSelectVisibleSignal] ?? false) : false,
	);
	const noSource = useSignalStore((s) =>
		props.NoSourceSignal ? (s.booleans[props.NoSourceSignal] ?? false) : false,
	);
	const powerEnabled = useSignalStore((s) =>
		props.PowerEnableSignal ? (s.booleans[props.PowerEnableSignal] ?? false) : false,
	);
	const powerOn = useSignalStore((s) =>
		props.PowerStateSignal ? (s.booleans[props.PowerStateSignal] ?? false) : false,
	);
	const layoutControlVisible = useSignalStore((s) =>
		props.LayoutVisibleSignal ? (s.booleans[props.LayoutVisibleSignal] ?? false) : false,
	);
	const selectLocked = disableSelect;

	// Active layout: read the LayoutSelect signal and find the matching layout
	const layoutValue = useSignalStore((s) => s.numbers[props.LayoutSelect] ?? 0);
	const activeLayout = React.useMemo(
		() => props.Layouts.find((l) => l.Value === layoutValue) ?? props.Layouts[0],
		[props.Layouts, layoutValue],
	);

	const gridRows = useSignalStore((s) =>
		props.RowsSignal ? (s.numbers[props.RowsSignal] ?? 0) : 0,
	);
	const gridCols = useSignalStore((s) =>
		props.ColumnsSignal ? (s.numbers[props.ColumnsSignal] ?? 0) : 0,
	);
	const effectiveRows = Math.max(1, gridRows);
	const effectiveCols = Math.max(1, gridCols);

	// Flat number[] so useShallow compares primitives (array of objects always re-triggers).
	const placementsFlat = useSignalStore(
		useShallow((s) => {
			const out: number[] = [];
			for (const d of props.Destinations) {
				out.push(
					d.RowSignal ? (s.numbers[d.RowSignal] ?? 0) : 0,
					d.ColumnSignal ? (s.numbers[d.ColumnSignal] ?? 0) : 0,
					d.HeightSignal ? (s.numbers[d.HeightSignal] ?? 1) : 1,
					d.WidthSignal ? (s.numbers[d.WidthSignal] ?? 1) : 1,
				);
			}
			return out;
		}),
	);

	const destinationsKey = React.useMemo(
		() =>
			props.Destinations.map(
				(d) =>
					`${d.Select}:${d.RowSignal ?? ''}:${d.ColumnSignal ?? ''}:${d.HeightSignal ?? ''}:${d.WidthSignal ?? ''}:${d.Label}`,
			).join('|'),
		[props.Destinations],
	);

	type ResolvedDestination = DestinationProps & {
		Row: number;
		Column: number;
		Height: number;
		Width: number;
	};

	const activeDestinations = React.useMemo((): ResolvedDestination[] => {
		const gridSlots = effectiveRows * effectiveCols;

		const resolved: ResolvedDestination[] = [];
		props.Destinations.forEach((dest, i) => {
			const base = i * 4;
			let Row = placementsFlat[base] ?? 0;
			let Column = placementsFlat[base + 1] ?? 0;
			let Height = placementsFlat[base + 2] ?? 1;
			let Width = placementsFlat[base + 3] ?? 1;

			if (Height === 0 || Width === 0) return;

			const hasExplicitPlacement = Row > 0 && Column > 0;
			if (hasExplicitPlacement) {
				// Processor-provided row/column/span (custom layouts, merged windows).
			} else if (i < gridSlots) {
				Row = Math.floor(i / effectiveCols) + 1;
				Column = (i % effectiveCols) + 1;
			} else {
				return;
			}

			resolved.push({ ...dest, Row, Column, Height, Width });
		});
		return resolved;
	}, [destinationsKey, placementsFlat, effectiveRows, effectiveCols]);

	const layoutGrid = React.useMemo(() => {
		let rows = effectiveRows;
		let cols = effectiveCols;
		for (const dest of activeDestinations) {
			rows = Math.max(rows, dest.Row + dest.Height - 1);
			cols = Math.max(cols, dest.Column + dest.Width - 1);
		}
		return { rows, cols };
	}, [activeDestinations, effectiveRows, effectiveCols]);

	// Read all destination signal values in a single store subscription
	const destinationSignals = React.useMemo(
		() => activeDestinations.map((d) => d.Select),
		// eslint-disable-next-line react-hooks/exhaustive-deps
		[activeDestinations.map((d) => d.Select).join(',')],
	);

	const allValues = useSignalStore(
		useShallow((s) => destinationSignals.map((sig) => s.numbers[sig] ?? 0)),
	);

	// Per-destination DisableSelect signals read in one shallow-equal selector
	// so changes to one don't churn the others.
	const destinationDisableSelectSignals = React.useMemo(
		() => activeDestinations.map((d) => d.DisableSelectSignal ?? ''),
		// eslint-disable-next-line react-hooks/exhaustive-deps
		[activeDestinations.map((d) => d.DisableSelectSignal ?? '').join(',')],
	);
	const destinationDisableSelects = useSignalStore(
		useShallow((s) => destinationDisableSelectSignals.map((sig) => sig ? (s.booleans[sig] ?? false) : false)),
	);

	// Consensus: if every destination has the same source selected, show it;
	// otherwise surface "Multiple sources".
	const firstValue = allValues[0] ?? 0;
	const allSame = allValues.every((v) => v === firstValue);
	const consensusValue = allSame ? firstValue : -1;

	const options = React.useMemo(
		() => [
			...(noSource ? [{ value: 0, label: 'No Source', icon: <TvOffIcon /> as React.ReactNode }] : []),
			...props.Sources.map((s) => ({
				value: s.Value,
				label: s.Label,
				icon: SourceIcon(s.Type) as React.ReactNode,
			})),
		],
		[props.Sources, noSource],
	);

	const currentOption = consensusValue > 0
		? options.find((o) => o.value === consensusValue)
		: undefined;

	let caption: React.ReactNode;
	if (consensusValue === -1) {
		caption = 'Multiple sources';
	} else if (currentOption) {
		caption = (
			<Box
				component='span'
				sx={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}
			>
				<Box
					component='span'
					sx={{
						display: 'inline-flex',
						'& .MuiSvgIcon-root': { fontSize: 'clamp(11px, 1.52vw, 29px)' },
					}}
				>
					{SourceIcon(props.Sources.find((s) => s.Value === consensusValue)?.Type ?? 'Laptop')}
				</Box>
				{currentOption.label}
			</Box>
		);
	} else {
		caption = 'Tap to route all';
	}

	// ── Header card click → "route all" popup ──────────────────────────────
	const handleHeaderClick = React.useCallback(() => {
		setMenuOpen(true);
	}, []);

	const handleMenuClose = React.useCallback(() => {
		setMenuOpen(false);
	}, []);

	const handleSelectAll = React.useCallback(
		(value: number) => {
			destinationSignals.forEach((sig) => publishEvent('number', sig, value));
			setMenuOpen(false);
		},
		[destinationSignals],
	);

	// ── Per-destination popup ──────────────────────────────────────────────
	const [destMenuOpen, setDestMenuOpen] = React.useState(false);
	const [activeDestIndex, setActiveDestIndex] = React.useState<number>(-1);

	const handleDestCellClick = React.useCallback(
		(e: React.MouseEvent<HTMLElement>, index: number) => {
			e.stopPropagation();
			setActiveDestIndex(index);
			setDestMenuOpen(true);
		},
		[],
	);

	const handleDestMenuClose = React.useCallback(() => {
		setDestMenuOpen(false);
	}, []);

	const handleSelectDest = React.useCallback(
		(value: number) => {
			const dest = activeDestinations[activeDestIndex];
			if (dest) publishEvent('number', dest.Select, value);
			setDestMenuOpen(false);
		},
		[activeDestIndex, activeDestinations],
	);

	// ── Layout picker popup ────────────────────────────────────────────────
	const visibleLayouts = props.Layouts.filter((l) => l.Label.length > 0);
	const hasLayouts = layoutControlVisible && visibleLayouts.length > 1;
	const [layoutMenuOpen, setLayoutMenuOpen] = React.useState(false);

	const handleLayoutButtonClick = React.useCallback(
		(e: React.MouseEvent<HTMLElement>) => {
			e.stopPropagation();
			setLayoutMenuOpen(true);
		},
		[],
	);

	const handleLayoutMenuClose = React.useCallback(() => {
		setLayoutMenuOpen(false);
	}, []);

	const handleSelectLayout = React.useCallback(
		(value: number) => {
			publishEvent('number', props.LayoutSelect, value);
			setLayoutMenuOpen(false);
		},
		[props.LayoutSelect],
	);

	const handleCloseAllOverlays = React.useCallback(() => {
		setMenuOpen(false);
		setDestMenuOpen(false);
		setLayoutMenuOpen(false);
	}, []);

	useCloseOverlayWhenLocked(selectLocked, handleCloseAllOverlays);

	// ── Render ─────────────────────────────────────────────────────────────
	return (
		<Box sx={{ width: '100%' }}>
			{/* ── Single merged card ───────────────────────────────────── */}
			<Card
				variant='outlined'
				sx={{
					...sxCardBase,
					...(props.PowerStateSignal && powerEnabled && !powerOn ? sxCardMuted : sxCardActive),
					flexDirection: 'column',
					alignItems: 'stretch',
					minHeight: 'unset',
					'&:hover': { boxShadow: shadowActiveHover },
				}}
			>
				{/* Header row — tap to route all */}
				<CardActionArea
					component='div'
				onClick={selectLocked ? undefined : handleHeaderClick}
				sx={{
					cursor: selectLocked ? 'default' : 'pointer',
					...(selectLocked && {
						'& .MuiCardActionArea-focusHighlight': { opacity: 0 },
					}),
						display: 'flex',
						flexDirection: 'row',
						alignItems: 'center',
						paddingTop: cardPaddingV,
						paddingBottom: cardPaddingV,
						paddingLeft: cardPaddingH,
						paddingRight: cardPaddingH,
						gap: cardInnerGap,
						width: '100%',
					}}
				>
					<Box
						sx={{
							'& .MuiSvgIcon-root': { fontSize: cardIconSize, color: '#fff' },
							display: 'flex',
							alignItems: 'center',
							flexShrink: 0,
						}}
					>
						{DestinationIcon('Videowall', props.Label)}
					</Box>
					<Box
						sx={{
							display: 'flex',
							flexDirection: 'column',
							justifyContent: 'center',
							gap: '2px',
							flex: 1,
							minWidth: 0,
						}}
					>
						<Box sx={{display: 'flex', flexDirection:'row', alignItems:'center'}}>
							<Typography
								variant='body2'
								sx={{ fontWeight: 600, lineHeight: 1.2, color: '#fff' }}
								noWrap
							>
								{props.Label}
							</Typography>
						{selectLocked && (
							<LockIcon sx={{
								fontSize: 'clamp(10px, 1.38vw, 27px)',
								color: '#ffa726',
								flexShrink: 0,
							}} />
						)}
						</Box>
						<Typography
							variant='caption'
							sx={{
								lineHeight: 1.1,
								fontWeight: currentOption ? 600 : 400,
								fontStyle: currentOption ? 'normal' : 'italic',
								color: 'rgba(255,255,255,0.9)',
							}}
							noWrap
						>
							{caption}
						</Typography>
					</Box>
					{hasLayouts && (
						<Button
							variant='outlined'
							onClick={handleLayoutButtonClick}
							sx={{
								...sxCtrlBtn,
								'&.MuiButton-outlined': {
									...sxCtrlBtn['&.MuiButton-outlined'],
									'& .MuiSvgIcon-root': { fontSize: ctrlBtnIconSize },
								},
							}}
						>
							{ctBtn(<GridViewIcon />, 'Layout')}
						</Button>
					)}
					{disableSelectToggleVisible && props.DisableSelectSignal && (
						<VideoWallDisableSelectToggleButton signal={props.DisableSelectSignal} />
					)}
					{props.PowerStateSignal && powerEnabled && (
					<VideoWallPowerButton signal={props.PowerStateSignal} />
				)}
				</CardActionArea>

				{/* Divider */}
				<Box sx={{ height: '1px', background: 'rgba(255,255,255,0.2)', mx: cardPaddingH }} />

				{/* Destination grid */}
				<Box
					sx={{
						display: 'grid',
						gridTemplateColumns: `repeat(${layoutGrid.cols}, minmax(0, 1fr))`,
						gridTemplateRows: `repeat(${layoutGrid.rows}, auto)`,
						gridAutoRows: 'auto',
						gridAutoColumns: 'minmax(0, 1fr)',
						gap: cardPaddingV,
						paddingTop: cardPaddingV,
						paddingBottom: cardPaddingV,
						paddingLeft: cardPaddingH,
						paddingRight: cardPaddingH,
						overflow: 'hidden',
					}}
				>
				{activeDestinations.map((dest, i) => {
					const sources = dest.Sources ?? props.Sources;
					const currentVal = allValues[i] ?? 0;
					const currentSrc = sources.find((s) => s.Value === currentVal);
					const showsPreview = currentVal > 0 && Boolean(currentSrc?.PreviewPath);
					const destDisabled = destinationDisableSelects[i] || selectLocked;
					const cellBackground = currentSrc ? overlayButtonBg : 'transparent';
					const cellBorder = dest.Type === 'Meeting'
						? '2px dashed rgba(255,255,255,0.5)'
						: currentSrc
							? `2px solid ${overlayButtonBorder}`
							: '2px solid rgba(255,255,255,0.15)';

					const destWidth = dest.Width ?? 1;
					const destHeight = dest.Height ?? 1;
					const hasDestLabel = dest.Label.trim().length > 0;

					return (
						<CardActionArea
							key={i}
							component='div'
							onClick={destDisabled ? undefined : (e) => handleDestCellClick(e, i)}
							sx={{
								gridRow: `${dest.Row} / span ${destHeight}`,
								gridColumn: `${dest.Column} / span ${destWidth}`,
								position: 'relative',
								display: 'flex',
								flexDirection: 'column',
								alignItems: 'center',
								justifyContent: 'center',
								alignSelf: 'stretch',
								width: '100%',
								aspectRatio: cellAspectRatio(destWidth, destHeight),
								minHeight: 0,
								overflow: 'hidden',
								gap: '4px',
								padding: showsPreview ? 0 : cardPaddingV,
								borderRadius: 1,
								border: showsPreview ? '2px solid rgba(255,255,255,0.15)' : cellBorder,
								background: cellBackground,
								'&:hover': {
									background: destDisabled
										? undefined
										: currentSrc
											? overlayButtonBgHover
											: showsPreview
												? undefined
												: 'rgba(255,255,255,0.12)',
									borderColor: destDisabled
										? undefined
										: showsPreview
											? 'rgba(255,255,255,0.7)'
											: currentSrc
												? overlayButtonBorderHover
												: 'rgba(255,255,255,0.7)',
									...(showsPreview && !destDisabled && currentSrc && {
										'& .video-wall-cell-caption': {
											borderColor: overlayButtonBorderHover,
											backgroundColor: overlayButtonBgHover,
										},
									}),
								},
								cursor: destDisabled ? 'default' : 'pointer',
								...(destDisabled && {
									'& .MuiCardActionArea-focusHighlight': { opacity: 0 },
								}),
							}}
						>
							{showsPreview && currentSrc?.PreviewPath ? (
								<>
									<Box
										sx={{
											position: 'absolute',
											inset: 0,
											zIndex: 1,
											minHeight: 0,
											overflow: 'hidden',
											pointerEvents: 'none',
										}}
									>
										<SourcePreviewImage
											assetPath={currentSrc.PreviewPath}
											alt={currentSrc.Label}
											fitContainer
											objectFit='fill'
										/>
									</Box>
									<Box
										className='video-wall-cell-caption-backdrop'
										sx={{
											position: 'absolute',
											top: cardPaddingV,
											left: cardPaddingH,
											zIndex: 2,
											borderRadius: 1,
											background: gradientActive,
											maxWidth: 'calc(100% - 24px)',
											overflow: 'hidden',
										}}
									>
										<Box
											className='video-wall-cell-caption'
											sx={{
												display: 'flex',
												flexDirection: hasDestLabel ? 'row' : 'column',
												alignItems: hasDestLabel ? 'center' : 'center',
												justifyContent: 'center',
												gap: hasDestLabel ? cardInnerGap : '4px',
												px: cardPaddingV,
												py: cardPaddingV,
												borderRadius: 1,
												border: cellBorder,
												backgroundColor: overlayButtonBg,
												boxSizing: 'border-box',
												minWidth: 0,
											}}
										>
											<Box
												sx={{
													'& .MuiSvgIcon-root': {
														fontSize: menuIconSize,
														color: '#fff',
													},
													display: 'flex',
													alignItems: 'center',
													flexShrink: 0,
												}}
											>
												{DestinationIcon(dest.Type, dest.Label)}
											</Box>
											<Box
												sx={{
													display: 'flex',
													flexDirection: 'column',
													justifyContent: 'center',
													gap: '2px',
													flex: hasDestLabel ? 1 : undefined,
													minWidth: 0,
													alignItems: hasDestLabel ? 'flex-start' : 'center',
												}}
											>
												{hasDestLabel && (
													<Typography
														variant='body2'
														sx={{
															fontWeight: 600,
															lineHeight: 1.2,
															color: '#fff',
														}}
														noWrap
													>
														{dest.Label}
													</Typography>
												)}
												<Box
													sx={{
														display: 'inline-flex',
														alignItems: 'center',
														gap: '3px',
														minWidth: 0,
														'& .MuiSvgIcon-root': {
															fontSize: 'clamp(10px, 1.38vw, 27px)',
															color: 'rgba(255,255,255,0.85)',
														},
													}}
												>
													{SourceIcon(currentSrc.Type)}
													<Typography
														variant='caption'
														sx={{
															lineHeight: 1.1,
															fontWeight: 600,
															color: 'rgba(255,255,255,0.9)',
														}}
														noWrap
													>
														{currentSrc.Label}
													</Typography>
												</Box>
											</Box>
										</Box>
									</Box>
								</>
							) : (
								<>
									<Box
										sx={{
											'& .MuiSvgIcon-root': {
												fontSize: 'clamp(18px, 2.49vw, 48px)',
												color: '#fff',
											},
											display: 'flex',
											alignItems: 'center',
										}}
									>
										{DestinationIcon(dest.Type, dest.Label)}
									</Box>
									<Typography
										variant='caption'
										sx={{
											fontWeight: 600,
											lineHeight: 1.2,
											color: '#fff',
											textAlign: 'center',
										}}
										noWrap
									>
										{dest.Label}
									</Typography>
									<Box
										sx={{
											display: 'inline-flex',
											alignItems: 'center',
											gap: '3px',
											'& .MuiSvgIcon-root': {
												fontSize: 'clamp(10px, 1.38vw, 27px)',
												color: 'rgba(255,255,255,0.85)',
											},
										}}
									>
										{currentSrc ? SourceIcon(currentSrc.Type) : null}
										<Typography
											variant='caption'
											sx={{
												fontSize: 'clamp(9px, 1.24vw, 24px)',
												fontWeight: currentSrc ? 600 : 400,
												fontStyle: currentSrc ? 'normal' : 'italic',
												color: 'rgba(255,255,255,0.85)',
												textAlign: 'center',
											}}
											noWrap
										>
											{currentSrc ? currentSrc.Label : 'No source'}
										</Typography>
									</Box>
								</>
							)}
						</CardActionArea>
					);
					})}
				</Box>
			</Card>

			{/* ── Per-destination source select popup ─────────────────── */}
			{(() => {
				const dest = activeDestinations[activeDestIndex];
				const destSources = dest ? (dest.Sources ?? props.Sources) : [];
				const destCurrentVal = dest ? (allValues[activeDestIndex] ?? 0) : 0;
				return (
					<TouchPanelOverlay
						open={destMenuOpen}
						onClose={handleDestMenuClose}
						title={dest?.Label ?? 'Select Source'}
					>
						{destSources.map((src) => {
							const isSelected = destCurrentVal === src.Value;
							return (
								<MenuItem key={src.Value} selected={isSelected} onClick={() => handleSelectDest(src.Value)} sx={menuItemSx}>
									<ListItemIcon sx={menuListItemIconSx}>{SourceIcon(src.Type)}</ListItemIcon>
									<ListItemText primaryTypographyProps={{ noWrap: true, width: '100%', textAlign: 'left', paddingLeft: 'clamp(8px, 1.5vw, 16px)' }}>{src.Label}</ListItemText>
									<CheckIcon color='inherit' sx={{ fontSize: menuIconSize, ml: 1, flexShrink: 0, visibility: isSelected ? 'visible' : 'hidden' }} />
								</MenuItem>
							);
						})}
					</TouchPanelOverlay>
				);
			})()}

			{/* ── "Route all" source select popup ──────────────────────── */}
			<TouchPanelOverlay
				open={menuOpen}
				onClose={handleMenuClose}
				title='Route All'
			>
				{options.map((option) => {
					const isSelected = consensusValue === option.value;
					return (
						<MenuItem
							key={option.value}
							selected={isSelected}
							onClick={() => handleSelectAll(option.value)}
							sx={menuItemSx}
						>
							<ListItemIcon sx={menuListItemIconSx}>{option.icon}</ListItemIcon>
							<ListItemText
								primaryTypographyProps={{
									noWrap: true,
									width: '100%',
									textAlign: 'left',
									paddingLeft: 'clamp(8px, 1.5vw, 16px)',
								}}
							>
								{option.label}
							</ListItemText>
							<CheckIcon
								color='inherit'
								sx={{
									fontSize: menuIconSize,
									ml: 1,
									flexShrink: 0,
									visibility: isSelected ? 'visible' : 'hidden',
								}}
							/>
						</MenuItem>
					);
				})}
			</TouchPanelOverlay>

			{/* ── Layout picker popup ──────────────────────────────────── */}
			{hasLayouts && (
				<TouchPanelOverlay
					open={layoutMenuOpen}
					onClose={handleLayoutMenuClose}
					title='Select Layout'
					icon={<GridViewIcon />}
				>
					{visibleLayouts.map((layout) => (
						<MenuItem
							key={layout.Value}
							selected={layout.Value === layoutValue}
							onClick={() => handleSelectLayout(layout.Value)}
							sx={menuItemSx}
						>
							<ListItemIcon sx={menuListItemIconSx}>
								<GridViewIcon />
							</ListItemIcon>
							<ListItemText
								primaryTypographyProps={{
									noWrap: true,
									width: '100%',
									textAlign: 'left',
									paddingLeft: 'clamp(8px, 1.5vw, 16px)',
								}}
							>
								{layout.Label}
							</ListItemText>
							<CheckIcon
								color='inherit'
								sx={{
									fontSize: menuIconSize,
									ml: 1,
									flexShrink: 0,
									visibility: layout.Value === layoutValue ? 'visible' : 'hidden',
								}}
							/>
						</MenuItem>
					))}
				</TouchPanelOverlay>
			)}
		</Box>
	);
};

// ── Public API ────────────────────────────────────────────────────────────────

export const VideoWallCard = (props: VideoWallCardProps): CardProps => ({
	label: props.Label,
	children: <VideoWallCardInner {...props} />,
});

export default VideoWallCard;
