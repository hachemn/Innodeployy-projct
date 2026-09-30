import api from "../api/axios";

export interface CreateProjectDto {
  name: string;
  description?: string;
}

export async function createProject(dto: CreateProjectDto) {
  const token = localStorage.getItem("token");

  const response = await api.post(
    "/projects",
    dto,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return response.data;
}

export async function getProjects() {
  const token = localStorage.getItem("token");

  const response = await api.get("/projects", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return response.data;
}

export interface ConnectRepositoryDto {
  provider: "GITHUB";
  url: string;
  branch?: string;
}

export async function connectRepository(
  projectId: number,
  dto: ConnectRepositoryDto
) {
  const token = localStorage.getItem("token");

  const response = await api.post(
    `/projects/${projectId}/repository`,
    dto,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return response.data;
}

export async function getRepository(projectId: number) {
  const token = localStorage.getItem("token");

  const response = await api.get(
    `/projects/${projectId}/repository`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return response.data;
}