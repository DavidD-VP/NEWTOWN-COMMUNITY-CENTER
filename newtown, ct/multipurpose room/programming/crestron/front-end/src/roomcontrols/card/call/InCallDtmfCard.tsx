import React from 'react';

import {
	Box,
	Card,
	CardActionArea,
	Typography,
} from '@mui/material';
import DialpadIcon from '@mui/icons-material/Dialpad';

import { publishEvent, useSignalStore } from '../../../crestron/CrComLib';
import { CardProps } from '../Card';
import DtmfKeypadPopover, { type DtmfMode } from '../../component/DtmfKeypadPopover';
import {
	sxCardBase,
	sxCardActive,
	cardPaddingV,
	cardPaddingH,
	cardInnerGap,
	cardIconSize,
	shadowActiveHover,
} from '../../theme/tokens';

const BATCH_MAX_LENGTH = 32;

export type InCallDtmfCardProps = {
	interactionSignal: string;
	tonesSignal: string;
};

function pulseInteraction(signal: string): void {
	publishEvent('boolean', signal, true);
	publishEvent('boolean', signal, false);
}

function sendTones(tonesSignal: string, interactionSignal: string, value: string): void {
	if (!value) {
		return;
	}
	publishEvent('string', tonesSignal, value);
	pulseInteraction(interactionSignal);
}

const InCallDtmfCardInner: React.FC<InCallDtmfCardProps> = ({
	interactionSignal,
	tonesSignal,
}) => {
	const tonesFromStore = useSignalStore((s) => s.strings[tonesSignal] ?? '');
	const [open, setOpen] = React.useState(false);
	const [mode, setMode] = React.useState<DtmfMode>('incremental');
	const [draft, setDraft] = React.useState('');
	const hasTones = tonesFromStore.trim().length > 0;

	const handleOpen = React.useCallback(() => {
		setDraft('');
		setMode('incremental');
		setOpen(true);
	}, []);

	const handleClose = React.useCallback(() => {
		setOpen(false);
	}, []);

	const handleModeChange = React.useCallback((nextMode: DtmfMode) => {
		setMode(nextMode);
		setDraft('');
	}, []);

	const handleKey = React.useCallback(
		(key: string) => {
			if (mode === 'incremental') {
				setDraft((prev) => `${prev}${key}`.slice(-BATCH_MAX_LENGTH));
				sendTones(tonesSignal, interactionSignal, key);
				return;
			}
			setDraft((prev) => (prev.length < BATCH_MAX_LENGTH ? `${prev}${key}` : prev));
		},
		[mode, tonesSignal, interactionSignal],
	);

	const handleBackspace = React.useCallback(() => {
		setDraft((prev) => prev.slice(0, -1));
	}, []);

	const handleSend = React.useCallback(() => {
		if (mode !== 'batch' || draft.length === 0) {
			return;
		}
		sendTones(tonesSignal, interactionSignal, draft);
		setDraft('');
	}, [mode, draft, tonesSignal, interactionSignal]);

	return (
		<Box sx={{ width: '100%' }}>
			<Card
				variant='outlined'
				sx={{
					...sxCardBase,
					flexDirection: 'column',
					...sxCardActive,
					'&:hover': { boxShadow: shadowActiveHover },
				}}
			>
				<CardActionArea
					component='div'
					onClick={handleOpen}
					sx={{
						flex: 1,
						display: 'flex',
						flexDirection: 'row',
						alignItems: 'center',
						paddingTop: cardPaddingV,
						paddingBottom: cardPaddingV,
						paddingLeft: cardPaddingH,
						paddingRight: cardPaddingH,
						gap: cardInnerGap,
						width: '100%',
					}}
				>
					<Box
						sx={{
							'& .MuiSvgIcon-root': { fontSize: cardIconSize, color: '#fff' },
							display: 'flex',
							alignItems: 'center',
							flexShrink: 0,
						}}
					>
						<DialpadIcon />
					</Box>
					<Box
						sx={{
							display: 'flex',
							flexDirection: 'column',
							justifyContent: 'center',
							gap: '2px',
							flex: 1,
							minWidth: 0,
						}}
					>
						<Typography
							variant='body2'
							sx={{ fontWeight: 600, lineHeight: 1.2, color: '#fff' }}
							noWrap
						>
							DTMF
						</Typography>
						<Typography
							variant='caption'
							sx={{
								lineHeight: 1.1,
								fontWeight: hasTones ? 600 : 400,
								fontStyle: hasTones ? 'normal' : 'italic',
								color: 'rgba(255,255,255,0.9)',
							}}
							noWrap
						>
							{hasTones ? tonesFromStore : 'Tap to send DTMF'}
						</Typography>
					</Box>
				</CardActionArea>
			</Card>

			<DtmfKeypadPopover
				open={open}
				onClose={handleClose}
				mode={mode}
				onModeChange={handleModeChange}
				draft={draft}
				onKey={handleKey}
				onBackspace={handleBackspace}
				onSend={handleSend}
			/>
		</Box>
	);
};

const InCallDtmfCard = (props: InCallDtmfCardProps): CardProps => ({
	label: 'DTMF',
	children: <InCallDtmfCardInner {...props} />,
});

export default InCallDtmfCard;
