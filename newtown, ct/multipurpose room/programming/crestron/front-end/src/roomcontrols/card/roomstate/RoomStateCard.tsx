import React from 'react';
import { Box } from '@mui/material';
import MeetingRoomIcon from '@mui/icons-material/MeetingRoom';
import AutoModeIcon from '@mui/icons-material/AutoMode';
import TouchAppIcon from '@mui/icons-material/TouchApp';
import FiberManualRecordIcon from '@mui/icons-material/FiberManualRecord';
import {
	sxCtrlBtn,
	ctrlBtnIconSize,
	overlayButtonContainedColor,
	sxCardBtnSlot,
} from '../../theme/tokens';

import { useSignalStore } from '../../../crestron/CrComLib';

import SelectCard from '../../component/SelectCard';
import CrestronButton from '../../component/CrestronButton';
import { CardProps } from '../Card';
import { ctBtn } from '../ctCardStyles';

// ── Types ────────────────────────────────────────────────────────────

export type RoomStateOption = {
	Value: number;
	Label: string;
	/** Optional icon shown in the selection list. Defaults to a bullet. */
	Icon?: React.ReactNode;
};

export type RoomStateCardProps = {
	/** Available room states shown in the selection popup. */
	States: RoomStateOption[];
	/** Crestron number signal — read for current state value, published on select. */
	SelectSignal: string;
	/** Crestron digital feedback — manual mode active; select locked when low. */
	manualModeSignal: string;
	/** When defined, renders an "Automatic" button that switches to automatic mode. */
	automaticSignal?: string;
	/** When defined, renders a "Manual" button that switches to manual mode. */
	manualSignal?: string;
};

// GetRoomStateIconType has moved to ./typeHelpers. It is intentionally
// NOT re-exported from here so this heavy card module stays out of
// App.tsx's static dep graph.

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

// ── Inner component (owns useSignalStore) ────────────────────────────

const RoomStateCardInner: React.FC<RoomStateCardProps> = (props) => {
	const isManual = useSignalStore((s) => s.booleans[props.manualModeSignal] ?? false);
	const selectLocked = !isManual;

	const options = React.useMemo(
		() =>
			props.States.filter((s) => s.Label !== undefined && s.Label.length > 0).map((s) => ({
				value: s.Value,
				label: s.Label,
				icon: (s.Icon ?? <FiberManualRecordIcon />) as React.ReactNode,
			})),
		[props.States],
	);

	const additionalButtons: React.ReactNode[] | undefined = (() => {
		const btns: React.ReactNode[] = [
			...(props.automaticSignal ? [
				<Box
					key='roomstatecard-automatic'
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
					key='roomstatecard-manual'
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

	return (
		<SelectCard
			signal={props.SelectSignal}
			title={'Room State'}
			cardIcon={<MeetingRoomIcon />}
			options={options}
			optionType='room state'
			disableSelect={selectLocked}
			locked={selectLocked}
			pressHint='Tap to set'
			emptyCaption='Tap to set'
			additionalButtons={additionalButtons}
		/>
	);
};

// ── Public API ───────────────────────────────────────────────────────

const RoomStateCard = (props: RoomStateCardProps): CardProps => ({
	label: 'Room State',
	children: <RoomStateCardInner {...props} />,
});

export default RoomStateCard;
