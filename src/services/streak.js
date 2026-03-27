import api from "./api";

export const streakService = {
  getStreak: async () => {
    const response = await api.get("/api/streak/");
    return response.data;
  },
};
