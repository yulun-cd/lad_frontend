import api from "./api";

const mapTagFromApi = (tag) => ({
  id: tag.id,
  name: tag.name,
  color: tag.color,
});

export const taskTagsService = {
  getTags: async () => {
    const response = await api.get("/api/task-tags/");
    const raw = Array.isArray(response.data)
      ? response.data
      : response.data?.results || [];
    return raw.map(mapTagFromApi);
  },

  createTag: async ({ name, color }) => {
    const response = await api.post("/api/task-tags/", { name, color });
    return mapTagFromApi(response.data);
  },

  updateTag: async (id, { name, color }) => {
    const response = await api.put(`/api/task-tags/${id}/`, { name, color });
    return mapTagFromApi(response.data);
  },

  deleteTag: async (id) => {
    await api.delete(`/api/task-tags/${id}/`);
  },
};
