import React from 'react';

import {
	Box,
	Card,
	CardActionArea,
	Typography,
} from '@mui/material';

import PhoneIcon from '@mui/icons-material/Phone';
import PersonIcon from '@mui/icons-material/Person';
import VideoCallIcon from '@mui/icons-material/VideoCall';
import EventIcon from '@mui/icons-material/Event';
import DialpadIcon from '@mui/icons-material/Dialpad';
import MenuBookIcon from '@mui/icons-material/MenuBook';

import {
	publishEvent,
	useSignalStore,
} from '../../../crestron/CrComLib';
import type { CallChannelConnectConfig } from '../../../config/signals';
import type { CallChannelKey } from '../../../config/callChannelBlock';
import { CardProps } from '../Card';
import CrestronButton from '../../component/CrestronButton';
import SelectCard from '../../component/SelectCard';
import { SelectListRefreshButton } from '../../component/SelectListToolbar';
import OverflowMarqueeText from '../../component/OverflowMarqueeText';
import TextKeyboardCard from '../../component/TextKeyboardCard';
import { type TextKeyboardVariant } from '../../component/TextKeyboardPopover';
import { usePageEditor } from '../../page/PageEditorContext';
import { ctBtn, CardButtonGroup } from '../ctCardStyles';
import {
	sxCardActive,
	sxCardBase,
	sxCardIcon,
	sxCardLabel,
	cardPaddingH,
	cardPaddingV,
	cardInnerGap,
	cardIconSize,
	sxCompoundCardInner,
	shadowActiveHover,
} from '../../theme/tokens';
import {
	connectBtnSx,
	connectCardHeaderSx,
	sxCardBtnGroupSlot,
} from '../../component/connectCardStyles';

const connectSelectCardHoverSx = {
	'&:hover': { boxShadow: shadowActiveHover },
} as const;

type CallContactCfg = CallChannelConnectConfig['contact']['contacts'][number];
type CallMeetingCfg = CallChannelConnectConfig['meeting']['meetings'][number];

function buildLabelOptions(
	labels: readonly string[],
	strings: Record<string, string>,
	icon: React.ReactNode,
) {
	return labels
		.map((labelJoin, index) => ({
			value: index + 1,
			label: (strings[labelJoin] ?? '').trim(),
			icon,
		}))
		.filter((o) => o.label.length > 0);
}

function buildContactOptions(
	contacts: readonly CallContactCfg[],
	strings: Record<string, string>,
) {
	return contacts
		.map((contact, index) => {
			const name = (strings[contact.label] ?? '').trim();
			const address = (strings[contact.address] ?? '').trim();
			const protocol = (strings[contact.protocol] ?? '').trim();
			const secondary = [address, protocol].filter(Boolean).join(' · ');
			return {
				value: index + 1,
				label: name,
				secondary: secondary || undefined,
				icon: <PersonIcon /> as React.ReactNode,
			};
		})
		.filter((o) => o.label.length > 0);
}

function buildMeetingOptions(
	meetings: readonly CallMeetingCfg[],
	strings: Record<string, string>,
) {
	return meetings.flatMap((meeting, index) => {
		const title = (strings[meeting.title] ?? '').trim();
		const organizer = (strings[meeting.organizer] ?? '').trim();
		const startTime = (strings[meeting.startTime] ?? '').trim();
		const endTime = (strings[meeting.endTime] ?? '').trim();
		const address = (strings[meeting.address] ?? '').trim();
		const protocol = (strings[meeting.protocol] ?? '').trim();
		const hasDetails = [title, organizer, startTime, endTime, address, protocol].some(Boolean);
		if (!hasDetails) {
			return [];
		}

		const timeRange = [startTime, endTime].filter(Boolean).join(' – ');
		const label = title || organizer || address || timeRange || protocol;
		const secondary = [timeRange, address, protocol]
			.filter((part) => part && part !== label)
			.join(' · ');
		return [{
			value: index + 1,
			label,
			secondary: secondary || undefined,
			icon: <EventIcon /> as React.ReactNode,
		}];
	});
}

function isMeetingJoinable(
	meeting: CallMeetingCfg | undefined,
	booleans: Record<string, boolean>,
): boolean {
	return meeting ? (booleans[meeting.joinable] ?? false) : false;
}

export const ConnectStringRow: React.FC<{
	title: string;
	cardIcon: React.ReactNode;
	stringSignal: string;
	emptyCaption?: string;
	keyboardTitle: string;
	maxLength?: number;
	keyboardVariant?: TextKeyboardVariant;
}> = ({
	title,
	cardIcon,
	stringSignal,
	emptyCaption = 'Tap to enter',
	keyboardTitle,
	maxLength = 128,
	keyboardVariant = 'text',
}) => {
	const currentValue = useSignalStore((s) => s.strings[stringSignal] ?? '');
	const pageEditor = usePageEditor();
	const hasValue = currentValue.trim().length > 0;

	const handleOpenKeyboard = React.useCallback(() => {
		if (!pageEditor) return;
		pageEditor.openPageEditor(
			<TextKeyboardCard
				stringSignal={stringSignal}
				initialValue={currentValue}
				title={keyboardTitle}
				maxLength={maxLength}
				variant={keyboardVariant}
				onClose={pageEditor.closePageEditor}
			/>,
		);
	}, [pageEditor, stringSignal, currentValue, keyboardTitle, maxLength, keyboardVariant]);

	return (
		<>
			<Card
				variant='outlined'
				sx={{
					...sxCardBase,
					flexDirection: 'column',
					...sxCardActive,
					...connectSelectCardHoverSx,
				}}
			>
				<CardActionArea
					component='div'
					onClick={handleOpenKeyboard}
					sx={{
						flex: 1,
						display: 'flex',
						flexDirection: 'row',
						alignItems: 'center',
						paddingTop: cardPaddingV,
						paddingBottom: cardPaddingV,
						paddingLeft: cardPaddingH,
						paddingRight: cardPaddingH,
						gap: cardInnerGap,
						width: '100%',
					}}
				>
					<Box
						sx={{
							'& .MuiSvgIcon-root': { fontSize: cardIconSize, color: '#fff' },
							display: 'flex',
							alignItems: 'center',
							flexShrink: 0,
						}}
					>
						{cardIcon}
					</Box>
					<Box
						sx={{
							display: 'flex',
							flexDirection: 'column',
							justifyContent: 'center',
							gap: '2px',
							flex: 1,
							minWidth: 0,
							width: '100%',
						}}
					>
						<Typography
							variant='body2'
							sx={{ fontWeight: 600, lineHeight: 1.2, color: '#fff' }}
							noWrap
						>
							{title}
						</Typography>
						<OverflowMarqueeText
							variant='caption'
							sx={{
								lineHeight: 1.1,
								fontWeight: hasValue ? 600 : 400,
								fontStyle: hasValue ? 'normal' : 'italic',
								color: 'rgba(255,255,255,0.9)',
							}}
						>
							{hasValue ? currentValue : emptyCaption}
						</OverflowMarqueeText>
					</Box>
				</CardActionArea>
			</Card>
		</>
	);
};

const DialPanel: React.FC<{ connect: CallChannelConnectConfig; channelKey: CallChannelKey }> = ({
	connect,
	channelKey,
}) => {
	const address = useSignalStore((s) => s.strings[connect.dial.address] ?? '');

	return (
		<>
			<Box sx={connectCardHeaderSx}>
				<Box sx={sxCardIcon}>
					<PhoneIcon />
				</Box>
				<Typography variant='body2' sx={{ ...sxCardLabel, flex: 1 }} noWrap>
					Dial Address
				</Typography>
				<CrestronButton
					signal={connect.dial.interaction}
					ButtonProps={{
						disabled: address.trim().length === 0,
						sx: connectBtnSx,
						children: ctBtn(<PhoneIcon />, 'Dial'),
					}}
				/>
			</Box>
			<ConnectStringRow
				title='Address'
				cardIcon={<DialpadIcon />}
				stringSignal={connect.dial.address}
				emptyCaption='Tap to enter address'
				keyboardTitle='Dial address'
				keyboardVariant={channelKey === 'audio' ? 'phone' : 'text'}
			/>
		</>
	);
};

const ContactPanel: React.FC<{
	connect: CallChannelConnectConfig;
	showGroup: boolean;
}> = ({ connect, showGroup }) => {
	const strings = useSignalStore((s) => s.strings);
	const selected = useSignalStore((s) => s.numbers[connect.contact.select] ?? 0);
	const groupLabels = connect.contact.group.groups.map((group) => group.label);
	const groupOptions = React.useMemo(
		() => buildLabelOptions(groupLabels, strings, <MenuBookIcon />),
		[groupLabels, strings],
	);
	const contactOptions = React.useMemo(
		() => buildContactOptions(connect.contact.contacts, strings),
		[connect.contact.contacts, strings],
	);
	const canCall = contactOptions.some((o) => o.value === selected);

	return (
		<>
			<Box sx={connectCardHeaderSx}>
				<Box sx={sxCardIcon}>
					<PhoneIcon />
				</Box>
				<Typography variant='body2' sx={{ ...sxCardLabel, flex: 1 }} noWrap>
					Dial Contact
				</Typography>
				<Box
					onClick={(e) => e.stopPropagation()}
					onPointerDown={(e) => e.stopPropagation()}
					sx={sxCardBtnGroupSlot}
				>
					<CardButtonGroup>
						<SelectListRefreshButton
							visibleSignal={connect.contact.refresh.visible}
							interactionSignal={connect.contact.refresh.interaction}
							clearSearchSignal={connect.contact.search.query}
							resetSelectSignal={connect.contact.select}
							buttonSx={connectBtnSx}
						/>
						<CrestronButton
							signal={connect.contact.call}
							ButtonProps={{
								disabled: !canCall,
								sx: connectBtnSx,
								children: ctBtn(<PhoneIcon />, 'Dial'),
							}}
						/>
					</CardButtonGroup>
				</Box>
			</Box>
			{showGroup ? (
				<SelectCard
					signal={connect.contact.group.select}
					title='Contact Group'
					cardIcon={<MenuBookIcon />}
					options={groupOptions}
					optionType='group'
					disableSelect={groupOptions.length === 0}
					onSelect={() => publishEvent('number', connect.contact.select, 0)}
				/>
			) : null}
			<SelectCard
				signal={connect.contact.select}
				title='Contact'
				cardIcon={<PersonIcon />}
				options={contactOptions}
				optionType='contact'
				disableSelect={contactOptions.length === 0}
				listToolbar={{
					paging: {
						visibleSignal: connect.contact.paging.visible,
						prevSignal: connect.contact.paging.prev,
						nextSignal: connect.contact.paging.next,
						pageIndexSignal: connect.contact.paging.pageIndex,
						pageCountSignal: connect.contact.paging.pageCount,
						selectSignal: connect.contact.select,
					},
					search: {
						visibleSignal: connect.contact.search.visible,
						querySignal: connect.contact.search.query,
						placeholder: 'Search contacts',
					},
				}}
				renderSelectedCaption={(option) => (
					option.secondary ? `${option.label} · ${option.secondary}` : option.label
				)}
			/>
		</>
	);
};

const MeetingPanel: React.FC<{ connect: CallChannelConnectConfig }> = ({ connect }) => {
	const strings = useSignalStore((s) => s.strings);
	const booleans = useSignalStore((s) => s.booleans);
	const selected = useSignalStore((s) => s.numbers[connect.meeting.select] ?? 0);
	const meetingOptions = React.useMemo(
		() => buildMeetingOptions(connect.meeting.meetings, strings),
		[connect.meeting.meetings, strings],
	);
	const selectedMeeting = selected > 0 ? connect.meeting.meetings[selected - 1] : undefined;
	const canJoin = isMeetingJoinable(selectedMeeting, booleans);

	return (
		<>
			<Box sx={connectCardHeaderSx}>
				<Box sx={sxCardIcon}>
					<VideoCallIcon />
				</Box>
				<Typography variant='body2' sx={{ ...sxCardLabel, flex: 1 }} noWrap>
					Join Meeting
				</Typography>
				<CrestronButton
					signal={connect.meeting.join}
					ButtonProps={{
						disabled: !canJoin,
						sx: connectBtnSx,
						children: ctBtn(<VideoCallIcon />, 'Join'),
					}}
				/>
			</Box>
			<SelectCard
				signal={connect.meeting.select}
				title='Meeting'
				cardIcon={<EventIcon />}
				options={meetingOptions}
				optionType='meeting'
				disableSelect={meetingOptions.length === 0}
				listToolbar={{
					refresh: {
						visibleSignal: connect.meeting.refresh.visible,
						interactionSignal: connect.meeting.refresh.interaction,
					},
					paging: {
						visibleSignal: connect.meeting.paging.visible,
						prevSignal: connect.meeting.paging.prev,
						nextSignal: connect.meeting.paging.next,
						pageIndexSignal: connect.meeting.paging.pageIndex,
						pageCountSignal: connect.meeting.paging.pageCount,
						selectSignal: connect.meeting.select,
					},
					search: {
						visibleSignal: connect.meeting.search.visible,
						querySignal: connect.meeting.search.query,
						placeholder: 'Search meetings',
					},
				}}
				renderSelectedCaption={(option) => (
					option.secondary ? `${option.label} · ${option.secondary}` : option.label
				)}
			/>
		</>
	);
};

export type ConnectCardProps = {
	connect: CallChannelConnectConfig;
	channelKey: CallChannelKey;
	showDial: boolean;
	showContact: boolean;
	showContactGroup: boolean;
	showMeeting: boolean;
};

export function connectMethodCard(
	label: string,
	body: React.ReactNode,
): CardProps {
	return {
		label,
		MuiCardProps: {
			sx: {
				...sxCardBase,
				...sxCardActive,
				flexDirection: 'column',
				alignItems: 'stretch',
				height: 'auto',
				padding: 0,
			},
		},
		children: <Box sx={sxCompoundCardInner}>{body}</Box>,
	};
}

export function buildConnectCards(props: ConnectCardProps): CardProps[] {
	const cards: CardProps[] = [];

	if (props.showDial) {
		cards.push(connectMethodCard(
			'Dial Address',
			<DialPanel connect={props.connect} channelKey={props.channelKey} />,
		));
	}

	if (props.showContact) {
		cards.push(connectMethodCard(
			'Dial Contact',
			<ContactPanel connect={props.connect} showGroup={props.showContactGroup} />,
		));
	}

	if (props.showMeeting) {
		cards.push(connectMethodCard(
			'Join Meeting',
			<MeetingPanel connect={props.connect} />,
		));
	}

	return cards;
}

export default buildConnectCards;
