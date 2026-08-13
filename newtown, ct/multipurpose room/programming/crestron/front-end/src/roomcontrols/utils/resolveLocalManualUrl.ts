/**

 * Resolve a processor-hosted asset path (preview image, manual HTML, etc.).

 *

 * Relative paths from Crestron are prefixed with the processor hostname when the

 * UI is not served from that host (e.g. localhost dev). When UI and asset share

 * the processor host, keep a relative path so requests inherit the page protocol

 * (https) and avoid mixed-content blocks.

 */

export function resolveProcessorAssetUrl(

	assetPath: string,

	hostname: string | undefined,

): string {

	const trimmed = assetPath.trim();

	if (!trimmed) return '';



	if (/^https?:\/\//i.test(trimmed)) return trimmed;



	const path = trimmed.startsWith('/') ? trimmed : `/${trimmed}`;



	if (!hostname) return path;



	if (document.location.hostname === hostname) {

		return path;

	}



	const pathWithoutLeading = path.replace(/^\//, '');



	if (document.location.protocol === 'file:') {

		return `https://${hostname}/${pathWithoutLeading}`;

	}



	return `http://${hostname}/${pathWithoutLeading}`;

}



/**

 * Resolve help.localURL for same-window manual navigation.

 */

export function resolveLocalManualUrl(

	localURL: string,

	hostname: string | undefined,

): string {

	return resolveProcessorAssetUrl(localURL, hostname);

}


