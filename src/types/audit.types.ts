export interface AuditLog {
	id: string
	eventId: string
	serviceName: string
	actorId: string
	actorRole: string
	action: string
	resourceType: string
	resourceId: string
	outcome: string
	occurredAt: string
	correlationId: string
	ipAddress: string | null
	userAgent: string | null
	requestPath: string | null
	httpMethod: string | null
	metadata: Record<string, unknown>
	createdAt: string
}

export interface AuditLogListParams {
	actorId?: string
	action?: string
	resourceType?: string
	resourceId?: string
	serviceName?: string
	from?: string
	to?: string
	page?: number
	size?: number
}
