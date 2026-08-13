import React from 'react';
import {
	CrestronSignal,
	useCrestronAnalogSignal,
} from '../../../crestron/CrComLib';
import { ButtonDialogProps } from './ButtonDialog';
import {
	DialogTitle,
	DialogContent,
	Button,
	List,
	ListItem,
	DialogContentText,
} from '@mui/material';

import { useAppStore } from '../../../store/appStore';

import PaletteIcon from '@mui/icons-material/Palette';
import ListDialog from './ListDialog';

export type ThemeDialogProps = {
	themes: Array<{
		name: string;
		icon: JSX.Element;
		signalValue: number;
		themeValue: any;
	}>;
	signal?: CrestronSignal<number>;
};

const ThemeDialog = (props: ThemeDialogProps): ButtonDialogProps => {
	const [signal] = useCrestronAnalogSignal(
		props.signal ? props.signal : { name: '' },
	);
	const themeMode = useAppStore((state) => state.themeMode);
	const setThemeMode = useAppStore((state) => state.setThemeMode);

	React.useEffect(() => {
		if (props.signal && props.themes[signal.state.value]) {
			setThemeMode(props.themes[signal.state.value].themeValue);
		}
	}, [signal.state.value, props.themes, setThemeMode]);

	return ListDialog({
		Key: 'theme-dialog',
		DialogButton: {
			children: (
				<PaletteIcon></PaletteIcon>
			),
			disabled: false,
		},
		Title: 'Theme Selection',
		Select: {
			Enable: false,
			OnSelect: (item: number) => { },
			Select: (index: number) => {
				if (props.signal) {
					signal.action.setValue(index);
				} else {
					setThemeMode(
						props.themes[index].themeValue,
					);
				}
			},
			Value: signal.state.value,
			TextField: {
				sx: { marginBottom: 2, width: '100%' }
			},
			Button: {
				children: 'Select',
			},
		},
		List: {
			Props: {},
			ItemType: 'Property',
			Items: props.themes.map((theme, index) => {
				return {
					Label: `${theme.name}`,
					ListItemProps: {
						key: index, sx: { paddingLeft: 1, paddingRight: 1 },
						value: theme.signalValue,
						children: <Button key={`theme-listitem-${index}-button`} sx={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }} variant={index === signal.state.value ? 'contained' : 'outlined'}>
							{theme.icon}
							<span key={`theme-listitem-${index}-name`}>{` ${theme.name}`}</span>
						</Button>
					}
				}
			}),
			Details: 'View the available themes.',
			Navigation: {
				Enable: false,
				PreviousButton: { variant: 'outlined', onClick: () => { } },
				NextButton: { variant: 'outlined', onClick: () => { } }
			},
			Search: {
				Enable: false,
				TextFieldProps: {
					id: `theme-search-textfield`,
					placeholder: 'Search Theme List...',
					onChange: (e: any) => { },
					defaultValue: '',
				}
			},
		},
		Edit: {
			Add: {
				Enable: false,
				OnAdd: (FormData: any) => { },
				Details: '',
			},
			Remove: {
				Enable: false,
				OnRemove: (item: number) => { },
				Details: '',
			},
			Update: {
				Enable: false,
				OnUpdate: (FormData: any) => { },
			},
			Form: [],
		},
		Refresh: {
			Enable: false,
			Active: false,
			Button: {},
		},
	});
};

export default ThemeDialog;
