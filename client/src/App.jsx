import React, { useState, useEffect, useRef } from 'react';
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
  Search,
  Printer,
  Upload,
  Image as ImageIcon,
  CloudRain,
  Wind,
  Thermometer,
  Globe,
  Check,
  Copy,
  AlertCircle,
  FileText
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

const TRANSLATIONS = {
  en: {
    appTitle: "CropPilotAI",
    subtitle: "AI-Powered Precision Agriculture & Crop Pathology Assistant",
    tabDiagnose: "AI Crop Diagnosis",
    tabFarms: "Farms & Fields",
    tabFertilizer: "NPK Calculator",
    tabHistory: "Advisory Logs",
    tabArchitecture: "Architecture & SQL",
    quickScenarios: "Quick Evaluation Scenarios",
    targetCrop: "Target Crop",
    growthStage: "Growth Stage",
    symptoms: "Observed Symptoms & Plant Condition",
    uploadPhoto: "Attach Crop Leaf Photo (Optional)",
    soilType: "Soil Type",
    microclimate: "Local Microclimate",
    btnDiagnose: "Generate Agronomic Advisory",
    diagnosing: "Diagnosing via Gemini AI...",
    printPrescription: "Print Official Prescription",
    weatherWidget: "Agro-Weather & Safe Spraying Forecast",
    safeWindow: "Safe Spraying Window: 6:30 AM - 10:00 AM (Low Wind & Mild UV)"
  },
  hi: {
    appTitle: "क्रॉपपायलट एआई (CropPilotAI)",
    subtitle: "एआई-संचालित सटीक कृषि और फसल रोग सलाहकार",
    tabDiagnose: "एआई फसल निदान",
    tabFarms: "खेत और फसलें",
    tabFertilizer: "उर्वरक (NPK) गणक",
    tabHistory: "परामर्श इतिहास",
    tabArchitecture: "वास्तुकला और एसक्यूएल",
    quickScenarios: "त्वरित परीक्षण परिदृश्य",
    targetCrop: "लक्षित फसल",
    growthStage: "फसल की अवस्था",
    symptoms: "लक्षण और पौधों की स्थिति",
    uploadPhoto: "पत्ती की फोटो अपलोड करें (वैकल्पिक)",
    soilType: "मिट्टी का प्रकार",
    microclimate: "स्थानीय मौसम",
    btnDiagnose: "कृषि परामर्श उत्पन्न करें",
    diagnosing: "जेमिनी एआई द्वारा विश्लेषण जारी...",
    printPrescription: "पर्चा (प्रिस्क्रिप्शन) प्रिंट करें",
    weatherWidget: "कृषि-मौसम और छिड़काव समय",
    safeWindow: "सुरक्षित छिड़काव समय: सुबह 6:30 - 10:00 (शांत हवा)"
  },
  mr: {
    appTitle: "क्रॉपपायलट एआय (CropPilotAI)",
    subtitle: "एआय-चालित अचूक शेती आणि पीक रोग सल्लागार",
    tabDiagnose: "एआय पीक निदान",
    tabFarms: "शेती आणि पिके",
    tabFertilizer: "खत (NPK) कॅल्क्युलेटर",
    tabHistory: "सल्लागार नोंदी",
    tabArchitecture: "रचना आणि एसक्यूएल",
    quickScenarios: "जलद चाचणी परिस्थिती",
    targetCrop: "पीक निवडा",
    growthStage: "वाढीचा टप्पा",
    symptoms: "दिसणारी लक्षणे आणि स्थिती",
    uploadPhoto: "पानांचा फोटो अपलोड करा (पर्यायी)",
    soilType: "मातीचा प्रकार",
    microclimate: "हवामान",
    btnDiagnose: "शेती सल्लागार अहवाल तयार करा",
    diagnosing: "जेमिनी एआय द्वारे तपासणी सुरू...",
    printPrescription: "औषधोपचार चिठ्ठी प्रिंट करा",
    weatherWidget: "शेती हवामान आणि फवारणी वेळ",
    safeWindow: "सुरक्षित फवारणी वेळ: सकाळी 6:30 - 10:00 (कमी वारा)"
  }
};

export default function App() {
  const [lang, setLang] = useState('en');
  const t = TRANSLATIONS[lang] || TRANSLATIONS.en;

  const [activeTab, setActiveTab] = useState('diagnose');
  const [healthStatus, setHealthStatus] = useState(null);
  const [farms, setFarms] = useState([]);
  const [fields, setFields] = useState([]);
  const [crops, setCrops] = useState([]);
  const [advisories, setAdvisories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [diagnosing, setDiagnosing] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successToast, setSuccessToast] = useState('');
  const [copiedSQL, setCopiedSQL] = useState(false);

  // Search & Filter in history
  const [historySearch, setHistorySearch] = useState('');
  const [historySeverityFilter, setHistorySeverityFilter] = useState('all');

  // Diagnosis Form State
  const [formData, setFormData] = useState({
    crop_name: 'Tomatoes',
    stage: 'Flowering',
    symptoms: 'Yellow leaf spots with concentric dark rings, lower foliage wilting and drying up',
    soil_type: 'Black Cotton Soil',
    weather: 'Humid & Overcast (28°C)'
  });
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [activeDiagnosis, setActiveDiagnosis] = useState(null);
  const fileInputRef = useRef(null);

  // NPK Calculator State
  const [npkInput, setNpkInput] = useState({
    crop: 'Tomatoes',
    acres: 2.5
  });

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

  const showToast = (msg) => {
    setSuccessToast(msg);
    setTimeout(() => setSuccessToast(''), 3500);
  };

  // Evaluation Presets
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

  const handleImageFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setErrorMsg('Leaf photo should be less than 5MB');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64Data = reader.result.split(',')[1];
        setImagePreview(reader.result);
        setSelectedImage({
          data: base64Data,
          mimeType: file.type || 'image/jpeg'
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  async function handleDiagnose(e) {
    if (e) e.preventDefault();
    if (!formData.crop_name || !formData.symptoms) {
      setErrorMsg('Please specify both crop name and observed symptoms.');
      return;
    }

    setDiagnosing(true);
    setErrorMsg('');

    try {
      const payload = {
        ...formData,
        image_data: selectedImage || undefined
      };
      const result = await diagnoseCrop(payload);
      setActiveDiagnosis(result);
      setAdvisories(prev => [result, ...prev]);
      showToast(`Advisory generated successfully for ${formData.crop_name}!`);

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
      showToast('New agricultural farm registered successfully in Supabase!');
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
      showToast('New crop planting recorded successfully in Supabase!');
    } catch (err) {
      alert('Failed to create crop: ' + err.message);
    }
  }

  const handlePrintPrescription = () => {
    window.print();
  };

  // NPK calculation logic
  const calculateNPK = () => {
    const acres = parseFloat(npkInput.acres) || 1;
    let nPerAcre = 50;
    let pPerAcre = 25;
    let kPerAcre = 20;

    switch (npkInput.crop.toLowerCase()) {
      case 'tomatoes':
        nPerAcre = 60; pPerAcre = 35; kPerAcre = 40;
        break;
      case 'wheat':
        nPerAcre = 50; pPerAcre = 25; kPerAcre = 16;
        break;
      case 'cotton':
        nPerAcre = 45; pPerAcre = 20; kPerAcre = 20;
        break;
      case 'potato':
        nPerAcre = 70; pPerAcre = 40; kPerAcre = 50;
        break;
      case 'sugarcane':
        nPerAcre = 100; pPerAcre = 50; kPerAcre = 60;
        break;
      default:
        nPerAcre = 40; pPerAcre = 20; kPerAcre = 20;
    }

    const totalN = Math.round(nPerAcre * acres);
    const totalP = Math.round(pPerAcre * acres);
    const totalK = Math.round(kPerAcre * acres);

    // DAP (18-46-0) fulfills P requirement
    const dapKg = Math.round(totalP / 0.46);
    const nFromDAP = Math.round(dapKg * 0.18);
    // Urea (46-0-0) fulfills remaining N
    const remainingN = Math.max(0, totalN - nFromDAP);
    const ureaKg = Math.round(remainingN / 0.46);
    // MOP (0-0-60) fulfills K requirement
    const mopKg = Math.round(totalK / 0.60);

    return {
      totalN, totalP, totalK,
      ureaKg, ureaBags: (ureaKg / 45).toFixed(1),
      dapKg, dapBags: (dapKg / 50).toFixed(1),
      mopKg, mopBags: (mopKg / 50).toFixed(1)
    };
  };

  const npkResult = calculateNPK();

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

  const filteredAdvisories = advisories.filter(item => {
    const matchesSearch = item.disease_identified?.toLowerCase().includes(historySearch.toLowerCase()) ||
                          item.crop_name?.toLowerCase().includes(historySearch.toLowerCase()) ||
                          item.query_text?.toLowerCase().includes(historySearch.toLowerCase());
    const matchesSeverity = historySeverityFilter === 'all' || item.severity?.toLowerCase() === historySeverityFilter.toLowerCase();
    return matchesSearch && matchesSeverity;
  });

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      {/* Toast Notification */}
      {successToast && (
        <div className="fixed bottom-5 right-5 z-50 bg-emerald-800 text-white px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2 border border-emerald-600 animate-bounce">
          <CheckCircle2 className="w-5 h-5 text-emerald-300" />
          <span className="text-sm font-medium">{successToast}</span>
        </div>
      )}

      {/* Top Navbar */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-sm print:hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
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
                    v1.0 Pro
                  </span>
                </div>
                <p className="text-xs text-slate-500 hidden sm:block">
                  {t.subtitle}
                </p>
              </div>
            </div>

            {/* Language & System Badges */}
            <div className="flex items-center gap-2 sm:gap-3">
              {/* Language Switcher */}
              <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg border border-slate-200 text-xs">
                <Globe className="w-3.5 h-3.5 text-slate-500 ml-1" />
                <button
                  onClick={() => setLang('en')}
                  className={`px-2 py-0.5 rounded-md font-semibold transition ${lang === 'en' ? 'bg-white text-emerald-700 shadow-xs' : 'text-slate-600'}`}
                >
                  EN
                </button>
                <button
                  onClick={() => setLang('hi')}
                  className={`px-2 py-0.5 rounded-md font-semibold transition ${lang === 'hi' ? 'bg-white text-emerald-700 shadow-xs' : 'text-slate-600'}`}
                >
                  हिन्दी
                </button>
                <button
                  onClick={() => setLang('mr')}
                  className={`px-2 py-0.5 rounded-md font-semibold transition ${lang === 'mr' ? 'bg-white text-emerald-700 shadow-xs' : 'text-slate-600'}`}
                >
                  मराठी
                </button>
              </div>

              {/* Status Badges */}
              <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 bg-slate-100 rounded-lg text-xs font-medium text-slate-600 border border-slate-200">
                <Cpu className="w-3.5 h-3.5 text-blue-600" />
                <span>Gemini 3.8 Flash</span>
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              </div>

              <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 bg-slate-100 rounded-lg text-xs font-medium text-slate-600 border border-slate-200">
                <Database className="w-3.5 h-3.5 text-emerald-600" />
                <span>Supabase Live</span>
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              </div>

              <button
                onClick={loadAllData}
                disabled={loading}
                className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors border border-slate-200"
                title="Refresh Live Data"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-emerald-600' : ''}`} />
              </button>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="flex space-x-1 sm:space-x-6 -mb-px overflow-x-auto text-sm font-medium">
            <button
              onClick={() => setActiveTab('diagnose')}
              className={`py-3 px-3 sm:px-1 border-b-2 flex items-center gap-2 whitespace-nowrap transition-colors ${
                activeTab === 'diagnose'
                  ? 'border-emerald-600 text-emerald-700 font-semibold'
                  : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
              }`}
            >
              <HeartPulse className="w-4 h-4" />
              <span>{t.tabDiagnose}</span>
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
              <span>{t.tabFarms}</span>
              <span className="ml-1 bg-slate-100 text-slate-600 text-xs px-2 py-0.5 rounded-full font-mono">
                {crops.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('fertilizer')}
              className={`py-3 px-3 sm:px-1 border-b-2 flex items-center gap-2 whitespace-nowrap transition-colors ${
                activeTab === 'fertilizer'
                  ? 'border-emerald-600 text-emerald-700 font-semibold'
                  : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
              }`}
            >
              <Droplets className="w-4 h-4" />
              <span>{t.tabFertilizer}</span>
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
              <span>{t.tabHistory}</span>
              <span className="ml-1 bg-slate-100 text-slate-600 text-xs px-2 py-0.5 rounded-full font-mono">
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
              <span>{t.tabArchitecture}</span>
            </button>
          </nav>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Error Alert */}
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
          <div className="space-y-6">
            {/* Agro-Weather & Spraying Window Banner */}
            <div className="bg-gradient-to-r from-emerald-900 via-teal-900 to-slate-900 rounded-2xl p-4 sm:p-5 text-white shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4 print:hidden">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-emerald-400">
                  <CloudRain className="w-4 h-4" />
                  <span>{t.weatherWidget}</span>
                </div>
                <h3 className="font-bold text-base sm:text-lg">Pune Agricultural Weather Grid</h3>
                <p className="text-xs text-slate-300">
                  {t.safeWindow}
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-4 text-xs font-mono">
                <div className="flex items-center gap-1.5 bg-white/10 px-3 py-1.5 rounded-xl border border-white/10">
                  <Thermometer className="w-4 h-4 text-amber-400" />
                  <span>28.5°C</span>
                </div>
                <div className="flex items-center gap-1.5 bg-white/10 px-3 py-1.5 rounded-xl border border-white/10">
                  <Droplets className="w-4 h-4 text-blue-400" />
                  <span>64% Humidity</span>
                </div>
                <div className="flex items-center gap-1.5 bg-white/10 px-3 py-1.5 rounded-xl border border-white/10">
                  <Wind className="w-4 h-4 text-teal-300" />
                  <span>9 km/h Wind</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start print:block">
              {/* Left Column: Input Form (5 cols) */}
              <div className="lg:col-span-5 bg-white rounded-2xl p-6 shadow-sm border border-slate-200 print:hidden">
                <div className="flex items-center gap-2 pb-4 mb-4 border-b border-slate-100">
                  <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-slate-900">Crop Pathology Doctor</h2>
                    <p className="text-xs text-slate-500">Provide observed crop conditions or attach a leaf image</p>
                  </div>
                </div>

                {/* Evaluation Scenarios */}
                <div className="mb-5">
                  <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2 block">
                    {t.quickScenarios}:
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
                      <label className="block text-xs font-medium text-slate-700 mb-1">{t.targetCrop}</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Tomatoes, Cotton, Wheat"
                        value={formData.crop_name}
                        onChange={(e) => setFormData({ ...formData, crop_name: e.target.value })}
                        className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">{t.growthStage}</label>
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
                      {t.symptoms}
                    </label>
                    <textarea
                      rows={3}
                      required
                      placeholder="Describe color changes, leaf spotting, pest presence, wilting, or lesions..."
                      value={formData.symptoms}
                      onChange={(e) => setFormData({ ...formData, symptoms: e.target.value })}
                      className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white"
                    />
                  </div>

                  {/* Leaf Photo Upload Box */}
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      {t.uploadPhoto}
                    </label>
                    <div className="border-2 border-dashed border-slate-200 hover:border-emerald-400 rounded-xl p-3 text-center transition bg-slate-50/50">
                      {imagePreview ? (
                        <div className="relative inline-block">
                          <img
                            src={imagePreview}
                            alt="Crop leaf preview"
                            className="max-h-36 rounded-lg shadow-sm border border-slate-200 mx-auto"
                          />
                          <button
                            type="button"
                            onClick={removeImage}
                            className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs shadow-md hover:bg-red-700"
                            title="Remove Photo"
                          >
                            &times;
                          </button>
                        </div>
                      ) : (
                        <div>
                          <input
                            type="file"
                            accept="image/*"
                            ref={fileInputRef}
                            onChange={handleImageFileChange}
                            className="hidden"
                            id="leaf-photo-input"
                          />
                          <label
                            htmlFor="leaf-photo-input"
                            className="cursor-pointer flex flex-col items-center gap-1.5 text-xs text-slate-500 hover:text-emerald-700"
                          >
                            <ImageIcon className="w-6 h-6 text-slate-400" />
                            <span>Click to upload leaf / pest photo (JPEG/PNG)</span>
                          </label>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">{t.soilType}</label>
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
                      <label className="block text-xs font-medium text-slate-700 mb-1">{t.microclimate}</label>
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
                        <span>{t.diagnosing}</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4" />
                        <span>{t.btnDiagnose}</span>
                      </>
                    )}
                  </button>
                </form>
              </div>

              {/* Right Column: Diagnosis Results (7 cols) */}
              <div id="diagnosis-results" className="lg:col-span-7 space-y-6 print:w-full print:m-0">
                {activeDiagnosis ? (
                  <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden printable-card">
                    {/* Header */}
                    <div className="p-6 bg-gradient-to-br from-slate-900 to-slate-800 text-white">
                      <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-white/10 text-emerald-300 uppercase tracking-wider">
                            {activeDiagnosis.crop_name} Diagnostic Card
                          </span>
                          {getSeverityBadge(activeDiagnosis.severity)}
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-mono bg-emerald-950/80 px-2.5 py-1 rounded-md border border-emerald-800">
                            <ShieldCheck className="w-3.5 h-3.5" />
                            <span>Confidence: {Math.round((activeDiagnosis.confidence || 0.95) * 100)}%</span>
                          </div>
                          <button
                            onClick={handlePrintPrescription}
                            className="text-xs bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1 rounded-md flex items-center gap-1.5 font-semibold transition print:hidden"
                            title="Print Prescription for Farmer"
                          >
                            <Printer className="w-3.5 h-3.5" />
                            <span>Print</span>
                          </button>
                        </div>
                      </div>

                      <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-white mb-2">
                        {activeDiagnosis.disease_identified}
                      </h3>
                      <p className="text-xs text-slate-300 italic">
                        Query: &ldquo;{activeDiagnosis.query_text}&rdquo;
                      </p>
                    </div>

                    {/* Prescription Body */}
                    <div className="p-6 space-y-6">
                      {/* Physiological Analysis */}
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
                            Immediate Field Intervention Protocol
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

                      {/* Organic vs Chemical Remedies */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Organic */}
                        <div className="p-4 rounded-xl bg-emerald-50/60 border border-emerald-200">
                          <div className="flex items-center gap-2 text-emerald-900 font-semibold text-sm mb-2">
                            <Sprout className="w-4 h-4 text-emerald-700" />
                            <span>Biological & Organic Remedy</span>
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
                            {activeDiagnosis.chemical_treatment || 'Apply contact fungicide or broad-spectrum copper oxychloride as prescribed.'}
                          </p>
                        </div>
                      </div>

                      {/* Preventive Measures */}
                      {activeDiagnosis.preventive_measures && (
                        <div>
                          <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 flex items-center gap-2">
                            <ShieldCheck className="w-4 h-4 text-blue-600" />
                            Long-Term Preventive Agronomy
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
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 2: FARMS & FIELDS */}
        {/* ========================================================================= */}
        {activeTab === 'farms' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
              <div>
                <h2 className="text-lg font-bold text-slate-900">Farm & Crop Inventory (Supabase Cloud)</h2>
                <p className="text-xs text-slate-500">
                  Manage registered plots, acreage, and active crop health records
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

            {/* Farm Cards */}
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
                      <span className="text-slate-400">Database UUID:</span>
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
                <span className="text-xs text-slate-500">{crops.length} Plantings Tracked</span>
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
                        <td className="px-4 py-3 text-slate-600">{c.variety || 'Standard'}</td>
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
        {/* TAB 3: NPK NUTRIENT CALCULATOR */}
        {/* ========================================================================= */}
        {activeTab === 'fertilizer' && (
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2.5 bg-emerald-50 text-emerald-700 rounded-xl">
                  <Droplets className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-900">Soil Nutrient & Fertilizer Dosage Calculator</h2>
                  <p className="text-xs text-slate-500">
                    ICAR-calibrated Nitrogen (N), Phosphorus (P), and Potassium (K) fertilizer recommendation
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start mt-6">
                {/* Inputs */}
                <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200 space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Target Crop</label>
                    <select
                      value={npkInput.crop}
                      onChange={(e) => setNpkInput({ ...npkInput, crop: e.target.value })}
                      className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 bg-white"
                    >
                      <option value="Tomatoes">Tomatoes</option>
                      <option value="Wheat">Wheat</option>
                      <option value="Cotton">Cotton</option>
                      <option value="Potato">Potato</option>
                      <option value="Sugarcane">Sugarcane</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Plot Area (Acres)</label>
                    <input
                      type="number"
                      step="0.5"
                      min="0.5"
                      value={npkInput.acres}
                      onChange={(e) => setNpkInput({ ...npkInput, acres: e.target.value })}
                      className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 bg-white"
                    />
                  </div>

                  <div className="p-3 bg-white rounded-xl border border-slate-200 text-xs text-slate-600 space-y-1">
                    <div className="flex justify-between font-mono">
                      <span>Total Nitrogen (N):</span>
                      <span className="font-bold text-slate-900">{npkResult.totalN} kg</span>
                    </div>
                    <div className="flex justify-between font-mono">
                      <span>Total Phosphate (P₂O₅):</span>
                      <span className="font-bold text-slate-900">{npkResult.totalP} kg</span>
                    </div>
                    <div className="flex justify-between font-mono">
                      <span>Total Potash (K₂O):</span>
                      <span className="font-bold text-slate-900">{npkResult.totalK} kg</span>
                    </div>
                  </div>
                </div>

                {/* Dosage Cards */}
                <div className="space-y-4">
                  <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-sm text-emerald-950">1. Urea (46% Nitrogen)</span>
                      <span className="text-xs font-mono font-bold bg-emerald-200 text-emerald-900 px-2 py-0.5 rounded">
                        {npkResult.ureaBags} Bags (45 kg)
                      </span>
                    </div>
                    <p className="text-xs text-emerald-800">
                      Total: {npkResult.ureaKg} kg. Apply 1/3 at sowing, 1/3 at tillering, and 1/3 at flower initiation.
                    </p>
                  </div>

                  <div className="p-4 bg-blue-50 rounded-xl border border-blue-200">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-sm text-blue-950">2. DAP (18-46-0)</span>
                      <span className="text-xs font-mono font-bold bg-blue-200 text-blue-900 px-2 py-0.5 rounded">
                        {npkResult.dapBags} Bags (50 kg)
                      </span>
                    </div>
                    <p className="text-xs text-blue-800">
                      Total: {npkResult.dapKg} kg. Apply 100% as basal dose during field preparation / transplanting.
                    </p>
                  </div>

                  <div className="p-4 bg-amber-50 rounded-xl border border-amber-200">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-sm text-amber-950">3. MOP (Muriate of Potash 60% K₂O)</span>
                      <span className="text-xs font-mono font-bold bg-amber-200 text-amber-900 px-2 py-0.5 rounded">
                        {npkResult.mopBags} Bags (50 kg)
                      </span>
                    </div>
                    <p className="text-xs text-amber-800">
                      Total: {npkResult.mopKg} kg. Promotes fruit sizing, stress resistance, and cell wall strength.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 4: ADVISORY HISTORY */}
        {/* ========================================================================= */}
        {activeTab === 'history' && (
          <div className="space-y-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h2 className="text-lg font-bold text-slate-900">Historical AI Advisories</h2>
                <p className="text-xs text-slate-500">
                  Audit trail of all diagnostics generated by Google Gemini agronomist
                </p>
              </div>

              {/* Search & Filter */}
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <div className="relative flex-1 sm:w-64">
                  <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search disease or crop..."
                    value={historySearch}
                    onChange={(e) => setHistorySearch(e.target.value)}
                    className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-slate-300 focus:ring-2 focus:ring-emerald-500 bg-white"
                  />
                </div>

                <select
                  value={historySeverityFilter}
                  onChange={(e) => setHistorySeverityFilter(e.target.value)}
                  className="px-2.5 py-1.5 text-xs rounded-lg border border-slate-300 bg-white"
                >
                  <option value="all">All Severities</option>
                  <option value="critical">Critical</option>
                  <option value="high">High</option>
                  <option value="moderate">Moderate</option>
                  <option value="low">Low</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4">
              {filteredAdvisories.map((item) => (
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
        {/* TAB 5: ARCHITECTURE & DATABASE SPEC */}
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
                  <div className="mt-2 text-[10px] text-slate-700 font-mono">Status: Connected & Migrated</div>
                </div>

                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="text-purple-600 mb-2">
                    <Cpu className="w-6 h-6" />
                  </div>
                  <h3 className="font-bold text-sm text-slate-900">4. Gemini AI Model</h3>
                  <p className="text-xs text-slate-600 mt-1">Gemini 3.8 Flash via Google AI Studio API</p>
                  <div className="mt-2 text-[10px] text-purple-700 font-mono">Multi-model Resilient Fallback</div>
                </div>
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
            <p className="text-xs text-slate-500 mb-4">Add agricultural property details into Supabase</p>
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
            <p className="text-xs text-slate-500 mb-4">Enroll crop in monitoring schedule in Supabase</p>
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
      <footer className="bg-white border-t border-slate-200 py-6 mt-12 text-center text-xs text-slate-500 print:hidden">
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
