import api from "./apiI";

export type UserSnapshotPayload = {
  mood: number;
  stress: number;
  anxiety: number;
  sleepHours: number;
  screenTimeHours: number;
  date?: string;
};

function getErrorMessage(error: any, fallback: string) {
  return (
    error?.response?.data?.error ||
    error?.response?.data?.message ||
    error?.message ||
    fallback
  );
}

export async function submitUserSnapshotForm(payload: UserSnapshotPayload) {
  try {
    const response = await api.post("/data/submitUserSnapshot", payload);

    return response.data;
  } catch (error: any) {
    throw new Error(getErrorMessage(error, "Snapshot saving failed"));
  }
}
