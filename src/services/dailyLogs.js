import api from "./api";

const clamp1to5 = (value, fallback = 3) => {
  const n = Number(value);
  if (Number.isNaN(n)) return fallback;
  return Math.min(5, Math.max(1, Math.round(n)));
};

const mapDailyLogFromApi = (log) => ({
  id: log.id,
  date: log.date,
  created_at: log.created_at,
  updated_at: log.updated_at,
  overall: log.overall,
  energy: log.energy,
  emotion: log.emotion,
  productivity: log.productivity,
  description: log.description,
  // Backward-compatible aliases used by existing components.
  energy_consumed: log.energy,
  notes: log.description,
  status: log.overall >= 4 ? "reviewed" : "pending",
});

const mapDailyLogToApi = (data) => {
  const energyScore = clamp1to5(data.energy ?? data.energy_consumed, 3);
  const overallScore = clamp1to5(data.overall, energyScore);
  const emotionScore = clamp1to5(data.emotion, 3);
  const productivityScore = clamp1to5(data.productivity, 3);

  return {
    date: data.date,
    overall: overallScore,
    energy: energyScore,
    emotion: emotionScore,
    productivity: productivityScore,
    description: data.description ?? data.notes ?? "",
  };
};

export const dailyLogsService = {
  getDailyLogs: async (params = {}) => {
    const response = await api.get("/api/daily-logs/", { params });
    const raw = Array.isArray(response.data)
      ? response.data
      : response.data?.results || [];
    return raw.map(mapDailyLogFromApi);
  },

  getDailyLog: async (id) => {
    const response = await api.get(`/api/daily-logs/${id}/`);
    return mapDailyLogFromApi(response.data);
  },

  createDailyLog: async (data) => {
    const payload = mapDailyLogToApi(data);
    const response = await api.post("/api/daily-logs/", payload);
    return mapDailyLogFromApi(response.data);
  },

  updateDailyLog: async (id, data) => {
    // PUT requires a complete representation, so merge with current log for partial UI updates.
    const current = await dailyLogsService.getDailyLog(id);
    const merged = { ...current, ...data };
    const payload = mapDailyLogToApi(merged);
    const response = await api.put(`/api/daily-logs/${id}/`, payload);
    return mapDailyLogFromApi(response.data);
  },

  deleteDailyLog: async (id) => {
    await api.delete(`/api/daily-logs/${id}/`);
  },
};
