import api from "./api";

export const dailySummaryService = {
  getDailySummary: async () => {
    const response = await api.get("/api/daily_summary/");
    return response.data;
  },
};
