import { useCallback, useEffect, useRef, useState } from "react";

export type AsyncDataResult<T> =
	| { success: true; data: T; message?: string }
	| { success: false; error: string; code?: string; status?: number };

interface AsyncDataState<T> {
	data: T;
	loading: boolean;
	error: string | null;
}

interface UseAsyncDataOptions<T> {
	initialData: T;
	enabled?: boolean;
	retainPreviousData?: boolean;
}

export function useAsyncData<T>(
	load: () => Promise<AsyncDataResult<T>>,
	{
		initialData,
		enabled = true,
		retainPreviousData = true,
	}: UseAsyncDataOptions<T>,
) {
	const [reloadKey, setReloadKey] = useState(0);
	const requestRef = useRef(0);
	const [state, setState] = useState<AsyncDataState<T>>({
		data: initialData,
		loading: enabled,
		error: null,
	});

	useEffect(() => {
		if (!enabled) return;

		let active = true;
		const requestId = requestRef.current + 1;
		requestRef.current = requestId;

		void Promise.resolve()
			.then(() => {
				if (!active || requestRef.current !== requestId) return undefined;
				setState((current) => ({
					data: retainPreviousData ? current.data : initialData,
					loading: true,
					error: null,
				}));
				return load();
			})
			.then((result) => {
				if (!result || !active || requestRef.current !== requestId) return;

				if (result.success) {
					setState({
						data: result.data,
						loading: false,
						error: null,
					});
					return;
				}

				setState((current) => ({
					data: retainPreviousData ? current.data : initialData,
					loading: false,
					error: result.error,
				}));
			})
			.catch((error: unknown) => {
				if (!active || requestRef.current !== requestId) return;
				setState((current) => ({
					data: retainPreviousData ? current.data : initialData,
					loading: false,
					error: error instanceof Error ? error.message : "Unexpected error",
				}));
			});

		return () => {
			active = false;
		};
	}, [enabled, initialData, load, reloadKey, retainPreviousData]);

	const refetch = useCallback(() => {
		setReloadKey((current) => current + 1);
	}, []);

	const setData = useCallback((nextData: T | ((current: T) => T)) => {
		setState((current) => ({
			...current,
			data:
				typeof nextData === "function"
					? (nextData as (current: T) => T)(current.data)
					: nextData,
		}));
	}, []);

	return {
		...state,
		refetch,
		setData,
	};
}
