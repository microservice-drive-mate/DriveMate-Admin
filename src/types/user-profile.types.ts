import type { UserRole } from "./identity.types";

export type Gender = "MALE" | "FEMALE" | "OTHER";
export type LicenseTier = "A1" | "A2" | "B1" | "B2" | "C" | "D" | "E" | "F";

export interface StudentDetail {
  licenseTier: LicenseTier | null;
  enrolledAt: string | null;
  notes: string | null;
}

export interface UserProfile {
  id: string;
  fullName: string;
  email: string;
  phoneNumber: string | null;
  dateOfBirth: string | null;
  avatarUrl: string | null;
  mediaFileId: string | null;
  gender: Gender | null;
  address: string | null;
  role: UserRole;
  isActive: boolean;
  createdAt: string;
  studentDetail: StudentDetail | null;
}

export interface CreateUserProfilePayload {
  id: string;
  fullName: string;
  email: string;
  role: UserRole;
  phoneNumber?: string;
  dateOfBirth?: string;
  gender?: Gender;
  address?: string;
  avatarUrl?: string;
  mediaFileId?: string;
  licenseTier?: LicenseTier;
  enrolledAt?: string;
}

export interface UpdateUserProfilePayload {
  fullName?: string;
  phoneNumber?: string;
  dateOfBirth?: string;
  gender?: Gender;
  address?: string;
  avatarUrl?: string;
  mediaFileId?: string;
  notes?: string;
}

export type UserDocumentType = 'ID_CARD_FRONT' | 'ID_CARD_BACK' | 'PORTRAIT' | 'HEALTH_CERTIFICATE' | 'OTHER';
export type UserDocumentStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export interface UserDocument {
  id: string;
  userId?: string;
  type: UserDocumentType;
  mediaFileId: string;
  title?: string | null;
  status?: UserDocumentStatus;
  fileUrl?: string | null;
  originalName?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface AddDocumentPayload {
  type: UserDocumentType;
  mediaFileId: string;
  title?: string;
  status?: UserDocumentStatus;
}

export interface CreateUserDocumentInput {
  type: UserDocumentType;
  mediaFileId: string;
  fileUrl?: string;
  originalName?: string;
}

export interface CreateUserDocumentsPayload {
  documents: CreateUserDocumentInput[];
}

export interface UserListParams {
  page?: number;
  size?: number;
  role?: UserRole;
  isActive?: boolean;
  search?: string;
}

export const GENDER_LABELS: Record<Gender, string> = {
  MALE: "Nam",
  FEMALE: "Nữ",
  OTHER: "Khác",
};

export const LICENSE_TIERS: LicenseTier[] = [
  "A1",
  "A2",
  "B1",
  "B2",
  "C",
  "D",
  "E",
  "F",
];
