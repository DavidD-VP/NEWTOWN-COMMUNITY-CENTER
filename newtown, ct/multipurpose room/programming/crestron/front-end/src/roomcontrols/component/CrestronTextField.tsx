import { TextField, TextFieldProps } from "@mui/material";
import { useSignalStore, publishEvent } from "../../crestron/CrComLib";
import * as lodash from 'lodash';
import * as React from 'react';

export type CrestronTextFieldProps = {
    signal: string,
    TextFieldProps?: TextFieldProps,
    validCharacters?: string[],
    characterLimit?: number,
    fakeFeedback?: boolean,
};

export const CrestronTextFieldProps = (props: CrestronTextFieldProps): TextFieldProps => {

    const storeValue = useSignalStore((s) => s.strings[props.signal] ?? '');

    const [input, setInput] = React.useState(document.getElementById(`crestron-text-field-${props.signal}`) as HTMLInputElement | null);
    const [fakeValue, setFakeValue] = React.useState('');

    const [isMounted, setIsMounted] = React.useState(false);

    React.useEffect(() => {
        setInput(document.getElementById(`crestron-text-field-${props.signal}`) as HTMLInputElement | null);
    }, [props.signal]);

    React.useEffect(() => {
        if (input && isMounted) {

            input.oninput = (e: Event) => {


                const target = e.target as HTMLInputElement;
                var value: string = target.value.toString();

                while (props.characterLimit && value.length > props.characterLimit) {
                    value = value.substring(1);
                }

                if (props.validCharacters === undefined || (props.validCharacters !== undefined && props.validCharacters.includes(value.substring(value.length - 1)))) {

                    if (props.fakeFeedback) {
                        setFakeValue(value);
                    }
                    else {
                        publishEvent('string', props.signal, value);
                    }
                };
            }
        }
        else {
            setIsMounted(true);
        }
    }, [input, props.validCharacters]);

    return {
        id: `crestron-text-field-${props.signal}`,
        value: props.fakeFeedback === true ? fakeValue : storeValue,
        ...props.TextFieldProps
    };
};

const CrestronTextField = (props: CrestronTextFieldProps): JSX.Element => {

    const storeValue = useSignalStore((s) => s.strings[props.signal] ?? '');

    const [input, setInput] = React.useState(document.getElementById(`crestron-text-field-${props.signal}`) as HTMLInputElement | null);
    const [fakeValue, setFakeValue] = React.useState('');

    const [isMounted, setIsMounted] = React.useState(false);

    React.useEffect(() => {
        setInput(document.getElementById(`crestron-text-field-${props.signal}`) as HTMLInputElement | null);
    }, [props.signal]);

    React.useEffect(() => {
        if (input && isMounted) {

            input.oninput = (e: Event) => {

                const target = e.target as HTMLInputElement;
                var value: string = target.value.toString();

                while (props.characterLimit && value.length > props.characterLimit) {
                    value = value.substring(1);
                }

                if (props.validCharacters === undefined || (props.validCharacters !== undefined && props.validCharacters.includes(value.substring(value.length - 1)))) {

                    if (props.fakeFeedback) {
                        setFakeValue(value);
                    }
                    else {
                        publishEvent('string', props.signal, value);
                    }
                };
            }
        }
        else {
            setIsMounted(true);
        }
    }, [input, props.validCharacters]);

    return <TextField
        id={`crestron-text-field-${props.signal}`}
        value={props.fakeFeedback === true ? fakeValue : storeValue}
        {...props.TextFieldProps}
    ></TextField>;
};

export default CrestronTextField;