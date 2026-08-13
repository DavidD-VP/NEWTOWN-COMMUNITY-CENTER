
import * as React from 'react';
import { Button, ButtonProps, Dialog, DialogProps, DialogTitle, DialogTitleProps, DialogContent, DialogContentProps, } from "@mui/material"
import BoltIcon from '@mui/icons-material/Bolt';

import * as lodash from 'lodash';

const PresetButton = (props?: ButtonProps): ButtonProps => {

    return (lodash.merge({children: <BoltIcon></BoltIcon>}, props));
}

export default PresetButton;