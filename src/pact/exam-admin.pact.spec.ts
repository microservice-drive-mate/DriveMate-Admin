import { resolve } from "node:path"
import { PactV4 } from "@pact-foundation/pact"
import {
	errorEnvelopeMatcher,
	examTemplateMatcher,
	pactExamples,
	paginatedExamSessionsMatcher,
	paginatedExamTemplatesMatcher,
	successEnvelopeMatcher,
	successStatusMatcher,
} from "@repo/pact-matchers"

const outputDir = resolve(process.env.PACT_OUTPUT_DIR ?? "pacts")

const provider = new PactV4({
	consumer: "drivemate-admin",
	provider: "exam-service",
	dir: outputDir,
	logLevel: "warn",
})

const adminToken = "pact-admin-token"

async function loadExamService(baseUrl: string) {
	vi.resetModules()
	vi.stubEnv("VITE_API_BASE_URL", baseUrl)
	localStorage.setItem("drivemate_access_token", adminToken)

	return import("@/services")
}

const createTemplatePayload = {
	name: "De thi B1",
	description: "De thi hang B1",
	licenseCategory: "B1" as const,
	totalQuestions: 30,
	passingScore: 26,
	durationMinutes: 20,
	criticalQuestions: 1,
	maxCriticalMistakes: 0,
	shuffleQuestions: true,
	topicDistribution: [
		{
			topicId: pactExamples.topicId,
			questionCount: 30,
		},
	],
}

describe("drivemate-admin exam-service contract", () => {
	afterEach(() => {
		vi.unstubAllEnvs()
		localStorage.clear()
	})

	it("lists exam templates", () =>
		provider
			.addInteraction()
			.given("an exam template exists")
			.uponReceiving("admin lists exam templates")
			.withRequest("GET", "/admin/exams/templates", (builder) => {
				builder.headers({ authorization: `Bearer ${adminToken}` })
			})
			.willRespondWith(200, (builder) => {
				builder.headers({
					"content-type": "application/json; charset=utf-8",
				})
				builder.jsonBody(
					successEnvelopeMatcher(paginatedExamTemplatesMatcher()),
				)
			})
			.executeTest(async (mockServer) => {
				const { examService } = await loadExamService(mockServer.url)
				const result = await examService.list()

				expect(result.success).toBe(true)
				if (result.success) {
					expect(result.data.items[0].licenseCategory).toBe("B1")
				}
			}))

	it("gets an exam template detail", () =>
		provider
			.addInteraction()
			.given("an exam template exists")
			.uponReceiving("admin gets an exam template")
			.withRequest(
				"GET",
				`/admin/exams/templates/${pactExamples.templateId}`,
				(builder) => {
					builder.headers({ authorization: `Bearer ${adminToken}` })
				},
			)
			.willRespondWith(200, (builder) => {
				builder.headers({
					"content-type": "application/json; charset=utf-8",
				})
				builder.jsonBody(successEnvelopeMatcher(examTemplateMatcher()))
			})
			.executeTest(async (mockServer) => {
				const { examService } = await loadExamService(mockServer.url)
				const result = await examService.getById(
					pactExamples.templateId,
				)

				expect(result.success).toBe(true)
				if (result.success) {
					expect(result.data.id).toBe(pactExamples.templateId)
				}
			}))

	it("creates an exam template", () =>
		provider
			.addInteraction()
			.given("an active exam template exists")
			.uponReceiving("admin creates an exam template")
			.withRequest("POST", "/admin/exams/templates", (builder) => {
				builder.headers({
					authorization: `Bearer ${adminToken}`,
					"content-type": "application/json",
				})
				builder.jsonBody(createTemplatePayload)
			})
			.willRespondWith(successStatusMatcher(201), (builder) => {
				builder.headers({
					"content-type": "application/json; charset=utf-8",
				})
				builder.jsonBody(
					successEnvelopeMatcher(examTemplateMatcher(), "Created"),
				)
			})
			.executeTest(async (mockServer) => {
				const { examService } = await loadExamService(mockServer.url)
				const result = await examService.create(createTemplatePayload)

				expect(result.success).toBe(true)
			}))

	it("updates an exam template", () =>
		provider
			.addInteraction()
			.given("an exam template exists")
			.uponReceiving("admin updates an exam template")
			.withRequest(
				"PATCH",
				`/admin/exams/templates/${pactExamples.templateId}`,
				(builder) => {
					builder.headers({
						authorization: `Bearer ${adminToken}`,
						"content-type": "application/json",
					})
					builder.jsonBody({
						version: 1,
						name: "De thi B1 cap nhat",
						topicDistribution:
							createTemplatePayload.topicDistribution,
					})
				},
			)
			.willRespondWith(200, (builder) => {
				builder.headers({
					"content-type": "application/json; charset=utf-8",
				})
				builder.jsonBody(successEnvelopeMatcher(examTemplateMatcher()))
			})
			.executeTest(async (mockServer) => {
				const { examService } = await loadExamService(mockServer.url)
				const result = await examService.update(
					pactExamples.templateId,
					{
						version: 1,
						name: "De thi B1 cap nhat",
						topicDistribution:
							createTemplatePayload.topicDistribution,
					},
				)

				expect(result.success).toBe(true)
			}))

	it("soft deletes an exam template", () =>
		provider
			.addInteraction()
			.given("an exam template exists")
			.uponReceiving("admin soft deletes an exam template")
			.withRequest(
				"DELETE",
				`/admin/exams/templates/${pactExamples.templateId}`,
				(builder) => {
					builder.headers({
						authorization: `Bearer ${adminToken}`,
						"content-type": "application/json",
					})
					builder.jsonBody({ version: 1 })
				},
			)
			.willRespondWith(200, (builder) => {
				builder.headers({
					"content-type": "application/json; charset=utf-8",
				})
				builder.jsonBody(successEnvelopeMatcher(examTemplateMatcher()))
			})
			.executeTest(async (mockServer) => {
				const { examService } = await loadExamService(mockServer.url)
				const result = await examService.softDelete(
					pactExamples.templateId,
					1,
				)

				expect(result.success).toBe(true)
			}))

	it("lists exam sessions for admin dashboards", () =>
		provider
			.addInteraction()
			.given("exam sessions exist")
			.uponReceiving("admin lists exam sessions")
			.withRequest("GET", "/admin/exams/sessions", (builder) => {
				builder.headers({ authorization: `Bearer ${adminToken}` })
			})
			.willRespondWith(200, (builder) => {
				builder.headers({
					"content-type": "application/json; charset=utf-8",
				})
				builder.jsonBody(
					successEnvelopeMatcher(paginatedExamSessionsMatcher()),
				)
			})
			.executeTest(async (mockServer) => {
				const { examService } = await loadExamService(mockServer.url)
				const result = await examService.listSessions()

				expect(result.success).toBe(true)
				if (result.success) {
					expect(result.data.total).toBe(1)
				}
			}))

	it("maps exam template version conflicts by code", () =>
		provider
			.addInteraction()
			.given("an exam template version conflict exists")
			.uponReceiving("admin updates a stale exam template")
			.withRequest(
				"PATCH",
				`/admin/exams/templates/${pactExamples.templateId}`,
				(builder) => {
					builder.headers({
						authorization: `Bearer ${adminToken}`,
						"content-type": "application/json",
					})
					builder.jsonBody({
						version: 1,
						name: "De thi B1 stale",
					})
				},
			)
			.willRespondWith(409, (builder) => {
				builder.headers({
					"content-type": "application/json; charset=utf-8",
				})
				builder.jsonBody(
					errorEnvelopeMatcher("EXAM_TEMPLATE_VERSION_CONFLICT"),
				)
			})
			.executeTest(async (mockServer) => {
				const { examService } = await loadExamService(mockServer.url)
				const result = await examService.update(
					pactExamples.templateId,
					{
						version: 1,
						name: "De thi B1 stale",
					},
				)

				expect(result.success).toBe(false)
				if (!result.success) {
					expect(result.code).toBe("EXAM_TEMPLATE_VERSION_CONFLICT")
				}
			}))
})
