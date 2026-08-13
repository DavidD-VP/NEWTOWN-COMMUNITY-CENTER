import * as React from 'react';
import { useSignalStore, publishEvent } from "../../crestron/CrComLib";
import { Box, List, ListProps, ListItem, ListItemProps, Select, SelectProps, CardHeader, CardHeaderProps, TextField, TextFieldProps } from "@mui/material";

export type CrestronListProps = {
    CardHeaderProps?: CardHeaderProps,
    ListProps: ListProps,
    ListItems: Array<{ props: ListItemProps, Search?: string }>,
    Select?: { signal: string, props: SelectProps },
    Selected?: (index: number) => void,
    Search?: TextFieldProps,
}

const CrestronList = (props: CrestronListProps): JSX.Element => {

    const selectValue = useSignalStore((s) => props.Select ? (s.numbers[props.Select.signal] ?? 0) : 0);
    const [search, setSearch] = React.useState<string>('');

    // Memoize the filtered list items to avoid recalculating on every render
    const filteredItems = React.useMemo(() => {
        if (props.Search === undefined) {
            return props.ListItems;
        }
        const searchUpper = search.toUpperCase();
        return props.ListItems.filter(item =>
            item.Search?.toUpperCase().includes(searchUpper)
        );
    }, [props.ListItems, props.Search, search]);

    // Memoize the list item props to avoid expensive lodash.merge on every render
    const listItemProps = React.useMemo(() => {
        return filteredItems.map((listItem, index) => {
            const originalOnClick = listItem.props.onClick;
            return {
                ...listItem.props,
                variant: (index === selectValue) ? 'contained' : 'outlined',
                onClick: (event: React.MouseEvent<HTMLLIElement>) => {
                    if (originalOnClick) {
                        originalOnClick(event);
                    }
                    if (props.Select) publishEvent('number', props.Select.signal, index);
                }
            } as ListItemProps;
        });
}, [filteredItems, selectValue]);

    // Memoize the text field change handler
    const handleSearchChange = React.useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        if (props.Search?.onChange) {
            props.Search.onChange(e as any);
        }
        setSearch(e.target.value);
    }, [props.Search]);

    // Memoize the text field props
    const textFieldProps = React.useMemo(() => ({
        label: 'Search',
        ...props.Search,
        onChange: handleSearchChange,
        value: search,
    }), [props.Search, handleSearchChange, search]);

    React.useEffect(() => {
        if (props.Selected) {
            props.Selected(selectValue);
        }
    }, [selectValue, props.Selected]);

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-start', width: '100%' }}>
            {props.CardHeaderProps ? <CardHeader {...props.CardHeaderProps}></CardHeader> : <></>}
            {props.Search ? <TextField {...textFieldProps} ></TextField> : <></>}
            {props.Select ? <Select {...props.Select.props}></Select> : <></>}
            <List {...props.ListProps}>
                {
                    listItemProps.map((itemProps, index) => (<ListItem key={index} {...itemProps}></ListItem>))
                }
            </List>
        </Box>
    );
};
export default CrestronList;