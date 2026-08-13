import React from 'react';

import { Box, IconButton } from '@mui/material';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';

import {
	pageScrollArrowButtonSx,
	pageScrollArrowStripActiveSx,
	pageScrollArrowStripSx,
} from '../theme/tokens';

const SCROLL_EDGE_TOLERANCE = 2;

export type OverlayScrollState = {
	canScrollUp: boolean;
	canScrollDown: boolean;
};

export type OverlayScrollBodyProps = {
	children: React.ReactNode;
	onScrollStateChange?: (state: OverlayScrollState) => void;
	scrollRef?: React.RefObject<HTMLDivElement | null>;
};

export const OverlayScrollBody: React.FC<OverlayScrollBodyProps> = ({
	children,
	onScrollStateChange,
	scrollRef: scrollRefProp,
}) => {
	const scrollRefLocal = React.useRef<HTMLDivElement>(null);
	const scrollRef = scrollRefProp ?? scrollRefLocal;
	const innerRef = React.useRef<HTMLDivElement>(null);
	const onScrollStateChangeRef = React.useRef(onScrollStateChange);
	const lastScrollStateRef = React.useRef<OverlayScrollState>({
		canScrollUp: false,
		canScrollDown: false,
	});

	React.useEffect(() => {
		onScrollStateChangeRef.current = onScrollStateChange;
	}, [onScrollStateChange]);

	const updateScrollState = React.useCallback(() => {
		const el = scrollRef.current;
		if (!el) return;
		const maxScroll = el.scrollHeight - el.clientHeight;
		const next: OverlayScrollState = {
			canScrollUp: el.scrollTop > SCROLL_EDGE_TOLERANCE,
			canScrollDown: el.scrollTop < maxScroll - SCROLL_EDGE_TOLERANCE,
		};
		const prev = lastScrollStateRef.current;
		if (prev.canScrollUp === next.canScrollUp && prev.canScrollDown === next.canScrollDown) {
			return;
		}
		lastScrollStateRef.current = next;
		onScrollStateChangeRef.current?.(next);
	}, [scrollRef]);

	React.useEffect(() => {
		const el = scrollRef.current;
		const inner = innerRef.current;
		if (!el || !inner) return;

		const observer = new ResizeObserver(updateScrollState);
		observer.observe(el);
		observer.observe(inner);
		el.addEventListener('scroll', updateScrollState, { passive: true });
		updateScrollState();

		return () => {
			observer.disconnect();
			el.removeEventListener('scroll', updateScrollState);
		};
	}, [updateScrollState, scrollRef]);

	return (
		<Box
			ref={scrollRef}
			sx={{
				flex: 1,
				minHeight: 0,
				width: '100%',
				overflow: 'auto',
				overscrollBehavior: 'none',
				scrollbarWidth: 'none',
				'&::-webkit-scrollbar': { display: 'none' },
			}}
		>
			<Box ref={innerRef} sx={{ width: '100%' }}>
				{children}
			</Box>
		</Box>
	);
};

export type OverlayScrollArrowStripProps = {
	direction: 'up' | 'down';
	active: boolean;
	onClick: () => void;
};

/** Overlay scroll arrow — strip always reserves band height; border + chevron when active. */
export const OverlayScrollArrowStrip: React.FC<OverlayScrollArrowStripProps> = (props) => {
	const isUp = props.direction === 'up';

	return (
		<Box
			sx={{
				...pageScrollArrowStripSx,
				...pageScrollArrowStripActiveSx(props.direction, props.active),
			}}
			onClick={(e) => e.stopPropagation()}
		>
			<IconButton
				onClick={(e) => {
					e.stopPropagation();
					props.onClick();
				}}
				aria-label={isUp ? 'Scroll up' : 'Scroll down'}
				className='overlay-scroll-arrow'
				sx={{
					...pageScrollArrowButtonSx,
					opacity: props.active ? 1 : 0,
					pointerEvents: props.active ? undefined : 'none',
				}}
			>
				{isUp ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
			</IconButton>
		</Box>
	);
};

export function useOverlayScrollControl(open: boolean) {
	const scrollRef = React.useRef<HTMLDivElement>(null);
	const [scrollState, setScrollState] = React.useState<OverlayScrollState>({
		canScrollUp: false,
		canScrollDown: false,
	});

	React.useEffect(() => {
		if (!open) {
			setScrollState((prev) => (
				prev.canScrollUp || prev.canScrollDown
					? { canScrollUp: false, canScrollDown: false }
					: prev
			));
		}
	}, [open]);

	const setScrollStateIfChanged = React.useCallback((state: OverlayScrollState) => {
		setScrollState((prev) => (
			prev.canScrollUp === state.canScrollUp && prev.canScrollDown === state.canScrollDown
				? prev
				: state
		));
	}, []);

	const scrollBy = React.useCallback((direction: 'up' | 'down') => {
		const el = scrollRef.current;
		if (!el) return;
		const delta = direction === 'up'
			? -el.clientHeight * 0.75
			: el.clientHeight * 0.75;
		el.scrollBy({ top: delta, behavior: 'smooth' });
	}, []);

	return {
		scrollRef,
		scrollState,
		setScrollState: setScrollStateIfChanged,
		scrollUp: () => scrollBy('up'),
		scrollDown: () => scrollBy('down'),
	};
}

export default OverlayScrollBody;
