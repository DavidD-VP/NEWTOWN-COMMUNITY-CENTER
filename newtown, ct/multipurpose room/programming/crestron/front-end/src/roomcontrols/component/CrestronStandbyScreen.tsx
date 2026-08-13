import * as React from 'react';
import { Box, Typography } from '@mui/material';

import { publishEvent, useSignalStore } from '../../crestron/CrComLib';

export type CrestronStandbyScreenProps = {
	signal: string;
	img?: string;
};

const CrestronStandbyScreen = (
	props: CrestronStandbyScreenProps,
): JSX.Element => {



	const fireSignal = React.useCallback(() => {
		publishEvent('boolean', props.signal, true);
		publishEvent('boolean', props.signal, false);
	}, [props.signal]);

	return (
		<Box
			id={'crestron-standby-screen'}
			onClick={fireSignal}
			sx={{
				width: '100%',
				height: '100%',
				cursor: 'pointer',
				backgroundColor: 'background.default',
				display: 'flex',
				flexDirection: 'column',
				alignItems: 'center',
				justifyContent: 'space-between',
				py: 4,
			}}
		>
			<Box sx={{ flex: 1 }} />
			{props?.img ? (
				<img
					style={{
						width: '80vw',
						maxWidth: '900px',
						objectFit: 'contain',
					}}
					src={props.img}
				/>
			) : (
				<></>
			)}
			<Box sx={{ flex: 1 }} />
			<Typography
				sx={{
					fontSize: 'clamp(18px, 2.49vw, 48px)',
					fontWeight: 'bold',
					pb: 2,
					animation: 'pulse 2.5s ease-in-out infinite',
					'@keyframes pulse': {
						'0%, 100%': { opacity: 1 },
						'50%': { opacity: 0.4 },
					},
				}}
			>
				TAP TO POWER ON THE SYSTEM
			</Typography>
		</Box>
	);
};

export default CrestronStandbyScreen;
