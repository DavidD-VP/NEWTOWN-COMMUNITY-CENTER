import React from 'react';

import {
	useSignalStore,
	publishEvent,
} from '../../../crestron/CrComLib';

import {
	Box,
	Card,
	CardActionArea,
	Button,
	MenuItem,
	ListItemIcon,
	ListItemText,
	Typography,
} from '@mui/material';

import PersonIcon from '@mui/icons-material/Person';
import CheckIcon from '@mui/icons-material/Check';
import LockIcon from '@mui/icons-material/Lock';

import TouchPanelOverlay from '../../component/TouchPanelOverlay';

import { CardProps } from '../Card';
import {
	sxCardActive,
	sxCardBase,
	menuListItemIconSx,
	cardPaddingV,
	cardPaddingH,
	cardInnerGap,
	cardIconSize,
	menuIconSize,
	sxCtrlBtn,
	ctrlBtnIconSize,
	overlayButtonContainedColor,
	shadowActiveHover,
} from '../../theme/tokens';
import { ctBtn } from '../ctCardStyles';
import NumericKeypadPopover from '../../component/NumericKeypadPopover';
import { selectionMenuItemSx } from '../../component/selectionPopoverStyles';
import { useCloseOverlayWhenLocked } from '../../hooks/useCloseOverlayWhenLocked';

// ── Types ─────────────────────────────────────────────────────────────────────

export type AccessLevelOption = {
	/** 1-based index published to `selectSignal`. */
	value: number;
	label: string;
};

export type AccessLevelCardProps = {
	/** Crestron analog signal — 1-based index into `levels`. */
	selectSignal: string;
	/** Crestron serial signal — PIN published on keypad confirm. */
	passwordSignal: string;
	/** Crestron digital feedback — true after processor accepts password. */
	unlockedSignal: string;
	/** Levels from processor serial labels (empty labels omitted). */
	levels: readonly AccessLevelOption[];
};

// ── Inner component ───────────────────────────────────────────────────────────

const AccessLevelCardInner: React.FC<AccessLevelCardProps> = (props) => {

	const selectValue = useSignalStore((s) => s.numbers[props.selectSignal] ?? 0);
	const unlocked = useSignalStore((s) => s.booleans[props.unlockedSignal] ?? false);

	const [menuOpen, setMenuOpen] = React.useState(false);
	const [keypadOpen, setKeypadOpen] = React.useState(false);
	const [draft, setDraft] = React.useState('');

	const currentOption = props.levels.find((o) => o.value === selectValue);
	const levelCaption = currentOption?.label ?? 'Unknown';

	const handleCardClick = React.useCallback(() => {
		if (unlocked) {
			setMenuOpen(true);
		} else {
			setDraft('');
			setKeypadOpen(true);
		}
	}, [unlocked]);

	const handleMenuClose = React.useCallback(() => {
		setMenuOpen(false);
	}, []);

	useCloseOverlayWhenLocked(!unlocked, handleMenuClose);

	const handleKeypadClose = React.useCallback(() => {
		setKeypadOpen(false);
	}, []);

	const handleLevelSelect = React.useCallback(
		(value: number) => {
			publishEvent('number', props.selectSignal, value);
			setMenuOpen(false);
		},
		[props.selectSignal],
	);

	const handleKey = React.useCallback((key: string) => {
		if (key === 'back') {
			setDraft((prev) => prev.slice(0, -1));
		} else {
			setDraft((prev) => (prev.length < 20 ? prev + key : prev));
		}
	}, []);

	const handleKeypadConfirm = React.useCallback(() => {
		publishEvent('string', props.passwordSignal, draft);
		setKeypadOpen(false);
	}, [props.passwordSignal, draft]);

	const handleLock = React.useCallback(
		(e: React.MouseEvent) => {
			e.stopPropagation();
			setMenuOpen(false);
			publishEvent('string', props.passwordSignal, '');
		},
		[props.passwordSignal],
	);

	const lockButton = unlocked ? (
		<Button
			variant='outlined'
			onClick={handleLock}
			aria-label='Lock access level'
			sx={{
				...sxCtrlBtn,
				'&.MuiButton-outlined': {
					...sxCtrlBtn['&.MuiButton-outlined'],
					'& .MuiSvgIcon-root': { fontSize: ctrlBtnIconSize, color: '#fff' },
				},
				'&.MuiButton-contained': {
					...sxCtrlBtn['&.MuiButton-contained'],
					'& .MuiSvgIcon-root': { fontSize: ctrlBtnIconSize, color: overlayButtonContainedColor },
				},
			}}
		>
			{ctBtn(<LockIcon />, 'Lock')}
		</Button>
	) : null;

	return (
		<Box sx={{ width: '100%' }}>
			<Card
				variant='outlined'
				sx={{
					...sxCardBase,
					flexDirection: 'column',
					...sxCardActive,
					'&:hover': { boxShadow: shadowActiveHover },
				}}
			>
				<CardActionArea
					component='div'
					onClick={handleCardClick}
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
						width: '100%',
					}}
				>
					<Box
						sx={{
							'& .MuiSvgIcon-root': { fontSize: cardIconSize, color: '#fff' },
							display: 'flex',
							alignItems: 'center',
							flexShrink: 0,
						}}
					>
						<PersonIcon />
					</Box>
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
								sx={{ fontWeight: 600, lineHeight: 1.2, color: '#fff' }}
								noWrap
							>
								Access Level
							</Typography>
							{!unlocked && (
								<LockIcon
									sx={{
										fontSize: 'clamp(10px, 1.38vw, 27px)',
										color: '#ffa726',
										flexShrink: 0,
									}}
								/>
							)}
						</Box>
						<Box
							component='span'
							sx={{
								display: 'inline-flex',
								alignItems: 'center',
								gap: '4px',
								minWidth: 0,
							}}
						>
							<Box
								component='span'
								sx={{
									display: 'inline-flex',
									'& .MuiSvgIcon-root': { fontSize: 'clamp(11px, 1.52vw, 29px)' },
								}}
							>
								<PersonIcon />
							</Box>
							<Typography
								variant='caption'
								component='span'
								sx={{
									lineHeight: 1.1,
									fontWeight: 600,
									color: 'rgba(255,255,255,0.9)',
								}}
								noWrap
							>
								{levelCaption}
							</Typography>
						</Box>
						{!unlocked && (
							<Typography
								variant='caption'
								sx={{
									lineHeight: 1.1,
									fontWeight: 400,
									fontStyle: 'italic',
									color: 'rgba(255,255,255,0.75)',
								}}
								noWrap
							>
								Enter PIN to change
							</Typography>
						)}
					</Box>
					{lockButton}
				</CardActionArea>
			</Card>

			<TouchPanelOverlay
				open={menuOpen}
				onClose={handleMenuClose}
				title='Access Level'
				icon={<PersonIcon />}
			>
				{props.levels.map((option) => {
					const isSelected = selectValue === option.value;
					return (
						<MenuItem
							key={option.value}
							selected={isSelected}
							onClick={() => handleLevelSelect(option.value)}
							sx={selectionMenuItemSx}
						>
							<ListItemIcon sx={menuListItemIconSx}>
								<PersonIcon />
							</ListItemIcon>
							<ListItemText
								primary={option.label}
								primaryTypographyProps={{
									noWrap: true,
									width: '100%',
									textAlign: 'left',
									paddingLeft: 'clamp(8px, 1.5vw, 16px)',
								}}
							/>
							<CheckIcon
								color='inherit'
								sx={{ fontSize: menuIconSize, ml: 1, flexShrink: 0, visibility: isSelected ? 'visible' : 'hidden' }}
							/>
						</MenuItem>
					);
				})}
			</TouchPanelOverlay>

			<NumericKeypadPopover
				open={keypadOpen}
				onClose={handleKeypadClose}
				draft={draft}
				onKey={handleKey}
				onConfirm={handleKeypadConfirm}
				title='Enter PIN'
				confirmLabel='Confirm'
				maskDraft
			/>
		</Box>
	);
};

// ── Public API ────────────────────────────────────────────────────────────────

export const AccessLevelCard = (props: AccessLevelCardProps): CardProps => ({
	label: 'Access Level',
	children: <AccessLevelCardInner {...props} />,
});

export default AccessLevelCard;
