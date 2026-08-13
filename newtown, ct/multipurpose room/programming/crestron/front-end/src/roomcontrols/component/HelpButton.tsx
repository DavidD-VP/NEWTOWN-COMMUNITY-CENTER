
import * as React from 'react';
import { Button, ButtonProps, Dialog, DialogProps, DialogTitle, DialogTitleProps, DialogContent, DialogContentProps, } from "@mui/material"
import HelpIcon from '@mui/icons-material/Help';

import * as lodash from 'lodash';

const HelpButton = (props?: ButtonProps): ButtonProps => {

    return (lodash.merge({children: <HelpIcon></HelpIcon>}, props));
}

export default HelpButton;