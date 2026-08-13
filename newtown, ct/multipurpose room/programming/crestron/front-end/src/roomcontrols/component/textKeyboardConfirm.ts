import { publishEvent } from '../../crestron/CrComLib';

export type TextKeyboardConfirmProps = {
	stringSignal: string;
	confirmSignal?: string;
	onSet?: () => void;
	onConfirmDraft?: (value: string) => void;
};

export function confirmTextKeyboardValue(
	props: TextKeyboardConfirmProps,
	draft: string,
): void {
	if (props.onConfirmDraft) {
		props.onConfirmDraft(draft);
	} else {
		publishEvent('string', props.stringSignal, draft);
		if (props.confirmSignal) {
			publishEvent('boolean', props.confirmSignal, true);
			publishEvent('boolean', props.confirmSignal, false);
		}
	}
	props.onSet?.();
}
