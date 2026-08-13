import * as React from 'react';

import { useSignalStore } from "../../crestron/CrComLib";

import Battery0BarIcon from '@mui/icons-material/Battery0Bar';
import BatteryAlertIcon from '@mui/icons-material/BatteryAlert';
import Battery20Icon from '@mui/icons-material/Battery20';
import Battery30Icon from '@mui/icons-material/Battery30';
import Battery50Icon from '@mui/icons-material/Battery50';
import Battery60Icon from '@mui/icons-material/Battery60';
import Battery80Icon from '@mui/icons-material/Battery80';
import Battery90Icon from '@mui/icons-material/Battery90';
import BatteryCharging20Icon from '@mui/icons-material/BatteryCharging20';
import BatteryCharging30Icon from '@mui/icons-material/BatteryCharging30';
import BatteryCharging50Icon from '@mui/icons-material/BatteryCharging50';
import BatteryCharging60Icon from '@mui/icons-material/BatteryCharging60';
import BatteryCharging80Icon from '@mui/icons-material/BatteryCharging80';
import BatteryCharging90Icon from '@mui/icons-material/BatteryCharging90';
import BatteryChargingFullIcon from '@mui/icons-material/BatteryChargingFull';
import BatteryFullIcon from '@mui/icons-material/BatteryFull';

export type CrestronBatteryIconProps = {
    charging: string,
    charge: string,
}

const CrestronBatteryIcon = (props: CrestronBatteryIconProps): JSX.Element => {

    const chargingValue = useSignalStore((s) => s.booleans[props.charging] ?? false);
    const chargeValue = useSignalStore((s) => s.numbers[props.charge] ?? 0);

    const [BatteryIcon, SetBatteryIcon] = React.useState(<></>);

    React.useEffect(() => {

        const charge = (chargeValue * 100) / 65535;

        switch (chargingValue) {
            case true:
                {
                    if (charge === 0) {
                        SetBatteryIcon(<BatteryCharging20Icon></BatteryCharging20Icon>);
                    }
                    else if (charge < 20) {
                        SetBatteryIcon(<BatteryCharging20Icon></BatteryCharging20Icon>);
                    }
                    else if (charge < 30) {
                        SetBatteryIcon(<BatteryCharging20Icon></BatteryCharging20Icon>);
                    }
                    else if (charge < 50) {
                        SetBatteryIcon(<BatteryCharging30Icon></BatteryCharging30Icon>);
                    }
                    else if (charge < 60) {
                        SetBatteryIcon(<BatteryCharging50Icon></BatteryCharging50Icon>);
                    }
                    else if (charge < 80) {
                        SetBatteryIcon(<BatteryCharging60Icon></BatteryCharging60Icon>);
                    }
                    else if (charge < 90) {
                        SetBatteryIcon(<BatteryCharging80Icon></BatteryCharging80Icon>);
                    }
                    else if (charge < 100) {
                        SetBatteryIcon(<BatteryCharging90Icon></BatteryCharging90Icon>);
                    }
                    else {
                        SetBatteryIcon(<BatteryChargingFullIcon></BatteryChargingFullIcon>);
                    }
                    break;
                }
            case false:
                {
                    if (charge === 0) {
                        SetBatteryIcon(<Battery0BarIcon></Battery0BarIcon>);
                    }
                    else if (charge < 20) {
                        SetBatteryIcon(<BatteryAlertIcon></BatteryAlertIcon>);
                    }
                    else if (charge < 30) {
                        SetBatteryIcon(<Battery20Icon></Battery20Icon>);
                    }
                    else if (charge < 50) {
                        SetBatteryIcon(<Battery30Icon></Battery30Icon>);
                    }
                    else if (charge < 60) {
                        SetBatteryIcon(<Battery50Icon></Battery50Icon>);
                    }
                    else if (charge < 80) {
                        SetBatteryIcon(<Battery60Icon></Battery60Icon>);
                    }
                    else if (charge < 90) {
                        SetBatteryIcon(<Battery80Icon></Battery80Icon>);
                    }
                    else if (charge < 100) {
                        SetBatteryIcon(<Battery90Icon></Battery90Icon>);
                    }
                    else {
                        SetBatteryIcon(<BatteryFullIcon></BatteryFullIcon>);
                    }
                    break;
                }
        }

    }, [chargingValue, chargeValue, props]);

    return BatteryIcon;
}

export default CrestronBatteryIcon;