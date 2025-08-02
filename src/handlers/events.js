import { corsHeaders } from "../utils/cors"
import { generateId } from "../utils/helpers"

export async function getEvents(request, env) {
  try {
    const url = new URL(request.url)
    const limit = Number.parseInt(url.searchParams.get("limit")) || 10
    const upcoming = url.searchParams.get("upcoming") === "true"

    const eventsList = await env.COLLEGE_DB.list({ prefix: "event:", limit })

    const events = await Promise.all(
      eventsList.keys.map(async (key) => {
        const data = await env.COLLEGE_DB.get(key.name)
        return JSON.parse(data)
      }),
    )

    // Filter upcoming events if requested
    let filteredEvents = events
    if (upcoming) {
      const now = new Date()
      filteredEvents = events.filter((event) => new Date(event.eventDate) >= now)
    }

    // Sort by event date
    filteredEvents.sort((a, b) => new Date(a.eventDate) - new Date(b.eventDate))

    return new Response(JSON.stringify(filteredEvents), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    })
  } catch (error) {
    return new Response(
      JSON.stringify({
        error: "Failed to fetch events",
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    )
  }
}

export async function createEvent(request, env) {
  try {
    const eventData = await request.json()

    // Validate required fields
    const requiredFields = ["title", "description", "eventDate", "venue"]
    for (const field of requiredFields) {
      if (!eventData[field]) {
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

    // Generate event ID
    const eventId = generateId("EVT")

    // Prepare event data
    const event = {
      id: eventId,
      ...eventData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    // Store in KV
    await env.COLLEGE_DB.put(`event:${eventId}`, JSON.stringify(event))

    return new Response(
      JSON.stringify({
        success: true,
        eventId,
        message: "Event created successfully",
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    )
  } catch (error) {
    return new Response(
      JSON.stringify({
        error: "Failed to create event",
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    )
  }
}
