import { redirect } from "next/navigation";

/** The events listing is the home page of the board. */
export default function HomePage() {
  redirect("/events");
}
