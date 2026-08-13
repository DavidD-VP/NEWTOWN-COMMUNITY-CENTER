import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { WebXPanel } from './crestron/WebXPanel';

import { IdentifySystem } from './crestron/System';
import { IdentifyControlSystem } from './crestron/ControlSystem';

import { CrComLib } from './crestron/CrComLib';

import { ThemeWrapper } from './roomcontrols/component/ThemeWrapper';
import ConsoleNotificationOverlay from './roomcontrols/component/ConsoleNotificationOverlay';
import { isDebugConsoleNotificationsEnabled } from './store/debugLogStore';
import { installConsoleNotificationBridge } from './tools/consoleNotificationBridge';

if (isDebugConsoleNotificationsEnabled()) {
	installConsoleNotificationBridge();
}

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

const root = ReactDOM.createRoot(
	document.getElementById('root') as HTMLElement,
);

const system = IdentifySystem();
const controlSystem = IdentifyControlSystem();

if (system === undefined) {
	console.warn(
		`Failed to identify the system. Verify the URL query parameter "system" is provided and matches one of the .env VITE_SYSTEMS entries.`,
	);
} else {
	console.info(`System: ${system.name}`);
	console.info(`ipId: ${system.ipId}`);
}

if (controlSystem === undefined) {
	console.warn(
		`Failed to identify the control system. Verify the URL hostname matches one of the .env VITE_CONTROLSYSTEMS entries.`,
	);
	console.warn(`location: ${document.location.toString()} hostname: ${document.location.hostname}`);
} else {
	console.info(`Control System: ${controlSystem.hostname}`);
}

// Signal subscriptions now live with the components that use them:
//   • App.tsx subscribes the shell subset (standby, theme, autoPowerOff, lockScreen).
//   • Each lazy Page subscribes its own signal set on mount.
// There is no longer a bulk subscribe at boot.

root.render(
		<ThemeWrapper>
			<WebXPanel
				useWebXPanel={Boolean(import.meta.env.VITE_USEWEBXPANEL)}
				ConfigParams={{
					host: controlSystem?.hostname,
					authToken: controlSystem?.websocketToken,
					ipId: system?.ipId,
					port: 49200,
				}}
			></WebXPanel>
			<App />
			{isDebugConsoleNotificationsEnabled() ? (
				<ConsoleNotificationOverlay />
			) : null}
		</ThemeWrapper>
);
