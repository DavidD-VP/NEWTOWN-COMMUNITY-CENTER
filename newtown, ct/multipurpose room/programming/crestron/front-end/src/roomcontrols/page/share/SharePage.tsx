import * as React from 'react';
import ShareIcon from '@mui/icons-material/Share';

import Page, { PageHandle } from '../Page';
import { CardProps } from '../../card/Card';
import { DestinationCard, DestinationCardProps } from '../../card/share/DestinationCard';
import VideoWallCard, { VideoWallCardProps } from '../../card/share/VideoWallCard';
import { GetDestinationType } from '../../card/share/typeHelpers';
import { buildGatedSources } from './shareSourceHelpers';

import {
	useScopedSignalSubscription,
	useSignalBooleans,
	useSignalNumbers,
	useSignalStrings,
} from '../../../crestron/CrComLib';

import { signalConfig, pageSignals, isVisible } from '../../../config/signals';

export const sharePageSignals = pageSignals.share;

type SharedDestinationCfg = (typeof signalConfig.share.destinations)[number];
type VideoWallCfg          = typeof signalConfig.share.videoWall;
type VideoWallDestCfg      = VideoWallCfg['destinations'][number];

const globalSources = signalConfig.share.sources;

// ── Card config builders ─────────────────────────────────────────────────────

function buildDestination(
	d: SharedDestinationCfg,
	booleans: Record<string, boolean>,
	numbers: Record<string, number>,
	strings: Record<string, string>,
): DestinationCardProps {
	return {
		Type: GetDestinationType(numbers[d.type]),
		Label: strings[d.label] ?? '',
		Select: d.select.interaction,
		DisableSelectSignal: d.select.disable.interaction,
		DisableSelectVisibleSignal: d.select.disable.visible,
		PowerEnableSignal: d.power.visible,
		PowerStateSignal: d.power.interaction,
		NoSourceSignal: d.select.noSource.visible,
		Sources: buildGatedSources(globalSources, d.select.sources, numbers, strings, booleans),
	};
}

function buildVideoWall(
	vw: VideoWallCfg,
	booleans: Record<string, boolean>,
	numbers: Record<string, number>,
	strings: Record<string, string>,
): VideoWallCardProps {
	const wallSources = buildGatedSources(
		globalSources,
		vw.select.sources,
		numbers,
		strings,
		booleans,
	);

	return {
		Label: strings[vw.label] ?? '',
		RowsSignal: vw.layout.rows,
		ColumnsSignal: vw.layout.columns,
		LayoutSelect: vw.layout.interaction,
		LayoutVisibleSignal: vw.layout.visible,
		DisableSelectSignal: vw.select.disable.interaction,
		DisableSelectVisibleSignal: vw.select.disable.visible,
		NoSourceSignal: vw.select.noSource.visible,
		PowerEnableSignal: vw.power.visible,
		PowerStateSignal: vw.power.interaction,
		Layouts: vw.layout.layouts
			.map((l, i) => ({
				Label: strings[l.label] ?? '',
				Value: i + 1,
			}))
			.filter((l) => l.Label.length > 0),
		Sources: wallSources,
		Destinations: vw.destinations.map((d) => buildVideoWallDestination(d, wallSources, strings)),
	};
}

function buildVideoWallDestination(
	d: VideoWallDestCfg,
	wallSources: VideoWallCardProps['Sources'],
	strings: Record<string, string>,
): VideoWallCardProps['Destinations'][number] {
	return {
		Label: strings[d.label] ?? '',
		Select: d.select.interaction,
		DisableSelectSignal: d.select.disable.interaction,
		RowSignal: d.row,
		ColumnSignal: d.column,
		HeightSignal: d.height,
		WidthSignal: d.width,
		Sources: wallSources,
	};
}

export function buildSharePageCards(
	booleans: Record<string, boolean>,
	numbers: Record<string, number>,
	strings: Record<string, string>,
): CardProps[] {
	const list: CardProps[] = [];

	for (const d of signalConfig.share.destinations) {
		if (!isVisible(booleans, d)) continue;
		list.push(DestinationCard(buildDestination(d, booleans, numbers, strings)));
	}

	const vw = signalConfig.share.videoWall;
	if (isVisible(booleans, vw)) {
		list.push(VideoWallCard(buildVideoWall(vw, booleans, numbers, strings)));
	}

	return list;
}

// ── Component ────────────────────────────────────────────────────────────────

const SharePage = React.forwardRef<PageHandle, {}>((_props, ref) => {
	useScopedSignalSubscription(sharePageSignals);
	const booleans = useSignalBooleans(sharePageSignals.booleans);
	const numbers = useSignalNumbers(sharePageSignals.numbers);
	const strings = useSignalStrings(sharePageSignals.strings);

	const cards = React.useMemo(
		() => buildSharePageCards(booleans, numbers, strings),
		[booleans, numbers, strings],
	);

	return (
		<Page ref={ref} id='page-share' label='Share' icon={<ShareIcon />} cards={cards} />
	);
});
SharePage.displayName = 'SharePage';

export default SharePage;
