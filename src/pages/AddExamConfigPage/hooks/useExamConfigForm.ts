import { useEffect, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { examService, topicService } from "@/services"
import type {
	ExamTemplateFormData,
	LicenseCategory,
	TopicDistributionItem,
} from "@/types/exam-template.types"
import { LICENSE_CATEGORY_DEFAULTS } from "@/types/exam-template.types"
import type { TopicResponse } from "@/types/question.types"

const DEFAULT_FORM: ExamTemplateFormData = {
	name: "",
	description: "",
	licenseCategory: "",
	totalQuestions: 30,
	passingScore: 27,
	durationMinutes: 22,
	criticalQuestions: 1,
	maxCriticalMistakes: 0,
	shuffleQuestions: true,
	topicDistribution: [],
	isActive: true,
}

export interface ExamFormErrors {
	name?: string
	licenseCategory?: string
	totalQuestions?: string
	passingScore?: string
	durationMinutes?: string
	criticalQuestions?: string
	maxCriticalMistakes?: string
	topicDistribution?: string
}

/** State + side effects cho form tạo/sửa template đề thi. */
export function useExamConfigForm() {
	const { configId } = useParams<{ configId: string }>()
	const navigate = useNavigate()
	const isEdit = Boolean(configId)

	const [form, setForm] = useState<ExamTemplateFormData>(DEFAULT_FORM)
	const [version, setVersion] = useState(1)
	const [errors, setErrors] = useState<ExamFormErrors>({})
	const [loadedConfigId, setLoadedConfigId] = useState<string | null>(null)
	const [submitting, setSubmitting] = useState(false)
	const [submitError, setSubmitError] = useState("")
	const [topics, setTopics] = useState<TopicResponse[]>([])

	useEffect(() => {
		topicService.list({ size: 100 }).then((res) => {
			if (res.success) setTopics(res.data.items)
		})
	}, [])

	useEffect(() => {
		if (!isEdit || !configId) return
		examService.getById(configId).then((res) => {
			setLoadedConfigId(configId)
			if (res.success) {
				setForm({
					name: res.data.name,
					description: res.data.description ?? "",
					licenseCategory: res.data.licenseCategory,
					totalQuestions: res.data.totalQuestions,
					passingScore: res.data.passingScore,
					durationMinutes: res.data.durationMinutes,
					criticalQuestions: res.data.criticalQuestions ?? 1,
					maxCriticalMistakes: res.data.maxCriticalMistakes ?? 0,
					shuffleQuestions: res.data.shuffleQuestions ?? true,
					topicDistribution: res.data.topicDistribution ?? [],
					isActive: res.data.isActive,
				})
				setVersion(res.data.version)
			} else {
				setSubmitError(res.error)
			}
		})
	}, [isEdit, configId])

	const updateForm = (patch: Partial<ExamTemplateFormData>) =>
		setForm((f) => ({ ...f, ...patch }))

	const handleLicenseChange = (cls: string) => {
		if (cls && cls in LICENSE_CATEGORY_DEFAULTS) {
			const key = cls as LicenseCategory
			updateForm({
				licenseCategory: key,
				...LICENSE_CATEGORY_DEFAULTS[key],
			})
		} else {
			updateForm({ licenseCategory: cls as LicenseCategory | "" })
		}
	}

	const addTopicRow = () => {
		updateForm({
			topicDistribution: [
				...form.topicDistribution,
				{ topicId: "", questionCount: 1 },
			],
		})
	}

	const removeTopicRow = (index: number) => {
		updateForm({
			topicDistribution: form.topicDistribution.filter(
				(_, i) => i !== index,
			),
		})
	}

	const updateTopicRow = (
		index: number,
		patch: Partial<TopicDistributionItem>,
	) => {
		updateForm({
			topicDistribution: form.topicDistribution.map((row, i) =>
				i === index ? { ...row, ...patch } : row,
			),
		})
	}

	const topicDistributionTotal = form.topicDistribution.reduce(
		(sum, r) => sum + (r.questionCount || 0),
		0,
	)

	const validate = (): boolean => {
		const next: ExamFormErrors = {}
		if (!form.name.trim()) next.name = "Vui lòng nhập tên đề thi."
		if (!form.licenseCategory)
			next.licenseCategory = "Vui lòng chọn hạng bằng."
		if (form.totalQuestions < 1) next.totalQuestions = "Tối thiểu 1 câu."
		if (form.passingScore < 1) next.passingScore = "Tối thiểu 1 điểm."
		if (form.passingScore > form.totalQuestions)
			next.passingScore = "Điểm chuẩn không thể lớn hơn tổng số câu."
		if (form.durationMinutes < 1 || form.durationMinutes > 180)
			next.durationMinutes = "Thời gian từ 1 đến 180 phút."
		if (form.criticalQuestions < 0)
			next.criticalQuestions = "Số câu điểm liệt phải >= 0."
		if (form.maxCriticalMistakes < 0)
			next.maxCriticalMistakes = "Số lỗi điểm liệt tối đa phải >= 0."
		if (form.topicDistribution.length > 0) {
			const hasEmpty = form.topicDistribution.some((r) => !r.topicId)
			if (hasEmpty) {
				next.topicDistribution =
					"Vui lòng chọn topic cho tất cả các dòng."
			} else if (topicDistributionTotal !== form.totalQuestions) {
				next.topicDistribution = `Tổng số câu theo topic (${topicDistributionTotal}) phải bằng tổng số câu (${form.totalQuestions}).`
			}
		}
		setErrors(next)
		return Object.keys(next).length === 0
	}

	const handleSubmit = async () => {
		if (!validate()) return
		setSubmitting(true)
		setSubmitError("")

		if (isEdit && configId) {
			const res = await examService.update(configId, {
				version,
				name: form.name.trim(),
				description: form.description.trim() || undefined,
				totalQuestions: form.totalQuestions,
				passingScore: form.passingScore,
				durationMinutes: form.durationMinutes,
				criticalQuestions: form.criticalQuestions,
				maxCriticalMistakes: form.maxCriticalMistakes,
				shuffleQuestions: form.shuffleQuestions,
				topicDistribution:
					form.topicDistribution.length > 0
						? form.topicDistribution
						: undefined,
				isActive: form.isActive,
			})
			setSubmitting(false)
			if (res.success) {
				navigate("/exam-config")
			} else {
				setSubmitError(res.error)
			}
		} else {
			const res = await examService.create({
				name: form.name.trim(),
				description: form.description.trim() || undefined,
				licenseCategory: form.licenseCategory as LicenseCategory,
				totalQuestions: form.totalQuestions,
				passingScore: form.passingScore,
				durationMinutes: form.durationMinutes,
				criticalQuestions: form.criticalQuestions,
				maxCriticalMistakes: form.maxCriticalMistakes,
				shuffleQuestions: form.shuffleQuestions,
				topicDistribution: form.topicDistribution,
			})
			setSubmitting(false)
			if (res.success) {
				navigate("/exam-config")
			} else {
				setSubmitError(res.error)
			}
		}
	}

	const goBack = () => navigate("/exam-config")
	const previewClass = form.licenseCategory || "B1"
	const fetchLoading =
		isEdit && Boolean(configId) && loadedConfigId !== configId

	return {
		isEdit,
		form,
		version,
		errors,
		submitting,
		submitError,
		topics,
		updateForm,
		handleLicenseChange,
		addTopicRow,
		removeTopicRow,
		updateTopicRow,
		topicDistributionTotal,
		handleSubmit,
		goBack,
		previewClass,
		fetchLoading,
	}
}
