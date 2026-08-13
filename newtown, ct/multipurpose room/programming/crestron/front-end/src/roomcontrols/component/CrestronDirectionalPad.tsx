import CrestronButton, { CrestronButtonProps } from "./CrestronButton";
import * as lodash from 'lodash';
import * as React from 'react';
import { Box } from "@mui/system";

import ArrowDropUpIcon from '@mui/icons-material/ArrowDropUp';
import ArrowLeftIcon from '@mui/icons-material/ArrowLeft';
import ArrowRightIcon from '@mui/icons-material/ArrowRight';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import AdjustIcon from '@mui/icons-material/Adjust';

export type CrestronDirectionalPadProps = {
    Up: CrestronButtonProps,
    Down: CrestronButtonProps,
    Left: CrestronButtonProps,
    Right: CrestronButtonProps,
    Enter?: CrestronButtonProps,
} /*| {
    Up: CrestronButtonProps,
    Down: CrestronButtonProps,
    Left: CrestronButtonProps,
    Right: CrestronButtonProps,
    UpLeft: CrestronButtonProps
    UpRight: CrestronButtonProps,
    DownLeft: CrestronButtonProps,
    DownRight: CrestronButtonProps,
    Enter?: CrestronButtonProps,
}*/

const CrestronDirectionalPad = (props: CrestronDirectionalPadProps): JSX.Element => {

    // Default props for each directional button
    const defaultUpProps: Partial<CrestronButtonProps> = {
        ButtonProps: { children: <ArrowDropUpIcon /> }
    };
    
    const defaultDownProps: Partial<CrestronButtonProps> = {
        ButtonProps: { children: <ArrowDropDownIcon /> }
    };
    
    const defaultLeftProps: Partial<CrestronButtonProps> = {
        ButtonProps: { children: <ArrowLeftIcon /> }
    };
    
    const defaultRightProps: Partial<CrestronButtonProps> = {
        ButtonProps: { children: <ArrowRightIcon /> }
    };

    const defaultEnterProps: Partial<CrestronButtonProps> = {
        ButtonProps: { children: <AdjustIcon /> }
    };

    // Merge default props with passed props
    const mergedUpProps = lodash.merge({}, defaultUpProps, props.Up);
    const mergedDownProps = lodash.merge({}, defaultDownProps, props.Down);
    const mergedLeftProps = lodash.merge({}, defaultLeftProps, props.Left);
    const mergedRightProps = lodash.merge({}, defaultRightProps, props.Right);
    const mergedEnterProps = lodash.merge({}, defaultEnterProps, props.Enter);

    return <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <Box>
            <CrestronButton {...mergedUpProps}></CrestronButton>
        </Box>
        <Box  display='flex' flexDirection='row' alignItems='center' justifyContent='center'>
            <CrestronButton {...mergedLeftProps}></CrestronButton>
            {
                props.Enter ?
                    <CrestronButton {...mergedEnterProps}></CrestronButton>
                    : <></>
            }
            <CrestronButton {...mergedRightProps}></CrestronButton>
        </Box>
        <Box>
            <CrestronButton {...mergedDownProps}></CrestronButton>
        </Box>
    </Box>
};

export default CrestronDirectionalPad;