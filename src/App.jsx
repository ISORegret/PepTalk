import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  CalendarDays, Check, CheckCircle2, ChevronLeft, ChevronRight, Clock3, Cloud,
  Download, FlaskConical, History, LogOut, MoreVertical, Pencil, Plus, RefreshCw,
  Settings, ShieldCheck, Syringe, Trash2, Upload, X,
} from 'lucide-react';
import { useSupabaseAuth } from './context/SupabaseAuthContext.jsx';
import { formatCloudError, scheduleCloudSync } from './lib/cloudSync.js';

const APP_VERSION = '2.0.0';
const SCHEDULES_KEY = 'health-schedules';
const LOGS_KEY = 'health-injection-entries';
const DAYS = [
  { short: 'S', label: 'Sunday' }, { short: 'M', label: 'Monday' },
  { short: 'T', label: 'Tuesday' }, { short: 'W', label: 'Wednesday' },
  { short: 'T', label: 'Thursday' }, { short: 'F', label: 'Friday' },
  { short: 'S', label: 'Saturday' },
];
const COMPOUNDS = [
  'Retatrutide', 'Cagrilintide', 'Testosterone Cypionate', 'Tesamorelin',
  'Ipamorelin', 'CJC-1295', 'MOTS-C', 'KLOW', 'BPC-157', 'TB-500', 'GHK-Cu',
  'KPV', 'NAD+', '5-Amino-1MQ', 'Semax', 'Selank', 'Tirzepatide', 'Semaglutide',
];
const UNITS = ['mg', 'mcg', 'units', 'mL', 'IU'];
const ROUTES = ['SubQ', 'IM', 'Oral', 'Intranasal', 'Topical', 'Other'];
const SITES = ['Stomach', 'Left thigh', 'Right thigh', 'Left glute', 'Right glute', 'Left arm', 'Right arm', 'N/A'];
const COLORS = ['#f59e0b', '#22c55e', '#38bdf8', '#a78bfa', '#fb7185', '#2dd4bf', '#f97316', '#e879f9'];
const pad = (value) => String(value).padStart(2, '0');

function toDateString(date) {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

function fromDateString(value) {
  if (!value) return new Date();
  const [year, month, day] = String(value).slice(0, 10).split('-').map(Number);
  return new Date(year, (month || 1) - 1, day || 1, 12, 0, 0, 0);
}

function addDays(value, amount) {
  const date = typeof value === 'string' ? fromDateString(value) : new Date(value);
  date.setDate(date.getDate() + amount);
  return toDateString(date);
}

function dateDiffDays(start, end) {
  return Math.round((fromDateString(end) - fromDateString(start)) / 86400000);
}

function friendlyDate(value) {
  const today = toDateString(new Date());
  if (value === today) return 'Today';
  if (value === addDays(today, -1)) return 'Yesterday';
  if (value === addDays(today, 1)) return 'Tomorrow';
  return fromDateString(value).toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });
}

function compactDate(value) {
  return fromDateString(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function formatTime(value) {
  if (!value) return '';
  const [hours, minutes] = value.split(':').map(Number);
  const date = new Date();
  date.setHours(hours || 0, minutes || 0, 0, 0);
  return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
}

function nowTime() {
  const date = new Date();
  return `${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function safeArray(key) {
  try {
    const parsed = JSON.parse(localStorage.getItem(key) || '[]');
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function colorFor(name = '') {
  let hash = 0;
  for (let i = 0; i < name.length; i += 1) hash = ((hash << 5) - hash) + name.charCodeAt(i);
  return COLORS[Math.abs(hash) % COLORS.length];
}

function normalizeProtocol(protocol) {
  const startDate = String(protocol.startDate || toDateString(new Date())).slice(0, 10);
  const scheduleType = protocol.scheduleType === 'specific_days' ? 'specific_days' : 'recurring';
  const fallbackDay = Number.isInteger(Number(protocol.preferredDay)) ? Number(protocol.preferredDay) : fromDateString(startDate).getDay();
  const specificDays = Array.isArray(protocol.specificDays) && protocol.specificDays.length
    ? protocol.specificDays.map(Number)
    : scheduleType === 'specific_days' ? [fallbackDay] : [];
  return {
    ...protocol,
    id: protocol.id ?? Date.now(),
    medication: protocol.medication || protocol.type || 'Unnamed compound',
    dose: protocol.dose ?? '',
    doseUnit: protocol.doseUnit || protocol.unit || 'mg',
    syringeUnits: protocol.syringeUnits ?? '',
    scheduledTime: protocol.scheduledTime || protocol.time || '08:00',
    route: protocol.route || 'SubQ',
    site: protocol.site || 'Stomach',
    scheduleType,
    specificDays,
    frequencyDays: Math.max(1, Number(protocol.frequencyDays) || 7),
    preferredDay: fallbackDay,
    startDate,
    notes: protocol.notes || '',
    active: protocol.active !== false,
  };
}

function protocolDueOn(protocol, dateString) {
  if (!protocol.active) return false;
  if (protocol.scheduleType === 'specific_days') return protocol.specificDays.includes(fromDateString(dateString).getDay());
  const difference = dateDiffDays(protocol.startDate, dateString);
  return difference >= 0 && difference % Math.max(1, protocol.frequencyDays) === 0;
}

function doseLabel(protocol) {
  const parts = [];
  if (protocol.dose !== '' && protocol.dose != null) parts.push(`${protocol.dose} ${protocol.doseUnit || 'mg'}`);
  if (protocol.syringeUnits !== '' && protocol.syringeUnits != null) parts.push(`${protocol.syringeUnits} syringe units`);
  return parts.join(' · ') || 'Dose not set';
}

function hasDose(protocol) {
  return protocol.dose !== '' && protocol.dose != null && Number.isFinite(Number(protocol.dose)) && Number(protocol.dose) > 0;
}

function scheduleLabel(protocol) {
  if (protocol.scheduleType === 'specific_days') {
    if (protocol.specificDays.length === 7) return 'Every day';
    return protocol.specificDays.map((day) => DAYS[day]?.label.slice(0, 3)).filter(Boolean).join(', ');
  }
  return `Every ${protocol.frequencyDays} day${protocol.frequencyDays === 1 ? '' : 's'} from ${compactDate(protocol.startDate)}`;
}

function periodFor(time) {
  const hour = Number(String(time || '08:00').split(':')[0]);
  if (hour < 12) return 'Morning';
  if (hour < 17) return 'Afternoon';
  if (hour < 21) return 'Evening';
  return 'Night';
}

function newProtocol() {
  const today = new Date();
  return {
    id: null, medication: '', dose: '', doseUnit: 'mg', syringeUnits: '', scheduledTime: '08:00',
    route: 'SubQ', site: 'Stomach', scheduleType: 'specific_days', specificDays: [today.getDay()],
    frequencyDays: 7, startDate: toDateString(today), notes: '', active: true,
  };
}

function App() {
  const {
    user, authLoading, isConfigured: cloudConfigured, pendingCloudRestore,
    resolveCloudRestore, signIn, signUp, signOut, syncNow,
  } = useSupabaseAuth();
  const today = toDateString(new Date());
  const [activeTab, setActiveTab] = useState('today');
  const [selectedDate, setSelectedDate] = useState(today);
  const [protocols, setProtocols] = useState([]);
  const [logs, setLogs] = useState([]);
  const [loaded, setLoaded] = useState(false);
  const [showProtocolForm, setShowProtocolForm] = useState(false);
  const [protocolForm, setProtocolForm] = useState(newProtocol());
  const [formError, setFormError] = useState('');
  const [openMenuId, setOpenMenuId] = useState(null);
  const [toast, setToast] = useState('');
  const [cloudEmail, setCloudEmail] = useState('');
  const [cloudPassword, setCloudPassword] = useState('');
  const [cloudMessage, setCloudMessage] = useState('');
  const [cloudBusy, setCloudBusy] = useState(false);
  const importRef = useRef(null);

  useEffect(() => {
    setProtocols(safeArray(SCHEDULES_KEY).map(normalizeProtocol));
    setLogs(safeArray(LOGS_KEY));
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (!toast) return undefined;
    const timeout = window.setTimeout(() => setToast(''), 2400);
    return () => window.clearTimeout(timeout);
  }, [toast]);

  const persist = (key, value) => {
    localStorage.setItem(key, JSON.stringify(value));
    scheduleCloudSync();
  };
  const saveProtocols = (next) => { setProtocols(next); persist(SCHEDULES_KEY, next); };
  const saveLogs = (next) => {
    const sorted = [...next].sort((a, b) => `${b.date || ''}T${b.time || ''}`.localeCompare(`${a.date || ''}T${a.time || ''}`));
    setLogs(sorted);
    persist(LOGS_KEY, sorted);
  };

  const dateWindow = useMemo(() => Array.from({ length: 7 }, (_, index) => addDays(selectedDate, index - 3)), [selectedDate]);
  const dueProtocols = useMemo(
    () => protocols.filter((protocol) => protocolDueOn(protocol, selectedDate)).sort((a, b) => a.scheduledTime.localeCompare(b.scheduledTime)),
    [protocols, selectedDate],
  );
  const findLog = (protocol, dateString = selectedDate) => logs.find((entry) => {
    if (String(entry.date || '').slice(0, 10) !== dateString) return false;
    if (entry.scheduleId != null) return String(entry.scheduleId) === String(protocol.id);
    return entry.type === protocol.medication || entry.medication === protocol.medication;
  });
  const takenCount = dueProtocols.filter((protocol) => findLog(protocol)).length;
  const completion = dueProtocols.length ? Math.round((takenCount / dueProtocols.length) * 100) : 0;
  const groupedDue = useMemo(() => {
    const groups = { Morning: [], Afternoon: [], Evening: [], Night: [] };
    dueProtocols.forEach((protocol) => groups[periodFor(protocol.scheduledTime)].push(protocol));
    return Object.entries(groups).filter(([, items]) => items.length);
  }, [dueProtocols]);

  const markTaken = (protocol) => {
    if (findLog(protocol)) return;
    const entry = {
      id: Date.now(), scheduleId: protocol.id, type: protocol.medication, dose: Number(protocol.dose),
      unit: protocol.doseUnit, syringeUnits: protocol.syringeUnits === '' ? undefined : Number(protocol.syringeUnits),
      date: selectedDate, time: selectedDate === today ? nowTime() : protocol.scheduledTime,
      route: protocol.route, site: protocol.site, notes: protocol.notes || '',
    };
    saveLogs([...logs, entry]);
    setToast(`${protocol.medication} marked taken`);
  };
  const undoTaken = (protocol) => {
    const entry = findLog(protocol);
    if (!entry) return;
    saveLogs(logs.filter((item) => item.id !== entry.id));
    setToast(`${protocol.medication} returned to due`);
  };
  const openNewProtocol = () => { setProtocolForm(newProtocol()); setFormError(''); setShowProtocolForm(true); };
  const openEditProtocol = (protocol) => {
    setProtocolForm({ ...normalizeProtocol(protocol), specificDays: [...protocol.specificDays] });
    setFormError(''); setShowProtocolForm(true); setOpenMenuId(null);
  };
  const saveProtocol = (event) => {
    event.preventDefault();
    const medication = protocolForm.medication.trim();
    const dose = Number(protocolForm.dose);
    if (!medication) return setFormError('Enter a compound or hormone name.');
    if (!protocolForm.dose || Number.isNaN(dose) || dose <= 0) return setFormError('Enter a dose greater than zero.');
    if (protocolForm.scheduleType === 'specific_days' && !protocolForm.specificDays.length) return setFormError('Choose at least one day.');
    const saved = normalizeProtocol({
      ...protocolForm, id: protocolForm.id ?? Date.now(), medication, dose,
      syringeUnits: protocolForm.syringeUnits === '' ? '' : Number(protocolForm.syringeUnits),
      frequencyDays: Math.max(1, Number(protocolForm.frequencyDays) || 1),
      preferredDay: protocolForm.specificDays[0] ?? fromDateString(protocolForm.startDate).getDay(),
    });
    const next = protocolForm.id == null ? [...protocols, saved] : protocols.map((item) => String(item.id) === String(saved.id) ? saved : item);
    saveProtocols(next); setShowProtocolForm(false); setToast(protocolForm.id == null ? 'Protocol added' : 'Protocol updated');
  };
  const deleteProtocol = (protocol) => {
    if (!window.confirm(`Delete the ${protocol.medication} protocol? Existing dose history will remain.`)) return;
    saveProtocols(protocols.filter((item) => String(item.id) !== String(protocol.id)));
    setOpenMenuId(null); setToast('Protocol deleted');
  };
  const toggleProtocol = (protocol) => {
    saveProtocols(protocols.map((item) => String(item.id) === String(protocol.id) ? { ...item, active: !item.active } : item));
    setOpenMenuId(null);
  };
  const deleteLog = (entry) => {
    if (!window.confirm(`Delete this ${entry.type || entry.medication} dose?`)) return;
    saveLogs(logs.filter((item) => item.id !== entry.id)); setToast('Dose removed');
  };
  const toggleDay = (day) => {
    const current = protocolForm.specificDays;
    const next = current.includes(day) ? current.filter((value) => value !== day) : [...current, day].sort((a, b) => a - b);
    setProtocolForm({ ...protocolForm, specificDays: next });
  };

  const exportData = () => {
    const payload = { version: '2.0', exportDate: new Date().toISOString(), schedules: protocols, injectionEntries: logs };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url; anchor.download = `peptalk-backup-${today}.json`;
    document.body.appendChild(anchor); anchor.click(); anchor.remove(); URL.revokeObjectURL(url);
  };
  const importData = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const imported = JSON.parse(reader.result);
        const importedProtocols = imported.schedules || imported.protocols;
        const importedLogs = imported.injectionEntries || imported.logs;
        if (!Array.isArray(importedProtocols) || !Array.isArray(importedLogs)) throw new Error('Invalid backup');
        if (!window.confirm('Replace your current Pep Talk protocols and dose history with this backup?')) return;
        saveProtocols(importedProtocols.map(normalizeProtocol)); saveLogs(importedLogs); setToast('Backup restored');
      } catch { window.alert('That file is not a valid Pep Talk backup.'); }
      finally { event.target.value = ''; }
    };
    reader.readAsText(file);
  };
  const runCloudAction = async (action) => {
    setCloudBusy(true); setCloudMessage('');
    try {
      const result = action === 'signin' ? await signIn(cloudEmail, cloudPassword) : await signUp(cloudEmail, cloudPassword);
      if (result?.error) setCloudMessage(formatCloudError(result.error));
      else { setCloudPassword(''); setCloudMessage(action === 'signin' ? 'Signed in. Syncing your tracker…' : 'Account created. Check your email if confirmation is required.'); }
    } finally { setCloudBusy(false); }
  };

  const navItems = [
    { id: 'today', label: 'Today', icon: CalendarDays },
    { id: 'protocols', label: 'Protocols', icon: FlaskConical },
    { id: 'history', label: 'History', icon: History },
    { id: 'settings', label: 'Account', icon: Settings },
  ];
  if (!loaded) return <div className="min-h-screen flex items-center justify-center bg-[#0e1117] text-white"><div className="flex items-center gap-3 text-sm text-gray-400"><RefreshCw className="h-5 w-5 animate-spin text-amber-400" />Loading Pep Talk…</div></div>;

  return (
    <div className="min-h-screen bg-[#0e1117] text-white pb-28">
      <div className="max-w-xl mx-auto px-4 pt-2">
        <header className="flex items-center justify-between py-4">
          <div className="flex items-center gap-2">
            <div className="h-9 w-9 rounded-xl bg-amber-400 text-slate-950 flex items-center justify-center shadow-gold-glow"><Syringe className="h-5 w-5" /></div>
            <div><h1 className="text-xl font-bold tracking-tight">Pep Talk</h1><p className="text-[11px] text-gray-500">Daily peptide &amp; hormone tracker</p></div>
          </div>
          {user && <div className="h-2.5 w-2.5 rounded-full bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,.6)]" title="Cloud connected" />}
        </header>

        {activeTab === 'today' && (
          <main className="space-y-4">
            <section className="rounded-2xl border border-white/10 bg-slate-900/75 p-4 shadow-xl shadow-black/20">
              <div className="flex items-center justify-between gap-3 mb-4">
                <button type="button" onClick={() => setSelectedDate(addDays(selectedDate, -7))} className="h-10 w-10 rounded-xl bg-white/5 text-gray-300 flex items-center justify-center active:scale-95" aria-label="Previous week"><ChevronLeft className="h-5 w-5" /></button>
                <div className="text-center"><p className="text-sm font-semibold">{friendlyDate(selectedDate)}</p><button type="button" onClick={() => setSelectedDate(today)} className="text-[11px] text-amber-400 mt-0.5">Jump to today</button></div>
                <button type="button" onClick={() => setSelectedDate(addDays(selectedDate, 7))} className="h-10 w-10 rounded-xl bg-white/5 text-gray-300 flex items-center justify-center active:scale-95" aria-label="Next week"><ChevronRight className="h-5 w-5" /></button>
              </div>
              <div className="grid grid-cols-7 gap-1.5">
                {dateWindow.map((dateString) => {
                  const date = fromDateString(dateString); const active = dateString === selectedDate;
                  return <button type="button" key={dateString} onClick={() => setSelectedDate(dateString)} className={`rounded-xl py-2.5 flex flex-col items-center gap-1 transition active:scale-95 ${active ? 'bg-amber-400 text-slate-950 shadow-gold-glow' : 'bg-white/[0.04] text-gray-400'}`}><span className="text-[10px] font-semibold uppercase">{DAYS[date.getDay()].short}</span><span className="text-sm font-bold">{date.getDate()}</span></button>;
                })}
              </div>
            </section>

            <section className="rounded-2xl border border-amber-400/30 bg-gradient-to-br from-amber-400/15 via-slate-900/85 to-slate-950 p-4 overflow-hidden relative">
              <div className="absolute -right-10 -top-12 h-36 w-36 rounded-full bg-amber-400/10 blur-3xl" />
              <div className="relative flex items-center justify-between gap-4">
                <div><p className="text-xs uppercase tracking-[0.18em] text-amber-300/80">Daily progress</p><p className="text-3xl font-bold mt-1">{takenCount}<span className="text-lg text-gray-500">/{dueProtocols.length}</span></p><p className="text-sm text-gray-400 mt-1">{dueProtocols.length === 0 ? 'Nothing scheduled' : completion === 100 ? 'All doses complete' : `${dueProtocols.length - takenCount} remaining`}</p></div>
                <div className="h-20 w-20 rounded-full grid place-items-center" style={{ background: `conic-gradient(#f59e0b ${completion * 3.6}deg, rgba(255,255,255,.08) 0deg)` }}><div className="h-16 w-16 rounded-full bg-slate-950 grid place-items-center text-sm font-bold">{completion}%</div></div>
              </div>
            </section>

            {dueProtocols.length === 0 ? (
              <section className="rounded-2xl border border-dashed border-white/15 bg-white/[0.025] p-8 text-center">
                <FlaskConical className="h-9 w-9 text-amber-400 mx-auto mb-3" /><h2 className="font-semibold">No protocols scheduled</h2><p className="text-sm text-gray-500 mt-1 max-w-xs mx-auto">Add a compound, dose, time, and schedule. It will appear here automatically.</p>
                <button type="button" onClick={openNewProtocol} className="mt-5 ui-btn-primary inline-flex items-center gap-2"><Plus className="h-4 w-4" />Add first protocol</button>
              </section>
            ) : groupedDue.map(([period, items]) => (
              <section key={period}>
                <div className="flex items-center gap-2 mb-2 px-1"><Clock3 className="h-4 w-4 text-amber-400" /><h2 className="text-xs font-semibold uppercase tracking-[0.16em] text-gray-400">{period}</h2></div>
                <div className="space-y-2.5">{items.map((protocol) => {
                  const taken = findLog(protocol); const color = colorFor(protocol.medication);
                  return (
                    <article key={protocol.id} className={`rounded-2xl border p-4 transition ${taken ? 'border-emerald-400/25 bg-emerald-400/[0.06]' : 'border-white/10 bg-slate-900/80'}`}>
                      <div className="flex items-center gap-3">
                        <div className="h-11 w-11 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: `${color}1f`, color }}><Syringe className="h-5 w-5" /></div>
                        <div className="min-w-0 flex-1"><h3 className="font-semibold truncate">{protocol.medication}</h3><p className="text-sm text-gray-300 mt-0.5">{doseLabel(protocol)}</p><p className="text-xs text-gray-500 mt-1">{formatTime(protocol.scheduledTime)} · {protocol.route}{protocol.site && protocol.site !== 'N/A' ? ` · ${protocol.site}` : ''}</p></div>
                      </div>
                      {taken ? <div className="mt-3 flex items-center gap-2"><div className="flex-1 h-11 rounded-xl bg-emerald-400/15 text-emerald-300 flex items-center justify-center gap-2 text-sm font-semibold"><CheckCircle2 className="h-5 w-5" />Taken at {formatTime(taken.time)}</div><button type="button" onClick={() => undoTaken(protocol)} className="h-11 px-3 rounded-xl bg-white/5 text-xs text-gray-400 active:scale-95">Undo</button></div>
                        : hasDose(protocol)
                          ? <button type="button" onClick={() => markTaken(protocol)} className="mt-3 w-full h-12 rounded-xl bg-amber-400 text-slate-950 font-bold flex items-center justify-center gap-2 shadow-gold-glow active:scale-[0.98] transition"><Check className="h-5 w-5" />Mark taken</button>
                          : <button type="button" onClick={() => openEditProtocol(protocol)} className="mt-3 w-full h-12 rounded-xl border border-amber-400/30 bg-amber-400/10 text-amber-300 font-bold flex items-center justify-center gap-2 active:scale-[0.98] transition"><Pencil className="h-4 w-4" />Set dose before logging</button>}
                    </article>
                  );
                })}</div>
              </section>
            ))}
          </main>
        )}

        {activeTab === 'protocols' && (
          <main className="space-y-4">
            <div className="flex items-end justify-between gap-3"><div><p className="text-xs uppercase tracking-[0.16em] text-amber-400">Your stack</p><h2 className="text-2xl font-bold mt-1">Protocols</h2><p className="text-sm text-gray-500 mt-1">{protocols.filter((item) => item.active).length} active</p></div><button type="button" onClick={openNewProtocol} className="ui-btn-primary inline-flex items-center gap-2"><Plus className="h-4 w-4" />Add</button></div>
            {protocols.length === 0 ? <div className="rounded-2xl border border-dashed border-white/15 p-8 text-center text-gray-500">No protocols yet.</div> : (
              <div className="space-y-3">{[...protocols].sort((a, b) => Number(b.active) - Number(a.active) || a.scheduledTime.localeCompare(b.scheduledTime)).map((protocol) => {
                const color = colorFor(protocol.medication);
                return (
                  <article key={protocol.id} className={`relative rounded-2xl border bg-slate-900/80 p-4 ${protocol.active ? 'border-white/10' : 'border-white/5 opacity-55'}`}>
                    <div className="flex items-start gap-3"><div className="h-11 w-2 rounded-full shrink-0" style={{ backgroundColor: color }} /><div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-2"><div><h3 className="font-semibold">{protocol.medication}</h3><p className="text-sm text-gray-300 mt-1">{doseLabel(protocol)}</p></div><button type="button" onClick={() => setOpenMenuId(openMenuId === protocol.id ? null : protocol.id)} className="h-9 w-9 rounded-lg bg-white/5 text-gray-400 flex items-center justify-center" aria-label={`Actions for ${protocol.medication}`}><MoreVertical className="h-4 w-4" /></button></div>
                      <p className="text-xs text-gray-500 mt-2">{scheduleLabel(protocol)} · {formatTime(protocol.scheduledTime)}</p><p className="text-xs text-gray-600 mt-1">{protocol.route}{protocol.site && protocol.site !== 'N/A' ? ` · ${protocol.site}` : ''}</p>
                    </div></div>
                    {openMenuId === protocol.id && <div className="absolute right-4 top-14 z-20 w-44 rounded-xl border border-white/10 bg-slate-800 p-1.5 shadow-2xl"><button type="button" onClick={() => openEditProtocol(protocol)} className="w-full px-3 py-2.5 rounded-lg text-sm flex items-center gap-2 hover:bg-white/5"><Pencil className="h-4 w-4" />Edit protocol</button><button type="button" onClick={() => toggleProtocol(protocol)} className="w-full px-3 py-2.5 rounded-lg text-sm flex items-center gap-2 hover:bg-white/5"><CheckCircle2 className="h-4 w-4" />{protocol.active ? 'Pause' : 'Activate'}</button><button type="button" onClick={() => deleteProtocol(protocol)} className="w-full px-3 py-2.5 rounded-lg text-sm text-red-300 flex items-center gap-2 hover:bg-red-400/10"><Trash2 className="h-4 w-4" />Delete</button></div>}
                  </article>
                );
              })}</div>
            )}
          </main>
        )}

        {activeTab === 'history' && (
          <main className="space-y-4">
            <div><p className="text-xs uppercase tracking-[0.16em] text-amber-400">Dose log</p><h2 className="text-2xl font-bold mt-1">History</h2><p className="text-sm text-gray-500 mt-1">{logs.length} recorded dose{logs.length === 1 ? '' : 's'}</p></div>
            {logs.length === 0 ? <div className="rounded-2xl border border-dashed border-white/15 p-8 text-center"><History className="h-8 w-8 text-gray-600 mx-auto mb-3" /><p className="text-gray-400">Your completed doses will appear here.</p></div> : (
              <div className="space-y-2.5">{logs.slice(0, 150).map((entry) => {
                const name = entry.type || entry.medication || 'Dose';
                return <article key={entry.id} className="rounded-2xl border border-white/10 bg-slate-900/75 p-4 flex items-center gap-3"><div className="h-10 w-10 rounded-xl flex items-center justify-center shrink-0" style={{ color: colorFor(name), backgroundColor: `${colorFor(name)}1f` }}><Check className="h-5 w-5" /></div><div className="min-w-0 flex-1"><h3 className="font-semibold truncate">{name}</h3><p className="text-sm text-gray-400 mt-0.5">{entry.dose} {entry.unit || 'mg'}{entry.syringeUnits != null ? ` · ${entry.syringeUnits} syringe units` : ''}</p><p className="text-xs text-gray-600 mt-1">{friendlyDate(String(entry.date).slice(0, 10))} · {formatTime(entry.time)}{entry.site && entry.site !== 'N/A' ? ` · ${entry.site}` : ''}</p></div><button type="button" onClick={() => deleteLog(entry)} className="h-9 w-9 rounded-lg text-gray-600 hover:text-red-300 hover:bg-red-400/10 flex items-center justify-center" aria-label={`Delete ${name} dose`}><Trash2 className="h-4 w-4" /></button></article>;
              })}</div>
            )}
          </main>
        )}

        {activeTab === 'settings' && (
          <main className="space-y-4">
            <div><p className="text-xs uppercase tracking-[0.16em] text-amber-400">Backup &amp; access</p><h2 className="text-2xl font-bold mt-1">Account</h2></div>
            <section className="rounded-2xl border border-cyan-400/20 bg-cyan-400/[0.04] p-4">
              <div className="flex items-center gap-3 mb-3"><div className="h-10 w-10 rounded-xl bg-cyan-400/10 text-cyan-300 flex items-center justify-center"><Cloud className="h-5 w-5" /></div><div><h3 className="font-semibold">Cloud backup</h3><p className="text-xs text-gray-500">Keep Pep Talk available across devices</p></div></div>
              {!cloudConfigured && <p className="text-sm text-amber-300">Cloud backup is not configured for this installation.</p>}
              {cloudConfigured && authLoading && <p className="text-sm text-gray-400">Checking your account…</p>}
              {cloudConfigured && !authLoading && user && <div className="space-y-3"><div className="rounded-xl bg-white/5 p-3 flex items-center gap-3"><ShieldCheck className="h-5 w-5 text-emerald-400" /><div className="min-w-0"><p className="text-sm font-medium truncate">{user.email}</p><p className="text-xs text-emerald-300">Connected</p></div></div><div className="grid grid-cols-2 gap-2"><button type="button" onClick={async () => { const result = await syncNow(); setCloudMessage(result?.ok ? 'Backup is up to date.' : formatCloudError(result?.message || result?.error)); }} className="h-11 rounded-xl bg-white/5 text-sm font-medium flex items-center justify-center gap-2"><RefreshCw className="h-4 w-4" />Sync now</button><button type="button" onClick={signOut} className="h-11 rounded-xl bg-white/5 text-sm text-gray-400 font-medium flex items-center justify-center gap-2"><LogOut className="h-4 w-4" />Sign out</button></div></div>}
              {cloudConfigured && !authLoading && !user && <div className="space-y-3"><input type="email" value={cloudEmail} onChange={(event) => setCloudEmail(event.target.value)} placeholder="Email" autoComplete="email" className="w-full h-12 rounded-xl bg-slate-950/70 border border-white/10 px-4 text-sm" /><input type="password" value={cloudPassword} onChange={(event) => setCloudPassword(event.target.value)} placeholder="Password" autoComplete="current-password" className="w-full h-12 rounded-xl bg-slate-950/70 border border-white/10 px-4 text-sm" /><div className="grid grid-cols-2 gap-2"><button type="button" disabled={cloudBusy} onClick={() => runCloudAction('signin')} className="h-11 rounded-xl bg-cyan-400 text-slate-950 text-sm font-bold disabled:opacity-50">Sign in</button><button type="button" disabled={cloudBusy} onClick={() => runCloudAction('signup')} className="h-11 rounded-xl bg-white/5 text-sm font-medium disabled:opacity-50">Create account</button></div></div>}
              {cloudMessage && <p className="mt-3 text-xs text-gray-400">{cloudMessage}</p>}
            </section>
            <section className="rounded-2xl border border-white/10 bg-slate-900/75 p-4"><h3 className="font-semibold">Manual backup</h3><p className="text-sm text-gray-500 mt-1">Download a copy or restore one from Files.</p><div className="grid grid-cols-2 gap-2 mt-4"><button type="button" onClick={exportData} className="h-11 rounded-xl bg-white/5 text-sm font-medium flex items-center justify-center gap-2"><Download className="h-4 w-4" />Export</button><button type="button" onClick={() => importRef.current?.click()} className="h-11 rounded-xl bg-white/5 text-sm font-medium flex items-center justify-center gap-2"><Upload className="h-4 w-4" />Import</button><input ref={importRef} type="file" accept="application/json,.json" onChange={importData} className="hidden" /></div></section>
            <section className="rounded-2xl border border-white/5 p-4 text-xs leading-relaxed text-gray-600">Pep Talk is a personal record-keeping tool, not medical advice. Record the protocol provided by your qualified clinician. Version {APP_VERSION}.</section>
          </main>
        )}
      </div>

      <nav className="fixed bottom-0 inset-x-0 z-40 border-t border-white/10 bg-slate-950/95 backdrop-blur-xl" style={{ paddingBottom: 'max(env(safe-area-inset-bottom), 8px)' }}><div className="max-w-xl mx-auto grid grid-cols-4 px-2 pt-2">{navItems.map((item) => <button type="button" key={item.id} onClick={() => setActiveTab(item.id)} className={`min-h-[54px] rounded-xl flex flex-col items-center justify-center gap-1 text-[10px] font-semibold transition active:scale-95 ${activeTab === item.id ? 'text-amber-400 bg-amber-400/10' : 'text-gray-600'}`}><item.icon className="h-5 w-5" />{item.label}</button>)}</div></nav>

      {showProtocolForm && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-end sm:items-center justify-center">
          <form onSubmit={saveProtocol} className="w-full sm:max-w-lg max-h-[94vh] overflow-y-auto rounded-t-3xl sm:rounded-3xl border border-white/10 bg-slate-900 shadow-2xl" style={{ paddingBottom: 'max(env(safe-area-inset-bottom), 16px)' }}>
            <div className="sticky top-0 z-10 px-4 py-4 border-b border-white/10 bg-slate-900/95 backdrop-blur flex items-center justify-between"><div><p className="text-xs uppercase tracking-[0.16em] text-amber-400">{protocolForm.id == null ? 'New' : 'Edit'}</p><h2 className="text-lg font-bold">Protocol</h2></div><button type="button" onClick={() => setShowProtocolForm(false)} className="h-10 w-10 rounded-xl bg-white/5 flex items-center justify-center"><X className="h-5 w-5" /></button></div>
            <div className="p-4 space-y-5">
              <label className="block"><span className="text-sm font-medium text-gray-300">Compound or hormone</span><input list="compound-options" value={protocolForm.medication} onChange={(event) => setProtocolForm({ ...protocolForm, medication: event.target.value })} placeholder="Start typing a name" autoCapitalize="words" className="mt-2 w-full h-12 rounded-xl bg-slate-950/70 border border-white/10 px-4" /><datalist id="compound-options">{COMPOUNDS.map((name) => <option key={name} value={name} />)}</datalist></label>
              <div className="grid grid-cols-[1fr_8rem] gap-3"><label><span className="text-sm font-medium text-gray-300">Dose</span><input type="number" inputMode="decimal" step="any" min="0" value={protocolForm.dose} onChange={(event) => setProtocolForm({ ...protocolForm, dose: event.target.value })} placeholder="0.00" className="mt-2 w-full h-12 rounded-xl bg-slate-950/70 border border-white/10 px-4" /></label><label><span className="text-sm font-medium text-gray-300">Unit</span><select value={protocolForm.doseUnit} onChange={(event) => setProtocolForm({ ...protocolForm, doseUnit: event.target.value })} className="mt-2 w-full h-12 rounded-xl bg-slate-950/70 border border-white/10 px-3">{UNITS.map((unit) => <option key={unit}>{unit}</option>)}</select></label></div>
              <div className="grid grid-cols-2 gap-3"><label><span className="text-sm font-medium text-gray-300">Syringe units <span className="text-gray-600">optional</span></span><input type="number" inputMode="decimal" step="any" min="0" value={protocolForm.syringeUnits} onChange={(event) => setProtocolForm({ ...protocolForm, syringeUnits: event.target.value })} placeholder="10" className="mt-2 w-full h-12 rounded-xl bg-slate-950/70 border border-white/10 px-4" /></label><label><span className="text-sm font-medium text-gray-300">Time</span><input type="time" value={protocolForm.scheduledTime} onChange={(event) => setProtocolForm({ ...protocolForm, scheduledTime: event.target.value })} className="mt-2 w-full h-12 rounded-xl bg-slate-950/70 border border-white/10 px-3" /></label></div>
              <div><span className="text-sm font-medium text-gray-300">Schedule</span><div className="mt-2 grid grid-cols-2 gap-2 rounded-xl bg-slate-950/60 p-1"><button type="button" onClick={() => setProtocolForm({ ...protocolForm, scheduleType: 'specific_days' })} className={`h-10 rounded-lg text-sm font-semibold ${protocolForm.scheduleType === 'specific_days' ? 'bg-amber-400 text-slate-950' : 'text-gray-500'}`}>Weekdays</button><button type="button" onClick={() => setProtocolForm({ ...protocolForm, scheduleType: 'recurring' })} className={`h-10 rounded-lg text-sm font-semibold ${protocolForm.scheduleType === 'recurring' ? 'bg-amber-400 text-slate-950' : 'text-gray-500'}`}>Every X days</button></div></div>
              {protocolForm.scheduleType === 'specific_days' ? <div><div className="grid grid-cols-7 gap-1.5">{DAYS.map((day, index) => <button type="button" key={day.label} onClick={() => toggleDay(index)} className={`h-11 rounded-xl text-sm font-bold ${protocolForm.specificDays.includes(index) ? 'bg-amber-400 text-slate-950' : 'bg-white/5 text-gray-500'}`} aria-label={day.label}>{day.short}</button>)}</div><div className="flex flex-wrap gap-2 mt-3"><button type="button" onClick={() => setProtocolForm({ ...protocolForm, specificDays: [0,1,2,3,4,5,6] })} className="px-3 py-2 rounded-lg bg-white/5 text-xs text-gray-400">Every day</button><button type="button" onClick={() => setProtocolForm({ ...protocolForm, specificDays: [1,3,5] })} className="px-3 py-2 rounded-lg bg-white/5 text-xs text-gray-400">Mon/Wed/Fri</button><button type="button" onClick={() => setProtocolForm({ ...protocolForm, specificDays: [3,6] })} className="px-3 py-2 rounded-lg bg-white/5 text-xs text-gray-400">Wed/Sat</button></div></div> : <div className="grid grid-cols-2 gap-3"><label><span className="text-sm font-medium text-gray-300">Every</span><div className="mt-2 relative"><input type="number" inputMode="numeric" min="1" max="365" value={protocolForm.frequencyDays} onChange={(event) => setProtocolForm({ ...protocolForm, frequencyDays: event.target.value })} className="w-full h-12 rounded-xl bg-slate-950/70 border border-white/10 px-4 pr-14" /><span className="absolute right-3 top-3.5 text-sm text-gray-600">days</span></div></label><label><span className="text-sm font-medium text-gray-300">Starting</span><input type="date" value={protocolForm.startDate} onChange={(event) => setProtocolForm({ ...protocolForm, startDate: event.target.value })} className="mt-2 w-full h-12 rounded-xl bg-slate-950/70 border border-white/10 px-3" /></label></div>}
              <div className="grid grid-cols-2 gap-3"><label><span className="text-sm font-medium text-gray-300">Route</span><select value={protocolForm.route} onChange={(event) => setProtocolForm({ ...protocolForm, route: event.target.value, site: ['Oral','Intranasal','Topical'].includes(event.target.value) ? 'N/A' : protocolForm.site })} className="mt-2 w-full h-12 rounded-xl bg-slate-950/70 border border-white/10 px-3">{ROUTES.map((route) => <option key={route}>{route}</option>)}</select></label><label><span className="text-sm font-medium text-gray-300">Site</span><select value={protocolForm.site} onChange={(event) => setProtocolForm({ ...protocolForm, site: event.target.value })} className="mt-2 w-full h-12 rounded-xl bg-slate-950/70 border border-white/10 px-3">{SITES.map((site) => <option key={site}>{site}</option>)}</select></label></div>
              <label className="block"><span className="text-sm font-medium text-gray-300">Notes <span className="text-gray-600">optional</span></span><textarea rows="3" value={protocolForm.notes} onChange={(event) => setProtocolForm({ ...protocolForm, notes: event.target.value })} placeholder="Anything you want visible in the record" className="mt-2 w-full rounded-xl bg-slate-950/70 border border-white/10 px-4 py-3 resize-none" /></label>
              {formError && <p className="rounded-xl bg-red-400/10 border border-red-400/20 px-3 py-2.5 text-sm text-red-300">{formError}</p>}
              <button type="submit" className="w-full py-3.5 rounded-xl bg-amber-400 text-slate-950 font-bold shadow-gold-glow active:scale-[0.98]">{protocolForm.id == null ? 'Add protocol' : 'Save changes'}</button>
            </div>
          </form>
        </div>
      )}

      {pendingCloudRestore && <div className="fixed inset-0 z-[60] bg-black/75 backdrop-blur-sm flex items-center justify-center p-4"><div className="w-full max-w-sm rounded-3xl border border-cyan-400/20 bg-slate-900 p-5 shadow-2xl"><Cloud className="h-8 w-8 text-cyan-300 mb-3" /><h2 className="text-xl font-bold">Cloud data found</h2><p className="text-sm text-gray-400 mt-2">Choose which tracker data Pep Talk should keep on this iPhone.</p><div className="space-y-2 mt-5"><button type="button" onClick={() => resolveCloudRestore('cloud')} className="w-full h-12 rounded-xl bg-cyan-400 text-slate-950 font-bold">Use cloud data</button><button type="button" onClick={() => resolveCloudRestore('local')} className="w-full h-12 rounded-xl bg-white/5 text-gray-300 font-medium">Keep this iPhone data</button></div></div></div>}
      {toast && <div className="fixed z-[70] left-4 right-4 bottom-24 max-w-sm mx-auto rounded-xl bg-white text-slate-950 px-4 py-3 text-sm font-semibold shadow-2xl flex items-center gap-2"><CheckCircle2 className="h-5 w-5 text-emerald-600" />{toast}</div>}
    </div>
  );
}

export default App;
