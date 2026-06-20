import { resolve } from "node:path"
import { PactV4 } from "@pact-foundation/pact"
import {
	changeRoleResponseMatcher,
	createIdentityUserResponseMatcher,
	deletedIdentityUserMatcher,
	errorEnvelopeMatcher,
	identityUserMatcher,
	lockUserResponseMatcher,
	loginResponseMatcher,
	pactExamples,
	paginatedIdentityUsersMatcher,
	passwordActionResponseMatcher,
	successEnvelopeMatcher,
	successStatusMatcher,
} from "@repo/pact-matchers"

const outputDir = resolve(process.env.PACT_OUTPUT_DIR ?? "pacts")

const provider = new PactV4({
	consumer: "drivemate-admin",
	provider: "identity-service",
	dir: outputDir,
	logLevel: "warn",
})

const adminToken = "pact-admin-token"

async function loadServices(baseUrl: string) {
	vi.resetModules()
	vi.stubEnv("VITE_API_BASE_URL", baseUrl)
	localStorage.setItem("drivemate_access_token", adminToken)
	localStorage.setItem("drivemate_refresh_token", "refresh-token")

	return import("@/services")
}

const createUserPayload = {
	email: "student@example.com",
	fullName: "Nguyen Van A",
	role: "STUDENT" as const,
	temporaryPassword: "Temp@1234",
}

describe("drivemate-admin identity-service contract", () => {
	afterEach(() => {
		vi.unstubAllEnvs()
		localStorage.clear()
	})

	it("logs in an admin", () =>
		provider
			.addInteraction()
			.given("a valid identity login exists")
			.uponReceiving("admin login succeeds")
			.withRequest("POST", "/auth/login", (builder) => {
				builder.headers({ "content-type": "application/json" })
				builder.jsonBody({
					username: "admin@example.com",
					password: "Password@123",
				})
			})
			.willRespondWith(successStatusMatcher(201), (builder) => {
				builder.headers({
					"content-type": "application/json; charset=utf-8",
				})
				builder.jsonBody(
					successEnvelopeMatcher(loginResponseMatcher(), "Created"),
				)
			})
			.executeTest(async (mockServer) => {
				const { authService } = await loadServices(mockServer.url)
				const result = await authService.login({
					email: "admin@example.com",
					password: "Password@123",
				})

				expect(result.success).toBe(true)
				if (result.success) {
					expect(result.data.accessToken).toBe("access-token")
				}
			}))

	it("creates an identity user", () =>
		provider
			.addInteraction()
			.given("an identity user can be created")
			.uponReceiving("admin creates an identity user")
			.withRequest("POST", "/admin/identity-users", (builder) => {
				builder.headers({
					authorization: `Bearer ${adminToken}`,
					"content-type": "application/json",
				})
				builder.jsonBody(createUserPayload)
			})
			.willRespondWith(successStatusMatcher(201), (builder) => {
				builder.headers({
					"content-type": "application/json; charset=utf-8",
				})
				builder.jsonBody(
					successEnvelopeMatcher(
						createIdentityUserResponseMatcher(),
						"Created",
					),
				)
			})
			.executeTest(async (mockServer) => {
				const { identityService } = await loadServices(mockServer.url)
				const result = await identityService.create(createUserPayload)

				expect(result.success).toBe(true)
				if (result.success) {
					expect(result.data.role).toBe("STUDENT")
				}
			}))

	it("lists identity users", () =>
		provider
			.addInteraction()
			.given("identity users exist")
			.uponReceiving("admin lists identity users")
			.withRequest("GET", "/admin/identity-users", (builder) => {
				builder.headers({ authorization: `Bearer ${adminToken}` })
			})
			.willRespondWith(200, (builder) => {
				builder.headers({
					"content-type": "application/json; charset=utf-8",
				})
				builder.jsonBody(
					successEnvelopeMatcher(paginatedIdentityUsersMatcher()),
				)
			})
			.executeTest(async (mockServer) => {
				const { identityService } = await loadServices(mockServer.url)
				const result = await identityService.list()

				expect(result.success).toBe(true)
				if (result.success) {
					expect(result.data.total).toBe(1)
				}
			}))

	it("gets an identity user detail", () =>
		provider
			.addInteraction()
			.given("an identity user exists")
			.uponReceiving("admin gets an identity user")
			.withRequest(
				"GET",
				`/admin/identity-users/${pactExamples.userId}`,
				(builder) => {
					builder.headers({ authorization: `Bearer ${adminToken}` })
				},
			)
			.willRespondWith(200, (builder) => {
				builder.headers({
					"content-type": "application/json; charset=utf-8",
				})
				builder.jsonBody(successEnvelopeMatcher(identityUserMatcher()))
			})
			.executeTest(async (mockServer) => {
				const { identityService } = await loadServices(mockServer.url)
				const result = await identityService.getById(
					pactExamples.userId,
				)

				expect(result.success).toBe(true)
				if (result.success) {
					expect(result.data.userId).toBe(pactExamples.userId)
				}
			}))

	it("updates an identity user", () =>
		provider
			.addInteraction()
			.given("an identity user can be updated")
			.uponReceiving("admin updates an identity user")
			.withRequest(
				"PATCH",
				`/admin/identity-users/${pactExamples.userId}`,
				(builder) => {
					builder.headers({
						authorization: `Bearer ${adminToken}`,
						"content-type": "application/json",
					})
					builder.jsonBody({
						email: "updated-student@example.com",
						fullName: "Nguyen Van B",
					})
				},
			)
			.willRespondWith(200, (builder) => {
				builder.headers({
					"content-type": "application/json; charset=utf-8",
				})
				builder.jsonBody(successEnvelopeMatcher(identityUserMatcher()))
			})
			.executeTest(async (mockServer) => {
				const { identityService } = await loadServices(mockServer.url)
				const result = await identityService.update(
					pactExamples.userId,
					{
						email: "updated-student@example.com",
						fullName: "Nguyen Van B",
					},
				)

				expect(result.success).toBe(true)
			}))

	it("changes an identity user role", () =>
		provider
			.addInteraction()
			.given("an identity user can change role")
			.uponReceiving("admin changes an identity user role")
			.withRequest(
				"PATCH",
				`/admin/identity-users/${pactExamples.userId}/role`,
				(builder) => {
					builder.headers({
						authorization: `Bearer ${adminToken}`,
						"content-type": "application/json",
					})
					builder.jsonBody({ role: "INSTRUCTOR" })
				},
			)
			.willRespondWith(200, (builder) => {
				builder.headers({
					"content-type": "application/json; charset=utf-8",
				})
				builder.jsonBody(
					successEnvelopeMatcher(changeRoleResponseMatcher()),
				)
			})
			.executeTest(async (mockServer) => {
				const { identityService } = await loadServices(mockServer.url)
				const result = await identityService.changeRole(
					pactExamples.userId,
					"INSTRUCTOR",
				)

				expect(result.success).toBe(true)
			}))

	it("locks an identity user", () =>
		provider
			.addInteraction()
			.given("an identity user can be locked")
			.uponReceiving("admin locks an identity user")
			.withRequest(
				"PATCH",
				`/admin/identity-users/${pactExamples.userId}/lock`,
				(builder) => {
					builder.headers({
						authorization: `Bearer ${adminToken}`,
						"content-type": "application/json",
					})
					builder.jsonBody({ locked: true })
				},
			)
			.willRespondWith(200, (builder) => {
				builder.headers({
					"content-type": "application/json; charset=utf-8",
				})
				builder.jsonBody(
					successEnvelopeMatcher(lockUserResponseMatcher()),
				)
			})
			.executeTest(async (mockServer) => {
				const { identityService } = await loadServices(mockServer.url)
				const result = await identityService.setLock(
					pactExamples.userId,
					true,
				)

				expect(result.success).toBe(true)
			}))

	it("soft deletes an identity user", () =>
		provider
			.addInteraction()
			.given("an identity user can be deleted")
			.uponReceiving("admin soft deletes an identity user")
			.withRequest(
				"DELETE",
				`/admin/identity-users/${pactExamples.userId}`,
				(builder) => {
					builder.headers({
						authorization: `Bearer ${adminToken}`,
						"content-type": "application/json",
					})
					builder.jsonBody({ deletedById: pactExamples.adminId })
				},
			)
			.willRespondWith(200, (builder) => {
				builder.headers({
					"content-type": "application/json; charset=utf-8",
				})
				builder.jsonBody(
					successEnvelopeMatcher(deletedIdentityUserMatcher()),
				)
			})
			.executeTest(async (mockServer) => {
				const { identityService } = await loadServices(mockServer.url)
				const result = await identityService.softDelete(
					pactExamples.userId,
					pactExamples.adminId,
				)

				expect(result.success).toBe(true)
			}))

	it("resets an identity user password", () =>
		provider
			.addInteraction()
			.given("a password reset target exists")
			.uponReceiving("admin resets an identity user password")
			.withRequest("POST", "/auth/reset-password", (builder) => {
				builder.headers({
					authorization: `Bearer ${adminToken}`,
					"content-type": "application/json",
				})
				builder.jsonBody({
					userId: pactExamples.userId,
					newPassword: "NewPassword@123",
				})
			})
			.willRespondWith(200, (builder) => {
				builder.headers({
					"content-type": "application/json; charset=utf-8",
				})
				builder.jsonBody(
					successEnvelopeMatcher(passwordActionResponseMatcher()),
				)
			})
			.executeTest(async (mockServer) => {
				const { identityService } = await loadServices(mockServer.url)
				const result = await identityService.resetPassword(
					pactExamples.userId,
					"NewPassword@123",
				)

				expect(result.success).toBe(true)
			}))

	it("maps duplicate identity user conflicts by code", () =>
		provider
			.addInteraction()
			.given("an identity user already exists")
			.uponReceiving("admin creates a duplicate identity user")
			.withRequest("POST", "/admin/identity-users", (builder) => {
				builder.headers({
					authorization: `Bearer ${adminToken}`,
					"content-type": "application/json",
				})
				builder.jsonBody(createUserPayload)
			})
			.willRespondWith(409, (builder) => {
				builder.headers({
					"content-type": "application/json; charset=utf-8",
				})
				builder.jsonBody(
					errorEnvelopeMatcher("IDENTITY_USER_ALREADY_EXISTS"),
				)
			})
			.executeTest(async (mockServer) => {
				const { identityService } = await loadServices(mockServer.url)
				const result = await identityService.create(createUserPayload)

				expect(result.success).toBe(false)
				if (!result.success) {
					expect(result.code).toBe("IDENTITY_USER_ALREADY_EXISTS")
				}
			}))

	it("maps missing identity user errors by code", () =>
		provider
			.addInteraction()
			.given("an identity user does not exist")
			.uponReceiving("admin gets a missing identity user")
			.withRequest(
				"GET",
				`/admin/identity-users/${pactExamples.userId}`,
				(builder) => {
					builder.headers({ authorization: `Bearer ${adminToken}` })
				},
			)
			.willRespondWith(404, (builder) => {
				builder.headers({
					"content-type": "application/json; charset=utf-8",
				})
				builder.jsonBody(
					errorEnvelopeMatcher("IDENTITY_USER_NOT_FOUND"),
				)
			})
			.executeTest(async (mockServer) => {
				const { identityService } = await loadServices(mockServer.url)
				const result = await identityService.getById(
					pactExamples.userId,
				)

				expect(result.success).toBe(false)
				if (!result.success) {
					expect(result.code).toBe("IDENTITY_USER_NOT_FOUND")
				}
			}))
})
