import * as React from 'react';
import PhoneIcon from '@mui/icons-material/Phone';

import Page, { PageHandle } from '../Page';
import { CardProps } from '../../card/Card';
import CallTypeCard from '../../card/call/CallTypeCard';
import { buildCallChannelCards } from './buildCallChannelCards';

import {
	useScopedSignalSubscription,
	useSignalBooleans,
	useSignalNumbers,
	useSignalStrings,
} from '../../../crestron/CrComLib';

import { signalConfig, pageSignals, isVisible } from '../../../config/signals';
import type { CallChannelKey } from '../../../config/callChannelBlock';
import { useCallUiStore } from '../../../store/callUiStore';

export const callPageSignals = pageSignals.call;

/** Nav visibility: any card on either call channel would mount. */
export function buildCallPageCards(
	booleans: Record<string, boolean>,
	numbers: Record<string, number>,
	strings: Record<string, string>,
): CardProps[] {
	const video = signalConfig.call.video;
	const audio = signalConfig.call.audio;
	return [
		...buildCallChannelCards(video, 'video', booleans, numbers, strings),
		...buildCallChannelCards(audio, 'audio', booleans, numbers, strings),
	];
}

function resolveDefaultChannel(
	showVideo: boolean,
	showAudio: boolean,
): CallChannelKey {
	if (showVideo) return 'video';
	if (showAudio) return 'audio';
	return 'video';
}

const CallPage = React.forwardRef<PageHandle, {}>((_props, ref) => {
	useScopedSignalSubscription(callPageSignals);
	const booleans = useSignalBooleans(callPageSignals.booleans);
	const numbers = useSignalNumbers(callPageSignals.numbers);
	const strings = useSignalStrings(callPageSignals.strings);

	const video = signalConfig.call.video;
	const audio = signalConfig.call.audio;
	const videoTabGated = isVisible(booleans, video.tab);
	const audioTabGated = isVisible(booleans, audio.tab);
	const showVideoTab = videoTabGated || !audioTabGated;
	const showAudioTab = audioTabGated || !videoTabGated;
	const videoConnected = booleans[video.connected] ?? false;
	const audioConnected = booleans[audio.connected] ?? false;
	const videoIncoming = booleans[video.incomingCall.visible] ?? false;
	const audioIncoming = booleans[audio.incomingCall.visible] ?? false;

	const focusChannel = useCallUiStore((state) => state.focusChannel);
	const setFocusChannel = useCallUiStore((state) => state.setFocusChannel);

	const [activeChannel, setActiveChannel] = React.useState<CallChannelKey>(() =>
		resolveDefaultChannel(showVideoTab, showAudioTab),
	);

	const effectiveChannel = React.useMemo(() => {
		if (videoConnected) return 'video';
		if (audioConnected) return 'audio';
		if (activeChannel === 'video' && showVideoTab) return 'video';
		if (activeChannel === 'audio' && showAudioTab) return 'audio';
		return resolveDefaultChannel(showVideoTab, showAudioTab);
	}, [activeChannel, showVideoTab, showAudioTab, videoConnected, audioConnected]);

	React.useEffect(() => {
		if (focusChannel) {
			setActiveChannel(focusChannel);
			setFocusChannel(null);
		}
	}, [focusChannel, setFocusChannel]);

	const prevVideoConnectedRef = React.useRef(videoConnected);
	const prevAudioConnectedRef = React.useRef(audioConnected);
	const prevVideoIncomingRef = React.useRef(videoIncoming);
	const prevAudioIncomingRef = React.useRef(audioIncoming);

	React.useEffect(() => {
		const videoJustConnected = videoConnected && !prevVideoConnectedRef.current;
		const audioJustConnected = audioConnected && !prevAudioConnectedRef.current;
		const videoJustIncoming = videoIncoming && !prevVideoIncomingRef.current;
		const audioJustIncoming = audioIncoming && !prevAudioIncomingRef.current;

		if (videoJustConnected || (videoJustIncoming && !audioJustIncoming)) {
			setActiveChannel('video');
		} else if (audioJustConnected || audioJustIncoming) {
			setActiveChannel('audio');
		}

		prevVideoConnectedRef.current = videoConnected;
		prevAudioConnectedRef.current = audioConnected;
		prevVideoIncomingRef.current = videoIncoming;
		prevAudioIncomingRef.current = audioIncoming;
	}, [videoConnected, audioConnected, videoIncoming, audioIncoming]);

	const channelConfig = effectiveChannel === 'video' ? video : audio;
	const showCallTypeCard = showVideoTab && showAudioTab && !videoConnected && !audioConnected;
	const cards = React.useMemo(() => {
		const channelCards = buildCallChannelCards(
			channelConfig,
			effectiveChannel,
			booleans,
			numbers,
			strings,
		);
		if (showCallTypeCard) {
			return [
				CallTypeCard({
					value: effectiveChannel,
					onChange: setActiveChannel,
				}),
				...channelCards,
			];
		}
		return channelCards;
	}, [
		channelConfig,
		booleans,
		numbers,
		strings,
		showCallTypeCard,
		effectiveChannel,
	]);

	return (
		<Page
			ref={ref}
			id='page-call'
			label='Call'
			icon={<PhoneIcon />}
			cards={cards}
		/>
	);
});
CallPage.displayName = 'CallPage';

export default CallPage;
