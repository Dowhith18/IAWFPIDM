// Application Data
const AppData = {
  dtc_lookup_database: [],
  vehicle_data: {
    vin: "MA1NS2NVPR2D51667",
    model_code: "AS22XPNV5TP03D00ZY",
    model_description: "XUV300 HIGH_OPT_AXYLPRO_G_AT_ESP_TECHPACK_TGDI",
    odometer: 85,
    battery_voltage: 13.7,
    vehicle_speed: 0,
    engine_rpm: 867,
    engine_state: "Running",
    electrical_health_score: 73,
    ai_confidence: 0.89
  },
  ecu_modules: [
    {name: "EMSG12TGDI", status: "SUCCESS", fault_count: 0, ai_risk_score: 12},
    {name: "SMARTCORE", status: "DTC_FOUND", fault_count: 8, ai_risk_score: 76},
    {name: "TCU", status: "DTC_FOUND", fault_count: 5, ai_risk_score: 58},
    {name: "ESP", status: "DTC_FOUND", fault_count: 4, ai_risk_score: 72},
    {name: "SRS", status: "DTC_FOUND", fault_count: 10, ai_risk_score: 83}
  ],
  fault_predictions: [
    {
      dtc_code: "P062700",
      fault_type: "Open Circuit",
      component: "Fuel Pump Relay Control Circuit",
      probable_cause: "Open in relay control circuit",
      impact: "Engine shuts off, Fuel pump inactive",
      severity: "High",
      recommended_action: "Check relay and wiring harness"
    },
    {
      dtc_code: "P026100",
      fault_type: "Short to Ground",
      component: "Fuel Injector 1 Control Circuit",
      probable_cause: "Control wire short to ground",
      impact: "Cylinder 1 disabled, Engine limited to 1500 RPM",
      severity: "High",
      recommended_action: "Inspect injector wiring and connector"
    }
  ]
};

// Application State
const AppState = {
  currentUser: null,
  currentPage: 'dashboard-page',
  currentVehicle: null,
  charts: {},
  updateInterval: null
};

// Application Controller
class DiagnosticApp {
  constructor() {
    this.init();
  }

  init() {
    this.bindEvents();
    this.updateDashboard();
    this.startDataUpdates();
  }

  bindEvents() {
    // Vehicle page events
    const ocrBtn = document.getElementById('ocr-scan-btn');
    if (ocrBtn) ocrBtn.addEventListener('click', () => this.simulateOCRScan());
    
    const detectBtn = document.getElementById('detect-vehicle-btn');
    if (detectBtn) detectBtn.addEventListener('click', () => this.detectVehicle());
    
    const startBtn = document.getElementById('start-diagnostic-btn');
    if (startBtn) startBtn.addEventListener('click', () => this.startDiagnostic());
  }

  simulateOCRScan() {
    const vinInput = document.getElementById('vin-input');
    if (!vinInput) return;
    
    vinInput.value = 'Scanning...';
    vinInput.disabled = true;
    
    setTimeout(() => {
      vinInput.value = AppData.vehicle_data.vin;
      vinInput.disabled = false;
    }, 2000);
  }

  detectVehicle() {
    const vinInput = document.getElementById('vin-input');
    if (!vinInput) return;
    
    const vin = vinInput.value;
    if (!vin || vin.length !== 17) {
      alert('Please enter a valid 17-character VIN');
      return;
    }

    const modelEl = document.getElementById('vehicle-model');
    const vinEl = document.getElementById('vehicle-vin');
    const confidenceEl = document.getElementById('ai-confidence');
    const vehicleInfo = document.getElementById('vehicle-info');
    
    if (modelEl) modelEl.textContent = AppData.vehicle_data.model_description;
    if (vinEl) vinEl.textContent = vin;
    if (confidenceEl) confidenceEl.textContent = `${Math.round(AppData.vehicle_data.ai_confidence * 100)}%`;
    if (vehicleInfo) vehicleInfo.classList.remove('hidden');
    
    AppState.currentVehicle = { ...AppData.vehicle_data, vin };
  }

  startDiagnostic() {
    window.location.href = '/';
  }

  updateDashboard() {
    const elements = {
      'odometer-value': `${AppData.vehicle_data.odometer} km`,
      'battery-voltage': `${AppData.vehicle_data.battery_voltage}V`,
      'engine-rpm': AppData.vehicle_data.engine_rpm,
      'vehicle-speed': `${AppData.vehicle_data.vehicle_speed} km/h`,
      'engine-state': AppData.vehicle_data.engine_state,
      'electrical-health': `${AppData.vehicle_data.electrical_health_score}%`
    };

    Object.entries(elements).forEach(([id, value]) => {
      const el = document.getElementById(id);
      if (el) el.textContent = value;
    });

    this.updateECUGrid();
    this.updatePredictions();
  }

  updateECUGrid() {
    const ecuGrid = document.getElementById('ecu-grid');
    if (!ecuGrid) return;
    
    ecuGrid.innerHTML = '';

    AppData.ecu_modules.forEach(ecu => {
      const ecuCard = document.createElement('div');
      ecuCard.className = `ecu-status-card ${this.getECUStatusClass(ecu.status)}`;
      ecuCard.innerHTML = `
        <h4>${ecu.name}</h4>
        <p>DTCs: ${ecu.fault_count}</p>
        <p>Risk: ${ecu.ai_risk_score}%</p>
      `;
      ecuGrid.appendChild(ecuCard);
    });
  }

  getECUStatusClass(status) {
    switch(status) {
      case 'SUCCESS': return 'status-success';
      case 'DTC_FOUND': return 'status-warning';
      default: return 'status-error';
    }
  }

  updatePredictions() {
    const predictionsList = document.getElementById('predictions-list');
    if (!predictionsList) return;
    
    predictionsList.innerHTML = '';

    AppData.fault_predictions.forEach(prediction => {
      const predCard = document.createElement('div');
      const severity = (prediction.severity || 'Medium').toLowerCase();
      const severityClass = ['high', 'medium', 'low'].includes(severity) ? severity : 'medium';

      predCard.className = `prediction-card severity-${severityClass}`;
      predCard.innerHTML = `
        <h4>DTC ${prediction.dtc_code} - ${prediction.fault_type}</h4>
        <p><strong>Component:</strong> ${prediction.component}</p>
        <p><strong>Probable Cause:</strong> ${prediction.probable_cause}</p>
        <p><strong>Impact:</strong> ${prediction.impact}</p>
        <p><strong>Severity:</strong> <span class="severity-${severityClass}">${prediction.severity}</span></p>
        <p><strong>Recommended Action:</strong> ${prediction.recommended_action}</p>
      `;
      predictionsList.appendChild(predCard);
    });
  }

  startDataUpdates() {
    AppState.updateInterval = setInterval(() => {
      this.simulateDataUpdates();
      this.updateDashboard();
    }, 3000);
  }

  stopDataUpdates() {
    if (AppState.updateInterval) {
      clearInterval(AppState.updateInterval);
      AppState.updateInterval = null;
    }
  }

  simulateDataUpdates() {
    AppData.vehicle_data.engine_rpm = 867 + Math.floor(Math.random() * 100 - 50);
    AppData.vehicle_data.battery_voltage = Math.round((13.7 + (Math.random() * 0.4 - 0.2)) * 10) / 10;
    AppData.vehicle_data.electrical_health_score = Math.max(70, Math.min(80, 73 + Math.floor(Math.random() * 10 - 5)));
  }
}

// Global function for clearing DTCs
function clearDTCs() {
  if (confirm('Are you sure you want to clear all DTCs?')) {
    alert('DTCs cleared successfully!');
  }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  window.diagnosticApp = new DiagnosticApp();
});
