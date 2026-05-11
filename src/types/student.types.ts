import type { LicenseClass } from "./user.types";

export type StudentStatus = "studying" | "warning" | "completed" | "locked";
export type StudentExamResult = "pass" | "fail";
export type StudentAlertChannel = "email" | "sms" | "guardian";

export interface StudentProgressPoint {
	date: string;
	value: number;
}

export interface StudentExamHistory {
	id: string;
	date: string;
	examType: string;
	score: number;
	duration: string;
	result: StudentExamResult;
}

export interface StudentDocumentStatus {
	idFront: boolean;
	idBack: boolean;
	portrait: boolean;
	healthCertificate: boolean;
	extra: boolean;
}

export interface Student {
	id: string;
	code: string;
	fullName: string;
	initials: string;
	avatarColor: string;
	email: string;
	phone: string;
	dateOfBirth: string;
	address: string;
	licenseClass: LicenseClass;
	status: StudentStatus;
	progress: number;
	examCount: number;
	passedCount: number;
	warningCount: number;
	lastExamDate: string;
	lastResult: StudentExamResult;
	instructor: string;
	joinDate: string;
	note: string;
	progressTrend: StudentProgressPoint[];
	examHistory: StudentExamHistory[];
	documents: StudentDocumentStatus;
}

export interface StudentFilters {
	search: string;
	licenseClass: LicenseClass | "";
	status: StudentStatus | "";
}

export interface StudentFormData {
	fullName: string;
	email: string;
	phone: string;
	dateOfBirth: string;
	address: string;
	enrollmentDate: string;
	licenseClass: LicenseClass | "";
	status: StudentStatus | "";
	note: string;
}

export interface StudentFormErrors {
	fullName?: string;
	email?: string;
	phone?: string;
	dateOfBirth?: string;
	address?: string;
	enrollmentDate?: string;
	licenseClass?: string;
	status?: string;
	idFront?: string;
	idBack?: string;
	portrait?: string;
	healthCertificate?: string;
}

export const STUDENT_STATUS_LABELS: Record<StudentStatus, string> = {
	studying: "Đang học",
	warning: "Cần cảnh báo",
	completed: "Hoàn thành",
	locked: "Đã khóa",
};

export const STUDENT_STATUS_TONES: Record<StudentStatus, string> = {
	studying: "success",
	warning: "warning",
	completed: "primary",
	locked: "danger",
};

export const STUDENT_STATUS_OPTIONS: Array<{
	value: StudentStatus;
	label: string;
}> = [
	{ value: "studying", label: "Đang học" },
	{ value: "warning", label: "Cần cảnh báo" },
	{ value: "completed", label: "Hoàn thành" },
	{ value: "locked", label: "Đã khóa" },
];

export const STUDENT_LICENSE_CLASSES: LicenseClass[] = [
	"A1",
	"A2",
	"B1",
	"B2",
	"C",
	"D",
	"E",
	"F",
];

export const STUDENT_RANK_OPTIONS: LicenseClass[] = [
	"A1",
	"A2",
	"B1",
	"B2",
	"C",
];

export const STUDENT_ALERT_TEMPLATES = [
	"Học viên chưa hoàn thành bài tập đúng hạn",
	"Kết quả học tập chưa đạt yêu cầu",
	"Vắng mặt quá nhiều buổi học",
	"Cần tăng cường ôn tập",
	"Tùy chỉnh nội dung",
];

export const STUDENT_DOCUMENT_LABELS: Record<
	keyof StudentDocumentStatus,
	string
> = {
	idFront: "CMND / CCCD mặt trước",
	idBack: "CMND / CCCD mặt sau",
	portrait: "Ảnh chân dung 3 x 4",
	healthCertificate: "Giấy khám sức khỏe",
	extra: "Tài liệu bổ sung",
};

export const STUDENT_ALERT_CHANNEL_LABELS: Record<StudentAlertChannel, string> =
	{
		email: "Gửi qua email",
		sms: "Gửi SMS",
		guardian: "Thông báo phụ huynh",
	};
