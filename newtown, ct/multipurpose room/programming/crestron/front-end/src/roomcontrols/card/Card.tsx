import * as React from 'react';
import { Card as MuiCard, CardProps as MuiCardProps } from '@mui/material';
import {
	sxCardActive,
	sxCardMuted,
	sxCardDisconnected,
	sxCardDefault,
	sxCardBase,
} from '../theme/tokens';
import { useSignalStore } from '../../crestron/CrComLib';
import { MomentaryPressProvider } from '../component/MomentaryPressContext';

export type CardVariant = 'active' | 'muted' | 'disconnected' | 'default';

export type CardProps = {
	/** Stable key for list reconciliation and enter/exit animations. */
	id?: string;
	label: string;
	children?: React.ReactNode;
	variant?: CardVariant;
	MuiCardProps?: Omit<MuiCardProps, 'children'>;
	pin?: number;
	/**
	 * @deprecated Prefer page-level `visible` gates in `signals.ts` + `isVisible`.
	 * When defined, hides the card (display:none) unless the boolean signal matches activeWhen.
	 */
	visibilitySignal?: { signal: string; activeWhen: boolean };
	/** When false, releases held momentary presses (e.g. card collapsed off-page). */
	momentaryReleaseActive?: boolean;
};

export function getCardKey(card: CardProps): string {
	return card.id ?? card.label;
}

const cardStyles: Record<CardVariant, object> = {
	active: sxCardActive,
	muted: sxCardMuted,
	disconnected: sxCardDisconnected,
	default: sxCardDefault,
};

const Card = ({
	variant = 'default',
	children,
	MuiCardProps: cardProps,
	visibilitySignal,
	momentaryReleaseActive = true,
}: CardProps) => {
	const signalIsActive = useSignalStore((s) =>
		visibilitySignal ? (s.booleans[visibilitySignal.signal] ?? false) : true,
	);
	const isVisible = visibilitySignal ? signalIsActive === visibilitySignal.activeWhen : true;
	const releaseActive = isVisible && momentaryReleaseActive;

	return (
		<MuiCard
			variant='outlined'
			{...cardProps}
			sx={{
				...sxCardBase,
				...cardStyles[variant],
				...cardProps?.sx,
				...(isVisible ? {} : { display: 'none' }),
			}}
		>
			<MomentaryPressProvider releaseActive={releaseActive}>
				{children}
			</MomentaryPressProvider>
		</MuiCard>
	);
};

export default Card;
