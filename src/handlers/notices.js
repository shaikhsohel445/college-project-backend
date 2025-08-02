import { corsHeaders } from "../utils/cors"
import { generateId } from "../utils/helpers"

export async function getNotices(request, env) {
  try {
    const url = new URL(request.url)
    const limit = Number.parseInt(url.searchParams.get("limit")) || 10
    const category = url.searchParams.get("category")

    let prefix = "notice:"
    if (category) {
      prefix = `notice:${category}:`
    }

    const noticesList = await env.COLLEGE_DB.list({ prefix, limit })

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
    return new Response(
      JSON.stringify({
        error: "Failed to fetch notices",
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    )
  }
}

export async function createNotice(request, env) {
  try {
    const noticeData = await request.json()

    // Validate required fields
    const requiredFields = ["title", "content", "category"]
    for (const field of requiredFields) {
      if (!noticeData[field]) {
        return new Response(
          JSON.stringify({
            error: `${field} is required`,
          }),
          {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          },
        )
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
        noticeId,
        message: "Notice created successfully",
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    )
  } catch (error) {
    return new Response(
      JSON.stringify({
        error: "Failed to create notice",
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    )
  }
}
