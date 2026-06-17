import "./ProgressBar.css"

interface ProgressBarProps {
	percent: number
	showLabel?: boolean
	fillColor?: string
	trackColor?: string
}

export function ProgressBar({
	percent,
	showLabel = true,
	fillColor = "#fdb913",
	trackColor = "rgba(255,255,255,0.08)",
}: ProgressBarProps) {
	return (
		<div className="progress-bar-wrapper">
			<div className="progress-bar" style={{ background: trackColor }}>
				<div
					className="progress-bar__fill"
					style={{ width: `${percent}%`, background: fillColor }}
				/>
			</div>
			{showLabel && (
				<span
					className="progress-bar__label"
					style={{ color: fillColor }}
				>
					{percent}%
				</span>
			)}
		</div>
	)
}
