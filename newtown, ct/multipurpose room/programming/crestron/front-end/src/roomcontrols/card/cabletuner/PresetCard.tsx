import React from 'react';

import {
	Box,
	Button,
	MenuItem,
	Typography,
} from '@mui/material';

import TouchPanelOverlay from '../../component/TouchPanelOverlay';

import LiveTvIcon from '@mui/icons-material/LiveTv';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import LabelOutlinedIcon from '@mui/icons-material/LabelOutlined';
import NumbersIcon from '@mui/icons-material/Numbers';

import { publishEvent, useSignalStore } from '../../../crestron/CrComLib';

import { CardProps } from '../Card';
import { ctBtn } from '../ctCardStyles';
import {
	sxCtrlBtn,
	ctrlBtnIconSize,
	overlayButtonContainedColor,
	cardInnerGap,
	menuIconSize,
} from '../../theme/tokens';
import CrestronButton from '../../component/CrestronButton';
import SelectCard, { type SelectOption } from '../../component/SelectCard';
import TextKeyboardPopover from '../../component/TextKeyboardPopover';
import NumericKeypadPopover from '../../component/NumericKeypadPopover';
import MessagePopover from '../../component/MessagePopover';
import OverflowMarqueeText from '../../component/OverflowMarqueeText';
import { selectionMenuItemSx } from '../../component/selectionPopoverStyles';
import { overlayFieldFontSize } from '../../component/touchPanelOverlayStyles';

import type { CameraOption } from '../camera/types';

// ── Types ─────────────────────────────────────────────────────────────────────

export type CableTvPresetCardProps = {
	select: {
		signal: string;
		options: CameraOption[];
		/** Serial joins for per-slot channel names (index-aligned with select.interaction). */
		presetNameSignals: string[];
		/** Analog joins for per-slot channel numbers (index-aligned with select.interaction). */
		presetNumberSignals: string[];
	};
	activate?: string;
	create?: string;
	update?: string;
	delete?: string;
};

type KeyboardMode = 'create' | 'update';
type EditChoiceMode = 'create' | 'update';

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

const saveBtnMutedSx = {
	opacity: 0.45,
} as const;

const PRESET_FIELD_PLACEHOLDER = 'Tap to set...';

const presetChoiceGridSx = {
	display: 'grid',
	gridTemplateColumns: '1fr 1fr',
	columnGap: cardInnerGap,
	rowGap: '2px',
	width: '100%',
} as const;

const presetChoiceRowSx = {
	...selectionMenuItemSx,
	gridColumn: '1 / -1',
	display: 'grid',
	gridTemplateColumns: 'subgrid',
	alignItems: 'center',
	width: '100%',
	py: 'clamp(10px, 1.25vw, 18px)',
} as const;

const presetChoiceFieldSx = {
	display: 'flex',
	alignItems: 'center',
	justifyContent: 'center',
	gap: cardInnerGap,
	whiteSpace: 'nowrap',
	minWidth: 0,
} as const;

const presetChoiceIconSx = {
	display: 'flex',
	alignItems: 'center',
	flexShrink: 0,
	'& .MuiSvgIcon-root': { fontSize: menuIconSize, color: '#fff' },
} as const;

const presetChoiceLabelSx = {
	fontWeight: 600,
	fontSize: overlayFieldFontSize,
	color: '#fff',
	lineHeight: 1.2,
} as const;

const presetChoiceValueBoxSx = {
	flex: 1,
	minWidth: 0,
	display: 'flex',
	alignItems: 'center',
	justifyContent: 'center',
	boxSizing: 'border-box',
	background: 'transparent',
} as const;

const presetChoiceValueTextSx = (hasValue: boolean) => ({
	lineHeight: 1.1,
	fontSize: overlayFieldFontSize,
	fontWeight: hasValue ? 600 : 400,
	fontStyle: hasValue ? 'normal' : 'italic',
	color: 'rgba(255,255,255,0.9)',
} as const);

function slotIndex(selectedValue: number, slotCount: number): number | undefined {
	const idx = selectedValue - 1;
	if (idx < 0 || idx >= slotCount) return undefined;
	return idx;
}

function formatChannelCaption(name: string, channel: number): string {
	return channel > 0 ? `${name} (Ch ${channel})` : name;
}

function isPresetComplete(
	strings: Record<string, string>,
	numbers: Record<string, number>,
	nameSig: string,
	numSig: string,
): boolean {
	const name = (strings[nameSig] ?? '').trim();
	const channel = numbers[numSig] ?? 0;
	return name.length > 0 && channel > 0;
}

/** First slot that is not a complete preset (label + channel number). */
function firstSaveableSlotIndex(
	nameSignals: readonly string[],
	numberSignals: readonly string[],
	strings: Record<string, string>,
	numbers: Record<string, number>,
): number {
	return nameSignals.findIndex((nameSig, i) => {
		const numSig = numberSignals[i];
		return numSig ? !isPresetComplete(strings, numbers, nameSig, numSig) : false;
	});
}

// ── Inner component ───────────────────────────────────────────────────────────

const PresetCardInner: React.FC<CableTvPresetCardProps> = (props) => {
	const selectedValue = useSignalStore((s) => s.numbers[props.select.signal] ?? 0);
	const strings = useSignalStore((s) => s.strings);
	const numbers = useSignalStore((s) => s.numbers);

	const [editChoiceOpen, setEditChoiceOpen] = React.useState(false);
	const [editChoiceMode, setEditChoiceMode] = React.useState<EditChoiceMode | null>(null);
	const [createSessionSlotIdx, setCreateSessionSlotIdx] = React.useState<number | null>(null);
	const [createDraftLabel, setCreateDraftLabel] = React.useState('');
	const [createDraftChannel, setCreateDraftChannel] = React.useState<number | null>(null);
	const [updateDraftLabel, setUpdateDraftLabel] = React.useState('');
	const [updateDraftChannel, setUpdateDraftChannel] = React.useState<number | null>(null);

	const [maxPresetsOpen, setMaxPresetsOpen] = React.useState(false);

	const [nameKeyboardOpen, setNameKeyboardOpen] = React.useState(false);
	const [nameKeyboardMode, setNameKeyboardMode] = React.useState<KeyboardMode | null>(null);

	const [numberOpen, setNumberOpen] = React.useState(false);
	const [numberDraft, setNumberDraft] = React.useState('');
	const [numberKeyboardMode, setNumberKeyboardMode] = React.useState<KeyboardMode | null>(null);
	const activeSlotIdxRef = React.useRef<number | undefined>();

	const selectedIdx = slotIndex(selectedValue, props.select.presetNameSignals.length);

	const selectedPresetLabel = React.useMemo(() => {
		if (selectedIdx === undefined) return '';
		return (strings[props.select.presetNameSignals[selectedIdx]] ?? '').trim();
	}, [selectedIdx, props.select.presetNameSignals, strings]);

	const selectedPresetChannel = React.useMemo(() => {
		if (selectedIdx === undefined) return 0;
		return numbers[props.select.presetNumberSignals[selectedIdx]] ?? 0;
	}, [selectedIdx, props.select.presetNumberSignals, numbers]);

	const firstSaveableSlotIdx = React.useMemo(
		() => firstSaveableSlotIndex(
			props.select.presetNameSignals,
			props.select.presetNumberSignals,
			strings,
			numbers,
		),
		[props.select.presetNameSignals, props.select.presetNumberSignals, strings, numbers],
	);

	const allPresetsComplete = React.useMemo(
		() => props.select.presetNameSignals.every((nameSig, i) => {
			const numSig = props.select.presetNumberSignals[i];
			return numSig ? isPresetComplete(strings, numbers, nameSig, numSig) : false;
		}),
		[props.select.presetNameSignals, props.select.presetNumberSignals, strings, numbers],
	);

	const canSave = !allPresetsComplete || createSessionSlotIdx !== null;

	const isCreateSessionComplete = React.useMemo(
		() => createDraftLabel.trim().length > 0
			&& createDraftChannel !== null
			&& createDraftChannel > 0,
		[createDraftLabel, createDraftChannel],
	);

	const resetCreateDrafts = React.useCallback(() => {
		setCreateDraftLabel('');
		setCreateDraftChannel(null);
	}, []);

	const resetUpdateDrafts = React.useCallback(() => {
		setUpdateDraftLabel('');
		setUpdateDraftChannel(null);
	}, []);

	const openNumberKeyboard = React.useCallback((mode: KeyboardMode) => {
		const idx = activeSlotIdxRef.current;
		if (idx === undefined || idx < 0) return;
		setNumberKeyboardMode(mode);
		if (mode === 'create') {
			const initial = createDraftChannel !== null && createDraftChannel > 0
				? String(createDraftChannel)
				: '';
			setNumberDraft(initial);
		} else {
			const initial = updateDraftChannel !== null && updateDraftChannel > 0
				? String(updateDraftChannel)
				: '';
			setNumberDraft(initial);
		}
		setNumberOpen(true);
	}, [createDraftChannel, updateDraftChannel]);

	const closeEditChoicePopover = React.useCallback(() => {
		setEditChoiceOpen(false);
		setEditChoiceMode(null);
		resetUpdateDrafts();
	}, [resetUpdateDrafts]);

	const endCreateSession = React.useCallback(() => {
		setCreateSessionSlotIdx(null);
		resetCreateDrafts();
		closeEditChoicePopover();
	}, [resetCreateDrafts, closeEditChoicePopover]);

	const openEditChoice = React.useCallback((mode: EditChoiceMode) => {
		if (mode === 'update' && selectedIdx !== undefined && selectedIdx >= 0) {
			const nameSig = props.select.presetNameSignals[selectedIdx];
			const numSig = props.select.presetNumberSignals[selectedIdx];
			const channel = numSig ? (numbers[numSig] ?? 0) : 0;
			setUpdateDraftLabel(nameSig ? (strings[nameSig] ?? '').trim() : '');
			setUpdateDraftChannel(channel > 0 ? channel : null);
		}
		setEditChoiceMode(mode);
		setEditChoiceOpen(true);
	}, [
		selectedIdx,
		props.select.presetNameSignals,
		props.select.presetNumberSignals,
		strings,
		numbers,
	]);

	const handleDismissEditChoice = React.useCallback(() => {
		if (editChoiceMode === 'create' && createSessionSlotIdx !== null) {
			endCreateSession();
			return;
		}
		closeEditChoicePopover();
	}, [editChoiceMode, createSessionSlotIdx, endCreateSession, closeEditChoicePopover]);

	const handleSaveClick = React.useCallback(() => {
		if (allPresetsComplete && createSessionSlotIdx === null) {
			setMaxPresetsOpen(true);
			return;
		}
		if (createSessionSlotIdx !== null) {
			openEditChoice('create');
			return;
		}
		if (firstSaveableSlotIdx >= 0) {
			setCreateSessionSlotIdx(firstSaveableSlotIdx);
			resetCreateDrafts();
			openEditChoice('create');
		}
	}, [allPresetsComplete, createSessionSlotIdx, firstSaveableSlotIdx, resetCreateDrafts, openEditChoice]);

	const handleCreateLabelDraft = React.useCallback((value: string) => {
		setCreateDraftLabel(value);
	}, []);

	const handleUpdateLabelDraft = React.useCallback((value: string) => {
		setUpdateDraftLabel(value);
	}, []);

	const nameKeyboardSlotIdx = nameKeyboardMode === 'create'
		? createSessionSlotIdx
		: selectedIdx;
	const nameKeyboardSignal = nameKeyboardSlotIdx !== null
		&& nameKeyboardSlotIdx !== undefined
		&& nameKeyboardSlotIdx >= 0
		? props.select.presetNameSignals[nameKeyboardSlotIdx]
		: undefined;

	const handleCloseNameKeyboard = React.useCallback(() => {
		setNameKeyboardOpen(false);
		setNameKeyboardMode(null);
	}, []);

	const isUpdateSessionComplete = React.useMemo(
		() => updateDraftLabel.trim().length > 0
			&& updateDraftChannel !== null
			&& updateDraftChannel > 0,
		[updateDraftLabel, updateDraftChannel],
	);

	const handleCreateSessionComplete = React.useCallback(() => {
		if (!isCreateSessionComplete || createSessionSlotIdx === null || createSessionSlotIdx < 0) return;
		const nameSig = props.select.presetNameSignals[createSessionSlotIdx];
		const numSig = props.select.presetNumberSignals[createSessionSlotIdx];
		if (nameSig) publishEvent('string', nameSig, createDraftLabel.trim());
		if (numSig && createDraftChannel !== null) {
			publishEvent('number', numSig, createDraftChannel);
		}
		if (props.create) {
			publishEvent('boolean', props.create, true);
			publishEvent('boolean', props.create, false);
		}
		endCreateSession();
	}, [
		isCreateSessionComplete,
		createSessionSlotIdx,
		createDraftLabel,
		createDraftChannel,
		props.select.presetNameSignals,
		props.select.presetNumberSignals,
		props.create,
		endCreateSession,
	]);

	const handleUpdateSessionComplete = React.useCallback(() => {
		if (!isUpdateSessionComplete || selectedIdx === undefined || selectedIdx < 0) return;
		const nameSig = props.select.presetNameSignals[selectedIdx];
		const numSig = props.select.presetNumberSignals[selectedIdx];
		if (nameSig) publishEvent('string', nameSig, updateDraftLabel.trim());
		if (numSig && updateDraftChannel !== null) {
			publishEvent('number', numSig, updateDraftChannel);
		}
		if (props.update) {
			publishEvent('boolean', props.update, true);
			publishEvent('boolean', props.update, false);
		}
		closeEditChoicePopover();
	}, [
		isUpdateSessionComplete,
		selectedIdx,
		updateDraftLabel,
		updateDraftChannel,
		props.select.presetNameSignals,
		props.select.presetNumberSignals,
		props.update,
		closeEditChoicePopover,
	]);

	const handleEditLabelChoice = React.useCallback(() => {
		const mode = editChoiceMode;
		if (!mode) return;
		if (mode === 'create') {
			if (createSessionSlotIdx === null || createSessionSlotIdx < 0) return;
			activeSlotIdxRef.current = createSessionSlotIdx;
		} else if (selectedIdx === undefined || selectedIdx < 0) {
			return;
		} else {
			activeSlotIdxRef.current = selectedIdx;
		}
		setNameKeyboardMode(mode);
		setNameKeyboardOpen(true);
	}, [editChoiceMode, createSessionSlotIdx, selectedIdx]);

	const handleEditNumberChoice = React.useCallback(() => {
		const mode = editChoiceMode;
		if (!mode) return;
		const idx = mode === 'create' ? createSessionSlotIdx : selectedIdx;
		if (idx === undefined || idx === null || idx < 0) return;
		activeSlotIdxRef.current = idx;
		openNumberKeyboard(mode);
	}, [editChoiceMode, createSessionSlotIdx, selectedIdx, openNumberKeyboard]);

	const handleNumberKey = React.useCallback((key: string) => {
		if (key === 'back') {
			setNumberDraft((prev) => prev.slice(0, -1));
		} else {
			setNumberDraft((prev) => (prev.length < 6 ? prev + key : prev));
		}
	}, []);

	const handleNumberConfirm = React.useCallback(() => {
		const parsed = parseInt(numberDraft, 10);
		const channel = numberDraft.length > 0 ? (parsed || 0) : null;
		if (numberKeyboardMode === 'create') {
			setCreateDraftChannel(channel);
		} else if (numberKeyboardMode === 'update') {
			setUpdateDraftChannel(channel);
		}
		setNumberOpen(false);
		setNumberDraft('');
		setNumberKeyboardMode(null);
	}, [numberKeyboardMode, numberDraft]);

	const handleCloseNumberKeyboard = React.useCallback(() => {
		setNumberOpen(false);
		setNumberDraft('');
		setNumberKeyboardMode(null);
	}, []);

	const presetOptions: SelectOption[] = props.select.options
		.filter((o) => {
			const idx = o.Value - 1;
			const nameSig = props.select.presetNameSignals[idx];
			const numSig = props.select.presetNumberSignals[idx];
			if (!nameSig || !numSig) return false;
			return isPresetComplete(strings, numbers, nameSig, numSig);
		})
		.map((o) => {
			const idx = o.Value - 1;
			const numSig = props.select.presetNumberSignals[idx];
			const channel = numSig ? (numbers[numSig] ?? 0) : 0;
			return {
				value: o.Value,
				label: formatChannelCaption(o.Label, channel),
				icon: <LiveTvIcon /> as React.ReactNode,
			};
		});

	const hasPresetSelected = React.useMemo(
		() => presetOptions.some((o) => o.value === selectedValue),
		[presetOptions, selectedValue],
	);

	const canRecallSelected = Boolean(props.activate && hasPresetSelected);
	const canUpdateSelected = Boolean(props.update && hasPresetSelected);
	const canDeleteSelected = Boolean(props.delete && hasPresetSelected);

	const handleDeleteClick = React.useCallback(() => {
		if (selectedIdx === undefined || selectedIdx < 0 || !props.delete) return;
		const nameSig = props.select.presetNameSignals[selectedIdx];
		const numSig = props.select.presetNumberSignals[selectedIdx];
		if (nameSig) publishEvent('string', nameSig, '');
		if (numSig) publishEvent('number', numSig, 0);
		publishEvent('number', props.select.signal, 0);
		publishEvent('boolean', props.delete, true);
		publishEvent('boolean', props.delete, false);
	}, [selectedIdx, props.delete, props.select.signal, props.select.presetNameSignals, props.select.presetNumberSignals]);

	const additionalButtons: React.ReactNode[] | undefined = (() => {
		const btns: React.ReactNode[] = [
			...(props.activate ? [
				<CrestronButton
					key='activate'
					signal={props.activate}
					ButtonProps={{
						sx: { ...btnSx, ...(!canRecallSelected ? saveBtnMutedSx : undefined) },
						disabled: !canRecallSelected,
						children: ctBtn(<LiveTvIcon />, 'Recall'),
					}}
				/>,
			] : []),
			...(props.create ? [
				<Button
					key='create'
					variant='outlined'
					sx={{ ...btnSx, ...(!canSave ? saveBtnMutedSx : undefined) }}
					onClick={() => handleSaveClick()}
					aria-label='Save preset'
				>
					{ctBtn(<AddIcon />, 'Save')}
				</Button>,
			] : []),
			...(props.update ? [
				<Button
					key='update'
					variant='outlined'
					sx={{ ...btnSx, ...(!canUpdateSelected ? saveBtnMutedSx : undefined) }}
					onClick={() => openEditChoice('update')}
					disabled={!canUpdateSelected}
					aria-label='Update preset'
				>
					{ctBtn(<EditIcon />, 'Update')}
				</Button>,
			] : []),
			...(props.delete ? [
				<Button
					key='delete'
					variant='outlined'
					sx={{ ...btnSx, ...(!canDeleteSelected ? saveBtnMutedSx : undefined) }}
					onClick={handleDeleteClick}
					disabled={!canDeleteSelected}
					aria-label='Delete preset'
				>
					{ctBtn(<DeleteIcon />, 'Delete')}
				</Button>,
			] : []),
		];
		return btns.length > 0 ? btns : undefined;
	})();

	const editChoiceLabelValue = editChoiceMode === 'create'
		? createDraftLabel.trim()
		: editChoiceMode === 'update'
			? updateDraftLabel.trim()
			: selectedPresetLabel;
	const editChoiceChannelValue = editChoiceMode === 'create'
		? (createDraftChannel !== null && createDraftChannel > 0 ? String(createDraftChannel) : '')
		: editChoiceMode === 'update'
			? (updateDraftChannel !== null && updateDraftChannel > 0 ? String(updateDraftChannel) : '')
			: (selectedPresetChannel > 0 ? String(selectedPresetChannel) : '');

	const editChoiceFooterButtonSx = {
		fontWeight: 700,
		fontSize: 'clamp(13px, 1.8vw, 35px)',
		py: 'clamp(6px, 0.83vw, 16px)',
	} as const;

	return (
		<>
			<SelectCard
				signal={props.select.signal}
				title='Preset'
				cardIcon={<LiveTvIcon />}
				options={presetOptions}
				optionType='preset'
				additionalButtons={additionalButtons}
			/>
			<TouchPanelOverlay
				open={editChoiceOpen}
				onClose={handleDismissEditChoice}
				title={editChoiceMode === 'create' ? 'Save Preset' : 'Update Preset'}
				icon={<LiveTvIcon />}
				footer={editChoiceMode ? (
					<Button
						variant='contained'
						fullWidth
						disabled={
							editChoiceMode === 'create'
								? !isCreateSessionComplete
								: !isUpdateSessionComplete
						}
						onClick={
							editChoiceMode === 'create'
								? handleCreateSessionComplete
								: handleUpdateSessionComplete
						}
						sx={editChoiceFooterButtonSx}
					>
						{editChoiceMode === 'create' ? 'Save' : 'Update'}
					</Button>
				) : undefined}
			>
				<Box sx={presetChoiceGridSx}>
					<MenuItem onClick={handleEditLabelChoice} sx={presetChoiceRowSx}>
						<Box sx={presetChoiceFieldSx}>
							<Box sx={presetChoiceIconSx}>
								<LabelOutlinedIcon />
							</Box>
							<Typography sx={presetChoiceLabelSx}>
								Preset Label
							</Typography>
						</Box>
						<Box sx={presetChoiceValueBoxSx}>
							<OverflowMarqueeText
								variant='caption'
								centerWhenIdle
								sx={presetChoiceValueTextSx(editChoiceLabelValue.length > 0)}
							>
								{editChoiceLabelValue || PRESET_FIELD_PLACEHOLDER}
							</OverflowMarqueeText>
						</Box>
					</MenuItem>
					<MenuItem onClick={handleEditNumberChoice} sx={presetChoiceRowSx}>
						<Box sx={presetChoiceFieldSx}>
							<Box sx={presetChoiceIconSx}>
								<NumbersIcon />
							</Box>
							<Typography sx={presetChoiceLabelSx}>
								Channel Number
							</Typography>
						</Box>
						<Box sx={presetChoiceValueBoxSx}>
							<OverflowMarqueeText
								variant='caption'
								centerWhenIdle
								sx={presetChoiceValueTextSx(editChoiceChannelValue.length > 0)}
							>
								{editChoiceChannelValue || PRESET_FIELD_PLACEHOLDER}
							</OverflowMarqueeText>
						</Box>
					</MenuItem>
				</Box>
			</TouchPanelOverlay>
			{nameKeyboardSignal && nameKeyboardMode && (
				<TextKeyboardPopover
					open={nameKeyboardOpen}
					onClose={handleCloseNameKeyboard}
					stringSignal={nameKeyboardSignal}
					initialValue={
						nameKeyboardMode === 'create'
							? createDraftLabel
							: updateDraftLabel
					}
					title={nameKeyboardMode === 'create' ? 'Preset Label' : 'Update Preset Label'}
					onConfirmDraft={
						nameKeyboardMode === 'create'
							? handleCreateLabelDraft
							: handleUpdateLabelDraft
					}
					zIndex={1400}
				/>
			)}
			{numberOpen && (
				<NumericKeypadPopover
					open={numberOpen}
					onClose={handleCloseNumberKeyboard}
					draft={numberDraft}
					onKey={handleNumberKey}
					onConfirm={handleNumberConfirm}
					title='Channel Number'
					confirmLabel='Set'
					zIndex={1400}
				/>
			)}
			<MessagePopover
				open={maxPresetsOpen}
				onClose={() => setMaxPresetsOpen(false)}
				title='Save Preset'
				message='Maximum number of presets are set'
			/>
		</>
	);
};

// ── Public API ────────────────────────────────────────────────────────────────

const PresetCard = (props: CableTvPresetCardProps): CardProps => ({
	label: 'Preset',
	children: <PresetCardInner {...props} />,
});

export default PresetCard;
