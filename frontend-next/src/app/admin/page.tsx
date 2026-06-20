import type { Metadata } from "next"
import AdminClient from "./AdminClient"

export const metadata: Metadata = {
  title: "Admin Testimonial Dashboard | KisaanBuddy",
  description: "Moderate, search, edit, approve, or delete user-submitted testimonials on KisaanBuddy.",
  alternates: {
    canonical: "/admin",
  },
}

export default function AdminPage() {
  return <AdminClient />
}
