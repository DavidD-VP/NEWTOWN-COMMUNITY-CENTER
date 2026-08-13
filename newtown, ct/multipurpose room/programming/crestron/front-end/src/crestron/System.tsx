export type System = {
	ipId: string;
	name?: string;
	hostname?: string;
	projectName?: string;
};

export function IdentifySystem(): System | undefined {
	let systems: Array<System> = [];
	try {
		systems = import.meta.env.VITE_SYSTEMS
			? JSON.parse(import.meta.env.VITE_SYSTEMS)
			: [];
	} catch (error) {
		console.error(
			`IdentifySystem() - JSON.parse(import.meta.env.VITE_SYSTEMS) ${error}`,
		);
	}

	const StaticSystem = systems.find(
		(system) =>
			system.projectName &&
			import.meta.env.VITE_STATIC_PROJECT_NAME &&
			system.projectName === import.meta.env.VITE_STATIC_PROJECT_NAME,
	);
	const UniversalSystem = systems.find(
		(system) =>
			(system.name &&
				system.name ===
					new URLSearchParams(document.location.search).get(
						'system',
					)) ||
			(system.hostname && system.hostname === document.location.hostname),
	);

	if (StaticSystem) {
		return StaticSystem;
	} else if (UniversalSystem) {
		return UniversalSystem;
	} else {
		return undefined;
	}
}
