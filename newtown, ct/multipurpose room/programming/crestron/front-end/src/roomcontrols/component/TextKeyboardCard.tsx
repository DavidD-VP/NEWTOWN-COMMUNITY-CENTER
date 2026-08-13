import React from 'react';

import {
	Box,
	Card,
} from '@mui/material';

import OverlayCardHeader, { OverlayCardHeaderShell } from './OverlayCardHeader';
import TextKeyboardPanel, {
	useTextKeyboard,
	type TextKeyboardVariant,
} from './TextKeyboardPanel';
import { confirmTextKeyboardValue, type TextKeyboardConfirmProps } from './textKeyboardConfirm';
import { overlayBodyContentInsetSx } from './touchPanelOverlayStyles';
import {
	sxCardActive,
	sxCardBase,
	cardPaddingH,
	cardPaddingV,
} from '../theme/tokens';

export type { TextKeyboardVariant };

export type TextKeyboardCardProps = TextKeyboardConfirmProps & {
	onClose: () => void;
	initialValue?: string;
	title?: string;
	maxLength?: number;
	confirmLabel?: string;
	variant?: TextKeyboardVariant;
};

const TextKeyboardCard: React.FC<TextKeyboardCardProps> = (props) => {
	const confirmLabel = props.confirmLabel ?? 'Enter';
	const keyboard = useTextKeyboard({
		initialValue: props.initialValue,
		maxLength: props.maxLength,
		variant: props.variant,
		active: true,
	});

	const handleConfirm = React.useCallback(() => {
		confirmTextKeyboardValue(props, keyboard.draft);
		props.onClose();
	}, [props, keyboard.draft]);

	return (
		<Card
			variant='outlined'
			sx={{
				...sxCardBase,
				...sxCardActive,
				width: '100%',
				display: 'flex',
				flexDirection: 'column',
				overflow: 'hidden',
			}}
		>
			<OverlayCardHeaderShell contentPadding={`${cardPaddingV} ${cardPaddingH}`}>
				<OverlayCardHeader
					title={props.title ?? 'Enter Text'}
					onClose={props.onClose}
				/>
			</OverlayCardHeaderShell>

			<Box
				sx={{
					flexShrink: 0,
					width: '100%',
					boxSizing: 'border-box',
					...overlayBodyContentInsetSx,
				}}
			>
				<TextKeyboardPanel
					draft={keyboard.draft}
					variant={props.variant}
					shift={keyboard.shift}
					capsLock={keyboard.capsLock}
					onKeyPress={keyboard.handleKeyPress}
					onPhoneChar={keyboard.appendPhoneChar}
					onPhoneBackspace={() => keyboard.setDraft((prev) => prev.slice(0, -1))}
					onConfirm={handleConfirm}
					confirmLabel={confirmLabel}
				/>
			</Box>
		</Card>
	);
};

export default TextKeyboardCard;
