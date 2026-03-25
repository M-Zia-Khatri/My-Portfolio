import { api } from "@/shared/api/axios";

export const refreshTokenApi = async () => {
  const res = await api.post("/auth/refresh");
  return res.data.data;
};
