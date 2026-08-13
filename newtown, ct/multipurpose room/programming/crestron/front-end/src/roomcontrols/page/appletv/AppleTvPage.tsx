import * as React from 'react';
import AppleTvIcon from '../../component/AppleTvIcon';

import Page, { PageHandle } from '../Page';
import { CardProps } from '../../card/Card';
import AppleTvCursorCard from '../../card/appletv/AppleTvCursorCard';
import AppleTvMediaCard from '../../card/appletv/AppleTvMediaCard';
import AppleTvVolumeCard from '../../card/appletv/AppleTvVolumeCard';
import AppleTvSelectCard, { AppleTvSelectCardProps } from '../../card/appletv/AppleTvSelectCard';
import type { AppleTvRemoteProps } from '../../card/appletv/appleTvRemoteProps';

import {
	useScopedSignalSubscription,
	useSignalBooleans,
	useSignalStrings,
} from '../../../crestron/CrComLib';

import { signalConfig, pageSignals, isVisible } from '../../../config/signals';

export const appleTvPageSignals = pageSignals.appletv;
const atv = signalConfig.appletv;

export function buildAppleTvPageCards(
	booleans: Record<string, boolean>,
	strings: Record<string, string>,
): CardProps[] {
	const props: Omit<AppleTvRemoteProps, 'Select'> = {};
	for (const btn of atv.buttons) {
		const key = btn.label as keyof Omit<AppleTvRemoteProps, 'Select'>;
		props[key] = booleans[btn.visible] ? btn.interaction : undefined;
	}

	const select: AppleTvSelectCardProps | undefined = isVisible(booleans, atv.select)
		? {
			Select: atv.select.interaction,
			Devices: atv.select.devices.map((d) => strings[d.label] ?? ''),
		}
		: undefined;

	const pageProps: AppleTvRemoteProps = { ...props, Select: select };

	return [
		select ? AppleTvSelectCard(select) : null,
		AppleTvCursorCard(pageProps),
		AppleTvMediaCard(pageProps),
		AppleTvVolumeCard(pageProps),
	].filter((c): c is CardProps => c !== null);
}

const AppleTvPage = React.forwardRef<PageHandle, {}>((_props, ref) => {
	useScopedSignalSubscription(appleTvPageSignals);
	const booleans = useSignalBooleans(appleTvPageSignals.booleans);
	const strings = useSignalStrings(appleTvPageSignals.strings);

	const cards = React.useMemo(
		() => buildAppleTvPageCards(booleans, strings),
		[booleans, strings],
	);

	return (
		<Page ref={ref} id='page-appletv' label='Apple TV' icon={<AppleTvIcon />} cards={cards} />
	);
});
AppleTvPage.displayName = 'AppleTvPage';

export default AppleTvPage;
