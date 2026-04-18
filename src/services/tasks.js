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
  date: task.date ?? null,
  recurrence_interval: task.recurrence_interval ?? null,
  recurrence_origin: task.recurrence_origin ?? null,
  created_at: task.created_at,
  updated_at: task.updated_at,
  energy_level: task.energy_level,
  status: normalizeStatus(task.status),
  tag: task.tag ?? null,
  // Backward-compatible UI aliases used by existing components.
  title: task.name,
  priority: energyToPriority(task.energy_level),
});

const mapTaskToApi = (data) => ({
  name: data.name ?? data.title ?? "",
  description: data.description ?? "",
  date: data.date ?? null,
  recurrence_interval: data.recurrence_interval
    ? Number(data.recurrence_interval)
    : null,
  status: normalizeStatus(data.status),
  energy_level: data.energy_level ?? priorityToEnergy[data.priority] ?? 3,
  tag: data.tag !== undefined ? data.tag : null,
});

export const tasksService = {
  getTasks: async (params = {}) => {
    const queryParams = { ...params };
    // Normalize status parameter for backend query
    if (queryParams.STATUS) {
      queryParams.STATUS = String(queryParams.STATUS).toUpperCase();
    }
    const response = await api.get("/api/tasks/", {
      params: queryParams,
      paramsSerializer: (p) => {
        const s = new URLSearchParams();
        Object.entries(p).forEach(([k, v]) => {
          if (Array.isArray(v)) v.forEach((x) => s.append(k, x));
          else if (v != null) s.append(k, v);
        });
        return s.toString();
      },
    });
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
    // Normalise title→name before merging so the incoming value isn't shadowed
    // by the existing `name` field on the fetched task.
    const normalizedData =
      data.title !== undefined && data.name === undefined
        ? { ...data, name: data.title }
        : { ...data };
    const current = await tasksService.getTask(id);
    const merged = { ...current, ...normalizedData };
    const payload = mapTaskToApi(merged);
    const response = await api.put(`/api/tasks/${id}/`, payload);
    return mapTaskFromApi(response.data);
  },

  deleteTask: async (id) => {
    await api.delete(`/api/tasks/${id}/`);
  },

  getCompletionTime: async () => {
    const response = await api.get("/api/tasks/completion-time/");
    const data = response.data;

    const SECTIONS = [
      {
        key: "morning",
        hours: [8, 9, 10, 11],
        aliases: ["morning", "08:00-12:00", "08:00–12:00"],
      },
      {
        key: "afternoon",
        hours: [12, 13, 14, 15, 16],
        aliases: ["afternoon", "12:00-17:00", "12:00–17:00"],
      },
      {
        key: "evening",
        hours: [17, 18, 19, 20],
        aliases: ["evening", "17:00-21:00", "17:00–21:00"],
      },
      {
        key: "night",
        hours: [21, 22, 23, 0, 1, 2, 3, 4, 5, 6, 7],
        aliases: ["night", "21:00-08:00", "21:00–08:00"],
      },
    ];

    const counts = { morning: 0, afternoon: 0, evening: 0, night: 0 };

    const sectionForHour = (hour) =>
      SECTIONS.find((s) => s.hours.includes(Number(hour)))?.key ?? null;

    const sectionForLabel = (raw) => {
      const s = String(raw).toLowerCase().trim();
      return (
        SECTIONS.find((sec) =>
          sec.aliases.some((a) => s.includes(a.toLowerCase())),
        )?.key ?? null
      );
    };

    if (Array.isArray(data)) {
      data.forEach((item) => {
        const count = Number(item.count ?? item.total ?? 0);
        // Prefer hour-based mapping; fall back to label-based.
        const sec =
          item.hour != null
            ? sectionForHour(item.hour)
            : sectionForLabel(
                item.time_section ??
                  item.section ??
                  item.label ??
                  item.key ??
                  "",
              );
        if (sec) counts[sec] += count;
      });
    } else if (data && typeof data === "object") {
      Object.entries(data).forEach(([k, v]) => {
        const sec = !isNaN(Number(k))
          ? sectionForHour(Number(k))
          : sectionForLabel(k);
        if (sec) counts[sec] += Number(v ?? 0);
      });
    }

    return SECTIONS.map((sec) => ({
      section: sec.key,
      count: counts[sec.key],
    }));
  },
};
