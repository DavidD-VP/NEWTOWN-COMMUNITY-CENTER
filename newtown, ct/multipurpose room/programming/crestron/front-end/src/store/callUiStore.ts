import { create } from 'zustand';

import type { CallChannelKey } from '../config/callChannelBlock';

interface CallUiState {
	focusChannel: CallChannelKey | null;
	setFocusChannel: (channel: CallChannelKey | null) => void;
}

export const useCallUiStore = create<CallUiState>((set) => ({
	focusChannel: null,
	setFocusChannel: (channel) => set({ focusChannel: channel }),
}));
