import { Box, Slider, SliderProps, Typography } from '@mui/material';
import {
	useSignalStore,
	publishEvent,
} from '../../crestron/CrComLib';
import * as React from 'react';

export type CrestronSliderProps = {
	signal: string;
	SliderProps?: SliderProps;
};

const CrestronSlider = (props: CrestronSliderProps): JSX.Element => {
	const storeValue = useSignalStore((s) => s.numbers[props.signal] ?? 0);
	const [displayValue, setDisplayValue] = React.useState<number>(storeValue);

	React.useEffect(() => {
		setDisplayValue(storeValue);
	}, [storeValue]);

	// Memoize the change committed handler
	const handleChange = React.useCallback((event: any, value: any) => {
		setDisplayValue(value as number);
	}, []);

	const handleChangeCommitted = React.useCallback(
		(event: any, value: any) => {
			publishEvent('number', props.signal, value as number);
		},
		[props.signal],
	);

	const max = props.SliderProps?.max ?? 65535;
	const min = props.SliderProps?.min ?? 0;
	const percentage = Math.round(((displayValue - min) / (max - min)) * 100);

	// Memoize SliderProps to avoid expensive lodash.merge on every render
	const sliderProps = React.useMemo(() => {
		return {
			min: 0,
			max: 65535,
			...props.SliderProps,
			value: displayValue,
			onChange: handleChange,
			onChangeCommitted: handleChangeCommitted,
		} as SliderProps;
	}, [props.SliderProps, displayValue, handleChange, handleChangeCommitted]);

	return (
		<Box
			sx={{
				display: 'flex',
				alignItems: 'center',
				gap: 'clamp(8px, 1.11vw, 22px)',
				width: '100%',
			}}
		>
			<Slider
				{...sliderProps}
				sx={[
					{ flex: 1 },
					...(Array.isArray(sliderProps.sx)
						? sliderProps.sx
						: sliderProps.sx ? [sliderProps.sx] : []),
				]}
			/>
			<Typography
				sx={{
					fontSize: 'clamp(13px, 1.80vw, 35px)',
					fontWeight: 600,
					minWidth: 'clamp(36px, 4.98vw, 96px)',
					textAlign: 'center',
				color: 'inherit',
					fontVariantNumeric: 'tabular-nums',
				}}
			>
				{percentage}%
			</Typography>
		</Box>
	);
};

export default CrestronSlider;
