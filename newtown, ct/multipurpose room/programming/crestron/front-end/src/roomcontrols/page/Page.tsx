import * as React from 'react';

import { Card, Box } from '@mui/material';
import { CardProps } from '../card/Card';
import AnimatedCardList from '../component/AnimatedCardList';
import { pageContentPaddingX, pageCardGap } from '../theme/tokens';
import { PageEditorProvider, useActivePageId, useDisplayedPageId } from './PageEditorContext';
import { useDismissOnNavigation } from '../component/NavigationDismissContext';

export type PageHandle = {
	scrollUp: () => void;
	scrollDown: () => void;
	onScrollStateChange: ((canScrollUp: boolean, canScrollDown: boolean) => void) | undefined;
};

export type PageProps = {
	id: string;
	label: string;
	icon: React.ReactNode;
	cards: Array<CardProps | undefined>;
	header?: React.ReactNode;
};

const SCROLL_EDGE_TOLERANCE = 4;
const PAGE_SCROLL_RATIO = 0.75;
const PROGRAMMATIC_SCROLL_LOCK_MS = 400;

function getMaxScrollTop(el: HTMLElement): number {
	return Math.max(0, el.scrollHeight - el.clientHeight);
}

function clampScrollTop(el: HTMLElement): void {
	const max = getMaxScrollTop(el);
	if (el.scrollTop < 0) {
		el.scrollTop = 0;
	} else if (el.scrollTop > max) {
		el.scrollTop = max;
	}
}

function getCardTops(inner: HTMLElement): number[] {
	return Array.from(inner.children).map(
		(child) => (child as HTMLElement).offsetTop,
	);
}

function snapScrollTarget(
	el: HTMLElement,
	inner: HTMLElement,
	direction: 'up' | 'down',
): number {
	const scrollTop = el.scrollTop;
	const maxScroll = getMaxScrollTop(el);
	const pageStep = el.clientHeight * PAGE_SCROLL_RATIO;
	const cardTops = getCardTops(inner);

	let target =
		direction === 'down'
			? Math.min(scrollTop + pageStep, maxScroll)
			: Math.max(scrollTop - pageStep, 0);

	if (cardTops.length === 0) {
		return target;
	}

	if (direction === 'down') {
		const snapped = cardTops.find((top) => top >= target - 1) ?? maxScroll;
		return Math.min(snapped, maxScroll);
	}

	const atOrAbove = cardTops.filter((top) => top <= target + 1);
	return atOrAbove.length > 0 ? atOrAbove[atOrAbove.length - 1] : 0;
}

const Page = React.forwardRef<PageHandle, PageProps>((props, ref) => {

	const cards = React.useMemo(
		() => props.cards.filter((card): card is CardProps => card !== undefined),
		[props.cards],
	);

	const [editorContent, setEditorContent] = React.useState<React.ReactNode | null>(null);

	const contentScrollRef = React.useRef<HTMLDivElement>(null);
	const contentInnerRef = React.useRef<HTMLDivElement>(null);
	const isProgrammaticScrollRef = React.useRef(false);
	const scrollLockTimerRef = React.useRef<number | undefined>(undefined);

	const openPageEditor = React.useCallback((content: React.ReactNode) => {
		setEditorContent(content);
		const el = contentScrollRef.current;
		if (el) {
			el.scrollTop = 0;
		}
	}, []);

	const closePageEditor = React.useCallback(() => {
		setEditorContent(null);
	}, []);

	useDismissOnNavigation(closePageEditor);

	const activePageId = useActivePageId();
	const displayedPageId = useDisplayedPageId();
	const pageCardsActive = activePageId === props.id && displayedPageId === props.id;

	React.useEffect(() => {
		if (activePageId !== undefined && activePageId !== props.id) {
			closePageEditor();
		}
	}, [activePageId, props.id, closePageEditor]);

	// Stable ref so checkScrollOverflow never needs to be recreated; assigned externally via the handle
	const onScrollStateChangeRef = React.useRef<((canScrollUp: boolean, canScrollDown: boolean) => void) | undefined>(undefined);

	const checkScrollOverflow = React.useCallback(() => {
		const el = contentScrollRef.current;
		if (!el || el.clientHeight === 0) return;
		clampScrollTop(el);
		const maxScroll = getMaxScrollTop(el);
		onScrollStateChangeRef.current?.(
			el.scrollTop > SCROLL_EDGE_TOLERANCE,
			el.scrollTop < maxScroll - SCROLL_EDGE_TOLERANCE,
		);
	}, []);

	const releaseProgrammaticScrollLock = React.useCallback(() => {
		const el = contentScrollRef.current;
		if (el) {
			clampScrollTop(el);
		}
		isProgrammaticScrollRef.current = false;
		checkScrollOverflow();
	}, [checkScrollOverflow]);

	React.useEffect(() => {
		const el = contentScrollRef.current;
		const inner = contentInnerRef.current;
		if (!el || !inner) return;
		const observer = new ResizeObserver(checkScrollOverflow);
		observer.observe(el);
		observer.observe(inner);
		const handleScroll = () => {
			if (!isProgrammaticScrollRef.current) {
				clampScrollTop(el);
			}
			checkScrollOverflow();
		};
		const handleScrollEnd = () => {
			if (isProgrammaticScrollRef.current) {
				releaseProgrammaticScrollLock();
				return;
			}
			clampScrollTop(el);
			checkScrollOverflow();
		};
		el.addEventListener('scroll', handleScroll, { passive: true });
		el.addEventListener('scrollend', handleScrollEnd);
		checkScrollOverflow();
		return () => {
			observer.disconnect();
			el.removeEventListener('scroll', handleScroll);
			el.removeEventListener('scrollend', handleScrollEnd);
			if (scrollLockTimerRef.current !== undefined) {
				window.clearTimeout(scrollLockTimerRef.current);
			}
		};
	}, [checkScrollOverflow, releaseProgrammaticScrollLock]);

	React.useEffect(() => {
		checkScrollOverflow();
	}, [editorContent, checkScrollOverflow]);

	const scrollContentBy = React.useCallback((direction: 'up' | 'down') => {
		const el = contentScrollRef.current;
		const inner = contentInnerRef.current;
		if (!el || !inner || isProgrammaticScrollRef.current) return;

		const target = snapScrollTarget(el, inner, direction);
		if (Math.abs(target - el.scrollTop) < 1) {
			return;
		}

		isProgrammaticScrollRef.current = true;
		if (scrollLockTimerRef.current !== undefined) {
			window.clearTimeout(scrollLockTimerRef.current);
		}

		el.scrollTo({
			top: target,
			behavior: 'smooth',
		});

		scrollLockTimerRef.current = window.setTimeout(() => {
			scrollLockTimerRef.current = undefined;
			releaseProgrammaticScrollLock();
		}, PROGRAMMATIC_SCROLL_LOCK_MS);
	}, [releaseProgrammaticScrollLock]);

	React.useImperativeHandle(ref, () => ({
		scrollUp: () => scrollContentBy('up'),
		scrollDown: () => scrollContentBy('down'),
		get onScrollStateChange() { return onScrollStateChangeRef.current; },
		set onScrollStateChange(fn) { onScrollStateChangeRef.current = fn; },
	}), [scrollContentBy]);

	return (
		<PageEditorProvider
			editorContent={editorContent}
			onOpenEditor={openPageEditor}
			onCloseEditor={closePageEditor}
		>
			<Card
				sx={{
					height: '100%',
					width: '100%',
					display: 'flex',
					flexDirection: 'column',
					overflow: 'hidden',
					background: 'transparent',
					boxShadow: 'none',
					border: 'none',
				}}
			>
				{props.header}
				<Box
					ref={contentScrollRef}
					sx={{
						flex: 1,
						minHeight: 0,
						width: '100%',
						overflow: 'auto',
						paddingLeft: pageContentPaddingX,
						paddingRight: pageContentPaddingX,
						boxSizing: 'border-box',
						overscrollBehavior: 'none',
						scrollbarWidth: 'none',
						'&::-webkit-scrollbar': { display: 'none' },
					}}
				>
					<Box
						ref={contentInnerRef}
						sx={{
							display: 'flex',
							flexDirection: 'column',
							gap: pageCardGap,
							width: '100%',
						}}
					>
						<Box sx={{ display: editorContent ? 'none' : 'contents' }}>
							<AnimatedCardList
								cards={cards}
								pageActive={pageCardsActive}
								enabled={!editorContent}
							/>
						</Box>
						{editorContent}
					</Box>
				</Box>

			</Card>
		</PageEditorProvider>
	);
});

export default React.memo(Page);

/*

{
	props.AdditionalDialogProps ?
		props.AdditionalDialogProps.map((dialogProps, index) => {
			return <ButtonDialog key={index} {...dialogProps}></ButtonDialog>
		})
		:
		<></>
}
{
	props.HelpDialogProps ?
		<HelpDialog {...props.HelpDialogProps}></HelpDialog>
		:
		<></>
}

*/
