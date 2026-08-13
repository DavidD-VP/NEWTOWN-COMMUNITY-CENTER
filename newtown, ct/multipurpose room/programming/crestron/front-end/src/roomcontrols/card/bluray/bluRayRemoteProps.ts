import type { BluRaySelectCardProps } from './BluRaySelectCard';

/**
 * Props bag built by BluRayPage from visibility-gated button actions.
 * Each remote card reads only the keys it needs.
 */
export type BluRayRemoteProps = {
	Select?: BluRaySelectCardProps;
	Audio?: string;
	Subtitle?: string;
	Display?: string;
	Advanced?: string;
	CursorUp?: string;
	CursorDown?: string;
	CursorLeft?: string;
	CursorRight?: string;
	CursorEnter?: string;
	FunctionRed?: string;
	FunctionGreen?: string;
	FunctionYellow?: string;
	FunctionBlue?: string;
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
	HomeMenu?: string;
	TopMenu?: string;
	MainMenu?: string;
	PopupMenu?: string;
	Exit?: string;
	Options?: string;
	Play?: string;
	Pause?: string;
	Stop?: string;
	Reverse?: string;
	Forward?: string;
	Previous?: string;
	Next?: string;
	Eject?: string;
	Return?: string;
	Replay?: string;
	Favorites?: string;
	Theater?: string;
	PowerToggle?: string;
	VolumeUp?: string;
	VolumeDown?: string;
	VolumeMute?: string;
};
