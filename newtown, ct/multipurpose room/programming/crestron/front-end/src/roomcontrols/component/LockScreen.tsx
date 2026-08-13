import * as React from 'react';
import { Box, Typography, IconButton } from '@mui/material';
import BackspaceIcon from '@mui/icons-material/Backspace';
import LockIcon from '@mui/icons-material/Lock';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import { useTheme } from '@mui/material/styles';

import {
	gradientNavDark,
	gradientNavLight,
	shadowNavBar,
	shadowNavBarDark,
	scrollArrowHeight,
} from '../theme/tokens';

// ── Types ─────────────────────────────────────────────────────────────────────

export type LockScreenProps = {
	/**
	 * The correct PIN/password.  Read from a Crestron serial signal via
	 * useSignalStore in the parent and passed in here so this component stays
	 * stateless with regard to Crestron.
	 */
	password: string;
	/**
	 * Called when the user successfully enters the correct password.
	 */
	onUnlock: () => void;
	/** Optional logo / image to show at the top of the lock screen. */
	img?: string;
};

// ── Keypad ────────────────────────────────────────────────────────────────────

const KEYS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', 'back'] as const;

const LockScreen: React.FC<LockScreenProps> = ({ password, onUnlock, img }) => {
	const theme = useTheme();
	const isDark = theme.palette.mode === 'dark';

	const [entry, setEntry] = React.useState('');
	const [shake, setShake] = React.useState(false);

	// Attempt unlock whenever entry length matches password length
	React.useEffect(() => {
		if (password.length === 0) return;
		if (entry.length < password.length) return;

		if (entry === password) {
			onUnlock();
			setEntry('');
		} else {
			setShake(true);
			setTimeout(() => {
				setShake(false);
				setEntry('');
			}, 600);
		}
	}, [entry, password, onUnlock]);

	const handleKey = React.useCallback((key: string) => {
		if (key === 'back') {
			setEntry((prev) => prev.slice(0, -1));
		} else {
			setEntry((prev) => (prev.length < 16 ? prev + key : prev));
		}
	}, []);

	const dots = password.length > 0 ? password.length : 4;

	// Scroll arrow state
	const [scrollEl, setScrollEl] = React.useState<HTMLDivElement | null>(null);
	const [canScrollUp, setCanScrollUp] = React.useState(false);
	const [canScrollDown, setCanScrollDown] = React.useState(false);

	const checkScroll = React.useCallback((el: HTMLDivElement | null) => {
		if (!el) return;
		setCanScrollUp(el.scrollTop > 0);
		setCanScrollDown(el.scrollTop < el.scrollHeight - el.clientHeight - 4);
	}, []);

	const scrollBy = React.useCallback((direction: 'up' | 'down') => {
		if (!scrollEl) return;
		scrollEl.scrollBy({ top: direction === 'down' ? scrollEl.clientHeight * 0.75 : -(scrollEl.clientHeight * 0.75), behavior: 'smooth' });
	}, [scrollEl]);

	React.useEffect(() => {
		if (!scrollEl) return;
		const handler = () => checkScroll(scrollEl);
		const observer = new ResizeObserver(handler);
		observer.observe(scrollEl);
		if (scrollEl.firstElementChild) observer.observe(scrollEl.firstElementChild);
		scrollEl.addEventListener('scroll', handler, { passive: true });
		handler();
		return () => {
			observer.disconnect();
			scrollEl.removeEventListener('scroll', handler);
		};
	}, [scrollEl, checkScroll]);

	return (
		<Box
			sx={{
				width: '100%',
				height: '100%',
				backgroundColor: 'background.default',
				display: 'flex',
				flexDirection: 'column',
				alignItems: 'stretch',
				overflow: 'hidden',
			}}
		>
			{/* Scroll up arrow */}
			<IconButton
				onClick={() => scrollBy('up')}
				sx={{
					flexShrink: 0,
					width: '100%',
					height: scrollArrowHeight,
					borderRadius: 0,
					color: 'primary.main',
					borderBottom: '1px solid',
					borderColor: 'primary.light',
					pointerEvents: canScrollUp ? undefined : 'none',
					'& .MuiSvgIcon-root': { fontSize: 'clamp(18px, 2.49vw, 48px)' },
					display: canScrollUp ? 'flex' : 'none',
					background: 'transparent',
				}}
			>
				<KeyboardArrowUpIcon />
			</IconButton>

			{/* Scrollable content */}
			<Box
				ref={setScrollEl}
				sx={{
					flex: 1,
					overflowY: 'auto',
					scrollbarWidth: 'none',
					'&::-webkit-scrollbar': { display: 'none' },
					display: 'flex',
					flexDirection: 'column',
					alignItems: 'center',
					justifyContent: 'center',
					py: 'clamp(16px, 2.21vw, 43px)',
					gap: 'clamp(6px, min(1.1vw, 1.5vh), 22px)',
				}}
			>
				{/* Logo */}
				{img ? (
					<img
						src={img}
						style={{ maxWidth: '60vw', maxHeight: '15vh', objectFit: 'contain' }}
					/>
				) : (
					<Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
						<LockIcon sx={{ fontSize: 'clamp(24px, min(3.87vw, 5.5vh), 75px)', color: 'primary.main' }} />
						<Typography sx={{ fontSize: 'clamp(16px, min(2.49vw, 3.5vh), 48px)', fontWeight: 700, color: 'text.primary' }}>
							Locked
						</Typography>
					</Box>
				)}

				{/* PIN dots */}
				<Box
					sx={{
						display: 'flex',
						gap: 'clamp(6px, min(1.1vw, 1.5vh), 22px)',
						animation: shake ? 'shake 0.6s ease' : undefined,
						'@keyframes shake': {
							'0%, 100%': { transform: 'translateX(0)' },
							'20%': { transform: 'translateX(-10px)' },
							'40%': { transform: 'translateX(10px)' },
							'60%': { transform: 'translateX(-10px)' },
							'80%': { transform: 'translateX(10px)' },
						},
					}}
				>
					{Array.from({ length: dots }).map((_, i) => (
						<Box
							key={i}
							sx={{
								width: 'clamp(10px, min(1.66vw, 2.5vh), 32px)',
								height: 'clamp(10px, min(1.66vw, 2.5vh), 32px)',
								borderRadius: '50%',
								border: '2px solid',
								borderColor: 'primary.main',
								backgroundColor: i < entry.length ? 'primary.main' : 'transparent',
								//transition: 'background-color 0.15s ease',
							}}
						/>
					))}
				</Box>

				{/* Keypad */}
				<Box
					sx={{
						display: 'grid',
						gridTemplateColumns: 'repeat(3, 1fr)',
						gap: 'clamp(4px, min(0.83vw, 1.2vh), 16px)',
						width: 'min(clamp(200px, 36vw, 540px), 52vh)',
					}}
				>
					{KEYS.map((key, i) => {
						if (key === '') {
							return <Box key={`space-${i}`} />;
						}
						return (
							<Box
								key={key}
								component='button'
								onClick={() => handleKey(key)}
								sx={{
									aspectRatio: '1 / 1',
									display: 'flex',
									alignItems: 'center',
									justifyContent: 'center',
									borderRadius: '50%',
									border: '2px solid',
									borderColor: 'primary.light',
									background: isDark ? gradientNavDark : gradientNavLight,
									boxShadow: isDark ? shadowNavBarDark : shadowNavBar,
									color: 'primary.main',
									fontWeight: 700,
									fontSize: 'clamp(14px, min(2.49vw, 3.5vh), 48px)',
									cursor: 'pointer',
									//transition: 'background 0.15s, border-color 0.15s, transform 0.1s',
									userSelect: 'none',
									'&:hover': {
										borderColor: 'primary.main',
										transform: 'scale(1.06)',
									},
									'&:active': {
										transform: 'scale(0.95)',
									},
								}}
							>
								{key === 'back' ? (
									<BackspaceIcon sx={{ fontSize: 'clamp(14px, min(2.49vw, 3.5vh), 48px)' }} />
								) : (
									key
								)}
							</Box>
						);
					})}
				</Box>

				<Typography
					sx={{
						fontSize: 'clamp(11px, min(1.66vw, 2vh), 32px)',
						color: 'text.secondary',
						fontStyle: 'italic',
					}}
				>
					Enter PIN to unlock
				</Typography>
			</Box>

			{/* Scroll down arrow */}
			<IconButton
				onClick={() => scrollBy('down')}
				sx={{
					flexShrink: 0,
					width: '100%',
					height: scrollArrowHeight,
					borderRadius: 0,
					color: 'primary.main',
					borderTop: '1px solid',
					borderColor: 'primary.light',
					pointerEvents: canScrollDown ? undefined : 'none',
					'& .MuiSvgIcon-root': { fontSize: 'clamp(18px, 2.49vw, 48px)' },
					display: canScrollDown ? 'flex' : 'none',
					background: 'transparent',
				}}
			>
				<KeyboardArrowDownIcon />
			</IconButton>
		</Box>
	);
};

export default LockScreen;
