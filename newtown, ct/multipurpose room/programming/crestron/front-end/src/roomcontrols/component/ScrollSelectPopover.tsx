import React from 'react';

import {
	Box,
	ListItemIcon,
	ListItemText,
	MenuItem,
} from '@mui/material';

import CheckIcon from '@mui/icons-material/Check';
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';
import TvOffIcon from '@mui/icons-material/TvOff';

import TouchPanelOverlay from './TouchPanelOverlay';
import {
	menuListItemIconSx,
	menuIconSize,
	ctrlBtnHeight,
} from '../theme/tokens';
import { selectionMenuItemSx } from './selectionPopoverStyles';
import { overlayConfirmButtonSx } from './touchPanelOverlayStyles';

export type ScrollSelectOption = {
	value: number;
	label: string;
	secondary?: string;
};

export type ScrollSelectPopoverProps = {
	open: boolean;
	onClose: () => void;
	title?: string;
	options: ScrollSelectOption[];
	selected: number;
	onSelect: (value: number) => void;
	emptyLabel: string;
	confirmLabel?: string;
	onConfirm?: () => void;
	confirmDisabled?: boolean;
};

const ScrollSelectPopover: React.FC<ScrollSelectPopoverProps> = (props) => (
	<TouchPanelOverlay
		open={props.open}
		onClose={props.onClose}
		title={props.title ?? 'Select'}
		footer={props.confirmLabel && props.onConfirm ? (
			<Box
				component='button'
				type='button'
				disabled={props.confirmDisabled}
				onClick={props.onConfirm}
				sx={{
					...overlayConfirmButtonSx,
					width: '100%',
					minHeight: ctrlBtnHeight,
					borderRadius: '8px',
					fontSize: 'clamp(14px, 1.94vw, 38px)',
					fontWeight: 600,
				}}
			>
				{props.confirmLabel}
			</Box>
		) : undefined}
	>
		<Box sx={{ width: '100%' }}>
			{props.options.length === 0 ? (
				<MenuItem selected disabled sx={selectionMenuItemSx}>
					<ListItemIcon sx={menuListItemIconSx}>
						<TvOffIcon />
					</ListItemIcon>
					<ListItemText
						primary={props.emptyLabel}
						primaryTypographyProps={{
							noWrap: true,
							width: '100%',
							textAlign: 'left',
							paddingLeft: 'clamp(8px, 1.5vw, 16px)',
						}}
					/>
				</MenuItem>
			) : (
				props.options.map((option) => {
					const isSelected = props.selected === option.value;
					return (
						<MenuItem
							key={option.value}
							selected={isSelected}
							onClick={() => props.onSelect(option.value)}
							sx={selectionMenuItemSx}
						>
							<ListItemIcon sx={menuListItemIconSx}>
								<RadioButtonUncheckedIcon />
							</ListItemIcon>
							<ListItemText
								primary={option.label}
								secondary={option.secondary}
								primaryTypographyProps={{
									noWrap: true,
									width: '100%',
									textAlign: 'left',
									paddingLeft: 'clamp(8px, 1.5vw, 16px)',
								}}
								secondaryTypographyProps={{
									noWrap: true,
									width: '100%',
									textAlign: 'left',
									paddingLeft: 'clamp(8px, 1.5vw, 16px)',
								}}
							/>
							<CheckIcon
								color='inherit'
								sx={{
									fontSize: menuIconSize,
									ml: 1,
									flexShrink: 0,
									visibility: isSelected ? 'visible' : 'hidden',
								}}
							/>
						</MenuItem>
					);
				})
			)}
		</Box>
	</TouchPanelOverlay>
);

export default ScrollSelectPopover;
