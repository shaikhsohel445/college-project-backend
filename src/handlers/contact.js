import { corsHeaders } from "../utils/cors"
import { generateId } from "../utils/helpers"

export async function handleContactForm(request, env) {
  try {
    const formData = await request.json()

    // Validate required fields
    const requiredFields = ["name", "email", "subject", "message"]
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

    // Generate contact ID
    const contactId = generateId("CNT")

    // Prepare contact data
    const contactData = {
      id: contactId,
      ...formData,
      status: "new",
      submittedAt: new Date().toISOString(),
    }

    // Store in KV
    await env.COLLEGE_DB.put(`contact:${contactId}`, JSON.stringify(contactData))

    return new Response(
      JSON.stringify({
        success: true,
        contactId,
        message: "Message sent successfully. We will get back to you soon.",
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    )
  } catch (error) {
    return new Response(
      JSON.stringify({
        error: "Failed to send message",
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    )
  }
}
