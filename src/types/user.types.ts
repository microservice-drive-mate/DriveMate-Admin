export type {
	UserRole,
	IdentityUser,
	CreateIdentityUserPayload,
	UpdateIdentityUserPayload,
	IdentityUserListParams,
	CreateIdentityUserResponse,
	ChangeRoleResponse,
	LockResponse,
} from "./identity.types"

export { ROLE_LABELS } from "./identity.types"

export type {
	Gender,
	LicenseTier,
	StudentDetail,
	UserProfile,
	CreateUserProfilePayload,
	UpdateUserProfilePayload,
	UserListParams,
} from "./user-profile.types"

export { GENDER_LABELS, LICENSE_TIERS } from "./user-profile.types"

// Legacy alias kept for student management pages (out of scope for current refactor).
export type LicenseClass = "A1" | "A2" | "B1" | "B2" | "C" | "D" | "E" | "F"
export const LICENSE_CLASSES: LicenseClass[] = [
	"A1",
	"A2",
	"B1",
	"B2",
	"C",
	"D",
	"E",
	"F",
]
