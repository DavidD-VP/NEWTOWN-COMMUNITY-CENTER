import {
	signalConfig,
	isVisible,
	anyVisible,
	type pageSignals,
	type CallChannelConfig,
} from './signals';
import { buildVisibleThemes } from '../roomcontrols/card/theme/themeOptions';

export type NavPageKey = keyof typeof pageSignals;

const manualPtzGates = [
	signalConfig.camera.manual.ptz.pan,
	signalConfig.camera.manual.ptz.tilt,
	signalConfig.camera.manual.ptz.panTilt,
	signalConfig.camera.manual.ptz.zoom,
	signalConfig.camera.manual.ptz.focus,
	signalConfig.camera.manual.ptz.home,
] as const;

function sharePageHasVisibleCards(booleans: Record<string, boolean>): boolean {
	for (const d of signalConfig.share.destinations) {
		if (isVisible(booleans, d)) return true;
	}
	return isVisible(booleans, signalConfig.share.videoWall);
}

function audioPageHasVisibleCards(booleans: Record<string, boolean>): boolean {
	for (const d of signalConfig.audio.devices) {
		if (isVisible(booleans, d)) return true;
	}
	return false;
}

type RemoteControlPageConfig = {
	select: { visible: string };
	buttons: readonly { visible: string }[];
	preset?: { visible: string };
};

/** Matches build*PageCards: select card, optional preset card, or any remote button group. */
function remoteControlPageHasVisibleCards(
	config: RemoteControlPageConfig,
	booleans: Record<string, boolean>,
): boolean {
	if (isVisible(booleans, config.select)) return true;
	if (config.preset && isVisible(booleans, config.preset)) return true;
	return config.buttons.some((btn) => booleans[btn.visible]);
}

function cableTunerPageHasVisibleCards(booleans: Record<string, boolean>): boolean {
	return remoteControlPageHasVisibleCards(signalConfig.cabletuner, booleans);
}

function bluRayPageHasVisibleCards(booleans: Record<string, boolean>): boolean {
	return remoteControlPageHasVisibleCards(signalConfig.bluray, booleans);
}

function appleTvPageHasVisibleCards(booleans: Record<string, boolean>): boolean {
	return remoteControlPageHasVisibleCards(signalConfig.appletv, booleans);
}

function accessLevelHasOptions(strings: Record<string, string>): boolean {
	return signalConfig.settings.accessLevel.levels.some(
		(item) => (strings[item.label] ?? '').trim().length > 0,
	);
}

function labelSlotsHaveOptions(strings: Record<string, string>): boolean {
	return signalConfig.settings.label.select.labels.some(
		(item) => (strings[item.label] ?? '').trim().length > 0,
	);
}

function settingsPageHasVisibleCards(
	booleans: Record<string, boolean>,
	strings: Record<string, string>,
): boolean {
	const s = signalConfig.settings;
	if (isVisible(booleans, s.accessLevel) && accessLevelHasOptions(strings)) return true;
	if (isVisible(booleans, s.label) && labelSlotsHaveOptions(strings)) return true;
	if (isVisible(booleans, s.theme) && buildVisibleThemes(booleans).length > 0) return true;
	if (isVisible(booleans, s.autoPowerOff)) return true;
	if (isVisible(booleans, s.time)) return true;
	if (isVisible(booleans, s.lockScreen)) return true;
	if (isVisible(booleans, s.saveSettings)) return true;
	return false;
}

function environmentPageHasVisibleCards(booleans: Record<string, boolean>): boolean {
	const env = signalConfig.environment;
	for (const l of env.lighting) {
		if (isVisible(booleans, l)) return true;
	}
	for (const sh of env.shades) {
		if (isVisible(booleans, sh)) return true;
	}
	if (isVisible(booleans, env.privacyGlass)) return true;
	if (isVisible(booleans, env.roomState)) return true;
	return false;
}

function cameraPageHasVisibleCards(booleans: Record<string, boolean>): boolean {
	const c = signalConfig.camera;
	const manualActive = booleans[c.manual.interaction];
	const automaticActive = booleans[c.automatic.interaction];
	const manualVisible = isVisible(booleans, c.manual);
	const automaticVisible = isVisible(booleans, c.automatic);

	if (automaticActive && automaticVisible) {
		if (booleans[c.automatic.mode.visible]) return true;
		if (isVisible(booleans, c.automatic.speakerTrack)) return true;
	}

	if (manualActive && manualVisible && isVisible(booleans, c.manual.select)) return true;

	if (manualActive && manualVisible && anyVisible(booleans, manualPtzGates)) {
		const ptz = c.manual.ptz;
		const pan = booleans[ptz.pan.visible];
		const tilt = booleans[ptz.tilt.visible];
		const pantilt = booleans[ptz.panTilt.visible];
		const zoom = booleans[ptz.zoom.visible];
		const focusManual = booleans[ptz.focus.visible];
		const focusAuto = booleans[ptz.focus.autoFocus.visible]
			? ptz.focus.autoFocus.interaction
			: undefined;
		const focusSpeed = booleans[ptz.focus.speed.visible];
		const focus = focusManual || focusAuto || focusSpeed;
		const home = booleans[ptz.home.visible] ? ptz.home.interaction : undefined;
		if (pan || tilt || pantilt || zoom || home || focus) return true;
	}

	if (manualActive && manualVisible && isVisible(booleans, c.manual.preset)) return true;
	if (isVisible(booleans, c.selfview)) return true;
	if (isVisible(booleans, c.record)) return true;
	if (isVisible(booleans, c.livestream)) return true;
	return false;
}

function callChannelHasVisibleCards(
	channel: CallChannelConfig,
	booleans: Record<string, boolean>,
): boolean {
	const conn = channel.connect;
	const connected = booleans[channel.connected] ?? false;
	const byodActive = booleans[conn.byod.interaction] ?? false;

	if (!connected && isVisible(booleans, conn.byod)) return true;

	if (!connected && !byodActive && isVisible(booleans, conn.card)) {
		if (isVisible(booleans, conn.dial)) return true;
		if (isVisible(booleans, conn.contact)) return true;
		if (isVisible(booleans, conn.meeting)) return true;
	}

	if (connected && isVisible(booleans, channel.inCall.card)) return true;

	return false;
}

function callPageHasVisibleCards(booleans: Record<string, boolean>): boolean {
	return (
		callChannelHasVisibleCards(signalConfig.call.video, booleans) ||
		callChannelHasVisibleCards(signalConfig.call.audio, booleans)
	);
}

const pageVisibilityChecks: Record<
	NavPageKey,
	(
		booleans: Record<string, boolean>,
		numbers: Record<string, number>,
		strings: Record<string, string>,
	) => boolean
> = {
	share: (booleans) => sharePageHasVisibleCards(booleans),
	audio: (booleans) => audioPageHasVisibleCards(booleans),
	cabletuner: (booleans) => cableTunerPageHasVisibleCards(booleans),
	bluray: (booleans) => bluRayPageHasVisibleCards(booleans),
	appletv: (booleans) => appleTvPageHasVisibleCards(booleans),
	settings: (booleans, _numbers, strings) => settingsPageHasVisibleCards(booleans, strings),
	environment: (booleans) => environmentPageHasVisibleCards(booleans),
	camera: (booleans) => cameraPageHasVisibleCards(booleans),
	call: (booleans) => callPageHasVisibleCards(booleans),
};

/** True when the page would mount at least one card (signal gates only — no card imports). */
export function pageHasVisibleCards(
	page: NavPageKey,
	booleans: Record<string, boolean>,
	numbers: Record<string, number>,
	strings: Record<string, string>,
): boolean {
	return pageVisibilityChecks[page](booleans, numbers, strings);
}
