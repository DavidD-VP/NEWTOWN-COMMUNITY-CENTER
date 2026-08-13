import React from 'react';
import { Box } from '@mui/material';

import { IdentifySystem } from './crestron/System';
import { IdentifyControlSystem } from './crestron/ControlSystem';

import {
	useScopedSignalSubscription,
	useSignalBooleans,
	useSignalNumbers,
	useSignalStrings,
} from './crestron/CrComLib';

import RoomControls from './roomcontrols/RoomControls';
import { OverlayOpenProvider } from './roomcontrols/component/OverlayOpenContext';
import { NavigationDismissProvider } from './roomcontrols/component/NavigationDismissContext';
import PowerDialog from './roomcontrols/component/dialogs/PowerDialog';
import HelpDialog from './roomcontrols/component/dialogs/HelpDialog';
import NextMeetingDialog from './roomcontrols/component/dialogs/NextMeetingDialog';
import CrestronStandbyScreen from './roomcontrols/component/CrestronStandbyScreen';
import { getThemeByCatalogIndex } from './roomcontrols/card/theme/themeOptions';

import {
	signalConfig,
	appShellSignals,
	navPageSignals,
} from './config/signals';
import { pageHasVisibleCards } from './config/pageNavVisibility';

import { isAutoPowerOffWarningWindow } from './roomcontrols/utils/timeCompare';
import { resolveLocalManualUrl } from './roomcontrols/utils/resolveLocalManualUrl';

import logo from './images/newtown_community_center_logo.png';

import ShareIcon from '@mui/icons-material/Share';
import AudiotrackIcon from '@mui/icons-material/Audiotrack';
import LiveTvIcon from '@mui/icons-material/LiveTv';
import AlbumIcon from '@mui/icons-material/Album';
import SettingsIcon from '@mui/icons-material/Settings';
import LandscapeIcon from '@mui/icons-material/Landscape';
import CameraIcon from '@mui/icons-material/Camera';

import CallNavIcon from './roomcontrols/component/CallNavIcon';
import AppleTvIcon from './roomcontrols/component/AppleTvIcon';
import type { PageHandle } from './roomcontrols/page/Page';

// ── Lazy page chunks ─────────────────────────────────────────────────────────
// Each lazy page now owns its own signal subscriptions (via
// useScopedSignalSubscription) and reads its own values from the Zustand
// store.  App.tsx no longer materializes a giant props tree on every
// signal change; it only re-renders when one of the small set of
// "visibility" signals below changes.
// ─────────────────────────────────────────────────────────────────────────────
const LazySharePage = React.lazy(
	() => import('./roomcontrols/page/share/SharePageLazy'),
);
const LazyAudioPage = React.lazy(
	() => import('./roomcontrols/page/audio/AudioPageLazy'),
);
const LazyCableTunerPage = React.lazy(
	() => import('./roomcontrols/page/cabletuner/CableTunerPageLazy'),
);
const LazyBluRayPage = React.lazy(
	() => import('./roomcontrols/page/bluray/BluRayPageLazy'),
);
const LazyAppleTvPage = React.lazy(
	() => import('./roomcontrols/page/appletv/AppleTvPageLazy'),
);
const LazySettingsPage = React.lazy(
	() => import('./roomcontrols/page/settings/SettingsPageLazy'),
);
const LazyEnvironmentPage = React.lazy(
	() => import('./roomcontrols/page/environment/EnvironmentPageLazy'),
);
const LazyCameraPage = React.lazy(
	() => import('./roomcontrols/page/camera/CameraPageLazy'),
);
const LazyCallPage = React.lazy(
	() => import('./roomcontrols/page/call/CallPageLazy'),
);

// Built once at module load: shell signals plus merged page signals for nav
// visibility (pageHasVisibleCards uses the same builders as each page).

const appSignals = (() => {
	const dedupe = (xs: readonly string[]) => Array.from(new Set(xs));
	return {
		booleans: dedupe([
			...appShellSignals.booleans,
			...navPageSignals.booleans,
		]),
		numbers: dedupe([
			...appShellSignals.numbers,
			...navPageSignals.numbers,
		]),
		strings: dedupe([
			...appShellSignals.strings,
			...navPageSignals.strings,
		]),
	};
})();

// ── Component ────────────────────────────────────────────────────────────────

const App = () => {

	const system = IdentifySystem();
	const controlSystem = IdentifyControlSystem();

	document.body.style.height = '100vh';
	const root = document.getElementById('root');
	if (root) {
		root.style.height = '100%';
	}

	useScopedSignalSubscription(appSignals);
	const booleans = useSignalBooleans(appSignals.booleans);
	const numbers = useSignalNumbers(appSignals.numbers);
	const strings = useSignalStrings(appSignals.strings);

	const { standby, theme, autoPowerOff, time, help, nextMeeting } = signalConfig;
	const callVideo = signalConfig.call.video;
	const callAudio = signalConfig.call.audio;

	const [warningTick, setWarningTick] = React.useState(0);

	React.useEffect(() => {
		const id = window.setInterval(() => setWarningTick((t) => t + 1), 1000);
		return () => window.clearInterval(id);
	}, []);

	const [warningDismissed, setWarningDismissed] = React.useState(false);

	const apoEnabled = booleans[autoPowerOff.enable] ?? false;
	const apoActive = booleans[autoPowerOff.active] ?? false;
	const offTime = strings[autoPowerOff.time] ?? '';
	const nowTime = strings[time.time] ?? '';

	const apoTimesValid = Boolean(nowTime.trim() && offTime.trim());
	const warningWindowOpen = React.useMemo(
		() => apoTimesValid && isAutoPowerOffWarningWindow(nowTime, offTime),
		[apoTimesValid, nowTime, offTime, warningTick],
	);

	const warningGate = Boolean(
		apoEnabled &&
		apoActive &&
		warningWindowOpen,
	);

	// Reset manual dismiss when outside the 0–5 minute warning window.
	React.useEffect(() => {
		if (!warningWindowOpen) {
			setWarningDismissed(false);
		}
	}, [warningWindowOpen, warningTick]);

	React.useEffect(() => {
		setWarningDismissed(false);
	}, [apoEnabled, apoActive, offTime]);

	const showAutoPowerOffWarning = warningGate && !warningDismissed;
	const standbyActive = booleans[standby.active] ?? false;

	React.useEffect(() => {
		if (standbyActive && showAutoPowerOffWarning) {
			setWarningDismissed(true);
		}
	}, [standbyActive, showAutoPowerOffWarning]);

	const incomingCallVideoVisible = booleans[callVideo.incomingCall.visible] ?? false;
	const incomingCallAudioVisible = booleans[callAudio.incomingCall.visible] ?? false;

	const shareVisible = pageHasVisibleCards('share', booleans, numbers, strings);
	const audioVisible = pageHasVisibleCards('audio', booleans, numbers, strings);
	const settingsVisible = pageHasVisibleCards('settings', booleans, numbers, strings);
	const ls = signalConfig.lockScreen;
	const cableTunerVisible = pageHasVisibleCards('cabletuner', booleans, numbers, strings);
	const bluRayVisible = pageHasVisibleCards('bluray', booleans, numbers, strings);
	const appleTvVisible = pageHasVisibleCards('appletv', booleans, numbers, strings);
	const environmentVisible = pageHasVisibleCards('environment', booleans, numbers, strings);
	const callVisible = pageHasVisibleCards('call', booleans, numbers, strings);
	const cameraVisible = pageHasVisibleCards('camera', booleans, numbers, strings);

	// PowerDialog contains useState/useEffect — it must be called unconditionally
	// on every render so React sees a consistent hook count.
	const powerDialog = PowerDialog({
		Confirm: standby.activate,
		Standby: booleans[standby.active],
	});

	const manualHostname = system?.hostname || controlSystem?.hostname;
	const rawLocalManualUrl = (strings[help.localURL] ?? '').trim();

	const helpDialog = HelpDialog({
		hostURL: (strings[help.hostURL] ?? '').trim(),
		localURL: resolveLocalManualUrl(rawLocalManualUrl, manualHostname),
		StandbyActive: booleans[standby.active],
	});

	const helpVisible =
		rawLocalManualUrl.length > 0 ||
		(strings[help.hostURL] ?? '').trim().length > 0;

	const nextMeetingVisible = booleans[nextMeeting.visible] ?? false;

	const nextMeetingDialog = NextMeetingDialog({
		title: strings[nextMeeting.title] ?? '',
		organizer: strings[nextMeeting.organizer] ?? '',
		address: strings[nextMeeting.address] ?? '',
		protocol: strings[nextMeeting.protocol] ?? '',
		startTime: strings[nextMeeting.startTime] ?? '',
		endTime: strings[nextMeeting.endTime] ?? '',
		join: nextMeeting.join,
		Standby: booleans[standby.active],
	});

	if (!system) {
		return (
			<Box
				sx={{
					backgroundColor: 'background.default',
					width: '100%',
					height: '100%',
					display: 'flex',
					justifyContent: 'center',
					alignItems: 'center',
				}}
			>
				Unknown System
			</Box>
		);
	}

	if (system.name !== 'mpr1' && system.name !== 'mpr2' && system.name !== 'mpr3') {
		return (
			<Box
				sx={{
					backgroundColor: 'background.default',
					width: '100%',
					height: '100%',
					display: 'flex',
					justifyContent: 'center',
					alignItems: 'center',
				}}
			>
				Unknown System
			</Box>
		);
	}

	return (
		<OverlayOpenProvider>
		<NavigationDismissProvider>
		<RoomControls
			Pages={[
				shareVisible ? {
					id: 'page-share',
					label: 'Share',
					icon: <ShareIcon />,
					render: (ref: React.Ref<PageHandle>) => <LazySharePage ref={ref} />,
				} : undefined,
				audioVisible ? {
					id: 'page-audio',
					label: 'Audio',
					icon: <AudiotrackIcon />,
					render: (ref: React.Ref<PageHandle>) => <LazyAudioPage ref={ref} />,
				} : undefined,
				cableTunerVisible ? {
					id: 'page-cabletuner',
					label: 'Cable TV',
					icon: <LiveTvIcon />,
					render: (ref: React.Ref<PageHandle>) => <LazyCableTunerPage ref={ref} />,
				} : undefined,
				callVisible ? {
					id: 'page-call',
					label: 'Call',
					icon: <CallNavIcon />,
					render: (ref: React.Ref<PageHandle>) => <LazyCallPage ref={ref} />,
				} : undefined,
				bluRayVisible ? {
					id: 'page-bluray',
					label: 'Blu-ray',
					icon: <AlbumIcon />,
					render: (ref: React.Ref<PageHandle>) => <LazyBluRayPage ref={ref} />,
				} : undefined,
				appleTvVisible ? {
					id: 'page-appletv',
					label: 'Apple TV',
					icon: <AppleTvIcon />,
					render: (ref: React.Ref<PageHandle>) => <LazyAppleTvPage ref={ref} />,
				} : undefined,
				settingsVisible ? {
					id: 'page-settings',
					label: 'Settings',
					icon: <SettingsIcon />,
					render: (ref: React.Ref<PageHandle>) => <LazySettingsPage ref={ref} />,
				} : undefined,
				environmentVisible ? {
					id: 'page-environment',
					label: 'Environment',
					icon: <LandscapeIcon />,
					render: (ref: React.Ref<PageHandle>) => <LazyEnvironmentPage ref={ref} />,
				} : undefined,
				cameraVisible ? {
					id: 'page-camera',
					label: 'Camera',
					icon: <CameraIcon />,
					render: (ref: React.Ref<PageHandle>) => <LazyCameraPage ref={ref} />,
				} : undefined,
			]}
			Dialogs={[
				...(booleans[standby.enable] ? [powerDialog] : []),
				...(helpVisible ? [helpDialog] : []),
				...(nextMeetingVisible ? [nextMeetingDialog] : []),
			]}
			Standby={
				booleans[standby.enable]
					? {
						enable: booleans[standby.enable],
						active: booleans[standby.active],
						screen: (
							<CrestronStandbyScreen
								img={strings[standby.image] || logo}
								signal={standby.deactivate}
							/>
						),
					}
					: undefined
			}
			Theme={getThemeByCatalogIndex(numbers[theme.select]) ?? undefined}
			Lock={
				booleans[standby.enable] &&
				booleans[standby.active] &&
				booleans[ls.enable] &&
				booleans[ls.active]
					? { locked: true, passwordSignal: ls.password }
					: undefined
			}
			AutoPowerOffWarning={
				apoTimesValid
					? {
						open: showAutoPowerOffWarning,
						onDismiss: () => setWarningDismissed(true),
						stayAwakeSignal: autoPowerOff.stayAwake,
						activateStandbySignal: autoPowerOff.activateStandby,
						nowTime: nowTime,
						offTime: offTime,
					}
					: undefined
			}
			IncomingCallVideo={{
				open: incomingCallVideoVisible,
				title: 'Incoming Video Call',
				zIndex: 9000,
				name: strings[callVideo.incomingCall.label] ?? '',
				address: strings[callVideo.incomingCall.address] ?? '',
				acceptSignal: callVideo.incomingCall.accept,
				rejectSignal: callVideo.incomingCall.reject,
			}}
			IncomingCallAudio={{
				open: incomingCallAudioVisible,
				title: 'Incoming Phone Call',
				zIndex: 9001,
				name: strings[callAudio.incomingCall.label] ?? '',
				address: strings[callAudio.incomingCall.address] ?? '',
				acceptSignal: callAudio.incomingCall.accept,
				rejectSignal: callAudio.incomingCall.reject,
			}}
		/>
		</NavigationDismissProvider>
		</OverlayOpenProvider>
	);
};

export default App;
