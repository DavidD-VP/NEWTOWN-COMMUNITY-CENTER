import React from 'react';

import TouchPanelOverlay from './TouchPanelOverlay';
import TextKeyboardPanel, {
	useTextKeyboard,
	type TextKeyboardVariant,
} from './TextKeyboardPanel';
import { confirmTextKeyboardValue } from './textKeyboardConfirm';

export type { TextKeyboardVariant };

export type TextKeyboardPopoverProps = {
	open: boolean;
	onClose: () => void;
	stringSignal: string;
	confirmSignal?: string;
	onSet?: () => void;
	onConfirmDraft?: (value: string) => void;
	initialValue?: string;
	title?: string;
	maxLength?: number;
	confirmLabel?: string;
	variant?: TextKeyboardVariant;
	zIndex?: number;
};

const TextKeyboardPopover: React.FC<TextKeyboardPopoverProps> = (props) => {
	const confirmLabel = props.confirmLabel ?? 'Enter';
	const onCloseRef = React.useRef(props.onClose);
	onCloseRef.current = props.onClose;
	const confirmPropsRef = React.useRef(props);
	confirmPropsRef.current = props;

	const keyboard = useTextKeyboard({
		initialValue: props.initialValue,
		maxLength: props.maxLength,
		variant: props.variant,
		active: props.open,
	});

	const handleClose = React.useCallback(() => {
		onCloseRef.current();
	}, []);

	const handleConfirm = React.useCallback(() => {
		confirmTextKeyboardValue(confirmPropsRef.current, keyboard.draft);
		onCloseRef.current();
	}, [keyboard.draft]);

	return (
		<TouchPanelOverlay
			open={props.open}
			onClose={handleClose}
			title={props.title ?? 'Enter Text'}
			zIndex={props.zIndex}
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
		</TouchPanelOverlay>
	);
};

export default TextKeyboardPopover;
