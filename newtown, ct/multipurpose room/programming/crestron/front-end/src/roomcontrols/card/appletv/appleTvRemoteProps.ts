import type { AppleTvSelectCardProps } from './AppleTvSelectCard';

/**
 * Props bag built by AppleTvPage from visibility-gated button actions.
 * Each remote card reads only the keys it needs.
 */
export type AppleTvRemoteProps = {
	Select?: AppleTvSelectCardProps;
	CursorUp?: string;
	CursorDown?: string;
	CursorLeft?: string;
	CursorRight?: string;
	CursorEnter?: string;
	Menu?: string;
	PlayPause?: string;
	TrackNext?: string;
	TrackPrevious?: string;
	VolumeUp?: string;
	VolumeDown?: string;
};
