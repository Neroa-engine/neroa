import { redirect } from "next/navigation";
import { APP_ROUTES } from "@/lib/routes";

export default function AiSystemPage() {
  redirect(APP_ROUTES.system);
}
