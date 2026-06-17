import type { AdminEnrollmentItem } from "@/types/course.types"
import { ENROLLMENT_STATUS_LABELS } from "@/types/course.types"

interface EnrollmentsTableProps {
	enrollments: AdminEnrollmentItem[]
}

export function EnrollmentsTable({ enrollments }: EnrollmentsTableProps) {
	if (enrollments.length === 0) {
		return (
			<p style={{ color: "rgba(255,255,255,0.4)", padding: "16px 0" }}>
				Chưa đăng ký khóa học nào.
			</p>
		)
	}

	return (
		<table
			style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}
		>
			<thead>
				<tr
					style={{
						color: "rgba(255,255,255,0.5)",
						textAlign: "left",
					}}
				>
					<th style={{ padding: "6px 8px" }}>Khóa học</th>
					<th style={{ padding: "6px 8px" }}>Hạng</th>
					<th style={{ padding: "6px 8px" }}>Tiến độ</th>
					<th style={{ padding: "6px 8px" }}>Trạng thái</th>
					<th style={{ padding: "6px 8px" }}>Ngày đăng ký</th>
				</tr>
			</thead>
			<tbody>
				{enrollments.map((e) => (
					<tr
						key={e.enrollmentId}
						style={{
							borderTop: "1px solid rgba(255,255,255,0.06)",
						}}
					>
						<td style={{ padding: "8px" }}>
							{e.courseCode ? `${e.courseCode} · ` : ""}
							{e.title}
						</td>
						<td style={{ padding: "8px" }}>{e.licenseCategory}</td>
						<td style={{ padding: "8px" }}>{e.progress}%</td>
						<td
							style={{
								padding: "8px",
								color: "rgba(255,255,255,0.6)",
							}}
						>
							{ENROLLMENT_STATUS_LABELS[e.status]}
						</td>
						<td style={{ padding: "8px" }}>
							{e.enrolledAt
								? new Date(e.enrolledAt).toLocaleDateString(
										"vi-VN",
									)
								: "—"}
						</td>
					</tr>
				))}
			</tbody>
		</table>
	)
}
