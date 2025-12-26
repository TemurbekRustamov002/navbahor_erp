"use client";
import { api } from '../api';
import { ScaleConfig, ScaleReading } from '../hooks/useScale';

export interface CreateScaleDto {
  name: string;
  department: 'ARRALI_SEX' | 'VALIKLI_SEX' | 'UNIVERSAL';
  isActive?: boolean;
  settings?: any;
}

export interface UpdateScaleConfigDto {
  name?: string;
  department?: 'ARRALI_SEX' | 'VALIKLI_SEX' | 'UNIVERSAL';
  isActive?: boolean;
  connectionStatus?: string;
  settings?: any;
}

export interface ScaleReadingDto {
  weight: number;
  isStable?: boolean;
  unit?: string;
  markaId?: string;
  sessionId?: string;
}

class ScaleService {
  // Scale Configuration Management
  async createScale(dto: CreateScaleDto): Promise<ScaleConfig> {
    const response = await api.post('/scales/config', dto);
    return response.data;
  }

  async getScales(): Promise<ScaleConfig[]> {
    const response = await api.get('/scales/config');
    return response.data;
  }

  async updateScale(id: string, dto: UpdateScaleConfigDto): Promise<ScaleConfig> {
    const response = await api.put(`/scales/config/${id}`, dto);
    return response.data;
  }

  async getScalesByDepartment(department: string) {
    const response = await api.get(`/scales/department/${department}`);
    return response.data;
  }

  // Scale Reading Management (Note: no direct readings endpoint, use WebSocket)
  async recordReading(scaleId: string, dto: ScaleReadingDto) {
    const response = await api.post(`/scales/${scaleId}/reading`, dto);
    return response.data;
  }

  // Manual weight input when scale is disconnected
  async recordManualReading(dto: { weight: number; markaId?: string; unit?: string }) {
    const response = await api.post('/scales/manual/reading', dto);
    return response.data;
  }

  async getLatestReading(scaleId: string) {
    const response = await api.get(`/scales/${scaleId}/latest`);
    return response.data;
  }

  async getReadingHistory(scaleId: string, limit?: number, markaId?: string) {
    const params = new URLSearchParams();
    if (limit) params.append('limit', limit.toString());
    if (markaId) params.append('markaId', markaId);

    const response = await api.get(`/scales/${scaleId}/history?${params.toString()}`);
    return response.data;
  }

  // Scale Session Management
  async startSession(scaleId: string, sessionId: string, markaId?: string) {
    const response = await api.post(`/scales/${scaleId}/session/start`, {
      sessionId,
      markaId,
    });
    return response.data;
  }

  async updateHeartbeat(scaleId: string) {
    const response = await api.post(`/scales/${scaleId}/heartbeat`);
    return response.data;
  }

  // System Health
  async checkConnections() {
    const response = await api.post('/scales/health/check');
    return response.data;
  }

  async getOverview() {
    const response = await api.get('/scales/status/overview');
    return response.data;
  }

  // Department Scale Setup (Admin functionality)
  async setupDepartmentScales() {
    try {
      // Create default scales for each department if they don't exist
      const existingScales = await this.getScales();
      
      const defaultScales = [
        {
          name: 'CAS_CI_200A_ARRALI',
          department: 'ARRALI_SEX' as const,
          isActive: true,
          settings: {
            model: 'CAS_CI_200A',
            maxCapacity: 500,
            precision: 0.1,
            autoStabilization: true,
          },
        },
        {
          name: 'CAS_CI_200A_VALIKLI_1',
          department: 'VALIKLI_SEX' as const,
          isActive: true,
          settings: {
            model: 'CAS_CI_200A',
            maxCapacity: 500,
            precision: 0.1,
            autoStabilization: true,
          },
        },
        {
          name: 'BAYKON_BX65_VALIKLI_2',
          department: 'VALIKLI_SEX' as const,
          isActive: true,
          settings: {
            model: 'BAYKON_BX65',
            maxCapacity: 300,
            precision: 0.05,
            autoStabilization: true,
          },
        },
      ];

      const createdScales = [];
      
      for (const scaleConfig of defaultScales) {
        const exists = existingScales.find(s => s.name === scaleConfig.name);
        if (!exists) {
          try {
            const created = await this.createScale(scaleConfig);
            createdScales.push(created);
            console.log(`✅ Created scale: ${scaleConfig.name}`);
          } catch (error) {
            console.error(`❌ Failed to create scale ${scaleConfig.name}:`, error);
          }
        }
      }

      return {
        success: true,
        message: `Setup completed. ${createdScales.length} scales created.`,
        createdScales,
        existingScales: existingScales.length,
      };

    } catch (error) {
      console.error('❌ Failed to setup department scales:', error);
      throw error;
    }
  }

  // Scale Initialization for specific departments
  async initializeScalesForDepartment(department: 'ARRALI_SEX' | 'VALIKLI_SEX' | 'UNIVERSAL') {
    try {
      const scalesData = await this.getScalesByDepartment(department);
      
      if (!scalesData.scales || scalesData.scales.length === 0) {
        console.warn(`⚠️ No scales found for department: ${department}`);
        return {
          success: false,
          message: `No scales configured for ${department}`,
        };
      }

      return {
        success: true,
        department: scalesData.departmentInfo.department,
        scales: scalesData.scales,
        activeMarkas: scalesData.activeMarkas,
        message: `Found ${scalesData.scales.length} scales and ${scalesData.activeMarkas.length} active markas`,
      };

    } catch (error) {
      console.error(`❌ Failed to initialize scales for ${department}:`, error);
      throw error;
    }
  }

  // Conflict prevention helper
  async checkScaleAvailability(department: string): Promise<{
    available: boolean;
    activeScales: string[];
    message: string;
  }> {
    try {
      const overview = await this.getOverview();
      const departmentScales = overview.data.scales.filter(
        (s: ScaleConfig) => s.department === department && s.isActive
      );

      const connectedScales = departmentScales.filter(
        (s: ScaleConfig) => s.connectionStatus === 'connected'
      );

      return {
        available: connectedScales.length > 0,
        activeScales: connectedScales.map((s: ScaleConfig) => s.name),
        message: connectedScales.length > 0 
          ? `${connectedScales.length} scales available in ${department}`
          : `No connected scales in ${department}`,
      };

    } catch (error) {
      console.error('❌ Failed to check scale availability:', error);
      return {
        available: false,
        activeScales: [],
        message: 'Failed to check scale availability',
      };
    }
  }
}

export const scaleService = new ScaleService();