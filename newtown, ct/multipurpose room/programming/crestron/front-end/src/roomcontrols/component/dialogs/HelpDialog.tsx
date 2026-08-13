import * as React from 'react';
import {
	Box,
	Typography,
} from '@mui/material';
import HelpIcon from '@mui/icons-material/Help';
import { QRCodeSVG } from 'qrcode.react';

import { DialogProps } from './BottomNavigationActionDialog';
import { navigateToLocalManual } from '../../utils/navigateToLocalManual';
import TouchPanelOverlay from '../TouchPanelOverlay';
import {
	overlayBodyCopyCenterSx,
	overlayFieldValueSx,
} from '../touchPanelOverlayStyles';

export type HelpDialogProps = {
	hostURL: string;
	localURL: string;
	StandbyActive?: boolean;
};

type HelpQrOverlayProps = {
	hostURL: string;
	open: boolean;
	onClose: () => void;
};

const HelpQrOverlay: React.FC<HelpQrOverlayProps> = (props) => {
	const [showUrl, setShowUrl] = React.useState(false);

	React.useEffect(() => {
		if (!props.open) {
			setShowUrl(false);
		}
	}, [props.open]);

	return (
		<TouchPanelOverlay
			open={props.open}
			onClose={props.onClose}
			title='Help'
			icon={<HelpIcon />}
		>
			<Box
				sx={{
					display: 'flex',
					flexDirection: 'column',
					alignItems: 'center',
					gap: 2,
				}}
			>
				<Typography sx={overlayBodyCopyCenterSx}>
					Scan the QR code below to open the system manual and learn how to
					operate the system.
				</Typography>
				<Box
					component='button'
					type='button'
					onClick={() => setShowUrl((current) => !current)}
					aria-label='Show manual URL'
					aria-expanded={showUrl}
					sx={{
						border: 'none',
						background: 'none',
						padding: 0,
						cursor: 'pointer',
						lineHeight: 0,
					}}
				>
					<QRCodeSVG value={props.hostURL} size={200} />
				</Box>
				{showUrl && (
					<Box
						sx={{
							width: '100%',
							maxWidth: '100%',
							overflowX: 'auto',
							border: '1px solid',
							borderColor: 'primary.light',
							borderRadius: '8px',
							p: 2,
						}}
					>
						<Typography sx={{ ...overlayFieldValueSx, wordBreak: 'break-all' }}>
							{props.hostURL}
						</Typography>
					</Box>
				)}
			</Box>
		</TouchPanelOverlay>
	);
};

const HelpDialog = (props: HelpDialogProps): DialogProps => {
	const [qrOpen, setQrOpen] = React.useState(false);

	const localURL = props.localURL.trim();
	const hostURL = props.hostURL.trim();
	const useLocal = localURL.length > 0;
	const useHost = !useLocal && hostURL.length > 0;

	React.useEffect(() => {
		if (props.StandbyActive) {
			setQrOpen(false);
		}
	}, [props.StandbyActive]);

	const blurActiveElement = () => {
		if (document.activeElement instanceof HTMLElement) {
			document.activeElement.blur();
		}
	};

	const handleClose = () => setQrOpen(false);

	const handleNavClick = () => {
		blurActiveElement();
		if (useLocal) {
			navigateToLocalManual(localURL);
		} else if (useHost) {
			setQrOpen(true);
		}
	};

	const result: DialogProps = {
		BottomNavigationActionProps: {
			icon: <HelpIcon />,
			label: 'Help',
			onClick: handleNavClick,
		},
		navActive: useHost ? qrOpen : false,
	};

	if (useHost) {
		result.DialogProps = {
			open: qrOpen,
			onClose: handleClose,
		};
		result.Overlay = (
			<HelpQrOverlay
				hostURL={hostURL}
				open={qrOpen}
				onClose={handleClose}
			/>
		);
	}

	return result;
};

export default HelpDialog;
