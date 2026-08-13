import type { pageSignals } from './signals';
import type { CardProps } from '../roomcontrols/card/Card';

import { buildSharePageCards } from '../roomcontrols/page/share/SharePage';
import { buildAudioPageCards } from '../roomcontrols/page/audio/AudioPage';
import { buildCableTunerPageCards } from '../roomcontrols/page/cabletuner/CableTunerPage';
import { buildBluRayPageCards } from '../roomcontrols/page/bluray/BluRayPage';
import { buildAppleTvPageCards } from '../roomcontrols/page/appletv/AppleTvPage';
import { buildSettingsPageCards } from '../roomcontrols/page/settings/SettingsPage';
import { buildEnvironmentPageCards } from '../roomcontrols/page/environment/EnvironmentPage';
import { buildCameraPageCards } from '../roomcontrols/page/camera/CameraPage';
import { buildCallPageCards } from '../roomcontrols/page/call/CallPage';

export type NavPageKey = keyof typeof pageSignals;

type PageCardBuilder = (
	booleans: Record<string, boolean>,
	numbers: Record<string, number>,
	strings: Record<string, string>,
) => CardProps[];

const pageCardBuilders: Record<NavPageKey, PageCardBuilder> = {
	share: buildSharePageCards,
	audio: buildAudioPageCards,
	cabletuner: (booleans, _numbers, strings) => buildCableTunerPageCards(booleans, strings),
	bluray: (booleans, _numbers, strings) => buildBluRayPageCards(booleans, strings),
	appletv: (booleans, _numbers, strings) => buildAppleTvPageCards(booleans, strings),
	settings: (booleans, _numbers, strings) => buildSettingsPageCards(booleans, strings),
	environment: buildEnvironmentPageCards,
	camera: buildCameraPageCards,
	call: buildCallPageCards,
};

/** True when the page's card builder would mount at least one card. */
export function pageHasVisibleCards(
	page: NavPageKey,
	booleans: Record<string, boolean>,
	numbers: Record<string, number>,
	strings: Record<string, string>,
): boolean {
	return pageCardBuilders[page](booleans, numbers, strings).length > 0;
}
