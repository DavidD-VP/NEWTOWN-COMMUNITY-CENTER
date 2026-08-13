import React from 'react';



import {

	Box,

	Dialog,

} from '@mui/material';

import {

	touchPanelOverlayBackdropProps,

	touchPanelOverlayContainerSx,

	touchPanelOverlayPageBandShellSx,

	touchPanelOverlayCardSx,

	touchPanelOverlayPaperSx,

	overlayPageContentInsetSx,

	overlayBodyContentInsetSx,

	overlayDialogShellResetSx,

} from './touchPanelOverlayStyles';

import {

	OverlayScrollArrowStrip,

	OverlayScrollBody,

	useOverlayScrollControl,

} from './OverlayScrollBody';

import OverlayCardHeader, { OverlayCardHeaderShell } from './OverlayCardHeader';

import { useRegisterOverlayOpen } from './OverlayOpenContext';
import { useDismissOnNavigation } from './NavigationDismissContext';

import { cardPaddingH, cardPaddingV, cardSectionGap } from '../theme/tokens';



export type TouchPanelOverlayProps = {

	open: boolean;

	onClose: () => void;

	title?: string;

	icon?: React.ReactNode;

	children: React.ReactNode;

	/** Pinned below the header; only children scroll (e.g. list search / paging). */

	pinnedContent?: React.ReactNode;

	footer?: React.ReactNode;

	/** Extra header actions rendered before Close (e.g. Confirm, Join). */

	headerActions?: React.ReactNode;

	showCloseButton?: boolean;

	disableBackdropClose?: boolean;

	disableEscapeKeyDown?: boolean;

	zIndex?: number;

	/** Release focus trap so a stacked overlay (e.g. keyboard) can receive clicks. */
	disableEnforceFocus?: boolean;

	/** Ignore pointer events on this shell while a stacked overlay is open. */
	pointerEventsDisabled?: boolean;

	/** When false, uses inset dialog without scroll arrows. Defaults to true. */

	scrollable?: boolean;

};



const overlayEdgePadding = `${cardPaddingV} ${cardPaddingH}`;



const TouchPanelOverlay: React.FC<TouchPanelOverlayProps> = (props) => {

	const scrollable = props.scrollable ?? true;

	useRegisterOverlayOpen(props.open);

	useDismissOnNavigation(() => {
		if (props.open && !props.disableBackdropClose) {
			props.onClose();
		}
	});

	const showClose = props.showCloseButton !== false;

	const hasHeader = Boolean(props.title || props.icon || showClose || props.headerActions);



	const {

		scrollRef,

		scrollState,

		setScrollState,

		scrollUp,

		scrollDown,

	} = useOverlayScrollControl(props.open && scrollable);



	const handleClose = React.useCallback(

		(_event: object, reason: 'backdropClick' | 'escapeKeyDown') => {

			if (props.disableBackdropClose && reason === 'backdropClick') {

				return;

			}

			props.onClose();

		},

		[props.disableBackdropClose, props.onClose],

	);



	const headerContent = hasHeader ? (

		<OverlayCardHeaderShell

			contentPadding={overlayEdgePadding}

		>

			<OverlayCardHeader

				title={props.title}

				icon={props.icon}

				onClose={props.onClose}

				showClose={showClose}

				headerActions={props.headerActions}

			/>

		</OverlayCardHeaderShell>

	) : null;



	const footerContent = props.footer ? (

		<Box

			sx={{

				flexShrink: 0,

				borderTop: '2px solid rgba(255,255,255,0.25)',

				padding: overlayEdgePadding,

			}}

		>

			{props.footer}

		</Box>

	) : null;



	const pinnedContent = props.pinnedContent ? (

		<Box sx={{ flexShrink: 0, ...overlayBodyContentInsetSx, pb: cardSectionGap }}>

			{props.pinnedContent}

		</Box>

	) : null;



	const bodyContentInsetSx = {

		...overlayBodyContentInsetSx,

		pt: props.pinnedContent ? 0 : cardPaddingV,

	} as const;



	const scrollBodyContent = (

		<Box sx={bodyContentInsetSx}>

			{props.children}

		</Box>

	);



	const nonScrollBodyContent = (

		<Box

			sx={{

				flexShrink: 0,

				overflow: 'hidden',

				display: 'flex',

				flexDirection: 'column',

				alignItems: 'stretch',

				...bodyContentInsetSx,

			}}

		>

			{props.children}

		</Box>

	);



	return (

		<Dialog

			open={props.open}

			onClose={handleClose}

			disableEnforceFocus={props.disableEnforceFocus}

			disableEscapeKeyDown={props.disableEscapeKeyDown ?? props.disableBackdropClose}

			BackdropProps={touchPanelOverlayBackdropProps}

			sx={{

				...(props.zIndex !== undefined ? { zIndex: props.zIndex } : undefined),

				...(props.pointerEventsDisabled ? { pointerEvents: 'none' } : undefined),

				'& .MuiDialog-container': touchPanelOverlayContainerSx,

				'& .MuiDialog-paper': {
					boxShadow: 'none',
					filter: 'none',
				},

			}}

			PaperProps={{

				elevation: 0,

				sx: scrollable

					? [touchPanelOverlayPageBandShellSx, overlayDialogShellResetSx]

					: touchPanelOverlayPaperSx,

			}}

		>

			{scrollable ? (

				<>

					<OverlayScrollArrowStrip

						direction='up'

						active={scrollState.canScrollUp}

						onClick={scrollUp}

					/>

					<Box

						sx={{

							flex: 1,

							minHeight: 0,

							display: 'flex',

							flexDirection: 'column',

							overflow: 'hidden',

							...overlayPageContentInsetSx,

						}}

					>

						<Box sx={touchPanelOverlayCardSx}>

							{headerContent}

							{pinnedContent}

							<Box

								sx={{

									flex: 1,

									minHeight: 0,

									display: 'flex',

									flexDirection: 'column',

									overflow: 'hidden',

								}}

							>

								<OverlayScrollBody

									scrollRef={scrollRef}

									onScrollStateChange={setScrollState}

								>

									{scrollBodyContent}

								</OverlayScrollBody>

							</Box>

							{footerContent}

						</Box>

					</Box>

					<OverlayScrollArrowStrip

						direction='down'

						active={scrollState.canScrollDown}

						onClick={scrollDown}

					/>

				</>

			) : (

				<>

					{headerContent}

					{pinnedContent}

					{nonScrollBodyContent}

					{footerContent}

				</>

			)}

		</Dialog>

	);

};



export default TouchPanelOverlay;


