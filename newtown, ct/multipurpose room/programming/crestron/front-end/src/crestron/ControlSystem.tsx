export type ControlSystem = {
	crestronTouchpanel?: boolean;
	localhost?: boolean;
	hostname: string;
	websocketToken: string;
};

export function IdentifyControlSystem(): ControlSystem | undefined {
	let controlSystems: Array<ControlSystem> = [];
	try {
		controlSystems = import.meta.env.VITE_CONTROLSYSTEMS
			? JSON.parse(import.meta.env.VITE_CONTROLSYSTEMS)
			: [];
	} catch (error) {
		console.error(
			`IdentifyControlSystem() - JSON.parse(import.meta.env.VITE_CONTROLSYSTEMS) ${error}`,
		);
	}

	return controlSystems?.find(
		(cs) =>
			cs.hostname === document.location.hostname ||
			(document.location.hostname === 'localhost' && cs.localhost) ||
			(document.location.protocol === 'file:' && cs.crestronTouchpanel)
	);
}
