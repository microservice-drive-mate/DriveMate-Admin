import { mediaService } from "@/services/media.service"

interface CachedUrl {
	url: string
	expiresAt: number
}

const cache = new Map<string, CachedUrl>()
const inflight = new Map<string, Promise<string>>()

const REFRESH_BUFFER_MS = 60_000

function isCacheValid(entry: CachedUrl | undefined): entry is CachedUrl {
	return !!entry && entry.expiresAt - Date.now() > REFRESH_BUFFER_MS
}

export async function getRenderableMediaUrl(
	mediaFileId: string,
): Promise<string> {
	const cached = cache.get(mediaFileId)
	if (isCacheValid(cached)) return cached.url

	const existing = inflight.get(mediaFileId)
	if (existing) return existing

	const promise = mediaService
		.getDownloadUrl(mediaFileId)
		.then((result) => {
			if (!result.success) {
				throw new Error(result.error)
			}
			const entry: CachedUrl = {
				url: result.data.url,
				expiresAt: new Date(result.data.expiresAt).getTime(),
			}
			cache.set(mediaFileId, entry)
			return entry.url
		})
		.finally(() => {
			inflight.delete(mediaFileId)
		})

	inflight.set(mediaFileId, promise)
	return promise
}

export function invalidateMediaUrl(mediaFileId: string | null | undefined) {
	if (!mediaFileId) return
	cache.delete(mediaFileId)
}

export function clearMediaUrlCache() {
	cache.clear()
}
