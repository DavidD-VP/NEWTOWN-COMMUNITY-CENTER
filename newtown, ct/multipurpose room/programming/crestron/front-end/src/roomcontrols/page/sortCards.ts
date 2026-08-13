import type { CardProps } from '../card/Card';

export function sortCards(cards: CardProps[]): CardProps[] {
	return [...cards].sort((a, b) => {
		const aPinned = a.pin !== undefined;
		const bPinned = b.pin !== undefined;
		if (aPinned !== bPinned) return aPinned ? -1 : 1;
		if (aPinned && bPinned) {
			const pinDiff = (a.pin as number) - (b.pin as number);
			if (pinDiff !== 0) return pinDiff;
		}
		return a.label.localeCompare(b.label);
	});
}
