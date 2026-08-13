import * as React from 'react';
import SafetyDividerIcon from '@mui/icons-material/SafetyDivider';
import PeopleIcon from '@mui/icons-material/People';
import type { RoomStateOption } from './RoomStateCard';

export function GetRoomStateIconType(type: number): RoomStateOption['Icon'] {
	switch (type) {
		case 1: return <SafetyDividerIcon />;
		case 2: return <PeopleIcon />;
		default: return undefined;
	}
}
