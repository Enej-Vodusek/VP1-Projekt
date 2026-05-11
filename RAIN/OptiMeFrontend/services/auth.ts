import { API_URL } from "@/services/api";

export async function loginUser(email: string, password: string) {
  const response = await fetch(`${API_URL}/user/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    credentials: "include",
    body: JSON.stringify({ email, password }),
  });

  const text = await response.text();

  let data;

  try {
    data = JSON.parse(text);
  } catch {
    console.log("LOGIN RAW RESPONSE:", text);
    throw new Error("Server returned invalid response");
  }

  console.log("LOGIN RESPONSE:", data);

  if (!response.ok) {
    throw new Error(data.error || data.message || "Login failed");
  }

  return data;
}

export async function registerUser(
  username: string,
  email: string,
  date_of_birth: Date,
  gender: string,
  password: string,
) {
  const body = {
    email,
    password,
    gender,
    dateOfBirth,
  };

  console.log("REGISTER REQUEST BODY:", body);

  const response = await fetch(`${API_URL}/user/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify(body),
  });

  const data = await res.json();

  let data;

  try {
    data = JSON.parse(text);
  } catch {
    console.log("REGISTER RAW RESPONSE:", text);
    throw new Error("Server returned invalid response");
  }

  console.log("REGISTER RESPONSE:", data);

  if (!response.ok) {
    throw new Error(data.error || data.message || "Register failed");
  }

  return data;
}
