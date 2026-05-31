const AVATAR_PALETTE = [
	"#F5A623",
	"#4A90E2",
	"#7ED321",
	"#9B59B6",
	"#E74C3C",
	"#16A085",
];

export function getInitials(fullName: string) {
	const parts = fullName.trim().split(/\s+/);
	if (parts.length === 0) return "?";
	if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
	return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export function getAvatarColor(userId: string) {
	let hash = 0;
	for (let i = 0; i < userId.length; i++) {
		hash = (hash * 31 + userId.charCodeAt(i)) >>> 0;
	}
	return AVATAR_PALETTE[hash % AVATAR_PALETTE.length];
}

export function formatDate(value: string | null) {
	if (!value) return "";
	const date = new Date(value);
	if (Number.isNaN(date.getTime())) return value;
	return date.toLocaleDateString("vi-VN");
}
