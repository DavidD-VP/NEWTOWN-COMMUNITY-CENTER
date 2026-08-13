import type { ReactNode } from 'react';

/** Select option passed from CameraPage into camera card components. */
export type CameraOption = {
	Label: string;
	Value: number;
	Preview?: ReactNode;
};
