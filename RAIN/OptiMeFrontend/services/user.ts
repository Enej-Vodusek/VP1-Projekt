import { publicApi } from "./apiI";

export type AuthUserResponse = {
  id: string;
  email?: string;
  username?: string;
  formFinished: boolean;
};

type AuthResponse = {
  accessToken?: string;
  user?: AuthUserResponse;
  message?: string;
};

function normalizeUser(user: any): AuthUserResponse | null {
  if (!user) return null;

  return {
    id: user.id,
    email: user.email,
    username: user.username,
    formFinished: user.formFinished === true,
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

function normalizeAuthResponse(data: any): AuthResponse {
  return {
    ...data,
    user: normalizeUser(data?.user),
  };
}



export async function sumbitUserSnapshotForm( mood: Number, stress: Number, anxiety: Number, sleepHours: Number, screenTimeHours: Number)
{
  try {
    const response = await publicApi.post("/data/submitUserSnapshot", {
      mood,
      stress,
      anxiety,
      sleepHours,
      screenTimeHours
    });

    return normalizeAuthResponse(response.data);

  } catch (error: any) {
    throw new Error(getErrorMessage(error, "snapShotSaving Failed"));
  }
}