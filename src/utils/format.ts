/**
 * Formatting / display helpers shared across the app.
 */

/** Chuẩn hóa giá trị ngày ISO về dạng `yyyy-MM-dd` cho <input type="date">. */
export function toDateInput(value: string | null | undefined): string {
	return value ? value.slice(0, 10) : "";
}

/** Lấy chữ cái viết tắt từ họ tên (chữ đầu của từ đầu + từ cuối). */
export function getInitials(fullName: string): string {
	const parts = fullName.trim().split(/\s+/).filter(Boolean);
	if (parts.length === 0) return "?";
	if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
	return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}
