import type { AdminExamSession } from "@/types/exam-session.types";
import { EXAM_SESSION_STATUS_LABELS } from "@/types/exam-session.types";

interface ExamSessionTableProps {
	sessions: AdminExamSession[];
}

export function ExamSessionTable({ sessions }: ExamSessionTableProps) {
	if (sessions.length === 0) {
		return <p style={{ color: "rgba(255,255,255,0.4)", padding: "16px 0" }}>ChÆ°a cÃ³ lá»‹ch sá»­ thi.</p>;
	}

	return (
		<table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
			<thead>
				<tr style={{ color: "rgba(255,255,255,0.5)", textAlign: "left" }}>
					<th style={{ padding: "6px 8px" }}>NgÃ y thi</th>
					<th style={{ padding: "6px 8px" }}>Háº¡ng</th>
					<th style={{ padding: "6px 8px" }}>Äiá»ƒm</th>
					<th style={{ padding: "6px 8px" }}>Káº¿t quáº£</th>
					<th style={{ padding: "6px 8px" }}>Tráº¡ng thÃ¡i</th>
				</tr>
			</thead>
			<tbody>
				{sessions.map((s) => (
					<tr key={s.id} style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
						<td style={{ padding: "8px" }}>
							{s.startedAt ? new Date(s.startedAt).toLocaleDateString("vi-VN") : "â€”"}
						</td>
						<td style={{ padding: "8px" }}>{s.licenseCategory}</td>
						<td style={{ padding: "8px" }}>{s.score ?? "â€”"}</td>
						<td style={{ padding: "8px" }}>
							{s.isPassed === null ? "â€”" : s.isPassed ? (
								<span style={{ color: "#4ade80", fontWeight: 600 }}>Äáº¡t</span>
							) : (
								<span style={{ color: "#f87171", fontWeight: 600 }}>
									{s.failedByCritical ? "TrÆ°á»£t (Ä‘iá»ƒm liá»‡t)" : "TrÆ°á»£t"}
								</span>
							)}
						</td>
						<td style={{ padding: "8px", color: "rgba(255,255,255,0.6)" }}>
							{EXAM_SESSION_STATUS_LABELS[s.status]}
						</td>
					</tr>
				))}
			</tbody>
		</table>
	);
}
