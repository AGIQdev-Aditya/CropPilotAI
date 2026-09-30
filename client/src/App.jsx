import React, { useState, useEffect } from 'react';
import {
  Sprout,
  Activity,
  ShieldCheck,
  AlertTriangle,
  Bug,
  Droplets,
  MapPin,
  Database,
  Sparkles,
  CheckCircle2,
  ChevronRight,
  RefreshCw,
  Plus,
  ArrowRight,
  ShieldAlert,
  Cpu,
  HeartPulse,
  Layers,
  ClipboardList,
  Info,
  ExternalLink,
  Calendar,
  Search
} from 'lucide-react';
import {
  fetchHealth,
  fetchFarms,
  createFarm,
  fetchFields,
  fetchCrops,
  createCrop,
  fetchAdvisories,
  diagnoseCrop
} from './services/api';

export default function App() {
  const [activeTab, setActiveTab] = useState('diagnose');
  const [healthStatus, setHealthStatus] = useState(null);
  const [farms, setFarms] = useState([]);
  const [fields, setFields] = useState([]);
  const [crops, setCrops] = useState([]);
  const [advisories, setAdvisories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [diagnosing, setDiagnosing] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [copiedSQL, setCopiedSQL] = useState(false);

  // Diagnosis Form State
  const [formData, setFormData] = useState({
    crop_name: 'Tomatoes',
    stage: 'Flowering',
    symptoms: 'Yellow leaf spots with concentric dark rings, lower foliage wilting and drying up',
    soil_type: 'Black Cotton Soil',
    weather: 'Humid & Overcast (28°C)'
  });
  const [activeDiagnosis, setActiveDiagnosis] = useState(null);

  // New Farm Modal State
  const [showAddFarm, setShowAddFarm] = useState(false);
  const [newFarm, setNewFarm] = useState({
    name: '',
    location: '',
    total_area_acres: 10,
    soil_type: 'Loamy'
  });

  // New Crop Modal State
  const [showAddCrop, setShowAddCrop] = useState(false);
  const [newCrop, setNewCrop] = useState({
    crop_name: '',
    variety: '',
    field_id: '',
    stage: 'Vegetative',
    status: 'Healthy'
  });

  // Presets for quick evaluation
  const symptomPresets = [
    {
      crop: 'Tomatoes',
      stage: 'Flowering',
      label: 'Early Blight Spots',
      symptoms: 'Yellow leaf spots with concentric dark brown rings, lower leaves turning brown and brittle.'
    },
    {
      crop: 'Cotton',
      stage: 'Vegetative',
      label: 'Leaf Curl Virus',
      symptoms: 'Severe upward curling of leaves, thickened veins, presence of small whitefly insects on leaf underside.'
    },
    {
      crop: 'Wheat',
      stage: 'Vegetative',
      label: 'Powdery Mildew',
      symptoms: 'White powdery patches spreading across leaf blades and lower stems during cool foggy mornings.'
    },
    {
      crop: 'Potato',
      stage: 'Tuber Initiation',
      label: 'Late Blight Rot',
      symptoms: 'Water-soaked dark lesions on leaf tips expanding rapidly with white fungal mold under damp conditions.'
    }
  ];

  useEffect(() => {
    loadAllData();
  }, []);

  async function loadAllData() {
    setLoading(true);
    setErrorMsg('');
    try {
      const [h, f, fld, c, a] = await Promise.allSettled([
        fetchHealth(),
        fetchFarms(),
        fetchFields(),
        fetchCrops(),
        fetchAdvisories()
      ]);

      if (h.status === 'fulfilled') setHealthStatus(h.value);
      if (f.status === 'fulfilled') setFarms(f.value);
      if (fld.status === 'fulfilled') setFields(fld.value);
      if (c.status === 'fulfilled') setCrops(c.value);
      if (a.status === 'fulfilled') {
        setAdvisories(a.value);
        if (a.value.length > 0 && !activeDiagnosis) {
          setActiveDiagnosis(a.value[0]);
        }
      }
    } catch (err) {
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  }

  async function handleDiagnose(e) {
    if (e) e.preventDefault();
    if (!formData.crop_name || !formData.symptoms) {
      setErrorMsg('Please specify both crop name and observed symptoms.');
      return;
    }

    setDiagnosing(true);
    setErrorMsg('');

    try {
      const result = await diagnoseCrop(formData);
      setActiveDiagnosis(result);
      setAdvisories(prev => [result, ...prev]);
      // Smooth scroll to results
      const resEl = document.getElementById('diagnosis-results');
      if (resEl) {
        resEl.scrollIntoView({ behavior: 'smooth' });
      }
    } catch (err) {
      console.error('Diagnosis failed:', err);
      setErrorMsg(err.message || 'Diagnosis generation failed. Please try again.');
    } finally {
      setDiagnosing(false);
    }
  }

  async function handleCreateFarm(e) {
    e.preventDefault();
    try {
      const created = await createFarm(newFarm);
      setFarms(prev => [created, ...prev]);
      setShowAddFarm(false);
      setNewFarm({ name: '', location: '', total_area_acres: 10, soil_type: 'Loamy' });
    } catch (err) {
      alert('Failed to create farm: ' + err.message);
    }
  }

  async function handleCreateCrop(e) {
    e.preventDefault();
    try {
      const created = await createCrop(newCrop);
      setCrops(prev => [created, ...prev]);
      setShowAddCrop(false);
      setNewCrop({ crop_name: '', variety: '', field_id: '', stage: 'Vegetative', status: 'Healthy' });
    } catch (err) {
      alert('Failed to create crop: ' + err.message);
    }
  }

  const getSeverityBadge = (severity) => {
    switch (severity?.toLowerCase()) {
      case 'critical':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-100 text-red-800 border border-red-200">Critical Risk</span>;
      case 'high':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-orange-100 text-orange-800 border border-orange-200">High Severity</span>;
      case 'moderate':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-200">Moderate Severity</span>;
      default:
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">Low / Managed</span>;
    }
  };

  const getStatusBadge = (status) => {
    switch (status?.toLowerCase()) {
      case 'healthy':
        return <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">Healthy</span>;
      case 'needs attention':
        return <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200">Needs Attention</span>;
      case 'under treatment':
        return <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200">Under Treatment</span>;
      default:
        return <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-700">{status}</span>;
    }
  };

  const schemaSQL = `-- Supabase PostgreSQL Schema for CropPilot AI
CREATE TABLE IF NOT EXISTS public.farms (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT NOT NULL DEFAULT 'demo-farmer-001',
    name TEXT NOT NULL,
    location TEXT,
    total_area_acres NUMERIC(8,2) DEFAULT 0,
    soil_type TEXT DEFAULT 'Loamy',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.fields (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    farm_id UUID NOT NULL REFERENCES public.farms(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    area_acres NUMERIC(8,2) DEFAULT 0,
    irrigation_type TEXT DEFAULT 'Drip Irrigation',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.crops (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    field_id UUID NOT NULL REFERENCES public.fields(id) ON DELETE CASCADE,
    crop_name TEXT NOT NULL,
    variety TEXT,
    planting_date DATE DEFAULT CURRENT_DATE,
    stage TEXT DEFAULT 'Vegetative',
    status TEXT DEFAULT 'Healthy',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.advisories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT NOT NULL DEFAULT 'demo-farmer-001',
    crop_id UUID REFERENCES public.crops(id) ON DELETE SET NULL,
    crop_name TEXT NOT NULL,
    query_text TEXT NOT NULL,
    disease_identified TEXT NOT NULL,
    severity TEXT NOT NULL DEFAULT 'Moderate',
    confidence NUMERIC(4,2) DEFAULT 0.95,
    symptoms_analysis TEXT,
    immediate_action_plan JSONB DEFAULT '[]'::jsonb,
    organic_treatment TEXT,
    chemical_treatment TEXT,
    preventive_measures JSONB DEFAULT '[]'::jsonb,
    disclaimer TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);`;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col">
      {/* Top Banner / Navbar */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-green-400 flex items-center justify-center shadow-md shadow-emerald-500/20 text-white">
                <Sprout className="w-6 h-6 stroke-[2.2]" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-lg sm:text-xl tracking-tight text-slate-900">
                    Crop<span className="text-emerald-600">Pilot</span>AI
                  </span>
                  <span className="bg-emerald-50 text-emerald-700 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-200">
                    v1.0 Antigravity Edition
                  </span>
                </div>
                <p className="text-xs text-slate-500 hidden sm:block">
                  AI-Powered Precision Agriculture & Crop Pathology Assistant
                </p>
              </div>
            </div>

            {/* System Status Indicators */}
            <div className="flex items-center gap-2 sm:gap-4">
              <div className="hidden md:flex items-center gap-1.5 px-3 py-1 bg-slate-100 rounded-lg text-xs font-medium text-slate-600 border border-slate-200">
                <Cpu className="w-3.5 h-3.5 text-blue-600" />
                <span>Gemini 3.8 Flash</span>
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              </div>

              <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 bg-slate-100 rounded-lg text-xs font-medium text-slate-600 border border-slate-200">
                <Database className="w-3.5 h-3.5 text-emerald-600" />
                <span>Supabase Cloud</span>
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              </div>

              <button
                onClick={loadAllData}
                disabled={loading}
                className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors border border-slate-200"
                title="Refresh App State"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-emerald-600' : ''}`} />
              </button>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="flex space-x-1 sm:space-x-8 -mb-px overflow-x-auto text-sm font-medium">
            <button
              onClick={() => setActiveTab('diagnose')}
              className={`py-3 px-3 sm:px-1 border-b-2 flex items-center gap-2 whitespace-nowrap transition-colors ${
                activeTab === 'diagnose'
                  ? 'border-emerald-600 text-emerald-700 font-semibold'
                  : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
              }`}
            >
              <HeartPulse className="w-4 h-4" />
              <span>AI Crop Diagnosis</span>
            </button>

            <button
              onClick={() => setActiveTab('farms')}
              className={`py-3 px-3 sm:px-1 border-b-2 flex items-center gap-2 whitespace-nowrap transition-colors ${
                activeTab === 'farms'
                  ? 'border-emerald-600 text-emerald-700 font-semibold'
                  : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
              }`}
            >
              <Layers className="w-4 h-4" />
              <span>Farms & Fields</span>
              <span className="ml-1 bg-slate-100 text-slate-600 text-xs px-2 py-0.5 rounded-full">
                {crops.length} crops
              </span>
            </button>

            <button
              onClick={() => setActiveTab('history')}
              className={`py-3 px-3 sm:px-1 border-b-2 flex items-center gap-2 whitespace-nowrap transition-colors ${
                activeTab === 'history'
                  ? 'border-emerald-600 text-emerald-700 font-semibold'
                  : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
              }`}
            >
              <ClipboardList className="w-4 h-4" />
              <span>Advisory Logs</span>
              <span className="ml-1 bg-slate-100 text-slate-600 text-xs px-2 py-0.5 rounded-full">
                {advisories.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('architecture')}
              className={`py-3 px-3 sm:px-1 border-b-2 flex items-center gap-2 whitespace-nowrap transition-colors ${
                activeTab === 'architecture'
                  ? 'border-emerald-600 text-emerald-700 font-semibold'
                  : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
              }`}
            >
              <Database className="w-4 h-4" />
              <span>Architecture & SQL</span>
            </button>
          </nav>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {errorMsg && (
          <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 mt-0.5 flex-shrink-0 text-red-500" />
            <div className="flex-1">
              <h4 className="font-semibold text-sm">Notice</h4>
              <p className="text-sm mt-0.5">{errorMsg}</p>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 1: AI DIAGNOSIS & CROP ADVISORY */}
        {/* ========================================================================= */}
        {activeTab === 'diagnose' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left: Input Form (5 cols) */}
            <div className="lg:col-span-5 bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
              <div className="flex items-center gap-2 pb-4 mb-4 border-b border-slate-100">
                <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-900">Diagnostic Agronomist</h2>
                  <p className="text-xs text-slate-500">Submit observed crop symptoms for instant AI prescription</p>
                </div>
              </div>

              {/* Evaluation Presets */}
              <div className="mb-5">
                <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2 block">
                  Quick Evaluation Scenarios:
                </label>
                <div className="flex flex-wrap gap-2">
                  {symptomPresets.map((preset, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        setFormData({
                          crop_name: preset.crop,
                          stage: preset.stage,
                          symptoms: preset.symptoms,
                          soil_type: 'Black Cotton Soil',
                          weather: 'Humid & Overcast (28°C)'
                        });
                      }}
                      className="text-xs px-2.5 py-1.5 rounded-lg bg-slate-100 text-slate-700 hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-300 border border-slate-200 transition-all font-medium text-left"
                    >
                      {preset.crop}: {preset.label}
                    </button>
                  ))}
                </div>
              </div>

              <form onSubmit={handleDiagnose} className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">Target Crop</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Tomatoes, Wheat, Maize"
                      value={formData.crop_name}
                      onChange={(e) => setFormData({ ...formData, crop_name: e.target.value })}
                      className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">Growth Stage</label>
                    <select
                      value={formData.stage}
                      onChange={(e) => setFormData({ ...formData, stage: e.target.value })}
                      className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white"
                    >
                      <option value="Seedling">Seedling</option>
                      <option value="Vegetative">Vegetative</option>
                      <option value="Flowering">Flowering</option>
                      <option value="Fruiting">Fruiting</option>
                      <option value="Maturity/Harvest">Maturity / Harvest</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Observed Symptoms & Plant Condition
                  </label>
                  <textarea
                    rows={4}
                    required
                    placeholder="Describe color changes, leaf spotting, pest presence, wilting, or lesions..."
                    value={formData.symptoms}
                    onChange={(e) => setFormData({ ...formData, symptoms: e.target.value })}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">Soil Type</label>
                    <select
                      value={formData.soil_type}
                      onChange={(e) => setFormData({ ...formData, soil_type: e.target.value })}
                      className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white"
                    >
                      <option value="Black Cotton Soil">Black Cotton Soil</option>
                      <option value="Alluvial Soil">Alluvial Soil</option>
                      <option value="Red Sandy Loam">Red Sandy Loam</option>
                      <option value="Clayey Loam">Clayey Loam</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">Local Microclimate</label>
                    <input
                      type="text"
                      placeholder="e.g. Warm & Humid (31°C)"
                      value={formData.weather}
                      onChange={(e) => setFormData({ ...formData, weather: e.target.value })}
                      className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={diagnosing}
                  className="w-full mt-2 py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white font-semibold text-sm shadow-md shadow-emerald-600/20 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
                >
                  {diagnosing ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Diagnosing via Gemini AI...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      <span>Generate Agronomic Advisory</span>
                    </>
                  )}
                </button>
              </form>
            </div>

            {/* Right: Diagnosis Results (7 cols) */}
            <div id="diagnosis-results" className="lg:col-span-7 space-y-6">
              {activeDiagnosis ? (
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                  {/* Result Header */}
                  <div className="p-6 bg-gradient-to-br from-slate-900 to-slate-800 text-white">
                    <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-white/10 text-emerald-300 uppercase tracking-wider">
                          {activeDiagnosis.crop_name} Diagnostic Card
                        </span>
                        {getSeverityBadge(activeDiagnosis.severity)}
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-mono bg-emerald-950/80 px-2.5 py-1 rounded-md border border-emerald-800">
                        <ShieldCheck className="w-3.5 h-3.5" />
                        <span>Confidence: {Math.round((activeDiagnosis.confidence || 0.95) * 100)}%</span>
                      </div>
                    </div>

                    <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-white mb-2">
                      {activeDiagnosis.disease_identified}
                    </h3>
                    <p className="text-xs text-slate-300 italic">
                      Query: &ldquo;{activeDiagnosis.query_text}&rdquo;
                    </p>
                  </div>

                  {/* Body Content */}
                  <div className="p-6 space-y-6">
                    {/* Symptoms Analysis */}
                    <div>
                      <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 flex items-center gap-2">
                        <Activity className="w-4 h-4 text-emerald-600" />
                        Pathological Assessment
                      </h4>
                      <p className="text-sm text-slate-700 bg-slate-50 p-3.5 rounded-xl border border-slate-200/80 leading-relaxed">
                        {activeDiagnosis.symptoms_analysis}
                      </p>
                    </div>

                    {/* Immediate Action Plan */}
                    {activeDiagnosis.immediate_action_plan && (
                      <div>
                        <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                          Immediate Intervention Protocol
                        </h4>
                        <div className="space-y-2">
                          {(Array.isArray(activeDiagnosis.immediate_action_plan)
                            ? activeDiagnosis.immediate_action_plan
                            : JSON.parse(activeDiagnosis.immediate_action_plan || '[]')
                          ).map((action, idx) => (
                            <div
                              key={idx}
                              className="flex items-start gap-3 p-3 bg-emerald-50/50 rounded-xl border border-emerald-100 text-sm text-slate-800"
                            >
                              <span className="flex-shrink-0 w-5 h-5 rounded-full bg-emerald-600 text-white text-xs font-bold flex items-center justify-center mt-0.5">
                                {idx + 1}
                              </span>
                              <span>{action}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Treatments: Organic vs Chemical */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Organic */}
                      <div className="p-4 rounded-xl bg-emerald-50/60 border border-emerald-200">
                        <div className="flex items-center gap-2 text-emerald-900 font-semibold text-sm mb-2">
                          <Sprout className="w-4 h-4 text-emerald-700" />
                          <span>Biological & Organic Control</span>
                        </div>
                        <p className="text-xs text-emerald-950 leading-relaxed">
                          {activeDiagnosis.organic_treatment || 'Apply neem kernel extract (5%) or bio-fungicide Bacillus subtilis spray.'}
                        </p>
                      </div>

                      {/* Chemical */}
                      <div className="p-4 rounded-xl bg-blue-50/60 border border-blue-200">
                        <div className="flex items-center gap-2 text-blue-900 font-semibold text-sm mb-2">
                          <Droplets className="w-4 h-4 text-blue-700" />
                          <span>Targeted Chemical Remedy</span>
                        </div>
                        <p className="text-xs text-blue-950 leading-relaxed">
                          {activeDiagnosis.chemical_treatment || 'Apply calibrated contact fungicide or broad-spectrum copper oxychloride as prescribed.'}
                        </p>
                      </div>
                    </div>

                    {/* Preventive Measures */}
                    {activeDiagnosis.preventive_measures && (
                      <div>
                        <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 flex items-center gap-2">
                          <ShieldCheck className="w-4 h-4 text-blue-600" />
                          Long-term Preventive Agronomy
                        </h4>
                        <ul className="text-xs text-slate-600 space-y-1.5 list-disc list-inside bg-slate-50 p-3 rounded-xl border border-slate-200">
                          {(Array.isArray(activeDiagnosis.preventive_measures)
                            ? activeDiagnosis.preventive_measures
                            : JSON.parse(activeDiagnosis.preventive_measures || '[]')
                          ).map((prev, idx) => (
                            <li key={idx}>{prev}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Disclaimer */}
                    <div className="text-[11px] text-slate-500 border-t border-slate-100 pt-3 flex items-center gap-2">
                      <Info className="w-3.5 h-3.5 flex-shrink-0 text-slate-400" />
                      <span>{activeDiagnosis.disclaimer}</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-white rounded-2xl p-12 text-center border border-slate-200">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                    <HeartPulse className="w-8 h-8" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 mb-1">Ready for Crop Diagnosis</h3>
                  <p className="text-sm text-slate-500 max-w-sm mx-auto mb-6">
                    Select a preset scenario on the left or enter field symptoms to receive a calibrated AI treatment advisory.
                  </p>
                  <button
                    onClick={() => handleDiagnose()}
                    className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-sm font-semibold hover:bg-emerald-700 transition"
                  >
                    Run Sample Tomato Diagnosis
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 2: FARMS & FIELDS */}
        {/* ========================================================================= */}
        {activeTab === 'farms' && (
          <div className="space-y-6">
            {/* Action Bar */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
              <div>
                <h2 className="text-lg font-bold text-slate-900">Farm & Crop Inventory</h2>
                <p className="text-xs text-slate-500">
                  Manage registered plots, soil baselines, and active field crop statuses
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowAddFarm(true)}
                  className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  <span>Register Farm</span>
                </button>
                <button
                  onClick={() => setShowAddCrop(true)}
                  className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-sm shadow-emerald-600/20"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Crop</span>
                </button>
              </div>
            </div>

            {/* Farm Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {farms.map((farm) => (
                <div key={farm.id} className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-xs">
                        🌾
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-900 text-sm">{farm.name}</h3>
                        <p className="text-xs text-slate-500 flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-slate-400" />
                          {farm.location || 'Pune, India'}
                        </p>
                      </div>
                    </div>
                    <span className="text-xs font-mono font-semibold px-2 py-0.5 bg-slate-100 rounded-md text-slate-600">
                      {farm.total_area_acres} Acres
                    </span>
                  </div>

                  <div className="pt-3 border-t border-slate-100 text-xs text-slate-600 space-y-1.5">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Soil Profile:</span>
                      <span className="font-medium text-slate-800">{farm.soil_type}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Registered ID:</span>
                      <span className="font-mono text-[10px] text-slate-500">{farm.id?.slice(0, 13)}...</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Crop Table */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="p-4 border-b border-slate-100 flex items-center justify-between">
                <h3 className="font-bold text-sm text-slate-900">Active Crop Plantings</h3>
                <span className="text-xs text-slate-500">{crops.length} Plantings Monitored</span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-600 uppercase font-semibold border-b border-slate-200">
                    <tr>
                      <th className="px-4 py-3">Crop Name</th>
                      <th className="px-4 py-3">Variety</th>
                      <th className="px-4 py-3">Stage</th>
                      <th className="px-4 py-3">Health Status</th>
                      <th className="px-4 py-3">Planted Date</th>
                      <th className="px-4 py-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {crops.map((c) => (
                      <tr key={c.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="px-4 py-3 font-semibold text-slate-900 flex items-center gap-2">
                          <Sprout className="w-4 h-4 text-emerald-600" />
                          {c.crop_name}
                        </td>
                        <td className="px-4 py-3 text-slate-600">{c.variety || 'Hybrid'}</td>
                        <td className="px-4 py-3 text-slate-700">{c.stage || 'Vegetative'}</td>
                        <td className="px-4 py-3">{getStatusBadge(c.status)}</td>
                        <td className="px-4 py-3 text-slate-500 font-mono text-[11px]">
                          {c.planting_date ? new Date(c.planting_date).toLocaleDateString() : 'Active'}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <button
                            onClick={() => {
                              setFormData({
                                ...formData,
                                crop_name: c.crop_name,
                                stage: c.stage || 'Flowering'
                              });
                              setActiveTab('diagnose');
                            }}
                            className="text-emerald-600 hover:text-emerald-800 font-semibold"
                          >
                            Diagnose →
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 3: ADVISORY HISTORY */}
        {/* ========================================================================= */}
        {activeTab === 'history' && (
          <div className="space-y-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-slate-900">Historical AI Advisories</h2>
                <p className="text-xs text-slate-500">
                  Audit trail of all diagnostics generated by Google Gemini agronomist
                </p>
              </div>
              <span className="text-xs px-3 py-1 bg-emerald-50 text-emerald-700 font-semibold rounded-full border border-emerald-200">
                {advisories.length} Records Persisted
              </span>
            </div>

            <div className="grid grid-cols-1 gap-4">
              {advisories.map((item) => (
                <div
                  key={item.id}
                  onClick={() => {
                    setActiveDiagnosis(item);
                    setActiveTab('diagnose');
                  }}
                  className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:border-emerald-500 hover:shadow-md transition cursor-pointer flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 text-sm">{item.disease_identified}</span>
                      {getSeverityBadge(item.severity)}
                    </div>
                    <p className="text-xs text-slate-500 line-clamp-1">
                      Target: <span className="font-medium text-slate-700">{item.crop_name}</span> &bull; Query: &ldquo;{item.query_text}&rdquo;
                    </p>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-slate-400 font-mono">
                    <span>{new Date(item.created_at).toLocaleDateString()}</span>
                    <ChevronRight className="w-4 h-4 text-slate-400" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 4: ARCHITECTURE & DATABASE SPEC */}
        {/* ========================================================================= */}
        {activeTab === 'architecture' && (
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
              <h2 className="text-lg font-bold text-slate-900 mb-2">CropPilotAI Architecture Specification</h2>
              <p className="text-xs text-slate-500 mb-6">
                Full-stack reference implementation built according to the Antigravity Workshop Guide (Pages 6–14).
              </p>

              {/* Architecture Stack Breakdown */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="text-emerald-600 mb-2">
                    <Sprout className="w-6 h-6" />
                  </div>
                  <h3 className="font-bold text-sm text-slate-900">1. Client Layer</h3>
                  <p className="text-xs text-slate-600 mt-1">React 18 + Vite + Tailwind CSS + Lucide Icons</p>
                  <div className="mt-2 text-[10px] text-emerald-700 font-mono">Deploy: Vercel</div>
                </div>

                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="text-blue-600 mb-2">
                    <Activity className="w-6 h-6" />
                  </div>
                  <h3 className="font-bold text-sm text-slate-900">2. Backend API</h3>
                  <p className="text-xs text-slate-600 mt-1">Node.js + Express.js + Zod Validation + CORS</p>
                  <div className="mt-2 text-[10px] text-blue-700 font-mono">Deploy: Render (Port 5000)</div>
                </div>

                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="text-emerald-700 mb-2">
                    <Database className="w-6 h-6" />
                  </div>
                  <h3 className="font-bold text-sm text-slate-900">3. Supabase Cloud</h3>
                  <p className="text-xs text-slate-600 mt-1">PostgreSQL + RLS + UUID Keys + JSONB</p>
                  <div className="mt-2 text-[10px] text-slate-700 font-mono">Project: upszactjcdplyyykkfof</div>
                </div>

                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="text-purple-600 mb-2">
                    <Cpu className="w-6 h-6" />
                  </div>
                  <h3 className="font-bold text-sm text-slate-900">4. Gemini AI Model</h3>
                  <p className="text-xs text-slate-600 mt-1">Gemini 3.8 Flash via Google AI Studio API</p>
                  <div className="mt-2 text-[10px] text-purple-700 font-mono">Status: Verified Online</div>
                </div>
              </div>

              {/* SQL Migration Script Box */}
              <div className="mt-6">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Database className="w-4 h-4 text-emerald-600" />
                    <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                      Supabase SQL Editor DDL (Copy & Run in Supabase)
                    </span>
                  </div>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(schemaSQL);
                      setCopiedSQL(true);
                      setTimeout(() => setCopiedSQL(false), 2000);
                    }}
                    className="text-xs px-3 py-1 rounded-md bg-emerald-600 text-white font-semibold hover:bg-emerald-700 transition"
                  >
                    {copiedSQL ? '✓ Copied SQL!' : 'Copy SQL Script'}
                  </button>
                </div>
                <pre className="p-4 rounded-xl bg-slate-900 text-emerald-400 font-mono text-xs overflow-x-auto border border-slate-800">
                  {schemaSQL}
                </pre>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Add Farm Modal */}
      {showAddFarm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl border border-slate-200">
            <h3 className="text-base font-bold text-slate-900 mb-1">Register New Farm</h3>
            <p className="text-xs text-slate-500 mb-4">Add agricultural property details</p>
            <form onSubmit={handleCreateFarm} className="space-y-3">
              <div>
                <label className="text-xs font-medium text-slate-700 mb-1 block">Farm Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Sahyadri Agro Estate"
                  value={newFarm.name}
                  onChange={(e) => setNewFarm({ ...newFarm, name: e.target.value })}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-700 mb-1 block">Location</label>
                <input
                  type="text"
                  placeholder="e.g. Nashik, Maharashtra"
                  value={newFarm.location}
                  onChange={(e) => setNewFarm({ ...newFarm, location: e.target.value })}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-slate-700 mb-1 block">Acreage</label>
                  <input
                    type="number"
                    step="0.5"
                    value={newFarm.total_area_acres}
                    onChange={(e) => setNewFarm({ ...newFarm, total_area_acres: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-700 mb-1 block">Soil Type</label>
                  <select
                    value={newFarm.soil_type}
                    onChange={(e) => setNewFarm({ ...newFarm, soil_type: e.target.value })}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="Loamy">Loamy</option>
                    <option value="Black Cotton Soil">Black Cotton Soil</option>
                    <option value="Alluvial Soil">Alluvial Soil</option>
                    <option value="Red Sandy Loam">Red Sandy Loam</option>
                  </select>
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAddFarm(false)}
                  className="px-3.5 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"
                >
                  Save Farm
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Crop Modal */}
      {showAddCrop && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl border border-slate-200">
            <h3 className="text-base font-bold text-slate-900 mb-1">Add Crop Planting</h3>
            <p className="text-xs text-slate-500 mb-4">Enroll crop in monitoring schedule</p>
            <form onSubmit={handleCreateCrop} className="space-y-3">
              <div>
                <label className="text-xs font-medium text-slate-700 mb-1 block">Crop Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Tomatoes, Cotton, Sugarcane"
                  value={newCrop.crop_name}
                  onChange={(e) => setNewCrop({ ...newCrop, crop_name: e.target.value })}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-700 mb-1 block">Variety</label>
                <input
                  type="text"
                  placeholder="e.g. Roma Hybrid, Bt-Cotton"
                  value={newCrop.variety}
                  onChange={(e) => setNewCrop({ ...newCrop, variety: e.target.value })}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-slate-700 mb-1 block">Stage</label>
                  <select
                    value={newCrop.stage}
                    onChange={(e) => setNewCrop({ ...newCrop, stage: e.target.value })}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="Seedling">Seedling</option>
                    <option value="Vegetative">Vegetative</option>
                    <option value="Flowering">Flowering</option>
                    <option value="Fruiting">Fruiting</option>
                    <option value="Maturity">Maturity</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-700 mb-1 block">Status</label>
                  <select
                    value={newCrop.status}
                    onChange={(e) => setNewCrop({ ...newCrop, status: e.target.value })}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="Healthy">Healthy</option>
                    <option value="Needs Attention">Needs Attention</option>
                    <option value="Under Treatment">Under Treatment</option>
                  </select>
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAddCrop(false)}
                  className="px-3.5 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"
                >
                  Save Crop
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-6 mt-12 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row justify-between items-center gap-2">
          <div className="flex items-center gap-2">
            <Sprout className="w-4 h-4 text-emerald-600" />
            <span className="font-semibold text-slate-700">CropPilotAI</span>
            <span>&bull; Hackathon Agriculture Edition</span>
          </div>
          <div>
            Powered by Google Antigravity &bull; Gemini 3.8 Flash &bull; Supabase Cloud
          </div>
        </div>
      </footer>
    </div>
  );
}
