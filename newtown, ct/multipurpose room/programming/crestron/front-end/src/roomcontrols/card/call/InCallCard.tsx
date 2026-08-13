import React from 'react';

import { Box, Typography } from '@mui/material';

import PhoneInTalkIcon from '@mui/icons-material/PhoneInTalk';
import PauseIcon from '@mui/icons-material/Pause';
import CallMergeIcon from '@mui/icons-material/CallMerge';
import SwapCallsIcon from '@mui/icons-material/SwapCalls';
import DialpadIcon from '@mui/icons-material/Dialpad';
import FiberManualRecordIcon from '@mui/icons-material/FiberManualRecord';
import PlayIcon from '@mui/icons-material/PlayArrow';
import StopIcon from '@mui/icons-material/Stop';
import CallEndIcon from '@mui/icons-material/CallEnd';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';

import { useSignalStore } from '../../../crestron/CrComLib';
import type { CallChannelInCallConfig } from '../../../config/signals';
import { CardProps } from '../Card';
import CrestronButton from '../../component/CrestronButton';
import SelectCard from '../../component/SelectCard';
import {
	buildToggleControlCard,
	recordActiveFlashSx,
} from '../../component/toggleControlCard';
import {
	connectBtnSx,
	connectCardHeaderSx,
} from '../../component/connectCardStyles';
import {
	connectMethodCard,
	ConnectStringRow,
} from './ConnectCard';
import { ctBtn } from '../ctCardStyles';
import {
	sxCtrlBtn,
	sxCardIcon,
	sxCardLabel,
	ctrlBtnIconSize,
	overlayButtonContainedColor,
	sxCardBtnSlot,
} from '../../theme/tokens';

const btnSx = {
	'&.MuiButton-outlined': {
		...sxCtrlBtn['&.MuiButton-outlined'],
		'& .MuiSvgIcon-root': { fontSize: ctrlBtnIconSize, color: '#fff' },
		'&.Mui-disabled': {
			backgroundColor: 'rgba(255,255,255,0.08)',
			color: 'rgba(255,255,255,0.38)',
			borderColor: 'rgba(255,255,255,0.2)',
			'& .MuiSvgIcon-root': { color: 'rgba(255,255,255,0.38)' },
			'& .MuiTypography-root': { color: 'rgba(255,255,255,0.38)' },
		},
	},
	'&.MuiButton-contained': {
		...sxCtrlBtn['&.MuiButton-contained'],
		'& .MuiSvgIcon-root': { fontSize: ctrlBtnIconSize, color: overlayButtonContainedColor },
		'&.Mui-disabled': {
			backgroundColor: 'rgba(255,255,255,0.08)',
			color: 'rgba(255,255,255,0.38)',
			borderColor: 'rgba(255,255,255,0.2)',
			'& .MuiSvgIcon-root': { color: 'rgba(255,255,255,0.38)' },
			'& .MuiTypography-root': { color: 'rgba(255,255,255,0.38)' },
		},
	},
} as const;

const disconnectBtnSx = {
	...btnSx,
	'&.MuiButton-outlined': {
		...btnSx['&.MuiButton-outlined'],
		backgroundColor: 'error.main',
		borderColor: 'error.main',
		color: '#fff',
		'& .MuiSvgIcon-root': { fontSize: ctrlBtnIconSize, color: '#fff' },
		'& .MuiTypography-root': { color: '#fff' },
		'&:hover': {
			backgroundColor: 'error.dark',
			borderColor: 'error.dark',
		},
	},
	'&.MuiButton-contained': {
		...btnSx['&.MuiButton-contained'],
		backgroundColor: 'error.dark',
		borderColor: 'error.dark',
		color: '#fff',
		'& .MuiSvgIcon-root': { fontSize: ctrlBtnIconSize, color: '#fff' },
		'& .MuiTypography-root': { color: '#fff' },
	},
} as const;

type InCallCallSlot = { label: string; address: string };

function buildInCallCallOptions(
	calls: readonly InCallCallSlot[],
	strings: Record<string, string>,
) {
	return calls.flatMap((call, index) => {
		const name = (strings[call.label] ?? '').trim();
		const address = (strings[call.address] ?? '').trim();
		if (!name && !address) {
			return [];
		}
		return [{
			value: index + 1,
			label: name || address,
			secondary: name && address ? address : undefined,
			icon: <PhoneInTalkIcon /> as React.ReactNode,
		}];
	});
}

const ActiveCallPanel: React.FC<{
	inCall: CallChannelInCallConfig;
	showSelect: boolean;
	showEnd: boolean;
}> = ({ inCall, showSelect, showEnd }) => {
	const strings = useSignalStore((s) => s.strings);
	const callLabel = (strings[inCall.label] ?? '').trim();
	const callAddress = (strings[inCall.address] ?? '').trim();
	const options = React.useMemo(
		() => (showSelect ? buildInCallCallOptions(inCall.select.calls, strings) : []),
		[inCall.select.calls, showSelect, strings],
	);
	const fixedCaption = !showSelect
		? (!callLabel && !callAddress
			? { label: 'Unknown Caller' }
			: {
				label: callLabel || callAddress,
				secondary: callLabel && callAddress ? callAddress : undefined,
			})
		: undefined;
	const showMenuIndicator = showSelect && options.length > 1;

	const additionalButtons = React.useMemo(() => {
		if (!showEnd) {
			return undefined;
		}
		return [
			<Box
				key='active-call-disconnect'
				onClick={(event) => event.stopPropagation()}
				onPointerDown={(event) => event.stopPropagation()}
				sx={sxCardBtnSlot}
			>
				<CrestronButton
					signal={inCall.end.interaction}
					ButtonProps={{
						sx: disconnectBtnSx,
						children: ctBtn(<CallEndIcon />, 'Disconnect'),
					}}
				/>
			</Box>,
		];
	}, [inCall.end.interaction, showEnd]);

	const captionAccessory = showMenuIndicator ? (
		<KeyboardArrowDownIcon
			sx={{
				fontSize: 'clamp(18px, 2.2vw, 32px)',
				color: '#fff',
				flexShrink: 0,
			}}
		/>
	) : null;

	return (
		<Box sx={{ width: '100%', position: 'relative' }}>
			<SelectCard
				signal={inCall.select.interaction}
				title='Call'
				cardIcon={<PhoneInTalkIcon />}
				options={options}
				disableSelect={!showSelect || options.length === 0}
				hideLockIcon={!showSelect}
				fixedCaption={fixedCaption}
				optionType='call'
				renderSelectedCaption={(option) => (
					option.secondary ? `${option.label} · ${option.secondary}` : option.label
				)}
				additionalButtons={additionalButtons}
				captionAccessory={captionAccessory}
			/>
		</Box>
	);
};

const TransferPanel: React.FC<{ inCall: CallChannelInCallConfig }> = ({ inCall }) => {
	const address = useSignalStore((s) => s.strings[inCall.transfer.address] ?? '');

	return (
		<>
			<Box sx={connectCardHeaderSx}>
				<Box sx={sxCardIcon}>
					<SwapCallsIcon />
				</Box>
				<Typography variant='body2' sx={{ ...sxCardLabel, flex: 1 }} noWrap>
					Transfer
				</Typography>
				<CrestronButton
					signal={inCall.transfer.interaction}
					ButtonProps={{
						disabled: address.trim().length === 0,
						sx: connectBtnSx,
						children: ctBtn(<SwapCallsIcon />, 'Transfer'),
					}}
				/>
			</Box>
			<ConnectStringRow
				title='Address'
				cardIcon={<DialpadIcon />}
				stringSignal={inCall.transfer.address}
				emptyCaption='Tap to enter address'
				keyboardTitle='Transfer address'
			/>
		</>
	);
};

const MergePanel: React.FC<{ inCall: CallChannelInCallConfig }> = ({ inCall }) => {
	const strings = useSignalStore((s) => s.strings);
	const selected = useSignalStore((s) => s.numbers[inCall.merge.select] ?? 0);
	const options = React.useMemo(
		() => buildInCallCallOptions(inCall.merge.calls, strings),
		[inCall.merge.calls, strings],
	);
	const canMerge = options.some((o) => o.value === selected);

	return (
		<>
			<Box sx={connectCardHeaderSx}>
				<Box sx={sxCardIcon}>
					<CallMergeIcon />
				</Box>
				<Typography variant='body2' sx={{ ...sxCardLabel, flex: 1 }} noWrap>
					Merge
				</Typography>
				<CrestronButton
					signal={inCall.merge.interaction}
					ButtonProps={{
						disabled: !canMerge,
						sx: connectBtnSx,
						children: ctBtn(<CallMergeIcon />, 'Merge'),
					}}
				/>
			</Box>
			<SelectCard
				signal={inCall.merge.select}
				title='Call'
				cardIcon={<PhoneInTalkIcon />}
				options={options}
				optionType='call'
				disableSelect={options.length === 0}
				renderSelectedCaption={(option) => (
					option.secondary ? `${option.label} · ${option.secondary}` : option.label
				)}
			/>
		</>
	);
};

export type InCallCardProps = {
	inCall: CallChannelInCallConfig;
	showSelect: boolean;
	showHold: boolean;
	showRecord: boolean;
	showMerge: boolean;
	showTransfer: boolean;
	showEnd: boolean;
};

export function buildInCallCards(props: InCallCardProps): CardProps[] {
	const { inCall } = props;
	const cards: CardProps[] = [];

	cards.push({
		label: 'Call',
		pin: 0,
		children: (
			<ActiveCallPanel
				inCall={inCall}
				showSelect={props.showSelect}
				showEnd={props.showEnd}
			/>
		),
	});

	if (props.showHold) {
		cards.push(buildToggleControlCard(
			'Hold',
			<PauseIcon />,
			inCall.hold.interaction,
			{
				keepCardActiveWhenMuted: true,
				mutedIcon: <PlayIcon />,
				unmutedIcon: <PauseIcon />,
				mutedLabel: 'Resume',
				unmutedLabel: 'Hold',
			},
		));
	}

	if (props.showRecord) {
		cards.push(buildToggleControlCard(
			'Record',
			<FiberManualRecordIcon />,
			inCall.record.interaction,
			{
				activeFlashSx: recordActiveFlashSx,
				activeCardLabel: 'Recording',
				mutedIcon: <StopIcon />,
				unmutedIcon: <PlayIcon />,
				mutedLabel: 'Stop',
				unmutedLabel: 'Start',
			},
		));
	}

	if (props.showTransfer) {
		cards.push(connectMethodCard('Transfer', <TransferPanel inCall={inCall} />));
	}

	if (props.showMerge) {
		cards.push(connectMethodCard('Merge', <MergePanel inCall={inCall} />));
	}

	return cards;
}

export default buildInCallCards;
