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
    IconButton,
} from '@mui/material';

import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import LockIcon from '@mui/icons-material/Lock';
import AccessTimeIcon from '@mui/icons-material/AccessTime';

import {
    sxCardActive,
    sxCardBase,
    cardPaddingV,
    cardPaddingH,
    cardInnerGap,
    cardIconSize,
    shadowActiveHover,
} from '../theme/tokens';
import {
    popoverControlSize,
    popoverDigitFont,
    popoverFont,
    popoverGap,
} from './selectionPopoverStyles';
import {
    overlayConfirmButtonSx,
    overlayKeyButtonSx,
} from './touchPanelOverlayStyles';
import {
    formatCrestronTime,
    formatHhmmDisplay,
    parseCrestronTime,
} from '../utils/timeCompare';
import { useCloseOverlayWhenLocked } from '../hooks/useCloseOverlayWhenLocked';

// ── Types ────────────────────────────────────────────────────────────

export type TimeCardProps = {
    /** Crestron serial signal — read/write HHMMSS (legacy HHMM accepted on read). */
    signal: string;
    /** Card header text. */
    title: string;
    /** Icon shown on the left of the card row. Defaults to a clock icon. */
    cardIcon?: React.ReactNode;
    /** When true, tapping the card does not open the time picker. */
    disableSelect?: boolean;
    /** Optional element rendered as a button on the right of the card. */
    additionalButton?: React.ReactNode;
};

// ── Helpers ──────────────────────────────────────────────────────────

function parseTimeOrZero(raw: string): { hours: number; minutes: number } {
    const parsed = parseCrestronTime(raw);
    if (!parsed) return { hours: 0, minutes: 0 };
    return { hours: parsed.hours, minutes: parsed.minutes };
}

// ── Stepper button ───────────────────────────────────────────────────

const stepperBtnSx = {
    width: popoverControlSize,
    height: popoverControlSize,
    borderRadius: '8px',
    flexShrink: 0,
    ...overlayKeyButtonSx,
    '& .MuiSvgIcon-root': { fontSize: popoverFont, color: '#fff' },
} as const;

const digitSx = {
    fontSize: popoverDigitFont,
    fontWeight: 700,
    lineHeight: 1,
    color: '#fff',
    minWidth: popoverControlSize,
    textAlign: 'center',
    userSelect: 'none',
} as const;

const colonSx = {
    fontSize: popoverDigitFont,
    fontWeight: 700,
    lineHeight: 1,
    color: 'rgba(255,255,255,0.85)',
    userSelect: 'none',
    mx: popoverGap,
} as const;

// ── Component ────────────────────────────────────────────────────────

const TimeCard: React.FC<TimeCardProps> = (props) => {
    const rawValue = useSignalStore((s) => s.strings[props.signal] ?? '');

    const { hours: signalHours, minutes: signalMinutes } = parseTimeOrZero(rawValue);

    const [open, setOpen] = React.useState(false);

    // Local draft state while the picker is open
    const [draftHours, setDraftHours] = React.useState(0);
    const [draftMinutes, setDraftMinutes] = React.useState(0);

    const handleOpen = React.useCallback(() => {
        const raw = useSignalStore.getState().strings[props.signal] ?? '';
        const { hours, minutes } = parseTimeOrZero(raw);
        setDraftHours(hours);
        setDraftMinutes(minutes);
        setOpen(true);
    }, [props.signal]);

    const handleClose = React.useCallback(() => {
        setOpen(false);
    }, []);

    useCloseOverlayWhenLocked(Boolean(props.disableSelect), handleClose);

    const handleConfirm = React.useCallback(() => {
        publishEvent('string', props.signal, formatCrestronTime(draftHours, draftMinutes, 0));
        setOpen(false);
    }, [props.signal, draftHours, draftMinutes]);

    const stepHours = React.useCallback((delta: number) => {
        setDraftHours((h) => (h + delta + 24) % 24);
    }, []);

    const togglePeriod = React.useCallback(() => {
        setDraftHours((h) => (h + 12) % 24);
    }, []);

    const draftH12 = draftHours % 12 === 0 ? 12 : draftHours % 12;
    const draftPeriod = draftHours < 12 ? 'AM' : 'PM';

    const stepMinutes = React.useCallback((delta: number) => {
        setDraftMinutes((m) => (m + delta + 60) % 60);
    }, []);

    const cardCaption = rawValue.trim().length > 0
        ? formatHhmmDisplay(signalHours, signalMinutes)
        : 'Tap to set';

    return (
        <Box sx={{ width: '100%', position: 'relative' }}>
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
                    onClick={props.disableSelect ? undefined : handleOpen}
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
                        {props.cardIcon ?? <AccessTimeIcon />}
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
                                {props.title}
                            </Typography>
                            {props.disableSelect && (
                                <LockIcon sx={{ fontSize: 'clamp(10px, 1.38vw, 27px)', color: '#ffa726', flexShrink: 0 }} />
                            )}
                        </Box>
                        <Typography
                            variant='caption'
                            sx={{
                                lineHeight: 1.1,
                                fontWeight: rawValue.trim().length > 0 ? 600 : 400,
                                fontStyle: rawValue.trim().length > 0 ? 'normal' : 'italic',
                                color: 'rgba(255,255,255,0.9)',
                            }}
                            noWrap
                        >
                            {cardCaption}
                        </Typography>
                    </Box>
                    {props.additionalButton}
                </CardActionArea>
            </Card>

            <TouchPanelOverlay
                open={open}
                onClose={handleClose}
                title={props.title ?? 'Set Time'}
                icon={props.cardIcon ?? <AccessTimeIcon />}
                footer={
                    <Box
                        component='button'
                        onClick={handleConfirm}
                        sx={{
                            ...overlayConfirmButtonSx,
                            width: '100%',
                            height: popoverControlSize,
                            borderRadius: '8px',
                            fontSize: popoverFont,
                        }}
                    >
                        Set
                    </Box>
                }
            >
                <Box
                    sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flex: 1,
                        minHeight: '100%',
                        gap: popoverGap,
                        py: 'clamp(24px, 4vh, 64px)',
                    }}
                >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: popoverGap }}>
                        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: popoverGap }}>
                            <IconButton onClick={() => stepHours(1)} sx={stepperBtnSx} aria-label='Increase hours'>
                                <KeyboardArrowUpIcon />
                            </IconButton>
                            <Typography sx={digitSx}>{String(draftH12).padStart(2, '0')}</Typography>
                            <IconButton onClick={() => stepHours(-1)} sx={stepperBtnSx} aria-label='Decrease hours'>
                                <KeyboardArrowDownIcon />
                            </IconButton>
                        </Box>

                        <Typography sx={colonSx}>:</Typography>

                        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: popoverGap }}>
                            <IconButton onClick={() => stepMinutes(1)} sx={stepperBtnSx} aria-label='Increase minutes'>
                                <KeyboardArrowUpIcon />
                            </IconButton>
                            <Typography sx={digitSx}>{String(draftMinutes).padStart(2, '0')}</Typography>
                            <IconButton onClick={() => stepMinutes(-1)} sx={stepperBtnSx} aria-label='Decrease minutes'>
                                <KeyboardArrowDownIcon />
                            </IconButton>
                        </Box>

                        <Box
                            component='button'
                            onClick={togglePeriod}
                            sx={{
                                alignSelf: 'center',
                                height: popoverControlSize,
                                px: popoverGap,
                                borderRadius: '8px',
                                fontWeight: 700,
                                fontSize: popoverFont,
                                flexShrink: 0,
                                ...overlayKeyButtonSx,
                            }}
                            aria-label='Toggle AM/PM'
                        >
                            {draftPeriod}
                        </Box>
                    </Box>
                </Box>
            </TouchPanelOverlay>
        </Box>
    );
};

export default TimeCard;
