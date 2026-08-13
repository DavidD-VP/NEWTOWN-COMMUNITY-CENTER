import React from 'react';

import { releaseBooleanIfHigh } from '../../crestron/CrComLib';

type MomentaryPressContextValue = {
	registerActivePress: (signal: string) => void;
	unregisterActivePress: (signal: string) => void;
	releaseActivePresses: () => void;
};

const MomentaryPressContext = React.createContext<MomentaryPressContextValue | null>(null);

export function useMomentaryPressRegistry(): MomentaryPressContextValue | null {
	return React.useContext(MomentaryPressContext);
}

export type MomentaryPressProviderProps = {
	children: React.ReactNode;
	/** When false, held momentary presses are released (card hidden/collapsed). */
	releaseActive?: boolean;
};

export function MomentaryPressProvider(props: MomentaryPressProviderProps) {
	const activePressesRef = React.useRef(new Set<string>());
	const releaseActive = props.releaseActive ?? true;
	const prevReleaseActiveRef = React.useRef(releaseActive);

	const releaseActivePresses = React.useCallback(() => {
		for (const signal of activePressesRef.current) {
			releaseBooleanIfHigh(signal);
		}
		activePressesRef.current.clear();
	}, []);

	const registerActivePress = React.useCallback((signal: string) => {
		activePressesRef.current.add(signal);
	}, []);

	const unregisterActivePress = React.useCallback((signal: string) => {
		activePressesRef.current.delete(signal);
	}, []);

	React.useEffect(() => {
		if (prevReleaseActiveRef.current && !releaseActive) {
			releaseActivePresses();
		}
		prevReleaseActiveRef.current = releaseActive;
	}, [releaseActive, releaseActivePresses]);

	React.useEffect(() => {
		return () => {
			releaseActivePresses();
		};
	}, [releaseActivePresses]);

	const value = React.useMemo<MomentaryPressContextValue>(
		() => ({
			registerActivePress,
			unregisterActivePress,
			releaseActivePresses,
		}),
		[registerActivePress, unregisterActivePress, releaseActivePresses],
	);

	return (
		<MomentaryPressContext.Provider value={value}>
			{props.children}
		</MomentaryPressContext.Provider>
	);
}
