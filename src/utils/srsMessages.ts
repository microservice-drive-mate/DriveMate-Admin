export type SrsMessageCode =
	| "MSG01"
	| "MSG02"
	| "MSG03"
	| "MSG04"
	| "MSG05"
	| "MSG06"
	| "MSG07"
	| "MSG08"
	| "MSG09"
	| "MSG10"
	| "MSG11"
	| "MSG12"
	| "MSG13"
	| "MSG14"
	| "MSG15"
	| "MSG16"
	| "MSG17"
	| "MSG18"
	| "MSG19"
	| "MSG20"
	| "MSG21"
	| "MSG22"
	| "MSG23"
	| "MSG24"
	| "MSG25"
	| "MSG26"
	| "MSG27"
	| "MSG28"
	| "MSG29"
	| "MSG30"
	| "MSG31"
	| "MSG32"
	| "MSG33"
	| "MSG34"
	| "MSG35"
	| "MSG122"
	| "MSG126"
	| "MSG127"

export interface ApiFailureLike {
	code?: string
	error?: string
	status?: number
}

export const SRS_MESSAGES: Record<SrsMessageCode, string> = {
	MSG01: "Please enter email and password.",
	MSG02: "Your account is locked. Please contact support.",
	MSG03: "Invalid email or password.",
	MSG04: "Please enter a valid email address.",
	MSG05: "No account found for this email.",
	MSG06: "Reset link is invalid or expired.",
	MSG07: "Password does not meet complexity requirements.",
	MSG08: "Please complete all required fields.",
	MSG09: "You do not have permission to create this account.",
	MSG10: "Email already exists.",
	MSG11: "User account created successfully.",
	MSG12: "User account not found.",
	MSG13: "Invalid user account data.",
	MSG14: "You do not have permission to update user accounts.",
	MSG15: "User account updated successfully.",
	MSG16: "You do not have permission to lock user accounts.",
	MSG17: "Invalid user account status for locking.",
	MSG18: "User account locked successfully.",
	MSG19: "You do not have permission to assign license categories.",
	MSG20: "Invalid license category.",
	MSG21: "License category assigned successfully.",
	MSG22: "Your session has expired. Please log in again.",
	MSG23: "Course not found.",
	MSG24: "No courses match your criteria.",
	MSG25: "Please complete all required course fields.",
	MSG26: "You do not have permission to create courses.",
	MSG27: "Course code already exists.",
	MSG28: "Invalid course data.",
	MSG29: "Course created successfully.",
	MSG30: "You do not have permission to update courses.",
	MSG31: "Course was modified by another user. Please reload and try again.",
	MSG32: "Course updated successfully.",
	MSG33: "You do not have permission to delete courses.",
	MSG34: "Course cannot be deleted because it is currently in use.",
	MSG35: "Course deleted successfully.",
	MSG122: "You have been logged out successfully.",
	MSG126: "Authentication token is missing.",
	MSG127: "Authentication token signature is invalid.",
}

const DEFAULT_ERROR = "Something went wrong. Please try again."
const ACCOUNT_UNLOCKED_MESSAGE = "User account unlocked successfully."

function normalize(value: string | undefined) {
	return value?.toLowerCase() ?? ""
}

function combined(error: ApiFailureLike) {
	return `${normalize(error.code)} ${normalize(error.error)}`
}

function isValidationError(error: ApiFailureLike) {
	const text = combined(error)
	return (
		error.status === 400 ||
		text.includes("validation") ||
		text.includes("bad_request")
	)
}

function isUnauthorizedError(error: ApiFailureLike) {
	const text = combined(error)
	return (
		error.status === 401 ||
		error.status === 403 ||
		text.includes("unauthorized") ||
		text.includes("forbidden")
	)
}

function isNotFoundError(error: ApiFailureLike) {
	const text = combined(error)
	return (
		error.status === 404 ||
		text.includes("not_found") ||
		text.includes("not found")
	)
}

function isDuplicateEmailError(error: ApiFailureLike) {
	const text = combined(error)
	return (
		error.status === 409 ||
		text.includes("already_exists") ||
		text.includes("already exists") ||
		text.includes("duplicate") ||
		text.includes("email exists")
	)
}

function isDuplicateCourseError(error: ApiFailureLike) {
	const text = combined(error)
	return (
		error.status === 409 ||
		text.includes("course code already exists") ||
		text.includes("course_code") ||
		text.includes("duplicate") ||
		text.includes("already_exists") ||
		text.includes("already exists")
	)
}

function isMissingRequiredCourseFieldError(error: ApiFailureLike) {
	const text = combined(error)
	return (
		text.includes("required") ||
		text.includes("missing") ||
		text.includes("complete all required")
	)
}

function isConcurrencyError(error: ApiFailureLike) {
	const text = combined(error)
	return (
		error.status === 409 ||
		text.includes("version") ||
		text.includes("concurrency") ||
		text.includes("modified by another") ||
		text.includes("stale")
	)
}

function isDependencyError(error: ApiFailureLike) {
	const text = combined(error)
	return (
		error.status === 409 ||
		text.includes("dependency") ||
		text.includes("dependencies") ||
		text.includes("currently in use") ||
		text.includes("in_use") ||
		text.includes("in use") ||
		text.includes("enrollment")
	)
}

function isLockedError(error: ApiFailureLike) {
	const text = combined(error)
	return (
		error.status === 423 ||
		text.includes("locked") ||
		text.includes("disabled") ||
		text.includes("khóa") ||
		text.includes("khoá") ||
		text.includes("khoa") ||
		text.includes("khoa tai khoan")
	)
}

function fallbackError(error: ApiFailureLike) {
	return error.error || DEFAULT_ERROR
}

export function getLoginErrorMessage(error: ApiFailureLike) {
	if (isLockedError(error)) return SRS_MESSAGES.MSG02
	if (isValidationError(error)) return SRS_MESSAGES.MSG01
	if (
		error.status === 401 ||
		normalize(error.code).includes("unauthorized")
	) {
		return SRS_MESSAGES.MSG03
	}

	return fallbackError(error)
}

export function getForgotPasswordErrorMessage(error: ApiFailureLike) {
	if (isValidationError(error)) return SRS_MESSAGES.MSG04
	if (isNotFoundError(error)) return SRS_MESSAGES.MSG05
	return fallbackError(error)
}

export function isForgotPasswordNotFound(error: ApiFailureLike) {
	return isNotFoundError(error)
}

export function getCreateAccountErrorMessage(error: ApiFailureLike) {
	if (isUnauthorizedError(error)) return SRS_MESSAGES.MSG09
	if (isDuplicateEmailError(error)) return SRS_MESSAGES.MSG10
	if (isValidationError(error)) return SRS_MESSAGES.MSG08
	return fallbackError(error)
}

export function getUpdateAccountErrorMessage(error: ApiFailureLike) {
	if (isUnauthorizedError(error)) return SRS_MESSAGES.MSG14
	if (isNotFoundError(error)) return SRS_MESSAGES.MSG12
	if (
		isValidationError(error) ||
		error.status === 409 ||
		error.status === 422
	) {
		return SRS_MESSAGES.MSG13
	}
	return fallbackError(error)
}

export function getLockAccountErrorMessage(error: ApiFailureLike) {
	if (isUnauthorizedError(error)) return SRS_MESSAGES.MSG16
	if (isNotFoundError(error)) return SRS_MESSAGES.MSG12
	if (
		isValidationError(error) ||
		error.status === 409 ||
		error.status === 422 ||
		isLockedError(error)
	) {
		return SRS_MESSAGES.MSG17
	}
	return fallbackError(error)
}

export function getLicenseAssignmentErrorMessage(error: ApiFailureLike) {
	if (isUnauthorizedError(error)) return SRS_MESSAGES.MSG19
	if (isNotFoundError(error)) return SRS_MESSAGES.MSG12
	if (isValidationError(error) || error.status === 422)
		return SRS_MESSAGES.MSG20
	return fallbackError(error)
}

export function getCreateAccountSuccessMessage() {
	return SRS_MESSAGES.MSG11
}

export function getUpdateAccountSuccessMessage() {
	return SRS_MESSAGES.MSG15
}

export function getLockAccountSuccessMessage(locked: boolean) {
	if (locked) return SRS_MESSAGES.MSG18
	return ACCOUNT_UNLOCKED_MESSAGE
}

export function getLicenseAssignmentSuccessMessage() {
	return SRS_MESSAGES.MSG21
}

export function getCourseListErrorMessage(error: ApiFailureLike) {
	if (isUnauthorizedError(error)) return SRS_MESSAGES.MSG22
	if (isNotFoundError(error)) return SRS_MESSAGES.MSG24
	return fallbackError(error)
}

export function getCourseDetailErrorMessage(error: ApiFailureLike) {
	if (isUnauthorizedError(error)) return SRS_MESSAGES.MSG22
	if (isNotFoundError(error)) return SRS_MESSAGES.MSG23
	return fallbackError(error)
}

export function getCreateCourseErrorMessage(error: ApiFailureLike) {
	if (isUnauthorizedError(error)) return SRS_MESSAGES.MSG26
	if (isDuplicateCourseError(error)) return SRS_MESSAGES.MSG27
	if (isMissingRequiredCourseFieldError(error)) return SRS_MESSAGES.MSG25
	if (isValidationError(error) || error.status === 422)
		return SRS_MESSAGES.MSG28
	return fallbackError(error)
}

export function getUpdateCourseErrorMessage(error: ApiFailureLike) {
	if (isUnauthorizedError(error)) return SRS_MESSAGES.MSG30
	if (isConcurrencyError(error)) return SRS_MESSAGES.MSG31
	if (isNotFoundError(error)) return SRS_MESSAGES.MSG23
	if (isValidationError(error) || error.status === 422)
		return SRS_MESSAGES.MSG28
	return fallbackError(error)
}

export function getDeleteCourseErrorMessage(error: ApiFailureLike) {
	if (isUnauthorizedError(error)) return SRS_MESSAGES.MSG33
	if (isDependencyError(error)) return SRS_MESSAGES.MSG34
	if (isNotFoundError(error)) return SRS_MESSAGES.MSG23
	return fallbackError(error)
}

export function getCreateCourseSuccessMessage() {
	return SRS_MESSAGES.MSG29
}

export function getUpdateCourseSuccessMessage() {
	return SRS_MESSAGES.MSG32
}

export function getDeleteCourseSuccessMessage() {
	return SRS_MESSAGES.MSG35
}

// Compound helpers — outside SRS spec, same convention
export function getPartialSaveErrorMessage(detail: string): string {
	return `Partial save: ${detail}`
}

export function getCreateAccountProfileSyncMessage(): string {
	return `${SRS_MESSAGES.MSG11} Profile is still syncing. Please refresh the list later.`
}

export function getCreateAccountPartialErrorMessage(
	step: "profile" | "license",
	detail: string,
): string {
	return step === "profile"
		? `${SRS_MESSAGES.MSG11} Profile update failed: ${detail}`
		: `${SRS_MESSAGES.MSG11} License assignment failed: ${detail}`
}
