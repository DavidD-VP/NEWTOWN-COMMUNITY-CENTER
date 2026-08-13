import { create } from 'zustand';

export type ThemeMode = 'light' | 'dark' | 'teams' | 'zoomLight' | 'zoomDark' | 'monochrome' | 'googleMeetLight' | 'googleMeetDark';

interface AppState {
	emulation: boolean;
	setEmulation: (value: boolean) => void;
	themeMode: ThemeMode;
	setThemeMode: (
		value:
			| ThemeMode
			| ((prev: ThemeMode) => ThemeMode),
	) => void;
}

export const useAppStore = create<AppState>((set) => ({
	emulation: import.meta.env.VITE_EMULATION === 'true',
	setEmulation: (value) => set({ emulation: value }),
	themeMode: 'teams',
	setThemeMode: (value) =>
		set((state) => ({
			themeMode:
				typeof value === 'function' ? value(state.themeMode) : value,
		})),
}));
