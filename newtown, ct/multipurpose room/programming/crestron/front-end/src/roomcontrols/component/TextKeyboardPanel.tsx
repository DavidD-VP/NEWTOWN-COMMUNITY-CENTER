import React from 'react';

import { Box, Typography } from '@mui/material';

import BackspaceIcon from '@mui/icons-material/Backspace';
import KeyboardCapslockIcon from '@mui/icons-material/KeyboardCapslock';

import {
	overlayInputFieldSx,
	overlayKeyButtonSx,
	overlayConfirmButtonSx,
} from './touchPanelOverlayStyles';
import {
	NUMERIC_KEYPAD_KEY_FONT,
	NUMERIC_KEYPAD_KEY_GAP,
	NUMERIC_KEYPAD_WIDTH,
	numericKeypadConfirmButtonSx,
	numericKeypadContainerSx,
	numericKeypadGridSx,
	numericKeypadInputSx,
	numericKeypadKeySx,
} from './numericKeypadStyles';
import {
	keyboardKeyGap,
	keyboardKeyMinHeight,
	keyboardKeyIconSize,
	keyboardKeyFontSize,
	keyboardKeyActionFontSize,
	keyboardKeyPadding,
	keyboardInputMinHeight,
	cardBorderRadius,
	overlayButtonContainedColor,
} from '../theme/tokens';

export type TextKeyboardVariant = 'text' | 'phone';

type DualKey = { kind: 'dual'; normal: string; shift: string };
type LetterKey = { kind: 'letter'; letter: string };
type SpacerKey = { kind: 'spacer'; width: number };
type ActionKey = {
	kind: 'action';
	action: 'backspace' | 'caps' | 'shift' | 'space' | 'enter';
	width: number;
	label?: string;
};

type KeyDef = DualKey | LetterKey | ActionKey | SpacerKey;

const PHONE_KEYPAD_ROWS = [
	['1', '2', '3'],
	['4', '5', '6'],
	['7', '8', '9'],
	['*', '0', '#'],
] as const;

const KEYBOARD_ROWS: KeyDef[][] = [
	[
		{ kind: 'dual', normal: '`', shift: '~' },
		{ kind: 'dual', normal: '1', shift: '!' },
		{ kind: 'dual', normal: '2', shift: '@' },
		{ kind: 'dual', normal: '3', shift: '#' },
		{ kind: 'dual', normal: '4', shift: '$' },
		{ kind: 'dual', normal: '5', shift: '%' },
		{ kind: 'dual', normal: '6', shift: '^' },
		{ kind: 'dual', normal: '7', shift: '&' },
		{ kind: 'dual', normal: '8', shift: '*' },
		{ kind: 'dual', normal: '9', shift: '(' },
		{ kind: 'dual', normal: '0', shift: ')' },
		{ kind: 'dual', normal: '-', shift: '_' },
		{ kind: 'dual', normal: '=', shift: '+' },
		{ kind: 'action', action: 'backspace', width: 2, label: 'Backspace' },
	],
	[
		{ kind: 'spacer', width: 1 },
		...'qwertyuiop'.split('').map((letter): LetterKey => ({ kind: 'letter', letter })),
		{ kind: 'dual', normal: '[', shift: '{' },
		{ kind: 'dual', normal: ']', shift: '}' },
		{ kind: 'dual', normal: '\\', shift: '|' },
		{ kind: 'spacer', width: 1 },
	],
	[
		{ kind: 'action', action: 'caps', width: 2, label: 'Caps' },
		...'asdfghjkl'.split('').map((letter): LetterKey => ({ kind: 'letter', letter })),
		{ kind: 'dual', normal: ';', shift: ':' },
		{ kind: 'dual', normal: "'", shift: '"' },
		{ kind: 'action', action: 'enter', width: 2, label: 'Enter' },
	],
	[
		{ kind: 'action', action: 'shift', width: 2, label: 'Shift' },
		...'zxcvbnm'.split('').map((letter): LetterKey => ({ kind: 'letter', letter })),
		{ kind: 'dual', normal: ',', shift: '<' },
		{ kind: 'dual', normal: '.', shift: '>' },
		{ kind: 'dual', normal: '/', shift: '?' },
		{ kind: 'action', action: 'shift', width: 3, label: 'Shift' },
	],
	[
		{ kind: 'action', action: 'space', width: 15, label: 'Space' },
	],
];

export const DEFAULT_TEXT_KEYBOARD_MAX_LENGTH = 32;
/** Layout grid — one column per key unit (15 units per row). */
const GRID_COLUMNS = 15;
const MODIFIER_ICON = keyboardKeyIconSize;
export const TEXT_KEYBOARD_ACTION_FONT = keyboardKeyActionFontSize;

function toGridSpan(units: number): number {
	return units;
}

function resolveOutput(key: KeyDef, capsLock: boolean, shift: boolean): string | null {
	if (key.kind === 'letter') {
		const upper = capsLock !== shift;
		return upper ? key.letter.toUpperCase() : key.letter.toLowerCase();
	}
	if (key.kind === 'dual') {
		return shift ? key.shift : key.normal;
	}
	return null;
}

function keySpanUnits(key: KeyDef): number {
	if (key.kind === 'spacer') return key.width;
	return key.kind === 'action' ? key.width : 1;
}

function rowKeyId(key: KeyDef, index: number): string {
	if (key.kind === 'spacer') return `spacer-${index}`;
	if (key.kind === 'letter') return key.letter;
	if (key.kind === 'dual') return key.normal;
	return `${key.action}-${index}`;
}

function isModifierActive(action: ActionKey['action'], capsLock: boolean, shift: boolean): boolean {
	if (action === 'caps') return capsLock;
	if (action === 'shift') return shift;
	return false;
}

const baseKeySx = {
	display: 'flex',
	alignItems: 'center',
	justifyContent: 'center',
	minWidth: 0,
	minHeight: keyboardKeyMinHeight,
	padding: keyboardKeyPadding,
	borderRadius: cardBorderRadius,
	fontWeight: 700,
	lineHeight: 1,
	overflow: 'hidden',
	...overlayKeyButtonSx,
	'&:active': { transform: 'scale(0.96)' },
} as const;

const enterKeySx = {
	...overlayConfirmButtonSx,
	border: '1px solid transparent',
	'& .MuiSvgIcon-root': { color: overlayButtonContainedColor },
} as const;

export type UseTextKeyboardOptions = {
	initialValue?: string;
	maxLength?: number;
	variant?: TextKeyboardVariant;
	/** When true, draft state resets from initialValue. */
	active: boolean;
};

export function useTextKeyboard(options: UseTextKeyboardOptions) {
	const variant = options.variant ?? 'text';
	const maxLen = options.maxLength ?? DEFAULT_TEXT_KEYBOARD_MAX_LENGTH;

	const [draft, setDraft] = React.useState('');
	const [shift, setShift] = React.useState(false);
	const [capsLock, setCapsLock] = React.useState(false);

	React.useEffect(() => {
		if (options.active) {
			setDraft(options.initialValue ?? '');
			setShift(false);
			setCapsLock(false);
		}
	}, [options.active, options.initialValue]);

	const appendChar = React.useCallback((ch: string, usedShift: boolean) => {
		setDraft((prev) => (prev.length < maxLen ? prev + ch : prev));
		if (usedShift) setShift(false);
	}, [maxLen]);

	const appendPhoneChar = React.useCallback((ch: string) => {
		if (!/^[0-9*#]$/.test(ch)) return;
		setDraft((prev) => (prev.length < maxLen ? prev + ch : prev));
	}, [maxLen]);

	const handleKeyPress = React.useCallback((key: KeyDef) => {
		if (key.kind === 'action') {
			switch (key.action) {
				case 'backspace':
					setDraft((prev) => prev.slice(0, -1));
					break;
				case 'caps':
					setCapsLock((prev) => !prev);
					break;
				case 'shift':
					setShift((prev) => !prev);
					break;
				case 'space':
					appendChar(' ', false);
					break;
			}
			return;
		}
		const out = resolveOutput(key, capsLock, shift);
		if (out) appendChar(out, shift);
	}, [appendChar, capsLock, shift]);

	return {
		draft,
		variant,
		isPhone: variant === 'phone',
		shift,
		capsLock,
		appendPhoneChar,
		handleKeyPress,
		setDraft,
	};
}

export type TextKeyboardPanelProps = {
	draft: string;
	variant?: TextKeyboardVariant;
	shift: boolean;
	capsLock: boolean;
	onKeyPress: (key: KeyDef) => void;
	onPhoneChar: (ch: string) => void;
	onPhoneBackspace: () => void;
	onConfirm?: () => void;
	confirmLabel?: string;
};

const TextKeyboardPanel: React.FC<TextKeyboardPanelProps> = (props) => {
	const variant = props.variant ?? 'text';
	const isPhone = variant === 'phone';
	const enterLabel = props.confirmLabel ?? 'Enter';

	const invokeConfirm = React.useCallback((event: React.SyntheticEvent) => {
		event.stopPropagation();
		props.onConfirm?.();
	}, [props.onConfirm]);

	const handleKeyClick = (key: KeyDef) => {
		if (key.kind === 'action' && key.action === 'enter') {
			props.onConfirm?.();
			return;
		}
		props.onKeyPress(key);
	};

	const renderKeyLabel = (key: KeyDef, isPrimaryKey = false) => {
		if (key.kind === 'letter') {
			const upper = props.capsLock !== props.shift;
			return (
				<Box component='span' sx={{ fontSize: keyboardKeyFontSize, lineHeight: 1 }}>
					{upper ? key.letter.toUpperCase() : key.letter.toLowerCase()}
				</Box>
			);
		}
		if (key.kind === 'dual') {
			return (
				<Box component='span' sx={{ fontSize: keyboardKeyFontSize, lineHeight: 1 }}>
					{props.shift ? key.shift : key.normal}
				</Box>
			);
		}
		if (key.action === 'backspace') {
			return <BackspaceIcon sx={{ fontSize: MODIFIER_ICON, ...(isPrimaryKey ? { color: overlayButtonContainedColor } : {}) }} />;
		}
		if (key.action === 'caps') {
			return <KeyboardCapslockIcon sx={{ fontSize: MODIFIER_ICON, ...(isPrimaryKey ? { color: overlayButtonContainedColor } : {}) }} />;
		}
		if (key.action === 'enter') {
			return (
				<Box component='span' sx={{ fontSize: TEXT_KEYBOARD_ACTION_FONT, lineHeight: 1, px: '2px' }}>
					{enterLabel}
				</Box>
			);
		}
		return (
			<Box component='span' sx={{ fontSize: TEXT_KEYBOARD_ACTION_FONT, lineHeight: 1, px: '2px' }}>
				{key.label ?? ''}
			</Box>
		);
	};

	return (
		<Box
			sx={{
				display: 'flex',
				flexDirection: 'column',
				width: '100%',
				boxSizing: 'border-box',
				gap: isPhone ? NUMERIC_KEYPAD_KEY_GAP : keyboardKeyGap,
				...(isPhone ? { alignItems: 'center' } : {}),
			}}
		>
			<Box
				sx={{
					width: '100%',
					flexShrink: 0,
					display: 'flex',
					alignItems: 'center',
					justifyContent: 'flex-end',
					boxSizing: 'border-box',
					...(isPhone
						? { ...numericKeypadInputSx, ...overlayInputFieldSx }
						: {
							minHeight: keyboardInputMinHeight,
							py: keyboardKeyPadding,
							px: 'clamp(8px, 1.2vw, 16px)',
							borderRadius: cardBorderRadius,
							...overlayInputFieldSx,
						}),
				}}
			>
				<Typography
					sx={{
						fontSize: isPhone ? NUMERIC_KEYPAD_KEY_FONT : 'clamp(14px, 2.2vw, 40px)',
						fontWeight: 700,
						color: '#fff',
						letterSpacing: isPhone ? '0.1em' : '0.05em',
						userSelect: 'none',
						fontFamily: 'monospace',
						wordBreak: isPhone ? 'normal' : 'break-all',
						textAlign: 'right',
						width: '100%',
						...(isPhone
							? {
								whiteSpace: 'nowrap',
								overflow: 'hidden',
								textOverflow: 'ellipsis',
							}
							: {}),
					}}
				>
					{props.draft.length > 0 ? props.draft : '\u00A0'}
				</Typography>
			</Box>

			{isPhone ? (
				<Box sx={numericKeypadContainerSx}>
					<Box sx={{ display: 'flex', flexDirection: 'column', gap: NUMERIC_KEYPAD_KEY_GAP, width: '100%', maxWidth: NUMERIC_KEYPAD_WIDTH }}>
						{PHONE_KEYPAD_ROWS.map((row) => (
							<Box key={row.join('-')} sx={numericKeypadGridSx}>
								{row.map((key) => (
									<Box
										key={key}
										component='button'
										type='button'
										aria-label={key}
										onClick={() => props.onPhoneChar(key)}
										sx={numericKeypadKeySx}
									>
										{key}
									</Box>
								))}
							</Box>
						))}
						<Box sx={numericKeypadGridSx}>
							<Box sx={{ width: '100%', aspectRatio: '1' }} aria-hidden />
							<Box
								component='button'
								type='button'
								aria-label='Backspace'
								onClick={props.onPhoneBackspace}
								sx={numericKeypadKeySx}
							>
								<BackspaceIcon sx={{ fontSize: NUMERIC_KEYPAD_KEY_FONT }} />
							</Box>
							<Box sx={{ width: '100%', aspectRatio: '1' }} aria-hidden />
						</Box>
					</Box>
					<Box
						component='button'
						type='button'
						onPointerDown={invokeConfirm}
						onClick={(event) => event.stopPropagation()}
						sx={{
							...overlayConfirmButtonSx,
							...numericKeypadConfirmButtonSx,
							border: '1px solid transparent',
						}}
					>
						{enterLabel}
					</Box>
				</Box>
			) : (
				<Box
					sx={{
						display: 'flex',
						flexDirection: 'column',
						gap: keyboardKeyGap,
						width: '100%',
					}}
				>
					{KEYBOARD_ROWS.map((row, rowIndex) => (
							<Box
								key={`keyboard-row-${rowIndex}`}
								sx={{
									display: 'grid',
									gridTemplateColumns: `repeat(${GRID_COLUMNS}, minmax(0, 1fr))`,
									gap: keyboardKeyGap,
									width: '100%',
									minHeight: keyboardKeyMinHeight,
								}}
							>
								{row.map((key, keyIndex) => {
									const units = keySpanUnits(key);
									if (key.kind === 'spacer') {
										return (
											<Box
												key={rowKeyId(key, keyIndex)}
												aria-hidden
												sx={{
													gridColumn: `span ${toGridSpan(units)}`,
													minHeight: keyboardKeyMinHeight,
													width: '100%',
													boxSizing: 'border-box',
													border: '2px solid transparent',
													borderRadius: cardBorderRadius,
													pointerEvents: 'none',
												}}
											/>
										);
									}
									const isAction = key.kind === 'action';
									const isEnter = isAction && key.action === 'enter';
									const isActive = isAction && isModifierActive(key.action, props.capsLock, props.shift);
									const isPrimaryKey = isEnter || isActive;
									return (
										<Box
											key={rowKeyId(key, keyIndex)}
											component='button'
											type='button'
											onPointerDown={(event) => {
												event.stopPropagation();
												if (isEnter) {
													invokeConfirm(event);
												}
											}}
											onClick={() => {
												if (!isEnter) {
													handleKeyClick(key);
												}
											}}
											sx={{
												...baseKeySx,
												...(isPrimaryKey ? enterKeySx : {}),
												gridColumn: `span ${toGridSpan(units)}`,
												width: '100%',
												height: '100%',
												minHeight: keyboardKeyMinHeight,
											}}
										>
											{renderKeyLabel(key, isPrimaryKey)}
										</Box>
									);
								})}
							</Box>
						))}
				</Box>
			)}
		</Box>
	);
};

export default TextKeyboardPanel;
