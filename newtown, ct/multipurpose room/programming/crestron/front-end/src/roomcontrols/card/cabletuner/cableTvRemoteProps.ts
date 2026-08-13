import type { CableTvSelectCardProps } from './CableTvSelectCard';

/**
 * Props bag built by CableTunerPage from visibility-gated button actions.
 * Each remote card reads only the keys it needs.
 */
export type CableTvRemoteProps = {
	Select?: CableTvSelectCardProps;
	PipPosition?: string;
	Apps?: string;
	ChannelDown?: string;
	ChannelUp?: string;
	CursorDown?: string;
	CursorEnter?: string;
	CursorLeft?: string;
	CursorRight?: string;
	CursorUp?: string;
	Digit0?: string;
	Digit1?: string;
	Digit2?: string;
	Digit3?: string;
	Digit4?: string;
	Digit5?: string;
	Digit6?: string;
	Digit7?: string;
	Digit8?: string;
	Digit9?: string;
	DvrMenu?: string;
	Enter?: string;
	Exit?: string;
	Favorite?: string;
	FormatScroll?: string;
	Forward?: string;
	FunctionBlue?: string;
	FunctionGreen?: string;
	FunctionRed?: string;
	FunctionYellow?: string;
	Guide?: string;
	Help?: string;
	Info?: string;
	Live?: string;
	MainMenu?: string;
	Options?: string;
	PageDown?: string;
	PageUp?: string;
	Pause?: string;
	Pip?: string;
	PipMenu?: string;
	PipSwap?: string;
	Play?: string;
	PowerOn?: string;
	PowerToggle?: string;
	PreviousChannel?: string;
	Record?: string;
	Replay?: string;
	Reverse?: string;
	Search?: string;
	Skip?: string;
	SystemInfo?: string;
	VideoOnDemand?: string;
	VolumeUp?: string;
	VolumeDown?: string;
	VolumeMute?: string;
	Stop?: string;
};
