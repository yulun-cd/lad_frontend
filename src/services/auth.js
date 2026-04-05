import api from "./api";

const toUsername = (value) => {
  if (!value) return "";
  return String(value).includes("@")
    ? String(value).split("@")[0]
    : String(value);
};

export const authService = {
  register: async ({ username, email, password }) => {
    const response = await api.post("/api/auth/register/", {
      username: username || toUsername(email),
      email,
      password,
    });
    return response.data;
  },

  login: async (identifier, password) => {
    const response = await api.post("/api/auth/login/", {
      username: identifier,
      password,
    });
    return response.data;
  },

  refresh: async (refreshToken) => {
    const response = await api.post("/api/auth/refresh/", {
      refresh: refreshToken,
    });
    return response.data;
  },

  getMe: async () => {
    const response = await api.get("/api/auth/me/");
    return response.data;
  },

  changePassword: async ({
    currentPassword,
    newPassword,
    newPasswordConfirm,
  }) => {
    const response = await api.post("/api/auth/change-password/", {
      current_password: currentPassword,
      new_password: newPassword,
      new_password_confirm: newPasswordConfirm,
    });
    return response.data;
  },
};
