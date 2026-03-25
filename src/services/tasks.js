import api from "./api";

const priorityToEnergy = {
  low: 2,
  medium: 3,
  high: 5,
};

const energyToPriority = (energyLevel) => {
  if (energyLevel >= 5) return "high";
  if (energyLevel <= 2) return "low";
  return "medium";
};

const normalizeStatus = (status) => {
  if (!status) return "PENDING";
  return String(status).toUpperCase();
};

const mapTaskFromApi = (task) => ({
  id: task.id,
  name: task.name,
  description: task.description,
  created_at: task.created_at,
  updated_at: task.updated_at,
  energy_level: task.energy_level,
  status: normalizeStatus(task.status),
  // Backward-compatible UI aliases used by existing components.
  title: task.name,
  priority: energyToPriority(task.energy_level),
});

const mapTaskToApi = (data) => ({
  name: data.name ?? data.title ?? "",
  description: data.description ?? "",
  status: normalizeStatus(data.status),
  energy_level: data.energy_level ?? priorityToEnergy[data.priority] ?? 3,
});

export const tasksService = {
  getTasks: async (params = {}) => {
    const queryParams = { ...params };
    // Normalize status parameter for backend query
    if (queryParams.STATUS) {
      queryParams.STATUS = String(queryParams.STATUS).toUpperCase();
    }
    const response = await api.get("/api/tasks/", { params: queryParams });
    const raw = Array.isArray(response.data)
      ? response.data
      : response.data?.results || [];
    return raw.map(mapTaskFromApi);
  },

  getTask: async (id) => {
    const response = await api.get(`/api/tasks/${id}/`);
    return mapTaskFromApi(response.data);
  },

  createTask: async (data) => {
    const payload = mapTaskToApi(data);
    const response = await api.post("/api/tasks/", payload);
    return mapTaskFromApi(response.data);
  },

  updateTask: async (id, data) => {
    // PUT requires a complete representation, so merge with current task for partial UI updates.
    const current = await tasksService.getTask(id);
    const merged = { ...current, ...data };
    const payload = mapTaskToApi(merged);
    const response = await api.put(`/api/tasks/${id}/`, payload);
    return mapTaskFromApi(response.data);
  },

  deleteTask: async (id) => {
    await api.delete(`/api/tasks/${id}/`);
  },
};
