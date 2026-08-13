import * as React from 'react';
import { Typography } from '@mui/material';
import PowerSettingsNewIcon from '@mui/icons-material/PowerSettingsNew';

import { DialogProps } from './BottomNavigationActionDialog';
import CrestronButton from '../CrestronButton';
import TouchPanelOverlay from '../TouchPanelOverlay';
import {
	overlayBodyCopyCenterSx,
	overlayDestructiveFooterActionButtonSx,
} from '../touchPanelOverlayStyles';

export type PowerDialogProps = {
	Confirm: string;
	Standby: boolean;
};

const PowerDialog = (props: PowerDialogProps): DialogProps => {
	const [open, setOpen] = React.useState(false);

	React.useEffect(() => {
		if (props.Standby) {
			setOpen(false);
		}
	}, [props.Standby]);

	const handleClose = () => setOpen(false);

	return {
		BottomNavigationActionProps: {
			icon: <PowerSettingsNewIcon />,
			label: 'Power',
			onClick: () => {
				if (document.activeElement instanceof HTMLElement) {
					document.activeElement.blur();
				}
				setOpen(true);
			},
		},
		navActive: open,
		DialogProps: {
			open,
			onClose: handleClose,
		},
		Overlay: (
			<TouchPanelOverlay
				open={open}
				onClose={handleClose}
				title='Power'
				icon={<PowerSettingsNewIcon />}
				footer={
					<CrestronButton
						signal={props.Confirm}
						ButtonProps={{
							variant: 'contained',
							fullWidth: true,
							sx: overlayDestructiveFooterActionButtonSx,
							onPointerUp: () => {
								setOpen(false);
							},
							children: 'Confirm',
						}}
					/>
				}
			>
				<Typography sx={overlayBodyCopyCenterSx}>
					Confirm you would like to power off the system.
				</Typography>
			</TouchPanelOverlay>
		),
	};
};

export default PowerDialog;
