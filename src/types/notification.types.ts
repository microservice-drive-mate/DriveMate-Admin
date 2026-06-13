export type NotificationType = 'IN_APP' | 'EMAIL' | 'PUSH' | 'SMS';
export type AcademicWarningSeverity = 'LOW' | 'MEDIUM' | 'HIGH';
export type NotificationStatus = 'QUEUED' | 'DELIVERED' | 'FAILED';

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  body: string;
  data: Record<string, unknown>;
  isRead: boolean;
  readAt: string | null;
  sentAt: string | null;
  createdAt: string;
  status: NotificationStatus;
  retryCount: number;
  errorMessage: string | null;
  deliveredAt: string | null;
  updatedAt: string;
  eventType: string | null;
}

export interface SendAcademicWarningPayload {
  studentIds: string[];
  reason: string;
  severity: AcademicWarningSeverity;
  message: string;
  deliveryChannels?: NotificationType[];
}

export interface NotificationListParams {
  page?: number;
  size?: number;
}

export const SEVERITY_LABELS: Record<AcademicWarningSeverity, string> = {
  LOW: 'Thấp',
  MEDIUM: 'Trung bình',
  HIGH: 'Cao',
};
