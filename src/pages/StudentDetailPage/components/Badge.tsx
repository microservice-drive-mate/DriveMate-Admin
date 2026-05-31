import {
	STUDENT_STATUS_LABELS,
	STUDENT_STATUS_TONES,
	type StudentStatus,
} from "@/types/student.types";

interface BadgeProps {
	status: StudentStatus;
}

export function Badge({ status }: BadgeProps) {
	return (
		<span
			className={`detail-badge detail-badge--${STUDENT_STATUS_TONES[status]}`}>
			{STUDENT_STATUS_LABELS[status]}
		</span>
	);
}
