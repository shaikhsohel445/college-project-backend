import { corsHeaders } from "../utils/cors"
import { generateId } from "../utils/helpers"

export async function handleFeedback(request, env) {
  try {
    const feedbackData = await request.json()

    // Validate required fields
    const requiredFields = ["name", "email", "type", "rating", "comments"]
    for (const field of requiredFields) {
      if (!feedbackData[field]) {
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

    // Validate rating
    if (feedbackData.rating < 1 || feedbackData.rating > 5) {
      return new Response(
        JSON.stringify({
          error: "Rating must be between 1 and 5",
        }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      )
    }

    // Generate feedback ID
    const feedbackId = generateId("FBK")

    // Prepare feedback data
    const feedback = {
      id: feedbackId,
      ...feedbackData,
      submittedAt: new Date().toISOString(),
    }

    // Store in KV
    await env.COLLEGE_DB.put(`feedback:${feedbackData.type}:${feedbackId}`, JSON.stringify(feedback))

    return new Response(
      JSON.stringify({
        success: true,
        feedbackId,
        message: "Thank you for your feedback!",
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    )
  } catch (error) {
    return new Response(
      JSON.stringify({
        error: "Failed to submit feedback",
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    )
  }
}
