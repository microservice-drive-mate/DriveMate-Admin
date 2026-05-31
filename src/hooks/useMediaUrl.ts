import { useEffect, useState } from "react";

import { getRenderableMediaUrl } from "@/lib";

interface UseMediaUrlResult {
	url: string | null;
	loading: boolean;
	error: string | null;
}

interface MediaUrlState extends UseMediaUrlResult {
	mediaFileId: string | null;
}

export function useMediaUrl(
	mediaFileId: string | null | undefined,
): UseMediaUrlResult {
	const [state, setState] = useState<MediaUrlState>({
		mediaFileId: null,
		url: null,
		loading: false,
		error: null,
	});

	useEffect(() => {
		let cancelled = false;

		if (!mediaFileId) {
			return;
		}

		getRenderableMediaUrl(mediaFileId)
			.then((resolved) => {
				if (cancelled) return;
				setState({
					mediaFileId,
					url: resolved,
					loading: false,
					error: null,
				});
			})
			.catch((err: unknown) => {
				if (cancelled) return;
				setState({
					mediaFileId,
					url: null,
					loading: false,
					error: err instanceof Error ? err.message : "Không thể tải tệp.",
				});
			});

		return () => {
			cancelled = true;
		};
	}, [mediaFileId]);

	if (!mediaFileId) {
		return { url: null, loading: false, error: null };
	}

	if (state.mediaFileId !== mediaFileId) {
		return { url: null, loading: true, error: null };
	}

	return {
		url: state.url,
		loading: state.loading,
		error: state.error,
	};
}
