import React from 'react';

import {
	Box,
	CircularProgress,
	IconButton,
	Typography,
	type SxProps,
	type Theme,
} from '@mui/material';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import ClearIcon from '@mui/icons-material/Clear';
import RefreshIcon from '@mui/icons-material/Refresh';

import { publishEvent, useSignalStore } from '../../crestron/CrComLib';
import { scrollArrowHeight, cardInnerGap, cardSectionGap } from '../theme/tokens';
import { selectionMenuItemSx } from './selectionPopoverStyles';
import CrestronButton from './CrestronButton';
import { ctBtn } from '../card/ctCardStyles';
import { connectBtnSx } from './connectCardStyles';

export type SelectListToolbarConfig = {
	refresh?: {
		visibleSignal: string;
		interactionSignal: string;
	};
	paging?: {
		visibleSignal?: string;
		prevSignal: string;
		nextSignal: string;
		pageIndexSignal: string;
		pageCountSignal: string;
		selectSignal?: string;
	};
	search?: {
		visibleSignal: string;
		querySignal: string;
		placeholder?: string;
	};
};

type SelectListToolbarProps = {
	config?: SelectListToolbarConfig;
	onSearchKeyboardOpen?: () => void;
};

const toolbarBtnSx = {
	flexShrink: 0,
	borderRadius: '8px',
	color: '#fff',
	'& .MuiSvgIcon-root': { fontSize: 'clamp(18px, 2.49vw, 48px)', color: '#fff' },
	'&.Mui-disabled': { color: 'rgba(255,255,255,0.28)' },
} as const;

const toolbarRefreshBtnSx = {
	...connectBtnSx,
	minHeight: 'auto',
	height: 'auto',
	py: 'clamp(4px, 0.5vh, 8px)',
	px: 'clamp(8px, 1vw, 14px)',
} as const;

const refreshSpinnerSx = {
	width: 'clamp(20px, 2.77vw, 54px) !important',
	height: 'clamp(20px, 2.77vw, 54px) !important',
} as const;

const toolbarLabelSx = {
	fontSize: 'clamp(14px, 1.94vw, 38px)',
	lineHeight: 1,
	color: '#fff',
	fontWeight: 600,
	textTransform: 'none',
} as const;

const toolbarSectionSx = {
	...selectionMenuItemSx,
	width: '100%',
	boxSizing: 'border-box',
	display: 'flex',
	alignItems: 'center',
	minHeight: scrollArrowHeight,
} as const;

export type SelectListRefreshButtonProps = {
	visibleSignal: string;
	interactionSignal: string;
	buttonSx?: SxProps<Theme>;
	/** Cleared when refresh is pressed (e.g. contact search query). */
	clearSearchSignal?: string;
	/** Reset when refresh is pressed (e.g. list selection / page index). */
	resetSelectSignal?: string;
};

export const SelectListRefreshButton: React.FC<SelectListRefreshButtonProps> = ({
	visibleSignal,
	interactionSignal,
	buttonSx = connectBtnSx,
	clearSearchSignal,
	resetSelectSignal,
}) => {
	const refreshing = useSignalStore((s) => s.booleans[interactionSignal] ?? false);
	const refreshVisible = useSignalStore((s) => s.booleans[visibleSignal] ?? false);

	const handleRefreshPointerDown = React.useCallback(
		(event: React.PointerEvent<HTMLButtonElement>) => {
			if (clearSearchSignal) {
				publishEvent('string', clearSearchSignal, '');
			}
			if (resetSelectSignal) {
				publishEvent('number', resetSelectSignal, 0);
			}
		},
		[clearSearchSignal, resetSelectSignal],
	);

	if (!refreshing && !refreshVisible) {
		return null;
	}

	if (refreshVisible) {
		return (
			<CrestronButton
				signal={interactionSignal}
				ButtonProps={{
					disabled: refreshing,
					sx: buttonSx,
					onPointerDown: handleRefreshPointerDown,
					children: ctBtn(
						refreshing ? (
							<CircularProgress
								aria-hidden
								sx={{
									...refreshSpinnerSx,
									color: 'inherit',
								}}
							/>
						) : (
							<RefreshIcon />
						),
						refreshing ? 'Refreshing' : 'Refresh',
					),
				}}
			/>
		);
	}

	return (
		<Box
			role='status'
			aria-live='polite'
			sx={{
				display: 'flex',
				alignItems: 'center',
				gap: cardInnerGap,
				px: 'clamp(8px, 1vw, 14px)',
			}}
		>
			<Typography variant='caption' sx={{ ...toolbarLabelSx, color: '#fff' }}>
				Refreshing
			</Typography>
			<CircularProgress
				aria-hidden
				sx={{
					...refreshSpinnerSx,
					color: '#fff',
				}}
			/>
		</Box>
	);
};

const SelectListToolbar: React.FC<SelectListToolbarProps> = ({
	config,
	onSearchKeyboardOpen,
}) => {
	const refresh = config?.refresh;
	const paging = config?.paging;
	const search = config?.search;

	const pageIndex = useSignalStore((s) =>
		paging ? (s.numbers[paging.pageIndexSignal] ?? 0) : 0,
	);
	const pageCount = useSignalStore((s) =>
		paging ? (s.numbers[paging.pageCountSignal] ?? 0) : 0,
	);
	const pagingVisibleGate = useSignalStore((s) =>
		paging?.visibleSignal ? (s.booleans[paging.visibleSignal] ?? false) : false,
	);
	const searchVisible = useSignalStore((s) =>
		search ? (s.booleans[search.visibleSignal] ?? false) : false,
	);
	const queryFromStore = useSignalStore((s) =>
		search ? (s.strings[search.querySignal] ?? '') : '',
	);

	const refreshActive = useSignalStore((s) =>
		refresh
			? ((s.booleans[refresh.visibleSignal] ?? false) || (s.booleans[refresh.interactionSignal] ?? false))
			: false,
	);
	const showRefresh = Boolean(refresh && refreshActive);
	const showPaging = Boolean(
		paging && (pageCount > 1 || pagingVisibleGate),
	);
	const showSearch = Boolean(search && searchVisible);

	const safePageIndex = Math.max(1, pageIndex);
	const safePageCount = Math.max(0, pageCount);
	const canGoPrev = safePageIndex > 1;
	const canGoNext = safePageCount > 0 && safePageIndex < safePageCount;

	const searchPlaceholder = search?.placeholder ?? 'Search';
	const hasSearchValue = queryFromStore.trim().length > 0;

	const handlePageChange = React.useCallback(
		(direction: 'prev' | 'next') => {
			if (!paging) return;
			if (direction === 'prev' && !canGoPrev) return;
			if (direction === 'next' && !canGoNext) return;
			if (paging.selectSignal) {
				publishEvent('number', paging.selectSignal, 0);
			}
			const signal = direction === 'prev' ? paging.prevSignal : paging.nextSignal;
			publishEvent('boolean', signal, true);
			publishEvent('boolean', signal, false);
		},
		[paging, canGoPrev, canGoNext],
	);

	const handleClearSearch = React.useCallback(
		(event: React.MouseEvent) => {
			event.stopPropagation();
			if (search) {
				publishEvent('string', search.querySignal, '');
				if (paging?.selectSignal) {
					publishEvent('number', paging.selectSignal, 0);
				}
			}
		},
		[search, paging?.selectSignal],
	);

	if (!showRefresh && !showPaging && !showSearch) {
		return null;
	}

	return (
		<Box
			sx={{
				flexShrink: 0,
				display: 'flex',
				flexDirection: 'column',
				gap: cardSectionGap,
				width: '100%',
			}}
			onClick={(event) => event.stopPropagation()}
			onPointerDown={(event) => event.stopPropagation()}
		>
			{showRefresh && refresh ? (
				<Box sx={toolbarSectionSx}>
					<SelectListRefreshButton
						visibleSignal={refresh.visibleSignal}
						interactionSignal={refresh.interactionSignal}
						clearSearchSignal={search?.querySignal}
						resetSelectSignal={paging?.selectSignal}
						buttonSx={toolbarRefreshBtnSx}
					/>
				</Box>
			) : null}
			{showPaging && paging ? (
				<Box
					sx={{
						...toolbarSectionSx,
						justifyContent: 'space-between',
						gap: cardInnerGap,
					}}
				>
					<IconButton
						disabled={!canGoPrev}
						onPointerDown={(event) => {
							event.stopPropagation();
							handlePageChange('prev');
						}}
						sx={toolbarBtnSx}
						aria-label='Previous page'
					>
						<ChevronLeftIcon />
					</IconButton>
					<Typography
						variant='caption'
						sx={{
							...toolbarLabelSx,
							flex: 1,
							textAlign: 'center',
						}}
						noWrap
					>
						{safePageCount > 0
							? `Page ${safePageIndex} / ${safePageCount}`
							: `Page ${safePageIndex}`}
					</Typography>
					<IconButton
						disabled={!canGoNext}
						onPointerDown={(event) => {
							event.stopPropagation();
							handlePageChange('next');
						}}
						sx={toolbarBtnSx}
						aria-label='Next page'
					>
						<ChevronRightIcon />
					</IconButton>
				</Box>
			) : null}
			{showSearch && search ? (
				<Box
					sx={{
						...toolbarSectionSx,
						gap: cardInnerGap,
						cursor: 'pointer',
					}}
					role='button'
					tabIndex={0}
					aria-label={searchPlaceholder}
					onClick={(event) => {
						event.stopPropagation();
						onSearchKeyboardOpen?.();
					}}
					onKeyDown={(event) => {
						if (event.key === 'Enter' || event.key === ' ') {
							event.preventDefault();
							event.stopPropagation();
							onSearchKeyboardOpen?.();
						}
					}}
					onPointerDown={(event) => event.stopPropagation()}
				>
					<Typography
						variant='caption'
						noWrap
						sx={{
							...toolbarLabelSx,
							flex: 1,
							minWidth: 0,
							textAlign: 'center',
							fontStyle: hasSearchValue ? 'normal' : 'italic',
							fontWeight: hasSearchValue ? 600 : 400,
							opacity: hasSearchValue ? 1 : 0.65,
						}}
					>
						{hasSearchValue ? queryFromStore : searchPlaceholder}
					</Typography>
					{hasSearchValue ? (
						<IconButton
							size='small'
							onClick={handleClearSearch}
							sx={toolbarBtnSx}
							aria-label='Clear search'
						>
							<ClearIcon />
						</IconButton>
					) : null}
				</Box>
			) : null}
		</Box>
	);
};

export default SelectListToolbar;
