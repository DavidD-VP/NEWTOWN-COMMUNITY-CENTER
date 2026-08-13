
import * as React from 'react';
import { Button, ButtonProps, Dialog, DialogProps, DialogTitle, DialogTitleProps, DialogContent, DialogContentProps, } from "@mui/material"
import PowerSettingsNewIcon from '@mui/icons-material/PowerSettingsNew';

import * as lodash from 'lodash';

const PowerButton = (props?: ButtonProps): ButtonProps => {

    return (lodash.merge({children: <PowerSettingsNewIcon></PowerSettingsNewIcon>}, props));
}

export default PowerButton;