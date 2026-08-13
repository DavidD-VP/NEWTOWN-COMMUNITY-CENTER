import * as React from 'react';

import { resolveProcessorAssetUrl } from '../utils/resolveLocalManualUrl';
import { useProcessorHostname } from '../hooks/useProcessorHostname';

export type SourcePreviewImageProps = {
	assetPath: string;
	hostname?: string;
	alt: string;
	refreshIntervalMs?: number;
	/** Scale image to fill a bounded parent (e.g. video wall grid cells). */
	fitContainer?: boolean;
	objectFit?: React.CSSProperties['objectFit'];
};

const DEFAULT_REFRESH_MS = 2000;

function appendCacheBust(resolved: string, tick: number): string {
	if (tick === 0) return resolved;
	const sep = resolved.includes('?') ? '&' : '?';
	return `${resolved}${sep}t=${tick}`;
}

const SourcePreviewImage: React.FC<SourcePreviewImageProps> = ({
	assetPath,
	hostname: hostnameProp,
	alt,
	refreshIntervalMs = DEFAULT_REFRESH_MS,
	fitContainer = false,
	objectFit = 'contain',
}) => {
	const hostnameFromHook = useProcessorHostname();
	const hostname = hostnameProp ?? hostnameFromHook;
	const [tick, setTick] = React.useState(0);

	const resolved = React.useMemo(
		() => resolveProcessorAssetUrl(assetPath, hostname),
		[assetPath, hostname],
	);

	React.useEffect(() => {
		if (!resolved || refreshIntervalMs <= 0) return;
		const id = window.setInterval(() => {
			setTick((t) => t + 1);
		}, refreshIntervalMs);
		return () => window.clearInterval(id);
	}, [resolved, refreshIntervalMs]);

	if (!resolved) return null;

	const imgStyle: React.CSSProperties = fitContainer
		? {
				position: 'absolute',
				inset: 0,
				width: '100%',
				height: '100%',
				objectFit,
			}
		: {
				maxWidth: '100%',
				width: '100%',
				borderRadius: 8,
				objectFit,
			};

	const img = (
		<img
			src={appendCacheBust(resolved, tick)}
			alt={alt}
			style={imgStyle}
		/>
	);

	if (!fitContainer) return img;

	return (
		<div
			style={{
				position: 'absolute',
				inset: 0,
				overflow: 'hidden',
			}}
		>
			{img}
		</div>
	);
};

export default SourcePreviewImage;
