export function generateId(prefix = "") {
  const timestamp = Date.now().toString(36)
  const random = Math.random().toString(36).substr(2, 5)
  return `${prefix}${timestamp}${random}`.toUpperCase()
}

export function validateEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

export function validatePhone(phone) {
  const phoneRegex = /^[+]?[\d\s\-$$$$]{10,}$/
  return phoneRegex.test(phone)
}

export function sanitizeInput(input) {
  if (typeof input !== "string") return input
  return input.trim().replace(/[<>]/g, "")
}

export function formatDate(date) {
  return new Date(date).toLocaleDateString("en-IN", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })
}
