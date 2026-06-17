import {
	STUDENT_STATUS_LABELS,
	STUDENT_STATUS_TONES,
	studentStatus,
	type Student,
	type StudentStatus,
} from "@/types/student.types"
import { StudentAvatar } from "./StudentAvatar"

const STATUS_THEME: Record<StudentStatus, string> = {
	studying: "student-pill--studying",
	warning: "student-pill--warning",
	completed: "student-pill--completed",
	locked: "student-pill--locked",
}

interface StudentTableProps {
	students: Student[]
	onOpen: (id: string) => void
}

export function StudentTable({ students, onOpen }: StudentTableProps) {
	if (!students.length) {
		return <div className="student-empty">Không tìm thấy học viên nào.</div>
	}

	const sorted = [...students].sort((a, b) => {
		const aLocked = studentStatus(a) === "locked"
		const bLocked = studentStatus(b) === "locked"
		return Number(aLocked) - Number(bLocked)
	})

	return (
		<div className="student-table-wrap">
			<table className="student-table">
				<thead>
					<tr>
						<th>Học Viên</th>
						<th>Liên Hệ</th>
						<th>Hạng Bằng</th>
						<th>Ngày Nhập Học</th>
						<th>Trạng Thái</th>
						<th>Thao Tác</th>
					</tr>
				</thead>
				<tbody>
					{sorted.map((student) => {
						const status = studentStatus(student)
						const isLocked = status === "locked"
						return (
							<tr
								key={student.id}
								className={
									isLocked
										? "student-table__row--locked"
										: undefined
								}
								onClick={
									isLocked
										? undefined
										: () => onOpen(student.id)
								}
							>
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
										<span>
											{student.phoneNumber ?? "—"}
										</span>
									</div>
								</td>
								<td>
									<span className="student-rank">
										{student.licenseTier ?? "Chưa phân"}
									</span>
								</td>
								<td>
									{student.enrolledAt
										? new Date(
												student.enrolledAt,
											).toLocaleDateString("vi-VN")
										: "—"}
								</td>
								<td>
									<span
										className={`student-pill ${STATUS_THEME[status] ?? `student-pill--${STUDENT_STATUS_TONES[status]}`}`}
									>
										{STUDENT_STATUS_LABELS[status]}
									</span>
								</td>
								<td>
									<button
										className="student-table__action"
										disabled={isLocked}
										onClick={(e) => {
											e.stopPropagation()
											onOpen(student.id)
										}}
									>
										Chi tiết
									</button>
								</td>
							</tr>
						)
					})}
				</tbody>
			</table>
		</div>
	)
}
