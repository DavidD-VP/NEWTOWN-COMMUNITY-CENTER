import {
	type DebugLogLevel,
	useDebugLogStore,
} from '../store/debugLogStore';

const MAX_ARG_LENGTH = 2000;

function serializeArg(value: unknown): string {
	if (value === undefined) return 'undefined';
	if (value === null) return 'null';
	if (typeof value === 'string') {
		return value.length > MAX_ARG_LENGTH
			? `${value.slice(0, MAX_ARG_LENGTH)}…`
			: value;
	}
	if (typeof value === 'number' || typeof value === 'boolean') {
		return String(value);
	}
	try {
		const json = JSON.stringify(value);
		return json.length > MAX_ARG_LENGTH
			? `${json.slice(0, MAX_ARG_LENGTH)}…`
			: json;
	} catch {
		return String(value);
	}
}

function formatConsoleArgs(args: unknown[]): string {
	return args.map(serializeArg).join(' ');
}

type ConsoleMethod = 'log' | 'info' | 'warn' | 'error';

function patchConsoleMethod(level: ConsoleMethod) {
	const original = console[level].bind(console);

	console[level] = (...args: unknown[]) => {
		original(...args);
		useDebugLogStore.getState().pushLog(level as DebugLogLevel, formatConsoleArgs(args));
	};
}

let installed = false;

export function installConsoleNotificationBridge(): void {
	if (installed) return;
	installed = true;

	patchConsoleMethod('log');
	patchConsoleMethod('info');
	patchConsoleMethod('warn');
	patchConsoleMethod('error');
}
