import * as React from 'react';

/** Closes an overlay when `locked` becomes true (e.g. Crestron lock feedback). */
export function useCloseOverlayWhenLocked(locked: boolean, onClose: () => void): void {
	React.useEffect(() => {
		if (locked) onClose();
	}, [locked, onClose]);
}
