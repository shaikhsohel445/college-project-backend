import { corsHeaders } from "../utils/cors"
import { generateId } from "../utils/helpers"

export async function handleAdmissionForm(request, env) {
  try {
    const formData = await request.json()

    // Validate required fields
    const requiredFields = ["firstName", "lastName", "email", "phone", "course", "category"]
    for (const field of requiredFields) {
      if (!formData[field]) {
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

    // Generate application ID
    const applicationId = generateId("APP")

    // Prepare application data
    const applicationData = {
      id: applicationId,
      ...formData,
      status: "submitted",
      submittedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    // Store in KV
    await env.COLLEGE_DB.put(`admission:${applicationId}`, JSON.stringify(applicationData))

    // Update application counter
    const currentCount = (await env.COLLEGE_DB.get("stats:applications")) || "0"
    await env.COLLEGE_DB.put("stats:applications", String(Number.parseInt(currentCount) + 1))

    return new Response(
      JSON.stringify({
        success: true,
        applicationId,
        message: "Application submitted successfully",
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    )
  } catch (error) {
    return new Response(
      JSON.stringify({
        error: "Failed to process application",
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    )
  }
}
