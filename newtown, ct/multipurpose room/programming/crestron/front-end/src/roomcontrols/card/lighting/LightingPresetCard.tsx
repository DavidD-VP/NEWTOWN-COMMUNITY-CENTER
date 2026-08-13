import React from 'react';

import LightIcon from '@mui/icons-material/Light';

import { overlayButtonBg, overlayButtonBgHover, overlayButtonBorder, overlayButtonBorderHover, overlayButtonContainedBg, overlayButtonContainedBgHover, overlayButtonContainedColor } from '../../theme/tokens';

import {
	useSignalStore,
	publishEvent,
} from '../../../crestron/CrComLib';

import SelectCard from '../../component/SelectCard';
import { CardProps } from '../Card';
import {
	sxCircularOverlayBtn,
	circularBtnIconSize,
	colorPoweredOn,
} from '../../theme/tokens';

// ── Types ────────────────────────────────────────────────────────────

export type LightingPresetOption = {
	Value: number;
	Label: string;
	/** Optional icon shown in the selection list. Defaults to a bullet. */
	Icon?: React.ReactNode;
};

export type LightingPresetCardProps = {
	/** Available room states shown in the selection popup. */
	Options: LightingPresetOption[];
	/** Crestron number signal — read for current state value, published on select. */
	SelectSignal: string;
	/**
	 * Crestron boolean signal for automatic/manual mode.
	 * true  = automatic (system chooses state; selection popup is disabled).
	 * false = manual (user can change state via the popup).
	 * Pulsed on button press to toggle.
	 */
	ManualSignal?: string;
};

// GetLightingPresetIconType has moved to ./typeHelpers. It is intentionally
// NOT re-exported from here so this heavy card module stays out of
// App.tsx's static dep graph.

// ── Inner component (owns useSignalStore) ────────────────────────────

const LightingPresetCardInner: React.FC<LightingPresetCardProps> = (props) => {
	const isManual = useSignalStore((s) => props.ManualSignal ? s.booleans[props.ManualSignal] ?? false : false);

	const handleModeClick = React.useCallback(
		(e: React.MouseEvent) => {
			e.stopPropagation();
			if (props.ManualSignal) {
				publishEvent('boolean', props.ManualSignal, true);
				publishEvent('boolean', props.ManualSignal, false);
			}
		},
		[props.ManualSignal],
	);

	const options = React.useMemo(
		() =>
			props.Options.filter((s) => s.Label !== undefined && s.Label.length > 0).map((s) => ({
				value: s.Value,
				label: s.Label,
				icon: (s.Icon ?? <LightIcon />) as React.ReactNode,
			})),
		[props.Options],
	);

	return (
		<SelectCard
			signal={props.SelectSignal}
			title={'Lighting Presets'}
			cardIcon={<LightIcon />}
			options={options}
			optionType='preset'
			disableSelect={props.ManualSignal ? !isManual : undefined}
		/>
	);
};

// ── Public API ───────────────────────────────────────────────────────

const LightingPresetCard = (props: LightingPresetCardProps): CardProps => ({
	label: 'Lighting Presets',
	children: <LightingPresetCardInner {...props} />,
});

export default LightingPresetCard;
