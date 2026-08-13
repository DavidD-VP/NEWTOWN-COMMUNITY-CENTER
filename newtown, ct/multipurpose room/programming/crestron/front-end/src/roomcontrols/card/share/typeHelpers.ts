import type { SourceProps, DestinationCardProps } from './DestinationCard';

/**
 * Map a numeric type code to the matching SourceProps['Type'].
 *
 * Kept in its own light-weight module (uses `import type` only) so App.tsx
 * can call it without pulling the heavy DestinationCard component into
 * the initial JS bundle.
 */
export function GetSourceType(type: number): SourceProps['Type'] {
	switch (type) {
		case 1: return 'Laptop';
		case 2: return 'Wall Plate';
		case 3: return 'HDMI';
		case 4: return 'USB-C';
		case 5: return 'DisplayPort';
		case 6: return 'Wireless';
		case 7: return 'PC';
		case 8: return 'Cable TV';
		case 9: return 'BluRay Player';
		case 10: return 'Meeting';
		case 11: return 'Call';
		case 12: return 'Bluetooth';
		default: return 'Laptop';
	}
}

export function GetDestinationType(type: number): DestinationCardProps['Type'] {
	switch (type) {
		case 1: return 'Display';
		case 2: return 'Projector';
		case 3: return 'Speaker';
		case 4: return 'Monitor';
		case 5: return 'Videowall';
		case 6: return 'Meeting';
		case 7: return 'Recorder';
		case 8: return 'Livestream';
		default: return 'Display';
	}
}
