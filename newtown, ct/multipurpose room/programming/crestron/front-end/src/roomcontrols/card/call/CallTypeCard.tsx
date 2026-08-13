import React from 'react';
import { Box, Button, Typography } from '@mui/material';
import VideocamIcon from '@mui/icons-material/Videocam';
import PhoneIcon from '@mui/icons-material/Phone';

import type { CallChannelKey } from '../../../config/callChannelBlock';
import { CardProps } from '../Card';
import { ctBtn, ctCardSx, ctInnerSx, ctIconSx, CardButtonGroup } from '../ctCardStyles';
import { connectBtnSx } from '../../component/connectCardStyles';
import { sxCardBtnGroupSlot, sxCardBtnSlot } from '../../theme/tokens';

export type CallTypeCardProps = {
	value: CallChannelKey;
	onChange: (channel: CallChannelKey) => void;
};

const CallTypeCardInner: React.FC<CallTypeCardProps> = ({
	value,
	onChange,
}) => {
	const caption = value === 'video' ? 'Video' : 'Phone';
	const cardIcon = value === 'video' ? <VideocamIcon /> : <PhoneIcon />;

	return (
		<Box sx={ctInnerSx}>
			<Box sx={ctIconSx}>
				{cardIcon}
			</Box>
			<Box
				sx={{
					display: 'flex',
					flexDirection: 'column',
					justifyContent: 'center',
					gap: '2px',
					flex: 1,
					minWidth: 0,
				}}
			>
				<Typography
					variant='body2'
					sx={{ fontWeight: 600, lineHeight: 1.2, color: '#fff' }}
					noWrap
				>
					Call Type
				</Typography>
				<Typography
					variant='caption'
					sx={{ lineHeight: 1.1, fontWeight: 600, color: 'rgba(255,255,255,0.9)' }}
					noWrap
				>
					{caption}
				</Typography>
			</Box>
			<Box sx={sxCardBtnGroupSlot}>
				<CardButtonGroup>
					<Box
						onClick={(e) => e.stopPropagation()}
						onPointerDown={(e) => e.stopPropagation()}
						sx={sxCardBtnSlot}
					>
						<Button
							variant={value === 'video' ? 'contained' : 'outlined'}
							sx={connectBtnSx}
							onClick={() => onChange('video')}
						>
							{ctBtn(<VideocamIcon />, 'Video')}
						</Button>
					</Box>
					<Box
						onClick={(e) => e.stopPropagation()}
						onPointerDown={(e) => e.stopPropagation()}
						sx={sxCardBtnSlot}
					>
						<Button
							variant={value === 'audio' ? 'contained' : 'outlined'}
							sx={connectBtnSx}
							onClick={() => onChange('audio')}
						>
							{ctBtn(<PhoneIcon />, 'Phone')}
						</Button>
					</Box>
				</CardButtonGroup>
			</Box>
		</Box>
	);
};

const CallTypeCard = (props: CallTypeCardProps): CardProps => ({
	label: 'Call Type',
	pin: 0,
	MuiCardProps: { sx: ctCardSx },
	children: <CallTypeCardInner {...props} />,
});

export default CallTypeCard;
