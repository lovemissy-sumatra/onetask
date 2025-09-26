import { redirect, type ActionFunctionArgs } from "react-router";
import axiosClient from "~/utils/api/axiosClient";

export async function action({ request }: ActionFunctionArgs) {
    try {
        await axiosClient.post("/api/adminauth/logout", null, {
            headers: {
                Cookie: request.headers.get("Cookie") || "",
            },
        });
    } catch (err) {
        console.error("Logout failed:", err);
    }

    return redirect("/login", {
        headers: {
            "Set-Cookie": "AdminAuthToken=; HttpOnly; Path=/; Max-Age=0; SameSite=None; Secure",
        },
    });

}

export function loader() {
    return redirect("/");
}
