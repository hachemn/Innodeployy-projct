import api from "../api/axios";

export async function getCurrentUser() {
  const token = localStorage.getItem("token");

  const response = await api.get("/users/me", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return response.data;
}