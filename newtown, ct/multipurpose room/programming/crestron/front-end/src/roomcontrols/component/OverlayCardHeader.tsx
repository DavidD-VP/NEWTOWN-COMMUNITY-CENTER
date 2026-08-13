import React from 'react';

import { Box, Typography } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

import { overlayKeyButtonSx } from './touchPanelOverlayStyles';
import {
	sxCardIcon,
	sxCardLabel,
	cardInnerGap,
	cardBorderRadius,
} from '../theme/tokens';

export const overlayCardHeaderDividerSx = {
	borderBottom: '2px solid rgba(255,255,255,0.25)',
	width: '100%',
} as const;

const overlayHeaderCloseButtonSx = {
	...overlayKeyButtonSx,
	display: 'inline-flex',
	alignItems: 'center',
	justifyContent: 'center',
	gap: 'clamp(4px, 0.5vw, 8px)',
	minHeight: 'auto',
	height: 'auto',
	padding: 'clamp(4px, 0.55vw, 8px) clamp(8px, 1vw, 14px)',
	borderRadius: cardBorderRadius,
	fontWeight: 700,
	fontSize: 'clamp(11px, 1.4vw, 24px)',
	lineHeight: 1,
	color: '#fff',
	cursor: 'pointer',
	userSelect: 'none' as const,
	flexShrink: 0,
	'& .MuiSvgIcon-root': { fontSize: 'clamp(16px, 2vw, 36px)', color: '#fff' },
	'&:active': { transform: 'scale(0.96)' },
} as const;

export type OverlayCardHeaderShellProps = {
	children: React.ReactNode;
	/** CSS padding shorthand for header content inset. */
	contentPadding?: string;
};

export const OverlayCardHeaderShell: React.FC<OverlayCardHeaderShellProps> = (props) => (
	<Box sx={{ flexShrink: 0, width: '100%' }}>
		<Box sx={{ width: '100%', ...(props.contentPadding ? { padding: props.contentPadding } : undefined) }}>
			{props.children}
		</Box>
		<Box sx={overlayCardHeaderDividerSx} aria-hidden />
	</Box>
);

export type OverlayCardHeaderProps = {
	title?: string;
	icon?: React.ReactNode;
	onClose?: () => void;
	showClose?: boolean;
	headerActions?: React.ReactNode;
};

const OverlayCardHeader: React.FC<OverlayCardHeaderProps> = (props) => {
	const showClose = props.showClose !== false && Boolean(props.onClose);

	return (
		<Box
			sx={{
				display: 'grid',
				gridTemplateColumns: '1fr auto 1fr',
				alignItems: 'center',
				width: '100%',
				gap: cardInnerGap,
			}}
		>
			<Box aria-hidden />
			<Box
				sx={{
					display: 'flex',
					flexDirection: 'row',
					alignItems: 'center',
					justifyContent: 'center',
					gap: cardInnerGap,
					minWidth: 0,
				}}
			>
				{props.icon ? (
					<Box sx={sxCardIcon}>{props.icon}</Box>
				) : null}
				{props.title ? (
					<Typography
						variant='body2'
						sx={{ ...sxCardLabel, textAlign: 'center' }}
						noWrap
					>
						{props.title}
					</Typography>
				) : null}
			</Box>
			<Box
				sx={{
					display: 'flex',
					alignItems: 'center',
					justifyContent: 'flex-end',
					gap: 'clamp(4px, 0.5vw, 8px)',
					flexShrink: 0,
				}}
			>
				{props.headerActions}
				{showClose ? (
					<Box
						component='button'
						type='button'
						onPointerDown={(event) => {
							event.stopPropagation();
							props.onClose?.();
						}}
						onClick={(event) => {
							event.stopPropagation();
						}}
						aria-label='Close'
						sx={overlayHeaderCloseButtonSx}
					>
						<CloseIcon />
						Close
					</Box>
				) : null}
			</Box>
		</Box>
	);
};

export default OverlayCardHeader;
