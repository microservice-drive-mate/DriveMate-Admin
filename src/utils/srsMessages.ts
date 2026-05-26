export type SrsMessageCode =
  | "MSG01"
  | "MSG02"
  | "MSG03"
  | "MSG04"
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
  | "MSG122"
  | "MSG126"
  | "MSG127";

export type AccountMessageContext = "student" | "user";

export interface ApiFailureLike {
  code?: string;
  error?: string;
  status?: number;
}

export const SRS_MESSAGES: Record<SrsMessageCode, string> = {
  MSG01: "Please enter email and password.",
  MSG02: "Your account is locked. Please contact support.",
  MSG03: "Invalid email or password.",
  MSG04: "Please enter a valid email address.",
  MSG08: "Please complete all required fields.",
  MSG09: "You do not have permission to create this account.",
  MSG10: "Email already exists.",
  MSG11: "Student account created successfully.",
  MSG12: "Student account not found.",
  MSG13: "Invalid student account data.",
  MSG14: "You do not have permission to update student accounts.",
  MSG15: "Student account updated successfully.",
  MSG16: "You do not have permission to lock student accounts.",
  MSG17: "Invalid student account status for locking.",
  MSG18: "Student account locked successfully.",
  MSG19: "You do not have permission to assign license categories.",
  MSG20: "Invalid license category.",
  MSG21: "License category assigned successfully.",
  MSG122: "You have been logged out successfully.",
  MSG126: "Authentication token is missing.",
  MSG127: "Authentication token signature is invalid.",
};

const USER_ACCOUNT_MESSAGES: Partial<Record<SrsMessageCode, string>> = {
  MSG11: "User account created successfully.",
  MSG12: "User account not found.",
  MSG13: "Invalid user account data.",
  MSG14: "You do not have permission to update user accounts.",
  MSG15: "User account updated successfully.",
  MSG16: "You do not have permission to lock user accounts.",
  MSG17: "Invalid user account status for locking.",
  MSG18: "User account locked successfully.",
};

const DEFAULT_ERROR = "Something went wrong. Please try again.";

function normalize(value: string | undefined) {
  return value?.toLowerCase() ?? "";
}

function combined(error: ApiFailureLike) {
  return `${normalize(error.code)} ${normalize(error.error)}`;
}

function isValidationError(error: ApiFailureLike) {
  const text = combined(error);
  return (
    error.status === 400 ||
    text.includes("validation") ||
    text.includes("bad_request")
  );
}

function isUnauthorizedError(error: ApiFailureLike) {
  const text = combined(error);
  return (
    error.status === 401 ||
    error.status === 403 ||
    text.includes("unauthorized") ||
    text.includes("forbidden")
  );
}

function isNotFoundError(error: ApiFailureLike) {
  const text = combined(error);
  return error.status === 404 || text.includes("not_found") || text.includes("not found");
}

function isDuplicateEmailError(error: ApiFailureLike) {
  const text = combined(error);
  return (
    error.status === 409 ||
    text.includes("already_exists") ||
    text.includes("already exists") ||
    text.includes("duplicate") ||
    text.includes("email exists")
  );
}

function isLockedError(error: ApiFailureLike) {
  const text = combined(error);
  return (
    error.status === 423 ||
    text.includes("locked") ||
    text.includes("disabled") ||
    text.includes("khóa") ||
    text.includes("khoá") ||
    text.includes("khoa") ||
    text.includes("khoa tai khoan")
  );
}

function fallbackError(error: ApiFailureLike) {
  return error.error || DEFAULT_ERROR;
}

export function getSrsMessage(
  code: SrsMessageCode,
  context: AccountMessageContext = "student",
) {
  if (context === "user") {
    return USER_ACCOUNT_MESSAGES[code] ?? SRS_MESSAGES[code];
  }

  return SRS_MESSAGES[code];
}

export function getLoginErrorMessage(error: ApiFailureLike) {
  if (isLockedError(error)) return SRS_MESSAGES.MSG02;
  if (isValidationError(error)) return SRS_MESSAGES.MSG01;
  if (error.status === 401 || normalize(error.code).includes("unauthorized")) {
    return SRS_MESSAGES.MSG03;
  }

  return fallbackError(error);
}

export function getForgotPasswordErrorMessage(error: ApiFailureLike) {
  if (isValidationError(error)) return SRS_MESSAGES.MSG04;
  return fallbackError(error);
}

export function isForgotPasswordNotFound(error: ApiFailureLike) {
  return isNotFoundError(error);
}

export function getCreateAccountErrorMessage(
  error: ApiFailureLike,
  context: AccountMessageContext = "user",
) {
  if (isUnauthorizedError(error)) return getSrsMessage("MSG09", context);
  if (isDuplicateEmailError(error)) return SRS_MESSAGES.MSG10;
  if (isValidationError(error)) return SRS_MESSAGES.MSG08;
  return fallbackError(error);
}

export function getUpdateAccountErrorMessage(
  error: ApiFailureLike,
  context: AccountMessageContext = "user",
) {
  if (isUnauthorizedError(error)) return getSrsMessage("MSG14", context);
  if (isNotFoundError(error)) return getSrsMessage("MSG12", context);
  if (isValidationError(error) || error.status === 409 || error.status === 422) {
    return getSrsMessage("MSG13", context);
  }
  return fallbackError(error);
}

export function getLockAccountErrorMessage(
  error: ApiFailureLike,
  context: AccountMessageContext = "user",
) {
  if (isUnauthorizedError(error)) return getSrsMessage("MSG16", context);
  if (isNotFoundError(error)) return getSrsMessage("MSG12", context);
  if (
    isValidationError(error) ||
    error.status === 409 ||
    error.status === 422 ||
    isLockedError(error)
  ) {
    return getSrsMessage("MSG17", context);
  }
  return fallbackError(error);
}

export function getLicenseAssignmentErrorMessage(error: ApiFailureLike) {
  if (isUnauthorizedError(error)) return SRS_MESSAGES.MSG19;
  if (isNotFoundError(error)) return SRS_MESSAGES.MSG12;
  if (isValidationError(error) || error.status === 422) return SRS_MESSAGES.MSG20;
  return fallbackError(error);
}

export function getCreateAccountSuccessMessage(
  context: AccountMessageContext = "user",
) {
  return getSrsMessage("MSG11", context);
}

export function getUpdateAccountSuccessMessage(
  context: AccountMessageContext = "user",
) {
  return getSrsMessage("MSG15", context);
}

export function getLockAccountSuccessMessage(
  locked: boolean,
  context: AccountMessageContext = "user",
) {
  if (locked) return getSrsMessage("MSG18", context);
  return context === "student"
    ? "Student account unlocked successfully."
    : "User account unlocked successfully.";
}

export function getLicenseAssignmentSuccessMessage() {
  return SRS_MESSAGES.MSG21;
}
