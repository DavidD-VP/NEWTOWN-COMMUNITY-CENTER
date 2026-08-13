import * as React from 'react';
import { create } from 'zustand';
import { useShallow } from 'zustand/react/shallow';
import { useAppStore } from '../store/appStore';

//@ts-ignore
import { CrComLib } from '@crestron/ch5-crcomlib/build_bundles/cjs/cr-com-lib';

//@ts-ignore
window.CrComLib = CrComLib;
//@ts-ignore
window.bridgeReceiveIntegerFromNative = CrComLib.bridgeReceiveIntegerFromNative;
//@ts-ignore
window.bridgeReceiveBooleanFromNative = CrComLib.bridgeReceiveBooleanFromNative;
//@ts-ignore
window.bridgeReceiveStringFromNative = CrComLib.bridgeReceiveStringFromNative;
//@ts-ignore
window.bridgeReceiveObjectFromNative = CrComLib.bridgeReceiveObjectFromNative;

// ── Emulation loopback ──────────────────────────────────────────────────
// In emulation mode (no processor), signals published from the UI go
// nowhere.  This layer maintains its own callback registry: subscriber
// hooks register their setState functions here, and the publishEvent
// wrapper invokes them directly — bypassing bridgeReceive*FromNative
// (which requires an active transport and is unreliable offline).
//
// Boolean signals use toggle behavior: a rising edge (false→true) flips
// a stored latch, mimicking how a processor converts a momentary press
// into a latched feedback signal.  Analog and serial signals are echoed
// back directly.
// ─────────────────────────────────────────────────────────────────────────

type EmulationCallback = (value: unknown) => void;

/** Map<"boolean:250", Set<callback>> */
const emulationSubscribers = new Map<string, Set<EmulationCallback>>();
const emulatedBooleanStates = new Map<string, boolean>();

function emulationKey(signalType: string, signalName: string): string {
	return `${signalType}:${signalName}`;
}

/** Subscribe a callback for emulation loopback. Returns an unsubscribe fn. */
function emulationSubscribe(
	signalType: string,
	signalName: string,
	cb: EmulationCallback,
): () => void {
	const key = emulationKey(signalType, signalName);
	let set = emulationSubscribers.get(key);
	if (!set) {
		set = new Set();
		emulationSubscribers.set(key, set);
	}
	set.add(cb);
	return () => {
		set!.delete(cb);
		if (set!.size === 0) emulationSubscribers.delete(key);
	};
}

/** Notify all emulation subscribers for a given signal. */
function emulationNotify(
	signalType: string,
	signalName: string,
	value: unknown,
): void {
	const key = emulationKey(signalType, signalName);
	const set = emulationSubscribers.get(key);
	if (set) {
		set.forEach((cb) => cb(value));
	}
}

export function publishEvent(
	signalType: string,
	signalName: string,
	value: boolean | number | string,
): void {
	// Always call the real publishEvent (no-ops without a transport)
	CrComLib.publishEvent(signalType, signalName, value);

	// Only loop back when running in emulation mode
	const isEmulation = useAppStore.getState().emulation;
	if (!isEmulation) return;

	switch (signalType) {
		case 'boolean': {
			// Toggle on rising edge only (momentary press → latched state)
			if (value === true) {
				const current = emulatedBooleanStates.get(signalName) ?? false;
				const next = !current;
				emulatedBooleanStates.set(signalName, next);
				emulationNotify('boolean', signalName, next);

				// ── Emulation signal mapping rules ──
				// Rooms Combined (14) → combined state (6) = true
				if (signalName === '14' && next) {
					emulatedBooleanStates.set('6', true);
					emulationNotify('boolean', '6', true);
				}
				// Rooms Divided (13) → combined state (6) = false
				if (signalName === '13' && next) {
					emulatedBooleanStates.set('6', false);
					emulationNotify('boolean', '6', false);
				}
			}
			// Ignore falling edge (pointer-up) — the latched state persists
			break;
		}
		case 'number': {
			emulationNotify('number', signalName, value);
			break;
		}
		case 'string': {
			emulationNotify('string', signalName, value);
			break;
		}
	}
}

/** Publish a falling edge only when the boolean is currently high in the store. */
export function releaseBooleanIfHigh(signal: string): void {
	const isHigh = useSignalStore.getState().booleans[signal] ?? false;
	if (isHigh) {
		publishEvent('boolean', signal, false);
	}
}

// ── Signal Store ─────────────────────────────────────────────────────────────
// Holds all signal values as plain maps in a Zustand store.
// Components read from this store with a single selector — no per-signal hooks.
// Subscriptions are established once (outside React) via subscribeAllSignals().
// ─────────────────────────────────────────────────────────────────────────────

export type SignalStoreState = {
	booleans: Record<string, boolean>;
	numbers: Record<string, number>;
	strings: Record<string, string>;
};

export const useSignalStore = create<SignalStoreState>(() => ({
	booleans: {},
	numbers: {},
	strings: {},
}));

/** Unsubscribe functions returned by active CrComLib subscriptions. */
const activeSubscriptions: Array<() => void> = [];

// ── Signal update batching ────────────────────────────────────────────────────
// CrComLib fires all current signal values synchronously when subscribeState()
// is called. Subscribing to hundreds of signals causes hundreds of individual
// setState calls in rapid succession, each triggering a re-render and quickly
// hitting React's maximum update depth limit.
//
// Instead, we queue pending values and flush them together in a single
// setState call on the next event loop tick via setTimeout(0).  Any signals
// that arrive later (processor-driven updates) are naturally spaced out and
// flush on their own tick, so each processor update still applies promptly.
// ─────────────────────────────────────────────────────────────────────────────
let pendingBooleans: Record<string, boolean> = {};
let pendingNumbers: Record<string, number> = {};
let pendingStrings: Record<string, string> = {};
let flushScheduled = false;

function scheduleFlush(): void {
	if (flushScheduled) return;
	flushScheduled = true;
	setTimeout(() => {
		flushScheduled = false;
		const b = pendingBooleans;
		const n = pendingNumbers;
		const s = pendingStrings;
		pendingBooleans = {};
		pendingNumbers = {};
		pendingStrings = {};
		useSignalStore.setState((state) => ({
			booleans: Object.keys(b).length > 0 ? { ...state.booleans, ...b } : state.booleans,
			numbers: Object.keys(n).length > 0 ? { ...state.numbers, ...n } : state.numbers,
			strings: Object.keys(s).length > 0 ? { ...state.strings, ...s } : state.strings,
		}));
	}, 0);
}

export type SignalSubscriptionConfig = {
	booleans?: readonly string[];
	numbers?: readonly string[];
	strings?: readonly string[];
};

function subscribeOne(
	signalType: 'boolean' | 'number' | 'string',
	name: string,
): () => void {
	const id = CrComLib.subscribeState(signalType, name, (value: unknown) => {
		switch (signalType) {
			case 'boolean':
				pendingBooleans[name] = value as boolean;
				break;
			case 'number':
				pendingNumbers[name] = value as number;
				break;
			case 'string':
				pendingStrings[name] = value as string;
				break;
		}
		scheduleFlush();
	});
	const unsubEmulation = emulationSubscribe(signalType, name, (value) => {
		switch (signalType) {
			case 'boolean':
				pendingBooleans[name] = value as boolean;
				break;
			case 'number':
				pendingNumbers[name] = value as number;
				break;
			case 'string':
				pendingStrings[name] = value as string;
				break;
		}
		scheduleFlush();
	});
	return () => {
		CrComLib.unsubscribeState(signalType, name, id);
		unsubEmulation();
	};
}

/**
 * Additive subscription: creates a new set of CrComLib + emulation
 * subscribers for the given signal names and returns a single
 * unsubscribe function that tears down only this scope.
 *
 * Safe to call multiple times concurrently from different components
 * (e.g. each Page subscribes its own signals on mount).  CrComLib
 * supports multiple independent subscribers for the same signal.
 */
export function subscribeSignalsScoped(config: SignalSubscriptionConfig): () => void {
	const unsubs: Array<() => void> = [];

	for (const name of config.booleans ?? []) {
		unsubs.push(subscribeOne('boolean', name));
	}
	for (const name of config.numbers ?? []) {
		unsubs.push(subscribeOne('number', name));
	}
	for (const name of config.strings ?? []) {
		unsubs.push(subscribeOne('string', name));
	}

	return () => {
		for (const unsub of unsubs) unsub();
	};
}

/**
 * React hook: subscribes the given signal names on mount, unsubscribes
 * on unmount.  Pass a STABLE config (defined at module scope, or wrapped
 * in useMemo) so the effect doesn't re-run on every render.
 */
export function useScopedSignalSubscription(config: SignalSubscriptionConfig): void {
	React.useEffect(() => {
		return subscribeSignalsScoped(config);
	}, [config]);
}

/**
 * Subscribe to a list of signal names for each type. Pushes values directly
 * into the Zustand store so React components re-render via selectors.
 * Also wires up the emulation loopback for each signal.
 * Call once at app startup (e.g. in index.tsx) before rendering.
 *
 * NOTE: this is the legacy bulk-subscribe entry point used during the
 * transition to per-page subscriptions.  Each call replaces the previous
 * global subscription set.  Prefer `subscribeSignalsScoped` /
 * `useScopedSignalSubscription` for new code.
 */
export function subscribeSignals(config: {
	booleans?: string[];
	numbers?: string[];
	strings?: string[];
}): void {
	// Unsubscribe any previous global subscriptions (supports hot-reload)
	activeSubscriptions.forEach((unsub) => unsub());
	activeSubscriptions.length = 0;

	const teardown = subscribeSignalsScoped(config);
	activeSubscriptions.push(teardown);
}

/**
 * Convenience hook: returns the three signal maps.
 * Call once at the top of a component; then read values as plain properties.
 *
 * const { booleans, numbers, strings } = useSignals();
 * booleans['1']   // digital signal 1
 * numbers['5']    // analog signal 5
 * strings['611']  // serial signal 611
 */
export function withDefault<T>(record: Record<string, T>, defaultValue: T): Record<string, T> {
	return new Proxy(record, {
		get(target, key) {
			if (typeof key === 'string') {
				return key in target ? target[key] : defaultValue;
			}
			return (target as any)[key];
		},
	});
}

/**
 * Subscribes to a specific set of boolean signal keys with shallow equality.
 * App re-renders ONLY when one of the listed boolean values actually changes —
 * not on every boolean flush like the full-store subscription would.
 *
 * Missing keys return false.
 */
export function useSignalBooleans(keys: readonly string[]): Record<string, boolean> {
	return useSignalStore(
		useShallow((s) => {
			const result: Record<string, boolean> = {};
			for (const key of keys) {
				result[key] = s.booleans[key] ?? false;
			}
			return result;
		}),
	);
}

/**
 * Subscribes to a specific set of string signal keys with shallow equality.
 * App re-renders ONLY when one of the listed string values actually changes.
 *
 * Missing keys return ''.
 */
export function useSignalStrings(keys: readonly string[]): Record<string, string> {
	return useSignalStore(
		useShallow((s) => {
			const result: Record<string, string> = {};
			for (const key of keys) {
				result[key] = s.strings[key] ?? '';
			}
			return result;
		}),
	);
}

export function useSignalNumbers(keys: readonly string[]): Record<string, number> {
	return useSignalStore(
		useShallow((s) => {
			const result: Record<string, number> = {};
			for (const key of keys) {
				result[key] = s.numbers[key] ?? 0;
			}
			return result;
		}),
	);
}

export function useSignals(): SignalStoreState {
	// Subscribe reactively to booleans only — booleans drive page visibility and
	// feature flags, so App must re-render when they change.
	//
	// Numbers and strings are read non-reactively via getState(): in App.tsx they
	// are static config values (destination types, labels, slider min/max) that
	// are delivered once at system startup and do not change during operation.
	// Leaf components (CrestronSlider, AudioDeviceCard, etc.) that need live
	// number/string values subscribe to the store directly with granular selectors.
	// This prevents App from re-rendering on every volume-slider tick or label
	// update, which was the main cause of button-feedback lag on touch panels.
	const booleans = useSignalStore((s) => s.booleans);
	const { numbers, strings } = useSignalStore.getState();
	return {
		booleans: withDefault(booleans, false),
		numbers: withDefault(numbers, 0),
		strings: withDefault(strings, ''),
	};
}

export declare interface IBaseState<T> {
	value: T;
}

export declare interface IBaseEventAction<T> {
	setValue: (value: T) => void;
}
export declare interface IBaseSignal<TState, TAction> {
	state: TState;
	action: TAction;
}

export declare type StateCallback<T> = (value: T, signalName?: string) => void;

export type CrestronPublish<T extends number | string | boolean> = {
	signalType: 'number' | 'string' | 'boolean';
	signalName: string;
};

export function useCrestronPublish<T extends number | string | boolean>(
	signalType: 'number' | 'string' | 'boolean',
	signalName: string,
): [IBaseEventAction<T>] {
	return [
		{
			setValue: (value: T) => {
				publishEvent(signalType, signalName, value);
			},
		},
	];
}

export function useCrestronSubscribe<T extends number | string | boolean>(
	signalType: 'number' | 'string' | 'boolean',
	signalName: string,
	callback?: StateCallback<T>,
): [IBaseState<T>] {
	const [state, setState] = React.useState<T>(
		(signalType === 'number'
			? 0
			: signalType === 'string'
				? ''
				: false) as T,
	);
	const callbackRef = React.useRef<StateCallback<T> | undefined>();

	React.useEffect(() => {
		callbackRef.current = callback;
	}, [callback]);

	React.useEffect(() => {
		const id = CrComLib.subscribeState(
			signalType,
			signalName,
			(value: T) => {
				setState(value);

				if (callbackRef.current) {
					callbackRef.current(value, signalName);
				}
			},
		);

		// Emulation loopback: also listen for values published locally
		const unsubEmulation = emulationSubscribe(
			signalType,
			signalName,
			(value) => {
				setState(value as T);
				if (callbackRef.current) {
					callbackRef.current(value as T, signalName);
				}
			},
		);

		return () => {
			CrComLib.unsubscribeState(signalType, signalName, id);
			unsubEmulation();
		};
	}, [signalType, signalName]);

	return [{ value: state }];
}

export function useCrestronSignal<T extends number | string | boolean>(
	signalType: 'number' | 'string' | 'boolean',
	signalName: string,
	callback?: StateCallback<T>,
): [IBaseSignal<IBaseState<T>, IBaseEventAction<T>>] {
	const [state] = useCrestronSubscribe(signalType, signalName, callback);
	const [action] = useCrestronPublish(signalType, signalName);
	return [{ state, action }];
}

export type CrestronSignalName<T extends boolean | number | string> = string;

export type CrestronSignal<T extends boolean | number | string> = {
	name: CrestronSignalName<T>;
	callback?: StateCallback<T>;
};

export function useCrestronDigitalPublish(
	signalName: CrestronSignalName<boolean>,
): [IBaseEventAction<boolean>] {
	return [
		{
			setValue: (value: boolean) =>
				publishEvent('boolean', signalName, value),
		},
	];
}

export function useCrestronDigitalSubscribe(
	signal: CrestronSignal<boolean>,
): [IBaseState<boolean>] {
	const [state, setState] = React.useState<boolean>(false);
	const callbackRef = React.useRef<StateCallback<boolean> | undefined>();

	React.useEffect(() => {
		callbackRef.current = signal.callback;
	}, [signal.callback]);

	React.useEffect(() => {
		const id = CrComLib.subscribeState(
			'boolean',
			signal.name,
			(value: boolean) => {
				setState(value);

				if (callbackRef.current) {
					callbackRef.current(value, signal.name);
				}
			},
		);

		// Emulation loopback
		const unsubEmulation = emulationSubscribe(
			'boolean',
			signal.name,
			(value) => {
				setState(value as boolean);
				if (callbackRef.current) {
					callbackRef.current(value as boolean, signal.name);
				}
			},
		);

		return () => {
			CrComLib.unsubscribeState('boolean', signal.name, id);
			unsubEmulation();
		};
	}, ['boolean', signal.name]);

	return [{ value: state }];
}

export function useCrestronDigitalSignal(
	signal: CrestronSignal<boolean>,
): [IBaseSignal<IBaseState<boolean>, IBaseEventAction<boolean>>] {
	const [state] = useCrestronDigitalSubscribe(signal);
	const [action] = useCrestronDigitalPublish(signal.name);
	return [{ state, action }];
}

export function useCrestronAnalogPublish(
	signalName: CrestronSignalName<number>,
): [IBaseEventAction<number>] {
	return [
		{
			setValue: (value: number) =>
				publishEvent('number', signalName, value),
		},
	];
}

export function useCrestronAnalogSubscribe(
	signal: CrestronSignal<number>,
): [IBaseState<number>] {
	const [state, setState] = React.useState<number>(0);
	const callbackRef = React.useRef<StateCallback<number> | undefined>();

	React.useEffect(() => {
		callbackRef.current = signal.callback;
	}, [signal.callback]);

	React.useEffect(() => {
		const id = CrComLib.subscribeState(
			'number',
			signal.name,
			(value: number) => {
				setState(value);

				if (callbackRef.current) {
					callbackRef.current(value, signal.name);
				}
			},
		);

		// Emulation loopback
		const unsubEmulation = emulationSubscribe(
			'number',
			signal.name,
			(value) => {
				setState(value as number);
				if (callbackRef.current) {
					callbackRef.current(value as number, signal.name);
				}
			},
		);

		return () => {
			CrComLib.unsubscribeState('number', signal.name, id);
			unsubEmulation();
		};
	}, ['number', signal.name]);

	return [{ value: state }];
}

export function useCrestronAnalogSignal(
	signal: CrestronSignal<number>,
): [IBaseSignal<IBaseState<number>, IBaseEventAction<number>>] {
	const [state] = useCrestronAnalogSubscribe(signal);
	const [action] = useCrestronAnalogPublish(signal.name);
	return [{ state, action }];
}

export function useCrestronSerialPublish(
	signalName: CrestronSignalName<string>,
): [IBaseEventAction<string>] {
	return [
		{
			setValue: (value: string) => {
				publishEvent('string', signalName, value);
			},
		},
	];
}

export function useCrestronSerialSubscribe(
	signal: CrestronSignal<string>,
): [IBaseState<string>] {
	const [state, setState] = React.useState<string>('');
	const callbackRef = React.useRef<StateCallback<string> | undefined>();

	React.useEffect(() => {
		callbackRef.current = signal.callback;
	}, [signal.callback]);

	React.useEffect(() => {
		const id = CrComLib.subscribeState(
			'string',
			signal.name,
			(value: string) => {
				setState(value);

				if (callbackRef.current) {
					callbackRef.current(value, signal.name);
				}
			},
		);

		// Emulation loopback
		const unsubEmulation = emulationSubscribe(
			'string',
			signal.name,
			(value) => {
				setState(value as string);
				if (callbackRef.current) {
					callbackRef.current(value as string, signal.name);
				}
			},
		);

		return () => {
			CrComLib.unsubscribeState('string', signal.name, id);
			unsubEmulation();
		};
	}, ['string', signal.name]);

	return [{ value: state }];
}

export function useCrestronSerialSignal(
	signal: CrestronSignal<string>,
): [IBaseSignal<IBaseState<string>, IBaseEventAction<string>>] {
	const [state] = useCrestronSerialSubscribe(signal);
	const [action] = useCrestronSerialPublish(signal.name);
	return [{ state, action }];
}

export { CrComLib };
