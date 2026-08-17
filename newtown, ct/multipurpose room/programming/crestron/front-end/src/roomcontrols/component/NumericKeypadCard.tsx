import React from 'react';

import {
    useSignalStore,
    publishEvent,
} from '../../crestron/CrComLib';

import {
    Box,
    Card,
    CardActionArea,
    Typography,
} from '@mui/material';

import PinIcon from '@mui/icons-material/Pin';
import LockIcon from '@mui/icons-material/Lock';

import {
    sxCardBase,
    sxCardActive,
    cardPaddingV,
    cardPaddingH,
    cardInnerGap,
    cardIconSize,
    shadowActiveHover,
} from '../theme/tokens';

import NumericKeypadPopover from './NumericKeypadPopover';
import { useCloseOverlayWhenLocked } from '../hooks/useCloseOverlayWhenLocked';
import CardPressHint from './CardPressHint';

// ── Types ─────────────────────────────────────────────────────────────────────

export type NumericKeypadCardProps = {
    /** Crestron serial signal — read for current value display, published on confirm. */
    signal: string;
    /** Card header text. */
    title: string;
    /** Icon shown on the left of the card row. Defaults to a pin/keypad icon. */
    cardIcon?: React.ReactNode;
    /** When true, tapping the card does not open the keypad. */
    disableSelect?: boolean;
    /** Optional element rendered as a button on the right of the card. */
    additionalButton?: React.ReactNode;
};

// ── Component ─────────────────────────────────────────────────────────────────

const NumericKeypadCard: React.FC<NumericKeypadCardProps> = (props) => {
    const currentValue = useSignalStore((s) => s.strings[props.signal] ?? '');

    const [open, setOpen] = React.useState(false);

    const [draft, setDraft] = React.useState('');

    const handleOpen = React.useCallback(() => {
        setDraft(useSignalStore.getState().strings[props.signal] ?? '');
        setOpen(true);
    }, [props.signal]);

    const handleClose = React.useCallback(() => {
        setOpen(false);
    }, []);

    useCloseOverlayWhenLocked(Boolean(props.disableSelect), handleClose);

    const handleConfirm = React.useCallback(() => {
        publishEvent('string', props.signal, draft);
        setOpen(false);
    }, [props.signal, draft]);

    const handleKey = React.useCallback((key: string) => {
        if (key === 'back') {
            setDraft((prev) => prev.slice(0, -1));
        } else {
            setDraft((prev) => (prev.length < 20 ? prev + key : prev));
        }
    }, []);

    const cardCaption = currentValue.trim().length > 0 ? currentValue : 'Tap to enter';
    const hasValue = currentValue.trim().length > 0;
    const showPressHint = hasValue && !props.disableSelect;

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
                            alignSelf: 'center',
                            flexShrink: 0,
                        }}
                    >
                        {props.cardIcon ?? <PinIcon />}
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
                                fontWeight: currentValue.trim().length > 0 ? 600 : 400,
                                fontStyle: currentValue.trim().length > 0 ? 'normal' : 'italic',
                                color: 'rgba(255,255,255,0.9)',
                            }}
                            noWrap
                        >
                            {cardCaption}
                        </Typography>
                        {showPressHint ? (
                            <CardPressHint>Tap to set</CardPressHint>
                        ) : null}
                    </Box>
                    {props.additionalButton}
                </CardActionArea>
            </Card>

            <NumericKeypadPopover
                open={open}
                onClose={handleClose}
                draft={draft}
                onKey={handleKey}
                onConfirm={handleConfirm}
            />
        </Box>
    );
};

export default NumericKeypadCard;
