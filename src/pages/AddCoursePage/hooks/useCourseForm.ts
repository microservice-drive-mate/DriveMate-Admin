import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { courseService, identityService } from "@/services";
import type { IdentityUser } from "@/types/identity.types";
import {
	getCourseDetailErrorMessage,
	getCreateCourseErrorMessage,
	getCreateCourseSuccessMessage,
	getUpdateCourseErrorMessage,
	getUpdateCourseSuccessMessage,
	SRS_MESSAGES,
} from "@/utils/srsMessages";
import type { CourseFormData, LicenseCategory } from "@/types/course.types";

const DEFAULT_FORM: CourseFormData = {
	title: "",
	licenseCategory: "",
	description: "",
	duration: "",
	tuitionFee: 0,
	capacity: 30,
	instructorIds: [],
	requirement: {
		minAge: 18,
		prerequisites: "",
		attendanceRate: 80,
		minPassScore: 80,
		requiredExams: 2,
	},
};

type FieldErrors = Partial<Record<"title" | "licenseCategory", string>>;

/** State + side effects cho form tạo/sửa khóa học. Component chỉ lo hiển thị. */
export function useCourseForm() {
	const { courseId } = useParams<{ courseId: string }>();
	const navigate = useNavigate();
	const isEdit = Boolean(courseId);

	const [form, setForm] = useState<CourseFormData>(DEFAULT_FORM);
	const [instructors, setInstructors] = useState<IdentityUser[]>([]);
	const [instructorSearch, setInstructorSearch] = useState("");
	const [loading, setLoading] = useState(false);
	const [loadedCourseId, setLoadedCourseId] = useState<string | null>(null);
	const [submitError, setSubmitError] = useState("");
	const [errors, setErrors] = useState<FieldErrors>({});

	useEffect(() => {
		if (!isEdit || !courseId) return;
		courseService.getById(courseId).then((res) => {
			setLoadedCourseId(courseId);
			if (res.success) {
				const c = res.data;
				setForm({
					title: c.title,
					licenseCategory: c.licenseCategory,
					description: c.description ?? "",
					duration: c.duration ?? "",
					tuitionFee: c.tuitionFee,
					capacity: c.capacity ?? 30,
					instructorIds: c.instructorIds ?? [],
					requirement: {
						minAge: c.requirement?.minAge ?? 18,
						prerequisites: c.requirement?.prerequisites ?? "",
						attendanceRate: c.requirement?.attendanceRate ?? 80,
						minPassScore: c.requirement?.minPassScore ?? 80,
						requiredExams: c.requirement?.requiredExams ?? 2,
					},
				});
			} else {
				setSubmitError(getCourseDetailErrorMessage(res));
			}
		});
	}, [isEdit, courseId]);

	useEffect(() => {
		identityService.list({ role: "INSTRUCTOR", size: 100 }).then((res) => {
			if (res.success) setInstructors(res.data.items);
		});
	}, []);

	const update = (patch: Partial<CourseFormData>) =>
		setForm((f) => ({ ...f, ...patch }));
	const updateReq = (patch: Partial<CourseFormData["requirement"]>) =>
		setForm((f) => ({ ...f, requirement: { ...f.requirement, ...patch } }));

	const clearFieldError = (field: keyof FieldErrors) =>
		setErrors((er) => ({ ...er, [field]: "" }));

	const validate = (): boolean => {
		const errs: FieldErrors = {};
		if (!form.title.trim()) errs.title = SRS_MESSAGES.MSG25;
		if (!form.licenseCategory) errs.licenseCategory = SRS_MESSAGES.MSG25;
		setErrors(errs);
		return Object.keys(errs).length === 0;
	};

	const handleSubmit = async () => {
		if (!validate()) return;

		setLoading(true);
		setSubmitError("");

		const req = {
			minAge: form.requirement.minAge || undefined,
			prerequisites: form.requirement.prerequisites.trim() || undefined,
			attendanceRate: form.requirement.attendanceRate,
			minPassScore: form.requirement.minPassScore,
			requiredExams: form.requirement.requiredExams,
		};

		const result =
			isEdit && courseId
				? await courseService.update(courseId, {
						title: form.title.trim(),
						description: form.description.trim() || undefined,
						duration: form.duration.trim() || undefined,
						tuitionFee: form.tuitionFee,
						capacity: form.capacity || undefined,
						requirement: req,
					})
				: await courseService.create({
						title: form.title.trim(),
						licenseCategory: form.licenseCategory as LicenseCategory,
						description: form.description.trim() || undefined,
						duration: form.duration.trim() || undefined,
						tuitionFee: form.tuitionFee,
						capacity: form.capacity || undefined,
						instructorIds:
							form.instructorIds.length > 0
								? form.instructorIds
								: undefined,
						requirement: req,
					});

		setLoading(false);

		if (result.success) {
			navigate(
				isEdit && courseId
					? `/courses/${courseId}`
					: `/courses/${result.data.id}`,
				{
					state: {
						notice: isEdit
							? getUpdateCourseSuccessMessage()
							: getCreateCourseSuccessMessage(),
					},
				},
			);
		} else {
			setSubmitError(
				isEdit
					? getUpdateCourseErrorMessage(result)
					: getCreateCourseErrorMessage(result),
			);
		}
	};

	const goBack = () => navigate(isEdit ? `/courses/${courseId}` : "/courses");

	const fetchLoading =
		isEdit && Boolean(courseId) && loadedCourseId !== courseId;

	return {
		isEdit,
		form,
		update,
		updateReq,
		instructors,
		instructorSearch,
		setInstructorSearch,
		loading,
		submitError,
		errors,
		clearFieldError,
		handleSubmit,
		goBack,
		fetchLoading,
	};
}
