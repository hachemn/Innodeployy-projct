import { Injectable, InternalServerErrorException } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class MonitoringService {
  private readonly prometheusUrl =
    process.env.PROMETHEUS_URL || 'http://localhost:9090';

  private readonly alertmanagerUrl =
    process.env.ALERTMANAGER_URL || 'http://localhost:9093';

  async getBackendMetrics() {
    try {
      const cpuQuery =
        'rate(container_cpu_usage_seconds_total{namespace="innodeploy",container="backend"}[5m]) * 100';

      const memoryQuery =
        'container_memory_working_set_bytes{namespace="innodeploy",container="backend"}';

      const [cpuResponse, memoryResponse, alertsResponse] =
        await Promise.all([
          axios.get(`${this.prometheusUrl}/api/v1/query`, {
            params: { query: cpuQuery },
          }),

          axios.get(`${this.prometheusUrl}/api/v1/query`, {
            params: { query: memoryQuery },
          }),

          axios.get(`${this.alertmanagerUrl}/api/v2/alerts`, {
            params: {
              filter: 'alertname=~"InnoDeployBackend.*"',
            },
          }),
        ]);

      const cpuResult = cpuResponse.data.data.result[0];
      const memoryResult = memoryResponse.data.data.result[0];

      const alerts = alertsResponse.data.map(
        (alert: {
          labels?: Record<string, string>;
          status?: { state?: string };
          annotations?: Record<string, string>;
          startsAt?: string;
        }) => ({
          name: alert.labels?.alertname,
          severity: alert.labels?.severity,
          status: alert.status?.state,
          summary: alert.annotations?.summary,
          description: alert.annotations?.description,
          startsAt: alert.startsAt,
        }),
      );

      const backendDown = alerts.some(
        (alert: { name?: string }) =>
          alert.name === 'InnoDeployBackendDown',
      );

      const cpuPercent = cpuResult
        ? Number(cpuResult.value[1])
        : 0;

      const memoryBytes = memoryResult
        ? Number(memoryResult.value[1])
        : 0;

      const memoryMb = memoryBytes / 1024 / 1024;

      return {
        status: backendDown ? 'unhealthy' : 'healthy',
        pod: cpuResult?.metric?.pod || 'No running backend pod',
        cpuPercent: Number(cpuPercent.toFixed(4)),
        memoryMb: Number(memoryMb.toFixed(2)),
        alerts,
      };
    } catch (error) {
      console.error('Failed to query monitoring data:', error);

      throw new InternalServerErrorException(
        'Unable to retrieve monitoring data',
      );
    }
  }
}