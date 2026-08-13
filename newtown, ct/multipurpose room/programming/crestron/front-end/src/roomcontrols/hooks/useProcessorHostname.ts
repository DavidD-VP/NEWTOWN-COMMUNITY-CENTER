import * as React from 'react';

import { IdentifySystem } from '../../crestron/System';
import { IdentifyControlSystem } from '../../crestron/ControlSystem';

/** Processor hostname for resolving relative preview/asset URLs. */
export function useProcessorHostname(): string | undefined {
	return React.useMemo(() => {
		const system = IdentifySystem();
		const controlSystem = IdentifyControlSystem();
		return system?.hostname || controlSystem?.hostname;
	}, []);
}
