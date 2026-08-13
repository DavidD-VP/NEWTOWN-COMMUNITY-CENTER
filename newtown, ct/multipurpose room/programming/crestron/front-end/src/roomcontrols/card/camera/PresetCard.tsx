import React from 'react';

import { Box, Button } from '@mui/material';

import BoltIcon from '@mui/icons-material/Bolt';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

import { useSignalStore, publishEvent } from '../../../crestron/CrComLib';

import { CardProps } from '../Card';
import { ctBtn } from '../ctCardStyles';
import {
	sxCtrlBtn,
	ctrlBtnIconSize,
	overlayButtonContainedColor,
} from '../../theme/tokens';
import CrestronButton from '../../component/CrestronButton';
import SelectCard from '../../component/SelectCard';
import TextKeyboardCard from '../../component/TextKeyboardCard';
import { usePageEditor } from '../../page/PageEditorContext';
import MessagePopover from '../../component/MessagePopover';

import type { CameraOption } from './types';

// ── Types ─────────────────────────────────────────────────────────────────────

export type PresetCardProps = {
	select: {
		signal: string;
		options: CameraOption[];
		/** Serial joins for preset names (index-aligned with select.interaction). */
		presetLabelSignals: string[];
	};
	activate?: string;
	create?: string;
	update?: string;
	delete?: string;
};

type KeyboardMode = 'create' | 'update';

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

function slotIndex(selectedValue: number, slotCount: number): number | undefined {
	const idx = selectedValue - 1;
	if (idx < 0 || idx >= slotCount) return undefined;
	return idx;
}

// ── Inner component ───────────────────────────────────────────────────────────

const PresetCardInner: React.FC<PresetCardProps> = (props) => {
	const selectedValue = useSignalStore((s) => s.numbers[props.select.signal] ?? 0);
	const strings = useSignalStore((s) => s.strings);
	const pageEditor = usePageEditor();

	const [maxPresetsOpen, setMaxPresetsOpen] = React.useState(false);

	const selectedIdx = slotIndex(selectedValue, props.select.presetLabelSignals.length);

	const canSave = React.useMemo(
		() => props.select.presetLabelSignals.some(
			(sig) => (strings[sig] ?? '').trim().length === 0,
		),
		[props.select.presetLabelSignals, strings],
	);

	const firstEmptyIdx = React.useMemo(
		() => props.select.presetLabelSignals.findIndex(
			(sig) => (strings[sig] ?? '').trim().length === 0,
		),
		[props.select.presetLabelSignals, strings],
	);

	const openKeyboard = React.useCallback(
		(mode: KeyboardMode, slotIdx?: number) => {
			if (!pageEditor) return;
			const idx = mode === 'create' ? slotIdx : selectedIdx;
			if (idx === undefined || idx < 0) return;
			const labelSignal = props.select.presetLabelSignals[idx];
			const confirmSignal =
				mode === 'create' ? props.create
				: mode === 'update' ? props.update
				: undefined;
			pageEditor.openPageEditor(
				<TextKeyboardCard
					stringSignal={labelSignal}
					confirmSignal={confirmSignal}
					initialValue={strings[labelSignal] ?? ''}
					title={mode === 'create' ? 'Save Preset' : 'Update Preset'}
					onClose={pageEditor.closePageEditor}
				/>,
			);
		},
		[pageEditor, selectedIdx, props.select.presetLabelSignals, props.create, props.update, strings],
	);

	const handleSaveClick = React.useCallback(() => {
		if (!canSave) {
			setMaxPresetsOpen(true);
			return;
		}
		if (firstEmptyIdx >= 0) {
			openKeyboard('create', firstEmptyIdx);
		}
	}, [canSave, firstEmptyIdx, openKeyboard]);

	const presetOptions = props.select.options
		.filter((o) => o.Label.trim().length > 0)
		.map((o) => ({
			value: o.Value,
			label: o.Label,
			icon: <BoltIcon /> as React.ReactNode,
		}));

	const hasPresetSelected = React.useMemo(
		() => presetOptions.some((o) => o.value === selectedValue),
		[presetOptions, selectedValue],
	);

	const canRecallSelected = Boolean(props.activate && hasPresetSelected);
	const canUpdateSelected = Boolean(props.update && hasPresetSelected);
	const canDeleteSelected = Boolean(props.delete && hasPresetSelected);

	const handleDeleteClick = React.useCallback(() => {
		if (selectedIdx === undefined || selectedIdx < 0 || !props.delete) return;
		const labelSig = props.select.presetLabelSignals[selectedIdx];
		if (labelSig) publishEvent('string', labelSig, '');
		publishEvent('number', props.select.signal, 0);
		publishEvent('boolean', props.delete, true);
		publishEvent('boolean', props.delete, false);
	}, [selectedIdx, props.delete, props.select.signal, props.select.presetLabelSignals]);

	const additionalButtons: React.ReactNode[] | undefined = (() => {
		const btns: React.ReactNode[] = [
			...(props.activate ? [
				<CrestronButton
					key='activate'
					signal={props.activate}
					ButtonProps={{
						sx: { ...btnSx, ...(!canRecallSelected ? saveBtnMutedSx : undefined) },
						disabled: !canRecallSelected,
						children: ctBtn(<BoltIcon />, 'Recall'),
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
					onClick={() => openKeyboard('update')}
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

	return (
		<>
			<SelectCard
				signal={props.select.signal}
				title='Preset'
				cardIcon={<BoltIcon />}
				options={presetOptions}
				optionType='preset'
				additionalButtons={additionalButtons}
			/>
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

const PresetCard = (props: PresetCardProps): CardProps => ({
	label: 'Preset',
	children: <PresetCardInner {...props} />,
});

export default PresetCard;
