import React from 'react';

type OverlayOpenContextValue = {
	registerOpenOverlay: () => () => void;
	isPageOverlayOpen: boolean;
};

const OverlayOpenContext = React.createContext<OverlayOpenContextValue | null>(null);

export function OverlayOpenProvider(props: { children: React.ReactNode }) {
	const [openCount, setOpenCount] = React.useState(0);

	const registerOpenOverlay = React.useCallback(() => {
		setOpenCount((count) => count + 1);
		return () => setOpenCount((count) => Math.max(0, count - 1));
	}, []);

	const value = React.useMemo<OverlayOpenContextValue>(
		() => ({
			registerOpenOverlay,
			isPageOverlayOpen: openCount > 0,
		}),
		[registerOpenOverlay, openCount],
	);

	return (
		<OverlayOpenContext.Provider value={value}>
			{props.children}
		</OverlayOpenContext.Provider>
	);
}

/** True while any TouchPanelOverlay (or registered overlay) is open above the page. */
export function useIsPageOverlayOpen(): boolean {
	return React.useContext(OverlayOpenContext)?.isPageOverlayOpen ?? false;
}

/** Register an open overlay so page-level scroll arrows stay hidden. */
export function useRegisterOverlayOpen(open: boolean): void {
	const ctx = React.useContext(OverlayOpenContext);

	React.useEffect(() => {
		if (!open || !ctx) return;
		return ctx.registerOpenOverlay();
	}, [open, ctx]);
}
