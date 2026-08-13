import React from 'react';

import SliderCard from './SliderCard';
import { CardProps } from '../card/Card';
import { gradientMuted, shadowMuted } from '../theme/tokens';

export const recordActiveFlashSx = {
	background: gradientMuted,
	borderColor: 'error.main',
	borderWidth: 2,
	boxShadow: shadowMuted,
	color: '#fff',
} as const;

export function buildToggleControlCard(
	label: string,
	icon: React.ReactNode,
	signal: string,
	options?: {
		activeFlashSx?: Record<string, unknown>;
		keepCardActiveWhenMuted?: boolean;
		mutedIcon?: React.ReactNode;
		unmutedIcon?: React.ReactNode;
		mutedLabel?: string;
		unmutedLabel?: string;
		activeCardLabel?: string;
	},
): CardProps {
	return {
		...SliderCard({
			label,
			cardIcon: icon,
			mutedIcon: options?.mutedIcon ?? icon,
			unmutedIcon: options?.unmutedIcon ?? icon,
			mutedLabel: options?.mutedLabel ?? label,
			unmutedLabel: options?.unmutedLabel ?? label,
			muteButtonProps: { signal },
			activeFlashSx: options?.activeFlashSx,
			keepCardActiveWhenMuted: options?.keepCardActiveWhenMuted,
			activeCardLabel: options?.activeCardLabel,
		}),
	};
}
