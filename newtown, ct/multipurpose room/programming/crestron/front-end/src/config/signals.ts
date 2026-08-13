/**
 * Central Crestron signal map for this project.
 * ────────────────────────────────────────────────────────────────────────────
 *
 * `signalConfig` below is the **single editable source of truth** for every
 * Crestron signal name the UI subscribes to.  Every signal ID lives here as
 * a string literal — there is no `base + N` arithmetic anywhere outside
 * this file.  Re-targeting the UI at a new project amounts to editing the
 * IDs here.
 *
 * Each page module imports its slice and reads named fields directly:
 *   `signalConfig.audio.devices[i].mute.visible`
 *   `signalConfig.camera.manual.ptz.pan.left`
 *   ... etc.
 *
 * Three derived sets are also exported here (computed once at module
 * load) so consumers never recompute them per render:
 *   - `pageSignals.<page>`       — full subscription set each lazy page
 *                                  mounts via useScopedSignalSubscription.
 *   - `navPageSignals`            — merged pageSignals App.tsx subscribes to for nav-tab
 *                                  visibility (any card ready → tab shown).
 *   - `appShellSignals`          — standby / theme / autoPowerOff / lockScreen / help (App.tsx).
 *
 * Card gate contract (`enable` + `visible` on page-level cards):
 *   - `enable`  — feature armed; behavior/chrome continues when true even if hidden.
 *   - `visible` — sole gate for mounting the card on a page.
 * Remote buttons use `visible` the same way (include control when true).
 * Per-control `*Visible` (e.g. `muteVisible`) gates controls inside a mounted card only.
 *
 * Integrator checklist:
 * 1. Per UI card: drive `visible` for panel visibility and `enable` for armed state.
 * 2. Lock screen: top-level `enable` + `active` (PIN overlay); `deactivateStandby` from lock UI; settings card `interaction` (toggle) + `locked` (edit gate).
 * 3. Settings cards (theme, autoPowerOff, time, lockScreen): `locked` gates opening the edit UI (no lock button on card). Theme: `theme.options[i].disable` high removes that catalog entry from the picker; low/absent = available (indices 0–5 unchanged for `theme.select`).
 * 4. Auto power off: top-level `enable` + `active` + `stayAwake` + `activateStandby` + `time`; shell warning compares `time.time` (system clock) vs `autoPowerOff.time` using HHMMSS serials (legacy HHMM treated as HHMM00); `settings.autoPowerOff` adds card `visible`, `interaction` (toggle), `time`, `locked`. Integrator should publish `time.time` every second with live seconds; UI writes `autoPowerOff.time` as HHMM00 from the minute picker.
 * 5. Settings time: `settings.time` — card `visible` + HHMMSS serial (`time`, legacy HHMM accepted) + `locked`; no enable button.
 * 5. Access level: hide card with `visible`; `levels[]` serial labels (1-based `select`); `unlocked` / password gating.
 * 4. Audio devices: card `visible`; nested `mute` / `volume` / `battery` per diagram.
 * 6. Share: global `sources[]` (type, label, preview path serials 1701–1726); each card `visible`; `power` / `select` nested objects per diagram. Empty preview serial = no thumbnail; path is relative on processor/gateway (e.g. `preview/cam1.jpg`) or full `https://` URL for FFmpeg JPEG feeds. Routed previews render on destination/video-wall cells only (not in source picker).
 * 7. Help: serial `21` = local manual path/URL (same-window navigation); serial `22` = host manual URL (QR dialog). No enable gate — Help nav appears when either URL is non-empty; local wins when both are set. Navigation appends `returnUrl` for manual back button — see `docs/manual-html-generator-integration-guide.md`.
 * 8. Call: page `visible` gates the Call nav tab. Two fixed channels — `call.video` (codec/VC) and `call.audio` (phone/audio-only). Each channel has its own explicit join IDs in `callChannelBlock.ts`; edit those literals directly to retarget signals. Each channel has its own `connected`, `incomingCall`, idle `connect` (dial/contact/meeting/BYOD), and `inCall` stack; no call-device select. Tab visibility: `call.video.tab.visible` / `call.audio.tab.visible`. Incoming-call modals are independent per channel.
 * 9. Next meeting popup: `visible` shows nav + dialog when a next meeting exists; serials `title`, `organizer`, `address`, `protocol`, `startTime`, `endTime`; `join` momentary + feedback (highlighted when high). `joinable` is available for integrator logic but does not gate the popup Join button.
 * 10. Incoming call dialogs: per-channel `call.video.incomingCall` / `call.audio.incomingCall` — `visible` shows shell modal; serials `label`, `address`; `accept` / `reject` momentary interactions. Integrator clears each channel's `visible` when handled.
 * 11. Environment room state: select locked when `manual.interaction` feedback is low; `automatic` / `manual` interactions are mode buttons.
 */

import {
	callVideoChannel,
	callAudioChannel,
	type CallChannelConfig,
	type CallChannelKey,
} from './callChannelBlock';

export type { CardGateSignals, VisibleGate } from './cardGates';
export type { CallChannelConfig, CallChannelKey, CallChannelConnectConfig, CallChannelInCallConfig } from './callChannelBlock';
export { isVisible, isEnabled, anyVisible } from './cardGates';

// ─── Editable signal IDs ─────────────────────────────────────────────────────

export const signalConfig = {
	standby: {
		enable:     '1',
		active:     '2',
		activate:   '2',
		deactivate: '3',
		image:      '2',
	},

	theme: {
		select: '16',
		// When disable is high, the theme is omitted from the Settings theme picker (default: available).
		// Catalog index (theme.select analog) is unchanged — 0 Teams … 5 Google Meet Dark.
		options: [
			{ disable: '31' }, // Teams
			{ disable: '32' }, // Zoom Light
			{ disable: '33' }, // Zoom Dark
			{ disable: '34' }, // Monochrome
			{ disable: '35' }, // Google Meet Light
			{ disable: '36' }, // Google Meet Dark
		],
	},

	autoPowerOff: {
		enable:          '5',
		activateStandby: '2',
		active:          '7',
		stayAwake:       '7',
		time:            '8',
	},

	time: {
		time: '19',
	},

	lockScreen: {
		enable:            '10',
		active:            '12',
		deactivateStandby: '3',
		password:          '13',
	},

	help: {
		localURL: '21',
		hostURL:  '22',
	},

	nextMeeting: {
		visible: '2141',
		joinable: '2142',
		join: '2142',
		title: '2142',
		organizer: '2143',
		address: '2144',
		protocol: '2145',
		startTime: '2146',
		endTime: '2147',
	},

	share: {
		// Global source catalog (type + label). Destinations and video wall gate entries
		// via select.sources[i].visible booleans aligned to this array index.
		sources: [
			{ type: '1001', label: '1001', preview: '1441' },
			{ type: '1002', label: '1002', preview: '1442' },
			{ type: '1003', label: '1003', preview: '1443' },
			{ type: '1004', label: '1004', preview: '1444' },
			{ type: '1005', label: '1005', preview: '1445' },
			{ type: '1006', label: '1006', preview: '1446' },
			{ type: '1007', label: '1007', preview: '1447' },
			{ type: '1008', label: '1008', preview: '1448' },
			{ type: '1009', label: '1009', preview: '1449' },
			{ type: '1010', label: '1010', preview: '1450' },
			{ type: '1011', label: '1011', preview: '1451' },
			{ type: '1012', label: '1012', preview: '1452' },
			{ type: '1013', label: '1013', preview: '1453' },
			{ type: '1014', label: '1014', preview: '1454' },
			{ type: '1015', label: '1015', preview: '1455' },
			{ type: '1016', label: '1016', preview: '1456' },
			{ type: '1017', label: '1017', preview: '1457' },
			{ type: '1018', label: '1018', preview: '1458' },
			{ type: '1019', label: '1019', preview: '1459' },
			{ type: '1020', label: '1020', preview: '1460' },
			{ type: '1021', label: '1021', preview: '1461' },
			{ type: '1022', label: '1022', preview: '1462' },
			{ type: '1023', label: '1023', preview: '1463' },
			{ type: '1024', label: '1024', preview: '1464' },
			{ type: '1025', label: '1025', preview: '1465' },
			{ type: '1026', label: '1026', preview: '1466' },
		],

		destinations: [
			{ visible: '1031', type: '1031', label: '1031', power: { visible: '1033', interaction: '1034' }, select: { interaction: '1032', noSource: { visible: '1040' }, sources: [{ visible: '1041' }, { visible: '1042' }, { visible: '1043' }, { visible: '1044' }, { visible: '1045' }, { visible: '1046' }, { visible: '1047' }, { visible: '1048' }, { visible: '1049' }, { visible: '1050' }, { visible: '1051' }, { visible: '1052' }, { visible: '1053' }, { visible: '1054' }, { visible: '1055' }, { visible: '1056' }, { visible: '1057' }, { visible: '1058' }, { visible: '1059' }, { visible: '1060' }], disable: { visible: '1036', interaction: '1037' } } },
			{ visible: '1071', type: '1071', label: '1071', power: { visible: '1073', interaction: '1074' }, select: { interaction: '1072', noSource: { visible: '1080' }, sources: [{ visible: '1081' }, { visible: '1082' }, { visible: '1083' }, { visible: '1084' }, { visible: '1085' }, { visible: '1086' }, { visible: '1087' }, { visible: '1088' }, { visible: '1089' }, { visible: '1090' }, { visible: '1091' }, { visible: '1092' }, { visible: '1093' }, { visible: '1094' }, { visible: '1095' }, { visible: '1096' }, { visible: '1097' }, { visible: '1098' }, { visible: '1099' }, { visible: '1100' }], disable: { visible: '1076', interaction: '1077' } } },
			{ visible: '1111', type: '1111', label: '1111', power: { visible: '1113', interaction: '1114' }, select: { interaction: '1112', noSource: { visible: '1120' }, sources: [{ visible: '1121' }, { visible: '1122' }, { visible: '1123' }, { visible: '1124' }, { visible: '1125' }, { visible: '1126' }, { visible: '1127' }, { visible: '1128' }, { visible: '1129' }, { visible: '1130' }, { visible: '1131' }, { visible: '1132' }, { visible: '1133' }, { visible: '1134' }, { visible: '1135' }, { visible: '1136' }, { visible: '1137' }, { visible: '1138' }, { visible: '1139' }, { visible: '1140' }], disable: { visible: '1116', interaction: '1117' } } },
			{ visible: '1151', type: '1151', label: '1151', power: { visible: '1153', interaction: '1154' }, select: { interaction: '1152', noSource: { visible: '1160' }, sources: [{ visible: '1161' }, { visible: '1162' }, { visible: '1163' }, { visible: '1164' }, { visible: '1165' }, { visible: '1166' }, { visible: '1167' }, { visible: '1168' }, { visible: '1169' }, { visible: '1170' }, { visible: '1171' }, { visible: '1172' }, { visible: '1173' }, { visible: '1174' }, { visible: '1175' }, { visible: '1176' }, { visible: '1177' }, { visible: '1178' }, { visible: '1179' }, { visible: '1180' }], disable: { visible: '1156', interaction: '1157' } } },
			{ visible: '1191', type: '1191', label: '1191', power: { visible: '1193', interaction: '1194' }, select: { interaction: '1192', noSource: { visible: '1200' }, sources: [{ visible: '1201' }, { visible: '1202' }, { visible: '1203' }, { visible: '1204' }, { visible: '1205' }, { visible: '1206' }, { visible: '1207' }, { visible: '1208' }, { visible: '1209' }, { visible: '1210' }, { visible: '1211' }, { visible: '1212' }, { visible: '1213' }, { visible: '1214' }, { visible: '1215' }, { visible: '1216' }, { visible: '1217' }, { visible: '1218' }, { visible: '1219' }, { visible: '1220' }], disable: { visible: '1196', interaction: '1197' } } },
			{ visible: '1231', type: '1231', label: '1231', power: { visible: '1233', interaction: '1234' }, select: { interaction: '1232', noSource: { visible: '1240' }, sources: [{ visible: '1241' }, { visible: '1242' }, { visible: '1243' }, { visible: '1244' }, { visible: '1245' }, { visible: '1246' }, { visible: '1247' }, { visible: '1248' }, { visible: '1249' }, { visible: '1250' }, { visible: '1251' }, { visible: '1252' }, { visible: '1253' }, { visible: '1254' }, { visible: '1255' }, { visible: '1256' }, { visible: '1257' }, { visible: '1258' }, { visible: '1259' }, { visible: '1260' }], disable: { visible: '1236', interaction: '1237' } } },
			{ visible: '1271', type: '1271', label: '1271', power: { visible: '1273', interaction: '1274' }, select: { interaction: '1272', noSource: { visible: '1280' }, sources: [{ visible: '1281' }, { visible: '1282' }, { visible: '1283' }, { visible: '1284' }, { visible: '1285' }, { visible: '1286' }, { visible: '1287' }, { visible: '1288' }, { visible: '1289' }, { visible: '1290' }, { visible: '1291' }, { visible: '1292' }, { visible: '1293' }, { visible: '1294' }, { visible: '1295' }, { visible: '1296' }, { visible: '1297' }, { visible: '1298' }, { visible: '1299' }, { visible: '1300' }], disable: { visible: '1276', interaction: '1277' } } },
			{ visible: '1311', type: '1311', label: '1311', power: { visible: '1313', interaction: '1314' }, select: { interaction: '1312', noSource: { visible: '1320' }, sources: [{ visible: '1321' }, { visible: '1322' }, { visible: '1323' }, { visible: '1324' }, { visible: '1325' }, { visible: '1326' }, { visible: '1327' }, { visible: '1328' }, { visible: '1329' }, { visible: '1330' }, { visible: '1331' }, { visible: '1332' }, { visible: '1333' }, { visible: '1334' }, { visible: '1335' }, { visible: '1336' }, { visible: '1337' }, { visible: '1338' }, { visible: '1339' }, { visible: '1340' }], disable: { visible: '1316', interaction: '1317' } } },
			{ visible: '1351', type: '1351', label: '1351', power: { visible: '1353', interaction: '1354' }, select: { interaction: '1352', noSource: { visible: '1360' }, sources: [{ visible: '1361' }, { visible: '1362' }, { visible: '1363' }, { visible: '1364' }, { visible: '1365' }, { visible: '1366' }, { visible: '1367' }, { visible: '1368' }, { visible: '1369' }, { visible: '1370' }, { visible: '1371' }, { visible: '1372' }, { visible: '1373' }, { visible: '1374' }, { visible: '1375' }, { visible: '1376' }, { visible: '1377' }, { visible: '1378' }, { visible: '1379' }, { visible: '1380' }], disable: { visible: '1356', interaction: '1357' } } },
		],

		videoWall: {
			visible: '1391',
			label:   '1391',
			power:   { visible: '1393', interaction: '1394' },
			select:  {
				interaction: '1391',
				noSource:    { visible: '1400' },
				sources:     [
					{ visible: '1401' }, { visible: '1402' }, { visible: '1403' }, { visible: '1404' }, { visible: '1405' },
					{ visible: '1406' }, { visible: '1407' }, { visible: '1408' }, { visible: '1409' }, { visible: '1410' },
					{ visible: '1411' }, { visible: '1412' }, { visible: '1413' }, { visible: '1414' }, { visible: '1415' },
					{ visible: '1416' }, { visible: '1417' }, { visible: '1418' }, { visible: '1419' }, { visible: '1420' },
				],
				disable:     { visible: '1396', interaction: '1397' },
			},
			layout: {
				visible:     '1399',
				interaction: '1399',
				rows:        '1420',
				columns:     '1440',
				layouts: [
					{ label: '1401' },
					{ label: '1402' },
					{ label: '1403' },
					{ label: '1404' },
					{ label: '1405' },
					{ label: '1406' },
					{ label: '1407' },
					{ label: '1408' },
					{ label: '1409' },
				],
			},
			destinations: [
				{ label: '1421', row: '1421', column: '1141', height: '1461', width: '1481', select: { interaction: '1401', disable: { visible: '1431', interaction: '1451' } } },
				{ label: '1422', row: '1422', column: '1142', height: '1462', width: '1482', select: { interaction: '1402', disable: { visible: '1432', interaction: '1452' } } },
				{ label: '1423', row: '1423', column: '1143', height: '1463', width: '1483', select: { interaction: '1403', disable: { visible: '1433', interaction: '1453' } } },
				{ label: '1424', row: '1424', column: '1144', height: '1464', width: '1484', select: { interaction: '1404', disable: { visible: '1434', interaction: '1454' } } },
				{ label: '1425', row: '1425', column: '1145', height: '1465', width: '1485', select: { interaction: '1405', disable: { visible: '1435', interaction: '1455' } } },
				{ label: '1426', row: '1426', column: '1146', height: '1466', width: '1486', select: { interaction: '1406', disable: { visible: '1436', interaction: '1456' } } },
				{ label: '1427', row: '1427', column: '1147', height: '1467', width: '1487', select: { interaction: '1407', disable: { visible: '1437', interaction: '1457' } } },
				{ label: '1428', row: '1428', column: '1148', height: '1468', width: '1488', select: { interaction: '1408', disable: { visible: '1438', interaction: '1458' } } },
				{ label: '1429', row: '1429', column: '1149', height: '1469', width: '1489', select: { interaction: '1409', disable: { visible: '1439', interaction: '1459' } } },
				{ label: '1430', row: '1430', column: '1150', height: '1470', width: '1490', select: { interaction: '1410', disable: { visible: '1440', interaction: '1460' } } },
				{ label: '1431', row: '1431', column: '1151', height: '1471', width: '1491', select: { interaction: '1411', disable: { visible: '1441', interaction: '1461' } } },
				{ label: '1432', row: '1432', column: '1152', height: '1472', width: '1492', select: { interaction: '1412', disable: { visible: '1442', interaction: '1462' } } },
				{ label: '1433', row: '1433', column: '1153', height: '1473', width: '1493', select: { interaction: '1413', disable: { visible: '1443', interaction: '1463' } } },
				{ label: '1434', row: '1434', column: '1154', height: '1474', width: '1494', select: { interaction: '1414', disable: { visible: '1444', interaction: '1464' } } },
				{ label: '1435', row: '1435', column: '1155', height: '1475', width: '1495', select: { interaction: '1415', disable: { visible: '1445', interaction: '1465' } } },
				{ label: '1436', row: '1436', column: '1156', height: '1476', width: '1496', select: { interaction: '1416', disable: { visible: '1446', interaction: '1466' } } },
			],
		},
	},

	audio: {
		devices: [
			{ visible: '111', type: '111', label: '111', mute: { visible: '112', interaction: '113' }, volume: { visible: '115', interaction: '115', minimum: '116', maximum: '117' }, battery: { visible: '118', charging: '119', charge: '118' } },
			{ visible: '121', type: '121', label: '121', mute: { visible: '122', interaction: '123' }, volume: { visible: '125', interaction: '125', minimum: '126', maximum: '127' }, battery: { visible: '128', charging: '129', charge: '128' } },
			{ visible: '131', type: '131', label: '131', mute: { visible: '132', interaction: '133' }, volume: { visible: '135', interaction: '135', minimum: '136', maximum: '137' }, battery: { visible: '138', charging: '139', charge: '138' } },
			{ visible: '141', type: '141', label: '141', mute: { visible: '142', interaction: '143' }, volume: { visible: '145', interaction: '145', minimum: '146', maximum: '147' }, battery: { visible: '148', charging: '149', charge: '148' } },
			{ visible: '151', type: '151', label: '151', mute: { visible: '152', interaction: '153' }, volume: { visible: '155', interaction: '155', minimum: '156', maximum: '157' }, battery: { visible: '158', charging: '159', charge: '158' } },
			{ visible: '161', type: '161', label: '161', mute: { visible: '162', interaction: '163' }, volume: { visible: '165', interaction: '165', minimum: '166', maximum: '167' }, battery: { visible: '168', charging: '169', charge: '168' } },
			{ visible: '171', type: '171', label: '171', mute: { visible: '172', interaction: '173' }, volume: { visible: '175', interaction: '175', minimum: '176', maximum: '177' }, battery: { visible: '178', charging: '179', charge: '178' } },
			{ visible: '181', type: '181', label: '181', mute: { visible: '182', interaction: '183' }, volume: { visible: '185', interaction: '185', minimum: '186', maximum: '187' }, battery: { visible: '188', charging: '189', charge: '188' } },
			{ visible: '191', type: '191', label: '191', mute: { visible: '192', interaction: '193' }, volume: { visible: '195', interaction: '195', minimum: '196', maximum: '197' }, battery: { visible: '198', charging: '199', charge: '198' } },
		],
	},

	bluray: {
		select: {
			visible: '201',
			interaction: '301',
			devices: [
				{ label: '301' },
				{ label: '302' },
				{ label: '303' },
				{ label: '304' },
				{ label: '305' },
				{ label: '306' },
				{ label: '307' },
				{ label: '308' },
				{ label: '309' },
			],
		},
		buttons: [
			{ label: 'Advanced',       visible: '202', interaction: '302' },
			{ label: 'Audio',          visible: '203', interaction: '303' },
			{ label: 'CursorDown',     visible: '204', interaction: '304' },
			{ label: 'CursorEnter',    visible: '205', interaction: '305' },
			{ label: 'CursorLeft',     visible: '206', interaction: '306' },
			{ label: 'CursorRight',    visible: '207', interaction: '307' },
			{ label: 'CursorUp',       visible: '208', interaction: '308' },
			{ label: 'Digit0',         visible: '209', interaction: '309' },
			{ label: 'Digit1',         visible: '210', interaction: '310' },
			{ label: 'Digit2',         visible: '211', interaction: '311' },
			{ label: 'Digit3',         visible: '212', interaction: '312' },
			{ label: 'Digit4',         visible: '213', interaction: '313' },
			{ label: 'Digit5',         visible: '214', interaction: '314' },
			{ label: 'Digit6',         visible: '215', interaction: '315' },
			{ label: 'Digit7',         visible: '216', interaction: '316' },
			{ label: 'Digit8',         visible: '217', interaction: '317' },
			{ label: 'Digit9',         visible: '218', interaction: '318' },
			{ label: 'Display',        visible: '219', interaction: '319' },
			{ label: 'Exit',           visible: '220', interaction: '320' },
			{ label: 'Forward',        visible: '221', interaction: '321' },
			{ label: 'FunctionBlue',   visible: '222', interaction: '322' },
			{ label: 'FunctionGreen',  visible: '223', interaction: '323' },
			{ label: 'FunctionRed',    visible: '224', interaction: '324' },
			{ label: 'FunctionYellow', visible: '225', interaction: '325' },
			{ label: 'HomeMenu',       visible: '226', interaction: '326' },
			{ label: 'MainMenu',       visible: '227', interaction: '327' },
			{ label: 'Next',           visible: '228', interaction: '328' },
			{ label: 'Options',        visible: '229', interaction: '329' },
			{ label: 'Pause',          visible: '230', interaction: '330' },
			{ label: 'Play',           visible: '231', interaction: '331' },
			{ label: 'PopupMenu',      visible: '232', interaction: '332' },
			{ label: 'PowerToggle',    visible: '233', interaction: '333' },
			{ label: 'Previous',       visible: '234', interaction: '334' },
			{ label: 'Reverse',        visible: '235', interaction: '335' },
			{ label: 'Stop',           visible: '236', interaction: '336' },
			{ label: 'Subtitle',       visible: '237', interaction: '337' },
			{ label: 'TopMenu',        visible: '238', interaction: '338' },
			{ label: 'VolumeDown',     visible: '239', interaction: '339' },
			{ label: 'VolumeUp',       visible: '240', interaction: '340' },
			{ label: 'VolumeMute',     visible: '241', interaction: '341' },
			{ label: 'Eject',          visible: '242', interaction: '342' },
			{ label: 'Return',         visible: '243', interaction: '343' },
			{ label: 'Replay',         visible: '244', interaction: '344' },
			{ label: 'Favorites',      visible: '245', interaction: '345' },
			{ label: 'Theater',        visible: '246', interaction: '346' },
		],
	},

	appletv: {
		select: {
			visible: '1601',
			interaction: '1621',
			devices: [
				{ label: '1621' },
				{ label: '1622' },
				{ label: '1623' },
				{ label: '1624' },
				{ label: '1625' },
				{ label: '1626' },
				{ label: '1627' },
				{ label: '1628' },
				{ label: '1629' },
			],
		},
		buttons: [
			{ label: 'CursorUp',       visible: '1602', interaction: '1622' },
			{ label: 'CursorDown',     visible: '1603', interaction: '1623' },
			{ label: 'CursorLeft',     visible: '1604', interaction: '1624' },
			{ label: 'CursorRight',    visible: '1605', interaction: '1625' },
			{ label: 'CursorEnter',    visible: '1606', interaction: '1626' },
			{ label: 'Menu',           visible: '1607', interaction: '1627' },
			{ label: 'PlayPause',      visible: '1608', interaction: '1628' },
			{ label: 'TrackNext',      visible: '1609', interaction: '1629' },
			{ label: 'TrackPrevious',  visible: '1610', interaction: '1630' },
			{ label: 'VolumeUp',       visible: '1611', interaction: '1631' },
			{ label: 'VolumeDown',     visible: '1612', interaction: '1632' },
		],
	},

	cabletuner: {
		select: {
			visible: '401',
			interaction: '501',
			devices: [
				{ label: '501' },
				{ label: '502' },
				{ label: '503' },
				{ label: '504' },
				{ label: '505' },
				{ label: '506' },
				{ label: '507' },
				{ label: '508' },
				{ label: '509' },
			],
		},
		buttons: [
			{ label: 'Apps',            visible: '402', interaction: '502' },
			{ label: 'ChannelDown',     visible: '403', interaction: '503' },
			{ label: 'ChannelUp',       visible: '404', interaction: '504' },
			{ label: 'CursorDown',      visible: '405', interaction: '505' },
			{ label: 'CursorEnter',     visible: '406', interaction: '506' },
			{ label: 'CursorLeft',      visible: '407', interaction: '507' },
			{ label: 'CursorRight',     visible: '408', interaction: '508' },
			{ label: 'CursorUp',        visible: '409', interaction: '509' },
			{ label: 'Digit0',          visible: '410', interaction: '510' },
			{ label: 'Digit1',          visible: '411', interaction: '511' },
			{ label: 'Digit2',          visible: '412', interaction: '512' },
			{ label: 'Digit3',          visible: '413', interaction: '513' },
			{ label: 'Digit4',          visible: '414', interaction: '514' },
			{ label: 'Digit5',          visible: '415', interaction: '515' },
			{ label: 'Digit6',          visible: '416', interaction: '516' },
			{ label: 'Digit7',          visible: '417', interaction: '517' },
			{ label: 'Digit8',          visible: '418', interaction: '518' },
			{ label: 'Digit9',          visible: '419', interaction: '519' },
			{ label: 'DvrMenu',         visible: '420', interaction: '520' },
			{ label: 'Enter',           visible: '421', interaction: '521' },
			{ label: 'Exit',            visible: '422', interaction: '522' },
			{ label: 'Favorite',        visible: '423', interaction: '523' },
			{ label: 'FormatScroll',    visible: '424', interaction: '524' },
			{ label: 'Forward',         visible: '425', interaction: '525' },
			{ label: 'FunctionBlue',    visible: '426', interaction: '526' },
			{ label: 'FunctionGreen',   visible: '427', interaction: '527' },
			{ label: 'FunctionRed',     visible: '428', interaction: '528' },
			{ label: 'FunctionYellow',  visible: '429', interaction: '529' },
			{ label: 'Guide',           visible: '430', interaction: '530' },
			{ label: 'Help',            visible: '431', interaction: '531' },	
			{ label: 'Info', 			visible: '432', interaction: '532' },
			{ label: 'Live', 			visible: '433', interaction: '533' },
			{ label: 'MainMenu', 		visible: '434', interaction: '534' },
			{ label: 'Options', 		visible: '435', interaction: '535' },
			{ label: 'PageDown', 		visible: '436', interaction: '536' },
			{ label: 'PageUp', 			visible: '437', interaction: '537' },
			{ label: 'Pause', 			visible: '438', interaction: '538' },
			{ label: 'Pip', 			visible: '439', interaction: '539' },
			{ label: 'PipMenu', 		visible: '440', interaction: '540' },
			{ label: 'PipPosition', 	visible: '441', interaction: '541' },
			{ label: 'PipSwap', 		visible: '442', interaction: '542' },
			{ label: 'Play', 			visible: '443', interaction: '543' },
			{ label: 'PowerOn', 		visible: '444', interaction: '544' },
			{ label: 'PowerToggle', 	visible: '445', interaction: '545' },
			{ label: 'PreviousChannel', visible: '446', interaction: '546' },
			{ label: 'Record',          visible: '447', interaction: '547' },
			{ label: 'Replay',          visible: '448', interaction: '548' },
			{ label: 'Reverse',         visible: '449', interaction: '549' },
			{ label: 'Search',          visible: '450', interaction: '550' },
			{ label: 'Skip',            visible: '451', interaction: '551' },
			{ label: 'SystemInfo',      visible: '452', interaction: '552' },
			{ label: 'VideoOnDemand',   visible: '453', interaction: '553' },
			{ label: 'VolumeUp',        visible: '454', interaction: '554' },
			{ label: 'VolumeDown',      visible: '455', interaction: '555' },
			{ label: 'VolumeMute',      visible: '456', interaction: '556' },
		],
		preset: {
			visible: '580',
			select: {
				interaction: '580',
				presets: [
					{ label: '581', number: '581' },
					{ label: '582', number: '582' },
					{ label: '583', number: '583' },
					{ label: '584', number: '584' },
					{ label: '585', number: '585' },
					{ label: '586', number: '586' },
					{ label: '587', number: '587' },
					{ label: '588', number: '588' },
					{ label: '589', number: '589' },
				],
			},
			activate: { visible: '581', interaction: '582' },
			create:   { visible: '583', interaction: '584' },
			update:   { visible: '585', interaction: '586' },
			delete:   { visible: '587', interaction: '588' },
		},
	},

	settings: {
		// Shell: theme / autoPowerOff / lockScreen. Cards: visible + signals the card UI needs (same joins as shell).
		theme:        { visible: '15', locked: '16' },
		autoPowerOff: { visible: '6', interaction: '7', time: '8', locked: '8' },
		time:         { visible: '18', time: '19', locked: '19' },
		lockScreen:   { visible: '11', interaction: '12', password: '13', locked: '13' },
		accessLevel: {
			visible:  '970',
			select:   '971',
			password: '970',
			unlocked: '971',
			levels: [
				{ label: '971' },
				{ label: '972' },
				{ label: '973' },
				{ label: '974' },
				{ label: '975' },
				{ label: '976' },
				{ label: '977' },
				{ label: '978' },
				{ label: '979' },
			],
		},
		label: {
			visible: '1500',
			select: {
				interaction: '1500',
				// Each slot: label = display name serial, value = stored data serial (e.g. Phone Number / xxx-xxx-xxxx).
				labels: [
					{ label: '1501', value: '1551' },
					{ label: '1502', value: '1552' },
					{ label: '1503', value: '1553' },
					{ label: '1504', value: '1554' },
					{ label: '1505', value: '1555' },
					{ label: '1506', value: '1556' },
					{ label: '1507', value: '1557' },
					{ label: '1508', value: '1558' },
					{ label: '1509', value: '1559' },
					{ label: '1510', value: '1560' },
					{ label: '1511', value: '1561' },
					{ label: '1512', value: '1562' },
					{ label: '1513', value: '1563' },
					{ label: '1514', value: '1564' },
					{ label: '1515', value: '1565' },
					{ label: '1516', value: '1566' },
					{ label: '1517', value: '1567' },
					{ label: '1518', value: '1568' },
					{ label: '1519', value: '1569' },
					{ label: '1520', value: '1570' },
					{ label: '1521', value: '1571' },
					{ label: '1522', value: '1572' },
					{ label: '1523', value: '1573' },
					{ label: '1524', value: '1574' },
					{ label: '1525', value: '1575' },
					{ label: '1526', value: '1576' },
					{ label: '1527', value: '1577' },
					{ label: '1528', value: '1578' },
					{ label: '1529', value: '1579' },
					{ label: '1530', value: '1580' },
					{ label: '1531', value: '1581' },
					{ label: '1532', value: '1582' },
					{ label: '1533', value: '1583' },
					{ label: '1534', value: '1584' },
					{ label: '1535', value: '1585' },
					{ label: '1536', value: '1586' },
					{ label: '1537', value: '1587' },
					{ label: '1538', value: '1588' },
					{ label: '1539', value: '1589' },
					{ label: '1540', value: '1590' },
					{ label: '1541', value: '1591' },
					{ label: '1542', value: '1592' },
					{ label: '1543', value: '1593' },
					{ label: '1544', value: '1594' },
					{ label: '1545', value: '1595' },
					{ label: '1546', value: '1596' },
					{ label: '1547', value: '1597' },
					{ label: '1548', value: '1598' },
					{ label: '1549', value: '1599' },
				],
			},
			update: { visible: '1501' },
		},
		saveSettings: { visible: '980', interaction: '981' },
	},

	environment: {
		roomState: {
			visible: '600',
			interaction: '600',
			automatic: { visible: '603', interaction: '604' },
			manual: { visible: '601', interaction: '602' },
			states: [
				{ type: '601', label: '601' },
				{ type: '602', label: '602' },
				{ type: '603', label: '603' },
				{ type: '604', label: '604' },
				{ type: '605', label: '605' },
				{ type: '606', label: '606' },
				{ type: '607', label: '607' },
				{ type: '608', label: '608' },
				{ type: '609', label: '609' },
			],
		},
		privacyGlass: {
			visible: '701',
			interaction: '702',
		},
		lighting: [
			{ label: '611', visible: '611', mute: { visible: '612', interaction: '613' }, brightness: { visible: '614', interaction: '614', minimum: '615', maximum: '616' } },
			{ label: '621', visible: '621', mute: { visible: '622', interaction: '623' }, brightness: { visible: '624', interaction: '624', minimum: '625', maximum: '626' } },
			{ label: '631', visible: '631', mute: { visible: '632', interaction: '633' }, brightness: { visible: '634', interaction: '634', minimum: '635', maximum: '636' } },
			{ label: '641', visible: '641', mute: { visible: '642', interaction: '643' }, brightness: { visible: '644', interaction: '644', minimum: '645', maximum: '646' } },
			{ label: '651', visible: '651', mute: { visible: '652', interaction: '653' }, brightness: { visible: '654', interaction: '654', minimum: '655', maximum: '656' } },
			{ label: '661', visible: '661', mute: { visible: '662', interaction: '663' }, brightness: { visible: '664', interaction: '664', minimum: '665', maximum: '666' } },
			{ label: '671', visible: '671', mute: { visible: '672', interaction: '673' }, brightness: { visible: '674', interaction: '674', minimum: '675', maximum: '676' } },
			{ label: '681', visible: '681', mute: { visible: '682', interaction: '683' }, brightness: { visible: '684', interaction: '684', minimum: '685', maximum: '686' } },
			{ label: '691', visible: '691', mute: { visible: '692', interaction: '693' }, brightness: { visible: '694', interaction: '694', minimum: '695', maximum: '696' } },
		],
		shades: [
			{ label: '711', visible: '711', open: '712', close: '713', stop: '714' },
			{ label: '721', visible: '721', open: '722', close: '723', stop: '724' },
			{ label: '731', visible: '731', open: '732', close: '733', stop: '734' },
			{ label: '741', visible: '741', open: '742', close: '743', stop: '744' },
			{ label: '751', visible: '751', open: '752', close: '753', stop: '754' },
			{ label: '761', visible: '761', open: '762', close: '763', stop: '764' },
			{ label: '771', visible: '771', open: '772', close: '773', stop: '774' },
			{ label: '781', visible: '781', open: '782', close: '783', stop: '784' },
			{ label: '791', visible: '791', open: '792', close: '793', stop: '794' },
		],
	},

	camera: {
		automatic: {
			visible: '901',
			interaction: '902',
			mode: {
				visible: '905',
				interaction: '905',
				modes: [
					{ label: '901', preview: '911' },
					{ label: '902', preview: '912' },
					{ label: '903', preview: '913' },
					{ label: '904', preview: '914' },
					{ label: '905', preview: '915' },
					{ label: '906', preview: '916' },
					{ label: '907', preview: '917' },
					{ label: '908', preview: '918' },
					{ label: '909', preview: '919' },
				],
			},
			speakerTrack: {
				visible: '940',
				activeBehavior: '941',
				backgroundMode: { visible: '942', interaction: '943' },
				closeUp: { visible: '945', interaction: '946' },
				frames: { visible: '948', interaction: '949' },
				groupAndSpeaker: { visible: '951', interaction: '952' },
				viewLimits: { visible: '954', interaction: '955' },
				whiteboard: { visible: '957', interaction: '958' },
			},
		},
		manual: {
			visible: '801',
			interaction: '802',
			select: {
				visible: '805',
				interaction: '805',
				cameras: [
					{ label: '801' }, { label: '802' }, { label: '803' },
					{ label: '804' }, { label: '805' }, { label: '806' },
					{ label: '807' }, { label: '808' }, { label: '809' },
				],
			},
			ptz: {
				pan: {
					visible: '810', left: '811', right: '812',
					speed: { visible: '815', interaction: '815', minimum: '816', maximum: '817' },
				},
				tilt: {
					visible: '820', up: '821', down: '822',
					speed: { visible: '825', interaction: '825', minimum: '826', maximum: '827' },
				},
				panTilt: {
					visible: '830',
					upLeft: '831', upRight: '832', downLeft: '833', downRight: '834',
				},
				zoom: {
					visible: '840', in: '841', out: '842',
					speed: { visible: '845', interaction: '845', minimum: '846', maximum: '847' },
				},
				focus: {
					visible: '850', in: '851', out: '852',
					autoFocus: { visible: '860', interaction: '861' },
					speed: { visible: '855', interaction: '855', minimum: '856', maximum: '857' },
				},
				home: { visible: '865', interaction: '866' },
			},
			preset: {
				visible: '870',
				select: {
					interaction: '870',
					presets: [
						{ label: '861' }, { label: '862' }, { label: '863' },
						{ label: '864' }, { label: '865' }, { label: '866' },
						{ label: '867' }, { label: '868' }, { label: '869' },
						{ label: '870' }, { label: '871' }, { label: '872' },
						{ label: '873' }, { label: '874' }, { label: '875' },
						{ label: '876' }, { label: '877' }, { label: '878' },
						{ label: '879' }, { label: '880' }, { label: '881' },
						{ label: '882' }, { label: '883' }, { label: '884' },
						{ label: '885' }, { label: '886' }, { label: '887' },
						{ label: '888' }, { label: '889' }, { label: '890' },
						{ label: '891' }, { label: '892' }, { label: '893' },
						{ label: '894' }, { label: '895' },
					],
				},
				activate: { visible: '871', interaction: '872' },
				create:   { visible: '873', interaction: '874' },
				update:   { visible: '875', interaction: '876' },
				delete:   { visible: '877', interaction: '878' },
			},
		},
		selfview: {
			visible: '910',
			interaction: '911',
			mute: { visible: '916', interaction: '917' },
			fullscreen: { visible: '913', interaction: '914' },
			monitor: {
				visible: '920',
				select: {
					interaction: '920',
					monitors: [
						{ label: '921' }, { label: '922' }, { label: '923' },
						{ label: '924' }, { label: '925' }, { label: '926' },
						{ label: '927' }, { label: '928' }, { label: '929' },
					],
				},
			},
			location: {
				visible: '930',
				select: {
					interaction: '930',
					locations: [
						{ label: '931' }, { label: '932' }, { label: '933' },
						{ label: '934' }, { label: '935' }, { label: '936' },
						{ label: '937' }, { label: '938' }, { label: '939' },
					],
				},
			},
		},
		record:     { visible: '960', interaction: '961' },
		livestream: { visible: '963', interaction: '964' },
	},

	call: {
		page: { visible: '2001' },
		video: callVideoChannel,
		audio: callAudioChannel,
	},
};

// ─── Derived sets — do not edit by hand. ─────────────────────────────────────

/**
 * Subscription shape used by both the central derived sets below and by
 * each page's `useScopedSignalSubscription(...)` call.  All three arrays
 * are always present (possibly empty) so call sites can pass them straight
 * into `useSignalBooleans / Numbers / Strings` without `?? []` fallbacks.
 */
export type PageSignalConfig = {
	booleans: readonly string[];
	numbers: readonly string[];
	strings: readonly string[];
};

const dedupe = (xs: readonly string[]): string[] => Array.from(new Set(xs));

// ─── pageSignals: the full subscription set each page mounts on demand ──────

type SharePowerCfg = { visible: string; interaction: string };
type ShareSelectCfg = {
	interaction: string;
	noSource: { visible: string };
	sources: readonly { visible: string }[];
	disable: { visible: string; interaction: string };
};
type ShareCellSelectCfg = {
	interaction: string;
	disable: { visible: string; interaction: string };
};

function pushSharePower(booleans: string[], power: SharePowerCfg) {
	booleans.push(power.visible, power.interaction);
}

function pushShareCellSelect(booleans: string[], numbers: string[], select: ShareCellSelectCfg) {
	booleans.push(select.disable.visible, select.disable.interaction);
	numbers.push(select.interaction);
}

function pushShareSelect(booleans: string[], numbers: string[], select: ShareSelectCfg) {
	booleans.push(
		select.noSource.visible,
		select.disable.visible,
		select.disable.interaction,
		...select.sources.map((s) => s.visible),
	);
	numbers.push(select.interaction);
}

function pushInCallShareSelect(
	numbers: string[],
	strings: string[],
	select: {
		interaction: string;
		sources: readonly { type: string; label: string; preview: string }[];
	},
) {
	numbers.push(select.interaction, ...select.sources.map((s) => s.type));
	strings.push(
		...select.sources.flatMap((s) => [s.label, s.preview]),
	);
}

function buildSharePageSignals(): PageSignalConfig {
	const booleans: string[] = [];
	const numbers: string[] = [];
	const strings: string[] = [];
	const share = signalConfig.share;

	for (const src of share.sources) {
		numbers.push(src.type);
		strings.push(src.label, src.preview);
	}

	for (const d of share.destinations) {
		booleans.push(d.visible);
		pushSharePower(booleans, d.power);
		pushShareSelect(booleans, numbers, d.select);
		numbers.push(d.type);
		strings.push(d.label);
	}

	const vw = share.videoWall;
	booleans.push(vw.visible);
	pushSharePower(booleans, vw.power);
	pushShareSelect(booleans, numbers, vw.select);
	booleans.push(vw.layout.visible);
	numbers.push(vw.layout.interaction, vw.layout.rows, vw.layout.columns);
	strings.push(vw.label);
	for (const layout of vw.layout.layouts) strings.push(layout.label);

	for (const dest of vw.destinations) {
		pushShareCellSelect(booleans, numbers, dest.select);
		numbers.push(dest.row, dest.column, dest.height, dest.width);
		strings.push(dest.label);
	}

	return { booleans: dedupe(booleans), numbers: dedupe(numbers), strings: dedupe(strings) };
}

function buildAudioPageSignals(): PageSignalConfig {
	const booleans: string[] = [];
	const numbers: string[] = [];
	const strings: string[] = [];
	for (const d of signalConfig.audio.devices) {
		booleans.push(
			d.visible,
			d.mute.visible,
			d.volume.visible,
			d.battery.visible,
			d.mute.interaction,
			d.battery.charging,
		);
		numbers.push(
			d.type,
			d.volume.minimum,
			d.volume.maximum,
			d.volume.interaction,
			d.battery.charge,
		);
		strings.push(d.label);
	}
	return { booleans: dedupe(booleans), numbers: dedupe(numbers), strings: dedupe(strings) };
}

function buildCableTunerPageSignals(): PageSignalConfig {
	const ct = signalConfig.cabletuner;
	const pre = ct.preset;
	const booleans: string[] = [ct.select.visible];
	// Subscribe visible (gate) and interaction (publish + feedback) per button.
	for (const btn of ct.buttons) booleans.push(btn.visible, btn.interaction);
	if (pre) {
		booleans.push(
			pre.visible,
			pre.select.interaction,
			pre.activate.visible,
			pre.create.visible,
			pre.update.visible,
			pre.delete.visible,
		);
	}
	return {
		booleans: dedupe(booleans),
		numbers: pre
			? dedupe([
				ct.select.interaction,
				pre.select.interaction,
				...pre.select.presets.map((p) => p.number),
			])
			: [ct.select.interaction],
		strings: pre
			? dedupe([
				...ct.select.devices.map((d) => d.label),
				...pre.select.presets.map((p) => p.label),
			])
			: ct.select.devices.map((d) => d.label),
	};
}

function buildBluRayPageSignals(): PageSignalConfig {
	const br = signalConfig.bluray;
	const booleans: string[] = [br.select.visible];
	for (const btn of br.buttons) booleans.push(btn.visible, btn.interaction);
	return {
		booleans: dedupe(booleans),
		numbers: [br.select.interaction],
		strings: br.select.devices.map((d) => d.label),
	};
}

function buildAppleTvPageSignals(): PageSignalConfig {
	const atv = signalConfig.appletv;
	const booleans: string[] = [atv.select.visible];
	for (const btn of atv.buttons) booleans.push(btn.visible, btn.interaction);
	return {
		booleans: dedupe(booleans),
		numbers: [atv.select.interaction],
		strings: atv.select.devices.map((d) => d.label),
	};
}

function buildSettingsPageSignals(): PageSignalConfig {
	const s = signalConfig.settings;
	return {
		booleans: [
			s.theme.visible,
			s.theme.locked,
			...signalConfig.theme.options.map((o) => o.disable),
			s.autoPowerOff.visible,
			s.autoPowerOff.locked,
			signalConfig.autoPowerOff.enable,
			s.autoPowerOff.interaction,
			s.time.visible,
			s.time.locked,
			s.lockScreen.visible,
			s.lockScreen.locked,
			s.lockScreen.interaction,
			signalConfig.lockScreen.deactivateStandby,
			s.accessLevel.visible,
			s.accessLevel.unlocked,
			s.label.visible,
			s.label.update.visible,
			s.saveSettings.visible,
			s.saveSettings.interaction,
		],
		numbers:  [signalConfig.theme.select, s.accessLevel.select, s.label.select.interaction],
		strings:  [
			s.autoPowerOff.time,
			s.time.time,
			s.lockScreen.password,
			s.accessLevel.password,
			...s.accessLevel.levels.map((l) => l.label),
			...s.label.select.labels.flatMap((l) => [l.label, l.value]),
		],
	};
}

function buildEnvironmentPageSignals(): PageSignalConfig {
	const env = signalConfig.environment;
	const rs = env.roomState;
	const booleans: string[] = [
		rs.visible,
		rs.automatic.visible,
		rs.automatic.interaction,
		rs.manual.visible,
		rs.manual.interaction,
		env.privacyGlass.visible,
		env.privacyGlass.interaction,
	];
	const numbers: string[] = [rs.interaction];
	const strings: string[] = [];

	for (const st of rs.states) {
		numbers.push(st.type);
		strings.push(st.label);
	}
	for (const l of env.lighting) {
		booleans.push(
			l.visible,
			l.mute.visible,
			l.mute.interaction,
			l.brightness.visible,
			l.brightness.interaction,
		);
		numbers.push(l.brightness.minimum, l.brightness.maximum, l.brightness.interaction);
		strings.push(l.label);
	}
	for (const sh of env.shades) {
		booleans.push(sh.visible, sh.open, sh.close, sh.stop);
		strings.push(sh.label);
	}

	return { booleans: dedupe(booleans), numbers: dedupe(numbers), strings: dedupe(strings) };
}

type CameraSpeedCfg = {
	visible: string;
	interaction: string;
	minimum: string;
	maximum: string;
};

type CameraFeatureCfg = { visible: string; interaction: string };

function pushCameraSpeed(
	booleans: string[],
	numbers: string[],
	speed: CameraSpeedCfg,
) {
	booleans.push(speed.visible, speed.interaction);
	numbers.push(speed.minimum, speed.maximum, speed.interaction);
}

function pushCameraFeature(booleans: string[], f: CameraFeatureCfg) {
	booleans.push(f.visible, f.interaction);
}

function buildCameraPageSignals(): PageSignalConfig {
	const c = signalConfig.camera;
	const auto = c.automatic;
	const man = c.manual;
	const ptz = man.ptz;
	const pre = man.preset;
	const sv = c.selfview;
	const st = auto.speakerTrack;

	const booleans: string[] = [
		auto.visible,
		auto.interaction,
		auto.mode.visible,
		auto.mode.interaction,
		st.visible,
		man.visible,
		man.interaction,
		man.select.visible,
		ptz.pan.visible,
		ptz.tilt.visible,
		ptz.panTilt.visible,
		ptz.zoom.visible,
		ptz.focus.visible,
		ptz.home.visible,
		pre.visible,
		pre.activate.visible,
		pre.create.visible,
		pre.update.visible,
		pre.delete.visible,
		sv.visible,
		sv.mute.visible,
		sv.fullscreen.visible,
		sv.monitor.visible,
		sv.location.visible,
		ptz.pan.left,
		ptz.pan.right,
		ptz.tilt.up,
		ptz.tilt.down,
		ptz.panTilt.upLeft,
		ptz.panTilt.upRight,
		ptz.panTilt.downLeft,
		ptz.panTilt.downRight,
		ptz.zoom.in,
		ptz.zoom.out,
		ptz.focus.in,
		ptz.focus.out,
		sv.fullscreen.interaction,
		sv.interaction,
		c.record.visible,
		c.record.interaction,
		c.livestream.visible,
		c.livestream.interaction,
	];
	const numbers: string[] = [
		auto.mode.interaction,
		man.select.interaction,
		pre.select.interaction,
		sv.monitor.select.interaction,
		sv.location.select.interaction,
	];
	const strings: string[] = [];

	pushCameraSpeed(booleans, numbers, ptz.pan.speed);
	pushCameraSpeed(booleans, numbers, ptz.tilt.speed);
	pushCameraSpeed(booleans, numbers, ptz.zoom.speed);
	pushCameraSpeed(booleans, numbers, ptz.focus.speed);

	pushCameraFeature(booleans, ptz.focus.autoFocus);
	pushCameraFeature(booleans, ptz.home);
	pushCameraFeature(booleans, sv.mute);
	pushCameraFeature(booleans, pre.activate);
	pushCameraFeature(booleans, pre.create);
	pushCameraFeature(booleans, pre.update);
	pushCameraFeature(booleans, pre.delete);

	pushCameraFeature(booleans, st.backgroundMode);
	pushCameraFeature(booleans, st.closeUp);
	pushCameraFeature(booleans, st.frames);
	pushCameraFeature(booleans, st.groupAndSpeaker);
	pushCameraFeature(booleans, st.viewLimits);
	pushCameraFeature(booleans, st.whiteboard);

	for (const cam of man.select.cameras) strings.push(cam.label);
	for (const pr of pre.select.presets) strings.push(pr.label);
	for (const m of auto.mode.modes) {
		strings.push(m.label, m.preview);
	}
	strings.push(st.activeBehavior);
	for (const m of sv.monitor.select.monitors) strings.push(m.label);
	for (const loc of sv.location.select.locations) strings.push(loc.label);

	return { booleans: dedupe(booleans), numbers: dedupe(numbers), strings: dedupe(strings) };
}

function pushCallContactStrings(
	strings: string[],
	contacts: CallChannelConfig['connect']['contact']['contacts'],
) {
	for (const contact of contacts) {
		strings.push(contact.label, contact.address, contact.protocol);
	}
}

function pushCallMeetingSignals(
	booleans: string[],
	strings: string[],
	meetings: CallChannelConfig['connect']['meeting']['meetings'],
) {
	for (const meeting of meetings) {
		booleans.push(meeting.joinable);
		strings.push(
			meeting.title,
			meeting.organizer,
			meeting.address,
			meeting.protocol,
			meeting.startTime,
			meeting.endTime,
		);
	}
}

function pushInCallCallSlotStrings(
	strings: string[],
	calls: readonly { label: string; address: string }[],
) {
	for (const call of calls) {
		strings.push(call.label, call.address);
	}
}

function pushInCallAudio(
	booleans: string[],
	numbers: string[],
	device: CallChannelConfig['inCall']['audio'],
) {
	booleans.push(
		device.visible,
		device.mute.visible,
		device.mute.interaction,
		device.volume.visible,
	);
	numbers.push(
		device.volume.minimum,
		device.volume.maximum,
		device.volume.interaction,
	);
}

function mergePageSignals(...configs: PageSignalConfig[]): PageSignalConfig {
	const booleans: string[] = [];
	const numbers: string[] = [];
	const strings: string[] = [];
	for (const config of configs) {
		booleans.push(...config.booleans);
		numbers.push(...config.numbers);
		strings.push(...config.strings);
	}
	return {
		booleans: dedupe(booleans),
		numbers: dedupe(numbers),
		strings: dedupe(strings),
	};
}

function buildCallChannelPageSignals(channel: CallChannelConfig): PageSignalConfig {
	const conn = channel.connect;
	const ic = channel.inCall;
	const share = ic.share;
	const booleans: string[] = [
		channel.tab.visible,
		channel.connected,
		channel.incomingCall.visible,
		channel.incomingCall.accept,
		channel.incomingCall.reject,
		conn.card.visible,
		conn.byod.visible,
		conn.byod.interaction,
		conn.dial.visible,
		conn.dial.interaction,
		conn.contact.visible,
		conn.contact.refresh.visible,
		conn.contact.refresh.interaction,
		conn.contact.call,
		conn.contact.group.visible,
		conn.contact.paging.visible,
		conn.contact.search.visible,
		conn.meeting.visible,
		conn.meeting.refresh.visible,
		conn.meeting.refresh.interaction,
		conn.meeting.join,
		conn.meeting.paging.visible,
		conn.meeting.search.visible,
		ic.card.visible,
		ic.hold.visible,
		ic.hold.interaction,
		ic.videoMute.visible,
		ic.videoMute.interaction,
		ic.micMute.visible,
		ic.micMute.interaction,
		ic.record.visible,
		ic.record.interaction,
		ic.merge.visible,
		ic.merge.interaction,
		ic.dtmf.visible,
		ic.dtmf.interaction,
		ic.transfer.visible,
		ic.transfer.interaction,
		ic.end.visible,
		ic.end.interaction,
		ic.select.visible,
		share.visible,
		ic.audio.visible,
	];
	const numbers: string[] = [
		conn.contact.select,
		conn.contact.group.select,
		conn.contact.paging.pageIndex,
		conn.contact.paging.pageCount,
		conn.meeting.select,
		conn.meeting.paging.pageIndex,
		conn.meeting.paging.pageCount,
		ic.select.interaction,
		ic.merge.select,
	];
	const strings: string[] = [
		channel.incomingCall.label,
		channel.incomingCall.address,
		conn.dial.address,
		ic.label,
		ic.address,
		ic.transfer.address,
		ic.dtmf.tones,
		conn.contact.search.query,
		conn.meeting.search.query,
		...conn.contact.group.groups.map((group) => group.label),
	];
	pushCallContactStrings(strings, conn.contact.contacts);
	pushInCallCallSlotStrings(strings, ic.select.calls);
	pushInCallCallSlotStrings(strings, ic.merge.calls);
	pushCallMeetingSignals(booleans, strings, conn.meeting.meetings);
	pushInCallAudio(booleans, numbers, ic.audio);
	pushInCallShareSelect(numbers, strings, share.select);

	return { booleans: dedupe(booleans), numbers: dedupe(numbers), strings: dedupe(strings) };
}

function buildCallPageSignals(): PageSignalConfig {
	return mergePageSignals(
		{ booleans: [signalConfig.call.page.visible], numbers: [], strings: [] },
		buildCallChannelPageSignals(signalConfig.call.video),
		buildCallChannelPageSignals(signalConfig.call.audio),
	);
}

export const pageSignals = {
	share:       buildSharePageSignals(),
	audio:       buildAudioPageSignals(),
	cabletuner:  buildCableTunerPageSignals(),
	bluray:      buildBluRayPageSignals(),
	appletv:     buildAppleTvPageSignals(),
	settings:    buildSettingsPageSignals(),
	environment: buildEnvironmentPageSignals(),
	camera:      buildCameraPageSignals(),
	call:        buildCallPageSignals(),
} as const;

/** Merged subscription set for App nav-tab visibility (see pageNavVisibility.ts). */
export const navPageSignals: PageSignalConfig = mergePageSignals(
	pageSignals.share,
	pageSignals.audio,
	pageSignals.cabletuner,
	pageSignals.bluray,
	pageSignals.appletv,
	pageSignals.settings,
	pageSignals.environment,
	pageSignals.camera,
	pageSignals.call,
);

// ─── appShellSignals: shell features subscribed by App.tsx ─────────────────────

export const appShellSignals: PageSignalConfig = {
	booleans: [
		signalConfig.standby.enable,
		signalConfig.standby.active,
		signalConfig.standby.activate,
		signalConfig.standby.deactivate,
		signalConfig.autoPowerOff.enable,
		signalConfig.autoPowerOff.active,
		signalConfig.autoPowerOff.activateStandby,
		signalConfig.lockScreen.enable,
		signalConfig.lockScreen.active,
		signalConfig.lockScreen.deactivateStandby,
		signalConfig.call.video.connected,
		signalConfig.call.audio.connected,
		signalConfig.call.video.incomingCall.visible,
		signalConfig.call.video.incomingCall.accept,
		signalConfig.call.video.incomingCall.reject,
		signalConfig.call.audio.incomingCall.visible,
		signalConfig.call.audio.incomingCall.accept,
		signalConfig.call.audio.incomingCall.reject,
	],
	numbers: [
		signalConfig.theme.select,
	],
	strings: [
		signalConfig.standby.image,
		signalConfig.autoPowerOff.time,
		signalConfig.time.time,
		signalConfig.lockScreen.password,
		signalConfig.help.localURL,
		signalConfig.help.hostURL,
		signalConfig.nextMeeting.title,
		signalConfig.nextMeeting.organizer,
		signalConfig.nextMeeting.address,
		signalConfig.nextMeeting.protocol,
		signalConfig.nextMeeting.startTime,
		signalConfig.nextMeeting.endTime,
		signalConfig.nextMeeting.visible,
		signalConfig.nextMeeting.joinable,
		signalConfig.nextMeeting.join,
		signalConfig.call.video.incomingCall.label,
		signalConfig.call.video.incomingCall.address,
		signalConfig.call.audio.incomingCall.label,
		signalConfig.call.audio.incomingCall.address,
	],
};
