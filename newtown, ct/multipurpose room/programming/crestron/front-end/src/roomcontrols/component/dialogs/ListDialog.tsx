import * as React from 'react';
import * as lodash from 'lodash';
import { List, Box, ButtonProps, DialogTitle, DialogActions, DialogContentTextProps, ListProps, ListItemProps, TextField, TextFieldProps, InputProps, DialogContent, DialogContentText, Button, Typography, ListItem, Input, InputAdornment, Accordion, AccordionSummary, AccordionDetails } from "@mui/material";
import { keyframes } from '@emotion/react';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

import RefreshIcon from '@mui/icons-material/Refresh';
import EditIcon from '@mui/icons-material/Edit';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import UpdateIcon from '@mui/icons-material/Update';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import NavigateBeforeIcon from '@mui/icons-material/NavigateBefore';

import { ButtonDialogProps } from "./ButtonDialog";

const rotateAnimation = keyframes`
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
`;

export type ListDialogProps = {
    Key: string,
    DialogButton: ButtonProps,
    Title: string,
    Select: {
        Enable: boolean,
        OnSelect: (item: number) => void,
        Select: (item: number) => void,
        Value: number,
        TextField: TextFieldProps,
        Button: ButtonProps,
    },
    List: {
        Props: ListProps,
        ItemType: string,
        Items: Array<
            {
                Label: string,
                ListItemProps: ListItemProps
            }>,
        Navigation: {
            Enable: boolean,
            PreviousButton: ButtonProps,
            NextButton: ButtonProps,
        },
        Search: {
            Enable: boolean,
            TextFieldProps: TextFieldProps,
        },
        Details?: string,
    },
    Edit: {
        Add: {
            Enable: boolean,
            OnAdd: (FormData: any) => void,
            Details?: string,
        },
        Remove: {
            Enable: boolean,
            OnRemove: (item: number) => void,
            Details?: string,
        },
        Update: {
            Enable: boolean,
            OnUpdate: (FormData: any) => void,
            Details?: string,
        },
        Form: Array<InputProps>,
    },
    Refresh: {
        Enable: boolean,
        Active: boolean,
        Button: ButtonProps,
    },
}

// Inner component that holds all stateful logic so that ListDialog itself is hook-free.
const ListDialogContent: React.FC<ListDialogProps> = (props) => {
    const [edit, setEdit] = React.useState(false);
    const [formData, setFormData] = React.useState<Record<string, any>>({});
    const [expandedAdd, setExpandedAdd] = React.useState(false);
    const [expandedRemove, setExpandedRemove] = React.useState(false);
    const [expandedUpdate, setExpandedUpdate] = React.useState(false);

    const handleFormChange = (fieldName: string, value: any) => {
        setFormData(prev => ({
            ...prev,
            [fieldName]: value
        }));
    };

    const handleAddSubmit = () => {
        props.Edit.Add.OnAdd(formData);
    };

    const handleUpdateSubmit = () => {
        props.Edit.Update.OnUpdate(formData);
    };

        const refreshButtonProps: ButtonProps = lodash.merge({}, props.Refresh.Button, {
            variant: props.Refresh.Active ? 'contained' : 'outlined',
            children: <RefreshIcon sx={{
                animation: props.Refresh.Active ? `${rotateAnimation} 1s linear infinite` : undefined
            }} />
        });
        const selectTextFieldProps: TextFieldProps = lodash.merge({}, props.Select.TextField, { label: `Selected ${props.List.ItemType}`, value: props.List.Items.find(item => item.ListItemProps.value === props.Select.Value)?.Label ? props.List.Items.find(item => item.ListItemProps.value === props.Select.Value)?.Label : `No ${props.List.ItemType} Selected`, disabled: true });
        const selectButtonProps: ButtonProps = lodash.merge({}, props.Select.Button, { onClick: () => { edit ? props.Edit.Remove.OnRemove(props.Select.Value) : props.Select.OnSelect(props.Select.Value); }, children: edit ? <DeleteIcon key="delete-icon" /> : (Array.isArray(props.Select.Button.children) ? <>{props.Select.Button.children}</> : props.Select.Button.children), disabled: props.Select.Button.disabled || !props.List.Items.find(item => item.ListItemProps.value === props.Select.Value) ? true : false });
        const searchTextFieldProps: TextFieldProps = lodash.merge({}, props.List.Search.TextFieldProps, { label: props.List.Search.TextFieldProps.label ? props.List.Search.TextFieldProps.label : 'Search' });
        const navigationPreviousButtonProps: ButtonProps = lodash.merge({}, props.List.Navigation.PreviousButton, { children: <NavigateBeforeIcon key="navigate-before-icon" /> });
        const navigationNextButtonProps: ButtonProps = lodash.merge({}, props.List.Navigation.NextButton, { children: <NavigateNextIcon key="navigate-next-icon" /> });

        const [listEmpty, setListEmpty] = React.useState<boolean>(props.List.Items.length === 0);
        const [listSearchEmpty, setListSearchEmpty] = React.useState<boolean | undefined>();

        React.useEffect(() => {
            setListEmpty(props.List.Items.length === 0);
        }, [props.List.Items]);

        React.useEffect(() => {
            setFormData({});
        }, [edit]);

        return (
            <React.Fragment>
                        <DialogTitle sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                            {props.Title}
                            <Box sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end' }}>
                                {
                                    props.Refresh.Enable ?
                                        <Button {...refreshButtonProps}></Button>
                                        : <></>
                                }
                                {
                                    props.Edit.Add.Enable || props.Edit.Remove.Enable ?
                                        <DialogActions>
                                            <Button onClick={() => setEdit(!edit)} variant={edit ? 'contained' : 'outlined'}><EditIcon /></Button>
                                        </DialogActions>
                                        :
                                        <></>
                                }
                            </Box>
                        </DialogTitle>
                        <DialogContent dividers sx={{ display: 'flex', flexDirection: 'column', overflow: 'auto' }}>
                            {
                                edit ?
                                    <>
                                        {
                                            props.Edit.Update.Enable ?
                                                <Accordion expanded={expandedUpdate} onChange={() => setExpandedUpdate(!expandedUpdate)} sx={{ marginBottom: 2 }}>
                                                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                                                        <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>Update {props.List.ItemType}</Typography>
                                                    </AccordionSummary>
                                                    <AccordionDetails>
                                                        <Box sx={{ display: props.Select.Button.disabled ? 'none' : 'flex', flexDirection: 'column', gap: 2, width: '100%', overflow: 'auto' }}>
                                                            <Typography variant="body2">{props.Edit.Update.Details || `To update a ${props.List.ItemType}, complete the form then press the 'Update ${props.List.ItemType}' button.`}</Typography>
                                                            {
                                                                props.Edit.Form.map((formField, index) => (
                                                                    <Input
                                                                        key={`Dialog-${props.Key}-FormField-Input-${index}`}
                                                                        {...formField}
                                                                        defaultValue={formData[formField.name as string] || ''}
                                                                        onChange={(e) => handleFormChange(formField.name as string, e.target.value)}
                                                                    />
                                                                ))
                                                            }
                                                            <Button variant="contained" onClick={handleUpdateSubmit} startIcon={<UpdateIcon />} disabled={Object.values(formData).length !== props.Edit.Form.length || Object.values(formData).some((value: any) => value === '' || value === undefined)}>
                                                                {`Update ${props.List.ItemType}`}
                                                            </Button>
                                                            <Box sx={{ display: 'flex', flexDirection: 'row', mt: 1 }}>
                                                                <TextField {...selectTextFieldProps}></TextField>
                                                            </Box>
                                                            {
                                                                (!listEmpty || (listEmpty && !listSearchEmpty)) && (props.List.Search.Enable || props.List.Navigation.Enable) ?
                                                                    <Box sx={{ display: 'flex', flexDirection: 'row', alignItems: 'stretch', gap: 1, marginBottom: listEmpty ? 0 : 2 }}>
                                                                        {
                                                                            props.List.Navigation.Enable ?
                                                                                <Button {...navigationPreviousButtonProps}></Button>
                                                                                : <></>
                                                                        }
                                                                        {
                                                                            props.List.Search.Enable ?
                                                                                <TextField sx={{ width: '100%', height: '100%', margin: props.List.Navigation.Enable ? 0 : 0 }} {...searchTextFieldProps} onChange={(e: any) => {
                                                                                    if (props.List.Search.TextFieldProps.onChange) {
                                                                                        props.List.Search.TextFieldProps.onChange(e);
                                                                                    }
                                                                                    setListSearchEmpty(e.target.value as string === '' ? true : false);
                                                                                }}></TextField>
                                                                                : <></>
                                                                        }
                                                                        {
                                                                            props.List.Navigation.Enable ?
                                                                                <Button {...navigationNextButtonProps}></Button>
                                                                                : <></>
                                                                        }
                                                                    </Box>
                                                                    :
                                                                    <></>
                                                            }
                                                            <List {...props.List.Props} sx={{ ...props.List.Props?.sx, overflow: 'auto', minHeight: 200, border: '1px solid', borderColor: 'divider' }}>
                                                                {
                                                                    props.List.Items.length === 0 ?
                                                                        <ListItem key={`Dialog-${props.Key}-ListItem-Empty`} sx={{ height: '200px', padding: 0, alignItems: 'center', justifyContent: 'center' }}>
                                                                            <DialogContentText {...{ children: `No ${props.List.ItemType}s Found` } as DialogContentTextProps}></DialogContentText>
                                                                        </ListItem>
                                                                        :
                                                                        props.List.Items.map((item, index) => {
                                                                            const ListItemProps = lodash.merge({}, item.ListItemProps, { value: item.ListItemProps.value ? Number(item.ListItemProps.value) : index, onClick: () => { props.Select.Select(item.ListItemProps.value ? Number(item.ListItemProps.value) : index); } });
                                                                            return <ListItem {...ListItemProps} key={`Dialog-${props.Key}-ListItem-${index}`}></ListItem>
                                                                        })
                                                                }
                                                            </List>
                                                        </Box>
                                                    </AccordionDetails>
                                                </Accordion>
                                                :
                                                <></>
                                        }
                                        {
                                            props.Edit.Add.Enable ?
                                                <Accordion expanded={expandedAdd} onChange={() => setExpandedAdd(!expandedAdd)} sx={{ marginBottom: 2 }}>
                                                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                                                        <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>Add {props.List.ItemType}</Typography>
                                                    </AccordionSummary>
                                                    <AccordionDetails>
                                                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, width: '100%', overflow: 'auto' }}>
                                                            <Typography variant="body2">{props.Edit.Add.Details || `To add a new ${props.List.ItemType}, complete the form then press the 'Add ${props.List.ItemType}' button.`}</Typography>
                                                            {
                                                                props.Edit.Form.map((formField, index) => (
                                                                    <Input
                                                                        key={`Dialog-${props.Key}-FormField-Input-${index}`}
                                                                        {...formField}
                                                                        defaultValue={formData[formField.name as string] || ''}
                                                                        onChange={(e) => handleFormChange(formField.name as string, e.target.value)}
                                                                    />
                                                                ))
                                                            }
                                                            <Button variant="contained" onClick={handleAddSubmit} startIcon={<AddIcon />} disabled={Object.values(formData).length !== props.Edit.Form.length || Object.values(formData).some((value: any) => value === '' || value === undefined)}>
                                                                {`Add ${props.List.ItemType}`}
                                                            </Button>
                                                        </Box>
                                                    </AccordionDetails>
                                                </Accordion>
                                                :
                                                <></>
                                        }
                                        {
                                            props.Edit.Remove.Enable ?
                                                <Accordion expanded={expandedRemove} onChange={() => setExpandedRemove(!expandedRemove)}>
                                                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                                                        <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>Remove {props.List.ItemType}</Typography>
                                                    </AccordionSummary>
                                                    <AccordionDetails>
                                                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, width: '100%', overflow: 'auto' }}>
                                                            <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', gap: 0.5, flexWrap: 'wrap' }}>{props.Edit.Remove.Details || <>{`To remove an existing ${props.List.ItemType}, select it from the list and press the`} <DeleteIcon fontSize="inherit" /> {`button`}</>}</Typography>
                                                            <Box sx={{ display: 'flex', flexDirection: 'row', mt: 1 }}>
                                                                <TextField {...selectTextFieldProps}></TextField>
                                                                <Button {...selectButtonProps}></Button>
                                                            </Box>
                                                            {
                                                                (!listEmpty || (listEmpty && !listSearchEmpty)) && (props.List.Search.Enable || props.List.Navigation.Enable) ?
                                                                    <Box sx={{ display: 'flex', flexDirection: 'row', alignItems: 'stretch', gap: 1, marginBottom: listEmpty ? 0 : 2 }}>
                                                                        {
                                                                            props.List.Navigation.Enable ?
                                                                                <Button {...navigationPreviousButtonProps}></Button>
                                                                                : <></>
                                                                        }
                                                                        {
                                                                            props.List.Search.Enable ?
                                                                                <TextField sx={{ width: '100%', height: '100%', margin: props.List.Navigation.Enable ? 0 : 0 }} {...searchTextFieldProps} onChange={(e: any) => {
                                                                                    if (props.List.Search.TextFieldProps.onChange) {
                                                                                        props.List.Search.TextFieldProps.onChange(e);
                                                                                    }
                                                                                    setListSearchEmpty(e.target.value as string === '' ? true : false);
                                                                                }}></TextField>
                                                                                : <></>
                                                                        }
                                                                        {
                                                                            props.List.Navigation.Enable ?
                                                                                <Button {...navigationNextButtonProps}></Button>
                                                                                : <></>
                                                                        }
                                                                    </Box>
                                                                    :
                                                                    <></>
                                                            }
                                                            <List {...props.List.Props} sx={{ ...props.List.Props?.sx, overflow: 'auto', minHeight: 200, border: '1px solid', borderColor: 'divider' }}>
                                                                {
                                                                    props.List.Items.length === 0 ?
                                                                        <ListItem key={`Dialog-${props.Key}-ListItem-Empty`} sx={{ height: '200px', padding: 0, alignItems: 'center', justifyContent: 'center' }}>
                                                                            <DialogContentText {...{ children: `No ${props.List.ItemType}s Found` } as DialogContentTextProps}></DialogContentText>
                                                                        </ListItem>
                                                                        :
                                                                        props.List.Items.map((item, index) => {
                                                                            const ListItemProps = lodash.merge({}, item.ListItemProps, { value: item.ListItemProps.value ? Number(item.ListItemProps.value) : index, onClick: () => { props.Select.Select(item.ListItemProps.value ? Number(item.ListItemProps.value) : index); } });
                                                                            return <ListItem {...ListItemProps} key={`Dialog-${props.Key}-ListItem-${index}`}></ListItem>
                                                                        })
                                                                }
                                                            </List>
                                                        </Box>
                                                    </AccordionDetails>
                                                </Accordion>
                                                :
                                                <></>
                                        }
                                    </>
                                    :
                                    <Accordion expanded={true}>
                                        <AccordionSummary>
                                            <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>{props.Select.Button.children ? props.Select.Button.children : 'Activate'} a{['a', 'e', 'i', 'o', 'u'].includes(props.List.ItemType.charAt(0).toLowerCase()) ? 'n' : ''} {props.List.ItemType}</Typography>
                                        </AccordionSummary>
                                        <AccordionDetails>
                                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, width: '100%', overflow: 'auto' }}>
                                                <Typography variant="body2">{props.List.Details || `Select a${['a', 'e', 'i', 'o', 'u'].includes(props.List.ItemType.charAt(0).toLowerCase()) ? 'n' : ''} ${props.List.ItemType} from the list and press the ${props.Select.Button.children} button.`}</Typography>
                                                <Box sx={{ display: 'flex', flexDirection: 'row', mt: 1 }}>
                                                    <TextField {...selectTextFieldProps}></TextField>
                                                    {
                                                        props.Select.Enable ?
                                                            <Button {...selectButtonProps}></Button>
                                                            : <></>
                                                    }
                                                </Box>
                                                {
                                                    (!listEmpty || (listEmpty && !listSearchEmpty)) && (props.List.Search.Enable || props.List.Navigation.Enable) ?
                                                        <Box sx={{ display: 'flex', flexDirection: 'row', alignItems: 'stretch', gap: 1, marginBottom: listEmpty ? 0 : 2 }}>
                                                            {
                                                                props.List.Navigation.Enable ?
                                                                    <Button {...navigationPreviousButtonProps}></Button>
                                                                    : <></>
                                                            }
                                                            {
                                                                props.List.Search.Enable ?
                                                                    <TextField sx={{ width: '100%', height: '100%', margin: props.List.Navigation.Enable ? 0 : 0 }} {...searchTextFieldProps} onChange={(e: any) => {
                                                                        if (props.List.Search.TextFieldProps.onChange) {
                                                                            props.List.Search.TextFieldProps.onChange(e);
                                                                        }
                                                                        setListSearchEmpty(e.target.value as string === '' ? true : false);
                                                                    }}></TextField>
                                                                    : <></>
                                                            }
                                                            {
                                                                props.List.Navigation.Enable ?
                                                                    <Button {...navigationNextButtonProps}></Button>
                                                                    : <></>
                                                            }
                                                        </Box>
                                                        :
                                                        <></>
                                                }
                                                <List {...props.List.Props} sx={{ ...props.List.Props?.sx, overflow: 'auto', minHeight: 200, border: '1px solid', borderColor: 'divider' }}>
                                                    {
                                                        props.List.Items.length === 0 ?
                                                            <ListItem key={`Dialog-${props.Key}-ListItem-Empty`} sx={{ height: '200px', padding: 0, alignItems: 'center', justifyContent: 'center' }}>
                                                                <DialogContentText {...{ children: `No ${props.List.ItemType}s Found` } as DialogContentTextProps}></DialogContentText>
                                                            </ListItem>
                                                            :
                                                            props.List.Items.map((item, index) => {
                                                                const ListItemProps = lodash.merge({}, item.ListItemProps, { value: item.ListItemProps.value ? Number(item.ListItemProps.value) : index, onClick: () => { props.Select.Select(item.ListItemProps.value ? Number(item.ListItemProps.value) : index); } });
                                                                return <ListItem {...ListItemProps} key={`Dialog-${props.Key}-ListItem-${index}`}></ListItem>
                                                            })
                                                    }
                                                </List>
                                            </Box>
                                        </AccordionDetails>
                                    </Accordion>
                            }
                        </DialogContent>
                    </React.Fragment>
        );
};

// Pure factory function — no hooks, safe to call conditionally.
const ListDialog = (props: ListDialogProps): ButtonDialogProps => ({
    key: props.Key,
    ButtonProps: props.DialogButton,
    DialogProps: {
        children: <ListDialogContent {...props} />,
    },
});

export default ListDialog;