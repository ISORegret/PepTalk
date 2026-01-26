import React, { useState, useEffect, useRef } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Scale, Syringe, Plus, TrendingDown, TrendingUp, Calendar, Trash2, Edit2, X, Activity, Calculator, LayoutDashboard, Wrench, ChevronDown, Bell, Ruler, Camera, Target, Clock, CheckCircle, AlertCircle } from 'lucide-react';

// Comprehensive peptide/medication list
const MEDICATIONS = [
  { name: 'Semaglutide', category: 'GLP-1', color: '#10b981', defaultSchedule: 7 },
  { name: 'Tirzepatide', category: 'GLP-1/GIP', color: '#14b8a6', defaultSchedule: 7 },
  { name: 'Liraglutide', category: 'GLP-1', color: '#059669', defaultSchedule: 1 },
  { name: 'Dulaglutide', category: 'GLP-1', color: '#0d9488', defaultSchedule: 7 },
  { name: 'Retatrutide', category: 'Triple Agonist', color: '#8b5cf6', defaultSchedule: 7 },
  { name: 'Testosterone Cypionate', category: 'Hormone', color: '#3b82f6', defaultSchedule: 7 },
  { name: 'Testosterone Enanthate', category: 'Hormone', color: '#2563eb', defaultSchedule: 7 },
  { name: 'HCG', category: 'Hormone', color: '#6366f1', defaultSchedule: 3 },
  { name: 'BPC-157', category: 'Peptide', color: '#f59e0b', defaultSchedule: 1 },
  { name: 'TB-500', category: 'Peptide', color: '#d97706', defaultSchedule: 3 },
  { name: 'Ipamorelin', category: 'Peptide', color: '#fbbf24', defaultSchedule: 1 },
  { name: 'CJC-1295', category: 'Peptide', color: '#f97316', defaultSchedule: 1 },
  { name: 'Tesamorelin', category: 'Peptide', color: '#ea580c', defaultSchedule: 1 },
  { name: 'Sermorelin', category: 'Peptide', color: '#fb923c', defaultSchedule: 1 },
  { name: 'MK-677', category: 'Peptide', color: '#c2410c', defaultSchedule: 1 },
  { name: 'AOD-9604', category: 'Peptide', color: '#ec4899', defaultSchedule: 1 },
  { name: 'Melanotan II', category: 'Peptide', color: '#db2777', defaultSchedule: 7 },
  { name: 'PT-141', category: 'Peptide', color: '#be185d', defaultSchedule: 0 },
  { name: 'Other', category: 'Other', color: '#6b7280', defaultSchedule: 7 }
];

const INJECTION_SITES = ['Stomach', 'Thigh (Left)', 'Thigh (Right)', 'Arm (Left)', 'Arm (Right)', 'Glute (Left)', 'Glute (Right)', 'Subcutaneous', 'Intramuscular'];
const SIDE_EFFECTS = ['Nausea', 'Fatigue', 'Headache', 'Injection Site Pain', 'Diarrhea', 'Constipation', 'Dizziness', 'Appetite Loss', 'Acid Reflux', 'Vomiting', 'Insomnia', 'Bloating'];
const MEASUREMENT_TYPES = ['Neck', 'Chest', 'Waist', 'Hips', 'Bicep (L)', 'Bicep (R)', 'Thigh (L)', 'Thigh (R)', 'Calf (L)', 'Calf (R)'];

const HealthTracker = () => {
  const [activeTab, setActiveTab] = useState('summary');
  const [weightEntries, setWeightEntries] = useState([]);
  const [injectionEntries, setInjectionEntries] = useState([]);
  const [measurementEntries, setMeasurementEntries] = useState([]);
  const [progressPhotos, setProgressPhotos] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [titrationPlans, setTitrationPlans] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [userProfile, setUserProfile] = useState({ height: 70, goalWeight: 200 });
  const [timeRange, setTimeRange] = useState('all');
  const [activeToolSection, setActiveToolSection] = useState('calculator');
  
  // Weight form states
  const [weight, setWeight] = useState('');
  const [weightDate, setWeightDate] = useState(new Date().toISOString().split('T')[0]);
  const [editingWeight, setEditingWeight] = useState(null);
  
  // Injection form states
  const [injectionType, setInjectionType] = useState('Semaglutide');
  const [injectionDose, setInjectionDose] = useState('');
  const [injectionUnit, setInjectionUnit] = useState('mg');
  const [injectionDate, setInjectionDate] = useState(new Date().toISOString().split('T')[0]);
  const [injectionSite, setInjectionSite] = useState('Stomach');
  const [injectionNotes, setInjectionNotes] = useState('');
  const [selectedSideEffects, setSelectedSideEffects] = useState([]);
  const [editingInjection, setEditingInjection] = useState(null);
  const [showMedDropdown, setShowMedDropdown] = useState(false);
  const [medSearchTerm, setMedSearchTerm] = useState('');

  // Measurement form states
  const [measurementType, setMeasurementType] = useState('Waist');
  const [measurementValue, setMeasurementValue] = useState('');
  const [measurementDate, setMeasurementDate] = useState(new Date().toISOString().split('T')[0]);

  // Schedule form states
  const [scheduleMed, setScheduleMed] = useState('Semaglutide');
  const [scheduleFrequency, setScheduleFrequency] = useState(7);
  const [scheduleDay, setScheduleDay] = useState(0);

  // Titration form states
  const [titrationMed, setTitrationMed] = useState('Semaglutide');
  const [titrationSteps, setTitrationSteps] = useState([{ dose: '', weeks: 4, unit: 'mg' }]);

  // Calculator states
  const [calcConcentration, setCalcConcentration] = useState('');
  const [calcDesiredDose, setCalcDesiredDose] = useState('');
  const [calcDesiredUnit, setCalcDesiredUnit] = useState('mg');
  const [calcResult, setCalcResult] = useState(null);
  const [reconPeptideAmount, setReconPeptideAmount] = useState('');
  const [reconPeptideUnit, setReconPeptideUnit] = useState('mg');
  const [reconWaterAmount, setReconWaterAmount] = useState('');
  const [reconDesiredDose, setReconDesiredDose] = useState('');
  const [reconDesiredUnit, setReconDesiredUnit] = useState('mcg');
  const [reconResult, setReconResult] = useState(null);

  const photoInputRef = useRef(null);

  useEffect(() => { loadData(); }, []);

  const loadData = () => {
    setIsLoading(true);
    try {
      const weightData = localStorage.getItem('health-weight-entries');
      const injectionData = localStorage.getItem('health-injection-entries');
      const profileData = localStorage.getItem('health-user-profile');
      const measurementData = localStorage.getItem('health-measurements');
      const photoData = localStorage.getItem('health-photos');
      const scheduleData = localStorage.getItem('health-schedules');
      const titrationData = localStorage.getItem('health-titration');
      
      if (weightData) setWeightEntries(JSON.parse(weightData));
      if (injectionData) setInjectionEntries(JSON.parse(injectionData));
      if (profileData) setUserProfile(JSON.parse(profileData));
      if (measurementData) setMeasurementEntries(JSON.parse(measurementData));
      if (photoData) setProgressPhotos(JSON.parse(photoData));
      if (scheduleData) setSchedules(JSON.parse(scheduleData));
      if (titrationData) setTitrationPlans(JSON.parse(titrationData));
    } catch (error) {
      console.log('Loading data:', error);
    }
    setIsLoading(false);
  };

  const saveData = (key, data) => {
    try { localStorage.setItem(key, JSON.stringify(data)); } catch (error) { console.error('Error saving:', error); }
  };

  // Form reset functions
  const resetWeightForm = () => { setWeight(''); setWeightDate(new Date().toISOString().split('T')[0]); setEditingWeight(null); setShowAddForm(false); };
  const resetInjectionForm = () => { setInjectionType('Semaglutide'); setInjectionDose(''); setInjectionUnit('mg'); setInjectionDate(new Date().toISOString().split('T')[0]); setInjectionSite('Stomach'); setInjectionNotes(''); setSelectedSideEffects([]); setEditingInjection(null); setShowAddForm(false); setShowMedDropdown(false); setMedSearchTerm(''); };
  const resetMeasurementForm = () => { setMeasurementType('Waist'); setMeasurementValue(''); setMeasurementDate(new Date().toISOString().split('T')[0]); setShowAddForm(false); };

  // CRUD operations
  const addOrUpdateWeight = () => {
    if (!weight || isNaN(parseFloat(weight))) return;
    let updated = editingWeight 
      ? weightEntries.map(e => e.id === editingWeight.id ? { ...e, weight: parseFloat(weight), date: weightDate } : e)
      : [...weightEntries, { id: Date.now(), weight: parseFloat(weight), date: weightDate }];
    updated.sort((a, b) => new Date(a.date) - new Date(b.date));
    setWeightEntries(updated);
    saveData('health-weight-entries', updated);
    resetWeightForm();
  };

  const deleteWeight = (id) => {
    const updated = weightEntries.filter(e => e.id !== id);
    setWeightEntries(updated);
    saveData('health-weight-entries', updated);
  };

  const addOrUpdateInjection = () => {
    if (!injectionDose || isNaN(parseFloat(injectionDose))) return;
    const entryData = { type: injectionType, dose: parseFloat(injectionDose), unit: injectionUnit, date: injectionDate, site: injectionSite, notes: injectionNotes, sideEffects: selectedSideEffects };
    let updated = editingInjection 
      ? injectionEntries.map(e => e.id === editingInjection.id ? { ...e, ...entryData } : e)
      : [...injectionEntries, { id: Date.now(), ...entryData }];
    updated.sort((a, b) => new Date(b.date) - new Date(a.date));
    setInjectionEntries(updated);
    saveData('health-injection-entries', updated);
    resetInjectionForm();
  };

  const deleteInjection = (id) => {
    const updated = injectionEntries.filter(e => e.id !== id);
    setInjectionEntries(updated);
    saveData('health-injection-entries', updated);
  };

  const addMeasurement = () => {
    if (!measurementValue || isNaN(parseFloat(measurementValue))) return;
    const updated = [...measurementEntries, { id: Date.now(), type: measurementType, value: parseFloat(measurementValue), date: measurementDate }];
    updated.sort((a, b) => new Date(b.date) - new Date(a.date));
    setMeasurementEntries(updated);
    saveData('health-measurements', updated);
    resetMeasurementForm();
  };

  const deleteMeasurement = (id) => {
    const updated = measurementEntries.filter(e => e.id !== id);
    setMeasurementEntries(updated);
    saveData('health-measurements', updated);
  };

  const addSchedule = () => {
    const existing = schedules.find(s => s.medication === scheduleMed);
    let updated;
    if (existing) {
      updated = schedules.map(s => s.medication === scheduleMed ? { ...s, frequencyDays: scheduleFrequency, preferredDay: scheduleDay } : s);
    } else {
      updated = [...schedules, { id: Date.now(), medication: scheduleMed, frequencyDays: scheduleFrequency, preferredDay: scheduleDay }];
    }
    setSchedules(updated);
    saveData('health-schedules', updated);
  };

  const deleteSchedule = (id) => {
    const updated = schedules.filter(s => s.id !== id);
    setSchedules(updated);
    saveData('health-schedules', updated);
  };

  const saveTitrationPlan = () => {
    const validSteps = titrationSteps.filter(s => s.dose && !isNaN(parseFloat(s.dose)));
    if (validSteps.length === 0) return;
    const existing = titrationPlans.find(t => t.medication === titrationMed);
    let updated;
    if (existing) {
      updated = titrationPlans.map(t => t.medication === titrationMed ? { ...t, steps: validSteps, startDate: new Date().toISOString().split('T')[0] } : t);
    } else {
      updated = [...titrationPlans, { id: Date.now(), medication: titrationMed, steps: validSteps, startDate: new Date().toISOString().split('T')[0] }];
    }
    setTitrationPlans(updated);
    saveData('health-titration', updated);
    setTitrationSteps([{ dose: '', weeks: 4, unit: 'mg' }]);
  };

  const deleteTitrationPlan = (id) => {
    const updated = titrationPlans.filter(t => t.id !== id);
    setTitrationPlans(updated);
    saveData('health-titration', updated);
  };

  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      const updated = [...progressPhotos, { id: Date.now(), data: reader.result, date: new Date().toISOString().split('T')[0], note: '' }];
      setProgressPhotos(updated);
      saveData('health-photos', updated);
    };
    reader.readAsDataURL(file);
  };

  const deletePhoto = (id) => {
    const updated = progressPhotos.filter(p => p.id !== id);
    setProgressPhotos(updated);
    saveData('health-photos', updated);
  };

  const toggleSideEffect = (effect) => setSelectedSideEffects(prev => prev.includes(effect) ? prev.filter(e => e !== effect) : [...prev, effect]);
  const getMedicationColor = (type) => MEDICATIONS.find(m => m.name === type)?.color || '#6b7280';

  // Filtering and calculations
  const getFilteredData = (entries) => {
    if (timeRange === 'all') return entries;
    const months = { '1m': 1, '3m': 3, '6m': 6, '12m': 12 };
    const cutoffDate = new Date();
    cutoffDate.setMonth(cutoffDate.getMonth() - months[timeRange]);
    return entries.filter(e => new Date(e.date) >= cutoffDate);
  };

  const getDateRangeLabel = () => {
    const filtered = getFilteredData(weightEntries);
    if (filtered.length === 0) return '';
    const sorted = [...filtered].sort((a, b) => new Date(a.date) - new Date(b.date));
    const formatDate = (d) => new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    return `${formatDate(sorted[0].date)} – ${formatDate(sorted[sorted.length - 1].date)}`;
  };

  const calculateBMI = (weightLbs, heightInches) => heightInches ? ((weightLbs / (heightInches * heightInches)) * 703).toFixed(1) : null;
  const getBMICategory = (bmi) => {
    if (!bmi) return { label: '-', color: 'text-slate-400' };
    if (bmi < 18.5) return { label: 'Underweight', color: 'text-blue-400' };
    if (bmi < 25) return { label: 'Normal', color: 'text-emerald-400' };
    if (bmi < 30) return { label: 'Overweight', color: 'text-yellow-400' };
    return { label: 'Obese', color: 'text-red-400' };
  };

  const getWeightStats = () => {
    const filtered = getFilteredData(weightEntries);
    if (filtered.length === 0) return { current: '-', change: 0, trend: 'neutral', bmi: null, percentChange: 0, weeklyAvg: 0, toGoal: 0, estimatedGoalDate: null };
    const sorted = [...filtered].sort((a, b) => new Date(b.date) - new Date(a.date));
    const current = sorted[0].weight;
    const first = sorted[sorted.length - 1].weight;
    const change = current - first;
    const percentChange = (change / first) * 100;
    const bmi = calculateBMI(current, userProfile.height);
    const toGoal = current - (userProfile.goalWeight || 200);
    
    const firstDate = new Date(sorted[sorted.length - 1].date);
    const lastDate = new Date(sorted[0].date);
    const weeks = Math.max(1, (lastDate - firstDate) / (7 * 24 * 60 * 60 * 1000));
    const weeklyAvg = change / weeks;
    
    // Estimated goal date calculation
    let estimatedGoalDate = null;
    if (weeklyAvg < 0 && toGoal > 0) {
      const weeksToGoal = toGoal / Math.abs(weeklyAvg);
      const goalDate = new Date();
      goalDate.setDate(goalDate.getDate() + weeksToGoal * 7);
      estimatedGoalDate = goalDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    }
    
    return { current: current.toFixed(1), change: change.toFixed(1), trend: change < 0 ? 'down' : change > 0 ? 'up' : 'neutral', bmi, percentChange: percentChange.toFixed(1), weeklyAvg: weeklyAvg.toFixed(1), toGoal: toGoal.toFixed(1), estimatedGoalDate };
  };

  const getNextInjections = () => {
    const upcoming = [];
    schedules.forEach(schedule => {
      const lastInjection = injectionEntries.find(e => e.type === schedule.medication);
      let nextDate;
      if (lastInjection) {
        nextDate = new Date(lastInjection.date);
        nextDate.setDate(nextDate.getDate() + schedule.frequencyDays);
      } else {
        nextDate = new Date();
      }
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      nextDate.setHours(0, 0, 0, 0);
      const daysUntil = Math.ceil((nextDate - today) / (24 * 60 * 60 * 1000));
      upcoming.push({ medication: schedule.medication, nextDate, daysUntil, isOverdue: daysUntil < 0, isDueToday: daysUntil === 0 });
    });
    return upcoming.sort((a, b) => a.daysUntil - b.daysUntil);
  };

  const getCurrentTitrationDose = (plan) => {
    if (!plan.steps || plan.steps.length === 0) return null;
    const startDate = new Date(plan.startDate);
    const today = new Date();
    let weeksPassed = Math.floor((today - startDate) / (7 * 24 * 60 * 60 * 1000));
    let accumulatedWeeks = 0;
    for (let i = 0; i < plan.steps.length; i++) {
      accumulatedWeeks += plan.steps[i].weeks;
      if (weeksPassed < accumulatedWeeks) {
        const weeksIntoStep = weeksPassed - (accumulatedWeeks - plan.steps[i].weeks);
        const weeksRemaining = plan.steps[i].weeks - weeksIntoStep;
        return { step: i + 1, dose: plan.steps[i].dose, unit: plan.steps[i].unit, weeksRemaining, nextDose: plan.steps[i + 1] };
      }
    }
    const lastStep = plan.steps[plan.steps.length - 1];
    return { step: plan.steps.length, dose: lastStep.dose, unit: lastStep.unit, weeksRemaining: 0, nextDose: null, completed: true };
  };

  const getSummaryChartData = () => {
    const filteredWeights = getFilteredData(weightEntries);
    const filteredInjections = getFilteredData(injectionEntries);
    const allDates = new Set();
    filteredWeights.forEach(e => allDates.add(e.date));
    filteredInjections.forEach(e => allDates.add(e.date));
    const sortedDates = Array.from(allDates).sort((a, b) => new Date(a) - new Date(b));
    return sortedDates.map(date => {
      const weightEntry = filteredWeights.find(e => e.date === date);
      const dayInjections = filteredInjections.filter(e => e.date === date);
      const doseData = {};
      dayInjections.forEach(inj => {
        let doseInMg = inj.dose;
        if (inj.unit === 'mcg') doseInMg = inj.dose / 1000;
        doseData[inj.type] = doseInMg;
      });
      return { date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }), fullDate: date, weight: weightEntry?.weight || null, ...doseData };
    });
  };

  const getLoggedMedications = () => {
    const filteredInjections = getFilteredData(injectionEntries);
    return Array.from(new Set(filteredInjections.map(e => e.type)));
  };

  const getMeasurementStats = () => {
    const stats = {};
    MEASUREMENT_TYPES.forEach(type => {
      const typeEntries = measurementEntries.filter(e => e.type === type).sort((a, b) => new Date(b.date) - new Date(a.date));
      if (typeEntries.length > 0) {
        const current = typeEntries[0].value;
        const first = typeEntries[typeEntries.length - 1].value;
        stats[type] = { current, change: (current - first).toFixed(1), entries: typeEntries.length };
      }
    });
    return stats;
  };

  const calculateDose = () => {
    if (!calcConcentration || !calcDesiredDose) return;
    let desiredMg = parseFloat(calcDesiredDose);
    if (calcDesiredUnit === 'mcg') desiredMg = desiredMg / 1000;
    const volumeMl = desiredMg / parseFloat(calcConcentration);
    setCalcResult({ ml: volumeMl.toFixed(3), units: (volumeMl * 100).toFixed(1) });
  };

  const calculateReconstitution = () => {
    if (!reconPeptideAmount || !reconWaterAmount || !reconDesiredDose) return;
    let peptideMcg = parseFloat(reconPeptideAmount);
    if (reconPeptideUnit === 'mg') peptideMcg = peptideMcg * 1000;
    let desiredMcg = parseFloat(reconDesiredDose);
    if (reconDesiredUnit === 'mg') desiredMcg = desiredMcg * 1000;
    const concentrationMcgPerMl = peptideMcg / parseFloat(reconWaterAmount);
    const volumeMl = desiredMcg / concentrationMcgPerMl;
    setReconResult({ concentration: (concentrationMcgPerMl / 1000).toFixed(2), ml: volumeMl.toFixed(3), units: (volumeMl * 100).toFixed(1) });
  };

  const filteredMedications = MEDICATIONS.filter(med => med.name.toLowerCase().includes(medSearchTerm.toLowerCase()) || med.category.toLowerCase().includes(medSearchTerm.toLowerCase()));
  const groupedMedications = filteredMedications.reduce((acc, med) => { if (!acc[med.category]) acc[med.category] = []; acc[med.category].push(med); return acc; }, {});

  const stats = getWeightStats();
  const bmiCategory = getBMICategory(stats.bmi);
  const upcomingInjections = getNextInjections();
  const measurementStats = getMeasurementStats();

  if (isLoading) {
    return <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center"><div className="text-white text-lg">Loading...</div></div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 p-4 pb-24">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-white mb-1">Health Tracker</h1>
          <p className="text-slate-400 text-sm">Weight • Injections • Measurements • Tools</p>
        </div>

        {/* Upcoming Injections Alert */}
        {upcomingInjections.length > 0 && (upcomingInjections[0].isDueToday || upcomingInjections[0].isOverdue) && (
          <div className={`mb-4 p-3 rounded-xl flex items-center gap-3 ${upcomingInjections[0].isOverdue ? 'bg-red-500/20 border border-red-500/50' : 'bg-amber-500/20 border border-amber-500/50'}`}>
            <Bell className={`h-5 w-5 ${upcomingInjections[0].isOverdue ? 'text-red-400' : 'text-amber-400'}`} />
            <div className="flex-1">
              <div className={`font-medium ${upcomingInjections[0].isOverdue ? 'text-red-400' : 'text-amber-400'}`}>
                {upcomingInjections[0].isOverdue ? 'Injection Overdue' : 'Injection Due Today'}
              </div>
              <div className="text-white text-sm">{upcomingInjections[0].medication}</div>
            </div>
          </div>
        )}

        {/* Tab Navigation */}
        <div className="flex bg-slate-800 rounded-xl p-1 mb-6 overflow-x-auto">
          {[
            { id: 'summary', icon: LayoutDashboard, label: 'Summary' },
            { id: 'weight', icon: Scale, label: 'Weight' },
            { id: 'injections', icon: Syringe, label: 'Injections' },
            { id: 'measurements', icon: Ruler, label: 'Body' },
            { id: 'tools', icon: Wrench, label: 'Tools' }
          ].map(tab => (
            <button key={tab.id} onClick={() => { setActiveTab(tab.id); setShowAddForm(false); }}
              className={`flex-1 flex flex-col items-center justify-center gap-1 py-2 px-2 rounded-lg font-medium transition-all text-xs whitespace-nowrap ${activeTab === tab.id ? 'bg-violet-500 text-white' : 'text-slate-400 hover:text-white'}`}>
              <tab.icon className="h-4 w-4" />{tab.label}
            </button>
          ))}
        </div>

        {/* SUMMARY TAB */}
        {activeTab === 'summary' && (
          <div className="space-y-4">
            {/* Time Range Selector */}
            <div className="flex justify-between items-center bg-slate-800/50 rounded-xl p-1">
              {[{ id: '1m', label: '1 month' }, { id: '3m', label: '3 months' }, { id: '6m', label: '6 months' }, { id: '12m', label: '12 months' }, { id: 'all', label: 'All Time' }].map(range => (
                <button key={range.id} onClick={() => setTimeRange(range.id)}
                  className={`flex-1 py-2 px-1 text-xs font-medium rounded-lg transition-all ${timeRange === range.id ? 'text-cyan-400 border-b-2 border-cyan-400' : 'text-slate-400 hover:text-white'}`}>
                  {range.label}
                </button>
              ))}
            </div>

            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold text-white">Weight Change</h2>
              <span className="text-slate-400 text-sm">{getDateRangeLabel()}</span>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-slate-800/80 rounded-xl p-3">
                <div className="flex items-center gap-2 text-cyan-400 text-xs mb-1"><Scale className="h-3 w-3" />Total change</div>
                <div className={`text-xl font-bold ${parseFloat(stats.change) < 0 ? 'text-emerald-400' : parseFloat(stats.change) > 0 ? 'text-red-400' : 'text-white'}`}>{stats.change}<span className="text-sm font-normal text-slate-400">lbs</span></div>
              </div>
              <div className="bg-slate-800/80 rounded-xl p-3">
                <div className="flex items-center gap-2 text-cyan-400 text-xs mb-1"><Activity className="h-3 w-3" />Current BMI</div>
                <div className={`text-xl font-bold ${bmiCategory.color}`}>{stats.bmi || '-'}</div>
              </div>
              <div className="bg-slate-800/80 rounded-xl p-3">
                <div className="flex items-center gap-2 text-cyan-400 text-xs mb-1"><Scale className="h-3 w-3" />Weight</div>
                <div className="text-xl font-bold text-white">{stats.current}<span className="text-sm font-normal text-slate-400">lbs</span></div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="bg-slate-800/80 rounded-xl p-3">
                <div className="flex items-center gap-2 text-cyan-400 text-xs mb-1"><TrendingDown className="h-3 w-3" />Percent</div>
                <div className={`text-xl font-bold ${parseFloat(stats.percentChange) < 0 ? 'text-emerald-400' : parseFloat(stats.percentChange) > 0 ? 'text-red-400' : 'text-white'}`}>{stats.percentChange}<span className="text-sm font-normal text-slate-400">%</span></div>
              </div>
              <div className="bg-slate-800/80 rounded-xl p-3">
                <div className="flex items-center gap-2 text-cyan-400 text-xs mb-1"><Calendar className="h-3 w-3" />Weekly avg</div>
                <div className={`text-xl font-bold ${parseFloat(stats.weeklyAvg) < 0 ? 'text-emerald-400' : parseFloat(stats.weeklyAvg) > 0 ? 'text-red-400' : 'text-white'}`}>{stats.weeklyAvg}<span className="text-sm font-normal text-slate-400">lbs/wk</span></div>
              </div>
              <div className="bg-slate-800/80 rounded-xl p-3">
                <div className="flex items-center gap-2 text-cyan-400 text-xs mb-1"><Target className="h-3 w-3" />To goal</div>
                <div className="text-xl font-bold text-white">{stats.toGoal}<span className="text-sm font-normal text-slate-400">lbs</span></div>
              </div>
            </div>

            {/* Estimated Goal Date */}
            {stats.estimatedGoalDate && (
              <div className="bg-gradient-to-r from-emerald-500/20 to-cyan-500/20 border border-emerald-500/30 rounded-xl p-4">
                <div className="flex items-center gap-3">
                  <div className="bg-emerald-500/30 p-2 rounded-lg"><Target className="h-5 w-5 text-emerald-400" /></div>
                  <div>
                    <div className="text-emerald-400 text-sm font-medium">Estimated Goal Date</div>
                    <div className="text-white text-lg font-bold">{stats.estimatedGoalDate}</div>
                    <div className="text-slate-400 text-xs">Based on your {stats.weeklyAvg} lbs/week average</div>
                  </div>
                </div>
              </div>
            )}

            {/* Upcoming Injections */}
            {upcomingInjections.length > 0 && (
              <div className="bg-slate-800 rounded-xl p-4">
                <h3 className="text-white font-medium mb-3 flex items-center gap-2"><Bell className="h-4 w-4 text-cyan-400" />Upcoming Injections</h3>
                <div className="space-y-2">
                  {upcomingInjections.slice(0, 3).map((inj, idx) => (
                    <div key={idx} className="flex items-center justify-between bg-slate-700/50 rounded-lg p-3">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg" style={{ backgroundColor: `${getMedicationColor(inj.medication)}20` }}>
                          <Syringe className="h-4 w-4" style={{ color: getMedicationColor(inj.medication) }} />
                        </div>
                        <span className="text-white">{inj.medication}</span>
                      </div>
                      <div className={`text-sm font-medium ${inj.isOverdue ? 'text-red-400' : inj.isDueToday ? 'text-amber-400' : 'text-slate-400'}`}>
                        {inj.isOverdue ? `${Math.abs(inj.daysUntil)} days overdue` : inj.isDueToday ? 'Due today' : `In ${inj.daysUntil} days`}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Titration Progress */}
            {titrationPlans.length > 0 && (
              <div className="bg-slate-800 rounded-xl p-4">
                <h3 className="text-white font-medium mb-3 flex items-center gap-2"><TrendingUp className="h-4 w-4 text-violet-400" />Titration Progress</h3>
                {titrationPlans.map(plan => {
                  const current = getCurrentTitrationDose(plan);
                  if (!current) return null;
                  return (
                    <div key={plan.id} className="bg-slate-700/50 rounded-lg p-3 mb-2">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-white font-medium">{plan.medication}</span>
                        {current.completed && <span className="text-xs bg-emerald-500/20 text-emerald-400 px-2 py-1 rounded">Complete</span>}
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="text-2xl font-bold" style={{ color: getMedicationColor(plan.medication) }}>{current.dose}{current.unit}</div>
                        {current.nextDose && <span className="text-slate-400 text-sm">→ {current.nextDose.dose}{current.nextDose.unit} in {current.weeksRemaining} weeks</span>}
                      </div>
                      <div className="mt-2 bg-slate-600 rounded-full h-2">
                        <div className="h-2 rounded-full bg-violet-500" style={{ width: `${(current.step / plan.steps.length) * 100}%` }}></div>
                      </div>
                      <div className="text-slate-400 text-xs mt-1">Step {current.step} of {plan.steps.length}</div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Goal Weight Setting */}
            <div className="bg-slate-800/50 rounded-xl p-3">
              <div className="flex items-center justify-between">
                <span className="text-slate-400 text-sm">Goal Weight</span>
                <div className="flex items-center gap-2">
                  <input type="number" value={userProfile.goalWeight || 200} onChange={(e) => { const p = { ...userProfile, goalWeight: parseFloat(e.target.value) }; setUserProfile(p); saveData('health-user-profile', p); }}
                    className="w-20 bg-slate-700 text-white rounded px-2 py-1 text-center text-sm" />
                  <span className="text-slate-400 text-sm">lbs</span>
                </div>
              </div>
            </div>

            {/* Chart */}
            {(weightEntries.length > 0 || injectionEntries.length > 0) && (
              <div className="bg-slate-800/50 rounded-xl p-4">
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={getSummaryChartData()}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                    <XAxis dataKey="date" stroke="#94a3b8" fontSize={10} interval={Math.max(0, Math.floor(getSummaryChartData().length / 6))} />
                    <YAxis yAxisId="left" stroke="#94a3b8" fontSize={10} domain={['dataMin - 2', 'dataMax + 2']} orientation="right" tickFormatter={(v) => `${v} lbs`} />
                    <YAxis yAxisId="right" orientation="left" stroke="#94a3b8" fontSize={10} tickFormatter={(v) => `${v}mg`} hide={getLoggedMedications().length === 0} />
                    <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }} formatter={(value, name) => { if (!value) return null; return name === 'Weight' ? [`${value} lbs`, 'Weight'] : [`${value} mg`, name]; }} />
                    <Line yAxisId="left" type="monotone" dataKey="weight" stroke="#f472b6" strokeWidth={3} dot={{ fill: '#f472b6', r: 5 }} connectNulls name="Weight" />
                    {getLoggedMedications().map(med => (
                      <Line key={med} yAxisId="right" type="monotone" dataKey={med} stroke={getMedicationColor(med)} strokeWidth={2} dot={{ fill: getMedicationColor(med), r: 4 }} connectNulls name={med}
                        label={({ x, y, value }) => value ? <g><rect x={x - 20} y={y - 25} width={40} height={18} rx={4} fill={getMedicationColor(med)} opacity={0.9} /><text x={x} y={y - 12} textAnchor="middle" fill="#000" fontSize={10} fontWeight="bold">{value}mg</text></g> : null} />
                    ))}
                  </LineChart>
                </ResponsiveContainer>
                <div className="flex flex-wrap gap-4 mt-3 justify-center">
                  <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-pink-400"></div><span className="text-xs text-slate-400">Weight</span></div>
                  {getLoggedMedications().map(med => <div key={med} className="flex items-center gap-2"><div className="w-3 h-3 rounded-full" style={{ backgroundColor: getMedicationColor(med) }}></div><span className="text-xs text-slate-400">{med}</span></div>)}
                </div>
              </div>
            )}
          </div>
        )}

        {/* WEIGHT TAB */}
        {activeTab === 'weight' && (
          <div className="space-y-4">
            <div className="bg-slate-800 rounded-xl p-4">
              <div className="flex items-center justify-between">
                <span className="text-slate-400 text-sm">Your Height (for BMI)</span>
                <div className="flex items-center gap-2">
                  <input type="number" value={userProfile.height} onChange={(e) => { const p = { ...userProfile, height: parseFloat(e.target.value) }; setUserProfile(p); saveData('health-user-profile', p); }}
                    className="w-16 bg-slate-700 text-white rounded px-2 py-1 text-center text-sm" />
                  <span className="text-slate-400 text-sm">inches</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="bg-slate-800 rounded-xl p-4">
                <div className="text-slate-400 text-sm mb-1">Current Weight</div>
                <div className="text-2xl font-bold text-white">{stats.current} <span className="text-sm text-slate-400">lbs</span></div>
              </div>
              <div className="bg-slate-800 rounded-xl p-4">
                <div className="text-slate-400 text-sm mb-1">BMI</div>
                <div className={`text-2xl font-bold ${bmiCategory.color}`}>{stats.bmi || '-'}</div>
                <div className={`text-xs ${bmiCategory.color}`}>{bmiCategory.label}</div>
              </div>
            </div>

            {showAddForm && (
              <div className="bg-slate-800 rounded-xl p-4">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-white font-medium">{editingWeight ? 'Edit Entry' : 'Add Weight'}</h3>
                  <button onClick={resetWeightForm} className="text-slate-400 hover:text-white"><X className="h-5 w-5" /></button>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="text-slate-400 text-sm block mb-1">Weight (lbs)</label>
                    <input type="number" step="0.1" value={weight} onChange={(e) => setWeight(e.target.value)} className="w-full bg-slate-700 text-white rounded-lg px-4 py-3" placeholder="Enter weight" />
                  </div>
                  <div>
                    <label className="text-slate-400 text-sm block mb-1">Date</label>
                    <input type="date" value={weightDate} onChange={(e) => setWeightDate(e.target.value)} className="w-full bg-slate-700 text-white rounded-lg px-4 py-3" />
                  </div>
                  <button onClick={addOrUpdateWeight} className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-medium py-3 rounded-lg">{editingWeight ? 'Update' : 'Add Entry'}</button>
                </div>
              </div>
            )}

            <div className="bg-slate-800 rounded-xl p-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-white font-medium">History</h3>
                {!showAddForm && <button onClick={() => setShowAddForm(true)} className="bg-emerald-500 hover:bg-emerald-600 text-white p-2 rounded-lg"><Plus className="h-5 w-5" /></button>}
              </div>
              {weightEntries.length === 0 ? (
                <div className="text-center py-8 text-slate-400"><Scale className="h-12 w-12 mx-auto mb-2 opacity-50" /><p>No weight entries yet</p></div>
              ) : (
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {[...weightEntries].sort((a, b) => new Date(b.date) - new Date(a.date)).map((entry) => (
                    <div key={entry.id} className="flex items-center justify-between bg-slate-700/50 rounded-lg p-3 group">
                      <div className="flex items-center gap-3">
                        <div className="bg-pink-500/20 p-2 rounded-lg"><Scale className="h-5 w-5 text-pink-400" /></div>
                        <div>
                          <div className="text-white font-medium">{entry.weight} lbs</div>
                          <div className="text-slate-400 text-sm">{new Date(entry.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</div>
                        </div>
                      </div>
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => { setEditingWeight(entry); setWeight(entry.weight.toString()); setWeightDate(entry.date); setShowAddForm(true); }} className="p-2 text-slate-400 hover:text-white hover:bg-slate-600 rounded-lg"><Edit2 className="h-4 w-4" /></button>
                        <button onClick={() => deleteWeight(entry.id)} className="p-2 text-slate-400 hover:text-red-400 hover:bg-slate-600 rounded-lg"><Trash2 className="h-4 w-4" /></button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* INJECTIONS TAB */}
        {activeTab === 'injections' && (
          <div className="space-y-4">
            <div className="grid grid-cols-4 gap-2">
              {['GLP-1', 'Peptide', 'Hormone', 'Other'].map(cat => {
                const count = injectionEntries.filter(e => { const med = MEDICATIONS.find(m => m.name === e.type); return med?.category === cat || (cat === 'Other' && (!med || med.category === 'Other' || med.category === 'Triple Agonist' || med.category === 'GLP-1/GIP')); }).length;
                return <div key={cat} className="bg-slate-800 rounded-xl p-2 text-center"><div className="text-lg font-bold text-white">{count}</div><div className="text-xs text-slate-400 truncate">{cat}</div></div>;
              })}
            </div>

            {showAddForm && (
              <div className="bg-slate-800 rounded-xl p-4">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-white font-medium">{editingInjection ? 'Edit Injection' : 'Log Injection'}</h3>
                  <button onClick={resetInjectionForm} className="text-slate-400 hover:text-white"><X className="h-5 w-5" /></button>
                </div>
                <div className="space-y-4">
                  <div className="relative">
                    <label className="text-slate-400 text-sm block mb-1">Medication</label>
                    <button onClick={() => setShowMedDropdown(!showMedDropdown)} className="w-full bg-slate-700 text-white rounded-lg px-4 py-3 text-left flex items-center justify-between">
                      <span style={{ color: getMedicationColor(injectionType) }}>{injectionType}</span>
                      <ChevronDown className={`h-5 w-5 transition-transform ${showMedDropdown ? 'rotate-180' : ''}`} />
                    </button>
                    {showMedDropdown && (
                      <div className="absolute z-10 w-full mt-1 bg-slate-700 rounded-lg shadow-xl max-h-64 overflow-y-auto">
                        <input type="text" placeholder="Search..." value={medSearchTerm} onChange={(e) => setMedSearchTerm(e.target.value)} className="w-full bg-slate-600 text-white px-4 py-2 rounded-t-lg" autoFocus />
                        {Object.entries(groupedMedications).map(([category, meds]) => (
                          <div key={category}>
                            <div className="px-4 py-1 text-xs font-medium text-slate-400 bg-slate-800">{category}</div>
                            {meds.map(med => <button key={med.name} onClick={() => { setInjectionType(med.name); setShowMedDropdown(false); setMedSearchTerm(''); }} className="w-full px-4 py-2 text-left hover:bg-slate-600 flex items-center gap-2"><div className="w-3 h-3 rounded-full" style={{ backgroundColor: med.color }}></div><span className="text-white">{med.name}</span></button>)}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  <div>
                    <label className="text-slate-400 text-sm block mb-1">Dose</label>
                    <div className="flex gap-2">
                      <input type="number" step="0.01" value={injectionDose} onChange={(e) => setInjectionDose(e.target.value)} className="flex-1 bg-slate-700 text-white rounded-lg px-4 py-3" placeholder="Amount" />
                      <select value={injectionUnit} onChange={(e) => setInjectionUnit(e.target.value)} className="bg-slate-700 text-white rounded-lg px-3 py-3">
                        <option value="mg">mg</option><option value="mcg">mcg</option><option value="ml">ml</option><option value="units">units</option><option value="IU">IU</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="text-slate-400 text-sm block mb-1">Date</label>
                    <input type="date" value={injectionDate} onChange={(e) => setInjectionDate(e.target.value)} className="w-full bg-slate-700 text-white rounded-lg px-4 py-3" />
                  </div>
                  <div>
                    <label className="text-slate-400 text-sm block mb-2">Injection Site</label>
                    <div className="grid grid-cols-3 gap-2">
                      {INJECTION_SITES.map(site => <button key={site} onClick={() => setInjectionSite(site)} className={`p-2 rounded-lg text-xs transition-all ${injectionSite === site ? 'bg-violet-500 text-white' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'}`}>{site}</button>)}
                    </div>
                  </div>
                  <div>
                    <label className="text-slate-400 text-sm block mb-2">Side Effects</label>
                    <div className="flex flex-wrap gap-2">
                      {SIDE_EFFECTS.map(effect => <button key={effect} onClick={() => toggleSideEffect(effect)} className={`px-3 py-1 rounded-full text-xs transition-all ${selectedSideEffects.includes(effect) ? 'bg-orange-500 text-white' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'}`}>{effect}</button>)}
                    </div>
                  </div>
                  <div>
                    <label className="text-slate-400 text-sm block mb-1">Notes</label>
                    <textarea value={injectionNotes} onChange={(e) => setInjectionNotes(e.target.value)} className="w-full bg-slate-700 text-white rounded-lg px-4 py-3 resize-none" rows={2} placeholder="Optional notes..." />
                  </div>
                  <button onClick={addOrUpdateInjection} className="w-full bg-violet-500 hover:bg-violet-600 text-white font-medium py-3 rounded-lg">{editingInjection ? 'Update' : 'Log Injection'}</button>
                </div>
              </div>
            )}

            <div className="bg-slate-800 rounded-xl p-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-white font-medium">History</h3>
                {!showAddForm && <button onClick={() => setShowAddForm(true)} className="bg-violet-500 hover:bg-violet-600 text-white p-2 rounded-lg"><Plus className="h-5 w-5" /></button>}
              </div>
              {injectionEntries.length === 0 ? (
                <div className="text-center py-8 text-slate-400"><Syringe className="h-12 w-12 mx-auto mb-2 opacity-50" /><p>No injections logged</p></div>
              ) : (
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {injectionEntries.map((entry) => (
                    <div key={entry.id} className="bg-slate-700/50 rounded-lg p-3 group">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3">
                          <div className="p-2 rounded-lg mt-1" style={{ backgroundColor: `${getMedicationColor(entry.type)}20` }}><Syringe className="h-5 w-5" style={{ color: getMedicationColor(entry.type) }} /></div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2"><span className="text-white font-medium">{entry.type}</span><span className="text-slate-300">{entry.dose} {entry.unit}</span></div>
                            <div className="text-slate-400 text-sm">{new Date(entry.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}{entry.site && <span className="ml-2">• {entry.site}</span>}</div>
                            {entry.sideEffects?.length > 0 && <div className="flex flex-wrap gap-1 mt-2">{entry.sideEffects.map(effect => <span key={effect} className="text-xs bg-orange-500/20 text-orange-300 px-2 py-0.5 rounded">{effect}</span>)}</div>}
                            {entry.notes && <div className="text-sm text-slate-400 mt-2 italic">{entry.notes}</div>}
                          </div>
                        </div>
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => { setEditingInjection(entry); setInjectionType(entry.type); setInjectionDose(entry.dose.toString()); setInjectionUnit(entry.unit || 'mg'); setInjectionDate(entry.date); setInjectionSite(entry.site || 'Stomach'); setInjectionNotes(entry.notes || ''); setSelectedSideEffects(entry.sideEffects || []); setShowAddForm(true); }} className="p-2 text-slate-400 hover:text-white hover:bg-slate-600 rounded-lg"><Edit2 className="h-4 w-4" /></button>
                          <button onClick={() => deleteInjection(entry.id)} className="p-2 text-slate-400 hover:text-red-400 hover:bg-slate-600 rounded-lg"><Trash2 className="h-4 w-4" /></button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* MEASUREMENTS TAB */}
        {activeTab === 'measurements' && (
          <div className="space-y-4">
            {/* Measurement Stats */}
            {Object.keys(measurementStats).length > 0 && (
              <div className="grid grid-cols-2 gap-3">
                {Object.entries(measurementStats).map(([type, data]) => (
                  <div key={type} className="bg-slate-800 rounded-xl p-3">
                    <div className="text-slate-400 text-xs">{type}</div>
                    <div className="text-xl font-bold text-white">{data.current}"</div>
                    <div className={`text-xs ${parseFloat(data.change) < 0 ? 'text-emerald-400' : parseFloat(data.change) > 0 ? 'text-red-400' : 'text-slate-400'}`}>
                      {parseFloat(data.change) > 0 ? '+' : ''}{data.change}"
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Add Measurement Form */}
            {showAddForm && (
              <div className="bg-slate-800 rounded-xl p-4">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-white font-medium">Add Measurement</h3>
                  <button onClick={resetMeasurementForm} className="text-slate-400 hover:text-white"><X className="h-5 w-5" /></button>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="text-slate-400 text-sm block mb-2">Body Part</label>
                    <div className="grid grid-cols-2 gap-2">
                      {MEASUREMENT_TYPES.map(type => <button key={type} onClick={() => setMeasurementType(type)} className={`p-2 rounded-lg text-sm transition-all ${measurementType === type ? 'bg-cyan-500 text-white' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'}`}>{type}</button>)}
                    </div>
                  </div>
                  <div>
                    <label className="text-slate-400 text-sm block mb-1">Measurement (inches)</label>
                    <input type="number" step="0.25" value={measurementValue} onChange={(e) => setMeasurementValue(e.target.value)} className="w-full bg-slate-700 text-white rounded-lg px-4 py-3" placeholder="e.g., 34.5" />
                  </div>
                  <div>
                    <label className="text-slate-400 text-sm block mb-1">Date</label>
                    <input type="date" value={measurementDate} onChange={(e) => setMeasurementDate(e.target.value)} className="w-full bg-slate-700 text-white rounded-lg px-4 py-3" />
                  </div>
                  <button onClick={addMeasurement} className="w-full bg-cyan-500 hover:bg-cyan-600 text-white font-medium py-3 rounded-lg">Add Measurement</button>
                </div>
              </div>
            )}

            {/* Progress Photos */}
            <div className="bg-slate-800 rounded-xl p-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-white font-medium flex items-center gap-2"><Camera className="h-4 w-4 text-cyan-400" />Progress Photos</h3>
                <button onClick={() => photoInputRef.current?.click()} className="bg-cyan-500 hover:bg-cyan-600 text-white p-2 rounded-lg"><Plus className="h-5 w-5" /></button>
                <input ref={photoInputRef} type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
              </div>
              {progressPhotos.length === 0 ? (
                <div className="text-center py-8 text-slate-400"><Camera className="h-12 w-12 mx-auto mb-2 opacity-50" /><p>No progress photos yet</p><p className="text-sm">Tap + to add your first photo</p></div>
              ) : (
                <div className="grid grid-cols-3 gap-2">
                  {progressPhotos.sort((a, b) => new Date(b.date) - new Date(a.date)).map(photo => (
                    <div key={photo.id} className="relative group">
                      <img src={photo.data} alt="Progress" className="w-full h-24 object-cover rounded-lg" />
                      <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-xs p-1 rounded-b-lg">{new Date(photo.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</div>
                      <button onClick={() => deletePhoto(photo.id)} className="absolute top-1 right-1 bg-red-500 p-1 rounded opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 className="h-3 w-3 text-white" /></button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Measurement History */}
            <div className="bg-slate-800 rounded-xl p-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-white font-medium">Measurement History</h3>
                {!showAddForm && <button onClick={() => setShowAddForm(true)} className="bg-cyan-500 hover:bg-cyan-600 text-white p-2 rounded-lg"><Plus className="h-5 w-5" /></button>}
              </div>
              {measurementEntries.length === 0 ? (
                <div className="text-center py-8 text-slate-400"><Ruler className="h-12 w-12 mx-auto mb-2 opacity-50" /><p>No measurements yet</p></div>
              ) : (
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {measurementEntries.map((entry) => (
                    <div key={entry.id} className="flex items-center justify-between bg-slate-700/50 rounded-lg p-3 group">
                      <div className="flex items-center gap-3">
                        <div className="bg-cyan-500/20 p-2 rounded-lg"><Ruler className="h-5 w-5 text-cyan-400" /></div>
                        <div>
                          <div className="text-white font-medium">{entry.type}: {entry.value}"</div>
                          <div className="text-slate-400 text-sm">{new Date(entry.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</div>
                        </div>
                      </div>
                      <button onClick={() => deleteMeasurement(entry.id)} className="p-2 text-slate-400 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 className="h-4 w-4" /></button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* TOOLS TAB */}
        {activeTab === 'tools' && (
          <div className="space-y-4">
            {/* Tool Section Selector */}
            <div className="flex bg-slate-800 rounded-xl p-1">
              {[{ id: 'calculator', label: 'Calculators' }, { id: 'schedule', label: 'Schedules' }, { id: 'titration', label: 'Titration' }].map(section => (
                <button key={section.id} onClick={() => setActiveToolSection(section.id)}
                  className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${activeToolSection === section.id ? 'bg-violet-500 text-white' : 'text-slate-400 hover:text-white'}`}>
                  {section.label}
                </button>
              ))}
            </div>

            {/* Calculators Section */}
            {activeToolSection === 'calculator' && (
              <>
                <div className="bg-slate-800 rounded-xl p-4">
                  <h3 className="text-white font-medium mb-4 flex items-center gap-2"><Calculator className="h-5 w-5 text-violet-400" />Dose Calculator</h3>
                  <div className="space-y-3">
                    <div>
                      <label className="text-slate-400 text-sm block mb-1">Concentration (mg/ml)</label>
                      <input type="number" step="0.01" value={calcConcentration} onChange={(e) => setCalcConcentration(e.target.value)} className="w-full bg-slate-700 text-white rounded-lg px-4 py-2" placeholder="e.g., 2.5" />
                    </div>
                    <div>
                      <label className="text-slate-400 text-sm block mb-1">Desired Dose</label>
                      <div className="flex gap-2">
                        <input type="number" step="0.01" value={calcDesiredDose} onChange={(e) => setCalcDesiredDose(e.target.value)} className="flex-1 bg-slate-700 text-white rounded-lg px-4 py-2" placeholder="e.g., 0.5" />
                        <select value={calcDesiredUnit} onChange={(e) => setCalcDesiredUnit(e.target.value)} className="bg-slate-700 text-white rounded-lg px-3 py-2"><option value="mg">mg</option><option value="mcg">mcg</option></select>
                      </div>
                    </div>
                    <button onClick={calculateDose} className="w-full bg-violet-500 hover:bg-violet-600 text-white font-medium py-2 rounded-lg">Calculate</button>
                    {calcResult && (
                      <div className="bg-slate-700/50 rounded-lg p-4 text-center">
                        <div className="text-2xl font-bold text-emerald-400">{calcResult.ml} mL</div>
                        <div className="text-slate-400 text-sm">or</div>
                        <div className="text-xl font-bold text-violet-400">{calcResult.units} units</div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="bg-slate-800 rounded-xl p-4">
                  <h3 className="text-white font-medium mb-4 flex items-center gap-2"><Activity className="h-5 w-5 text-emerald-400" />Reconstitution Calculator</h3>
                  <div className="space-y-3">
                    <div>
                      <label className="text-slate-400 text-sm block mb-1">Peptide Amount</label>
                      <div className="flex gap-2">
                        <input type="number" step="0.1" value={reconPeptideAmount} onChange={(e) => setReconPeptideAmount(e.target.value)} className="flex-1 bg-slate-700 text-white rounded-lg px-4 py-2" placeholder="e.g., 5" />
                        <select value={reconPeptideUnit} onChange={(e) => setReconPeptideUnit(e.target.value)} className="bg-slate-700 text-white rounded-lg px-3 py-2"><option value="mg">mg</option><option value="mcg">mcg</option></select>
                      </div>
                    </div>
                    <div>
                      <label className="text-slate-400 text-sm block mb-1">Water Added (mL)</label>
                      <input type="number" step="0.1" value={reconWaterAmount} onChange={(e) => setReconWaterAmount(e.target.value)} className="w-full bg-slate-700 text-white rounded-lg px-4 py-2" placeholder="e.g., 2" />
                    </div>
                    <div>
                      <label className="text-slate-400 text-sm block mb-1">Desired Dose</label>
                      <div className="flex gap-2">
                        <input type="number" step="0.01" value={reconDesiredDose} onChange={(e) => setReconDesiredDose(e.target.value)} className="flex-1 bg-slate-700 text-white rounded-lg px-4 py-2" placeholder="e.g., 250" />
                        <select value={reconDesiredUnit} onChange={(e) => setReconDesiredUnit(e.target.value)} className="bg-slate-700 text-white rounded-lg px-3 py-2"><option value="mcg">mcg</option><option value="mg">mg</option></select>
                      </div>
                    </div>
                    <button onClick={calculateReconstitution} className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-medium py-2 rounded-lg">Calculate</button>
                    {reconResult && (
                      <div className="bg-slate-700/50 rounded-lg p-4 text-center">
                        <div className="text-slate-400 text-xs">Concentration: {reconResult.concentration} mg/mL</div>
                        <div className="text-2xl font-bold text-emerald-400 mt-1">{reconResult.ml} mL</div>
                        <div className="text-slate-400 text-sm">or</div>
                        <div className="text-xl font-bold text-violet-400">{reconResult.units} units</div>
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}

            {/* Schedules Section */}
            {activeToolSection === 'schedule' && (
              <div className="space-y-4">
                <div className="bg-slate-800 rounded-xl p-4">
                  <h3 className="text-white font-medium mb-4 flex items-center gap-2"><Bell className="h-5 w-5 text-amber-400" />Add Injection Schedule</h3>
                  <div className="space-y-3">
                    <div>
                      <label className="text-slate-400 text-sm block mb-1">Medication</label>
                      <select value={scheduleMed} onChange={(e) => { setScheduleMed(e.target.value); const med = MEDICATIONS.find(m => m.name === e.target.value); if (med) setScheduleFrequency(med.defaultSchedule); }}
                        className="w-full bg-slate-700 text-white rounded-lg px-4 py-3">
                        {MEDICATIONS.map(med => <option key={med.name} value={med.name}>{med.name}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="text-slate-400 text-sm block mb-1">Frequency (days)</label>
                      <input type="number" value={scheduleFrequency} onChange={(e) => setScheduleFrequency(parseInt(e.target.value))} className="w-full bg-slate-700 text-white rounded-lg px-4 py-3" />
                    </div>
                    <button onClick={addSchedule} className="w-full bg-amber-500 hover:bg-amber-600 text-white font-medium py-3 rounded-lg">Save Schedule</button>
                  </div>
                </div>

                {schedules.length > 0 && (
                  <div className="bg-slate-800 rounded-xl p-4">
                    <h3 className="text-white font-medium mb-3">Active Schedules</h3>
                    <div className="space-y-2">
                      {schedules.map(schedule => (
                        <div key={schedule.id} className="flex items-center justify-between bg-slate-700/50 rounded-lg p-3">
                          <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg" style={{ backgroundColor: `${getMedicationColor(schedule.medication)}20` }}>
                              <Syringe className="h-4 w-4" style={{ color: getMedicationColor(schedule.medication) }} />
                            </div>
                            <div>
                              <div className="text-white font-medium">{schedule.medication}</div>
                              <div className="text-slate-400 text-sm">Every {schedule.frequencyDays} days</div>
                            </div>
                          </div>
                          <button onClick={() => deleteSchedule(schedule.id)} className="p-2 text-slate-400 hover:text-red-400"><Trash2 className="h-4 w-4" /></button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Titration Section */}
            {activeToolSection === 'titration' && (
              <div className="space-y-4">
                <div className="bg-slate-800 rounded-xl p-4">
                  <h3 className="text-white font-medium mb-4 flex items-center gap-2"><TrendingUp className="h-5 w-5 text-violet-400" />Create Titration Plan</h3>
                  <div className="space-y-3">
                    <div>
                      <label className="text-slate-400 text-sm block mb-1">Medication</label>
                      <select value={titrationMed} onChange={(e) => setTitrationMed(e.target.value)} className="w-full bg-slate-700 text-white rounded-lg px-4 py-3">
                        {MEDICATIONS.map(med => <option key={med.name} value={med.name}>{med.name}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="text-slate-400 text-sm block mb-2">Dose Steps</label>
                      {titrationSteps.map((step, idx) => (
                        <div key={idx} className="flex gap-2 mb-2">
                          <input type="number" step="0.1" value={step.dose} onChange={(e) => { const updated = [...titrationSteps]; updated[idx].dose = e.target.value; setTitrationSteps(updated); }}
                            className="flex-1 bg-slate-700 text-white rounded-lg px-3 py-2 text-sm" placeholder="Dose" />
                          <select value={step.unit} onChange={(e) => { const updated = [...titrationSteps]; updated[idx].unit = e.target.value; setTitrationSteps(updated); }}
                            className="bg-slate-700 text-white rounded-lg px-2 py-2 text-sm"><option value="mg">mg</option><option value="mcg">mcg</option></select>
                          <input type="number" value={step.weeks} onChange={(e) => { const updated = [...titrationSteps]; updated[idx].weeks = parseInt(e.target.value); setTitrationSteps(updated); }}
                            className="w-16 bg-slate-700 text-white rounded-lg px-2 py-2 text-sm text-center" />
                          <span className="text-slate-400 text-sm self-center">wks</span>
                          {titrationSteps.length > 1 && <button onClick={() => setTitrationSteps(titrationSteps.filter((_, i) => i !== idx))} className="text-red-400 hover:text-red-300"><X className="h-4 w-4" /></button>}
                        </div>
                      ))}
                      <button onClick={() => setTitrationSteps([...titrationSteps, { dose: '', weeks: 4, unit: 'mg' }])} className="text-violet-400 text-sm hover:text-violet-300">+ Add Step</button>
                    </div>
                    <button onClick={saveTitrationPlan} className="w-full bg-violet-500 hover:bg-violet-600 text-white font-medium py-3 rounded-lg">Save Titration Plan</button>
                  </div>
                </div>

                {titrationPlans.length > 0 && (
                  <div className="bg-slate-800 rounded-xl p-4">
                    <h3 className="text-white font-medium mb-3">Active Titration Plans</h3>
                    {titrationPlans.map(plan => {
                      const current = getCurrentTitrationDose(plan);
                      return (
                        <div key={plan.id} className="bg-slate-700/50 rounded-lg p-3 mb-2">
                          <div className="flex justify-between items-start">
                            <div>
                              <div className="text-white font-medium">{plan.medication}</div>
                              <div className="text-slate-400 text-xs">Started {new Date(plan.startDate).toLocaleDateString()}</div>
                            </div>
                            <button onClick={() => deleteTitrationPlan(plan.id)} className="text-slate-400 hover:text-red-400"><Trash2 className="h-4 w-4" /></button>
                          </div>
                          <div className="mt-2 flex flex-wrap gap-2">
                            {plan.steps.map((step, idx) => (
                              <div key={idx} className={`px-2 py-1 rounded text-xs ${current && idx + 1 === current.step ? 'bg-violet-500 text-white' : 'bg-slate-600 text-slate-300'}`}>
                                {step.dose}{step.unit} × {step.weeks}wk
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* Quick Reference */}
            <div className="bg-slate-800 rounded-xl p-4">
              <h3 className="text-white font-medium mb-3">Quick Reference</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between text-slate-400"><span>1 mL</span><span className="text-white">= 100 units</span></div>
                <div className="flex justify-between text-slate-400"><span>1 mg</span><span className="text-white">= 1000 mcg</span></div>
                <div className="flex justify-between text-slate-400"><span>0.5 mL</span><span className="text-white">= 50 units</span></div>
                <div className="flex justify-between text-slate-400"><span>0.1 mL</span><span className="text-white">= 10 units</span></div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default HealthTracker;
