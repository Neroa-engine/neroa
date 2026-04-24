import { redirect } from "next/navigation";
import { APP_ROUTES } from "@/lib/routes";

export default function AiAvatarsPage() {
  redirect(APP_ROUTES.system);
}
