import React from 'react';

import { Typography, type TypographyProps } from '@mui/material';

export const sxCardPressHint = {
	lineHeight: 1.1,
	fontWeight: 400,
	fontStyle: 'italic',
	color: 'rgba(255,255,255,0.75)',
} as const;

export type CardPressHintProps = TypographyProps & {
	children: React.ReactNode;
};

const CardPressHint: React.FC<CardPressHintProps> = ({ children, sx, ...rest }) => (
	<Typography
		variant='caption'
		noWrap
		sx={{ ...sxCardPressHint, ...sx }}
		{...rest}
	>
		{children}
	</Typography>
);

export default CardPressHint;
