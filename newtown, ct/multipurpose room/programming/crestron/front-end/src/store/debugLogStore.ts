import { create } from 'zustand';

export type DebugLogLevel = 'log' | 'info' | 'warn' | 'error';

export type DebugLogEntry = {
	id: number;
	level: DebugLogLevel;
	text: string;
	time: number;
};

const MAX_ENTRIES = 200;
const MAX_TOASTS = 3;
const DUPLICATE_WINDOW_MS = 2000;

let nextId = 1;

interface DebugLogState {
	entries: DebugLogEntry[];
	activeToasts: DebugLogEntry[];
	panelOpen: boolean;
	pushLog: (level: DebugLogLevel, text: string) => void;
	removeToast: (id: number) => void;
	clearLogs: () => void;
	setPanelOpen: (open: boolean) => void;
	togglePanel: () => void;
}

export const useDebugLogStore = create<DebugLogState>((set, get) => ({
	entries: [],
	activeToasts: [],
	panelOpen: false,

	pushLog: (level, text) => {
		const trimmed = text.trim();
		if (!trimmed) return;

		const now = Date.now();
		const { entries, activeToasts } = get();
		const last = entries[entries.length - 1];
		if (
			last &&
			last.text === trimmed &&
			last.level === level &&
			now - last.time < DUPLICATE_WINDOW_MS
		) {
			return;
		}

		const entry: DebugLogEntry = {
			id: nextId++,
			level,
			text: trimmed,
			time: now,
		};

		const nextEntries = [...entries, entry].slice(-MAX_ENTRIES);
		const nextToasts = [...activeToasts, entry].slice(-MAX_TOASTS);

		set({ entries: nextEntries, activeToasts: nextToasts });
	},

	removeToast: (id) => {
		set((state) => ({
			activeToasts: state.activeToasts.filter((t) => t.id !== id),
		}));
	},

	clearLogs: () => {
		set({ entries: [], activeToasts: [] });
	},

	setPanelOpen: (open) => set({ panelOpen: open }),

	togglePanel: () => set((state) => ({ panelOpen: !state.panelOpen })),
}));

export function isDebugConsoleNotificationsEnabled(): boolean {
	return import.meta.env.VITE_DEBUG_CONSOLE_NOTIFICATIONS === 'true';
}
