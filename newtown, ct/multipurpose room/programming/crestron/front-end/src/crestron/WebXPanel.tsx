import * as React from 'react';
import { useAppStore } from '../store/appStore';

import ZoomManager from './ZoomManager';

//@ts-ignore
import WebXPanel, { WebXPanelConfigParams } from '@crestron/ch5-webxpanel';

import useRunOnce from '../tools/useRunOnce';
import { isDebugConsoleNotificationsEnabled } from '../store/debugLogStore';

function CreateWebXPanel(props: {
	useWebXPanel: boolean;
	ConfigParams: Partial<WebXPanelConfigParams>;
}) {
	const emulation = useAppStore((state) => state.emulation);
	const setEmulation = useAppStore((state) => state.setEmulation);

	useRunOnce({
		fn: () => {
			const xpanel = WebXPanel(true);
			const zoom = new ZoomManager();
			const debugConsole = isDebugConsoleNotificationsEnabled();

			if (debugConsole) {
				xpanel.enableDebugging();
			} else {
				xpanel.disableDebugging();
			}

			if (props.useWebXPanel) {
				xpanel.WebXPanel.addEventListener(
					xpanel.WebXPanelEvents.CONNECT_CIP,
					() => {
						console.log('Crestron WebXPanel Online');
						setEmulation(false);
					},
				);

				xpanel.WebXPanel.addEventListener(
					xpanel.WebXPanelEvents.DISCONNECT_CIP,
					(event: { detail?: { reason?: string } }) => {
						console.log('Crestron WebXPanel Offline.');
						if (debugConsole && event.detail?.reason) {
							console.warn(
								'WebXPanel DISCONNECT_CIP:',
								event.detail.reason,
							);
						}
						// Only enable emulation loopback on disconnect if explicitly opted in via env
						if (import.meta.env.VITE_EMULATION === 'true') {
							setEmulation(true);
						}
					},
				);

				if (debugConsole) {
					const warnEvent = (
						label: string,
						event: { detail?: unknown },
					) => {
						console.warn(label, event.detail ?? '');
					};

					xpanel.WebXPanel.addEventListener(
						xpanel.WebXPanelEvents.AUTHENTICATION_FAILED,
						(event: { detail?: unknown }) =>
							warnEvent('WebXPanel AUTHENTICATION_FAILED', event),
					);
					xpanel.WebXPanel.addEventListener(
						xpanel.WebXPanelEvents.AUTHENTICATION_REQUIRED,
						(event: { detail?: unknown }) =>
							warnEvent('WebXPanel AUTHENTICATION_REQUIRED', event),
					);
					xpanel.WebXPanel.addEventListener(
						xpanel.WebXPanelEvents.ERROR_WS,
						(event: { detail?: unknown }) =>
							warnEvent('WebXPanel ERROR_WS', event),
					);
					xpanel.WebXPanel.addEventListener(
						xpanel.WebXPanelEvents.FETCH_TOKEN_FAILED,
						(event: { detail?: unknown }) =>
							warnEvent('WebXPanel FETCH_TOKEN_FAILED', event),
					);
					xpanel.WebXPanel.addEventListener(
						xpanel.WebXPanelEvents.NOT_AUTHORIZED,
						(event: { detail?: unknown }) =>
							warnEvent('WebXPanel NOT_AUTHORIZED', event),
					);
				}
			} else {
				// No WebXPanel connection — use emulation only if env says so
				if (import.meta.env.VITE_EMULATION === 'true') {
					setEmulation(true);
				}
			}

			if (props.useWebXPanel) {
				xpanel.WebXPanel.initialize(props.ConfigParams);
				zoom.initialize(xpanel);
			}
		},
	});

	return emulation ? <></> : <></>;
}

export { CreateWebXPanel as WebXPanel };
