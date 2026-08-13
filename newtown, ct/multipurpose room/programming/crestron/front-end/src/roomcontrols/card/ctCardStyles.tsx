import * as React from 'react';
import { Box, ButtonGroup, ButtonGroupProps, IconButton, SxProps, Theme, Typography } from '@mui/material';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import {
	sxCtrlBtn,
	sxCardActive,
	sxCardInner,
	sxCardIcon,
	sxCardLabel,
	cardBorderRadius,
	cardSectionGap,
	shadowActiveStrong,
	overlayButtonBg,
	overlayButtonBgHover,
	overlayButtonBorder,
	overlayButtonBorderHover,
	ctrlBtnHeight,
	ctrlBtnIconSize,
	ctrlBtnLabelSize,
	sxCtrlBtnContent,
} from '../theme/tokens';

export const ctBtnSx = sxCtrlBtn;

export const ctBtn = (icon: React.ReactNode, label: string): React.ReactNode => (
	<Box sx={sxCtrlBtnContent}>
		{icon}
		<Typography variant='caption' sx={{ fontSize: ctrlBtnLabelSize, lineHeight: 1.1, color: 'inherit', textTransform: 'none', whiteSpace: 'nowrap' }}>{label}</Typography>
	</Box>
);

export const ctCardSx = {
	...sxCardActive,
	display: 'flex',
	flexDirection: 'row',
	alignItems: 'center',
	borderRadius: cardBorderRadius,
	'&:hover': { boxShadow: shadowActiveStrong, borderColor: 'primary.light' },
};

export const ctInnerSx = sxCardInner;

export const ctIconSx = sxCardIcon;

export const ctLabelSx = sxCardLabel;

const SCROLL_POSITION_PX = 2;

const arrowSx = {
	flexShrink: 0,
	alignSelf: 'stretch',
	width: ctrlBtnHeight,
	minWidth: ctrlBtnHeight,
	borderRadius: '4px',
	border: `1px solid ${overlayButtonBorder}`,
	backgroundColor: overlayButtonBg,
	color: '#fff',
	padding: 0,
	'&:hover': {
		backgroundColor: overlayButtonBgHover,
		borderColor: overlayButtonBorderHover,
	},
	'& .MuiSvgIcon-root': { fontSize: ctrlBtnIconSize },
} as const;

const scrollViewportSx = {
	flex: 1,
	minWidth: 0,
	overflowX: 'auto',
	display: 'flex',
	alignItems: 'stretch',
	justifyContent: 'flex-start',
	paddingInline: '2px',
	boxSizing: 'border-box',
	scrollbarWidth: 'none',
	'&::-webkit-scrollbar': { display: 'none' },
} as const;

const buttonGroupSx = (sx: ButtonGroupProps['sx']) => [
	{
		flexWrap: 'nowrap',
		flexShrink: 0,
		alignSelf: 'stretch',
		'& .MuiButtonGroup-grouped': {
			flexShrink: 0,
			width: 'auto',
		},
		'& > *': {
			alignSelf: 'stretch',
			display: 'flex',
		},
		'& .MuiButton-root': {
			alignSelf: 'stretch',
			height: 'auto',
			flex: '0 0 auto',
			width: 'max-content',
			maxWidth: 'none',
			boxSizing: 'border-box',
			display: 'grid',
			placeItems: 'center',
			placeContent: 'center',
			lineHeight: 1,
			fontSize: ctrlBtnLabelSize,
			textTransform: 'none',
			letterSpacing: 0,
			'& > *': {
				gridArea: '1 / 1',
			},
		},
	},
	...(Array.isArray(sx) ? sx : sx ? [sx] : []),
];

const scrollByAmount = (el: HTMLDivElement, direction: 'left' | 'right') => {
	const btn = el.querySelector<HTMLElement>('.MuiButton-root');
	const amount = btn ? btn.offsetWidth : 64;
	el.scrollBy({ left: direction === 'right' ? amount : -amount, behavior: 'smooth' });
};

/** Standalone card button group scroll — arrows mount when scrollable in that direction. */
const useStandaloneScroll = (deps: React.DependencyList = []) => {
	const scrollRef = React.useRef<HTMLDivElement>(null);
	const [canScrollLeft, setCanScrollLeft] = React.useState(false);
	const [canScrollRight, setCanScrollRight] = React.useState(false);

	const checkScroll = React.useCallback(() => {
		const el = scrollRef.current;
		if (!el) return;
		setCanScrollLeft(el.scrollLeft > SCROLL_POSITION_PX);
		setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - SCROLL_POSITION_PX);
	}, []);

	React.useEffect(() => {
		const el = scrollRef.current;
		if (!el) return;

		const observer = new ResizeObserver(checkScroll);
		observer.observe(el);
		if (el.firstElementChild) observer.observe(el.firstElementChild);
		el.addEventListener('scroll', checkScroll, { passive: true });

		const raf = requestAnimationFrame(checkScroll);
		return () => {
			cancelAnimationFrame(raf);
			observer.disconnect();
			el.removeEventListener('scroll', checkScroll);
		};
	}, [checkScroll, ...deps]);

	const scrollBy = React.useCallback((direction: 'left' | 'right') => {
		const el = scrollRef.current;
		if (el) scrollByAmount(el, direction);
	}, []);

	return { scrollRef, canScrollLeft, canScrollRight, scrollBy };
};

/** Shared row scroll for multiple embedded groups (e.g. PTZ focus + zoom). */
const useRowScrollRail = (deps: React.DependencyList = []) => {
	const scrollRef = React.useRef<HTMLDivElement>(null);
	const [canScrollLeft, setCanScrollLeft] = React.useState(false);
	const [canScrollRight, setCanScrollRight] = React.useState(false);

	const checkScroll = React.useCallback(() => {
		const el = scrollRef.current;
		if (!el) return;

		setCanScrollLeft(el.scrollLeft > SCROLL_POSITION_PX);
		setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - SCROLL_POSITION_PX);
	}, []);

	React.useEffect(() => {
		const el = scrollRef.current;
		if (!el) return;

		const observer = new ResizeObserver(checkScroll);
		observer.observe(el);
		if (el.firstElementChild) observer.observe(el.firstElementChild);
		el.addEventListener('scroll', checkScroll, { passive: true });

		const raf = requestAnimationFrame(checkScroll);
		return () => {
			cancelAnimationFrame(raf);
			observer.disconnect();
			el.removeEventListener('scroll', checkScroll);
		};
	}, [checkScroll, ...deps]);

	const scrollBy = React.useCallback((direction: 'left' | 'right') => {
		const el = scrollRef.current;
		if (el) scrollByAmount(el, direction);
	}, []);

	return { scrollRef, canScrollLeft, canScrollRight, scrollBy };
};

/**
 * Horizontal row of CardButtonGroups with a single shared scroll rail.
 * Avoids per-group arrow rails fighting over width when groups are stacked.
 */
export const CardButtonGroupRow = ({
	children,
	sx,
}: {
	children: React.ReactNode;
	sx?: SxProps<Theme>;
}) => {
	const childCount = React.Children.count(children);
	const { scrollRef, canScrollLeft, canScrollRight, scrollBy } = useRowScrollRail(
		[childCount],
	);

	return (
		<Box
			sx={[
				{
					display: 'flex',
					alignItems: 'stretch',
					flexShrink: 1,
					minWidth: 0,
					gap: '2px',
				},
				...(Array.isArray(sx) ? sx : sx ? [sx] : []),
			]}
		>
			{canScrollLeft && (
				<IconButton onClick={() => scrollBy('left')} sx={arrowSx}>
					<ChevronLeftIcon />
				</IconButton>
			)}
			<Box ref={scrollRef} sx={scrollViewportSx}>
				<Box sx={{
					display: 'flex',
					flexDirection: 'row',
					flexWrap: 'nowrap',
					gap: cardSectionGap,
					marginLeft: 'auto',
					flexShrink: 0,
					alignItems: 'stretch',
				}}>
					{children}
				</Box>
			</Box>
			{canScrollRight && (
				<IconButton onClick={() => scrollBy('right')} sx={arrowSx}>
					<ChevronRightIcon />
				</IconButton>
			)}
		</Box>
	);
};

/**
 * Drop-in replacement for MUI ButtonGroup inside a card.
 * Wraps the group in a horizontally-scrollable container and shows
 * left/right scroll-arrow buttons when the content overflows.
 * Use embedded=true when placing groups inside CardButtonGroupRow.
 */
export const CardButtonGroup = ({
	centered = false,
	shrinkWrap = false,
	embedded = false,
	children,
	sx,
	...props
}: ButtonGroupProps & { centered?: boolean; shrinkWrap?: boolean; embedded?: boolean }) => {
	const group = (
		<ButtonGroup {...props} sx={buttonGroupSx(sx)}>
			{children}
		</ButtonGroup>
	);

	if (embedded) return group;

	const { scrollRef, canScrollLeft, canScrollRight, scrollBy } = useStandaloneScroll([children]);

	const outerFlex = shrinkWrap || centered ? '0 1 auto' : 1;

	return (
		<Box sx={{
			flex: outerFlex,
			minWidth: 0,
			maxWidth: '100%',
			display: 'flex',
			alignItems: 'stretch',
			alignSelf: 'stretch',
			gap: '2px',
		}}>
			{canScrollLeft && (
				<IconButton onClick={() => scrollBy('left')} sx={arrowSx}>
					<ChevronLeftIcon />
				</IconButton>
			)}
			<Box ref={scrollRef} sx={scrollViewportSx}>
				<Box sx={{
					marginLeft: 'auto',
					marginRight: centered ? 'auto' : undefined,
					flexShrink: 0,
					display: 'flex',
					alignItems: 'stretch',
				}}>
					{group}
				</Box>
			</Box>
			{canScrollRight && (
				<IconButton onClick={() => scrollBy('right')} sx={arrowSx}>
					<ChevronRightIcon />
				</IconButton>
			)}
		</Box>
	);
};
