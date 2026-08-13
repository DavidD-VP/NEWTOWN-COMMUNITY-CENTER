import * as React from 'react';

import {
	Box,
	Typography,
} from '@mui/material';

import PhoneInTalkIcon from '@mui/icons-material/PhoneInTalk';
import CallEndIcon from '@mui/icons-material/CallEnd';

import CrestronButton from '../CrestronButton';
import TouchPanelOverlay from '../TouchPanelOverlay';
import {
	overlayFieldLabelSx,
	overlayFieldValueSx,
} from '../touchPanelOverlayStyles';
import { ctBtn } from '../../card/ctCardStyles';
import {
	ctrlBtnIconSize,
	overlayButtonContainedColor,
	sxCtrlBtn,
} from '../../theme/tokens';

export type IncomingCallDialogProps = {
	open: boolean;
	name: string;
	address: string;
	acceptSignal: string;
	rejectSignal: string;
	title?: string;
	zIndex?: number;
};

const fieldGridSx = {
	display: 'grid',
	gridTemplateColumns: 'minmax(96px, 34%) 1fr',
	columnGap: 2,
	rowGap: 1.25,
	alignItems: 'baseline',
	width: '100%',
} as const;

const acceptBtnSx = {
	...sxCtrlBtn,
	'&.MuiButton-outlined': {
		...sxCtrlBtn['&.MuiButton-outlined'],
		backgroundColor: 'success.main',
		borderColor: 'success.main',
		color: '#fff',
		'& .MuiSvgIcon-root': { fontSize: ctrlBtnIconSize, color: '#fff' },
		'& .MuiTypography-root': { color: '#fff' },
		'&:hover': {
			backgroundColor: 'success.dark',
			borderColor: 'success.dark',
		},
	},
	'&.MuiButton-contained': {
		...sxCtrlBtn['&.MuiButton-contained'],
		backgroundColor: 'success.dark',
		borderColor: 'success.dark',
		color: '#fff',
		'& .MuiSvgIcon-root': { fontSize: ctrlBtnIconSize, color: '#fff' },
		'& .MuiTypography-root': { color: '#fff' },
	},
} as const;

const rejectBtnSx = {
	...sxCtrlBtn,
	'&.MuiButton-outlined': {
		...sxCtrlBtn['&.MuiButton-outlined'],
		backgroundColor: 'error.main',
		borderColor: 'error.main',
		color: '#fff',
		'& .MuiSvgIcon-root': { fontSize: ctrlBtnIconSize, color: '#fff' },
		'& .MuiTypography-root': { color: '#fff' },
		'&:hover': {
			backgroundColor: 'error.dark',
			borderColor: 'error.dark',
		},
	},
	'&.MuiButton-contained': {
		...sxCtrlBtn['&.MuiButton-contained'],
		'& .MuiSvgIcon-root': { fontSize: ctrlBtnIconSize, color: overlayButtonContainedColor },
	},
} as const;

const IncomingCallDialog: React.FC<IncomingCallDialogProps> = (props) => {
	const name = props.name.trim();
	const address = props.address.trim();
	const zIndex = props.zIndex ?? 9000;

	return (
		<TouchPanelOverlay
			open={props.open}
			onClose={() => {}}
			title={props.title ?? 'Incoming Call'}
			icon={<PhoneInTalkIcon />}
			showCloseButton={false}
			disableBackdropClose
			disableEscapeKeyDown
			zIndex={zIndex}
			footer={
				<Box
					sx={{
						display: 'flex',
						flexDirection: 'row',
						flexWrap: 'wrap',
						gap: 2,
						justifyContent: 'center',
						alignItems: 'center',
					}}
				>
					<CrestronButton
						signal={props.acceptSignal}
						ButtonProps={{
							sx: acceptBtnSx,
							children: ctBtn(<PhoneInTalkIcon />, 'Accept'),
						}}
					/>
					<CrestronButton
						signal={props.rejectSignal}
						ButtonProps={{
							sx: rejectBtnSx,
							children: ctBtn(<CallEndIcon />, 'Reject'),
						}}
					/>
				</Box>
			}
		>
			<Box>
				{name || address ? (
					<Box sx={fieldGridSx}>
						{name ? (
							<>
								<Typography sx={overlayFieldLabelSx}>Name</Typography>
								<Typography sx={overlayFieldValueSx}>{name}</Typography>
							</>
						) : null}
						{address ? (
							<>
								<Typography sx={overlayFieldLabelSx}>Address</Typography>
								<Typography sx={overlayFieldValueSx}>{address}</Typography>
							</>
						) : null}
					</Box>
				) : (
					<Typography sx={overlayFieldValueSx}>Incoming call</Typography>
				)}
			</Box>
		</TouchPanelOverlay>
	);
};

export default IncomingCallDialog;
