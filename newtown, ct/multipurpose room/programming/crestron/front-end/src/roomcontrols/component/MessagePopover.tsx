import React from 'react';

import { Box, Typography } from '@mui/material';

import TouchPanelOverlay from './TouchPanelOverlay';
import { overlayBodyCopyCenterSx } from './touchPanelOverlayStyles';

export type MessagePopoverProps = {
	open: boolean;
	onClose: () => void;
	message: string;
	title?: string;
};

const MessagePopover: React.FC<MessagePopoverProps> = (props) => (
	<TouchPanelOverlay
		open={props.open}
		onClose={props.onClose}
		title={props.title ?? 'Notice'}
	>
		<Box
			sx={{
				display: 'flex',
				flexDirection: 'column',
				alignItems: 'center',
				justifyContent: 'center',
				gap: 2,
			}}
		>
			<Typography sx={overlayBodyCopyCenterSx}>
				{props.message}
			</Typography>
		</Box>
	</TouchPanelOverlay>
);

export default MessagePopover;
