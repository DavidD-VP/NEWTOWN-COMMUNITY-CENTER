import React from 'react';

type NavigationDismissContextValue = {
	registerDismissHandler: (handler: () => void) => () => void;
	dismissAll: () => void;
};

const NavigationDismissContext = React.createContext<NavigationDismissContextValue | null>(null);

export function NavigationDismissProvider(props: { children: React.ReactNode }) {
	const handlersRef = React.useRef(new Set<() => void>());

	const registerDismissHandler = React.useCallback((handler: () => void) => {
		handlersRef.current.add(handler);
		return () => {
			handlersRef.current.delete(handler);
		};
	}, []);

	const dismissAll = React.useCallback(() => {
		handlersRef.current.forEach((handler) => handler());
	}, []);

	const value = React.useMemo<NavigationDismissContextValue>(
		() => ({ registerDismissHandler, dismissAll }),
		[registerDismissHandler, dismissAll],
	);

	return (
		<NavigationDismissContext.Provider value={value}>
			{props.children}
		</NavigationDismissContext.Provider>
	);
}

export function useNavigationDismissRegistry(): NavigationDismissContextValue | null {
	return React.useContext(NavigationDismissContext);
}

/** Close local popups/editors when the user navigates to another page. */
export function useDismissOnNavigation(onDismiss: () => void): void {
	const ctx = React.useContext(NavigationDismissContext);
	const onDismissRef = React.useRef(onDismiss);
	onDismissRef.current = onDismiss;

	React.useEffect(() => {
		if (!ctx) return;
		return ctx.registerDismissHandler(() => onDismissRef.current());
	}, [ctx]);
}
