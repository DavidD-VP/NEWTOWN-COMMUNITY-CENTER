import { GetSourceType } from '../../card/share/typeHelpers';
import type { SourceProps } from '../../card/share/DestinationCard';
import { signalConfig } from '../../../config/signals';

type GlobalSource = (typeof signalConfig.share.sources)[number];
type SelectSourceGate = { visible: string };
type InCallShareSourceSlot = { type: string; label: string; preview: string };

/** Build SelectCard options from global sources gated by per-select visibility feedback. */
export function buildGatedSources(
	sources: readonly GlobalSource[],
	selectSources: readonly SelectSourceGate[],
	numbers: Record<string, number>,
	strings: Record<string, string>,
	booleans: Record<string, boolean>,
): SourceProps[] {
	const list: SourceProps[] = [];
	sources.forEach((src, i) => {
		const gate = selectSources[i];
		if (!gate || !(booleans[gate.visible] ?? false)) return;
		list.push({
			Type: GetSourceType(numbers[src.type]),
			Label: strings[src.label] ?? '',
			Value: i + 1,
			PreviewPath: strings[src.preview]?.trim() ?? '',
		});
	});
	return list;
}

/** Build in-call share source options from per-slot type, label, and preview (empty label = hidden). */
export function buildInCallShareSources(
	slots: readonly InCallShareSourceSlot[],
	numbers: Record<string, number>,
	strings: Record<string, string>,
): SourceProps[] {
	const list: SourceProps[] = [];
	slots.forEach((slot, i) => {
		const labelText = (strings[slot.label] ?? '').trim();
		if (!labelText) return;
		list.push({
			Type: GetSourceType(numbers[slot.type]),
			Label: labelText,
			Value: i + 1,
			PreviewPath: strings[slot.preview]?.trim() ?? '',
		});
	});
	return list;
}
