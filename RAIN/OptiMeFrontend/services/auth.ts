import api, { publicApi } from "./apiI";
import type { StartingFormPayload } from "@/data/startingQuestions";

import {
  saveAccessToken,
  getAccessToken,
  deleteAccessToken,
} from "@/services/authStorage";

export type AuthUserResponse = {
  id: string;
  email?: string;
  username?: string;
  formFinished: boolean;
  twoFactorEnabled?: boolean;
};

type AuthResponse = {
  accessToken?: string;
  user?: AuthUserResponse;
  message?: string;
  requires2FA?: boolean;
};

function normalizeUser(user: any): AuthUserResponse | null {
  if (!user) return null;

  return {
    id: user.id || user._id,
    email: user.email,
    username: user.username,
    formFinished: user.formFinished === true,
    twoFactorEnabled: user.twoFactorEnabled === true,
  };
}

function normalizeAuthResponse(data: any): AuthResponse {
  return {
    ...data,
    user: normalizeUser(data?.user),
  };
}

function getErrorMessage(error: any, fallback: string) {
  return (
    error?.response?.data?.error ||
    error?.response?.data?.message ||
    error?.message ||
    fallback
  );
}

export async function loginUser(email: string, password: string) {
  try {
    const response = await publicApi.post("/user/login", {
      email,
      password,
    });

    const data = normalizeAuthResponse(response.data);

    if (!data.user) {
      throw new Error("User data missing from login response");
    }

    if (data.requires2FA === true || data.user.twoFactorEnabled === true) {
      return data;
    }

    if (!data.accessToken) {
      throw new Error("Access token missing from login response");
    }

    return data;
  } catch (error: any) {
    throw new Error(getErrorMessage(error, "Login failed"));
  }
}

export async function registerUser(
  email: string,
  password: string,
  gender: string,
  dateOfBirth: string,
) {
  const body = {
    email,
    password,
    gender,
    dateOfBirth,
  };

  try {
    const response = await publicApi.post("/user/register", body);

    return normalizeAuthResponse(response.data);
  } catch (error: any) {
    throw new Error(getErrorMessage(error, "Register failed"));
  }
}

export async function submitStartingForm(payload: StartingFormPayload) {
  try {
    const response = await api.post("/user/startingForm", payload);

    return normalizeAuthResponse(response.data);
  } catch (error: any) {
    throw new Error(getErrorMessage(error, "Form submission failed"));
  }
}

export async function logoutUser() {
  try {
    await publicApi.post("/user/logout");
  } catch (error: any) {
    console.log(
      "Logout backend failed:",
      error?.response?.data || error?.message,
    );
  } finally {
    await deleteAccessToken();
  }
}

export async function getCurrentUser() {
  const token = await getAccessToken();

  if (!token) {
    return null;
  }

  try {
    const response = await api.get("/user/me");

    return normalizeUser(response.data?.user);
  } catch (error: any) {
    if (error?.response?.status === 401) {
      await deleteAccessToken();
      return null;
    }

    throw new Error(getErrorMessage(error, "Failed to get current user"));
  }
}

export async function toggleTwoFactor() {
  try {
    const response = await api.post("/user/toggle-2fa");

    return response.data;
  } catch (error: any) {
    throw new Error(getErrorMessage(error, "Toggle 2FA failed"));
  }
}
