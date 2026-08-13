export const HELP_RETURN_URL_PARAM = 'returnUrl';
export const HELP_RETURN_URL_STORAGE_KEY = 'visionpoint.helpReturnUrl';

/**
 * Navigate the current window to the local manual. Stores the current UI URL in
 * sessionStorage and appends a returnUrl query param so the manual page can
 * link back to the control interface.
 */
export function navigateToLocalManual(manualUrl: string): void {
	const trimmed = manualUrl.trim();
	if (!trimmed) return;

	const returnUrl = window.location.href;
	try {
		sessionStorage.setItem(HELP_RETURN_URL_STORAGE_KEY, returnUrl);
	} catch {
		// sessionStorage may be unavailable in some embedded contexts
	}

	const separator = trimmed.includes('?') ? '&' : '?';
	const destination = `${trimmed}${separator}${HELP_RETURN_URL_PARAM}=${encodeURIComponent(returnUrl)}`;
	window.location.assign(destination);
}
