import {
	LineChart,
	Line,
	XAxis,
	YAxis,
	CartesianGrid,
	Tooltip,
	Legend,
	ResponsiveContainer,
	PieChart,
	Pie,
	Cell,
	BarChart,
	Bar,
} from "recharts"
import { ChartCard } from "../../components/ui/ChartCard"
import type {
	LicenseDistributionItem,
	MonthlyTrendPoint,
	PassRateByLicenseItem,
} from "@/types/analytics.types"

interface ChartsSectionProps {
	monthlyTrend: MonthlyTrendPoint[]
	licenseDistribution: LicenseDistributionItem[]
	passRateByLicense: PassRateByLicenseItem[]
	pieColors: string[]
}

const darkTooltipStyle = {
	backgroundColor: "#242424",
	border: "1px solid #333333",
	borderRadius: 6,
	color: "#f0f0f0",
}

const darkAxisTick = { fontSize: 12, fill: "#94a3b8" }

export function ChartsSection({
	monthlyTrend,
	licenseDistribution,
	passRateByLicense,
	pieColors,
}: ChartsSectionProps) {
	return (
		<>
			<div className="charts-row">
				<ChartCard title="Xu Hướng Theo Tháng" variant="dark">
					<ResponsiveContainer width="100%" height={260}>
						<LineChart
							data={monthlyTrend}
							margin={{ top: 4, right: 16, left: -10, bottom: 0 }}
						>
							<CartesianGrid
								strokeDasharray="3 3"
								stroke="rgba(255,255,255,0.1)"
							/>
							<XAxis dataKey="month" tick={darkAxisTick} />
							<YAxis tick={darkAxisTick} />
							<Tooltip contentStyle={darkTooltipStyle} />
							<Legend />
							<Line
								type="monotone"
								dataKey="students"
								name="Học viên"
								stroke="#2563eb"
								strokeWidth={2}
								dot={{ r: 4 }}
							/>
							<Line
								type="monotone"
								dataKey="completedExams"
								name="Bài thi"
								stroke="#f59e0b"
								strokeWidth={2}
								dot={{ r: 4 }}
							/>
							<Line
								type="monotone"
								dataKey="passedExams"
								name="Đạt"
								stroke="#10b981"
								strokeWidth={2}
								dot={{ r: 4 }}
							/>
						</LineChart>
					</ResponsiveContainer>
				</ChartCard>

				<ChartCard title="Phân Bổ Theo Hạng Bằng" variant="dark">
					<ResponsiveContainer width="100%" height={260}>
						<PieChart>
							<Pie
								data={licenseDistribution}
								cx="50%"
								cy="50%"
								outerRadius={90}
								dataKey="students"
								nameKey="licenseCategory"
								label={(props) =>
									`${(props as unknown as { licenseCategory: string; percentage: number }).licenseCategory} ${(props as unknown as { licenseCategory: string; percentage: number }).percentage}%`
								}
								labelLine={false}
							>
								{licenseDistribution.map((_, index) => (
									<Cell
										key={index}
										fill={
											pieColors[index % pieColors.length]
										}
									/>
								))}
							</Pie>
							<Tooltip
								formatter={(v) => `${v}`}
								contentStyle={darkTooltipStyle}
							/>
						</PieChart>
					</ResponsiveContainer>
				</ChartCard>
			</div>

			<ChartCard title="Tỷ Lệ Đỗ Theo Hạng Bằng" variant="dark">
				<ResponsiveContainer width="100%" height={240}>
					<BarChart
						data={passRateByLicense}
						margin={{ top: 4, right: 16, left: -10, bottom: 0 }}
					>
						<CartesianGrid
							strokeDasharray="3 3"
							stroke="rgba(255,255,255,0.1)"
							vertical={false}
						/>
						<XAxis dataKey="licenseCategory" tick={darkAxisTick} />
						<YAxis
							domain={[0, 100]}
							tick={darkAxisTick}
							tickFormatter={(v) => `${v}`}
						/>
						<Tooltip
							formatter={(v) => `${v}%`}
							contentStyle={darkTooltipStyle}
						/>
						<Bar
							dataKey="passRate"
							name="Tỷ lệ đỗ"
							fill="#fdb913"
							radius={[4, 4, 0, 0]}
						/>
					</BarChart>
				</ResponsiveContainer>
			</ChartCard>
		</>
	)
}
