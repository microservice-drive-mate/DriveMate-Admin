import { useState } from "react"
import { Outlet } from "react-router-dom"
import { Sidebar } from "./Sidebar"
import { Header } from "./Header"
import "./AdminLayout.css"

export function AdminLayout() {
	const [collapsed, setCollapsed] = useState(false)

	return (
		<div
			className={`admin-layout${collapsed ? " admin-layout--collapsed" : ""}`}
		>
			<div className="admin-layout__sidebar">
				<Sidebar
					collapsed={collapsed}
					onToggle={() => setCollapsed((v) => !v)}
				/>
			</div>
			<div className="admin-layout__header">
				<Header />
			</div>
			<main className="admin-layout__main">
				<Outlet />
			</main>
		</div>
	)
}
