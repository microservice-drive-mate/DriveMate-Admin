import type { Gender, LicenseTier, UserProfile } from "./user-profile.types"

export type StudentStatus = "studying" | "warning" | "completed" | "locked"
export type StudentExamResult = "pass" | "fail"
export type StudentAlertChannel = "email" | "sms" | "guardian"

export interface StudentProgressPoint {
	date: string
	value: number
}

export interface StudentExamHistory {
	id: string
	date: string
	examType: string
	score: number
	duration: string
	result: StudentExamResult
}

export interface Student {
	id: string
	fullName: string
	email: string
	phoneNumber: string | null
	dateOfBirth: string | null
	address: string | null
	avatarUrl: string | null
	mediaFileId: string | null
	gender: Gender | null
	isActive: boolean
	createdAt: string
	licenseTier: LicenseTier | null
	enrolledAt: string | null
	notes: string | null
}

export interface StudentFilters {
	search: string
	licenseTier: LicenseTier | ""
	status: StudentStatus | ""
}

const AVATAR_PALETTE = [
	"#f9c74f",
	"#f9844a",
	"#4cc9f0",
	"#ff6b6b",
	"#90be6d",
	"#43aa8b",
	"#f8961e",
	"#577590",
]

export function studentFromProfile(profile: UserProfile): Student {
	return {
		id: profile.id,
		fullName: profile.fullName,
		email: profile.email,
		phoneNumber: profile.phoneNumber,
		dateOfBirth: profile.dateOfBirth,
		address: profile.address,
		avatarUrl: profile.avatarUrl,
		mediaFileId: profile.mediaFileId,
		gender: profile.gender,
		isActive: profile.isActive,
		createdAt: profile.createdAt,
		licenseTier: profile.studentDetail?.licenseTier ?? null,
		enrolledAt: profile.studentDetail?.enrolledAt ?? null,
		notes: profile.studentDetail?.notes ?? null,
	}
}

export function studentInitials(name: string): string {
	return name
		.split(" ")
		.filter(Boolean)
		.slice(-2)
		.map((part) => part[0])
		.join("")
		.toUpperCase()
}

export function studentAvatarColor(id: string): string {
	let hash = 0
	for (let i = 0; i < id.length; i++) {
		hash = (hash * 31 + id.charCodeAt(i)) >>> 0
	}
	return AVATAR_PALETTE[hash % AVATAR_PALETTE.length]
}

export function studentStatus(student: Student): StudentStatus {
	// Backend chỉ có isActive — chưa có dữ liệu exam để suy ra warning/completed.
	return student.isActive ? "studying" : "locked"
}

export const STUDENT_STATUS_LABELS: Record<StudentStatus, string> = {
	studying: "Đang học",
	warning: "Cần cảnh báo",
	completed: "Hoàn thành",
	locked: "Đã khóa",
}

export const STUDENT_STATUS_TONES: Record<StudentStatus, string> = {
	studying: "success",
	warning: "warning",
	completed: "primary",
	locked: "danger",
}

export const STUDENT_STATUS_OPTIONS: Array<{
	value: StudentStatus
	label: string
}> = [
	{ value: "studying", label: "Đang học" },
	{ value: "warning", label: "Cần cảnh báo" },
	{ value: "completed", label: "Hoàn thành" },
	{ value: "locked", label: "Đã khóa" },
]

export const STUDENT_LICENSE_TIERS: LicenseTier[] = [
	"A1",
	"A2",
	"B1",
	"B2",
	"C",
	"D",
	"E",
	"F",
]

export const STUDENT_RANK_OPTIONS: LicenseTier[] = [
	"A1",
	"A2",
	"B1",
	"B2",
	"C",
	"D",
	"E",
	"F",
]

export const STUDENT_ALERT_TEMPLATES = [
	"Học viên chưa hoàn thành bài tập đúng hạn",
	"Kết quả học tập chưa đạt yêu cầu",
	"Vắng mặt quá nhiều buổi học",
	"Cần tăng cường ôn tập",
	"Tùy chỉnh nội dung",
]

export const STUDENT_ALERT_CHANNEL_LABELS: Record<StudentAlertChannel, string> =
	{
		email: "Gửi qua email",
		sms: "Gửi SMS",
		guardian: "Thông báo phụ huynh",
	}
