import { useEffect, useRef, useState } from "react"
import { notificationService } from "@/services"
import type { Notification } from "@/types/notification.types"

export function NotificationBell() {
	const [open, setOpen] = useState(false)
	const [notifications, setNotifications] = useState<Notification[]>([])
	const [loading, setLoading] = useState(false)
	const ref = useRef<HTMLDivElement>(null)

	const unreadCount = notifications.filter((n) => !n.isRead).length

	const fetchNotifications = async () => {
		setLoading(true)
		const res = await notificationService.getMyNotifications({ size: 20 })
		if (res.success) setNotifications(res.data.items)
		setLoading(false)
	}

	const handleMarkRead = async (id: string) => {
		const res = await notificationService.markRead(id)
		if (res.success) {
			setNotifications((prev) =>
				prev.map((n) =>
					n.id === id
						? {
								...n,
								isRead: true,
								readAt: new Date().toISOString(),
							}
						: n,
				),
			)
		}
	}

	const handleToggle = () => {
		if (!open) fetchNotifications()
		setOpen((v) => !v)
	}

	useEffect(() => {
		const handleClick = (e: MouseEvent) => {
			if (ref.current && !ref.current.contains(e.target as Node)) {
				setOpen(false)
			}
		}
		document.addEventListener("mousedown", handleClick)
		return () => document.removeEventListener("mousedown", handleClick)
	}, [])

	return (
		<div className="notif-bell" ref={ref}>
			<button
				className="notif-bell__btn"
				onClick={handleToggle}
				aria-label="Thông báo"
			>
				<svg
					width="20"
					height="20"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					strokeWidth="2"
				>
					<path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
					<path d="M13.73 21a2 2 0 0 1-3.46 0" />
				</svg>
				{unreadCount > 0 && (
					<span className="notif-bell__badge">
						{unreadCount > 9 ? "9+" : unreadCount}
					</span>
				)}
			</button>

			{open && (
				<div className="notif-bell__dropdown">
					<div className="notif-bell__header">
						<span>Thông báo</span>
						{unreadCount > 0 && (
							<span className="notif-bell__unread-count">
								{unreadCount} chưa đọc
							</span>
						)}
					</div>
					{loading ? (
						<div className="notif-bell__empty">Đang tải...</div>
					) : notifications.length === 0 ? (
						<div className="notif-bell__empty">
							Không có thông báo mới.
						</div>
					) : (
						<ul className="notif-bell__list">
							{notifications.map((n) => (
								<li
									key={n.id}
									className={`notif-bell__item${n.isRead ? "" : " notif-bell__item--unread"}`}
									onClick={() =>
										!n.isRead && handleMarkRead(n.id)
									}
								>
									<div className="notif-bell__item-title">
										{n.title}
									</div>
									<div className="notif-bell__item-body">
										{n.body}
									</div>
									<div className="notif-bell__item-time">
										{new Date(
											n.createdAt,
										).toLocaleDateString("vi-VN")}
									</div>
								</li>
							))}
						</ul>
					)}
				</div>
			)}
		</div>
	)
}
