
import * as React from 'react';
import { Button, ButtonProps, Dialog, DialogProps, DialogTitle, DialogTitleProps, DialogContent, DialogContentProps, } from "@mui/material"
import VideoCameraFrontIcon from '@mui/icons-material/VideoCameraFront';

import * as lodash from 'lodash';

const SelfviewButton = (props?: ButtonProps): ButtonProps => {

    return (lodash.merge({children: <VideoCameraFrontIcon></VideoCameraFrontIcon>}, props));
}

export default SelfviewButton;