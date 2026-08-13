import { overlayKeyButtonSx } from './touchPanelOverlayStyles';

export const NUMERIC_KEYPAD_KEY_SIZE = 'clamp(48px, min(5vw, 8vh), 88px)';
export const NUMERIC_KEYPAD_KEY_GAP = 'clamp(8px, min(0.9vw, 1.2vh), 14px)';
export const NUMERIC_KEYPAD_KEY_FONT = 'clamp(18px, min(2.4vw, 3.2vh), 36px)';
export const NUMERIC_KEYPAD_WIDTH = `calc(3 * ${NUMERIC_KEYPAD_KEY_SIZE} + 2 * ${NUMERIC_KEYPAD_KEY_GAP})`;

export const numericKeypadKeySx = {
	width: '100%',
	height: 'auto',
	aspectRatio: '1',
	minWidth: 0,
	display: 'flex',
	alignItems: 'center',
	justifyContent: 'center',
	borderRadius: '50%',
	fontWeight: 700,
	fontSize: NUMERIC_KEYPAD_KEY_FONT,
	flexShrink: 1,
	...overlayKeyButtonSx,
	'&:active': { transform: 'scale(0.95)' },
} as const;

export const numericKeypadContainerSx = {
	display: 'flex',
	flexDirection: 'column',
	alignItems: 'center',
	width: '100%',
	boxSizing: 'border-box',
	gap: NUMERIC_KEYPAD_KEY_GAP,
} as const;

export const numericKeypadInputSx = {
	width: '100%',
	maxWidth: NUMERIC_KEYPAD_WIDTH,
	minHeight: NUMERIC_KEYPAD_KEY_SIZE,
	display: 'flex',
	alignItems: 'center',
	justifyContent: 'flex-end',
	px: 'clamp(8px, 1.2vw, 16px)',
	borderRadius: '8px',
	boxSizing: 'border-box',
} as const;

export const numericKeypadGridSx = {
	display: 'grid',
	gridTemplateColumns: 'repeat(3, 1fr)',
	gap: NUMERIC_KEYPAD_KEY_GAP,
	width: '100%',
	maxWidth: NUMERIC_KEYPAD_WIDTH,
} as const;

export const numericKeypadConfirmButtonSx = {
	width: '100%',
	maxWidth: NUMERIC_KEYPAD_WIDTH,
	height: NUMERIC_KEYPAD_KEY_SIZE,
	borderRadius: '8px',
	fontSize: NUMERIC_KEYPAD_KEY_FONT,
	fontWeight: 700,
} as const;
