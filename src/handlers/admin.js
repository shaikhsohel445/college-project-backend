import { corsHeaders } from "../utils/cors"
import { generateId } from "../utils/helpers"

// Simple admin credentials (in production, use proper authentication)
const ADMIN_CREDENTIALS = {
  username: "admin",
  password: "admin123", // Change this in production
}

const JWT_SECRET = "your-jwt-secret-key" // Change this in production

// Simple JWT implementation (in production, use a proper JWT library)
function createToken(payload) {
  const header = btoa(JSON.stringify({ alg: "HS256", typ: "JWT" }))
  const payloadEncoded = btoa(JSON.stringify(payload))
  const signature = btoa(`${header}.${payloadEncoded}.${JWT_SECRET}`)
  return `${header}.${payloadEncoded}.${signature}`
}

function verifyToken(token) {
  try {
    const [header, payload, signature] = token.split(".")
    const expectedSignature = btoa(`${header}.${payload}.${JWT_SECRET}`)

    if (signature !== expectedSignature) {
      return null
    }

    return JSON.parse(atob(payload))
  } catch (error) {
    return null
  }
}

export async function handleAdminLogin(request, env) {
  try {
    const { username, password } = await request.json()

    if (username === ADMIN_CREDENTIALS.username && password === ADMIN_CREDENTIALS.password) {
      const token = createToken({
        username,
        role: "admin",
        exp: Date.now() + 24 * 60 * 60 * 1000, // 24 hours
      })

      return new Response(
        JSON.stringify({
          success: true,
          token,
          message: "Login successful",
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      )
    } else {
      return new Response(
        JSON.stringify({
          error: "Invalid credentials",
        }),
        {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      )
    }
  } catch (error) {
    return new Response(
      JSON.stringify({
        error: "Login failed",
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    )
  }
}

export async function handleAdminVerify(request, env) {
  try {
    const authHeader = request.headers.get("Authorization")
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "No token provided" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      })
    }

    const token = authHeader.substring(7)
    const payload = verifyToken(token)

    if (!payload || payload.exp < Date.now()) {
      return new Response(JSON.stringify({ error: "Invalid or expired token" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      })
    }

    return new Response(
      JSON.stringify({
        success: true,
        user: { username: payload.username, role: payload.role },
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    )
  } catch (error) {
    return new Response(JSON.stringify({ error: "Token verification failed" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    })
  }
}

export async function getAdminStats(request, env) {
  try {
    // Get various statistics
    const [studentsCount, facultyCount, noticesCount, applicationsCount] = await Promise.all([
      env.COLLEGE_DB.get("stats:students"),
      env.COLLEGE_DB.get("stats:faculty"),
      env.COLLEGE_DB.list({ prefix: "notice:" }),
      env.COLLEGE_DB.list({ prefix: "admission:" }),
    ])

    const stats = {
      totalStudents: Number.parseInt(studentsCount || "0"),
      totalFaculty: Number.parseInt(facultyCount || "0"),
      totalNotices: noticesCount.keys.length,
      pendingApplications: applicationsCount.keys.length,
    }

    return new Response(JSON.stringify(stats), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: "Failed to fetch stats" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    })
  }
}

export async function getAdminNotices(request, env) {
  try {
    const noticesList = await env.COLLEGE_DB.list({ prefix: "notice:" })

    const notices = await Promise.all(
      noticesList.keys.map(async (key) => {
        const data = await env.COLLEGE_DB.get(key.name)
        return JSON.parse(data)
      }),
    )

    // Sort by date (newest first)
    notices.sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt))

    return new Response(JSON.stringify(notices), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: "Failed to fetch notices" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    })
  }
}

export async function createAdminNotice(request, env) {
  try {
    const noticeData = await request.json()

    // Validate required fields
    const requiredFields = ["title", "content", "category"]
    for (const field of requiredFields) {
      if (!noticeData[field]) {
        return new Response(JSON.stringify({ error: `${field} is required` }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        })
      }
    }

    // Generate notice ID
    const noticeId = generateId("NOT")

    // Prepare notice data
    const notice = {
      id: noticeId,
      ...noticeData,
      publishedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    // Store in KV
    await env.COLLEGE_DB.put(`notice:${noticeData.category}:${noticeId}`, JSON.stringify(notice))

    return new Response(
      JSON.stringify({
        success: true,
        notice,
        message: "Notice created successfully",
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    )
  } catch (error) {
    return new Response(JSON.stringify({ error: "Failed to create notice" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    })
  }
}

export async function updateAdminNotice(request, env) {
  try {
    const url = new URL(request.url)
    const noticeId = url.pathname.split("/").pop()
    const noticeData = await request.json()

    // Find the existing notice
    const noticesList = await env.COLLEGE_DB.list({ prefix: "notice:" })
    let existingNoticeKey = null

    for (const key of noticesList.keys) {
      const notice = JSON.parse(await env.COLLEGE_DB.get(key.name))
      if (notice.id === noticeId) {
        existingNoticeKey = key.name
        break
      }
    }

    if (!existingNoticeKey) {
      return new Response(JSON.stringify({ error: "Notice not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      })
    }

    // Update notice data
    const updatedNotice = {
      ...noticeData,
      id: noticeId,
      updatedAt: new Date().toISOString(),
    }

    // Store updated notice
    await env.COLLEGE_DB.put(existingNoticeKey, JSON.stringify(updatedNotice))

    return new Response(
      JSON.stringify({
        success: true,
        notice: updatedNotice,
        message: "Notice updated successfully",
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    )
  } catch (error) {
    return new Response(JSON.stringify({ error: "Failed to update notice" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    })
  }
}

export async function deleteAdminNotice(request, env) {
  try {
    const url = new URL(request.url)
    const noticeId = url.pathname.split("/").pop()

    // Find and delete the notice
    const noticesList = await env.COLLEGE_DB.list({ prefix: "notice:" })
    let deleted = false

    for (const key of noticesList.keys) {
      const notice = JSON.parse(await env.COLLEGE_DB.get(key.name))
      if (notice.id === noticeId) {
        await env.COLLEGE_DB.delete(key.name)
        deleted = true
        break
      }
    }

    if (!deleted) {
      return new Response(JSON.stringify({ error: "Notice not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      })
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: "Notice deleted successfully",
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    )
  } catch (error) {
    return new Response(JSON.stringify({ error: "Failed to delete notice" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    })
  }
}
