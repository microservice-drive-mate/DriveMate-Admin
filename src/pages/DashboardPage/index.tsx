import { useEffect, useState } from "react"
import { analyticsService } from "@/services"
import type { AdminDashboard, DashboardCard } from "@/types/analytics.types"
import type { AdminStatCard } from "../../types"
import { StatCardsSection } from "./StatCardsSection"
import { ChartsSection } from "./ChartsSection"
import { ActivitySection } from "./ActivitySection"
import "./index.css"

const PIE_COLORS = ["#f59e0b", "#2563eb", "#10b981", "#8b5cf6", "#ef4444"]

const CARD_CONFIG: Record<
	DashboardCard["key"],
	{ title: string; icon: string; iconBg: string }
> = {
	students: { title: "Tổng Học Viên", icon: "👥", iconBg: "#f97316" },
	courses: { title: "Tổng Khóa Học", icon: "📚", iconBg: "#10b981" },
	instructors: { title: "Giảng Viên", icon: "👤", iconBg: "#3b82f6" },
	completedExams: {
		title: "Bài Thi Hoàn Thành",
		icon: "📄",
		iconBg: "#8b5cf6",
	},
}

function toStatCard(card: DashboardCard): AdminStatCard {
	const cfg = CARD_CONFIG[card.key]
	const pct = card.delta.percentage
	const sign =
		card.delta.direction === "up"
			? "+"
			: card.delta.direction === "down"
				? "-"
				: ""
	return {
		title: cfg.title,
		value: card.value.toLocaleString("vi-VN"),
		icon: cfg.icon,
		iconBg: cfg.iconBg,
		change: pct != null ? `${sign}${Math.abs(pct)}%` : undefined,
		changeLabel: "so với tháng trước",
		changeType:
			card.delta.direction === "up"
				? "positive"
				: card.delta.direction === "down"
					? "negative"
					: undefined,
	}
}

function useDashboard() {
	const [data, setData] = useState<AdminDashboard | null>(null)
	const [loading, setLoading] = useState(true)

	useEffect(() => {
		analyticsService.getDashboard().then((res) => {
			if (res.success) setData(res.data)
			setLoading(false)
		})
	}, [])

	return { data, loading }
}

export function DashboardPage() {
	const { data, loading } = useDashboard()

	const statCards: AdminStatCard[] =
		loading || !data
			? Object.values(CARD_CONFIG).map((cfg) => ({
					title: cfg.title,
					value: "...",
					icon: cfg.icon,
					iconBg: cfg.iconBg,
				}))
			: data.cards.map(toStatCard)

	return (
		<div className="dashboard">
			<div className="dashboard__header">
				<h1>Dashboard Tổng Quan</h1>
				<p>Chào mừng trở lại! Đây là tổng quan hệ thống của bạn.</p>
			</div>

			<StatCardsSection cards={statCards} />
			{data && (
				<>
					<ChartsSection
						monthlyTrend={data.monthlyTrend}
						licenseDistribution={data.licenseDistribution}
						passRateByLicense={data.passRateByLicense}
						pieColors={PIE_COLORS}
					/>
					<ActivitySection activities={data.recentActivities} />
				</>
			)}
		</div>
	)
}
