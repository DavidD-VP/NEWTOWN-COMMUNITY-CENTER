import * as React from 'react';
import CameraIcon from '@mui/icons-material/Camera';
import FiberManualRecordIcon from '@mui/icons-material/FiberManualRecord';
import LiveTvIcon from '@mui/icons-material/LiveTv';
import PlayIcon from '@mui/icons-material/PlayArrow';
import StopIcon from '@mui/icons-material/Stop';

import Page, { PageHandle } from '../Page';
import { CardProps } from '../../card/Card';
import CameraSelectCard from '../../card/camera/CameraSelectCard';
import PresetCard from '../../card/camera/PresetCard';
import AutomaticModeCard from '../../card/camera/AutomaticModeCard';
import SpeakerTrackCard from '../../card/camera/SpeakerTrackCard';
import SelfviewCard from '../../card/camera/SelfviewCard';
import PTZCard from '../../card/camera/PTZCard';
import {
	buildToggleControlCard,
	recordActiveFlashSx,
} from '../../component/toggleControlCard';
import type { CrestronSliderProps } from '../../component/CrestronSlider';

import {
	useScopedSignalSubscription,
	useSignalBooleans,
	useSignalNumbers,
	useSignalStrings,
} from '../../../crestron/CrComLib';

import { signalConfig, pageSignals, isVisible, anyVisible } from '../../../config/signals';
import SourcePreviewImage from '../../component/SourcePreviewImage';

export const cameraPageSignals = pageSignals.camera;
const c = signalConfig.camera;
const manualPtzGates = [
	c.manual.ptz.pan,
	c.manual.ptz.tilt,
	c.manual.ptz.panTilt,
	c.manual.ptz.zoom,
	c.manual.ptz.focus,
	c.manual.ptz.focus.autoFocus,
	c.manual.ptz.home,
] as const;

// ── Helpers ──────────────────────────────────────────────────────────────────

function labelOptions(
	items: readonly { label: string }[],
	strings: Record<string, string>,
) {
	return items.map((item, i) => ({
		Label: strings[item.label] ?? '',
		Value: i + 1,
	}));
}

function modeOptions(
	modes: readonly { label: string; preview: string }[],
	strings: Record<string, string>,
) {
	return modes.map((m, i) => {
		const label = strings[m.label] ?? '';
		const previewPath = strings[m.preview]?.trim() ?? '';
		return {
			Label: label,
			Value: i + 1,
			Preview: previewPath
				? <SourcePreviewImage assetPath={previewPath} alt={label} />
				: undefined,
		};
	});
}

function speedSlider(
	speed: { visible: string; interaction: string; minimum: string; maximum: string },
	booleans: Record<string, boolean>,
	numbers: Record<string, number>,
): CrestronSliderProps | undefined {
	return booleans[speed.visible]
		? {
			signal: speed.interaction,
			SliderProps: {
				min: numbers[speed.minimum],
				max: numbers[speed.maximum],
			},
		}
		: undefined;
}

function featureSignal(
	feature: { visible: string; interaction: string },
	booleans: Record<string, boolean>,
): string | undefined {
	return booleans[feature.visible] ? feature.interaction : undefined;
}

// ── Card builder ─────────────────────────────────────────────────────────────

export function buildCameraPageCards(
	booleans: Record<string, boolean>,
	numbers: Record<string, number>,
	strings: Record<string, string>,
): CardProps[] {
	const manualActive = booleans[c.manual.interaction];
	const automaticActive = booleans[c.automatic.interaction];
	const manualVisible = isVisible(booleans, c.manual);
	const automaticVisible = isVisible(booleans, c.automatic);
	const manualSignal = manualVisible ? c.manual.interaction : undefined;
	const automaticSignal = automaticVisible ? c.automatic.interaction : undefined;

	const list: CardProps[] = [];

	if (automaticActive && isVisible(booleans, c.automatic)) {
		const modeSelect = booleans[c.automatic.mode.visible]
			? {
				signal: c.automatic.mode.interaction,
				options: modeOptions(c.automatic.mode.modes, strings),
			}
			: undefined;
		if (modeSelect) {
			list.push({
				...AutomaticModeCard({ select: modeSelect, automaticSignal, manualSignal }),
				pin: 0,
			});
		}

		if (isVisible(booleans, c.automatic.speakerTrack)) {
			const st = c.automatic.speakerTrack;
			list.push({
				...SpeakerTrackCard({
					activeBehavior: st.activeBehavior,
					backgroundMode: featureSignal(st.backgroundMode, booleans),
					closeUp: featureSignal(st.closeUp, booleans),
					frames: featureSignal(st.frames, booleans),
					groupAndSpeaker: featureSignal(st.groupAndSpeaker, booleans),
					viewLimits: featureSignal(st.viewLimits, booleans),
					whiteboard: featureSignal(st.whiteboard, booleans),
				}),
				pin: 1,
			});
		}
	}

	if (manualActive && manualVisible && isVisible(booleans, c.manual.select)) {
		list.push({
			...CameraSelectCard({
				select: {
					signal: c.manual.select.interaction,
					options: labelOptions(c.manual.select.cameras, strings),
				},
				automaticSignal,
				manualSignal,
			}),
			pin: 1,
		});
	}

	if (manualActive && manualVisible && anyVisible(booleans, manualPtzGates)) {
		const ptz = c.manual.ptz;
		const pan = booleans[ptz.pan.visible]
			? {
				left: ptz.pan.left,
				right: ptz.pan.right,
				speed: speedSlider(ptz.pan.speed, booleans, numbers),
			}
			: undefined;
		const tilt = booleans[ptz.tilt.visible]
			? {
				up: ptz.tilt.up,
				down: ptz.tilt.down,
				speed: speedSlider(ptz.tilt.speed, booleans, numbers),
			}
			: undefined;
		const pantilt = booleans[ptz.panTilt.visible]
			? {
				upLeft: ptz.panTilt.upLeft,
				upRight: ptz.panTilt.upRight,
				downLeft: ptz.panTilt.downLeft,
				downRight: ptz.panTilt.downRight,
			}
			: undefined;
		const zoom = booleans[ptz.zoom.visible]
			? {
				in: ptz.zoom.in,
				out: ptz.zoom.out,
				speed: speedSlider(ptz.zoom.speed, booleans, numbers),
			}
			: undefined;
		const focusManual = booleans[ptz.focus.visible];
		const focusAuto = featureSignal(ptz.focus.autoFocus, booleans);
		const focusSpeed = speedSlider(ptz.focus.speed, booleans, numbers);
		const focus = (focusManual || focusAuto || focusSpeed)
			? {
				...(focusManual ? { near: ptz.focus.in, far: ptz.focus.out } : {}),
				...(focusAuto ? { automatic: focusAuto } : {}),
				...(focusSpeed ? { speed: focusSpeed } : {}),
			}
			: undefined;
		const home = featureSignal(ptz.home, booleans);

		if (pan || tilt || pantilt || zoom || home || focus) {
			list.push({ ...PTZCard({ pan, tilt, pantilt, zoom, home, focus }), pin: 2 });
		}
	}

	if (manualActive && manualVisible && isVisible(booleans, c.manual.preset)) {
		const pre = c.manual.preset;
		list.push({
			...PresetCard({
				select: {
					signal: pre.select.interaction,
					options: labelOptions(pre.select.presets, strings),
					presetLabelSignals: pre.select.presets.map((p) => p.label),
				},
				activate: featureSignal(pre.activate, booleans),
				create: featureSignal(pre.create, booleans),
				update: featureSignal(pre.update, booleans),
				delete: featureSignal(pre.delete, booleans),
			}),
			pin: 7,
		});
	}

	if (isVisible(booleans, c.selfview)) {
		const sv = c.selfview;
		list.push({
			...SelfviewCard({
				signal: sv.interaction,
				location: booleans[sv.location.visible]
					? {
						select: {
							signal: sv.location.select.interaction,
							options: labelOptions(sv.location.select.locations, strings),
						},
					}
					: undefined,
				fullscreen: booleans[sv.fullscreen.visible]
					? { signal: sv.fullscreen.interaction }
					: undefined,
				mute: booleans[sv.mute.visible]
					? { signal: sv.mute.interaction }
					: undefined,
				monitor: booleans[sv.monitor.visible]
					? {
						select: {
							signal: sv.monitor.select.interaction,
							options: labelOptions(sv.monitor.select.monitors, strings),
						},
					}
					: undefined,
			}),
			pin: 9,
		});
	}

	if (isVisible(booleans, c.record)) {
		list.push({
			...buildToggleControlCard('Record', <FiberManualRecordIcon />, c.record.interaction, {
				activeFlashSx: recordActiveFlashSx,
				activeCardLabel: 'Recording',
				mutedIcon: <StopIcon />,
				unmutedIcon: <PlayIcon />,
				mutedLabel: 'Stop',
				unmutedLabel: 'Start',
			}),
			pin: 3,
		});
	}

	if (isVisible(booleans, c.livestream)) {
		list.push({
			...buildToggleControlCard('Livestream', <LiveTvIcon />, c.livestream.interaction, {
				activeFlashSx: recordActiveFlashSx,
				activeCardLabel: 'Livestreaming',
				mutedIcon: <StopIcon />,
				unmutedIcon: <PlayIcon />,
				mutedLabel: 'Stop',
				unmutedLabel: 'Start',
			}),
			pin: 4,
		});
	}

	return list;
}

// ── Component ────────────────────────────────────────────────────────────────

const CameraPage = React.forwardRef<PageHandle, {}>((_props, ref) => {
	useScopedSignalSubscription(cameraPageSignals);
	const booleans = useSignalBooleans(cameraPageSignals.booleans);
	const numbers = useSignalNumbers(cameraPageSignals.numbers);
	const strings = useSignalStrings(cameraPageSignals.strings);

	const cards = React.useMemo(
		() => buildCameraPageCards(booleans, numbers, strings),
		[booleans, numbers, strings],
	);

	return (
		<Page ref={ref} id='page-camera' label='Camera' icon={<CameraIcon />} cards={cards} />
	);
});
CameraPage.displayName = 'CameraPage';

export default CameraPage;
