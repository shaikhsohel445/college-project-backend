import { Router } from "itty-router"
import { corsHeaders, handleCORS } from "./utils/cors"
import { handleAdmissionForm } from "./handlers/admission"
import { handleContactForm } from "./handlers/contact"
import { handleFeedback } from "./handlers/feedback"
import { getNotices, createNotice } from "./handlers/notices"
import { getEvents, createEvent } from "./handlers/events"
import { getFaculty, createFaculty } from "./handlers/faculty"
import { getGallery, uploadImage } from "./handlers/gallery"
import {
  handleAdminLogin,
  handleAdminVerify,
  getAdminStats,
  getAdminNotices,
  createAdminNotice,
  updateAdminNotice,
  deleteAdminNotice,
} from "./handlers/admin"

const router = Router()

// Middleware to verify admin token
async function requireAuth(request, env) {
  const authHeader = request.headers.get("Authorization")
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return new Response(JSON.stringify({ error: "Authentication required" }), {
      status: 401,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    })
  }
  return null
}

// CORS preflight
router.options("*", handleCORS)

// Health check
router.get("/api/health", () => {
  return new Response(JSON.stringify({ status: "OK", timestamp: new Date().toISOString() }), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  })
})

// Admin authentication routes
router.post("/api/admin/login", handleAdminLogin)
router.get("/api/admin/verify", handleAdminVerify)

// Admin protected routes
router.get("/api/admin/stats", async (request, env) => {
  const authError = await requireAuth(request, env)
  if (authError) return authError
  return getAdminStats(request, env)
})

router.get("/api/admin/notices", async (request, env) => {
  const authError = await requireAuth(request, env)
  if (authError) return authError
  return getAdminNotices(request, env)
})

router.post("/api/admin/notices", async (request, env) => {
  const authError = await requireAuth(request, env)
  if (authError) return authError
  return createAdminNotice(request, env)
})

router.put("/api/admin/notices/:id", async (request, env) => {
  const authError = await requireAuth(request, env)
  if (authError) return authError
  return updateAdminNotice(request, env)
})

router.delete("/api/admin/notices/:id", async (request, env) => {
  const authError = await requireAuth(request, env)
  if (authError) return authError
  return deleteAdminNotice(request, env)
})

// Public routes (existing)
router.post("/api/admission/apply", handleAdmissionForm)
router.get("/api/admission/status/:applicationId", async (request, env) => {
  const { applicationId } = request.params
  const application = await env.COLLEGE_DB.get(`admission:${applicationId}`)

  if (!application) {
    return new Response(JSON.stringify({ error: "Application not found" }), {
      status: 404,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    })
  }

  return new Response(application, {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  })
})

router.post("/api/contact", handleContactForm)
router.post("/api/feedback", handleFeedback)
router.get("/api/notices", getNotices)
router.post("/api/notices", createNotice)
router.get("/api/events", getEvents)
router.post("/api/events", createEvent)
router.get("/api/faculty", getFaculty)
router.post("/api/faculty", createFaculty)
router.get("/api/gallery", getGallery)
router.post("/api/gallery/upload", uploadImage)

// 404 handler
router.all("*", () => new Response("Not Found", { status: 404 }))

export default {
  async fetch(request, env, ctx) {
    return router.handle(request, env, ctx)
  },
}
