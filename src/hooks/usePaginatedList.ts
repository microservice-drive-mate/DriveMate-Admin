import { useCallback, useState } from "react"

import { DEFAULT_PAGE_SIZE } from "@/constants/pagination"
import type { PaginatedResponse } from "@/types/api.types"

import { useAsyncData, type AsyncDataResult } from "./useAsyncData"

export interface PaginatedLoaderParams<F> {
	page: number
	pageSize: number
	filters: F
}

interface UsePaginatedListOptions<F> {
	initialFilters: F
	pageSize?: number
}

const EMPTY_PAGE: PaginatedResponse<never> = {
	items: [],
	total: 0,
	page: 1,
	size: 0,
}

/**
 * Gói chung pattern danh sách phân trang + filter dùng lặp ở các trang quản lý:
 * giữ `page`/`filters`, tự reset về trang 1 khi filter đổi, và nạp dữ liệu qua
 * `useAsyncData`.
 *
 * Lưu ý: `loader` PHẢI ổn định (bọc trong `useCallback`) để tránh refetch vô hạn,
 * giống quy ước sẵn có của các trang đang dùng `useAsyncData`.
 */
export function usePaginatedList<T, F>(
	loader: (
		params: PaginatedLoaderParams<F>,
	) => Promise<AsyncDataResult<PaginatedResponse<T>>>,
	{
		initialFilters,
		pageSize = DEFAULT_PAGE_SIZE,
	}: UsePaginatedListOptions<F>,
) {
	const [page, setPage] = useState(1)
	const [filters, setFiltersState] = useState<F>(initialFilters)

	const load = useCallback(
		() => loader({ page, pageSize, filters }),
		[loader, page, pageSize, filters],
	)

	const query = useAsyncData<PaginatedResponse<T>>(load, {
		initialData: EMPTY_PAGE,
		retainPreviousData: false,
	})

	const setFilters = useCallback((next: F) => {
		setFiltersState(next)
		setPage(1)
	}, [])

	const total = query.data.total
	const totalPages = Math.max(1, Math.ceil(total / pageSize))

	return {
		items: query.data.items,
		total,
		totalPages,
		page,
		setPage,
		filters,
		setFilters,
		loading: query.loading,
		error: query.error,
		refetch: query.refetch,
		setData: query.setData,
	}
}
