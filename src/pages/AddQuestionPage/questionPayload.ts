import type { MediaReference } from "@/types/media.types";
import type {
	CreateQuestionPayload,
	LicenseCategory,
	QuestionDifficulty,
	QuestionFormData,
	QuestionResponse,
	QuestionType,
	UpdateQuestionPayload,
} from "@/types/question.types";

const UUID_PATTERN =
	/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export const isUuid = (value: string | null | undefined): value is string =>
	typeof value === "string" && UUID_PATTERN.test(value);

export const toMediaReference = (
	mediaFileId: string | null,
	publicUrl: string | null,
): MediaReference | null => {
	if (!isUuid(mediaFileId)) return null;
	return { mediaFileId, publicUrl: publicUrl ?? "" };
};

export const questionToFormData = (
	question: QuestionResponse,
): QuestionFormData => ({
	content: question.content,
	type: question.type,
	isCritical: question.isCritical,
	difficulty: question.difficulty,
	licenseCategories: [...question.licenseCategories],
	topicId: question.topicId,
	isActive: question.isActive,
	options: [...question.options]
		.sort((a, b) => a.displayOrder - b.displayOrder)
		.map((option) => ({
			id: option.id,
			content: option.content,
			isCorrect: option.isCorrect,
			displayOrder: option.displayOrder,
		})),
	explanation: question.explanation,
});

const toPayloadOptions = (
	options: QuestionFormData["options"],
): CreateQuestionPayload["options"] =>
	options.map((option) => ({
		content: option.content.trim(),
		isCorrect: option.isCorrect,
		displayOrder: option.displayOrder,
	}));

const buildBasePayload = (form: QuestionFormData): CreateQuestionPayload => ({
	content: form.content.trim(),
	type: form.type as QuestionType,
	licenseCategories: form.licenseCategories,
	difficulty: form.difficulty as QuestionDifficulty,
	explanation: form.explanation.trim(),
	isCritical: form.isCritical,
	isActive: form.isActive,
	topicId: form.topicId,
	options: toPayloadOptions(form.options),
});

const areLicenseCategoriesEqual = (
	current: LicenseCategory[],
	initial: LicenseCategory[],
) => {
	if (current.length !== initial.length) return false;

	const currentSorted = [...current].sort();
	const initialSorted = [...initial].sort();
	return currentSorted.every(
		(category, index) => category === initialSorted[index],
	);
};

const areOptionsEqual = (
	current: CreateQuestionPayload["options"],
	initial: CreateQuestionPayload["options"],
) =>
	current.length === initial.length &&
	current.every((option, index) => {
		const initialOption = initial[index];
		return (
			initialOption &&
			option.content === initialOption.content &&
			option.isCorrect === initialOption.isCorrect &&
			option.displayOrder === initialOption.displayOrder
		);
	});

const setMediaPayload = (
	payload: CreateQuestionPayload | UpdateQuestionPayload,
	image: MediaReference,
) => {
	if (!isUuid(image.mediaFileId)) return;
	payload.imageUrl = image.publicUrl || null;
	payload.mediaFileId = image.mediaFileId;
};

export const buildCreateQuestionPayload = (
	form: QuestionFormData,
	image: MediaReference | null,
): CreateQuestionPayload => {
	const payload = buildBasePayload(form);
	if (image) setMediaPayload(payload, image);
	return payload;
};

interface BuildUpdatePayloadArgs {
	form: QuestionFormData;
	initialForm: QuestionFormData | null;
	version: number;
	image: MediaReference | null;
	imageChanged: boolean;
}

export const buildUpdateQuestionPayload = ({
	form,
	initialForm,
	version,
	image,
	imageChanged,
}: BuildUpdatePayloadArgs): UpdateQuestionPayload => {
	const payload: UpdateQuestionPayload = { version };

	if (!initialForm) {
		Object.assign(payload, buildBasePayload(form));
	} else {
		const current = buildBasePayload(form);
		const initial = buildBasePayload(initialForm);

		if (current.content !== initial.content) payload.content = current.content;
		if (current.type !== initial.type) payload.type = current.type;
		if (
			!areLicenseCategoriesEqual(
				current.licenseCategories,
				initial.licenseCategories,
			)
		) {
			payload.licenseCategories = current.licenseCategories;
		}
		if (current.difficulty !== initial.difficulty) {
			payload.difficulty = current.difficulty;
		}
		if (current.explanation !== initial.explanation) {
			payload.explanation = current.explanation;
		}
		if (current.isCritical !== initial.isCritical) {
			payload.isCritical = current.isCritical;
		}
		if (current.isActive !== initial.isActive) {
			payload.isActive = current.isActive;
		}
		if (current.topicId !== initial.topicId) {
			payload.topicId = current.topicId;
		}
		if (!areOptionsEqual(current.options, initial.options)) {
			payload.options = current.options;
		}
	}

	if (imageChanged) {
		if (image && isUuid(image.mediaFileId)) {
			setMediaPayload(payload, image);
		} else {
			payload.imageUrl = null;
			payload.mediaFileId = null;
		}
	}

	return payload;
};
