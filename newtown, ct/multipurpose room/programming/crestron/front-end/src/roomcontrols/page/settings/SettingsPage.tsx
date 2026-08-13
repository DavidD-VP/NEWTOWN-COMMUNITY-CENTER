import * as React from 'react';
import SettingsIcon from '@mui/icons-material/Settings';

import Page, { PageHandle } from '../Page';
import { CardProps } from '../../card/Card';
import { ThemeCard } from '../../card/theme/ThemeCard';
import { AccessLevelCard } from '../../card/accesslevel/AccessLevelCard';
import LabelCard from '../../card/settings/LabelCard';
import SaveSettingsCard from '../../card/settings/SaveSettingsCard';
import AutomaticPowerOffCard from '../../card/power/AutomaticPowerOffCard';
import TimeCard from '../../card/time/TimeCard';
import LockScreenCard from '../../card/lockscreen/LockScreenCard';
import { buildVisibleThemes } from '../../card/theme/themeOptions';

import {
	useScopedSignalSubscription,
	useSignalBooleans,
	useSignalStrings,
} from '../../../crestron/CrComLib';

import { signalConfig, pageSignals, isVisible } from '../../../config/signals';

export const settingsPageSignals = pageSignals.settings;
const s = signalConfig.settings;

function accessLevelOptions(
	items: readonly { label: string }[],
	strings: Record<string, string>,
) {
	return items
		.map((item, i) => ({
			value: i + 1,
			label: strings[item.label] ?? '',
		}))
		.filter((o) => o.label.length > 0);
}

function labelSlotOptions(
	items: readonly { label: string }[],
	strings: Record<string, string>,
) {
	return items
		.map((item, i) => ({
			Label: strings[item.label] ?? '',
			Value: i + 1,
		}))
		.filter((o) => o.Label.length > 0);
}

export function buildSettingsPageCards(
	booleans: Record<string, boolean>,
	strings: Record<string, string>,
): CardProps[] {
	const levels = accessLevelOptions(s.accessLevel.levels, strings);
	const labelSlots = labelSlotOptions(s.label.select.labels, strings);
	const visibleThemes = buildVisibleThemes(booleans);
	return [
			...(isVisible(booleans, s.accessLevel) && levels.length > 0
				? [AccessLevelCard({
					selectSignal: s.accessLevel.select,
					passwordSignal: s.accessLevel.password,
					unlockedSignal: s.accessLevel.unlocked,
					levels,
				})]
				: []),
			...(isVisible(booleans, s.label) && labelSlots.length > 0
				? [LabelCard({
					select: {
						signal: s.label.select.interaction,
						options: labelSlots,
						valueSignals: s.label.select.labels.map((l) => l.value),
					},
					showUpdate: isVisible(booleans, s.label.update),
				})]
				: []),
			...(isVisible(booleans, s.theme) && visibleThemes.length > 0
				? [ThemeCard({
					themes: visibleThemes,
					signal: signalConfig.theme.select,
					settingsLocked: s.theme.locked,
				})]
				: []),
			...(isVisible(booleans, s.autoPowerOff)
				? [AutomaticPowerOffCard({
					timeSignal: s.autoPowerOff.time,
					enable: signalConfig.autoPowerOff.enable,
					interaction: s.autoPowerOff.interaction,
					settingsLocked: s.autoPowerOff.locked,
				})]
				: []),
			...(isVisible(booleans, s.time)
				? [TimeCard({
					timeSignal: s.time.time,
					title: 'Time',
					settingsLocked: s.time.locked,
				})]
				: []),
			...(isVisible(booleans, s.lockScreen)
				? [LockScreenCard({
					interaction: s.lockScreen.interaction,
					toggleSignal: s.lockScreen.interaction,
					settingsLocked: s.lockScreen.locked,
					passwordSignal: s.lockScreen.password,
				})]
				: []),
			...(isVisible(booleans, s.saveSettings)
				? [SaveSettingsCard({ interaction: s.saveSettings.interaction })]
				: []),
	];
}

// ── Component ────────────────────────────────────────────────────────────────

const SettingsPage = React.forwardRef<PageHandle, {}>((_props, ref) => {
	useScopedSignalSubscription(settingsPageSignals);
	const booleans = useSignalBooleans(settingsPageSignals.booleans);
	const strings = useSignalStrings(settingsPageSignals.strings);

	const cards = React.useMemo(
		() => buildSettingsPageCards(booleans, strings),
		[booleans, strings],
	);

	return (
		<Page ref={ref} id='page-settings' label='Settings' icon={<SettingsIcon />} cards={cards} />
	);
});
SettingsPage.displayName = 'SettingsPage';

export default SettingsPage;
