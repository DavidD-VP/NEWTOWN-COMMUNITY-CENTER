import * as React from 'react';

import {
	BottomNavigationActionProps as MuiBottomNavigationActionProps,
	DialogProps as MuiDialogProps,
} from '@mui/material';

export type DialogProps = {
	BottomNavigationActionProps: MuiBottomNavigationActionProps;
	DialogProps?: MuiDialogProps;
	Overlay?: React.ReactNode;
	/** When true, the nav button shows the active/selected style while the popup is open. */
	navActive?: boolean;
};
