import { redirect } from "react-router";
import { logoutUser } from "~/services/auth/logoutUser";

export async function action() {
  await logoutUser();
  return redirect("/login");
}

export async function loader() {
  await logoutUser();
  return redirect("/login");
}