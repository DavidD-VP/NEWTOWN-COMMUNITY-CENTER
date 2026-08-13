import * as React from 'react';
import { Box, Card, Typography } from '@mui/material';
import CrestronSlider, { CrestronSliderProps } from './CrestronSlider';
import CrestronButton, { CrestronButtonProps } from './CrestronButton';
import CrestronBatteryIcon, { CrestronBatteryIconProps } from './BatteryIcon';
import { useSignalStore } from '../../crestron/CrComLib';
import { CardProps } from '../card/Card';
import {
    sxCardActive,
    sxCardMuted,
    sxCardBase,
    sxCardInner,
    sxCardIcon,
    sxCardLabel,
    sxCtrlBtn,
    ctrlBtnIconSize,
    overlayButtonContainedColor,
    sliderRail,
    sliderTrack,
    sliderThumb,
    sliderThumbFocus,
    sliderThumbSize,
    cardSliderGap,
    cardSliderPaddingX,
} from '../theme/tokens';
import { ctBtn } from '../card/ctCardStyles';

export type SliderCardProps = {
    label: string;
    cardIcon: React.ReactNode;
    /** Icon to show when the mute button is active (pressed). */
    mutedIcon?: React.ReactNode;
    unmutedIcon?: React.ReactNode;
    mutedLabel?: string;
    unmutedLabel?: string;
    sliderProps?: CrestronSliderProps;
    muteButtonProps?: CrestronButtonProps;
    batteryIconProps?: CrestronBatteryIconProps;
    /** Static card styling applied while the toggle is active. */
    activeCardSx?: Record<string, unknown>;
    /** When set, the card background flashes while the toggle is active. */
    activeFlashSx?: Record<string, unknown>;
    /** When set, replaces `label` in the card header while the toggle is active. */
    activeCardLabel?: string;
    /** When true, the card stays on the active (blue) style even when toggled on. */
    keepCardActiveWhenMuted?: boolean;
};

const cardActiveFlashKeyframes = {
    '@keyframes sliderCardActiveFlash': {
        '0%, 100%': { opacity: 1 },
        '50%': { opacity: 0.55 },
    },
} as const;

// ── Inner component (owns all hooks) ────────────────────────────────

const SliderCardInner: React.FC<SliderCardProps> = (props) => {
    const isMuted = useSignalStore((s) => s.booleans[props.muteButtonProps?.signal ?? ''] ?? false);
    const useActiveFlash = Boolean(props.activeFlashSx && isMuted);
    const flashSx = props.activeFlashSx;
    const activeCardSx = props.activeCardSx;
    const cardSx = useActiveFlash && flashSx
        ? {
            ...sxCardBase,
            ...cardActiveFlashKeyframes,
            position: 'relative',
            overflow: 'hidden',
            background: 'transparent',
            borderColor: flashSx.borderColor as string,
            borderWidth: flashSx.borderWidth as number,
            boxShadow: flashSx.boxShadow as string,
            color: '#fff',
            '&::before': {
                content: '""',
                position: 'absolute',
                inset: 0,
                background: flashSx.background as string,
                animation: 'sliderCardActiveFlash 1.2s ease-in-out infinite',
                zIndex: 0,
            },
            '& > *': {
                position: 'relative',
                zIndex: 1,
            },
        }
        : isMuted && activeCardSx
            ? {
                ...sxCardBase,
                ...activeCardSx,
            }
            : {
                ...sxCardBase,
                ...(isMuted && !props.keepCardActiveWhenMuted ? sxCardMuted : sxCardActive),
            };

    return (
        <Box sx={{ width: '100%', position: 'relative' }}>
            <Card
                variant='outlined'
                sx={cardSx}
            >
                <Box sx={sxCardInner}>
                    {/* Icon */}
                    <Box sx={sxCardIcon}>
                        {props.cardIcon}
                    </Box>

                    {/* Label + slider */}
                    <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: cardSliderGap, flex: 1, minWidth: 0, width: '100%' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: '4px', minWidth: 0 }}>
                            <Typography
                                variant='body2'
                                sx={{ ...sxCardLabel }}
                                noWrap
                            >
                                {isMuted && props.activeCardLabel ? props.activeCardLabel : props.label}
                            </Typography>
                            {props.batteryIconProps && (
                                <Box sx={{ lineHeight: 0, flexShrink: 0, '& .MuiSvgIcon-root': { color: '#fff' } }}>
                                    <CrestronBatteryIcon {...props.batteryIconProps} />
                                </Box>
                            )}
                        </Box>
                        {props.sliderProps && (
                            <Box sx={{ px: cardSliderPaddingX }}>
                                <CrestronSlider
                                    {...props.sliderProps}
                                    SliderProps={{
                                        ...props.sliderProps.SliderProps,
                                        sx: {
                                            height: sliderThumbSize,
                                            p: 0,
                                            px: `calc(${sliderThumbSize} / 2)`,
                                            boxSizing: 'border-box',
                                            '& .MuiSlider-rail': { backgroundColor: sliderRail, opacity: 1 },
                                            '& .MuiSlider-track': { backgroundColor: sliderTrack, borderColor: sliderTrack },
                                            '& .MuiSlider-thumb': {
                                                width: sliderThumbSize,
                                                height: sliderThumbSize,
                                                backgroundColor: sliderThumb,
                                                '&:hover, &.Mui-focusVisible': { boxShadow: sliderThumbFocus },
                                            },
                                            ...props.sliderProps.SliderProps?.sx,
                                        },
                                    }}
                                />
                            </Box>
                        )}
                    </Box>

                    {/* Mute button overlay */}
                    {props.muteButtonProps && (
                        <CrestronButton
                            signal={props.muteButtonProps.signal}
                            alwaysOutlined={props.muteButtonProps.alwaysOutlined}
                            ButtonProps={{
                                ...props.muteButtonProps.ButtonProps,
                                children: isMuted
                                    ? ctBtn(props.mutedIcon ?? props.cardIcon, props.mutedLabel ?? '')
                                    : ctBtn(props.unmutedIcon ?? props.cardIcon, props.unmutedLabel ?? ''),
                                sx: props.muteButtonProps.alwaysOutlined
                                    ? {
                                        ...sxCtrlBtn,
                                        '&.MuiButton-outlined': {
                                            ...sxCtrlBtn['&.MuiButton-outlined'],
                                            '& .MuiSvgIcon-root': { fontSize: ctrlBtnIconSize, color: '#fff' },
                                        },
                                        ...props.muteButtonProps.ButtonProps?.sx,
                                    }
                                    : {
                                        ...sxCtrlBtn,
                                        '&.MuiButton-outlined': {
                                            ...sxCtrlBtn['&.MuiButton-outlined'],
                                            '& .MuiSvgIcon-root': { fontSize: ctrlBtnIconSize, color: '#fff' },
                                        },
                                        '&.MuiButton-contained': {
                                            ...sxCtrlBtn['&.MuiButton-contained'],
                                            '& .MuiSvgIcon-root': { fontSize: ctrlBtnIconSize, color: overlayButtonContainedColor },
                                        },
                                        ...props.muteButtonProps.ButtonProps?.sx,
                                    },
                            }}
                        />
                    )}
                </Box>
            </Card>
        </Box>
    );
};

// ── Public API ───────────────────────────────────────────────────────

const SliderCard = (props: SliderCardProps): CardProps => ({
    label: props.label,
    children: <SliderCardInner {...props} />,
});

export default SliderCard;
