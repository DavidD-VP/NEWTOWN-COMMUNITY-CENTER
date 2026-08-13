import * as React from 'react';
import VideocamIcon from '@mui/icons-material/Videocam';

import { signalConfig } from '../../../config/signals';
import type { ThemeMode } from '../../../store/appStore';

export type ThemeOption = {
	name: string;
	icon: React.ReactElement;
	themeValue: ThemeMode;
	/** Fixed index in themeCatalog / theme.select analog. */
	catalogIndex: number;
};

const themeDisableSignals = signalConfig.theme.options.map((o) => o.disable);

/** Full theme catalog — indices match `theme.select` analog values. */
export const themeCatalog: Array<ThemeOption & { disableSignal: string }> = [
	{ name: 'Teams', icon: <VideocamIcon />, themeValue: 'teams', catalogIndex: 0, disableSignal: themeDisableSignals[0] },
	{ name: 'Zoom (Light)', icon: <VideocamIcon />, themeValue: 'zoomLight', catalogIndex: 1, disableSignal: themeDisableSignals[1] },
	{ name: 'Zoom (Dark)', icon: <VideocamIcon />, themeValue: 'zoomDark', catalogIndex: 2, disableSignal: themeDisableSignals[2] },
	{ name: 'Monochrome', icon: <VideocamIcon />, themeValue: 'monochrome', catalogIndex: 3, disableSignal: themeDisableSignals[3] },
	{ name: 'Google Meet (Light)', icon: <VideocamIcon />, themeValue: 'googleMeetLight', catalogIndex: 4, disableSignal: themeDisableSignals[4] },
	{ name: 'Google Meet (Dark)', icon: <VideocamIcon />, themeValue: 'googleMeetDark', catalogIndex: 5, disableSignal: themeDisableSignals[5] },
];

/** @deprecated Use themeCatalog — kept for callers that need the full list. */
export const themes: Array<ThemeOption> = themeCatalog.map(
	({ disableSignal: _disableSignal, ...option }) => option,
);

export function isThemeDisabled(
	booleans: Record<string, boolean>,
	disableSignal: string,
): boolean {
	return booleans[disableSignal] ?? false;
}

export function buildVisibleThemes(
	booleans: Record<string, boolean>,
): ThemeOption[] {
	return themeCatalog
		.filter((entry) => !isThemeDisabled(booleans, entry.disableSignal))
		.map(({ disableSignal: _disableSignal, ...option }) => option);
}

export function getThemeByCatalogIndex(index: number): ThemeOption | undefined {
	return themeCatalog[index];
}
