import { corsHeaders } from "../utils/cors"
import { generateId } from "../utils/helpers"

export async function getFaculty(request, env) {
  try {
    const url = new URL(request.url)
    const department = url.searchParams.get("department")
    const limit = Number.parseInt(url.searchParams.get("limit")) || 50

    let prefix = "faculty:"
    if (department) {
      prefix = `faculty:${department}:`
    }

    const facultyList = await env.COLLEGE_DB.list({ prefix, limit })

    const faculty = await Promise.all(
      facultyList.keys.map(async (key) => {
        const data = await env.COLLEGE_DB.get(key.name)
        return JSON.parse(data)
      }),
    )

    // Sort by name
    faculty.sort((a, b) => a.name.localeCompare(b.name))

    return new Response(JSON.stringify(faculty), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    })
  } catch (error) {
    return new Response(
      JSON.stringify({
        error: "Failed to fetch faculty",
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    )
  }
}

export async function createFaculty(request, env) {
  try {
    const facultyData = await request.json()

    // Validate required fields
    const requiredFields = ["name", "department", "designation", "qualification"]
    for (const field of requiredFields) {
      if (!facultyData[field]) {
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

    // Generate faculty ID
    const facultyId = generateId("FAC")

    // Prepare faculty data
    const faculty = {
      id: facultyId,
      ...facultyData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    // Store in KV
    await env.COLLEGE_DB.put(`faculty:${facultyData.department}:${facultyId}`, JSON.stringify(faculty))

    return new Response(
      JSON.stringify({
        success: true,
        facultyId,
        message: "Faculty member added successfully",
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    )
  } catch (error) {
    return new Response(
      JSON.stringify({
        error: "Failed to add faculty member",
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    )
  }
}
