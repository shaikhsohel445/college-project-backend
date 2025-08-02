import { corsHeaders } from "../utils/cors"
import { generateId } from "../utils/helpers"

export async function getGallery(request, env) {
  try {
    const url = new URL(request.url)
    const category = url.searchParams.get("category")
    const limit = Number.parseInt(url.searchParams.get("limit")) || 20

    let prefix = "gallery:"
    if (category) {
      prefix = `gallery:${category}:`
    }

    const galleryList = await env.COLLEGE_DB.list({ prefix, limit })

    const gallery = await Promise.all(
      galleryList.keys.map(async (key) => {
        const data = await env.COLLEGE_DB.get(key.name)
        return JSON.parse(data)
      }),
    )

    // Sort by upload date (newest first)
    gallery.sort((a, b) => new Date(b.uploadedAt) - new Date(a.uploadedAt))

    return new Response(JSON.stringify(gallery), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    })
  } catch (error) {
    return new Response(
      JSON.stringify({
        error: "Failed to fetch gallery",
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    )
  }
}

export async function uploadImage(request, env) {
  try {
    const imageData = await request.json()

    // Validate required fields
    const requiredFields = ["title", "category", "imageUrl"]
    for (const field of requiredFields) {
      if (!imageData[field]) {
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

    // Generate image ID
    const imageId = generateId("IMG")

    // Prepare image data
    const image = {
      id: imageId,
      ...imageData,
      uploadedAt: new Date().toISOString(),
    }

    // Store in KV
    await env.COLLEGE_DB.put(`gallery:${imageData.category}:${imageId}`, JSON.stringify(image))

    return new Response(
      JSON.stringify({
        success: true,
        imageId,
        message: "Image uploaded successfully",
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    )
  } catch (error) {
    return new Response(
      JSON.stringify({
        error: "Failed to upload image",
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    )
  }
}
