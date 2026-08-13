import * as React from 'react';
import LiveTvIcon from '@mui/icons-material/LiveTv';

import Page, { PageHandle } from '../Page';
import { CardProps } from '../../card/Card';
import CableTvChannelCard from '../../card/cabletuner/CableTvChannelCard';
import CableTvCursorCard from '../../card/cabletuner/CableTvCursorCard';
import CableTvFunctionsCard from '../../card/cabletuner/CableTvFunctionsCard';
import CableTvInfoCard from '../../card/cabletuner/CableTvInfoCard';
import CableTvKeypadCard from '../../card/cabletuner/CableTvKeypadCard';
import CableTvMenusCard from '../../card/cabletuner/CableTvMenusCard';
import CableTvPageCard from '../../card/cabletuner/CableTvPageCard';
import CableTvPIPCard from '../../card/cabletuner/CableTvPIPCard';
import CableTvPlaybackCard from '../../card/cabletuner/CableTvPlaybackCard';
import CableTvPowerCard from '../../card/cabletuner/CableTvPowerCard';
import CableTvSelectCard, { CableTvSelectCardProps } from '../../card/cabletuner/CableTvSelectCard';
import CableTvPresetCard from '../../card/cabletuner/PresetCard';
import type { CableTvRemoteProps } from '../../card/cabletuner/cableTvRemoteProps';
import CableTvVolumeCard from '../../card/cabletuner/CableTvVolumeCard';

import {
	useScopedSignalSubscription,
	useSignalBooleans,
	useSignalStrings,
} from '../../../crestron/CrComLib';

import { signalConfig, pageSignals, isVisible } from '../../../config/signals';

export const cableTunerPageSignals = pageSignals.cabletuner;
const ct = signalConfig.cabletuner;

function presetOptions(
	items: readonly { label: string }[],
	strings: Record<string, string>,
) {
	return items.map((item, i) => ({
		Label: strings[item.label] ?? '',
		Value: i + 1,
	}));
}

function featureSignal(
	feature: { visible: string; interaction: string },
	booleans: Record<string, boolean>,
): string | undefined {
	return booleans[feature.visible] ? feature.interaction : undefined;
}

export function buildCableTunerPageCards(
	booleans: Record<string, boolean>,
	strings: Record<string, string>,
): CardProps[] {
	const props: Omit<CableTvRemoteProps, 'Select'> = {};
	for (const btn of ct.buttons) {
		const key = btn.label as keyof Omit<CableTvRemoteProps, 'Select'>;
		props[key] = booleans[btn.visible] ? btn.interaction : undefined;
	}

	const select: CableTvSelectCardProps | undefined = isVisible(booleans, ct.select)
		? {
			Select: ct.select.interaction,
			Devices: ct.select.devices.map((d) => strings[d.label] ?? ''),
		}
		: undefined;

	const pageProps: CableTvRemoteProps = { ...props, Select: select };

	const list: (CardProps | null)[] = [
		select ? CableTvSelectCard(select) : null,
	];

	if (isVisible(booleans, ct.preset)) {
		const pre = ct.preset;
		list.push(
			CableTvPresetCard({
				select: {
					signal: pre.select.interaction,
					options: presetOptions(pre.select.presets, strings),
					presetNameSignals: pre.select.presets.map((p) => p.label),
					presetNumberSignals: pre.select.presets.map((p) => p.number),
				},
				activate: featureSignal(pre.activate, booleans),
				create: featureSignal(pre.create, booleans),
				update: featureSignal(pre.update, booleans),
				delete: featureSignal(pre.delete, booleans),
			}),
		);
	}

	return [
		...list,
		CableTvChannelCard(pageProps),
		CableTvCursorCard(pageProps),
		CableTvFunctionsCard(pageProps),
		CableTvInfoCard(pageProps),
		CableTvKeypadCard(pageProps),
		CableTvMenusCard(pageProps),
		CableTvPageCard(pageProps),
		CableTvPIPCard(pageProps),
		CableTvPlaybackCard(pageProps),
		CableTvPowerCard(pageProps),
		CableTvVolumeCard(pageProps),
	].filter((c): c is CardProps => c !== null);
}

// ── Component ────────────────────────────────────────────────────────────────

const CableTunerPage = React.forwardRef<PageHandle, {}>((_props, ref) => {
	useScopedSignalSubscription(cableTunerPageSignals);
	const booleans = useSignalBooleans(cableTunerPageSignals.booleans);
	const strings = useSignalStrings(cableTunerPageSignals.strings);

	const cards = React.useMemo(
		() => buildCableTunerPageCards(booleans, strings),
		[booleans, strings],
	);

	return (
		<Page ref={ref} id='page-cabletuner' label='Cable TV' icon={<LiveTvIcon />} cards={cards} />
	);
});
CableTunerPage.displayName = 'CableTunerPage';

export default CableTunerPage;
