import * as React from 'react';

import BoltIcon from '@mui/icons-material/Bolt';
import DeleteIcon from '@mui/icons-material/Delete';

import { Button, ButtonProps, Typography } from '@mui/material';

import { ButtonDialogProps } from './ButtonDialog';

import ListDialog, { ListDialogProps } from './ListDialog';
import { useCrestronAnalogSignal, useCrestronDigitalSignal, CrestronSignal, useCrestronSerialSignal, useCrestronDigitalPublish, useCrestronAnalogPublish, useCrestronSerialPublish } from '../../../crestron/CrComLib';

export type PresetDialogProps = {
    id: string,
    presets: Array<{ Name: string }>,
    disable: {
        signal: CrestronSignal<boolean>,
    },
    connect: {
        signal: CrestronSignal<boolean>,
        disable: {
            signal: CrestronSignal<boolean>
        },
    },
    edit: {
        update:
        {
            enable: {
                signal: CrestronSignal<boolean>,
            },
            signal: CrestronSignal<boolean>,
            details?: string,
        },
        add:
        {
            enable: {
                signal: CrestronSignal<boolean>,
            },
            signal: CrestronSignal<boolean>,
            details?: string,
        },
        remove: {
            enable: {
                signal: CrestronSignal<boolean>,
            },
            signal: CrestronSignal<boolean>,
            details?: string,
        },
        form: Array<{
            name: string,
            type: 'boolean' | 'number' | 'string',
            signal: CrestronSignal<any>,
        }>
    },
    navigation: {
        enable: {
            signal: CrestronSignal<boolean>,
        },
        previous: {
            signal: CrestronSignal<boolean>,
        },
        next: {
            signal: CrestronSignal<boolean>,
        },
    },
    refresh: {
        enable: {
            signal: CrestronSignal<boolean>,
        },
        signal: CrestronSignal<boolean>,
    },
    search: {
        enable: {
            signal: CrestronSignal<boolean>,
        },
        signal: CrestronSignal<string>,
    },
    select: {
        signal: CrestronSignal<number>,
    },
    title?: string,
    itemType?: string,
    recallLabel?: string,
    details?: string,
};

const usePresetDialog = (props: PresetDialogProps): ButtonDialogProps => {

    const [presets, setPresets] = React.useState<{ Name: string, value: number }[]>(props.presets.map((preset, index) => ({ ...preset, value: index + 1 })).filter(preset => preset.Name.length !== 0));

    React.useEffect(() => {

        if (JSON.stringify(props.presets.map((preset, index) => ({ ...preset, value: index + 1 })).filter(preset => preset.Name.length !== 0)) !== JSON.stringify(presets))
            setPresets(props.presets.map((preset, index) => ({ ...preset, value: index + 1 })).filter(preset => preset.Name.length !== 0));

    }, [props.presets]);


    const [disable] = useCrestronDigitalSignal(props.disable.signal);

    const [connect] = useCrestronDigitalSignal(props.connect.signal);
    const [connectDisable] = useCrestronDigitalSignal(props.connect.disable.signal);

    const [enableUpdateEdit] = useCrestronDigitalSignal(props.edit.update.enable.signal);
    const [updateEdit] = useCrestronDigitalSignal(props.edit.update.signal);
    
    const [enableAddEdit] = useCrestronDigitalSignal(props.edit.add.enable.signal);
    const [addEdit] = useCrestronDigitalSignal(props.edit.add.signal);

    const [enableRemoveEdit] = useCrestronDigitalSignal(props.edit.remove.enable.signal);
    const [removeEdit] = useCrestronDigitalSignal(props.edit.remove.signal);

    const [enableNavigation] = useCrestronDigitalSignal(props.navigation.enable.signal);
    const [previousNavigation] = useCrestronDigitalSignal(props.navigation.previous.signal);
    const [nextNavigation] = useCrestronDigitalSignal(props.navigation.next.signal);

    const [enableRefresh] = useCrestronDigitalSignal(props.refresh.enable.signal);
    const [refresh] = useCrestronDigitalSignal(props.refresh.signal);

    const [enableSearch] = useCrestronDigitalSignal(props.search.enable.signal);
    const [search] = useCrestronSerialSignal(props.search.signal);

    const [select] = useCrestronAnalogSignal(props.select.signal);

    return ListDialog({
        Key: `${props.id}-preset-dialog`,
        DialogButton: {
            children: <BoltIcon></BoltIcon>,
            disabled: disable.state.value,
        },
        Title: props.title ? props.title : 'Presets',
        Select: {
            Enable: true,
            OnSelect(value: number) { connect.action.setValue(true); connect.action.setValue(false); },
            Select(value: number) { select.action.setValue(value); },
            Value: select.state.value,
            TextField: { sx: { marginBottom: 2, width: '100%' } },
            Button: { variant: 'outlined', sx: { marginBottom: 2, marginLeft: 2 }, children: props.recallLabel ? props.recallLabel : 'Recall', disabled: connectDisable.state.value },
        },
        List: {
            Details: props.details,
            Props: {

            },
            ItemType: props.itemType ? props.itemType : 'Preset',
            Items: presets.map((preset, index) => {
                return {
                    Label: `${preset.Name}`,
                    ListItemProps: {
                        key: index, sx: { paddingLeft: 1, paddingRight: 1 },
                        value: preset.value,
                        children: <Button key={`${props.id}-audio-preset-listitem-${index}-button`} sx={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }} variant={preset.value === select.state.value ? 'contained' : 'outlined'}>
                            <BoltIcon key={`${props.id}-audio-preset-listitem-${index}-icon`} />
                            <Typography key={`${props.id}-audio-preset-listitem-${index}-label`} sx={{ width: '100%' }}>{`${preset.Name}`}</Typography>
                        </Button>
                    }
                }
            }),
            Navigation: {
                Enable: enableNavigation.state.value,
                PreviousButton: { variant: 'outlined', onClick: () => { previousNavigation.action.setValue(true); previousNavigation.action.setValue(false); } },
                NextButton: { variant: 'outlined', onClick: () => { nextNavigation.action.setValue(true); nextNavigation.action.setValue(false); } }
            },
            Search: {
                Enable: enableSearch.state.value,
                TextFieldProps: {
                    id: `${props.id}-preset-search-textfield`,
                    placeholder: 'Search Preset List...',
                    onChange: (e: any) => {
                        search.action.setValue(e.target.value);
                    },
                    defaultValue: search.state.value,
                }
            }
        },
        Edit: {
            Update: {
                Details: props.edit.add.details,
                Enable: enableAddEdit.state.value,
                OnUpdate(FormData: any) {
                    props.edit.form.forEach(property => {
                        switch (property.type) {
                            case 'boolean': {
                                useCrestronDigitalPublish(property.signal.name)[0].setValue(FormData[`${property.name}`]);
                                break;
                            }
                            case 'number': {
                                useCrestronAnalogPublish(property.signal.name)[0].setValue(FormData[`${property.name}`]);
                                break;
                            }
                            case 'string': {
                                useCrestronSerialPublish(property.signal.name)[0].setValue(FormData[`${property.name}`]);
                                break;
                            }
                        }
                    });

                    updateEdit.action.setValue(true);
                    updateEdit.action.setValue(false);
                },
            },
            Add: {
                Details: props.edit.add.details,
                Enable: enableAddEdit.state.value,
                OnAdd(FormData: any) {
                    props.edit.form.forEach(property => {
                        switch (property.type) {
                            case 'boolean': {
                                useCrestronDigitalPublish(property.signal.name)[0].setValue(FormData[`${property.name}`]);
                                break;
                            }
                            case 'number': {
                                useCrestronAnalogPublish(property.signal.name)[0].setValue(FormData[`${property.name}`]);
                                break;
                            }
                            case 'string': {
                                useCrestronSerialPublish(property.signal.name)[0].setValue(FormData[`${property.name}`]);
                                break;
                            }
                        }
                    });

                    addEdit.action.setValue(true);
                    addEdit.action.setValue(false);
                },
            },
            Remove: {
                Details: props.edit.remove.details,
                Enable: enableRemoveEdit.state.value,
                OnRemove(index: number) {
                    removeEdit.action.setValue(true);
                    removeEdit.action.setValue(false);
                },
            },
            Form: props.edit.form.map(property => {
                switch (property.type) {
                    case 'boolean': {
                        return {
                            id: `${props.id}-preset-edit-add-${property.name}-textfield`,
                            name: property.name,
                            placeholder: property.name,
                            type: 'boolean',

                            props: {
                                label: property.name,
                            }
                        }
                    }
                    case 'number': {
                        return {
                            id: `${props.id}-preset-edit-add-${property.name}-textfield`,
                            name: property.name,
                            placeholder: property.name,
                            type: 'number',

                        }
                    }
                    case 'string': {
                        return {
                            id: `${props.id}-preset-edit-add-${property.name}-textfield`,
                            name: property.name,
                            placeholder: property.name,
                            type: 'text',
                        }
                    }
                }
            }),
        },
        Refresh: {
            Enable: enableRefresh.state.value,
            Active: refresh.state.value,
            Button: {
                onClick: () => {
                    refresh.action.setValue(true);
                    refresh.action.setValue(false);
                }
            }
        }
    });
};

export default usePresetDialog;