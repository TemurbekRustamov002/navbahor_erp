'use client';

import { useEffect, useState } from 'react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { ScaleDisplay } from './ScaleDisplay';
import { ToyForm } from './ToyForm';
import { RecentToys } from './RecentToys';
import { EnhancedRecentToys } from './EnhancedRecentToys';
import { useScaleProfessional } from '../../lib/hooks/useScale';
import { useBackendMarkaStore } from '../../stores/backendMarkaStore';
import { scaleService } from '../../lib/services';
import { useAuthStore } from '../../stores/authStore';
import { Scale, Zap, Activity, AlertCircle, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function TaroziPage() {
  const [selectedDepartment, setSelectedDepartment] = useState<string>('VALIKLI_SEX');
  const [showScaleDemo, setShowScaleDemo] = useState(false);
  const [showRecentToys, setShowRecentToys] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);

  // Auth store for user role
  const { user } = useAuthStore();

  // Professional scale hook
  const {
    currentReading,
    isConnected,
    connectionError,
    availableScales,
    activeScale,
    activeSession,
    departmentInfo,
    hardwareConnectedCount,
    connect,
    disconnect,
    selectScale,
    startSession,
    endSession,
    loadDepartmentScales,
    simulateReading,
    startMockReadings,
    stopMockReadings,
    recordManualReading,
    connectLocalSerial,
    disconnectLocalSerial,
    isSerialSupported,
    isSerialConnected,
  } = useScaleProfessional();

  // Marka store for backend integration
  const {
    markas: backendMarkas,
    isLoading: markasLoading,
    error: markasError,
    fetchMarkas,
    getScaleVisibleMarkasScoped
  } = useBackendMarkaStore();

  // Compute filtered markas based on user department (Valikli/Arrali rules)
  const filteredMarkas = getScaleVisibleMarkasScoped();

  // Initialize on component mount
  useEffect(() => {
    const initializeScales = async () => {
      try {
        console.log('🚀 Initializing Tarozi page...');

        // Setup default scales (admin functionality)
        if (user?.role === 'ADMIN' || user?.role === 'SUPERVISOR') {
          try {
            await scaleService.setupDepartmentScales();
          } catch (error) {
            console.warn('⚠️ Scale setup warning:', error);
          }
        }

        // Fetch markas
        await fetchMarkas();

        // Load department scales
        await loadDepartmentScales(selectedDepartment);

        setIsInitialized(true);
        console.log('✅ Tarozi page initialized');
      } catch (error) {
        console.error('❌ Failed to initialize Tarozi page:', error);
      }
    };

    if (user) {
      initializeScales();
    }
  }, [user, fetchMarkas, loadDepartmentScales, selectedDepartment]);

  // Handle department change
  const handleDepartmentChange = async (department: string) => {
    setSelectedDepartment(department);
    await loadDepartmentScales(department);

    // End current session if any
    if (activeSession) {
      endSession();
    }
  };

  // Handle scale selection
  const handleScaleSelect = async (scaleId: string) => {
    try {
      const success = await selectScale(scaleId, selectedDepartment);
      if (success) {
        console.log('✅ Scale selected successfully');
      } else {
        console.error('❌ Failed to select scale');
      }
    } catch (error) {
      console.error('❌ Error selecting scale:', error);
    }
  };

  // Handle session start
  const handleSessionStart = async (markaId?: string) => {
    if (!activeScale) {
      alert('Iltimos, avval tarozi tanlang');
      return;
    }

    try {
      const success = await startSession(activeScale.id, markaId);
      if (success) {
        console.log('✅ Session started successfully');
      } else {
        console.error('❌ Failed to start session');
      }
    } catch (error) {
      console.error('❌ Error starting session:', error);
    }
  };

  // Mock readings for demo
  const handleMockWeight = (weight: number) => {
    simulateReading(weight, true);
  };

  // Get current weight for display
  const currentWeight = currentReading?.weight || 0;
  const isStable = currentReading?.isStable || false;

  // Filter active markas for current department
  const activeMarkasLegacy = (backendMarkas || []).filter((marka: any) => {
    if (selectedDepartment === 'ARRALI_SEX') {
      return marka.number >= 1 && marka.number <= 200;
    } else if (selectedDepartment === 'VALIKLI_SEX') {
      return marka.number >= 201 && marka.number <= 400;
    } else {
      return marka.number > 400; // UNIVERSAL (Lint, Siklon, Uluk)
    }
  });

  if (!isInitialized) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-lg font-semibold">Tarozi tizimi ishga tushirilmoqda...</p>
          <p className="text-gray-600 mt-2">Iltimos kuting...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Tarozi Bo'limi</h1>
          <p className="text-gray-600 mt-1">Professional tarozi tizimi - Real-time integratsiya</p>
        </div>
        <div className="flex space-x-4">
          <Button
            onClick={() => setShowScaleDemo(!showScaleDemo)}
            variant={showScaleDemo ? 'default' : 'secondary'}
          >
            {showScaleDemo ? 'Demo Yopish' : 'Demo Rejim'}
          </Button>
          <Button
            onClick={() => setShowRecentToys(!showRecentToys)}
            variant={showRecentToys ? 'default' : 'secondary'}
          >
            {showRecentToys ? 'Oddiy Ko\'rinish' : 'Kengaytirilgan'}
          </Button>
        </div>
      </div>

      {/* Department Selection */}
      <Card className="p-4">
        <h2 className="text-xl font-semibold mb-4">Bo'lim Tanlash</h2>
        <div className="flex space-x-4">
          {[
            { key: 'ARRALI_SEX', label: 'Arrali Sex (1-200)', desc: '1 ta CAS CI-200A' },
            { key: 'VALIKLI_SEX', label: 'Valikli Sex (201-400)', desc: '2 ta tarozi' },
            { key: 'UNIVERSAL', label: 'Lint/Siklon/Uluk (400+)', desc: 'Universal' },
          ].map((dept) => (
            <Button
              key={dept.key}
              onClick={() => handleDepartmentChange(dept.key)}
              variant={selectedDepartment === dept.key ? 'default' : 'secondary'}
              className="flex-1 text-center"
            >
              <div>
                <div className="font-semibold">{dept.label}</div>
                <div className="text-xs opacity-75">{dept.desc}</div>
              </div>
            </Button>
          ))}
        </div>
      </Card>

      {/* Connection Status & Scale Selection */}
      <Card className="p-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Tarozi Holati</h2>
          <div className="flex items-center space-x-4">
            <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${isConnected
              ? 'bg-green-100 text-green-800'
              : 'bg-red-100 text-red-800'
              }`}>
              {isConnected ? '🔗 WebSocket Ulangan' : '❌ WebSocket Uzilgan'}
              {!isConnected && (
                <div className="flex items-center gap-2 ml-2">
                  <Button
                    size="sm"
                    onClick={connect}
                    className="h-6 px-2 text-[10px] bg-red-600 hover:bg-red-700 text-white"
                  >
                    Qayta ulanish
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => connectLocalSerial()}
                    className="h-6 px-2 text-[10px] border-red-300 text-red-700 hover:bg-red-50"
                  >
                    USB Ulanish
                  </Button>
                </div>
              )}
            </div>
            {/* Printer status pill */}
            <div className="hidden md:block">
              {/* lazy import to avoid SSR issues */}
              {/* @ts-ignore */}
              {require('../shared/PrinterStatus').PrinterStatus ? require('../shared/PrinterStatus').PrinterStatus({}) : null}
            </div>
            {/* Hardware connected count */}
            <div className={`px-3 py-1 rounded-full text-sm font-medium ${hardwareConnectedCount > 0 ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
              ⚖️ {hardwareConnectedCount} ta tarozi ulangan
            </div>
            {activeScale && (
              <div className="px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                📡 {activeScale.name}
              </div>
            )}
            {activeSession && (
              <div className="px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-800">
                🎯 Sessiya Aktiv
              </div>
            )}
          </div>
        </div>

        {connectionError && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-800 font-medium">Xatolik:</p>
            <p className="text-red-600">{connectionError}</p>
          </div>
        )}

        {/* Available Scales */}
        <div className="mb-4">
          <h3 className="text-lg font-semibold mb-2">Mavjud Tarozilar ({availableScales.length})</h3>
          {availableScales.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {availableScales.map((scale) => (
                <div
                  key={scale.id}
                  className={`border rounded-lg p-4 cursor-pointer transition-all ${activeScale?.id === scale.id
                    ? 'border-blue-500 bg-blue-50'
                    : scale.connectionStatus === 'connected'
                      ? 'border-green-300 bg-green-50 hover:bg-green-100'
                      : 'border-gray-300 bg-gray-50'
                    }`}
                  onClick={() => handleScaleSelect(scale.id)}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-bold">{scale.name}</p>
                      <p className="text-sm text-gray-600">{scale.department}</p>
                    </div>
                    <div className={`w-3 h-3 rounded-full ${scale.connectionStatus === 'connected' ? 'bg-green-500' :
                      scale.connectionStatus === 'error' ? 'bg-red-500' : 'bg-gray-400'
                      }`}></div>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    {scale.connectionStatus} • {scale.isActive ? 'Faol' : 'Nofaol'}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              {selectedDepartment} uchun tarozi topilmadi
            </div>
          )}
        </div>

        {/* Current Reading Display */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="text-center">
            <p className="text-3xl font-bold text-blue-600">{currentWeight.toFixed(1)} kg</p>
            <p className="text-gray-600">Hozirgi Vazn</p>
          </div>
          <div className="text-center">
            <p className={`text-2xl font-bold ${isStable ? 'text-green-600' : 'text-yellow-600'}`}>
              {isStable ? '✓ Barqaror' : '~ O\'zgaruvchan'}
            </p>
            <p className="text-gray-600">Holat</p>
          </div>
          <div className="text-center">
            <p className="text-lg font-semibold">{activeScale?.name || 'Tanlanmagan'}</p>
            <p className="text-gray-600">Aktiv Tarozi</p>
          </div>
          <div className="text-center">
            <p className="text-lg font-semibold">{currentReading?.timestamp ? new Date(currentReading.timestamp).toLocaleTimeString() : '--:--:--'}</p>
            <p className="text-gray-600">Oxirgi O\'lchov</p>
          </div>
        </div>
      </Card>

      {/* Active Markas for Selected Department */}
      <Card className="p-4">
        <h2 className="text-xl font-semibold mb-4">
          {selectedDepartment} - Aktiv Markalar ({filteredMarkas.length})
        </h2>
        {filteredMarkas.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-6 lg:grid-cols-8 gap-3">
            {activeMarkasLegacy.map((marka: any) => (
              <div
                key={marka.id}
                className={`border rounded-lg p-3 cursor-pointer transition-all ${activeSession?.markaId === marka.id
                  ? 'border-purple-500 bg-purple-50'
                  : 'border-green-300 bg-green-50 hover:bg-green-100'
                  }`}
                onClick={() => handleSessionStart(marka.id)}
              >
                <div className="text-center">
                  <p className="font-bold text-lg">{marka.number}</p>
                  <p className="text-sm text-gray-600">{marka.productType}</p>
                  <p className="text-xs text-gray-500">{marka.used}/{marka.capacity}</p>
                  <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                    <div
                      className="bg-blue-600 h-2 rounded-full"
                      style={{ width: `${(marka.used / marka.capacity) * 100}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            {selectedDepartment} uchun aktiv markalar yo'q
          </div>
        )}
      </Card>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column - Scale and Form */}
        <div className="space-y-6">
          {/* Scale Display */}
          <ScaleDisplay
            weight={currentWeight}
            isStable={isStable}
            isConnected={isConnected}
          />

          {/* Toy Form */}
          <ToyForm
            currentWeight={currentWeight}
            isStable={isStable}
            activeMarkas={filteredMarkas as any}
            isConnected={isConnected}
            hardwareConnectedCount={hardwareConnectedCount}
          />
        </div>

        {/* Right Column - Recent Toys */}
        <div>
          {showRecentToys ? (
            <EnhancedRecentToys />
          ) : (
            <RecentToys />
          )}
        </div>
      </div>

      {/* Demo Mode */}
      {showScaleDemo && (
        <Card className="p-4 bg-yellow-50 border-yellow-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-yellow-800">🎭 Demo Rejimi</h3>
            <div className="flex space-x-2">
              <Button size="sm" onClick={startMockReadings}>
                🎬 Auto Demo
              </Button>
              <Button size="sm" onClick={stopMockReadings} variant="secondary">
                ⏹️ Stop
              </Button>
            </div>
          </div>
          <p className="text-yellow-700 mb-4">
            Bu demo rejimda ishlayapti. Manual yoki avtomatik test vazn kiritishingiz mumkin.
          </p>
          <div className="grid grid-cols-2 md:grid-cols-6 gap-2">
            {[185.5, 192.3, 198.7, 205.1, 189.9, 196.4].map((weight) => (
              <Button
                key={weight}
                size="sm"
                variant="secondary"
                onClick={() => handleMockWeight(weight)}
                className="text-sm"
              >
                {weight} kg
              </Button>
            ))}
          </div>
        </Card>
      )}

      {/* Debug Info (Development only) */}
      {process.env.NODE_ENV === 'development' && (
        <Card className="p-4 bg-gray-50">
          <h3 className="font-semibold mb-2">🛠️ Debug Info</h3>
          <div className="text-xs space-y-1">
            <p><strong>Department:</strong> {selectedDepartment}</p>
            <p><strong>Available Scales:</strong> {availableScales.length}</p>
            <p><strong>Active Scale:</strong> {activeScale?.name || 'None'}</p>
            <p><strong>Active Session:</strong> {activeSession?.sessionId || 'None'}</p>
            <p><strong>Active Markas:</strong> {filteredMarkas.length}</p>
            <p><strong>WebSocket:</strong> {isConnected ? 'Connected' : 'Disconnected'}</p>
            <p><strong>Current Reading:</strong> {currentReading ? `${currentWeight}kg (${isStable ? 'Stable' : 'Unstable'})` : 'None'}</p>
          </div>
        </Card>
      )}
    </div>
  );
}