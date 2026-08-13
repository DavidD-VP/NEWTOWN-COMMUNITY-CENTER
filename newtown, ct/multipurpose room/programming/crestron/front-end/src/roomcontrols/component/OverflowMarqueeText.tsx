import * as React from 'react';

import { Box, Typography, TypographyProps } from '@mui/material';
import { SxProps, Theme } from '@mui/material/styles';
import { keyframes } from '@mui/system';

const PAUSE_MS = 2000;
const SCROLL_MS = 5000;
const CYCLE_MS = PAUSE_MS * 2 + SCROLL_MS * 2;
const CYCLE_SEC = CYCLE_MS / 1000;
const START_PAUSE_PCT = (PAUSE_MS / CYCLE_MS) * 100;
const END_PAUSE_START_PCT = ((PAUSE_MS + SCROLL_MS) / CYCLE_MS) * 100;
const END_PAUSE_END_PCT = ((PAUSE_MS * 2 + SCROLL_MS) / CYCLE_MS) * 100;

export type OverflowMarqueeTextProps = {
	children: React.ReactNode;
	variant?: TypographyProps['variant'];
	component?: React.ElementType;
	sx?: SxProps<Theme>;
	disabled?: boolean;
	/** Center short text when it does not overflow. Defaults to left alignment. */
	centerWhenIdle?: boolean;
};

function usePrefersReducedMotion(): boolean {
	const [reduced, setReduced] = React.useState(false);

	React.useEffect(() => {
		const media = window.matchMedia('(prefers-reduced-motion: reduce)');
		const update = () => setReduced(media.matches);
		update();
		media.addEventListener('change', update);
		return () => media.removeEventListener('change', update);
	}, []);

	return reduced;
}

function buildMarqueeAnimation(overflowPx: number) {
	return keyframes`
		0%, ${START_PAUSE_PCT}% {
			transform: translateX(0);
		}
		${END_PAUSE_START_PCT}% {
			transform: translateX(-${overflowPx}px);
		}
		${END_PAUSE_END_PCT}% {
			transform: translateX(-${overflowPx}px);
		}
		100% {
			transform: translateX(0);
		}
	`;
}

const OverflowMarqueeText: React.FC<OverflowMarqueeTextProps> = ({
	children,
	variant = 'caption',
	component = 'span',
	sx,
	disabled = false,
	centerWhenIdle = false,
}) => {
	const containerRef = React.useRef<HTMLSpanElement | null>(null);
	const contentRef = React.useRef<HTMLSpanElement | null>(null);
	const [overflowPx, setOverflowPx] = React.useState(0);
	const prefersReducedMotion = usePrefersReducedMotion();

	const measure = React.useCallback(() => {
		const container = containerRef.current;
		const content = contentRef.current;
		if (!container || !content || disabled) {
			setOverflowPx(0);
			return;
		}

		content.style.width = 'max-content';
		const delta = content.scrollWidth - container.clientWidth;
		content.style.removeProperty('width');

		setOverflowPx(delta > 1 ? Math.ceil(delta) : 0);
	}, [disabled]);

	React.useLayoutEffect(() => {
		measure();
	}, [measure, children]);

	React.useEffect(() => {
		const container = containerRef.current;
		const content = contentRef.current;
		if (!container) return;

		const observer = new ResizeObserver(measure);
		observer.observe(container);
		if (content) observer.observe(content);

		return () => observer.disconnect();
	}, [measure]);

	const shouldAnimate = overflowPx > 0 && !prefersReducedMotion && !disabled;
	const showEllipsis = !shouldAnimate && overflowPx > 0;
	const marqueeAnimation = React.useMemo(
		() => (shouldAnimate ? buildMarqueeAnimation(overflowPx) : null),
		[shouldAnimate, overflowPx],
	);

	return (
		<Box
			ref={containerRef}
			component='span'
			sx={{
				display: 'block',
				overflow: 'hidden',
				minWidth: 0,
				width: '100%',
				maxWidth: '100%',
				textAlign: centerWhenIdle && overflowPx === 0 ? 'center' : 'left',
			}}
		>
			<Typography
				ref={contentRef}
				variant={variant}
				component={component}
				sx={{
					display: 'inline-block',
					width: showEllipsis ? '100%' : 'max-content',
					maxWidth: showEllipsis ? '100%' : undefined,
					whiteSpace: 'nowrap',
					verticalAlign: 'bottom',
					overflow: showEllipsis ? 'hidden' : undefined,
					textOverflow: showEllipsis ? 'ellipsis' : undefined,
					...(marqueeAnimation
						? {
								animation: `${marqueeAnimation} ${CYCLE_SEC}s ease-in-out infinite`,
							}
						: {}),
					...sx,
				}}
			>
				{children}
			</Typography>
		</Box>
	);
};

export default OverflowMarqueeText;
