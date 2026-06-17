import { useEffect, useRef, useState } from "react"
import type { QuestionResponse } from "@/types/question.types"

interface ActionMenuProps {
	question: QuestionResponse
	onEdit: (id: string) => void
	onDelete: (id: string, version: number) => void
}

export function ActionMenu({ question, onEdit, onDelete }: ActionMenuProps) {
	const [open, setOpen] = useState(false)
	const ref = useRef<HTMLDivElement>(null)

	useEffect(() => {
		if (!open) return
		function handler(e: MouseEvent) {
			if (ref.current && !ref.current.contains(e.target as Node))
				setOpen(false)
		}
		document.addEventListener("mousedown", handler)
		return () => document.removeEventListener("mousedown", handler)
	}, [open])

	return (
		<div className="q-action-menu" ref={ref}>
			<button
				className="q-action-menu__trigger"
				onClick={() => setOpen((v) => !v)}
			>
				<svg
					width="16"
					height="16"
					viewBox="0 0 24 24"
					fill="currentColor"
				>
					<circle cx="12" cy="5" r="1.5" />
					<circle cx="12" cy="12" r="1.5" />
					<circle cx="12" cy="19" r="1.5" />
				</svg>
			</button>
			{open && (
				<div className="q-action-menu__dropdown">
					{!question.isDeleted && (
						<button
							onClick={() => {
								onEdit(question.id)
								setOpen(false)
							}}
						>
							<svg
								width="13"
								height="13"
								viewBox="0 0 24 24"
								fill="none"
								stroke="currentColor"
								strokeWidth="2"
							>
								<path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
								<path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
							</svg>
							Chỉnh sửa
						</button>
					)}
					{!question.isDeleted && (
						<button
							className="q-action-menu__item--danger"
							onClick={() => {
								onDelete(question.id, question.version)
								setOpen(false)
							}}
						>
							<svg
								width="13"
								height="13"
								viewBox="0 0 24 24"
								fill="none"
								stroke="currentColor"
								strokeWidth="2"
							>
								<polyline points="3 6 5 6 21 6" />
								<path d="M19 6l-1 14H6L5 6" />
								<path d="M10 11v6M14 11v6M9 6V4h6v2" />
							</svg>
							Xóa
						</button>
					)}
				</div>
			)}
		</div>
	)
}
