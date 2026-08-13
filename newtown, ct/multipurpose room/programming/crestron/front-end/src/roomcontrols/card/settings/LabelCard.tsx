import React from 'react';

import { Box, Button } from '@mui/material';

import LabelOutlinedIcon from '@mui/icons-material/LabelOutlined';
import EditIcon from '@mui/icons-material/Edit';

import { useSignalStore } from '../../../crestron/CrComLib';

import { CardProps } from '../Card';
import { ctBtn } from '../ctCardStyles';
import {
	sxCtrlBtn,
	ctrlBtnIconSize,
	overlayButtonContainedColor,
	sxCardBtnSlot,
} from '../../theme/tokens';
import SelectCard, { type SelectOption } from '../../component/SelectCard';
import TextKeyboardCard from '../../component/TextKeyboardCard';
import { usePageEditor } from '../../page/PageEditorContext';

import type { CameraOption } from '../camera/types';

// ── Types ─────────────────────────────────────────────────────────────────────

export type LabelCardProps = {
	select: {
		signal: string;
		options: CameraOption[];
		/** Serial joins for per-slot values (index-aligned with select.interaction). */
		valueSignals: string[];
	};
	/** When true, renders the Update button (gated by settings.label.update.visible). */
	showUpdate?: boolean;
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

function valueSignalForSelection(
	selectedValue: number,
	valueSignals: readonly string[],
): string | undefined {
	const idx = selectedValue - 1;
	if (idx < 0 || idx >= valueSignals.length) return undefined;
	return valueSignals[idx];
}

function formatLabelCaption(labelName: string, valueText: string): string {
	return `Label: ${labelName} Value: ${valueText}`;
}

// ── Inner component ───────────────────────────────────────────────────────────

const LabelCardInner: React.FC<LabelCardProps> = (props) => {
	const selectedValue = useSignalStore((s) => s.numbers[props.select.signal] ?? 0);
	const strings = useSignalStore((s) => s.strings);
	const pageEditor = usePageEditor();

	const selectedValueSignal = React.useMemo(
		() => valueSignalForSelection(selectedValue, props.select.valueSignals),
		[selectedValue, props.select.valueSignals],
	);

	const selectedSlotValue = React.useMemo(() => {
		if (!selectedValueSignal) return '';
		return strings[selectedValueSignal] ?? '';
	}, [selectedValueSignal, strings]);

	const openKeyboard = React.useCallback(() => {
		if (!selectedValueSignal || !pageEditor) return;
		pageEditor.openPageEditor(
			<TextKeyboardCard
				stringSignal={selectedValueSignal}
				initialValue={selectedSlotValue}
				title='Update Label'
				onClose={pageEditor.closePageEditor}
			/>,
		);
	}, [pageEditor, selectedValueSignal, selectedSlotValue]);

	const labelOptions: SelectOption[] = props.select.options
		.filter((o) => o.Label)
		.map((o) => {
			const valueSignal = props.select.valueSignals[o.Value - 1];
			const valueText = valueSignal ? (strings[valueSignal] ?? '') : '';
			return {
				value: o.Value,
				label: formatLabelCaption(o.Label, valueText),
				icon: <LabelOutlinedIcon /> as React.ReactNode,
			};
		});

	const canUpdate = Boolean(props.showUpdate && selectedValueSignal);

	const additionalButtons: React.ReactNode[] | undefined = props.showUpdate
		? [
			<Box
				key='update'
				onClick={(e) => e.stopPropagation()}
				onPointerDown={(e) => e.stopPropagation()}
				sx={sxCardBtnSlot}
			>
				<Button
					variant='outlined'
					sx={btnSx}
					onClick={() => openKeyboard()}
					disabled={!canUpdate}
					aria-label='Update label value'
				>
					{ctBtn(<EditIcon />, 'Update')}
				</Button>
			</Box>,
		]
		: undefined;

	return (
		<SelectCard
			signal={props.select.signal}
			title='Labels'
			cardIcon={<LabelOutlinedIcon />}
			options={labelOptions}
			optionType='label'
			additionalButtons={additionalButtons}
		/>
	);
};

// ── Public API ────────────────────────────────────────────────────────────────

const LabelCard = (props: LabelCardProps): CardProps => ({
	label: 'Label',
	children: <LabelCardInner {...props} />,
});

export default LabelCard;
