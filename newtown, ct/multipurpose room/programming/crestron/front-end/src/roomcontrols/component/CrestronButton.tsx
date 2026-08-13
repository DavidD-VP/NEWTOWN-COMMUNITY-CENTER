import { Button, ButtonProps } from '@mui/material';
import {
	useSignalStore,
	publishEvent,
	releaseBooleanIfHigh,
} from '../../crestron/CrComLib';
import * as React from 'react';
import { useMomentaryPressRegistry } from './MomentaryPressContext';

export type CrestronButtonProps = {
	signal: string;
	alwaysOutlined?: boolean;
	ButtonProps?: ButtonProps;
};

const CrestronButton = (props: CrestronButtonProps): JSX.Element => {
	const value = useSignalStore((s) => s.booleans[props.signal] ?? false);
	const momentaryPress = useMomentaryPressRegistry();

	const originalOnPointerDown = React.useRef(
		props.ButtonProps?.onPointerDown,
	);
	const originalOnPointerUp = React.useRef(props.ButtonProps?.onPointerUp);
	const originalOnPointerLeave = React.useRef(
		props.ButtonProps?.onPointerLeave,
	);
	const originalOnPointerOut = React.useRef(props.ButtonProps?.onPointerOut);

	const handlePointerDown = React.useCallback(
		(event: React.PointerEvent<HTMLButtonElement>) => {
			if (event.currentTarget.disabled) {
				return;
			}
			if (originalOnPointerDown.current) {
				originalOnPointerDown.current(event);
			}
			momentaryPress?.registerActivePress(props.signal);
			publishEvent('boolean', props.signal, true);
		},
		[props.signal, momentaryPress],
	);

	const handlePointerRelease = React.useCallback(
		(
			event: React.PointerEvent<HTMLButtonElement>,
			originalHandler?: (
				event: React.PointerEvent<HTMLButtonElement>,
			) => void,
		) => {
			if (originalHandler) {
				originalHandler(event);
			}
			momentaryPress?.unregisterActivePress(props.signal);
			publishEvent('boolean', props.signal, false);
		},
		[props.signal, momentaryPress],
	);

	const handlePointerUp = React.useCallback(
		(event: React.PointerEvent<HTMLButtonElement>) => {
			handlePointerRelease(event, originalOnPointerUp.current);
		},
		[handlePointerRelease],
	);

	const handlePointerLeave = React.useCallback(
		(event: React.PointerEvent<HTMLButtonElement>) => {
			handlePointerRelease(event, originalOnPointerLeave.current);
		},
		[handlePointerRelease],
	);

	const handlePointerOut = React.useCallback(
		(event: React.PointerEvent<HTMLButtonElement>) => {
			handlePointerRelease(event, originalOnPointerOut.current);
		},
		[handlePointerRelease],
	);

	const buttonProps = React.useMemo(() => {
		const {
			onMouseDown,
			onMouseUp,
			onMouseLeave,
			onMouseOut,
			onPointerDown,
			onPointerUp,
			onPointerLeave,
			onPointerOut,
			disabled,
			variant: _variant,
			...restProps
		} = props.ButtonProps || {};
		return {
			...restProps,
			disabled,
			variant: props.alwaysOutlined || disabled ? 'outlined' : value ? 'contained' : 'outlined',
			onPointerDown: handlePointerDown,
			onPointerUp: handlePointerUp,
			onPointerLeave: handlePointerLeave,
			onPointerOut: handlePointerOut,
		} as ButtonProps;
	}, [
		props.ButtonProps,
		value,
		props.alwaysOutlined,
		handlePointerDown,
		handlePointerUp,
		handlePointerLeave,
		handlePointerOut,
	]);

	React.useEffect(() => {
		originalOnPointerDown.current = props.ButtonProps?.onPointerDown;
		originalOnPointerUp.current = props.ButtonProps?.onPointerUp;
		originalOnPointerLeave.current = props.ButtonProps?.onPointerLeave;
		originalOnPointerOut.current = props.ButtonProps?.onPointerOut;
	}, [
		props.ButtonProps?.onMouseDown,
		props.ButtonProps?.onMouseUp,
		props.ButtonProps?.onMouseLeave,
		props.ButtonProps?.onMouseOut,
		props.ButtonProps?.onPointerDown,
		props.ButtonProps?.onPointerUp,
		props.ButtonProps?.onPointerLeave,
		props.ButtonProps?.onPointerOut,
	]);

	React.useEffect(() => {
		return () => {
			momentaryPress?.unregisterActivePress(props.signal);
			releaseBooleanIfHigh(props.signal);
		};
	}, [props.signal, momentaryPress]);

	return <Button {...buttonProps} />;
};

export default CrestronButton;
