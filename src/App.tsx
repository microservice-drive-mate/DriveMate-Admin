import { useEffect } from "react"
import { RouterProvider } from "react-router-dom"

import { appRouter } from "@/routes/appRouter"
import { useAuthStore } from "./store/authStore"

export default function App() {
	const { initializeAuth } = useAuthStore()

	useEffect(() => {
		// Initialize auth on app load (restore session from localStorage)
		initializeAuth()
	}, [initializeAuth])

	return <RouterProvider router={appRouter} />
}
