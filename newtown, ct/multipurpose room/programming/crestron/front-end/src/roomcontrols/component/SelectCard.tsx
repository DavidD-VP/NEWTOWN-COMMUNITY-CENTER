import React from 'react';

import {
    useSignalStore,
    publishEvent,
} from '../../crestron/CrComLib';

import TouchPanelOverlay from './TouchPanelOverlay';
import {
    Box,
    Card,
    CardActionArea,
    Typography,
    MenuItem,
    ListItemIcon,
    ListItemText,
} from '@mui/material';
import CheckIcon from '@mui/icons-material/Check';
import LockIcon from '@mui/icons-material/Lock';

import {
    menuListItemIconSx,
    menuIconSize,
    sxCardActive,
    sxCardMuted,
    sxCardBase,
    cardPaddingV,
    cardPaddingH,
    cardInnerGap,
    cardIconSize,
    cardRowMinHeight,
    shadowActiveHover,
    shadowMutedHover,
    sxCardBtnGroupSlot,
} from '../theme/tokens';
import { selectionMenuItemSx } from './selectionPopoverStyles';
import OverflowMarqueeText from './OverflowMarqueeText';
import SelectListToolbar, { type SelectListToolbarConfig } from './SelectListToolbar';
import TextKeyboardPopover from './TextKeyboardPopover';
import { CardButtonGroup } from '../card/ctCardStyles';
import { useCloseOverlayWhenLocked } from '../hooks/useCloseOverlayWhenLocked';

/** Above list overlay (1300) and bottom nav (1400). */
const NESTED_KEYBOARD_Z_INDEX = 1500;

const menuItemSx = selectionMenuItemSx;

const emptyMenuItemSx = {
    pointerEvents: 'none',
    cursor: 'default',
    '& .MuiListItemText-primary': {
        color: 'rgba(255,255,255,0.85)',
        fontStyle: 'italic',
    },
} as const;

function normalizeSelectValue(raw: number): number {
	const value = Math.round(Number(raw));
	return Number.isFinite(value) ? value : 0;
}

// ── Types ────────────────────────────────────────────────────────────

/** A single entry in the selection menu. */
export type SelectOption = {
    value: number;
    label: string;
    icon: React.ReactNode;
    /** Optional second line in the menu (e.g. label slot value). */
    secondary?: string;
    /** Optional element rendered on the card body when this option is selected. */
    preview?: React.ReactNode;
};

export type SelectCardProps = {
    /** Crestron number signal — read for current value, published on select. */
    signal: string;
    /** Card header text. */
    title: string;
    /** Icon shown on the left of the card row. */
    cardIcon: React.ReactNode;
    /** Available options shown in the menu. */
    options: SelectOption[];
    /** Type of options, used for custom rendering or behavior. */
    optionType?: string;
    /** When true, tapping the card does not open the menu. */
    disableSelect?: boolean;
    /** When true, close any open menu when lock becomes active. */
    locked?: boolean;
    /** When true, suppress the lock icon even if select is disabled. */
    hideLockIcon?: boolean;
    /** Renders a dashed border when inactive (for Meeting-type destinations). */
    meetingBorder?: boolean;
    /** When true, applies the muted (red gradient) card style. */
    muted?: boolean;
    /** Optional elements rendered as overlay buttons on the card. */
    additionalButtons?: React.ReactNode[];
    /** Optional element rendered inline after the caption text. */
    captionAccessory?: React.ReactNode;
    /**
     * Custom renderer for the caption shown when an item is selected.
     * Defaults to option.label.
     */
    renderSelectedCaption?: (option: SelectOption) => React.ReactNode;
    /**
     * Fixed caption when select is disabled (e.g. integrator-driven label/address).
     * Shown instead of deriving from options/signal.
     */
    fixedCaption?: { label: string; secondary?: string };
    /** Optional element rendered on the card body below the header (not in the menu). */
    cardPreview?: React.ReactNode;
    /** Called after a menu item is chosen (after the signal is published). */
    onSelect?: (value: number) => void;
    /** Optional pinned toolbar for SIMPL-backed paging and search. */
    listToolbar?: SelectListToolbarConfig;
};

// ── Component ────────────────────────────────────────────────────────

const SelectCard: React.FC<SelectCardProps> = (props) => {
    const currentValue = useSignalStore((s) => normalizeSelectValue(s.numbers[props.signal] ?? 0));
    const [menuOpen, setMenuOpen] = React.useState(false);
    const [searchKeyboardOpen, setSearchKeyboardOpen] = React.useState(false);
    const searchConfig = props.listToolbar?.search;
    const searchQuery = useSignalStore((s) =>
        searchConfig ? (s.strings[searchConfig.querySignal] ?? '') : '',
    );

    const handleCardClick = React.useCallback(
        () => {
            setMenuOpen(true);
        },
        [],
    );

    const handleMenuClose = React.useCallback(() => {
        setMenuOpen(false);
        setSearchKeyboardOpen(false);
    }, []);

    useCloseOverlayWhenLocked(props.locked ?? false, handleMenuClose);

    const handleOpenSearchKeyboard = React.useCallback(() => {
        setSearchKeyboardOpen(true);
    }, []);

    const handleCloseSearchKeyboard = React.useCallback(() => {
        setSearchKeyboardOpen(false);
    }, []);

    const handleSearchSet = React.useCallback(() => {
        const selectSignal = props.listToolbar?.paging?.selectSignal;
        if (selectSignal) {
            publishEvent('number', selectSignal, 0);
        }
    }, [props.listToolbar?.paging?.selectSignal]);

    React.useEffect(() => {
        if (!menuOpen) {
            setSearchKeyboardOpen(false);
        }
    }, [menuOpen]);

    const handleSelect = React.useCallback(
        (value: number) => {
            publishEvent('number', props.signal, value);
            props.onSelect?.(value);
            setMenuOpen(false);
        },
        [props.onSelect, props.signal],
    );

    const matchedOption = props.options.find((o) => o.value === currentValue);
    const activeSelection = matchedOption;
    const hasNoOptions = props.options.length === 0;
    const hasActiveSearch = Boolean(searchConfig && searchQuery.trim().length > 0);
    const selectDisabled = Boolean(props.disableSelect && !hasActiveSearch);

    let cardCaption: React.ReactNode;
    if (props.fixedCaption) {
        cardCaption = props.fixedCaption.secondary
            ? `${props.fixedCaption.label} · ${props.fixedCaption.secondary}`
            : props.fixedCaption.label;
    } else if (activeSelection) {
        cardCaption = props.renderSelectedCaption
            ? props.renderSelectedCaption(activeSelection)
            : activeSelection.label;
    } else if (hasNoOptions) {
        cardCaption = `No ${props.optionType ? props.optionType + 's' : 'options'} available`;
    } else {
        cardCaption = 'Tap to select';
    }

    const captionMarqueeSx = {
        lineHeight: 1.1,
        fontWeight: (activeSelection || props.fixedCaption) ? 600 : 400,
        fontStyle: (activeSelection || props.fixedCaption) ? 'normal' : 'italic',
        color: 'rgba(255,255,255,0.9)',
    } as const;

    return (
        <Box sx={{ width: '100%', position: 'relative' }}>

            <Card
                variant='outlined'
                sx={{
                    ...sxCardBase,
                    flexDirection: 'column',
                    ...(props.muted ? sxCardMuted : sxCardActive),
                    ...(props.meetingBorder && !props.muted
                        ? { borderStyle: 'dashed', borderColor: 'primary.light', borderWidth: 2 }
                        : {}),
                    '&:hover': {
                        boxShadow: props.muted ? shadowMutedHover : shadowActiveHover,
                    },
                }}
            >
                <CardActionArea
                    component="div"
                    onClick={selectDisabled ? undefined : handleCardClick}
                    sx={{
                        flex: 1,
                        display: 'flex',
                        flexDirection: 'row',
                        alignItems: 'center',
                        boxSizing: 'border-box',
                        minHeight: cardRowMinHeight,
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
                            '& .MuiSvgIcon-root': {
                                fontSize: cardIconSize,
                                color: '#fff',
                            },
                            display: 'flex',
                            alignItems: 'center',
                            alignSelf: 'center',
                            flexShrink: 0,
                            position: 'relative',
                        }}
                    >
                        {props.cardIcon}
                    </Box>
                    <Box
                        sx={{
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'center',
                            gap: '2px',
                            flex: 1,
                            minWidth: 0,
                            width: '100%',
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
                                {props.title}
                            </Typography>
                            {selectDisabled && !props.hideLockIcon && (
                                <LockIcon sx={{
                                    fontSize: 'clamp(10px, 1.38vw, 27px)',
                                    color: '#ffa726',
                                    flexShrink: 0,
                                }} />
                            )}
                        </Box>
                        {props.captionAccessory ? (
                            <Box
                                sx={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '4px',
                                    maxWidth: '100%',
                                    minWidth: 0,
                                }}
                            >
                                <OverflowMarqueeText
                                    variant='caption'
                                    component='span'
                                    sx={captionMarqueeSx}
                                >
                                    {cardCaption}
                                </OverflowMarqueeText>
                                {props.captionAccessory}
                            </Box>
                        ) : (
                            <OverflowMarqueeText
                                variant='caption'
                                sx={captionMarqueeSx}
                            >
                                {cardCaption}
                            </OverflowMarqueeText>
                        )}
                    </Box>
                    {props.additionalButtons && props.additionalButtons.length > 0 && (
                        <Box
                            onClick={(e) => e.stopPropagation()}
                            onPointerDown={(e) => e.stopPropagation()}
                            sx={sxCardBtnGroupSlot}
                        >
                            <CardButtonGroup>
                                {props.additionalButtons}
                            </CardButtonGroup>
                        </Box>
                    )}
                </CardActionArea>
                {(props.cardPreview ?? matchedOption?.preview) && (
                    <Box
                        onClick={selectDisabled ? undefined : handleCardClick}
                        sx={{
                            width: '100%',
                            px: cardPaddingH,
                            pb: cardPaddingV,
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            cursor: selectDisabled ? 'default' : 'pointer',
                        }}
                    >
                        {props.cardPreview ?? matchedOption?.preview}
                    </Box>
                )}
            </Card>

            <TouchPanelOverlay
                open={menuOpen}
                onClose={handleMenuClose}
                title={props.title}
                icon={props.cardIcon}
                disableEnforceFocus={searchKeyboardOpen}
                pointerEventsDisabled={searchKeyboardOpen}
                pinnedContent={
                    <SelectListToolbar
                        config={props.listToolbar}
                        onSearchKeyboardOpen={handleOpenSearchKeyboard}
                    />
                }
            >
                <Box sx={{ width: '100%' }}>
                    {
                        hasNoOptions && (
                            <MenuItem disableRipple sx={{ ...menuItemSx, ...emptyMenuItemSx }}>
                                <ListItemIcon sx={menuListItemIconSx}>
                                    {props.cardIcon}
                                </ListItemIcon>
                                <ListItemText primaryTypographyProps={{ noWrap: true, width: '100%', textAlign: 'left', paddingLeft: 'clamp(8px, 1.5vw, 16px)' }}>
                                    No {props.optionType ? props.optionType + 's' : 'options'} available
                                </ListItemText>
                            </MenuItem>)
                    }
                    {props.options.map((option) => {
                        const isSelected = currentValue === option.value;
                        return (
                            <MenuItem
                                key={option.value}
                                selected={isSelected}
                                onClick={() => handleSelect(option.value)}
                                sx={menuItemSx}
                            >
                                <ListItemIcon sx={menuListItemIconSx}>{option.icon}</ListItemIcon>
                                <ListItemText
                                    primary={option.label}
                                    secondary={option.secondary}
                                    primaryTypographyProps={{ noWrap: true, width: '100%', textAlign: 'left', paddingLeft: 'clamp(8px, 1.5vw, 16px)' }}
                                    secondaryTypographyProps={{ noWrap: true, width: '100%', textAlign: 'left', paddingLeft: 'clamp(8px, 1.5vw, 16px)' }}
                                />
                                <CheckIcon color='inherit' sx={{ fontSize: menuIconSize, ml: 1, flexShrink: 0, visibility: isSelected ? 'visible' : 'hidden' }} />
                            </MenuItem>
                        );
                    })}
                </Box>
            </TouchPanelOverlay>
            {searchConfig ? (
                <TextKeyboardPopover
                    open={searchKeyboardOpen}
                    onClose={handleCloseSearchKeyboard}
                    stringSignal={searchConfig.querySignal}
                    initialValue={searchQuery}
                    title={searchConfig.placeholder ?? 'Search'}
                    confirmLabel='Search'
                    onSet={handleSearchSet}
                    zIndex={NESTED_KEYBOARD_Z_INDEX}
                />
            ) : null}
        </Box>
    );
};

export default SelectCard;
