// This script seeds the KV database with sample data
// Run: node scripts/seed-data.js

const sampleData = {
  // Sample notices
  notices: [
    {
      id: "NOT001",
      title: "Admission Open for Academic Year 2024-25",
      content:
        "Applications are now open for all undergraduate and postgraduate programs. Last date for submission is July 15, 2024.",
      category: "admission",
      publishedAt: "2024-06-01T10:00:00Z",
      updatedAt: "2024-06-01T10:00:00Z",
    },
    {
      id: "NOT002",
      title: "Semester Examination Schedule Released",
      content:
        "The examination schedule for odd semester 2024 has been published. Students can download from the examination section.",
      category: "examination",
      publishedAt: "2024-05-15T14:30:00Z",
      updatedAt: "2024-05-15T14:30:00Z",
    },
    {
      id: "NOT003",
      title: "Annual Sports Day - March 15, 2024",
      content:
        "All students are invited to participate in the annual sports day. Registration forms available at the sports office.",
      category: "events",
      publishedAt: "2024-03-01T09:00:00Z",
      updatedAt: "2024-03-01T09:00:00Z",
    },
  ],

  // Sample events
  events: [
    {
      id: "EVT001",
      title: "Science Exhibition 2024",
      description: "Annual science exhibition showcasing innovative projects by students from all departments.",
      eventDate: "2024-03-20T10:00:00Z",
      venue: "Main Auditorium",
      createdAt: "2024-02-01T10:00:00Z",
      updatedAt: "2024-02-01T10:00:00Z",
    },
    {
      id: "EVT002",
      title: "Cultural Fest - Kaleidoscope 2024",
      description: "Three-day cultural festival featuring music, dance, drama, and literary competitions.",
      eventDate: "2024-04-10T09:00:00Z",
      venue: "College Campus",
      createdAt: "2024-03-15T12:00:00Z",
      updatedAt: "2024-03-15T12:00:00Z",
    },
    {
      id: "EVT003",
      title: "Career Guidance Workshop",
      description: "Workshop on career opportunities and skill development for final year students.",
      eventDate: "2024-02-25T14:00:00Z",
      venue: "Seminar Hall",
      createdAt: "2024-02-10T11:00:00Z",
      updatedAt: "2024-02-10T11:00:00Z",
    },
  ],

  // Sample faculty data
  faculty: [
    {
      id: "FAC001",
      name: "Dr. Rajesh Kumar",
      department: "english",
      designation: "Professor & Head",
      qualification: "Ph.D. in English Literature",
      experience: "15 years",
      email: "rajesh.kumar@lokmanyatilakcollege.edu.in",
      phone: "+91-9876543210",
      specialization: "Modern Literature, Literary Criticism",
      publications: 25,
      createdAt: "2024-01-01T10:00:00Z",
      updatedAt: "2024-01-01T10:00:00Z",
    },
    {
      id: "FAC002",
      name: "Prof. Sunita Sharma",
      department: "commerce",
      designation: "Associate Professor",
      qualification: "M.Com, MBA, Ph.D.",
      experience: "12 years",
      email: "sunita.sharma@lokmanyatilakcollege.edu.in",
      phone: "+91-9876543211",
      specialization: "Accounting, Finance, Business Management",
      publications: 18,
      createdAt: "2024-01-01T10:00:00Z",
      updatedAt: "2024-01-01T10:00:00Z",
    },
    {
      id: "FAC003",
      name: "Dr. Amit Patel",
      department: "science",
      designation: "Professor",
      qualification: "Ph.D. in Physics",
      experience: "18 years",
      email: "amit.patel@lokmanyatilakcollege.edu.in",
      phone: "+91-9876543212",
      specialization: "Quantum Physics, Nanotechnology",
      publications: 32,
      createdAt: "2024-01-01T10:00:00Z",
      updatedAt: "2024-01-01T10:00:00Z",
    },
  ],

  // Sample gallery images
  gallery: [
    {
      id: "IMG001",
      title: "College Main Building",
      category: "campus",
      imageUrl: "/placeholder.svg?height=400&width=600&text=Main+Building",
      description: "The iconic main building of Lokmanya Tilak College",
      uploadedAt: "2024-01-15T10:00:00Z",
    },
    {
      id: "IMG002",
      title: "Library Interior",
      category: "facilities",
      imageUrl: "/placeholder.svg?height=400&width=600&text=Library",
      description: "Modern library with extensive collection of books and digital resources",
      uploadedAt: "2024-01-16T10:00:00Z",
    },
    {
      id: "IMG003",
      title: "Annual Day Celebration",
      category: "events",
      imageUrl: "/placeholder.svg?height=400&width=600&text=Annual+Day",
      description: "Students performing during annual day celebrations",
      uploadedAt: "2024-01-17T10:00:00Z",
    },
  ],

  // Statistics
  stats: {
    students: "2000",
    faculty: "85",
    courses: "25",
    applications: "150",
    recent_applications: "25",
  },
}

// Function to seed data (this would be run manually or via script)
async function seedDatabase() {
  console.log("Seeding database with sample data...")

  // This is a template - actual implementation would use Cloudflare KV API
  // or wrangler commands to populate the database

  console.log("Sample data structure:")
  console.log(JSON.stringify(sampleData, null, 2))

  console.log("\nTo seed the actual KV database, use wrangler commands:")
  console.log(
    "wrangler kv:key put --binding=COLLEGE_DB 'notice:admission:NOT001' '" +
      JSON.stringify(sampleData.notices[0]) +
      "'",
  )
  console.log("wrangler kv:key put --binding=COLLEGE_DB 'stats:students' '2000'")
  console.log("... (repeat for all data)")
}

if (require.main === module) {
  seedDatabase()
}

module.exports = { sampleData }
