import { redirect } from "next/navigation";

export default function ChatRedirectPage({
  searchParams,
}: {
  searchParams?: { query?: string };
}) {
  const query = searchParams?.query ? `?query=${encodeURIComponent(searchParams.query)}` : "";
  redirect(`/chatbot${query}`);
}
