/**
 * Helpers for the standard page-card gate contract (Crestron booleans).
 *
 * - `enable`   — feature armed in the program; behavior/chrome continues when true
 *                even if the card is hidden.
 * - `visible`  — sole gate for mounting the card on a page.
 *
 * Nav tabs: App shows a page when `pageHasVisibleCards` is true — lightweight
 * signal-gate checks in pageNavVisibility.ts (no card component imports).
 *
 * Per-control `*Visible` flags (e.g. `muteVisible`, `volumeVisible`) are control capabilities
 * on an already-mounted card — not card gates. Audio uses card `visible` + `*Visible` per control.
 */

/** Minimum shape for nav / page mount checks. */
export type VisibleGate = {
	visible: string;
};

export type CardGateSignals = VisibleGate & {
	enable: string;
};

export function isVisible(
	booleans: Record<string, boolean>,
	gate: VisibleGate,
): boolean {
	return booleans[gate.visible] ?? false;
}

export function isEnabled(
	booleans: Record<string, boolean>,
	gate: CardGateSignals,
): boolean {
	return booleans[gate.enable] ?? false;
}

/** True when any gate in the list has visible feedback high. */
export function anyVisible(
	booleans: Record<string, boolean>,
	gates: readonly VisibleGate[],
): boolean {
	return gates.some((g) => isVisible(booleans, g));
}
