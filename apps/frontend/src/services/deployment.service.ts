import api from "../api/axios";

export async function createDeployment(projectId: number) {
  const token = localStorage.getItem("token");

  const response = await api.post(
    `/projects/${projectId}/deployments`,
    {},
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return response.data;
}
export async function getDeployments(projectId: number) {
  const token = localStorage.getItem("token");

  const response = await api.get(
    `/projects/${projectId}/deployments`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return response.data;
}