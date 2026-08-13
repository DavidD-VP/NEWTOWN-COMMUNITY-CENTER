import * as React from 'react';
import AlbumIcon from '@mui/icons-material/Album';

import Page, { PageHandle } from '../Page';
import { CardProps } from '../../card/Card';
import BluRayAudioVideoCard from '../../card/bluray/BluRayAudioVideoCard';
import BluRayCursorCard from '../../card/bluray/BluRayCursorCard';
import BluRayDiscCard from '../../card/bluray/BluRayDiscCard';
import BluRayFunctionsCard from '../../card/bluray/BluRayFunctionsCard';
import BluRayKeypadCard from '../../card/bluray/BluRayKeypadCard';
import BluRayMenusCard from '../../card/bluray/BluRayMenusCard';
import BluRayPlaybackCard from '../../card/bluray/BluRayPlaybackCard';
import BluRayPowerCard from '../../card/bluray/BluRayPowerCard';
import BluRayVolumeCard from '../../card/bluray/BluRayVolumeCard';
import BluRaySelectCard, { BluRaySelectCardProps } from '../../card/bluray/BluRaySelectCard';
import type { BluRayRemoteProps } from '../../card/bluray/bluRayRemoteProps';

import {
	useScopedSignalSubscription,
	useSignalBooleans,
	useSignalStrings,
} from '../../../crestron/CrComLib';

import { signalConfig, pageSignals, isVisible } from '../../../config/signals';

export const bluRayPageSignals = pageSignals.bluray;
const br = signalConfig.bluray;

export function buildBluRayPageCards(
	booleans: Record<string, boolean>,
	strings: Record<string, string>,
): CardProps[] {
	const props: Omit<BluRayRemoteProps, 'Select'> = {};
	for (const btn of br.buttons) {
		const key = btn.label as keyof Omit<BluRayRemoteProps, 'Select'>;
		props[key] = booleans[btn.visible] ? btn.interaction : undefined;
	}

	const select: BluRaySelectCardProps | undefined = isVisible(booleans, br.select)
		? {
			Select: br.select.interaction,
			Devices: br.select.devices.map((d) => strings[d.label] ?? ''),
		}
		: undefined;

	const pageProps: BluRayRemoteProps = { ...props, Select: select };

	return [
		select ? BluRaySelectCard(select) : null,
		BluRayAudioVideoCard(pageProps),
		BluRayCursorCard(pageProps),
		BluRayFunctionsCard(pageProps),
		BluRayKeypadCard(pageProps),
		BluRayMenusCard(pageProps),
		BluRayPlaybackCard(pageProps),
		BluRayDiscCard(pageProps),
		BluRayPowerCard(pageProps),
		BluRayVolumeCard(pageProps),
	].filter((c): c is CardProps => c !== null);
}

// ── Component ────────────────────────────────────────────────────────────────

const BluRayPage = React.forwardRef<PageHandle, {}>((_props, ref) => {
	useScopedSignalSubscription(bluRayPageSignals);
	const booleans = useSignalBooleans(bluRayPageSignals.booleans);
	const strings = useSignalStrings(bluRayPageSignals.strings);

	const cards = React.useMemo(
		() => buildBluRayPageCards(booleans, strings),
		[booleans, strings],
	);

	return (
		<Page ref={ref} id='page-bluray' label='Blu-ray' icon={<AlbumIcon />} cards={cards} />
	);
});
BluRayPage.displayName = 'BluRayPage';

export default BluRayPage;
