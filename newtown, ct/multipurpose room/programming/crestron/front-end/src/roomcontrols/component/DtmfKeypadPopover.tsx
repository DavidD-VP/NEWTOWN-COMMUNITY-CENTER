import React from 'react';

import { Box, Typography } from '@mui/material';
import BackspaceIcon from '@mui/icons-material/Backspace';
import SendIcon from '@mui/icons-material/Send';

import TouchPanelOverlay from './TouchPanelOverlay';
import OverflowMarqueeText from './OverflowMarqueeText';
import {
	overlayConfirmButtonSx,
	overlayInputFieldSx,
	overlayKeyButtonSx,
} from './touchPanelOverlayStyles';

export type DtmfMode = 'incremental' | 'batch';

const DTMF_ROWS = [
	['1', '2', '3'],
	['4', '5', '6'],
	['7', '8', '9'],
	['*', '0', '#'],
] as const;

const KEY_SIZE = 'clamp(48px, min(5vw, 8vh), 88px)';
const KEY_GAP = 'clamp(8px, min(0.9vw, 1.2vh), 14px)';
const KEY_FONT = 'clamp(18px, min(2.4vw, 3.2vh), 36px)';
const KEYPAD_WIDTH = `calc(3 * ${KEY_SIZE} + 2 * ${KEY_GAP})`;

const DTMF_MODE_OPTIONS: ReadonlyArray<{ value: DtmfMode; label: string }> = [
	{ value: 'incremental', label: 'Incremental' },
	{ value: 'batch', label: 'Batch' },
];

const DTMF_MODE_LABEL_SX = {
	fontSize: 'clamp(12px, 1.5vw, 20px)',
	fontWeight: 600,
	lineHeight: 1.2,
	color: '#fff',
} as const;

export type DtmfKeypadPopoverProps = {
	open: boolean;
	onClose: () => void;
	mode: DtmfMode;
	onModeChange: (mode: DtmfMode) => void;
	draft: string;
	onKey: (key: string) => void;
	onBackspace: () => void;
	onSend: () => void;
};

const keySx = {
	width: '100%',
	height: 'auto',
	aspectRatio: '1',
	minWidth: 0,
	display: 'flex',
	alignItems: 'center',
	justifyContent: 'center',
	borderRadius: '50%',
	fontWeight: 700,
	fontSize: KEY_FONT,
	flexShrink: 1,
	...overlayKeyButtonSx,
	'&:active': { transform: 'scale(0.95)' },
} as const;

const actionBtnSx = {
	flex: 1,
	height: KEY_SIZE,
	borderRadius: '8px',
	fontWeight: 700,
	fontSize: KEY_FONT,
	display: 'flex',
	alignItems: 'center',
	justifyContent: 'center',
	gap: '6px',
	...overlayKeyButtonSx,
	'&:disabled': { opacity: 0.45, cursor: 'default' },
} as const;

const DtmfKeypadPopover: React.FC<DtmfKeypadPopoverProps> = (props) => {
	const isBatch = props.mode === 'batch';

	return (
		<TouchPanelOverlay
			open={props.open}
			onClose={props.onClose}
			title='DTMF'
			footer={isBatch ? (
				<Box sx={{ display: 'flex', gap: KEY_GAP }}>
					<Box
						component='button'
						type='button'
						onClick={props.onBackspace}
						disabled={props.draft.length === 0}
						sx={actionBtnSx}
						aria-label='Backspace'
					>
						<BackspaceIcon sx={{ fontSize: KEY_FONT }} />
					</Box>
					<Box
						component='button'
						type='button'
						onClick={props.onSend}
						disabled={props.draft.length === 0}
						sx={{
							...overlayConfirmButtonSx,
							flex: 1,
							height: KEY_SIZE,
							borderRadius: '8px',
							fontSize: KEY_FONT,
							display: 'flex',
							alignItems: 'center',
							justifyContent: 'center',
							gap: '6px',
						}}
					>
						<SendIcon sx={{ fontSize: KEY_FONT, color: 'inherit' }} />
						Send DTMF
					</Box>
				</Box>
			) : undefined}
		>
			<Box
				sx={{
					display: 'flex',
					flexDirection: 'column',
					alignItems: 'center',
					justifyContent: 'center',
					flex: 1,
					minHeight: 0,
					width: '100%',
					boxSizing: 'border-box',
					gap: KEY_GAP,
				}}
				onClick={(event) => event.stopPropagation()}
				onPointerDown={(event) => event.stopPropagation()}
			>
				<Box
					role='group'
					aria-label='DTMF send mode'
					sx={{
						display: 'grid',
						gridTemplateColumns: '1fr 1fr',
						width: '100%',
						maxWidth: KEYPAD_WIDTH,
						border: '2px solid',
						borderColor: 'rgba(255,255,255,0.4)',
						borderRadius: '8px',
						overflow: 'hidden',
					}}
				>
					{DTMF_MODE_OPTIONS.map((option, index) => {
						const selected = props.mode === option.value;
						return (
							<Box
								key={option.value}
								component='button'
								type='button'
								aria-pressed={selected}
								onClick={() => props.onModeChange(option.value)}
								sx={{
									minWidth: 0,
									width: '100%',
									overflow: 'hidden',
									px: 'clamp(4px, 0.8vw, 12px)',
									py: '10px',
									border: 'none',
									borderLeft: index > 0 ? '2px solid rgba(255,255,255,0.4)' : undefined,
									backgroundColor: selected ? 'rgba(255,255,255,0.22)' : 'rgba(255,255,255,0.08)',
									color: '#fff',
									cursor: 'pointer',
									'&:hover': {
										backgroundColor: selected
											? 'rgba(255,255,255,0.28)'
											: 'rgba(255,255,255,0.14)',
									},
								}}
							>
								<OverflowMarqueeText component='span' centerWhenIdle sx={DTMF_MODE_LABEL_SX}>
									{option.label}
								</OverflowMarqueeText>
							</Box>
						);
					})}
				</Box>

				<Box
					sx={{
						width: '100%',
						maxWidth: KEYPAD_WIDTH,
						minHeight: KEY_SIZE,
						display: 'flex',
						alignItems: 'center',
						px: 'clamp(8px, 1.2vw, 16px)',
						borderRadius: '8px',
						overflow: 'hidden',
						boxSizing: 'border-box',
						...overlayInputFieldSx,
					}}
				>
					<Typography
						sx={{
							width: '100%',
							fontSize: KEY_FONT,
							fontWeight: 700,
							color: '#fff',
							letterSpacing: '0.12em',
							userSelect: 'none',
							fontFamily: 'monospace',
							whiteSpace: 'nowrap',
							overflow: 'hidden',
							textOverflow: 'ellipsis',
							direction: 'rtl',
							textAlign: 'left',
						}}
					>
						{props.draft.length > 0 ? props.draft : '\u00A0'}
					</Typography>
				</Box>

				<Box sx={{ display: 'flex', flexDirection: 'column', gap: KEY_GAP, width: '100%', maxWidth: KEYPAD_WIDTH }}>
					{DTMF_ROWS.map((row) => (
						<Box
							key={row.join('-')}
							sx={{
								display: 'grid',
								gridTemplateColumns: 'repeat(3, 1fr)',
								gap: KEY_GAP,
							}}
						>
							{row.map((key) => (
								<Box
									key={key}
									component='button'
									type='button'
									onClick={() => props.onKey(key)}
									sx={keySx}
								>
									{key}
								</Box>
							))}
						</Box>
					))}
				</Box>
			</Box>
		</TouchPanelOverlay>
	);
};

export default DtmfKeypadPopover;
