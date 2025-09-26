export async function validateUserSession(request: Request) {
  try {
    const response = await fetch("http://localhost:5024/api/adminauth/validate-user", {
      method: "GET",
      headers: {
        "Cookie": request.headers.get("Cookie") || "",
      },
      credentials: 'include',
    });


    if (response.ok) {
      const userData = await response.json();
      return userData;
    }

    return null;
  } catch (error) {
    console.error("Session validation error:", error);
    return null;
  }
}

