import * as React from 'react';

import { Box, IconButton, useMediaQuery } from '@mui/material';
import {
	gradientActive,
	gradientNavDark,
	gradientNavLight,
	shadowNavBtn,
	shadowNavBtnHover,
	shadowNavBar,
	shadowNavBarDark,
	scrollArrowHeight,
	navBarHeightCssVar,
	pageScrollArrowButtonSx,
	pageScrollArrowStripActiveSx,
	pageScrollArrowStripSx,
} from './theme/tokens';
import { BottomNavigation, BottomNavigationAction } from '@mui/material';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import { useTheme } from '@mui/material/styles';

import { PageHandle } from './page/Page';
import { ActivePageProvider } from './page/PageEditorContext';
import { useIsPageOverlayOpen } from './component/OverlayOpenContext';
import { useNavigationDismissRegistry } from './component/NavigationDismissContext';
import { PAGE_CARD_EXIT_MS } from './component/AnimatedCardList';

import { Dialog } from '@mui/material';

import { DialogProps } from './component/dialogs/BottomNavigationActionDialog';
import { CrestronSignal, useSignalStore } from '../crestron/CrComLib';
import { signalConfig } from '../config/signals';
import { ThemeOption } from './card/theme/ThemeCard';
import { useAppStore } from '../store/appStore';
import LockScreen from './component/LockScreen';
import AutoPowerOffWarningDialog, {
	type AutoPowerOffWarningDialogProps,
} from './component/dialogs/AutoPowerOffWarningDialog';
import IncomingCallDialog, {
	type IncomingCallDialogProps,
} from './component/dialogs/IncomingCallDialog';
import type { CallChannelKey } from '../config/callChannelBlock';
import { useCallUiStore } from '../store/callUiStore';

/**
 * Descriptor for a navigable page in RoomControls.
 *
 * `render(ref)` is called by RoomControls when the page is first visited
 * (lazy mount).  The returned element is typically a `<XxxPageLazy>`
 * component loaded via `React.lazy`, so each page's heavy card modules
 * only ship in their own chunk.
 *
 * Once visited, a page stays mounted (hidden via `display: 'none'`) so
 * its scroll position / internal state persists across nav switches.
 */
export type PageDescriptor = {
	id: string;
	label: string;
	icon: React.ReactNode;
	render: (ref: React.Ref<PageHandle>) => React.ReactNode;
};

// ── Nav item types ───────────────────────────────────────────────────────────

type NavItem =
	| { kind: 'page'; data: PageDescriptor }
	| { kind: 'dialog'; data: DialogProps };

function buildNavItems(pages: PageDescriptor[], dialogs: DialogProps[]): NavItem[] {
	return [
		...pages.map((p) => ({ kind: 'page' as const, data: p })),
		...dialogs.map((d) => ({ kind: 'dialog' as const, data: d })),
	].sort((a, b) => {
		const la = a.kind === 'page' ? a.data.label : String(a.data.BottomNavigationActionProps.label ?? '');
		const lb = b.kind === 'page' ? b.data.label : String(b.data.BottomNavigationActionProps.label ?? '');
		return la.localeCompare(lb);
	});
}

const PIN_CALL_PAGE_ID = 'page-call';
const PIN_MEETING_LABEL = 'Meeting';

function closeNavDialogs(dialogs: readonly DialogProps[]): void {
	dialogs.forEach((dialog) => {
		dialog.DialogProps?.onClose?.({}, 'backdropClick');
	});
}

function getFirstPageId(items: NavItem[]): string | undefined {
	const item = items.find((entry) => entry.kind === 'page');
	return item?.kind === 'page' ? item.data.id : undefined;
}

function partitionNavItems(items: NavItem[], pinCall: boolean, pinMeeting: boolean) {
	const scrollNavItems: NavItem[] = [];
	const pinnedNavItems: NavItem[] = [];
	for (const item of items) {
		const isCall = item.kind === 'page' && item.data.id === PIN_CALL_PAGE_ID;
		const isMeeting =
			item.kind === 'dialog' &&
			String(item.data.BottomNavigationActionProps.label ?? '') === PIN_MEETING_LABEL;
		if ((pinCall && isCall) || (pinMeeting && isMeeting)) {
			pinnedNavItems.push(item);
		} else {
			scrollNavItems.push(item);
		}
	}
	return { scrollNavItems, pinnedNavItems };
}

const RoomControls = (props: {
	Pages: Array<PageDescriptor | undefined>;
	Dialogs: Array<DialogProps>;
	Standby?: { enable: boolean; active: boolean; screen: JSX.Element };
	/**
	 * When defined, standby + lockScreen gates passed in App (each enable + active).
	 * locked is always true here; PIN overlay still requires password length > 0.
	 * passwordSignal: Crestron serial signal holding the correct PIN/password.
	 */
	Lock?: { locked: boolean; passwordSignal: string; img?: string };
	AutoPowerOffWarning?: AutoPowerOffWarningDialogProps;
	IncomingCallVideo?: IncomingCallDialogProps;
	IncomingCallAudio?: IncomingCallDialogProps;
	Redirect?: number;
	Theme?: ThemeOption;
}) => {
	const dialogLabelsKey = props.Dialogs
		.map((d) => String(d.BottomNavigationActionProps.label ?? ''))
		.join('|');

	const videoConnected = useSignalStore(
		(s) => s.booleans[signalConfig.call.video.connected] ?? false,
	);
	const audioConnected = useSignalStore(
		(s) => s.booleans[signalConfig.call.audio.connected] ?? false,
	);
	const callConnected = videoConnected || audioConnected;
	const meetingJoinable = useSignalStore(
		(s) => s.booleans[signalConfig.nextMeeting.joinable] ?? false,
	);

	const [pages, setPages] = React.useState(
		props.Pages.filter((page): page is PageDescriptor => page !== undefined).sort((a, b) => a.label.localeCompare(b.label)),
	);

	const pinCall = callConnected && pages.some((page) => page.id === PIN_CALL_PAGE_ID);
	const pinMeeting =
		meetingJoinable &&
		props.Dialogs.some(
			(d) => String(d.BottomNavigationActionProps.label ?? '') === PIN_MEETING_LABEL,
		);

	const navStructureKey = React.useMemo(
		() => `${pages.map((p) => p.id).join('|')}::${dialogLabelsKey}::pin:${pinCall}:${pinMeeting}`,
		[pages, dialogLabelsKey, pinCall, pinMeeting],
	);

	const [activePageId, setActivePageId] = React.useState<string | undefined>(undefined);
	const [displayedPageId, setDisplayedPageId] = React.useState<string | undefined>(undefined);
	const prefersReducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)');

	React.useEffect(() => {
		if (!activePageId) return;
		if (!displayedPageId) {
			setDisplayedPageId(activePageId);
			return;
		}
		if (activePageId === displayedPageId) return;

		const delay = prefersReducedMotion ? 0 : PAGE_CARD_EXIT_MS;
		const timer = window.setTimeout(() => {
			setDisplayedPageId(activePageId);
		}, delay);

		return () => window.clearTimeout(timer);
	}, [activePageId, displayedPageId, prefersReducedMotion]);
	const navItems = React.useMemo(() => buildNavItems(pages, props.Dialogs), [pages, props.Dialogs]);
	const { scrollNavItems, pinnedNavItems } = React.useMemo(
		() => partitionNavItems(navItems, pinCall, pinMeeting),
		[navItems, pinCall, pinMeeting],
	);
	const scrollNavIndex = React.useMemo(
		() =>
			scrollNavItems.findIndex(
				(item) => item.kind === 'page' && item.data.id === activePageId,
			),
		[scrollNavItems, activePageId],
	);

	const navigationDismiss = useNavigationDismissRegistry();

	const navigateToPage = React.useCallback(
		(pageId: string) => {
			if (!pageId) return;
			if (pageId === activePageId) {
				navigationDismiss?.dismissAll();
				return;
			}
			navigationDismiss?.dismissAll();
			closeNavDialogs(props.Dialogs);
			setActivePageId(pageId);
		},
		[activePageId, navigationDismiss, props.Dialogs],
	);

	const handleNavigationChange = React.useCallback(
		(event: React.SyntheticEvent, newValue: number) => {
			const item = scrollNavItems[newValue];
			if (!item || item.kind !== 'page') return;
			navigateToPage(item.data.id);
		},
		[scrollNavItems, navigateToPage],
	);

	const handleDialogNavClick = React.useCallback(
		(onClick?: React.MouseEventHandler<HTMLElement>) =>
			(event: React.MouseEvent<HTMLElement>) => {
				closeNavDialogs(props.Dialogs);
				onClick?.(event);
			},
		[props.Dialogs],
	);

	const prevPinCallRef = React.useRef<boolean | null>(null);
	const prevPinMeetingRef = React.useRef<boolean | null>(null);
	const prevVideoConnectedRef = React.useRef(videoConnected);
	const prevAudioConnectedRef = React.useRef(audioConnected);
	const setFocusChannel = useCallUiStore((state) => state.setFocusChannel);

	// When a nav item first becomes pinned, navigate to it (Call page or Meeting dialog).
	React.useEffect(() => {
		if (prevPinCallRef.current === null) {
			prevPinCallRef.current = pinCall;
			prevPinMeetingRef.current = pinMeeting;
			prevVideoConnectedRef.current = videoConnected;
			prevAudioConnectedRef.current = audioConnected;
			return;
		}

		if (props.Standby?.active) {
			prevPinCallRef.current = pinCall;
			prevPinMeetingRef.current = pinMeeting;
			prevVideoConnectedRef.current = videoConnected;
			prevAudioConnectedRef.current = audioConnected;
			return;
		}

		const callJustPinned = pinCall && !prevPinCallRef.current;
		const meetingJustPinned = pinMeeting && !prevPinMeetingRef.current;
		const videoJustConnected = videoConnected && !prevVideoConnectedRef.current;
		const audioJustConnected = audioConnected && !prevAudioConnectedRef.current;

		if (callJustPinned) {
			navigationDismiss?.dismissAll();
			closeNavDialogs(props.Dialogs);
			setActivePageId(PIN_CALL_PAGE_ID);
			const focusChannel: CallChannelKey =
				videoJustConnected || !audioJustConnected ? 'video' : 'audio';
			setFocusChannel(focusChannel);
		} else if (meetingJustPinned) {
			const meetingDialog = props.Dialogs.find(
				(dialog) =>
					String(dialog.BottomNavigationActionProps.label ?? '') === PIN_MEETING_LABEL,
			);
			meetingDialog?.BottomNavigationActionProps.onClick?.(
				{} as React.MouseEvent<HTMLElement>,
			);
		}

		prevPinCallRef.current = pinCall;
		prevPinMeetingRef.current = pinMeeting;
		prevVideoConnectedRef.current = videoConnected;
		prevAudioConnectedRef.current = audioConnected;
	}, [pinCall, pinMeeting, videoConnected, audioConnected, props.Standby?.active, props.Dialogs, setFocusChannel, navigationDismiss]);

	// Track which pages have been visited so we lazy-mount on first visit
	// but keep them mounted (display:none) once seen — preserves scroll
	// position and any internal state on subsequent nav switches.
	const [visitedPageIds, setVisitedPageIds] = React.useState<Set<string>>(
		() => new Set<string>(),
	);

	const setThemeMode = useAppStore((state) => state.setThemeMode);

	React.useEffect(() => {
		if (props.Theme) {
			setThemeMode(props.Theme.themeValue);
		}
	}, [props.Theme]);

	// Add the active page id to the visited set so it gets mounted.
	React.useEffect(() => {
		if (!activePageId) return;
		setVisitedPageIds((prev) => {
			if (prev.has(activePageId)) return prev;
			const next = new Set(prev);
			next.add(activePageId);
			return next;
		});
	}, [activePageId]);

	React.useEffect(() => {
		const sorted = props.Pages
			.filter((page): page is PageDescriptor => page !== undefined)
			.sort((a, b) => a.label.localeCompare(b.label));

		setActivePageId((prev) => {
			if (prev && sorted.some((page) => page.id === prev)) return prev;
			return getFirstPageId(buildNavItems(sorted, props.Dialogs));
		});

		setPages(sorted);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [props.Pages, dialogLabelsKey]);

	// Correct activePageId if it ever points at a removed page while pages exist.
	React.useEffect(() => {
		if (pages.length === 0) return;
		if (activePageId && pages.some((page) => page.id === activePageId)) return;
		const firstPageId = getFirstPageId(navItems);
		if (firstPageId && firstPageId !== activePageId) {
			setActivePageId(firstPageId);
		}
	}, [activePageId, navItems, pages.length]);

	React.useEffect(() => {
		if (props.Redirect !== undefined && props.Redirect < pages.length) {
			const targetPage = pages[props.Redirect];
			if (targetPage) {
				navigateToPage(targetPage.id);
			}
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [props.Redirect]);

	const standbyWasActive = React.useRef(props.Standby?.active ?? false);
	const standbyActivatedAt = React.useRef<number>(0);
	const prevStandbyActive = React.useRef(props.Standby?.active);

	// Lock screen state — tracks whether the user has unlocked during this standby session
	const [lockScreenUnlocked, setLockScreenUnlocked] = React.useState(false);
	const password = useSignalStore((s) =>
		props.Lock ? (s.strings[props.Lock.passwordSignal] ?? '') : '',
	);

	// Reset unlock state when standby becomes active with lock enabled, or when lock is re-engaged during standby
	React.useEffect(() => {
		if (props.Standby?.enable && props.Standby?.active && props.Lock?.locked) {
			setLockScreenUnlocked(false);
		}
	}, [props.Standby?.enable, props.Standby?.active, props.Lock?.locked]);

	const showLockScreen = Boolean(
		props.Standby?.enable &&
		props.Standby?.active &&
		props.Lock?.locked &&
		!lockScreenUnlocked,
	);

	// Track when standby activates — set synchronously during render
	// so the guard timestamp is available before the first paint/event
	if (props.Standby?.active && !prevStandbyActive.current) {
		standbyActivatedAt.current = Date.now();
	}
	prevStandbyActive.current = props.Standby?.active;

	React.useEffect(() => {
		if (props.Standby?.active) {
			standbyWasActive.current = true;
			setActivePageId(undefined);
			if (document.activeElement instanceof HTMLElement) {
				document.activeElement.blur();
			}
		} else if (standbyWasActive.current) {
			standbyWasActive.current = false;
			setActivePageId(getFirstPageId(navItems));
		}
	}, [props.Standby, navItems]);

	// Move DOM manipulation to useEffect to avoid running on every render
	React.useEffect(() => {
		document.body.style.height = '100vh';
		document.body.style.width = '100%';
		document.body.style.overflow = 'hidden';
		const root = document.getElementById('root');
		if (root) {
			root.style.height = '100%';
			root.style.width = '100%';
		}
	}, []);

	const theme = useTheme();
	const isDark = theme.palette.mode === 'dark';

	// Content scroll arrows — lifted to RoomControls so they're never hidden/remounted
	const [canScrollUp, setCanScrollUp] = React.useState(false);
	const [canScrollDown, setCanScrollDown] = React.useState(false);
	const isPageOverlayOpen = useIsPageOverlayOpen();
	const showPageScrollUp = canScrollUp && !isPageOverlayOpen;
	const showPageScrollDown = canScrollDown && !isPageOverlayOpen;
	const activePageIdRef = React.useRef(activePageId);
	activePageIdRef.current = activePageId;

	// Reset arrow state when switching pages so the fade-in transition always fires
	React.useEffect(() => {
		setCanScrollUp(false);
		setCanScrollDown(false);
	}, [activePageId]);

	// Stable callback — uses ref to read current page without recreating
	const handleScrollStateChange = React.useCallback(
		(pageId: string, up: boolean, down: boolean) => {
			if (pageId === activePageIdRef.current) {
				setCanScrollUp(up);
				setCanScrollDown(down);
			}
		},
		[],
	);

	const pageRefs = React.useRef<Record<string, PageHandle | null>>({});

	const scrollContainerRef = React.useRef<HTMLDivElement>(null);
	const pinnedContainerRef = React.useRef<HTMLDivElement>(null);
	const navScrollLeftRef = React.useRef(0);
	const [isOverflowing, setIsOverflowing] = React.useState(false);
	const [canScrollLeft, setCanScrollLeft] = React.useState(false);
	const [canScrollRight, setCanScrollRight] = React.useState(false);
	const [uniformNavButtonWidth, setUniformNavButtonWidth] = React.useState<number | null>(null);

	const measureUniformNavButtonWidth = React.useCallback(() => {
		const container = scrollContainerRef.current;
		if (!container) return;
		const savedScrollLeft = Math.max(container.scrollLeft, navScrollLeftRef.current);
		navScrollLeftRef.current = savedScrollLeft;

		const scrollButtons = Array.from(
			container.querySelectorAll<HTMLElement>('.MuiBottomNavigationAction-root'),
		);
		const pinnedButtons = pinnedContainerRef.current
			? Array.from(
					pinnedContainerRef.current.querySelectorAll<HTMLElement>(
						'.MuiBottomNavigationAction-root',
					),
				)
			: [];
		const buttons = [...scrollButtons, ...pinnedButtons];
		if (buttons.length === 0) {
			setUniformNavButtonWidth(null);
			container.scrollLeft = savedScrollLeft;
			return;
		}

		buttons.forEach((button) => {
			button.style.width = 'max-content';
			button.style.minWidth = 'max-content';
			button.style.maxWidth = 'none';
			button.style.flex = '0 0 auto';
		});

		let maxWidth = 0;
		buttons.forEach((button) => {
			maxWidth = Math.max(maxWidth, Math.ceil(button.getBoundingClientRect().width));
		});

		buttons.forEach((button) => {
			button.style.width = '';
			button.style.minWidth = '';
			button.style.maxWidth = '';
			button.style.flex = '';
		});

		setUniformNavButtonWidth((prev) => (prev === maxWidth ? prev : maxWidth));

		const restoreScroll = () => {
			if (scrollContainerRef.current) {
				scrollContainerRef.current.scrollLeft = savedScrollLeft;
				navScrollLeftRef.current = savedScrollLeft;
			}
		};
		restoreScroll();
		requestAnimationFrame(() => {
			restoreScroll();
			requestAnimationFrame(restoreScroll);
		});
	}, []);

	const checkNavScroll = React.useCallback(() => {
		const el = scrollContainerRef.current;
		if (!el) return;
		navScrollLeftRef.current = el.scrollLeft;
		setIsOverflowing(el.scrollWidth > el.clientWidth);
		setCanScrollLeft(el.scrollLeft > 0);
		setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 4);
	}, []);

	React.useLayoutEffect(() => {
		const savedScrollLeft = Math.max(
			scrollContainerRef.current?.scrollLeft ?? 0,
			navScrollLeftRef.current,
		);
		navScrollLeftRef.current = savedScrollLeft;
		setUniformNavButtonWidth(null);
		measureUniformNavButtonWidth();
	}, [navStructureKey, measureUniformNavButtonWidth]);

	React.useLayoutEffect(() => {
		const el = scrollContainerRef.current;
		if (el && navScrollLeftRef.current > 0) {
			el.scrollLeft = navScrollLeftRef.current;
		}
	}, [uniformNavButtonWidth, isOverflowing]);

	React.useEffect(() => {
		const el = scrollContainerRef.current;
		if (!el) return;
		const observer = new ResizeObserver(() => {
			const savedScrollLeft = Math.max(el.scrollLeft, navScrollLeftRef.current);
			navScrollLeftRef.current = savedScrollLeft;
			checkNavScroll();
			measureUniformNavButtonWidth();
			requestAnimationFrame(() => {
				if (scrollContainerRef.current) {
					scrollContainerRef.current.scrollLeft = savedScrollLeft;
					navScrollLeftRef.current = savedScrollLeft;
				}
			});
		});
		observer.observe(el);
		if (el.firstElementChild) observer.observe(el.firstElementChild);
		const pinnedEl = pinnedContainerRef.current;
		if (pinnedEl) observer.observe(pinnedEl);
		el.addEventListener('scroll', checkNavScroll, { passive: true });
		checkNavScroll();
		return () => {
			observer.disconnect();
			el.removeEventListener('scroll', checkNavScroll);
		};
	}, [checkNavScroll, measureUniformNavButtonWidth, scrollNavItems.length, pinnedNavItems.length]);

	const scrollNavBy = React.useCallback((direction: 'left' | 'right') => {
		const el = scrollContainerRef.current;
		if (!el) return;
		const btn = el.querySelector<HTMLElement>('.MuiBottomNavigationAction-root');
		const amount = btn ? btn.offsetWidth + 8 : 88;
		el.scrollBy({ left: direction === 'right' ? amount : -amount, behavior: 'smooth' });
	}, []);
	React.useEffect(() => {
		if (!scrollContainerRef.current || scrollNavIndex < 0) return;
		const buttons = scrollContainerRef.current.querySelectorAll<HTMLElement>(
			'.MuiBottomNavigationAction-root',
		);
		buttons[scrollNavIndex]?.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
	}, [scrollNavIndex]);

	const bottomNavContainerStyle = React.useMemo(
		() => ({
			position: 'fixed' as const,
			bottom: 0,
			width: '100%',
			display: 'flex',
			flexDirection: 'row' as const,
			alignItems: 'stretch',
			background: isDark ? gradientNavDark : gradientNavLight,
			borderTop: '2px solid',
			borderColor: 'primary.light',
			boxShadow: isDark ? shadowNavBarDark : shadowNavBar,
			overflow: 'hidden',
			zIndex: 1400,
		}),
		[isDark],
	);

	const navActionStyles = React.useMemo(
		() => ({
			'& .MuiBottomNavigationAction-root': {
				minWidth: uniformNavButtonWidth ?? 'max-content',
				width: uniformNavButtonWidth ?? 'max-content',
				maxWidth: uniformNavButtonWidth ?? 'none',
				flex: uniformNavButtonWidth
					? `0 0 ${uniformNavButtonWidth}px`
					: '0 0 auto',
				flexShrink: 0,
				overflow: 'visible',
				gap: '4px',
				padding: '6px 8px',
				margin: '6px 4px',
				borderRadius: '8px',
				border: '2px solid transparent',
				backgroundColor: 'transparent',
				boxSizing: 'border-box',
				'&.Mui-selected': {
					background: gradientActive,
					borderColor: 'transparent',
					boxShadow: shadowNavBtn,
					color: '#fff',
				},
				'&.nav-popup-active': {
					background: gradientActive,
					borderColor: 'transparent',
					boxShadow: shadowNavBtn,
					color: '#fff',
				},
				'&:hover': {
					borderColor: 'primary.light',
					boxShadow: 3,
				},
				'&.Mui-selected:hover': {
					boxShadow: shadowNavBtnHover,
					borderColor: 'transparent',
				},
				'&.nav-popup-active:hover': {
					boxShadow: shadowNavBtnHover,
					borderColor: 'transparent',
				},
			},
			'& .MuiBottomNavigationAction-root .MuiSvgIcon-root': {
				fontSize: 'clamp(24px, 3.32vw, 64px)',
				color: 'primary.main',
			},
			'& .MuiBottomNavigationAction-root.Mui-selected .MuiSvgIcon-root': {
				fontSize: 'clamp(24px, 3.32vw, 64px)',
				color: '#fff',
			},
			'& .MuiBottomNavigationAction-root.nav-popup-active .MuiSvgIcon-root': {
				fontSize: 'clamp(24px, 3.32vw, 64px)',
				color: '#fff',
			},
			'& .MuiBottomNavigationAction-root .MuiSvgIcon-root.call-nav-connected': {
				color: 'success.main',
			},
			'& .MuiBottomNavigationAction-root.Mui-selected .MuiSvgIcon-root.call-nav-connected': {
				color: 'success.main',
			},
			'& .MuiBottomNavigationAction-root:has(.call-nav-connected) .MuiBottomNavigationAction-label': {
				color: 'success.main',
			},
			'& .MuiBottomNavigationAction-root.Mui-selected:has(.call-nav-connected) .MuiBottomNavigationAction-label':
				{
					color: 'success.main',
				},
			'& .MuiBottomNavigationAction-root:has(.meeting-nav-icon-shell)': {
				position: 'relative',
			},
			'& .MuiBottomNavigationAction-root .MuiSvgIcon-root.meeting-nav-joinable-alert': {
				position: 'absolute',
				top: 'clamp(2px, 0.35vw, 6px)',
				right: 'clamp(2px, 0.35vw, 6px)',
				fontSize: 'clamp(12px, 1.5vw, 26px) !important',
				color: 'warning.main',
				filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.65))',
				pointerEvents: 'none',
				animation: 'meetingJoinableAlert 1.2s ease-in-out infinite',
			},
			'@keyframes meetingJoinableAlert': {
				'0%, 100%': { opacity: 1 },
				'50%': { opacity: 0.25 },
			},
			'& .MuiBottomNavigationAction-root.Mui-selected .MuiSvgIcon-root.meeting-nav-joinable-alert':
				{
					color: 'warning.main',
				},
			'& .MuiBottomNavigationAction-wrapper': {
				width: uniformNavButtonWidth ? '100%' : 'auto',
				minWidth: uniformNavButtonWidth ? 0 : 'max-content',
				maxWidth: 'none',
				overflow: 'visible',
				alignItems: 'center',
			},
			'& .MuiBottomNavigationAction-label': {
				fontSize: 'clamp(12px, 1.66vw, 32px)',
				fontWeight: 600,
				letterSpacing: '0.02em',
				color: 'primary.main',
				whiteSpace: 'nowrap',
				overflow: 'visible',
				textOverflow: 'clip',
				maxWidth: 'none',
				minWidth: 'max-content',
				display: 'block',
				textAlign: 'center',
			},
			'& .MuiBottomNavigationAction-root.Mui-selected .MuiBottomNavigationAction-label': {
				color: '#fff',
				fontWeight: 600,
				fontSize: 'clamp(12px, 1.66vw, 32px)',
			},
			'& .MuiBottomNavigationAction-root.nav-popup-active .MuiBottomNavigationAction-label': {
				color: '#fff',
				fontWeight: 600,
				fontSize: 'clamp(12px, 1.66vw, 32px)',
			},
		}),
		[uniformNavButtonWidth],
	);

	const bottomNavigationStyle = React.useMemo(
		() => ({
			width: 'max-content',
			minWidth: '100%',
			height: '100%',
			background: 'transparent',
			display: 'flex',
			alignItems: 'center',
			justifyContent: isOverflowing ? 'flex-start' : 'space-evenly',
			padding: '0 clamp(4px, 0.55vw, 11px)',
			...navActionStyles,
		}),
		[isOverflowing, navActionStyles],
	);

	const pinnedNavContainerStyle = React.useMemo(
		() => ({
			flexShrink: 0,
			display: 'flex',
			alignItems: 'center',
			height: '100%',
			borderLeft: '1px solid',
			borderColor: 'divider',
			padding: '0 clamp(4px, 0.55vw, 11px)',
			...navActionStyles,
		}),
		[navActionStyles],
	);

	const navBarRef = React.useRef<HTMLDivElement>(null);
	const [navBarHeightPx, setNavBarHeightPx] = React.useState(0);
	React.useEffect(() => {
		const el = navBarRef.current;
		if (!el) return;
		const observer = new ResizeObserver(([entry]) => {
			setNavBarHeightPx(entry.contentRect.height);
		});
		observer.observe(el);
		return () => observer.disconnect();
	}, []);

	// Dialog portals render on document.body — publish nav height on :root so overlays can read it.
	React.useEffect(() => {
		document.documentElement.style.setProperty(navBarHeightCssVar, `${navBarHeightPx}px`);
		return () => {
			document.documentElement.style.removeProperty(navBarHeightCssVar);
		};
	}, [navBarHeightPx]);

	return (
		<ActivePageProvider activePageId={activePageId} displayedPageId={displayedPageId}>
		<Box
			sx={{
				height: '100dvh',
				width: '100%',
				display: 'flex',
				flexDirection: 'column',
				alignItems: 'center',
				[navBarHeightCssVar]: `${navBarHeightPx}px`,
			}}
		>
			<Box
				onClickCapture={(e) => {
					if (Date.now() - standbyActivatedAt.current < 1500) {
						e.stopPropagation();
						e.preventDefault();
					}
				}}
				onPointerDownCapture={(e) => {
					if (Date.now() - standbyActivatedAt.current < 1500) {
						e.stopPropagation();
						e.preventDefault();
					}
				}}
				onPointerUpCapture={(e) => {
					if (Date.now() - standbyActivatedAt.current < 1500) {
						e.stopPropagation();
						e.preventDefault();
					}
				}}
				sx={{
					height: '100dvh',
					width: '100%',
					position: 'absolute',
					display: props.Standby?.enable && props.Standby?.active ? 'flex' : 'none',
					alignContent: 'center',
					justifyContent: 'center',
					alignItems: 'center',
					zIndex: 9999,
				}}
			>
				{showLockScreen && password.length > 0 ? (
					<LockScreen
						password={password}
						onUnlock={() => setLockScreenUnlocked(true)}
						img={props.Lock?.img}
					/>
				) : (
					props.Standby?.screen
				)}
			</Box>
			{
				//BottomNavigationAction Dialogs
				props.Dialogs.map((dialogItem, index) => {
					if (dialogItem.Overlay) {
						return (
							<React.Fragment key={index}>{dialogItem.Overlay}</React.Fragment>
						);
					}
					if (!dialogItem.DialogProps) return null;
					return (
						<Dialog
							key={index}
							{...dialogItem.DialogProps}
						/>
					);
				})
			}
			{props.AutoPowerOffWarning && (
				<AutoPowerOffWarningDialog {...props.AutoPowerOffWarning} />
			)}
			{props.IncomingCallVideo && (
				<IncomingCallDialog {...props.IncomingCallVideo} />
			)}
			{props.IncomingCallAudio && (
				<IncomingCallDialog {...props.IncomingCallAudio} />
			)}
			<Box sx={{ height: `calc(100dvh - ${navBarHeightPx}px)`, width: '100%', display: 'flex', flexDirection: 'column' }}>
				<Box
					sx={{
						...pageScrollArrowStripSx,
						...pageScrollArrowStripActiveSx('up', showPageScrollUp),
					}}
				>
					<IconButton
						onClick={() => activePageId && pageRefs.current[activePageId]?.scrollUp()}
						sx={{
							...pageScrollArrowButtonSx,
							opacity: showPageScrollUp ? 1 : 0,
							pointerEvents: showPageScrollUp ? undefined : 'none',
						}}
					>
						<KeyboardArrowUpIcon />
					</IconButton>
				</Box>
				<Box sx={{ flex: 1, minHeight: 0, width: '100%' }}>
					{pages.map((page) => {
						// Only mount pages the user has actually navigated to; once
						// mounted, keep them mounted via display:none so state and
						// scroll position survive subsequent nav switches.
						if (!visitedPageIds.has(page.id)) return null;
						const isDisplayed = page.id === displayedPageId;
						const refCallback = (el: PageHandle | null) => {
							pageRefs.current[page.id] = el;
							if (el) {
								el.onScrollStateChange = (up, down) =>
									handleScrollStateChange(page.id, up, down);
							}
						};
						return (
							<Box
								sx={{
									display: isDisplayed ? 'flex' : 'none',
									height: '100%',
									width: '100%',
								}}
								key={page.id}
							>
								<React.Suspense fallback={null}>
									{page.render(refCallback)}
								</React.Suspense>
							</Box>
						);
					})}
				</Box>
				<Box
					sx={{
						...pageScrollArrowStripSx,
						...pageScrollArrowStripActiveSx('down', showPageScrollDown),
					}}
				>
					<IconButton
						onClick={() => activePageId && pageRefs.current[activePageId]?.scrollDown()}
						sx={{
							...pageScrollArrowButtonSx,
							opacity: showPageScrollDown ? 1 : 0,
							pointerEvents: showPageScrollDown ? undefined : 'none',
						}}
					>
						<KeyboardArrowDownIcon />
					</IconButton>
				</Box>
			</Box>
			<Box
				ref={navBarRef}
				className='MuiCard-root'
				sx={bottomNavContainerStyle}
			>
				<IconButton
					onClick={() => scrollNavBy('left')}
					sx={{
						flexShrink: 0,
						alignSelf: 'stretch',
						width: 'clamp(28px, 3.87vw, 75px)',
						height: 'auto',
						borderRadius: 0,
						color: 'primary.main',
						borderRight: '1px solid',
						borderColor: 'divider',
						opacity: canScrollLeft ? 1 : 0,
						pointerEvents: canScrollLeft ? undefined : 'none',
						//transition: 'opacity 0.25s ease',
						'& .MuiSvgIcon-root': { fontSize: 'clamp(18px, 2.49vw, 48px)' },
					}}
				>
					<ChevronLeftIcon />
				</IconButton>
				<Box
					ref={scrollContainerRef}
					sx={{
						flex: 1,
						minWidth: 0,
						height: '100%',
						overflowX: 'auto',
						overflowY: 'hidden',
						scrollBehavior: 'smooth',
						scrollbarWidth: 'none',
						'&::-webkit-scrollbar': { display: 'none' },
					}}
				>
					<BottomNavigation
						id='room-controls-bottom-navigation'
						showLabels
						value={scrollNavIndex >= 0 ? scrollNavIndex : false}
						onChange={handleNavigationChange}
						sx={bottomNavigationStyle}
					>
						{scrollNavItems.map((item, navIdx) => {
							if (item.kind === 'page') {
								return (
									<BottomNavigationAction
										key={'page-' + item.data.id}
										icon={item.data.icon}
										label={item.data.label}
										onClick={() => navigateToPage(item.data.id)}
									/>
								);
							}
							return (
								<BottomNavigationAction
									key={'dialog-' + String(item.data.BottomNavigationActionProps.label ?? navIdx)}
									{...item.data.BottomNavigationActionProps}
									onClick={handleDialogNavClick(item.data.BottomNavigationActionProps.onClick)}
									className={
										[
											item.data.BottomNavigationActionProps.className,
											item.data.navActive ? 'nav-popup-active' : undefined,
										]
											.filter(Boolean)
											.join(' ') || undefined
									}
								/>
							);
						})}</BottomNavigation>
				</Box>
				<IconButton
					onClick={() => scrollNavBy('right')}
					sx={{
						flexShrink: 0,
						alignSelf: 'stretch',
						width: 'clamp(28px, 3.87vw, 75px)',
						height: 'auto',
						borderRadius: 0,
						color: 'primary.main',
						borderLeft: '1px solid',
						borderColor: 'divider',
						opacity: canScrollRight ? 1 : 0,
						pointerEvents: canScrollRight ? undefined : 'none',
						//transition: 'opacity 0.25s ease',
						'& .MuiSvgIcon-root': { fontSize: 'clamp(18px, 2.49vw, 48px)' },
					}}
				>
					<ChevronRightIcon />
				</IconButton>
				{pinnedNavItems.length > 0 ? (
					<Box ref={pinnedContainerRef} sx={pinnedNavContainerStyle}>
						{pinnedNavItems.map((item) => {
							if (item.kind === 'page') {
								return (
									<BottomNavigationAction
										key={'pinned-page-' + item.data.id}
										showLabel
										icon={item.data.icon}
										label={item.data.label}
										selected={activePageId === item.data.id}
										onClick={() => navigateToPage(item.data.id)}
									/>
								);
							}
							return (
								<BottomNavigationAction
									key={
										'pinned-dialog-' +
										String(item.data.BottomNavigationActionProps.label ?? '')
									}
									showLabel
									{...item.data.BottomNavigationActionProps}
									onClick={handleDialogNavClick(item.data.BottomNavigationActionProps.onClick)}
									selected={Boolean(item.data.navActive)}
								/>
							);
						})}
					</Box>
				) : null}
			</Box>
		</Box>
		</ActivePageProvider>

	);
};

export default RoomControls;
