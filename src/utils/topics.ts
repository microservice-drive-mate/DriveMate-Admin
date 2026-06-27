import type { WeakTopic } from "@/types/analytics.types"

// Tên topic không resolve được: rỗng/khoảng trắng, hoặc trả về dạng ID
// (hex + dấu gạch, đủ dài) — không bao giờ khớp tên tiếng Việt thật.
const UNRESOLVED_TOPIC_RE = /^[0-9a-f-]{30,}$/i

export function isResolvedTopicName(name: string | null | undefined): boolean {
	const trimmed = name?.trim()
	return Boolean(trimmed) && !UNRESOLVED_TOPIC_RE.test(trimmed as string)
}

export function filterResolvedWeakTopics(topics: WeakTopic[]): WeakTopic[] {
	return topics.filter((t) => isResolvedTopicName(t.topicName))
}
