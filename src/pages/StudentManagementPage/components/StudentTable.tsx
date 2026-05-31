import {
	STUDENT_STATUS_LABELS,
	STUDENT_STATUS_TONES,
	studentStatus,
	type Student,
	type StudentStatus,
} from "@/types/student.types";
import { StudentAvatar } from "./StudentAvatar";

const STATUS_THEME: Record<StudentStatus, string> = {
	studying: "student-pill--studying",
	warning: "student-pill--warning",
	completed: "student-pill--completed",
	locked: "student-pill--locked",
};

interface StudentTableProps {
	students: Student[];
	onOpen: (id: string) => void;
}

export function StudentTable({ students, onOpen }: StudentTableProps) {
	if (!students.length) {
		return (
			<div className="student-empty">KhÃ´ng tÃ¬m tháº¥y há»c viÃªn nÃ o.</div>
		);
	}

	return (
		<div className="student-table-wrap">
			<table className="student-table">
				<thead>
					<tr>
						<th>Há»c ViÃªn</th>
						<th>LiÃªn Há»‡</th>
						<th>Háº¡ng Báº±ng</th>
						<th>NgÃ y Nháº­p Há»c</th>
						<th>Tráº¡ng ThÃ¡i</th>
						<th>Thao TÃ¡c</th>
					</tr>
				</thead>
				<tbody>
					{students.map((student) => {
						const status = studentStatus(student);
						return (
							<tr
								key={student.id}
								onClick={() => onOpen(student.id)}>
								<td>
									<div className="student-table__name">
										<StudentAvatar student={student} />
										<div>
											<div className="student-table__fullname">
												{student.fullName}
											</div>
											<div className="student-table__meta">
												{student.id.slice(0, 8)}
											</div>
										</div>
									</div>
								</td>
								<td>
									<div className="student-table__contact">
										<span>{student.email}</span>
										<span>{student.phoneNumber ?? "â€”"}</span>
									</div>
								</td>
								<td>
									<span className="student-rank">
										{student.licenseTier ?? "ChÆ°a phÃ¢n"}
									</span>
								</td>
								<td>
									{student.enrolledAt
										? new Date(
												student.enrolledAt,
											).toLocaleDateString("vi-VN")
										: "â€”"}
								</td>
								<td>
									<span
										className={`student-pill ${STATUS_THEME[status] ?? `student-pill--${STUDENT_STATUS_TONES[status]}`}`}>
										{STUDENT_STATUS_LABELS[status]}
									</span>
								</td>
								<td>
									<button
										className="student-table__action"
										onClick={(e) => {
											e.stopPropagation();
											onOpen(student.id);
										}}>
										Chi tiáº¿t
									</button>
								</td>
							</tr>
						);
					})}
				</tbody>
			</table>
		</div>
	);
}
