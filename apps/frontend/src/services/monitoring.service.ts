import api from "../api/axios";

export interface MonitoringAlert {
  name: string;
  severity: string;
  status: string;
  summary: string;
  description: string;
  startsAt: string;
}

export interface BackendMonitoring {
  status: string;
  pod: string;
  cpuPercent: number;
  memoryMb: number;
  alerts: MonitoringAlert[];
}

export const getBackendMonitoring = async (): Promise<BackendMonitoring> => {
  const response = await api.get<BackendMonitoring>("/monitoring/backend");
  return response.data;
};
