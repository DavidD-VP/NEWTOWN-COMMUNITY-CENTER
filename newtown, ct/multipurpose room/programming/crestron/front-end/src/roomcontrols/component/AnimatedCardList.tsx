import * as React from 'react';

import { Box, Collapse, Fade, useMediaQuery } from '@mui/material';

import RoomCard, { CardProps, getCardKey } from '../card/Card';
import { sortCards } from '../page/sortCards';

export const PAGE_CARD_EXIT_MS = 280;

const COLLAPSE_MS = 250;
const FADE_MS = 200;
const ENTER_STAGGER_MS = 30;

type CardEntry = {
	key: string;
	card: CardProps;
	visible: boolean;
};

function buildVisibleOrder(cards: CardProps[]): string[] {
	return sortCards(cards).map(getCardKey);
}

function orderEntries(entries: CardEntry[], visibleOrder: string[]): CardEntry[] {
	const orderIndex = new Map(visibleOrder.map((key, index) => [key, index]));
	return [...entries].sort((a, b) => {
		const aIndex = orderIndex.get(a.key);
		const bIndex = orderIndex.get(b.key);
		if (aIndex !== undefined && bIndex !== undefined) return aIndex - bIndex;
		if (aIndex !== undefined) return -1;
		if (bIndex !== undefined) return 1;
		return a.key.localeCompare(b.key);
	});
}

function cardsToVisibleEntries(cards: CardProps[]): CardEntry[] {
	return sortCards(cards).map((card) => ({
		key: getCardKey(card),
		card,
		visible: true,
	}));
}

function useAnimatedCardEntries(cards: CardProps[], enabled: boolean): CardEntry[] {
	const [entries, setEntries] = React.useState<CardEntry[]>(() =>
		enabled ? cardsToVisibleEntries(cards) : [],
	);

	const sortedCards = React.useMemo(() => sortCards(cards), [cards]);
	const visibleOrder = React.useMemo(() => buildVisibleOrder(cards), [cards]);
	const visibleKeySet = React.useMemo(
		() => new Set(sortedCards.map(getCardKey)),
		[sortedCards],
	);

	React.useEffect(() => {
		if (!enabled) {
			setEntries([]);
			return;
		}

		setEntries((prev) => {
			const prevByKey = new Map(prev.map((entry) => [entry.key, entry]));
			const nextEntries: CardEntry[] = [];

			for (const card of sortedCards) {
				const key = getCardKey(card);
				nextEntries.push({
					key,
					card,
					visible: true,
				});
			}

			for (const entry of prev) {
				if (visibleKeySet.has(entry.key)) continue;
				nextEntries.push({
					key: entry.key,
					card: prevByKey.get(entry.key)?.card ?? entry.card,
					visible: false,
				});
			}

			return orderEntries(nextEntries, visibleOrder);
		});
	}, [enabled, sortedCards, visibleKeySet, visibleOrder]);

	return entries;
}

type AnimatedCardShellProps = {
	entry: CardEntry;
	collapseIn: boolean;
	enterIndex: number;
	animate: boolean;
};

const AnimatedCardShell: React.FC<AnimatedCardShellProps> = ({
	entry,
	collapseIn,
	enterIndex,
	animate,
}) => {
	const useAppearRef = React.useRef(collapseIn);
	const collapseTimeout = animate
		? { enter: COLLAPSE_MS + enterIndex * ENTER_STAGGER_MS, exit: COLLAPSE_MS }
		: 0;
	const fadeTimeout = animate
		? { enter: FADE_MS + enterIndex * ENTER_STAGGER_MS, exit: FADE_MS }
		: 0;

	return (
		<Collapse
			in={collapseIn}
			appear={animate && useAppearRef.current}
			timeout={collapseTimeout}
			sx={animate ? undefined : { transition: 'none' }}
		>
			<Fade
				in={collapseIn}
				appear={animate && useAppearRef.current}
				timeout={fadeTimeout}
				sx={animate ? undefined : { transition: 'none' }}
			>
				<Box sx={{ width: '100%' }}>
					<RoomCard {...entry.card} momentaryReleaseActive={collapseIn} />
				</Box>
			</Fade>
		</Collapse>
	);
};

export type AnimatedCardListProps = {
	cards: CardProps[];
	pageActive?: boolean;
	enabled?: boolean;
};

const AnimatedCardList: React.FC<AnimatedCardListProps> = ({
	cards,
	pageActive = true,
	enabled = true,
}) => {
	const prefersReducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)');
	const animate = enabled && !prefersReducedMotion;
	const entries = useAnimatedCardEntries(cards, enabled);

	const visibleEnterIndex = React.useMemo(() => {
		const indexByKey = new Map<string, number>();
		sortCards(cards).forEach((card, index) => {
			indexByKey.set(getCardKey(card), index);
		});
		return indexByKey;
	}, [cards]);

	if (!enabled) {
		return (
			<>
				{sortCards(cards).map((card) => (
					<RoomCard key={getCardKey(card)} {...card} />
				))}
			</>
		);
	}

	return (
		<>
			{entries.map((entry) => {
				const collapseIn = pageActive && entry.visible;
				return (
					<AnimatedCardShell
						key={entry.key}
						entry={entry}
						collapseIn={collapseIn}
						enterIndex={collapseIn ? (visibleEnterIndex.get(entry.key) ?? 0) : 0}
						animate={animate}
					/>
				);
			})}
		</>
	);
};

export default AnimatedCardList;
