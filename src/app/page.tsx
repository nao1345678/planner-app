import { redirect } from "next/navigation";
import { todayISO } from "@/lib/dates";

export const dynamic = "force-dynamic";

export default function Home() {
  redirect(`/day/${todayISO()}`);
}
