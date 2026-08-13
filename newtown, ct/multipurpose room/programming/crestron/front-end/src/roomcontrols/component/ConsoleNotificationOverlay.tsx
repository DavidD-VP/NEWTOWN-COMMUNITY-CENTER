import * as React from 'react';
import {
	Alert,
	Box,
	Button,
	Chip,
	Collapse,
	Fab,
	IconButton,
	Paper,
	Typography,
} from '@mui/material';
import BugReportIcon from '@mui/icons-material/BugReport';
import CloseIcon from '@mui/icons-material/Close';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';

import {
	type DebugLogEntry,
	type DebugLogLevel,
	useDebugLogStore,
} from '../../store/debugLogStore';

const TOAST_AUTO_HIDE_MS = 6000;

function severityForLevel(level: DebugLogLevel): 'info' | 'warning' | 'error' {
	switch (level) {
		case 'warn':
			return 'warning';
		case 'error':
			return 'error';
		default:
			return 'info';
	}
}

function formatTime(time: number): string {
	return new Date(time).toLocaleTimeString(undefined, {
		hour12: false,
		hour: '2-digit',
		minute: '2-digit',
		second: '2-digit',
	});
}

const DebugToast: React.FC<{
	entry: DebugLogEntry;
	onDismiss: () => void;
}> = ({ entry, onDismiss }) => {
	React.useEffect(() => {
		const id = window.setTimeout(onDismiss, TOAST_AUTO_HIDE_MS);
		return () => window.clearTimeout(id);
	}, [entry.id, onDismiss]);

	return (
		<Alert
			severity={severityForLevel(entry.level)}
			onClose={onDismiss}
			sx={{
				width: 'min(420px, calc(100vw - 32px))',
				boxShadow: 4,
				wordBreak: 'break-word',
				'& .MuiAlert-message': { fontSize: '0.8125rem' },
			}}
		>
			<Typography component='span' variant='caption' sx={{ opacity: 0.8, mr: 1 }}>
				{formatTime(entry.time)}
			</Typography>
			{entry.text}
		</Alert>
	);
};

const ConsoleNotificationOverlay: React.FC = () => {
	const entries = useDebugLogStore((s) => s.entries);
	const activeToasts = useDebugLogStore((s) => s.activeToasts);
	const panelOpen = useDebugLogStore((s) => s.panelOpen);
	const removeToast = useDebugLogStore((s) => s.removeToast);
	const clearLogs = useDebugLogStore((s) => s.clearLogs);
	const togglePanel = useDebugLogStore((s) => s.togglePanel);
	const setPanelOpen = useDebugLogStore((s) => s.setPanelOpen);

	const logEndRef = React.useRef<HTMLDivElement>(null);

	React.useEffect(() => {
		if (panelOpen) {
			logEndRef.current?.scrollIntoView({ behavior: 'smooth' });
		}
	}, [panelOpen, entries.length]);

	return (
		<>
			<Box
				sx={{
					position: 'fixed',
					top: 12,
					right: 12,
					zIndex: 9500,
					display: 'flex',
					flexDirection: 'column',
					gap: 1,
					pointerEvents: 'none',
					'& > *': { pointerEvents: 'auto' },
				}}
			>
				{activeToasts.map((entry) => (
					<DebugToast
						key={entry.id}
						entry={entry}
						onDismiss={() => removeToast(entry.id)}
					/>
				))}
			</Box>

			<Fab
				size='small'
				color='secondary'
				aria-label='Debug log'
				onClick={togglePanel}
				sx={{
					position: 'fixed',
					bottom: panelOpen ? 'calc(40vh + 16px)' : 88,
					right: 16,
					zIndex: 9501,
					transition: 'bottom 0.2s ease',
				}}
			>
				<BugReportIcon />
			</Fab>

			{entries.length > 0 && !panelOpen ? (
				<Chip
					label={`Debug (${entries.length})`}
					size='small'
					onClick={togglePanel}
					sx={{
						position: 'fixed',
						bottom: 88,
						right: 72,
						zIndex: 9501,
					}}
				/>
			) : null}

			<Collapse in={panelOpen}>
				<Paper
					elevation={8}
					sx={{
						position: 'fixed',
						left: 0,
						right: 0,
						bottom: 0,
						height: '40vh',
						zIndex: 9500,
						display: 'flex',
						flexDirection: 'column',
						borderTopLeftRadius: 12,
						borderTopRightRadius: 12,
					}}
				>
					<Box
						sx={{
							display: 'flex',
							alignItems: 'center',
							justifyContent: 'space-between',
							px: 2,
							py: 1,
							borderBottom: 1,
							borderColor: 'divider',
							flexShrink: 0,
						}}
					>
						<Typography variant='subtitle2' fontWeight={700}>
							Debug console ({entries.length})
						</Typography>
						<Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
							<Button size='small' onClick={clearLogs}>
								Clear
							</Button>
							<IconButton
								size='small'
								aria-label='Collapse debug log'
								onClick={() => setPanelOpen(false)}
							>
								<ExpandLessIcon />
							</IconButton>
							<IconButton
								size='small'
								aria-label='Close debug log'
								onClick={() => setPanelOpen(false)}
							>
								<CloseIcon fontSize='small' />
							</IconButton>
						</Box>
					</Box>

					<Box
						sx={{
							flex: 1,
							overflow: 'auto',
							px: 2,
							py: 1,
							fontFamily: 'monospace',
							fontSize: '0.75rem',
							lineHeight: 1.45,
						}}
					>
						{entries.length === 0 ? (
							<Typography variant='body2' color='text.secondary'>
								No log entries yet.
							</Typography>
						) : (
							entries.map((entry) => (
								<Box
									key={entry.id}
									sx={{
										mb: 0.75,
										color:
											entry.level === 'error'
												? 'error.main'
												: entry.level === 'warn'
													? 'warning.dark'
													: 'text.primary',
									}}
								>
									<Typography
										component='span'
										variant='caption'
										sx={{ opacity: 0.65, mr: 1 }}
									>
										[{formatTime(entry.time)}] {entry.level}:
									</Typography>
									<Typography component='span' variant='caption'>
										{entry.text}
									</Typography>
								</Box>
							))
						)}
						<div ref={logEndRef} />
					</Box>
				</Paper>
			</Collapse>
		</>
	);
};

export default ConsoleNotificationOverlay;
