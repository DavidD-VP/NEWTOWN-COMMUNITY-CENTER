import * as React from 'react';
import { Box, Typography } from '@mui/material';
import CrestronButton from './CrestronButton';
import { CardProps } from '../card/Card';
import { ctBtnSx, ctCardSx, ctInnerSx, ctIconSx, ctLabelSx, CardButtonGroup } from '../card/ctCardStyles';

export type ButtonDef = {
	key: string;
	signal?: string;
	children: React.ReactNode;
};

export type ButtonGroupCardProps = {
	label: string;
	/** Typography heading shown inside the card. Defaults to `label`. */
	title?: string;
	cardIcon: React.ReactNode;
	buttons: ButtonDef[];
};

const ButtonGroupCard = (props: ButtonGroupCardProps): CardProps | null => {
	const active = props.buttons.filter((b) => b.signal);
	if (active.length === 0) return null;

	return {
		label: props.label,
		MuiCardProps: { sx: ctCardSx },
		children: (
			<Box sx={ctInnerSx}>
				<Box sx={ctIconSx}>{props.cardIcon}</Box>
				<Typography variant='body2' sx={ctLabelSx} noWrap>
					{props.title ?? props.label}
				</Typography>
				<CardButtonGroup>
					{active.map((b) => (
						<CrestronButton
							key={b.key}
							signal={b.signal!}
							ButtonProps={{ sx: ctBtnSx, children: b.children }}
						/>
					))}
				</CardButtonGroup>
			</Box>
		),
	};
};

export default ButtonGroupCard;
