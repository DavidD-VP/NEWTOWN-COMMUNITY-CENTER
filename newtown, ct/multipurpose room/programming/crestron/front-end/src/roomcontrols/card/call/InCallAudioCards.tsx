import { signalConfig, isVisible } from '../../../config/signals';
import type { CallChannelInCallConfig } from '../../../config/signals';
import { CardProps } from '../Card';
import AudioDeviceCard from '../audio/AudioDeviceCard';

export function buildInCallAudioCards(
	inCall: CallChannelInCallConfig,
	booleans: Record<string, boolean>,
	numbers: Record<string, number>,
	_strings: Record<string, string>,
): CardProps[] {
	const cards: CardProps[] = [];

	if (isVisible(booleans, inCall.audio)) {
		const audio = inCall.audio;
		const card = AudioDeviceCard({
			Type: 'Speaker',
			Label: 'Volume',
			MuteButtonProps: isVisible(booleans, audio.mute)
				? { signal: audio.mute.interaction }
				: undefined,
			VolumeSliderProps: isVisible(booleans, audio.volume)
				? {
					signal: audio.volume.interaction,
					SliderProps: {
						min: numbers[audio.volume.minimum],
						max: numbers[audio.volume.maximum],
					},
				}
				: undefined,
		});
		if (card) {
			cards.push(card);
		}
	}

	if (isVisible(booleans, inCall.micMute)) {
		const card = AudioDeviceCard({
			Type: 'Microphone',
			Label: 'Microphone',
			MuteButtonProps: { signal: inCall.micMute.interaction },
		});
		if (card) {
			cards.push(card);
		}
	}

	if (isVisible(booleans, inCall.videoMute)) {
		const card = AudioDeviceCard({
			Type: 'Camera',
			Label: 'Camera',
			MuteButtonProps: { signal: inCall.videoMute.interaction },
		});
		if (card) {
			cards.push(card);
		}
	}

	return cards;
}

export default buildInCallAudioCards;
