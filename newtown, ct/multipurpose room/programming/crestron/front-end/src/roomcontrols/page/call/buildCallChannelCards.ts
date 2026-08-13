import type { CallChannelConfig } from '../../../config/signals';
import type { CallChannelKey } from '../../../config/callChannelBlock';
import { isVisible } from '../../../config/signals';
import { CardProps } from '../../card/Card';
import buildConnectCards from '../../card/call/ConnectCard';
import ByodCard from '../../card/call/ByodCard';
import buildInCallCards from '../../card/call/InCallCard';
import buildInCallAudioCards from '../../card/call/InCallAudioCards';
import InCallDtmfCard from '../../card/call/InCallDtmfCard';
import { DestinationCard } from '../../card/share/DestinationCard';
import { buildInCallShareSources } from '../share/shareSourceHelpers';

export function buildCallChannelCards(
	channel: CallChannelConfig,
	channelKey: CallChannelKey,
	booleans: Record<string, boolean>,
	numbers: Record<string, number>,
	strings: Record<string, string>,
): CardProps[] {
	const list: CardProps[] = [];
	const conn = channel.connect;
	const connected = booleans[channel.connected] ?? false;
	const byodActive = booleans[conn.byod.interaction] ?? false;

	if (!connected && isVisible(booleans, conn.byod)) {
		const byodCard = ByodCard(conn.byod);
		if (byodCard) {
			list.push(byodCard);
		}
	}

	if (!connected && !byodActive && isVisible(booleans, conn.card)) {
		list.push(...buildConnectCards({
			connect: conn,
			channelKey,
			showDial: isVisible(booleans, conn.dial),
			showContact: isVisible(booleans, conn.contact),
			showContactGroup: isVisible(booleans, conn.contact.group),
			showMeeting: isVisible(booleans, conn.meeting),
		}));
	}

	if (connected && isVisible(booleans, channel.inCall.card)) {
		const ic = channel.inCall;
		list.push(...buildInCallAudioCards(ic, booleans, numbers, strings));
		list.push(...buildInCallCards({
			inCall: ic,
			showSelect: isVisible(booleans, ic.select),
			showHold: isVisible(booleans, ic.hold),
			showRecord: isVisible(booleans, ic.record),
			showMerge: isVisible(booleans, ic.merge),
			showTransfer: isVisible(booleans, ic.transfer),
			showEnd: isVisible(booleans, ic.end),
		}));

		if (isVisible(booleans, ic.dtmf)) {
			list.push(InCallDtmfCard({
				interactionSignal: ic.dtmf.interaction,
				tonesSignal: ic.dtmf.tones,
			}));
		}

		const share = ic.share;
		if (isVisible(booleans, share)) {
			const shareCard = DestinationCard({
				Type: 'Meeting',
				Label: 'Share to Call',
				Select: share.select.interaction,
				StopSharingWhenActive: true,
				Sources: buildInCallShareSources(
					share.select.sources,
					numbers,
					strings,
				),
			});
			list.push(shareCard);
		}
	}

	return list;
}
