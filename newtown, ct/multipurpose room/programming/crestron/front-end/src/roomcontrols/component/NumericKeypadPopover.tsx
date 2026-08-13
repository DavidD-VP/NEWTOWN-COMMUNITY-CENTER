import React from 'react';

import { Box, Typography } from '@mui/material';
import BackspaceIcon from '@mui/icons-material/Backspace';

import TouchPanelOverlay from './TouchPanelOverlay';
import {
	overlayConfirmButtonSx,
	overlayInputFieldSx,
} from './touchPanelOverlayStyles';
import {
	NUMERIC_KEYPAD_KEY_FONT,
	NUMERIC_KEYPAD_KEY_GAP,
	NUMERIC_KEYPAD_KEY_SIZE,
	NUMERIC_KEYPAD_WIDTH,
	numericKeypadContainerSx,
	numericKeypadGridSx,
	numericKeypadInputSx,
	numericKeypadKeySx,
} from './numericKeypadStyles';

export {
	NUMERIC_KEYPAD_KEY_FONT,
	NUMERIC_KEYPAD_KEY_GAP,
	NUMERIC_KEYPAD_KEY_SIZE,
	NUMERIC_KEYPAD_WIDTH,
} from './numericKeypadStyles';

const KEYS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', 'back'] as const;

export type NumericKeypadPopoverProps = {
	open: boolean;
	onClose: () => void;
	draft: string;
	onKey: (key: string) => void;
	onConfirm: () => void;
	confirmLabel?: string;
	title?: string;
	maskDraft?: boolean;
	zIndex?: number;
};

const NumericKeypadPopover: React.FC<NumericKeypadPopoverProps> = (props) => {
	const confirmLabel = props.confirmLabel ?? 'Set';

	const displayValue = props.draft.length > 0
		? (props.maskDraft ? '•'.repeat(props.draft.length) : props.draft)
		: '\u00A0';

	return (
		<TouchPanelOverlay
			open={props.open}
			onClose={props.onClose}
			title={props.title ?? 'Enter Number'}
			zIndex={props.zIndex}
			footer={(
				<Box
					component='button'
					type='button'
					onClick={props.onConfirm}
					sx={{
						...overlayConfirmButtonSx,
						width: '100%',
						height: NUMERIC_KEYPAD_KEY_SIZE,
						borderRadius: '8px',
						fontSize: NUMERIC_KEYPAD_KEY_FONT,
					}}
				>
					{confirmLabel}
				</Box>
			)}
		>
			<Box
				sx={{
					...numericKeypadContainerSx,
					justifyContent: 'center',
					flex: 1,
					minHeight: 0,
				}}
			>
				<Box sx={{ ...numericKeypadInputSx, ...overlayInputFieldSx }}>
					<Typography
						sx={{
							fontSize: NUMERIC_KEYPAD_KEY_FONT,
							fontWeight: 700,
							color: '#fff',
							letterSpacing: '0.1em',
							userSelect: 'none',
							fontFamily: 'monospace',
						}}
					>
						{displayValue}
					</Typography>
				</Box>

				<Box sx={numericKeypadGridSx}>
					{KEYS.map((key, i) => {
						if (key === '') {
							return (
								<Box
									key={`space-${i}`}
									sx={{ width: '100%', aspectRatio: '1' }}
								/>
							);
						}
						return (
							<Box
								key={key}
								component='button'
								type='button'
								onClick={() => props.onKey(key)}
								sx={numericKeypadKeySx}
							>
								{key === 'back' ? (
									<BackspaceIcon sx={{ fontSize: NUMERIC_KEYPAD_KEY_FONT }} />
								) : (
									key
								)}
							</Box>
						);
					})}
				</Box>
			</Box>
		</TouchPanelOverlay>
	);
};

export default NumericKeypadPopover;
