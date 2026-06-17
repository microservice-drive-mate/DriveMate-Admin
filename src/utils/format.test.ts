import { describe, it, expect } from "vitest"
import { toDateInput, getInitials } from "./format"

describe("toDateInput", () => {
	it("trims an ISO datetime to yyyy-MM-dd", () => {
		expect(toDateInput("2026-06-17T10:30:00Z")).toBe("2026-06-17")
	})

	it("returns an empty string for null or undefined", () => {
		expect(toDateInput(null)).toBe("")
		expect(toDateInput(undefined)).toBe("")
	})
})

describe("getInitials", () => {
	it("uses the first and last word initials", () => {
		expect(getInitials("Nguyen Van A")).toBe("NA")
	})

	it("returns up to two letters for a single name", () => {
		expect(getInitials("Toan")).toBe("TO")
	})

	it("returns ? for blank input", () => {
		expect(getInitials("   ")).toBe("?")
	})
})
