/**
 * Auth utility functions for validation
 */

export const validateEmail = (email: string): boolean => {
	const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
	return emailRegex.test(email)
}

export const validatePassword = (password: string) => {
	return {
		isValid: password.length >= 8,
		minLength: password.length >= 8,
		hasUpperCase: /[A-Z]/.test(password),
		hasLowerCase: /[a-z]/.test(password),
		hasNumber: /\d/.test(password),
		hasSpecialChar: /[!@#$%^&*()_+\-={};:'"\\|,.<>?]/.test(password),
	}
}

export const validatePasswordMatch = (
	password: string,
	confirmPassword: string,
): boolean => {
	return password === confirmPassword && password.length > 0
}

export const validateOTP = (otp: string): boolean => {
	return otp.length === 6 && /^\d+$/.test(otp)
}

/**
 * SĐT là tùy chọn: rỗng được coi là hợp lệ. Nếu có nhập thì phải gồm 9-11 chữ số
 * (sau khi bỏ khoảng trắng).
 */
export const validatePhoneNumber = (phone: string): boolean => {
	const normalized = phone.replace(/\s+/g, "")
	if (!normalized) return true
	return /^[0-9]{9,11}$/.test(normalized)
}

export const getPasswordStrength = (password: string) => {
	const validation = validatePassword(password)
	let strength = 0

	if (validation.minLength) strength++
	if (validation.hasUpperCase) strength++
	if (validation.hasLowerCase) strength++
	if (validation.hasNumber) strength++
	if (validation.hasSpecialChar) strength++

	if (strength <= 2) return "weak"
	if (strength <= 3) return "fair"
	if (strength <= 4) return "good"
	return "strong"
}
