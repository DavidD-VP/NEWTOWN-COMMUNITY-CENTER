import * as React from 'react';

import {
	Button as MuiButton,
	ButtonProps as MuiButtonProps,
	Dialog as MuiDialog,
	DialogProps as MuiDialogProps,
} from '@mui/material';

export type ButtonDialogProps = {
	key: any;
	ButtonProps: MuiButtonProps;
	DialogProps: Partial<MuiDialogProps>;
};
