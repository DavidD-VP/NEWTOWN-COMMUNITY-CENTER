import * as React from 'react';
import AudiotrackIcon from '@mui/icons-material/Audiotrack';

import Page, { PageHandle } from '../Page';
import AudioDeviceCard, { AudioDeviceCardProps } from '../../card/audio/AudioDeviceCard';
import { CardProps } from '../../card/Card';
import { GetAudioDeviceType } from '../../card/audio/typeHelpers';

import {
	useScopedSignalSubscription,
	useSignalBooleans,
	useSignalNumbers,
	useSignalStrings,
} from '../../../crestron/CrComLib';

import { signalConfig, pageSignals, isVisible } from '../../../config/signals';

export const audioPageSignals = pageSignals.audio;

type AudioDeviceCfg = (typeof signalConfig.audio.devices)[number];

// ── Card builders ────────────────────────────────────────────────────────────

function buildAudioDevice(
	d: AudioDeviceCfg,
	booleans: Record<string, boolean>,
	numbers: Record<string, number>,
	strings: Record<string, string>,
): AudioDeviceCardProps {
	return {
		Type: GetAudioDeviceType(numbers[d.type]),
		Label: strings[d.label] ?? '',
		MuteButtonProps: booleans[d.mute.visible]
			? { signal: d.mute.interaction }
			: undefined,
		VolumeSliderProps: booleans[d.volume.visible]
			? {
				signal: d.volume.interaction,
				SliderProps: {
					min: numbers[d.volume.minimum],
					max: numbers[d.volume.maximum],
				},
			}
			: undefined,
		BatteryIconProps: booleans[d.battery.visible]
			? { charge: d.battery.charge, charging: d.battery.charging }
			: undefined,
	};
}

export function buildAudioPageCards(
	booleans: Record<string, boolean>,
	numbers: Record<string, number>,
	strings: Record<string, string>,
): CardProps[] {
	const list: CardProps[] = [];
	for (const d of signalConfig.audio.devices) {
		if (!isVisible(booleans, d)) continue;
		list.push({
			...AudioDeviceCard(buildAudioDevice(d, booleans, numbers, strings)),
			id: d.visible,
		});
	}
	return list;
}

// ── Component ────────────────────────────────────────────────────────────────

const AudioPage = React.forwardRef<PageHandle, {}>((_props, ref) => {
	useScopedSignalSubscription(audioPageSignals);
	const booleans = useSignalBooleans(audioPageSignals.booleans);
	const numbers = useSignalNumbers(audioPageSignals.numbers);
	const strings = useSignalStrings(audioPageSignals.strings);

	const cards = React.useMemo(
		() => buildAudioPageCards(booleans, numbers, strings),
		[booleans, numbers, strings],
	);

	return (
		<Page ref={ref} id='page-audio' label='Audio' icon={<AudiotrackIcon />} cards={cards} />
	);
});
AudioPage.displayName = 'AudioPage';

export default AudioPage;
