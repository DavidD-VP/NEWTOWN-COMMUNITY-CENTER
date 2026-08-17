import React from 'react';

import {
	useSignalStore,
	publishEvent,
} from '../../../crestron/CrComLib';

import TouchPanelOverlay from '../../component/TouchPanelOverlay';
import {
	Box,
	Card,
	CardActionArea,
	MenuItem,
	ListItemIcon,
	ListItemText,
	Typography,
} from '@mui/material';

import { useTheme } from '@mui/material/styles';

import { menuListItemIconSx, menuIconSize } from '../../theme/tokens';
import { selectionMenuItemSx } from '../../component/selectionPopoverStyles';
import PaletteIcon from '@mui/icons-material/Palette';
import CheckIcon from '@mui/icons-material/Check';
import LockIcon from '@mui/icons-material/Lock';

import { useAppStore } from '../../../store/appStore';
import { ThemeMode } from '../../../store/appStore';
import { CardProps } from '../Card';
import type { ThemeOption } from './themeOptions';
import {
	sxCardActive,
	sxCardBase,
	cardPaddingV,
	cardPaddingH,
	cardInnerGap,
	cardIconSize,
	shadowActiveHover,
} from '../../theme/tokens';
import { useCloseOverlayWhenLocked } from '../../hooks/useCloseOverlayWhenLocked';
import CardPressHint from '../../component/CardPressHint';
import { getThemeByCatalogIndex, themeCatalog } from './themeOptions';

// ── Types ────────────────────────────────────────────────────────────

export type { ThemeOption } from './themeOptions';

export type ThemeCardProps = {
	themes: Array<ThemeOption>;
	signal?: string;
	/** Crestron digital — when true, theme menu is locked (no edit access). */
	settingsLocked: string;
};

// ── Inner component (owns all hooks) ────────────────────────────────

const ThemeCardInner: React.FC<ThemeCardProps> = (props) => {
	const theme = useTheme();
	const isDark = theme.palette.mode === 'dark';

	const [menuOpen, setMenuOpen] = React.useState(false);

	const themeMode = useAppStore((state) => state.themeMode);
	const setThemeMode = useAppStore((state) => state.setThemeMode);

	const signalValue = useSignalStore((s) => props.signal ? (s.numbers[props.signal] ?? 0) : 0);
	const settingsLocked = useSignalStore((s) => s.booleans[props.settingsLocked] ?? false);

	// Sync from Crestron signal → theme store (catalog index, not filtered list index)
	React.useEffect(() => {
		if (!props.signal) return;
		const option = getThemeByCatalogIndex(signalValue);
		if (option) setThemeMode(option.themeValue);
	}, [signalValue, props.signal, setThemeMode]);

	const currentOption =
		themeCatalog.find((t) => t.themeValue === themeMode) ??
		props.themes[0];

	const handleCardClick = React.useCallback(() => {
		setMenuOpen(true);
	}, []);

	const handleMenuClose = React.useCallback(() => {
		setMenuOpen(false);
	}, []);

	useCloseOverlayWhenLocked(settingsLocked, handleMenuClose);

	const handleThemeSelect = React.useCallback(
		(catalogIndex: number) => {
			const option = getThemeByCatalogIndex(catalogIndex);
			if (!option) return;

			if (props.signal) {
				publishEvent('number', props.signal, catalogIndex);
			}
			else {
				setThemeMode(option.themeValue);
			}
			setMenuOpen(false);
		},
		[props.signal, setThemeMode],
	);

	return (
		<Box sx={{ width: '100%' }}>
			<Card
				variant='outlined'
				sx={{
					...sxCardBase,
					flexDirection: 'column',
					...sxCardActive,
					'&:hover': {
						boxShadow: shadowActiveHover,
					},
				}}
			>
				<CardActionArea
					onClick={settingsLocked ? undefined : handleCardClick}
					sx={{
						flex: 1,
						display: 'flex',
						flexDirection: 'row',
						alignItems: 'center',
						paddingTop: cardPaddingV,
						paddingBottom: cardPaddingV,
						paddingLeft: cardPaddingH,
						paddingRight: cardPaddingH,
						gap: cardInnerGap,
					}}
				>
					{/* Icon */}
					<Box
						sx={{
							'& .MuiSvgIcon-root': {
								fontSize: cardIconSize,
								color: '#fff',
							},
							display: 'flex',
							alignItems: 'center',
							flexShrink: 0,
						}}
					>
						<PaletteIcon />
					</Box>

					{/* Labels */}
					<Box
						sx={{
							display: 'flex',
							flexDirection: 'column',
							justifyContent: 'center',
							gap: '2px',
							flex: 1,
							minWidth: 0,
						}}
					>
						<Box sx={{ display: 'flex', alignItems: 'center', gap: '4px', minWidth: 0 }}>
							<Typography
								variant='body2'
								sx={{
									fontWeight: 600,
									lineHeight: 1.2,
									color: '#fff',
								}}
								noWrap
							>
								Theme
							</Typography>
							{settingsLocked && (
								<LockIcon sx={{ fontSize: 'clamp(10px, 1.38vw, 27px)', color: '#ffa726', flexShrink: 0 }} />
							)}
						</Box>
						<Typography
							variant='caption'
							sx={{
								lineHeight: 1.1,
								fontWeight: 600,
								color: 'rgba(255,255,255,0.9)',
							}}
							noWrap
						>
							<Box
								component='span'
								sx={{
									display: 'inline-flex',
									alignItems: 'center',
									gap: '4px',
								}}
							>
								<Box
									component='span'
									sx={{
										display: 'inline-flex',
										'& .MuiSvgIcon-root': {
											fontSize: 'clamp(11px, 1.52vw, 29px)',
										},
									}}
								>
									{currentOption?.icon}
								</Box>
								{currentOption?.name}
							</Box>
						</Typography>
						{!settingsLocked && (
							<CardPressHint>Tap to set</CardPressHint>
						)}
					</Box>
				</CardActionArea>
			</Card>

			<TouchPanelOverlay
				open={menuOpen}
				onClose={handleMenuClose}
				title='Theme'
				icon={<PaletteIcon />}
			>
				{props.themes.map((option) => {
					const isSelected = option.themeValue === themeMode;
					return (
						<MenuItem
							key={option.themeValue}
							selected={isSelected}
							onClick={() => handleThemeSelect(option.catalogIndex)}
							sx={selectionMenuItemSx}
						>
							<ListItemIcon sx={menuListItemIconSx}>
								{option.icon}
							</ListItemIcon>
							<ListItemText
								primary={option.name}
								primaryTypographyProps={{
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
				})}
			</TouchPanelOverlay>
		</Box>
	);
};

// ── Public API ───────────────────────────────────────────────────────

/**
 * Returns a `CardProps` object containing a theme-selector card.
 * Call this the same way as `DestinationCard` — the inner component
 * owns all React hooks, so this function itself is hook-free and can
 * be called conditionally.
 */
export const ThemeCard = (props: ThemeCardProps): CardProps => {
	return {
		label: 'Theme',
		children: <ThemeCardInner {...props} />,
	};
};

export default ThemeCard;


