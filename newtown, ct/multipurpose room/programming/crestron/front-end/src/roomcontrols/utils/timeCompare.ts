export type CrestronTime = {
	hours: number;
	minutes: number;
	seconds: number;
};

/** Parse Crestron serial time: HHMMSS (6 digits) or legacy HHMM (4 digits, seconds = 0). */
export function parseCrestronTime(raw: string): CrestronTime | null {
	const trimmed = (raw ?? '').trim();
	const hhmmss = /^(\d{2})(\d{2})(\d{2})$/.exec(trimmed);
	if (hhmmss) {
		return {
			hours: Math.min(23, Math.max(0, parseInt(hhmmss[1], 10))),
			minutes: Math.min(59, Math.max(0, parseInt(hhmmss[2], 10))),
			seconds: Math.min(59, Math.max(0, parseInt(hhmmss[3], 10))),
		};
	}

	const hhmm = /^(\d{2})(\d{2})$/.exec(trimmed);
	if (hhmm) {
		return {
			hours: Math.min(23, Math.max(0, parseInt(hhmm[1], 10))),
			minutes: Math.min(59, Math.max(0, parseInt(hhmm[2], 10))),
			seconds: 0,
		};
	}

	return null;
}

/** Format hours, minutes, and seconds to HHMMSS. */
export function formatCrestronTime(hours: number, minutes: number, seconds: number): string {
	return `${String(hours).padStart(2, '0')}${String(minutes).padStart(2, '0')}${String(seconds).padStart(2, '0')}`;
}

/** Normalize any supported Crestron time string to HHMMSS. */
export function normalizeCrestronTime(raw: string): string | null {
	const parsed = parseCrestronTime(raw);
	if (!parsed) return null;
	return formatCrestronTime(parsed.hours, parsed.minutes, parsed.seconds);
}

export function secondsSinceMidnight(time: CrestronTime): number {
	return time.hours * 3600 + time.minutes * 60 + time.seconds;
}

export function secondsSinceMidnightFromString(raw: string): number | null {
	const parsed = parseCrestronTime(raw);
	if (!parsed) return null;
	return secondsSinceMidnight(parsed);
}

export const AUTO_POWER_OFF_WARNING_WINDOW_SECONDS = 5 * 60;

/** Signed seconds from system time until today's shutdown time. */
export function secondsUntilShutdownToday(
	nowTime: string,
	shutdownTime: string,
): number | null {
	const nowSec = secondsSinceMidnightFromString(nowTime);
	const shutdownSec = secondsSinceMidnightFromString(shutdownTime);
	if (nowSec === null || shutdownSec === null) return null;
	return shutdownSec - nowSec;
}

/** True when shutdown is between 0 and 5 minutes away (inclusive). */
export function isAutoPowerOffWarningWindow(
	nowTime: string,
	shutdownTime: string,
): boolean {
	const remaining = secondsUntilShutdownToday(nowTime, shutdownTime);
	if (remaining === null) return false;
	return remaining >= 0 && remaining <= AUTO_POWER_OFF_WARNING_WINDOW_SECONDS;
}

/** Non-negative seconds until trigger for countdown display. */
export function secondsUntilTrigger(nowTime: string, shutdownTime: string): number | null {
	const remaining = secondsUntilShutdownToday(nowTime, shutdownTime);
	if (remaining === null) return null;
	return Math.max(0, remaining);
}

export function formatCountdown(totalSeconds: number): string {
	const safe = Math.max(0, Math.floor(totalSeconds));
	const minutes = Math.floor(safe / 60);
	const seconds = safe % 60;
	return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

/** Minutes from now until trigger today (negative if shutdown already passed). */
export function minutesUntilTrigger(nowTime: string, triggerTime: string): number | null {
	const remaining = secondsUntilShutdownToday(nowTime, triggerTime);
	if (remaining === null) return null;
	return Math.floor(remaining / 60);
}

export function isWithinMinutes(
	nowTime: string,
	triggerTime: string,
	thresholdMinutes: number,
): boolean {
	const remaining = minutesUntilTrigger(nowTime, triggerTime);
	if (remaining === null) return false;
	return remaining <= thresholdMinutes;
}

/** Display string: "HH:MM AM/PM". */
export function formatHhmmDisplay(hours: number, minutes: number): string {
	const period = hours < 12 ? 'AM' : 'PM';
	const h12 = hours % 12 === 0 ? 12 : hours % 12;
	return `${String(h12).padStart(2, '0')}:${String(minutes).padStart(2, '0')} ${period}`;
}

export function formatHhmmStringDisplay(raw: string): string {
	const parsed = parseCrestronTime(raw);
	if (!parsed) return raw;
	return formatHhmmDisplay(parsed.hours, parsed.minutes);
}

/** @deprecated Use parseCrestronTime instead. */
export function parseHhmm(raw: string): { hours: number; minutes: number } | null {
	const parsed = parseCrestronTime(raw);
	if (!parsed) return null;
	return { hours: parsed.hours, minutes: parsed.minutes };
}
