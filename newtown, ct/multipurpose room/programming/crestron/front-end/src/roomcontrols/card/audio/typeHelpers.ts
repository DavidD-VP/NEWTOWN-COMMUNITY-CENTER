import type { AudioDeviceCardProps } from './AudioDeviceCard';

export function GetAudioDeviceType(type: number): AudioDeviceCardProps['Type'] {
	switch (type) {
		case 1: return 'Microphone';
		case 2: return 'Speaker';
		case 3: return 'Headphone';
		case 4: return 'Earbud';
		case 5: return 'Mixer';
		case 6: return 'Amplifier';
		case 7: return 'Recorder';
		case 8: return 'Radio';
		case 9: return 'Call';
		default: return 'Microphone';
	}
}
