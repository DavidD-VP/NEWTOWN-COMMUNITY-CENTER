import React from 'react';

import {
	useSignalStore,
	publishEvent,
} from '../../../crestron/CrComLib';

import { Box, Button, Tooltip } from '@mui/material';

import SelectCard from '../../component/SelectCard';
import TvIcon from '@mui/icons-material/Tv';
import TvOffIcon from '@mui/icons-material/TvOff';
import GroupsIcon from '@mui/icons-material/Groups';
import CampaignIcon from '@mui/icons-material/Campaign';
import MonitorIcon from '@mui/icons-material/Monitor';
import LiveTvIcon from '@mui/icons-material/LiveTv';
import VoicemailIcon from '@mui/icons-material/Voicemail';
import CableIcon from '@mui/icons-material/Cable';
import CastIcon from '@mui/icons-material/Cast';
import ComputerIcon from '@mui/icons-material/Computer';
import LaptopIcon from '@mui/icons-material/Laptop';
import AlbumIcon from '@mui/icons-material/Album';
import CallIcon from '@mui/icons-material/Call';
import BluetoothIcon from '@mui/icons-material/Bluetooth';
import ProjectorIcon from '../../component/ProjectorIcon';
import VideoCallIcon from '@mui/icons-material/VideoCall';
import ScreenShareIcon from '@mui/icons-material/ScreenShare';
import ViewQuiltIcon from '@mui/icons-material/ViewQuilt';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import PowerSettingsNewIcon from '@mui/icons-material/PowerSettingsNew';
import LockIcon from '@mui/icons-material/Lock';
import LockOpenIcon from '@mui/icons-material/LockOpen';
import OutletIcon from '@mui/icons-material/Outlet';
import SettingsInputHdmiIcon from '@mui/icons-material/SettingsInputHdmi';
import { CardProps } from '../Card';
import SourcePreviewImage from '../../component/SourcePreviewImage';
import {
	sxCtrlBtn,
	ctrlBtnIconSize,
	colorPoweredOn,
	colorPoweredOff,
} from '../../theme/tokens';
import { ctBtn } from '../../card/ctCardStyles';

// ── Destination icon helper ──────────────────────────────────────────
export function DestinationIcon(
	type: DestinationCardProps['Type'] | undefined,
	label?: string,
): React.ReactElement {
	// Label-specific overrides for better visual differentiation
	const lowerLabel = (label ?? '').toLowerCase();
	if (lowerLabel.includes('cart')) return <ShoppingCartIcon />;
	if (lowerLabel.includes('zoom') || lowerLabel.includes('teams'))
		return <VideoCallIcon />;

	switch (type) {
		case 'Videowall':
			return <ViewQuiltIcon />;
		case 'Display':
			return <MonitorIcon />;
		case 'Projector':
			return <ProjectorIcon />;
		case 'Speaker':
			return <CampaignIcon />;
		case 'Monitor':
			return <TvIcon />;
		case 'Meeting':
			return <ScreenShareIcon />;
		case 'Recorder':
			return <VoicemailIcon />;
		case 'Livestream':
			return <LiveTvIcon />;
		default:
			return <TvIcon />;
	}
}

// ── Source icon helper ───────────────────────────────────────────────
export function SourceIcon(type: SourceProps['Type']): React.ReactElement {
	switch (type) {
		case 'Laptop':
			return <LaptopIcon />;
		case 'Wall Plate':
			return <OutletIcon />;
		case 'HDMI':
			return <SettingsInputHdmiIcon />;
		case 'USB-C':
			return <CableIcon />;
		case 'DisplayPort':
			return <SettingsInputHdmiIcon />;
		case 'Wireless':
			return <CastIcon />;
		case 'PC':
			return <ComputerIcon />;
		case 'Cable TV':
			return <LiveTvIcon />;
		case 'BluRay Player':
			return <AlbumIcon />;
		case 'Meeting':
			return <GroupsIcon />;
		case 'Call':
			return <CallIcon />;
		case 'Bluetooth':
			return <BluetoothIcon />;
		case undefined:
			return <TvOffIcon />;
		default:
			return <CableIcon />;
	}
}

// ── Power button sub-component (keeps hook call unconditional) ──────
const PowerButton = (props: { signal: string }) => {
	const isPowered = useSignalStore((s) => s.booleans[props.signal] ?? false);

	const handlePowerClick = React.useCallback(
		(e: React.MouseEvent) => {
			e.stopPropagation();
			publishEvent('boolean', props.signal, true);
			publishEvent('boolean', props.signal, false);
		},
		[props.signal],
	);

	return (
		<Tooltip title={isPowered ? 'Power Off' : 'Power On'} placement='top'>
			<Button
				variant={isPowered ? 'contained' : 'outlined'}
				onClick={handlePowerClick}
				aria-label={isPowered ? 'Power off' : 'Power on'}
				sx={{
					...sxCtrlBtn,
					'&.MuiButton-outlined': {
						...sxCtrlBtn['&.MuiButton-outlined'],
						'& .MuiSvgIcon-root': { fontSize: ctrlBtnIconSize, /* color: colorPoweredOff */ },
					},
					'&.MuiButton-contained': {
						...sxCtrlBtn['&.MuiButton-contained'],
						'& .MuiSvgIcon-root': { fontSize: ctrlBtnIconSize, /* color: colorPoweredOn */ },
					},
				}}
			>
				{ctBtn(<PowerSettingsNewIcon />, 'Power')}
			</Button>
		</Tooltip>
	);
};

// ── DisableSelect toggle button ─────────────────────────────────────
// Pulses the boolean signal (true then false) on every press, mirroring
// the Power button's momentary-press pattern.  The Crestron program
// owns the latched state and echoes it back on the same signal name,
// which drives this button's icon + variant.  Only rendered when
// DisableSelectVisibleSignal is true.
const DisableSelectToggleButton = (props: { signal: string }) => {
	const isLocked = useSignalStore((s) => s.booleans[props.signal] ?? false);

	const handleClick = React.useCallback(
		(e: React.MouseEvent) => {
			e.stopPropagation();
			publishEvent('boolean', props.signal, true);
			publishEvent('boolean', props.signal, false);
		},
		[props.signal],
	);

	return (
		<Tooltip title={isLocked ? 'Unlock source select' : 'Lock source select'} placement='top'>
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
		</Tooltip>
	);
};

// ── Types ────────────────────────────────────────────────────────────

export type SourceProps = {
	Type?: 'Laptop' | 'Wall Plate' | 'HDMI' | 'USB-C' | 'DisplayPort' | 'Wireless' | 'PC' | 'Cable TV' | 'BluRay Player' | 'Meeting' | 'Call' | 'Bluetooth',
	Label: string,
	Value: number,
	/** Relative or absolute URL path from global source preview serial (1701–1726). */
	PreviewPath?: string,
}

export type DestinationCardProps = {
	/** Resolved destination type (page reads numbers[X], maps to icon). */
	Type: 'Display' | 'Projector' | 'Speaker' | 'Monitor' | 'Videowall' | 'Meeting' | 'Recorder' | 'Livestream',
	/** Resolved label (page reads strings[X]); used for header + sort key. */
	Label: string,
	/** Resolved source list (page reads types + labels). */
	Sources: Array<SourceProps>,
	/** Crestron analog signal that drives the current source selection. */
	Select: string,
	/** Crestron digital signal that, when true, locks the select control. */
	DisableSelectSignal?: string,
	/** Crestron digital signal that, when true, shows a lock / unlock toggle
	 * button next to the Power button.  The button latches `DisableSelectSignal`
	 * between true and false on every press. */
	DisableSelectVisibleSignal?: string,
	/** Crestron digital signal that gates whether the Power button is shown
	 * (typically a "feedback says this destination supports power" flag). */
	PowerEnableSignal?: string,
	/** Crestron digital signal that holds the current power state. Drives
	 * the card's muted styling. */
	PowerStateSignal?: string,
	/** When true, prepends "Stop Sharing" (value 0) while `Select` feedback is non-zero. */
	StopSharingWhenActive?: boolean,
	/** Crestron digital signal that, when true, prepends a "No Source" entry. */
	NoSourceSignal?: string,
};

// GetSourceType / GetDestinationType have moved to ./typeHelpers.
// They are intentionally NOT re-exported from here so this heavy
// card module stays out of App.tsx's static dep graph.

// ── Inner component: subscribes to boolean state at the leaf ─────────

const DestinationCardInner: React.FC<DestinationCardProps> = (props) => {
	// Each selector reads a single boolean; the card only re-renders when
	// that specific signal changes.  No props tree churn from the page.
	const disableSelect = useSignalStore((s) =>
		props.DisableSelectSignal ? (s.booleans[props.DisableSelectSignal] ?? false) : false,
	);
	const disableSelectToggleVisible = useSignalStore((s) =>
		props.DisableSelectVisibleSignal ? (s.booleans[props.DisableSelectVisibleSignal] ?? false) : false,
	);
	const powerEnabled = useSignalStore((s) =>
		props.PowerEnableSignal ? (s.booleans[props.PowerEnableSignal] ?? false) : false,
	);
	const powerOn = useSignalStore((s) =>
		props.PowerStateSignal ? (s.booleans[props.PowerStateSignal] ?? false) : false,
	);
	const noSource = useSignalStore((s) =>
		props.NoSourceSignal ? (s.booleans[props.NoSourceSignal] ?? false) : false,
	);
	const currentValue = useSignalStore((s) => s.numbers[props.Select] ?? 0);
	const showStopSharing = Boolean(props.StopSharingWhenActive && currentValue !== 0);
	const options = React.useMemo(
		() => [
			...(showStopSharing
				? [{ value: 0, label: 'Stop Sharing', icon: SourceIcon(undefined) as React.ReactNode }]
				: []),
			...(noSource ? [{ value: 0, label: 'No Source', icon: SourceIcon(undefined) as React.ReactNode }] : []),
			...props.Sources.map((s) => ({
					value: s.Value,
					label: s.Label,
					icon: SourceIcon(s.Type) as React.ReactNode,
				})),
		],
		[props.Sources, noSource, showStopSharing],
	);

	const muted = props.PowerStateSignal && powerEnabled ? !powerOn : undefined;

	const cardPreview = React.useMemo(() => {
		if (currentValue <= 0) return undefined;
		const source = props.Sources.find((s) => s.Value === currentValue);
		if (!source?.PreviewPath) return undefined;
		return (
			<SourcePreviewImage
				assetPath={source.PreviewPath}
				alt={source.Label}
			/>
		);
	}, [currentValue, props.Sources]);

	const additionalButtons = React.useMemo(() => {
		const buttons: React.ReactNode[] = [];
		if (disableSelectToggleVisible && props.DisableSelectSignal) {
			buttons.push(
				<DisableSelectToggleButton
					key='disable-select-toggle'
					signal={props.DisableSelectSignal}
				/>,
			);
		}
		if (powerEnabled && props.PowerStateSignal) {
			buttons.push(<PowerButton key='power' signal={props.PowerStateSignal} />);
		}
		return buttons.length > 0 ? buttons : undefined;
	}, [
		disableSelectToggleVisible,
		props.DisableSelectSignal,
		powerEnabled,
		props.PowerStateSignal,
	]);

	return (
		<SelectCard
			muted={muted}
			signal={props.Select}
			title={props.Label}
			cardIcon={DestinationIcon(props.Type, props.Label)}
			options={options}
			optionType='source'
			disableSelect={disableSelect}
			locked={disableSelect}
			additionalButtons={additionalButtons}
			cardPreview={cardPreview}
			renderSelectedCaption={(option) => {
				const source = props.Sources.find((s) => s.Value === option.value);
				if (!source) return option.label;
				return (
					<Box
						component='span'
						sx={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}
					>
						<Box
							component='span'
							sx={{ display: 'inline-flex', '& .MuiSvgIcon-root': { fontSize: 'clamp(11px, 1.52vw, 29px)' } }}
						>
							{SourceIcon(source.Type)}
						</Box>
						{option.label}
					</Box>
				);
			}}
		/>
	);
};

// ── Public API ───────────────────────────────────────────────────────

export const DestinationCard = (props: DestinationCardProps): CardProps => ({
	label: props.Label,
	children: <DestinationCardInner {...props} />,
});

export default DestinationCard;
