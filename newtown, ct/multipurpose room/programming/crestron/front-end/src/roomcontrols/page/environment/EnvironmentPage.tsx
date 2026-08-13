import * as React from 'react';
import LandscapeIcon from '@mui/icons-material/Landscape';

import Page, { PageHandle } from '../Page';
import { CardProps } from '../../card/Card';
import ShadeDeviceCard, { ShadeDeviceCardProps } from '../../card/shade/ShadeDeviceCard';
import PrivacyGlassCard from '../../card/privacyglass/PrivacyGlassCard';
import LightingDeviceCard, { LightingDeviceCardProps } from '../../card/lighting/LightingDeviceCard';
import RoomStateCard, { RoomStateCardProps } from '../../card/roomstate/RoomStateCard';
import { GetRoomStateIconType } from '../../card/roomstate/typeHelpers';

import {
	useScopedSignalSubscription,
	useSignalBooleans,
	useSignalNumbers,
	useSignalStrings,
} from '../../../crestron/CrComLib';

import { signalConfig, pageSignals, isVisible } from '../../../config/signals';

export const environmentPageSignals = pageSignals.environment;
const env = signalConfig.environment;

type LightingCfg = (typeof env.lighting)[number];
type ShadeCfg    = (typeof env.shades)[number];

// ── Card builders ────────────────────────────────────────────────────────────

function buildLightingDevice(
	l: LightingCfg,
	booleans: Record<string, boolean>,
	numbers: Record<string, number>,
	strings: Record<string, string>,
): LightingDeviceCardProps {
	return {
		Label: strings[l.label] ?? '',
		MuteButtonProps: booleans[l.mute.visible]
			? { signal: l.mute.interaction }
			: undefined,
		BrightnessSliderProps: booleans[l.brightness.visible]
			? {
				signal: l.brightness.interaction,
				SliderProps: {
					min: numbers[l.brightness.minimum],
					max: numbers[l.brightness.maximum],
				},
			}
			: undefined,
	};
}

function buildShadeDevice(
	sh: ShadeCfg,
	strings: Record<string, string>,
): ShadeDeviceCardProps {
	return {
		Label: strings[sh.label] ?? '',
		Open: sh.open,
		Close: sh.close,
		Stop: sh.stop,
	};
}

function buildRoomState(
	booleans: Record<string, boolean>,
	numbers: Record<string, number>,
	strings: Record<string, string>,
): RoomStateCardProps {
	const rs = env.roomState;
	return {
		SelectSignal: rs.interaction,
		manualModeSignal: rs.manual.interaction,
		automaticSignal: booleans[rs.automatic.visible] ? rs.automatic.interaction : undefined,
		manualSignal: booleans[rs.manual.visible] ? rs.manual.interaction : undefined,
		States: rs.states.map((st, i) => ({
			Value: i + 1,
			Label: strings[st.label] ?? '',
			Icon: GetRoomStateIconType(numbers[st.type]),
		})),
	};
}

export function buildEnvironmentPageCards(
	booleans: Record<string, boolean>,
	numbers: Record<string, number>,
	strings: Record<string, string>,
): CardProps[] {
	const list: CardProps[] = [];

	for (const l of env.lighting) {
		if (!isVisible(booleans, l)) continue;
		list.push({
			...LightingDeviceCard(buildLightingDevice(l, booleans, numbers, strings)),
			id: l.visible,
		});
	}

	for (const sh of env.shades) {
		if (!isVisible(booleans, sh)) continue;
		const shadeCard = ShadeDeviceCard(buildShadeDevice(sh, strings));
		if (shadeCard) {
			list.push({ ...shadeCard, id: sh.visible });
		}
	}

	if (isVisible(booleans, env.privacyGlass)) {
		const card = PrivacyGlassCard({
			ToggleSignal: env.privacyGlass.interaction,
			ActiveSignal: env.privacyGlass.interaction,
		});
		if (card) list.push(card);
	}

	if (isVisible(booleans, env.roomState)) {
		list.push(RoomStateCard(buildRoomState(booleans, numbers, strings)));
	}

	return list;
}

// ── Component ────────────────────────────────────────────────────────────────

const EnvironmentPage = React.forwardRef<PageHandle, {}>((_props, ref) => {
	useScopedSignalSubscription(environmentPageSignals);
	const booleans = useSignalBooleans(environmentPageSignals.booleans);
	const numbers = useSignalNumbers(environmentPageSignals.numbers);
	const strings = useSignalStrings(environmentPageSignals.strings);

	const cards = React.useMemo(
		() => buildEnvironmentPageCards(booleans, numbers, strings),
		[booleans, numbers, strings],
	);

	return (
		<Page ref={ref} id='page-environment' label='Environment' icon={<LandscapeIcon />} cards={cards} />
	);
});
EnvironmentPage.displayName = 'EnvironmentPage';

export default EnvironmentPage;
