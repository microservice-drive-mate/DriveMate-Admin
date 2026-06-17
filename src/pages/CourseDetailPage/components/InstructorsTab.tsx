import { useState, useCallback, useEffect } from "react"
import { courseService, userService } from "@/services"
import type { CourseResponse } from "@/types/course.types"
import type { UserProfile } from "@/types/user-profile.types"

interface InstructorsTabProps {
	courseId: string
	instructorIds: string[]
	canManage: boolean
	onCourseUpdated: (course: CourseResponse) => void
}

export function InstructorsTab({
	courseId,
	instructorIds,
	canManage,
	onCourseUpdated,
}: InstructorsTabProps) {
	const [instructors, setInstructors] = useState<UserProfile[]>([])
	const [loading, setLoading] = useState(true)
	const [searchQuery, setSearchQuery] = useState("")
	const [searchResults, setSearchResults] = useState<UserProfile[]>([])
	const [searching, setSearching] = useState(false)
	const [actionError, setActionError] = useState("")
	const [removingId, setRemovingId] = useState<string | null>(null)
	const [assigning, setAssigning] = useState(false)
	const [showSearch, setShowSearch] = useState(false)

	const loadInstructors = useCallback(async () => {
		setLoading(true)
		const results = await Promise.all(
			instructorIds.map((id) => userService.getById(id)),
		)
		setInstructors(results.filter((r) => r.success).map((r) => r.data!))
		setLoading(false)
	}, [instructorIds])

	useEffect(() => {
		// eslint-disable-next-line react-hooks/set-state-in-effect -- intentional fetch-on-mount
		loadInstructors()
	}, [loadInstructors])

	const handleSearch = async () => {
		if (!searchQuery.trim()) return
		setSearching(true)
		const res = await userService.list({
			role: "INSTRUCTOR",
			search: searchQuery.trim(),
			size: 10,
		})
		setSearching(false)
		if (res.success) {
			setSearchResults(
				res.data.items.filter((u) => !instructorIds.includes(u.id)),
			)
		}
	}

	const handleAssign = async (userId: string) => {
		setAssigning(true)
		setActionError("")
		const res = await courseService.assignInstructor(courseId, {
			instructorId: userId,
		})
		setAssigning(false)
		if (res.success) {
			onCourseUpdated(res.data)
			setShowSearch(false)
			setSearchQuery("")
			setSearchResults([])
		} else {
			setActionError(res.error)
		}
	}

	const handleRemove = async (userId: string) => {
		if (!confirm("Xóa giảng viên này khỏi khóa học?")) return
		setRemovingId(userId)
		setActionError("")
		const res = await courseService.removeInstructor(courseId, userId)
		setRemovingId(null)
		if (res.success) {
			onCourseUpdated(res.data)
		} else {
			setActionError(res.error)
		}
	}

	if (loading) {
		return (
			<div className="course-detail__section">
				<p className="course-detail__empty">Đang tải...</p>
			</div>
		)
	}

	return (
		<div className="course-detail__section">
			<div className="course-detail__section-header course-detail__section-header--with-action">
				<span>Giảng Viên</span>
				{canManage && (
					<button
						className="course-detail__add-btn"
						onClick={() => setShowSearch(true)}
					>
						+ Thêm giảng viên
					</button>
				)}
			</div>

			{actionError && (
				<div className="course-detail__action-error">{actionError}</div>
			)}

			{instructors.length === 0 ? (
				<div className="course-detail__empty">
					Chưa có giảng viên nào được gán.
				</div>
			) : (
				<div className="course-detail__lesson-list">
					{instructors.map((inst) => (
						<div
							key={inst.id}
							className="course-detail__lesson-row"
						>
							<div className="course-detail__lesson-info">
								<div className="course-detail__lesson-title">
									{inst.fullName}
								</div>
								<div className="course-detail__lesson-meta">
									{inst.email}
								</div>
							</div>
							{canManage && (
								<button
									className="course-detail__lesson-delete"
									onClick={() => handleRemove(inst.id)}
									disabled={removingId === inst.id}
									title="Xóa giảng viên"
								>
									<svg
										width="14"
										height="14"
										viewBox="0 0 24 24"
										fill="none"
										stroke="currentColor"
										strokeWidth="2"
									>
										<polyline points="3 6 5 6 21 6" />
										<path d="M19 6l-1 14H6L5 6" />
										<path d="M10 11v6M14 11v6M9 6V4h6v2" />
									</svg>
								</button>
							)}
						</div>
					))}
				</div>
			)}

			{showSearch && (
				<div
					className="course-detail__modal-overlay"
					onClick={() => setShowSearch(false)}
				>
					<div
						className="course-detail__modal"
						onClick={(e) => e.stopPropagation()}
					>
						<div className="course-detail__modal-header">
							Thêm giảng viên
						</div>
						<div className="course-detail__modal-body">
							<div className="course-detail__form-group">
								<label>Tìm kiếm theo tên hoặc email</label>
								<div style={{ display: "flex", gap: "8px" }}>
									<input
										value={searchQuery}
										onChange={(e) =>
											setSearchQuery(e.target.value)
										}
										onKeyDown={(e) =>
											e.key === "Enter" && handleSearch()
										}
										placeholder="Nhập tên giảng viên..."
										disabled={searching || assigning}
									/>
									<button
										className="course-detail__add-btn"
										onClick={handleSearch}
										disabled={searching || assigning}
									>
										{searching ? "..." : "Tìm"}
									</button>
								</div>
							</div>
							{searchResults.length > 0 && (
								<div
									className="course-detail__lesson-list"
									style={{ marginTop: "12px" }}
								>
									{searchResults.map((u) => (
										<div
											key={u.id}
											className="course-detail__lesson-row"
										>
											<div className="course-detail__lesson-info">
												<div className="course-detail__lesson-title">
													{u.fullName}
												</div>
												<div className="course-detail__lesson-meta">
													{u.email}
												</div>
											</div>
											<button
												className="course-detail__activate-btn"
												onClick={() =>
													handleAssign(u.id)
												}
												disabled={assigning}
												style={{
													fontSize: "12px",
													padding: "4px 12px",
												}}
											>
												Thêm
											</button>
										</div>
									))}
								</div>
							)}
							{actionError && (
								<div className="course-detail__form-error">
									{actionError}
								</div>
							)}
						</div>
						<div className="course-detail__modal-footer">
							<button
								className="course-detail__modal-cancel"
								onClick={() => setShowSearch(false)}
							>
								Đóng
							</button>
						</div>
					</div>
				</div>
			)}
		</div>
	)
}
