// Shared storage cache for testimonials to prevent Next.js route type validation errors
export const localTestimonialsCache: any[] = [
  {
    id: "default-1",
    name: "Ramesh Patel",
    location: "Rajkot, Gujarat",
    crop: "Cotton Farmer",
    text: "The Crop Predictor identified Cotton was optimal for my low-nitrogen field and suggested the exact fertilizer ratio. My crop yield grew by 35% this season.",
    stars: 5,
    status: "approved",
    created_at: "2026-06-18T06:00:00Z",
    updated_at: "2026-06-18T06:00:00Z"
  },
  {
    id: "default-2",
    name: "Suresh Gowda",
    location: "Kolar, Karnataka",
    crop: "Tomato Grower",
    text: "The leaf disease detector saved my crop. I photographed black spots on my tomato leaves, diagnosed early blight in 2 seconds, and applied the organic neem recommendations.",
    stars: 5,
    status: "approved",
    created_at: "2026-06-18T06:10:00Z",
    updated_at: "2026-06-18T06:10:00Z"
  },
  {
    id: "default-3",
    name: "Rajesh Kumar",
    location: "Agra, Uttar Pradesh",
    crop: "Potato Cultivator",
    text: "Mandi price target notifications allowed me to track Agra rates easily. I got an SMS alert when potato crossed ₹1,900 and sold at maximum profit.",
    stars: 5,
    status: "approved",
    created_at: "2026-06-18T06:20:00Z",
    updated_at: "2026-06-18T06:20:00Z"
  }
]
