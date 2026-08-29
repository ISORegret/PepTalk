import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Capacitor } from '@capacitor/core';
import { ComposedChart, LineChart, Line, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, ReferenceArea, ReferenceLine } from 'recharts';
import { Scale, Syringe, Plus, TrendingDown, TrendingUp, Calendar, Trash2, Edit2, X, Activity, Calculator, LayoutDashboard, Wrench, ChevronDown, Bell, Ruler, Camera, Target, Clock, CheckCircle, AlertCircle, BookOpen, Smile, Meh, Frown, Zap, CalendarDays, Droplets, Beef, FileDown, MoreHorizontal, Trophy, UtensilsCrossed, Droplet, User, Cloud, WifiOff, Download, Sparkles, ChevronLeft, Stethoscope, Search, Layers, Info, Moon, HelpCircle, FileText, BarChart3 } from 'lucide-react';
import { useSupabaseAuth } from './context/SupabaseAuthContext.jsx';
import { checkForAppUpdate, dismissUpdatePrompt, openDownloadUrl } from './lib/appUpdateCheck.js';
import { formatCloudError, scheduleCloudSync } from './lib/cloudSync.js';
import { MEDICATION_EFFECT_PROFILES, MEDICATION_PHASE_TIMELINES, TYPICAL_SIDE_EFFECTS_BY_DAY } from './medicationInsights';
import { GOAL_CATEGORIES, GOAL_GUIDE_DISCLAIMER, GOAL_TRACK_ACTIONS, getStackSuggestions, getMedicationEducation } from './goalPeptideGuide.js';
import { getStackTimingContent } from './lib/stackTimingGuide.js';
import { PEP_TALK_FAQ } from './lib/pepTalkFaq.js';
import { downloadClinicianSummaryPdf } from './lib/clinicianPdf.js';
import { downloadGraphicalSummaryPdf } from './lib/graphicalSummaryPdf.js';
import { buildWeeklyDoseWeightPdf, getWeekStartsOnLabel } from './lib/weeklyDoseWeightPdf.js';
import { savePdfBlob } from './lib/savePdfBlob.js';
import GraphicalSummaryModal from './GraphicalSummaryModal.jsx';
import { computeSleepHours } from './lib/sleepUtils.js';
import { compressImageFileToDataUrl } from './lib/imageCompress.js';

const APP_VERSION = '3.0.0';
// Confirmed Regimen protocol concentrations. These belong to the protocol, not
// to Inventory, and let Today show the agreed U-100 draw without vial linking.
const REGIMEN_PROTOCOL_CONCENTRATIONS = {
  'Testosterone Cypionate': { concentration: 250 }, // 125 mg = 50 units
  Retatrutide: { concentration: 10 }, // 2.5 mg = 25 units
  KLOW: { concentration: 40 }, // 4 mg = 10 units
};
const MAIN_TABS = [
  { id: 'summary', icon: LayoutDashboard, label: 'Today' },
  { id: 'protocols', icon: Layers, label: 'Regimen' },
  { id: 'weight', icon: Scale, label: 'Progress' },
  { id: 'more', icon: MoreHorizontal, label: 'More' },
];

// Comprehensive peptide/medication list with pharmacokinetic data (halfLife in hours; used for level curve & phase labels)
const MEDICATIONS = [
  { name: 'Semaglutide', category: 'GLP-1', color: '#10b981', defaultSchedule: 7, halfLife: 168, peakHours: 48, effectDuration: 168 },
  { name: 'Rybelsus (Oral Semaglutide)', category: 'GLP-1', color: '#10b981', defaultSchedule: 1, halfLife: 168, peakHours: 4, effectDuration: 24 },
  { name: 'Tirzepatide', category: 'GLP-1/GIP', color: '#14b8a6', defaultSchedule: 7, halfLife: 120, peakHours: 48, effectDuration: 168 },
  { name: 'Liraglutide', category: 'GLP-1', color: '#059669', defaultSchedule: 1, halfLife: 13, peakHours: 12, effectDuration: 24 },
  { name: 'Dulaglutide', category: 'GLP-1', color: '#0d9488', defaultSchedule: 7, halfLife: 120, peakHours: 48, effectDuration: 168 },
  { name: '5-Amino-1MQ', category: 'Other', color: '#e99173', defaultSchedule: 1, halfLife: 7, peakHours: 2, effectDuration: 24 },
  { name: 'Cagrilintide', category: 'Other', color: '#ec8f72', defaultSchedule: 3.5, halfLife: 168, peakHours: 24, effectDuration: 168 },
  { name: 'Tesamorelin / Ipamorelin', category: 'Peptide', color: '#f08f70', defaultSchedule: 1, halfLife: 0.5, peakHours: 0.25, effectDuration: 4, blendComponents: ['Tesamorelin', 'Ipamorelin'], vialComposition: { Tesamorelin: 10, Ipamorelin: 3 } },
  { name: 'NAD+', category: 'Other', color: '#e99173', defaultSchedule: 2, halfLife: 0.75, peakHours: 0.5, effectDuration: 4 },
  // Retatrutide prefilled pen: dial "units" are 10 units = 1 mg (e.g. 50 units = 5 mg), not U-100 insulin syringe volume.
  { name: 'Retatrutide', category: 'Triple Agonist', color: '#8b5cf6', defaultSchedule: 7, halfLife: 144, peakHours: 48, effectDuration: 168 },
  { name: 'Testosterone Cypionate', category: 'Hormone', color: '#3b82f6', defaultSchedule: 7, halfLife: 192, peakHours: 48, effectDuration: 168, preConstituted: true, assumedConcentrationMgPerMl: 200 },
  { name: 'Testosterone Enanthate', category: 'Hormone', color: '#2563eb', defaultSchedule: 7, halfLife: 108, peakHours: 48, effectDuration: 168, preConstituted: true, assumedConcentrationMgPerMl: 200 },
  { name: 'HCG', category: 'Hormone', color: '#6366f1', defaultSchedule: 3, halfLife: 56, peakHours: 12, effectDuration: 72 },
  { name: 'BPC-157', category: 'Peptide', color: '#e8b84c', defaultSchedule: 1, halfLife: 4, peakHours: 2, effectDuration: 24 },
  { name: 'TB-500', category: 'Peptide', color: '#d97706', defaultSchedule: 3, halfLife: 2, peakHours: 2, effectDuration: 72 },
  { name: 'Ipamorelin', category: 'Peptide', color: '#fbbf24', defaultSchedule: 1, halfLife: 2, peakHours: 1, effectDuration: 4 },
  { name: 'CJC-1295', category: 'Peptide', color: '#f97316', defaultSchedule: 1, halfLife: 168, peakHours: 12, effectDuration: 168 },
  { name: 'Tesamorelin', category: 'Peptide', color: '#ea580c', defaultSchedule: 1, halfLife: 0.35, peakHours: 0.15, effectDuration: 3 },
  { name: 'Sermorelin', category: 'Peptide', color: '#fb923c', defaultSchedule: 1, halfLife: 0.12, peakHours: 0.5, effectDuration: 1 },
  { name: 'MK-677', category: 'Peptide', color: '#c2410c', defaultSchedule: 1, halfLife: 24, peakHours: 2, effectDuration: 24 },
  { name: 'AOD-9604', category: 'Peptide', color: '#ec4899', defaultSchedule: 1, halfLife: 0.5, peakHours: 0.5, effectDuration: 3 },
  { name: 'MOTS-C', category: 'Peptide', color: '#22c55e', defaultSchedule: 3, halfLife: 4, peakHours: 2, effectDuration: 24 },
  { name: 'Melanotan II', category: 'Peptide', color: '#db2777', defaultSchedule: 7, halfLife: 33, peakHours: 12, effectDuration: 168 },
  { name: 'PT-141', category: 'Peptide', color: '#be185d', defaultSchedule: 0, halfLife: 3, peakHours: 1, effectDuration: 8 },
  { name: 'Enclomiphene (Enclo)', category: 'SERM', color: '#7c3aed', defaultSchedule: 1, halfLife: 10, peakHours: 24, effectDuration: 24 },
  {
    name: 'KLOW',
    category: 'Peptide',
    color: '#0891b2',
    defaultSchedule: 1,
    halfLife: 4,
    peakHours: 2,
    effectDuration: 24,
    blendComponents: ['GHK-Cu', 'BPC-157', 'TB-500', 'KPV'],
    vialComposition: { 'GHK-Cu': 50, 'BPC-157': 10, 'TB-500': 10, KPV: 10 },
    reconstitutionMl: 2,
  },
  { name: 'Kisspeptin', category: 'Peptide', color: '#a855f7', defaultSchedule: 3, halfLife: 4, peakHours: 2, effectDuration: 24 },
  { name: 'Gonadorelin', category: 'Peptide', color: '#9333ea', defaultSchedule: 2, halfLife: 0.3, peakHours: 0.5, effectDuration: 4 },
  { name: 'Tesa/Ipa Blend (5mg/5mg)', category: 'Peptide', color: '#f59e0b', defaultSchedule: 1, halfLife: 2, peakHours: 0.5, effectDuration: 6, blendComponents: ['Tesamorelin', 'Ipamorelin'], vialComposition: { Tesamorelin: 5, Ipamorelin: 5 } },
  // Premixed CJC-1295 without DAC + Ipamorelin (vial total mg = sum of both; e.g. 10+10 mg + 2 mL BAC → 4 U ≈ ~200 mcg each — Tesamorelin 18 U is a separate vial)
  { name: 'CJC/Ipa Blend (10mg/10mg)', category: 'Peptide', color: '#ea580c', defaultSchedule: 1, halfLife: 2, peakHours: 1, effectDuration: 8, blendComponents: ['CJC-1295', 'Ipamorelin'], vialComposition: { 'CJC-1295': 10, Ipamorelin: 10 } },
  { name: 'Tesa/Ipa/CJC Blend (6mg/3mg/3mg)', category: 'Peptide', color: '#b45309', defaultSchedule: 1, halfLife: 2, peakHours: 0.5, effectDuration: 8, blendComponents: ['Tesamorelin', 'Ipamorelin', 'CJC-1295'], vialComposition: { Tesamorelin: 6, Ipamorelin: 3, 'CJC-1295': 3 } },
  { name: 'BPC/TB Blend (5mg/5mg)', category: 'Peptide', color: '#ca8a04', defaultSchedule: 3, halfLife: 3, peakHours: 2, effectDuration: 48, blendComponents: ['BPC-157', 'TB-500'], vialComposition: { 'BPC-157': 5, 'TB-500': 5 } },
  { name: 'Fragment 176-191', category: 'Peptide', color: '#06b6d4', defaultSchedule: 1, halfLife: 2, peakHours: 1, effectDuration: 12 },
  { name: 'GHK-Cu', category: 'Peptide', color: '#0ea5e9', defaultSchedule: 1, halfLife: 1, peakHours: 0.5, effectDuration: 24 },
  { name: 'Semax', category: 'Peptide', color: '#6366f1', defaultSchedule: 1, halfLife: 0.5, peakHours: 0.5, effectDuration: 4 },
  { name: 'Epithalon', category: 'Peptide', color: '#64748b', defaultSchedule: 7, halfLife: 1, peakHours: 1, effectDuration: 24 },
  { name: 'BPC-157 (Oral)', category: 'Peptide', color: '#eab308', defaultSchedule: 1, halfLife: 4, peakHours: 2, effectDuration: 24 },
  { name: 'Anamorelin', category: 'Peptide', color: '#ca8a04', defaultSchedule: 1, halfLife: 2, peakHours: 1, effectDuration: 8 },
  { name: 'Other', category: 'Other', color: '#6b7280', defaultSchedule: 7, halfLife: 168, peakHours: 24, effectDuration: 168 }
];

// User-confirmed Regimen history from the Aug 27, 2026 screenshots. This is merged once and
// deduplicated so an existing PepTalk entry is never replaced or counted twice.
const REGIMEN_5_AMINO_1MQ_IMPORT = [
  ['2026-08-27', '06:00', 5, 'Love Handles (L)'],
  ['2026-08-26', '05:58', 5, null],
  ['2026-08-25', '06:00', 2.5, null],
  ['2026-08-24', '06:19', 2.5, null],
  ['2026-08-23', '09:11', 3, null],
  ['2026-08-14', '06:10', 3.55, 'Belly (Right)'],
  ['2026-08-13', '09:03', 3.55, 'Belly (Right)'],
  ['2026-08-12', '06:06', 3.55, 'Belly (Right)'],
  ['2026-08-11', '22:09', 4.4, 'Belly (Left)'],
  ['2026-08-10', '06:23', 2.5, 'Belly (Left)'],
  ['2026-08-09', '09:14', 3.6, 'Belly (Right)'],
  ['2026-08-08', '07:05', 2.5, 'Belly (Right)'],
  ['2026-08-07', '05:58', 2.5, 'Belly (Left)'],
  ['2026-08-06', '06:16', 2.5, 'Belly (Right)'],
  ['2026-08-05', '06:14', 2.5, 'Belly (Right)'],
  ['2026-08-04', '06:26', 2.5, 'Belly (Left)'],
  ['2026-08-03', '06:03', 2.5, 'Belly (Right)'],
  ['2026-08-02', '09:07', 2.5, 'Love Handles (R)'],
  ['2026-08-01', '06:00', 2.5, null],
  ['2026-07-31', '06:00', 2.5, null],
].map(([date, time, dose, site], index) => ({
  id: `regimen-5-amino-1mq-${date}-${time.replace(':', '')}`,
  type: '5-Amino-1MQ',
  dose,
  unit: 'mg',
  date,
  time,
  route: 'SubQ',
  ...(site ? { site } : {}),
  notes: 'Imported from Regimen screenshot',
  sideEffects: [],
  importOrder: index,
}));

const REGIMEN_CAGRILINTIDE_IMPORT = [
  ['2026-08-26', '23:25', 0.13, null],
  ['2026-08-22', '23:46', 0.3, null],
  ['2026-08-19', '22:00', 0.13, 'Upper Arm (Left)'],
  ['2026-08-12', '22:00', 0.13, 'Love Handles (L)'],
  ['2026-08-08', '22:00', 0.13, 'Belly (Left)'],
  ['2026-08-05', '23:34', 0.13, 'Belly (Left)'],
  ['2026-08-01', '22:00', 0.13, 'Belly (Right)'],
  ['2026-07-29', '22:00', 0.13, null],
].map(([date, time, dose, site]) => ({
  id: `regimen-cagrilintide-${date}-${time.replace(':', '')}`,
  type: 'Cagrilintide',
  dose,
  unit: 'mg',
  date,
  time,
  route: 'SubQ',
  ...(site ? { site } : {}),
  notes: 'Imported from Regimen screenshot',
  sideEffects: [],
}));

const REGIMEN_TESAMORELIN_IPAMORELIN_IMPORT = [
  ['2026-08-27', '06:00', 20, 'Love Handles (L)'],
  ['2026-08-26', '05:58', 20, null],
  ['2026-08-25', '02:22', 10, null],
  ['2026-08-24', '06:20', 10, null],
  ['2026-08-22', '23:47', 10, 'Love Handles (R)'],
].map(([date, time, dose, site]) => ({
  id: `regimen-tesamorelin-ipamorelin-${date}-${time.replace(':', '')}`,
  type: 'Tesamorelin / Ipamorelin',
  dose,
  unit: 'IU',
  date,
  time,
  route: 'SubQ',
  ...(site ? { site } : {}),
  notes: 'Imported from Regimen screenshot',
  sideEffects: [],
}));

const REGIMEN_TESTOSTERONE_CYPIONATE_IMPORT = [
  ['2026-08-26', '23:25', 125, 'Glute (Left)', 'IM'],
  ['2026-08-22', '23:46', 125, 'Outer Thigh (Right)', 'IM'],
  ['2026-08-19', '22:00', 125, 'Ventrogluteal (Right)', 'IM'],
  ['2026-08-15', '22:00', 125, 'Ventrogluteal (Left)', 'IM'],
  ['2026-08-12', '22:00', 125, 'Outer Thigh (Right)', 'IM'],
  ['2026-08-08', '22:00', 125, 'Love Handles (R)', 'SubQ'],
  ['2026-08-05', '23:34', 125, 'Outer Thigh (Right)', 'IM'],
  ['2026-08-01', '22:00', 150, null, null],
  ['2026-07-29', '22:00', 125, null, null],
  ['2026-07-25', '22:00', 125, null, null],
  ['2026-07-22', '22:00', 125, null, null],
].map(([date, time, dose, site, route]) => ({
  id: `regimen-testosterone-cypionate-${date}-${time.replace(':', '')}`,
  type: 'Testosterone Cypionate',
  dose,
  unit: 'mg',
  date,
  time,
  ...(route ? { route } : {}),
  ...(site ? { site } : {}),
  notes: 'Imported from Regimen screenshot',
  sideEffects: [],
}));

const REGIMEN_RETATRUTIDE_IMPORT = [
  ['2026-08-26', '23:25', 2.5, null],
  ['2026-08-22', '23:46', 2, 'Belly (Left)'],
  ['2026-08-12', '22:00', 2, null],
  ['2026-08-08', '22:00', 2.5, 'Belly (Left)'],
  ['2026-08-05', '22:00', 2, 'Belly (Left)'],
  ['2026-08-01', '22:00', 2, 'Belly (Left)'],
  ['2026-07-29', '22:00', 1, null],
  ['2026-07-25', '22:00', 1, null],
  ['2026-07-22', '22:00', 1, null],
].map(([date, time, dose, site]) => ({
  id: `regimen-retatrutide-${date}-${time.replace(':', '')}`,
  type: 'Retatrutide',
  dose,
  unit: 'mg',
  date,
  time,
  route: 'SubQ',
  ...(site ? { site } : {}),
  notes: 'Imported from Regimen screenshot',
  sideEffects: [],
}));

const REGIMEN_KLOW_IMPORT = [
  ['2026-08-26', '22:00', 8, null],
  ['2026-08-24', '21:45', 4, null],
  ['2026-08-23', '22:00', 4, null],
  ['2026-08-22', '23:47', 4, 'Love Handles (R)'],
  ['2026-08-19', '22:00', 2.84, 'Thigh (Left)'],
  ['2026-08-17', '22:00', 2.84, 'Glute SubQ (Left)'],
  ['2026-08-14', '22:00', 2.84, 'Glute SubQ (Right)'],
  ['2026-08-13', '22:00', 2.84, 'Belly (Left)'],
  ['2026-08-12', '22:00', 2.84, 'Thigh (Right)'],
  ['2026-08-11', '22:00', 2.84, 'Belly (Right)'],
  ['2026-08-10', '22:00', 2.84, 'Belly (Right)'],
  ['2026-08-09', '22:00', 5.8, null],
  ['2026-08-07', '22:00', 2.84, 'Glute SubQ (Left)'],
  ['2026-08-06', '22:00', 2.84, 'Glute SubQ (Right)'],
  ['2026-08-05', '23:34', 2.84, 'Belly (Left)'],
  ['2026-08-04', '22:57', 2.84, 'Love Handles (L)'],
  ['2026-08-03', '22:00', 2.84, 'Thigh (Right)'],
  ['2026-08-02', '22:00', 2.84, 'Love Handles (L)'],
  ['2026-08-01', '22:00', 2.84, 'Love Handles (R)'],
  ['2026-07-31', '23:18', 2.84, 'Belly (Left)'],
  ['2026-07-30', '22:00', 2.84, null],
].map(([date, time, dose, site]) => ({
  id: `regimen-klow-${date}-${time.replace(':', '')}`,
  type: 'KLOW',
  dose,
  unit: 'mg',
  date,
  time,
  route: 'SubQ',
  ...(site ? { site } : {}),
  notes: 'Imported from Regimen screenshot',
  sideEffects: [],
}));

const REGIMEN_NAD_IMPORT = [
  ['2026-08-26', '05:58', 25, null],
  ['2026-08-24', '06:19', 25, null],
  ['2026-08-19', '06:00', 25, 'Love Handles (R)'],
  ['2026-08-14', '06:10', 25, 'Belly (Right)'],
  ['2026-08-12', '06:10', 25, 'Belly (Right)'],
  ['2026-08-10', '06:24', 20, 'Love Handles (R)'],
  ['2026-08-07', '05:58', 20, 'Belly (Left)'],
  ['2026-08-05', '06:15', 20, 'Belly (Right)'],
  ['2026-08-03', '06:04', 20, 'Love Handles (L)'],
  ['2026-07-31', '09:08', 20, null],
  ['2026-07-29', '06:00', 20, null],
].map(([date, time, dose, site]) => ({
  id: `regimen-nad-${date}-${time.replace(':', '')}`,
  type: 'NAD+',
  dose,
  unit: 'mg',
  date,
  time,
  route: 'SubQ',
  ...(site ? { site } : {}),
  notes: 'Imported from Regimen screenshot',
  sideEffects: [],
}));

// One consistent reading per day keeps the weight graph useful when Apple Health contains
// several scale readings on the same day. These are the earliest visible daily readings.
const APPLE_HEALTH_WEIGHT_IMPORT = [
  ['2026-08-27', '05:42', 189.2],
  ['2026-08-26', '05:32', 188.7],
  ['2026-08-25', '02:01', 185.8],
  ['2026-08-24', '05:42', 186.3],
  ['2026-08-23', '08:58', 187],
  ['2026-08-22', '05:53', 187.6],
  ['2026-08-21', '05:46', 187.8],
  ['2026-08-20', '17:19', 188.3],
  ['2026-08-19', '05:53', 185.8],
  ['2026-08-18', '05:44', 185],
  ['2026-08-17', '05:43', 185.2],
].map(([date, time, weight]) => ({
  id: new Date(`${date}T${time}:00`).getTime(),
  date,
  time,
  weight,
  source: 'Apple Health screenshot',
}));

/** Retatrutide pen dial: units ÷ this = mg (10 units = 1 mg). Not U-100 (100 units = 1 mL). */
const RETATRUTIDE_UNITS_PER_MG = 10;

/** Schedule picker: offer Mon–Fri / weekend-off shortcut (common GH-secretagogue & some daily peptide protocols). */
const MON_FRI_SCHEDULE_HINT_MEDS = new Set([
  'KLOW',
  'Tesa/Ipa Blend (5mg/5mg)',
  'CJC/Ipa Blend (10mg/10mg)',
  'Tesa/Ipa/CJC Blend (6mg/3mg/3mg)',
]);

// Effect profiles for different medication categories
const EFFECT_PROFILES = {
  'GLP-1': {
    effects: ['Appetite Suppression', 'Nausea Risk', 'Blood Sugar Control', 'Weight Loss'],
    sideEffects: ['Nausea', 'Fatigue', 'Constipation', 'Headache'],
    peakEffects: 'Days 1-3 post-injection',
    steadyState: '4-5 weeks of consistent dosing'
  },
  'GLP-1/GIP': {
    effects: ['Appetite Suppression', 'Insulin Sensitivity', 'Fat Burning', 'Weight Loss'],
    sideEffects: ['Nausea', 'Diarrhea', 'Fatigue', 'Injection Site Reactions'],
    peakEffects: 'Days 1-3 post-injection',
    steadyState: '4-5 weeks of consistent dosing'
  },
  'Triple Agonist': {
    effects: ['Appetite Control', 'Metabolic Boost', 'Fat Loss', 'Energy Increase'],
    sideEffects: ['Nausea', 'Increased Heart Rate', 'Fatigue'],
    peakEffects: 'Days 1-3 post-injection',
    steadyState: '4-6 weeks of consistent dosing'
  },
  'Hormone': {
    effects: ['Muscle Growth', 'Energy', 'Mood Enhancement', 'Libido'],
    sideEffects: ['Injection Site Pain', 'Acne', 'Mood Changes'],
    peakEffects: 'Days 2-3 post-injection',
    steadyState: '4 weeks of consistent dosing'
  },
  'Peptide': {
    effects: ['Healing', 'Recovery', 'Growth Hormone Release'],
    sideEffects: ['Injection Site Reactions', 'Water Retention'],
    peakEffects: 'Hours to days post-injection',
    steadyState: 'Varies by peptide'
  },
  'SERM': {
    effects: ['LH/FSH Stimulation', 'Natural Testosterone Support', 'Estrogen Receptor Modulation', 'Fertility Support'],
    sideEffects: ['Visual Disturbances', 'Mood Changes', 'Hot Flashes', 'Headache'],
    peakEffects: 'Days 1–2 of daily dosing; steady state in 1–2 weeks',
    steadyState: '1–2 weeks of consistent daily dosing'
  }
};

// Typical weekly weight loss (lb/week) from trials — for "On track?" comparison (approximate)
const TYPICAL_WEEKLY_LOSS = {
  'Semaglutide': 0.6, 'Wegovy': 0.6, 'Ozempic': 0.5,
  'Rybelsus (Oral Semaglutide)': 0.4,
  'Tirzepatide': 0.7, 'Mounjaro': 0.7, 'Zepbound': 0.7,
  'Liraglutide': 0.4, 'Dulaglutide': 0.4,
  'Retatrutide': 0.8
};

// Dose-specific typical lb/week from trials — dose = mg per 7 days (weekly total)
// [ [weeklyMg, rate], ... ] sorted ascending by weeklyMg
const TYPICAL_WEEKLY_LOSS_BY_DOSE = {
  'Semaglutide': [[0.25, 0.2], [0.5, 0.35], [1, 0.5], [2.4, 0.6]],
  'Wegovy': [[0.25, 0.2], [0.5, 0.35], [1, 0.5], [2.4, 0.6]],
  'Ozempic': [[0.25, 0.2], [0.5, 0.35], [1, 0.5], [2, 0.5]],
  'Rybelsus (Oral Semaglutide)': [[3, 0.3], [7, 0.35], [14, 0.4]],
  'Tirzepatide': [[2.5, 0.3], [5, 0.5], [7.5, 0.6], [10, 0.65], [15, 0.7]],
  'Mounjaro': [[2.5, 0.3], [5, 0.5], [7.5, 0.6], [10, 0.65], [15, 0.7]],
  'Zepbound': [[2.5, 0.3], [5, 0.5], [7.5, 0.6], [10, 0.65], [15, 0.7]],
  'Liraglutide': [[0.6, 0.2], [1.2, 0.3], [1.8, 0.35], [2.4, 0.4], [3, 0.4]],
  'Dulaglutide': [[0.75, 0.25], [1.5, 0.35], [3, 0.4], [4.5, 0.4]],
  'Retatrutide': [[0.5, 0.4], [1, 0.5], [2, 0.65], [4, 0.75], [6, 0.78], [8, 0.8], [12, 0.85]]
};

function getTypicalWeeklyLossForDose(medName, doseMg) {
  const byDose = TYPICAL_WEEKLY_LOSS_BY_DOSE[medName];
  if (byDose && byDose.length > 0 && doseMg != null && !isNaN(doseMg)) {
    let rate = byDose[0][1];
    for (const [dose, r] of byDose) {
      if (doseMg >= dose) rate = r;
    }
    return rate;
  }
  return TYPICAL_WEEKLY_LOSS[medName] ?? TYPICAL_WEEKLY_LOSS['Semaglutide'] ?? 0.5;
}

// Simple meal estimator: common foods (cal, protein, carbs, fat per serving; optional hydrationOz)
const COMMON_FOODS = {
  'egg': { cal: 70, protein: 6, carbs: 0.5, fat: 5 },
  'eggs': { cal: 70, protein: 6, carbs: 0.5, fat: 5 },
  'toast': { cal: 80, protein: 3, carbs: 14, fat: 1 },
  'bread': { cal: 80, protein: 3, carbs: 14, fat: 1 },
  'chicken breast': { cal: 165, protein: 31, carbs: 0, fat: 4 },
  'chicken thigh': { cal: 209, protein: 26, carbs: 0, fat: 11 },
  'chicken': { cal: 165, protein: 31, carbs: 0, fat: 4 },
  'turkey': { cal: 135, protein: 30, carbs: 0, fat: 1 },
  'salmon': { cal: 208, protein: 20, carbs: 0, fat: 13 },
  'tilapia': { cal: 110, protein: 23, carbs: 0, fat: 2 },
  'shrimp': { cal: 100, protein: 24, carbs: 0.5, fat: 0.3 },
  'tuna': { cal: 130, protein: 28, carbs: 0, fat: 1 },
  'ground beef': { cal: 215, protein: 24, carbs: 0, fat: 13 },
  'steak': { cal: 270, protein: 26, carbs: 0, fat: 17 },
  'bacon': { cal: 45, protein: 3, carbs: 0, fat: 3 },
  'pork chop': { cal: 250, protein: 26, carbs: 0, fat: 15 },
  'greek yogurt': { cal: 100, protein: 17, carbs: 6, fat: 0.7 },
  'yogurt': { cal: 100, protein: 10, carbs: 15, fat: 2 },
  'cottage cheese': { cal: 120, protein: 14, carbs: 6, fat: 5 },
  'protein shake': { cal: 120, protein: 24, carbs: 3, fat: 1 },
  'protein bar': { cal: 200, protein: 20, carbs: 22, fat: 6 },
  'oatmeal': { cal: 150, protein: 5, carbs: 27, fat: 3 },
  'oats': { cal: 150, protein: 5, carbs: 27, fat: 3 },
  'rice': { cal: 205, protein: 4, carbs: 45, fat: 0.4 },
  'quinoa': { cal: 220, protein: 8, carbs: 39, fat: 4 },
  'pasta': { cal: 220, protein: 8, carbs: 43, fat: 1 },
  'sweet potato': { cal: 103, protein: 2, carbs: 24, fat: 0 },
  'potato': { cal: 160, protein: 2, carbs: 37, fat: 0 },
  'broccoli': { cal: 55, protein: 4, carbs: 11, fat: 0.6 },
  'spinach': { cal: 23, protein: 3, carbs: 4, fat: 0.4 },
  'kale': { cal: 35, protein: 3, carbs: 4, fat: 1 },
  'asparagus': { cal: 20, protein: 2, carbs: 4, fat: 0 },
  'green beans': { cal: 35, protein: 2, carbs: 8, fat: 0 },
  'carrots': { cal: 25, protein: 1, carbs: 6, fat: 0 },
  'cauliflower': { cal: 25, protein: 2, carbs: 5, fat: 0 },
  'salad': { cal: 50, protein: 3, carbs: 8, fat: 1 },
  'chicken salad': { cal: 350, protein: 30, carbs: 12, fat: 20 },
  'caesar salad': { cal: 360, protein: 12, carbs: 18, fat: 28 },
  'avocado': { cal: 240, protein: 3, carbs: 13, fat: 22 },
  'banana': { cal: 105, protein: 1, carbs: 27, fat: 0.4 },
  'apple': { cal: 95, protein: 0.5, carbs: 25, fat: 0.3 },
  'orange': { cal: 62, protein: 1, carbs: 15, fat: 0.2 },
  'berries': { cal: 50, protein: 1, carbs: 12, fat: 0.3 },
  'strawberries': { cal: 50, protein: 1, carbs: 12, fat: 0.3 },
  'blueberries': { cal: 85, protein: 1, carbs: 21, fat: 0.5 },
  'grapefruit': { cal: 52, protein: 1, carbs: 13, fat: 0.2 },
  'pear': { cal: 100, protein: 1, carbs: 27, fat: 0.2 },
  'nuts': { cal: 170, protein: 6, carbs: 6, fat: 15 },
  'almonds': { cal: 170, protein: 6, carbs: 6, fat: 15 },
  'peanut butter': { cal: 190, protein: 8, carbs: 7, fat: 16 },
  'hummus': { cal: 70, protein: 2, carbs: 6, fat: 5 },
  'cheese': { cal: 110, protein: 7, carbs: 1, fat: 9 },
  'milk': { cal: 150, protein: 8, carbs: 12, fat: 8 },
  'almond milk': { cal: 40, protein: 1, carbs: 2, fat: 3 },
  'smoothie': { cal: 200, protein: 5, carbs: 35, fat: 5 },
  'soup': { cal: 120, protein: 6, carbs: 15, fat: 4 },
  'chicken soup': { cal: 90, protein: 8, carbs: 8, fat: 3 },
  'burger': { cal: 350, protein: 20, carbs: 30, fat: 18 },
  'pizza': { cal: 285, protein: 12, carbs: 36, fat: 10 },
  'sandwich': { cal: 350, protein: 18, carbs: 40, fat: 12 },
  'taco': { cal: 170, protein: 8, carbs: 13, fat: 10 },
  'burrito': { cal: 500, protein: 22, carbs: 55, fat: 22 },
  'coffee': { cal: 2, protein: 0, carbs: 0, fat: 0, hydrationOz: 8 },
  'water': { cal: 0, protein: 0, carbs: 0, fat: 0, hydrationOz: 8 },
  'tea': { cal: 2, protein: 0, carbs: 0, fat: 0, hydrationOz: 8 },
  'soda': { cal: 140, protein: 0, carbs: 39, fat: 0, hydrationOz: 12 },
  'juice': { cal: 110, protein: 1, carbs: 26, fat: 0, hydrationOz: 8 },
  'energy drink': { cal: 110, protein: 0, carbs: 28, fat: 0, hydrationOz: 8 }
};

function estimateMealFromDescription(desc) {
  const text = (desc || '').toLowerCase().trim();
  if (!text) return null;
  const hasOz = /\d+\s*oz/i.test(text);
  let mult = 1;
  let rest = text;
  if (!hasOz) {
    const numMatch = text.match(/^(\d+(?:\.\d+)?)\s+(.+)$/);
    if (numMatch) {
      mult = parseFloat(numMatch[1]);
      rest = numMatch[2].trim();
    }
  }
  const ozMatch = rest.match(/(\d+)\s*oz/i);
  const oz = ozMatch ? parseInt(ozMatch[1], 10) : null;
  const withoutOz = oz != null ? rest.replace(/\d+\s*oz\s*/gi, ' ').replace(/\s+/g, ' ').trim() : rest;
  const key = Object.keys(COMMON_FOODS).find(k => withoutOz === k || withoutOz.includes(k));
  const food = key ? COMMON_FOODS[key] : null;
  if (!food) return null;
  const hydrationOz = (oz != null && (key === 'water' || key === 'coffee' || key === 'tea')) ? oz : (food.hydrationOz ?? 0) * mult;
  return {
    label: desc.trim().slice(0, 40),
    calories: Math.round((food.cal || 0) * mult),
    protein: Math.round((food.protein || 0) * mult),
    carbs: Math.round((food.carbs || 0) * mult),
    fat: Math.round((food.fat || 0) * mult),
    hydrationOz: hydrationOz ? Math.round(hydrationOz) : 0
  };
}

// Phase timelines for each medication category (like glapp.io)
const PHASE_TIMELINES = {
  'GLP-1': {
    phases: [
      {
        name: 'Absorption',
        hours: [0, 24],
        icon: '⬆️',
        color: 'text-blue-400',
        bgColor: 'bg-blue-500/10',
        borderColor: 'border-blue-500/30',
        description: 'Medication entering your bloodstream',
        whatsHappening: [
          'Subcutaneous absorption beginning',
          'Medication reaching circulation',
          'Initial receptor binding starting'
        ],
        whatToExpect: [
          'Minimal effects yet',
          'Some people feel slight appetite reduction',
          'Side effects unlikely'
        ],
        tips: [
          'Stay hydrated',
          'Eat normally today',
          'Note injection site for rotation'
        ]
      },
      {
        name: 'Rising Effect',
        hours: [24, 48],
        icon: '📈',
        color: 'text-yellow-400',
        bgColor: 'bg-yellow-500/10',
        borderColor: 'border-yellow-500/30',
        description: 'Effects building as levels increase',
        whatsHappening: [
          'GLP-1 receptors activating',
          'Gastric emptying slowing',
          'Appetite signals decreasing'
        ],
        whatToExpect: [
          'Appetite reduction becoming noticeable',
          'Feeling fuller on less food',
          'Nausea may begin (usually mild)'
        ],
        tips: [
          'Eat smaller portions',
          'Choose bland foods if nauseated',
          'Sip water throughout day'
        ]
      },
      {
        name: 'Peak Effect',
        hours: [48, 96],
        icon: '🎯',
        color: 'text-green-500',
        bgColor: 'bg-green-500/10',
        borderColor: 'border-green-500/30',
        description: 'Maximum medication concentration and effectiveness',
        whatsHappening: [
          'Peak blood concentration reached',
          'Maximum appetite suppression',
          'Strongest therapeutic effects'
        ],
        whatToExpect: [
          'Significant reduction in hunger',
          '"Food noise" at minimum',
          'Highest nausea risk (if occurs)'
        ],
        tips: [
          'Focus on protein intake',
          'Small, frequent meals work best',
          'Ginger or bland foods for nausea',
          'This is prime weight loss window'
        ]
      },
      {
        name: 'Cruise Phase',
        hours: [96, 144],
        icon: '⚡',
        color: 'text-cyan-400',
        bgColor: 'bg-cyan-500/10',
        borderColor: 'border-cyan-500/30',
        description: 'Optimal therapeutic window with stable effects',
        whatsHappening: [
          'Stable medication levels',
          'Consistent appetite control',
          'Fat oxidation elevated'
        ],
        whatToExpect: [
          'Steady, comfortable appetite suppression',
          'Side effects minimal or resolved',
          'Best overall feeling of the week'
        ],
        tips: [
          'Exercise most effective now',
          'Maintain consistent eating schedule',
          'Enjoy the stable energy',
          'Track your weight - best time to see loss'
        ]
      },
      {
        name: 'Declining',
        hours: [144, 168],
        icon: '📉',
        color: 'text-orange-400',
        bgColor: 'bg-orange-500/10',
        borderColor: 'border-orange-500/30',
        description: 'Medication levels dropping, effects fading',
        whatsHappening: [
          'Blood concentration decreasing',
          'Receptor activity reducing',
          'Effects gradually waning'
        ],
        whatToExpect: [
          'Appetite slowly returning',
          'Food thoughts more frequent',
          'Still have appetite control, but less'
        ],
        tips: [
          'Prepare for next injection',
          'Stay mindful of portions',
          'Normal to feel hungrier',
          'Next dose coming soon'
        ]
      },
      {
        name: 'Trough',
        hours: [168, 999],
        icon: '💉',
        color: 'text-red-400',
        bgColor: 'bg-red-500/10',
        borderColor: 'border-red-500/30',
        description: 'Time for next injection',
        whatsHappening: [
          'Medication mostly cleared',
          'Baseline appetite returning',
          'Ready for next dose'
        ],
        whatToExpect: [
          'Hunger similar to pre-medication',
          'Food noise may return',
          'Effects minimal'
        ],
        tips: [
          'Inject your next dose today',
          'Plan your injection timing',
          'Cycle starts over tomorrow',
          'Consider injection site rotation'
        ]
      }
    ]
  },
  'GLP-1/GIP': {
    phases: [
      {
        name: 'Absorption',
        hours: [0, 24],
        icon: '⬆️',
        color: 'text-blue-400',
        bgColor: 'bg-blue-500/10',
        borderColor: 'border-blue-500/30',
        description: 'Dual agonist entering system',
        whatsHappening: [
          'GLP-1 and GIP receptors being activated',
          'Medication absorbing from injection site',
          'Initial metabolic changes starting'
        ],
        whatToExpect: [
          'Minimal effects in first hours',
          'Some energy changes possible',
          'Side effects rare this early'
        ],
        tips: [
          'Eat a balanced meal today',
          'Stay well hydrated',
          'Normal activity fine'
        ]
      },
      {
        name: 'Rising Effect',
        hours: [24, 48],
        icon: '📈',
        color: 'text-yellow-400',
        bgColor: 'bg-yellow-500/10',
        borderColor: 'border-yellow-500/30',
        description: 'Dual action ramping up',
        whatsHappening: [
          'GLP-1 reducing appetite',
          'GIP improving insulin sensitivity',
          'Metabolic rate increasing'
        ],
        whatToExpect: [
          'Appetite reduction starting',
          'Possible energy increase',
          'Mild GI effects may begin'
        ],
        tips: [
          'Notice how you feel with food',
          'Smaller portions work better',
          'Stay hydrated'
        ]
      },
      {
        name: 'Peak Effect',
        hours: [48, 96],
        icon: '🎯',
        color: 'text-green-500',
        bgColor: 'bg-green-500/10',
        borderColor: 'border-green-500/30',
        description: 'Maximum dual-agonist effect',
        whatsHappening: [
          'Peak concentration achieved',
          'Both GLP-1 and GIP maximally active',
          'Strongest appetite suppression',
          'Maximum metabolic effects'
        ],
        whatToExpect: [
          'Significant hunger reduction',
          'Enhanced fat burning',
          'Possible nausea or GI effects',
          'Steady energy levels'
        ],
        tips: [
          'High protein meals critical',
          'Eat slowly and mindfully',
          'Best weight loss window - stay active',
          'Manage any GI symptoms'
        ]
      },
      {
        name: 'Cruise Phase',
        hours: [96, 144],
        icon: '⚡',
        color: 'text-cyan-400',
        bgColor: 'bg-cyan-500/10',
        borderColor: 'border-cyan-500/30',
        description: 'Sweet spot - stable powerful effects',
        whatsHappening: [
          'Optimal therapeutic range',
          'Sustained appetite control',
          'Consistent metabolic boost',
          'Best insulin sensitivity'
        ],
        whatToExpect: [
          'Comfortable appetite suppression',
          'Stable energy all day',
          'Side effects usually minimal',
          'Feel your best this phase'
        ],
        tips: [
          'Great time for exercise',
          'Body composition changes most visible',
          'Maintain protein goals',
          'Enjoy the smooth effects'
        ]
      },
      {
        name: 'Declining',
        hours: [144, 168],
        icon: '📉',
        color: 'text-orange-400',
        bgColor: 'bg-orange-500/10',
        borderColor: 'border-orange-500/30',
        description: 'Effects gradually fading',
        whatsHappening: [
          'Medication levels dropping',
          'Appetite control lessening',
          'Still therapeutic but reduced'
        ],
        whatToExpect: [
          'Hunger slowly returning',
          'Still have control, just less',
          'Energy remains good'
        ],
        tips: [
          'Stay mindful of portions',
          'Plan for next injection',
          'Normal to notice changes'
        ]
      },
      {
        name: 'Trough',
        hours: [168, 999],
        icon: '💉',
        color: 'text-red-400',
        bgColor: 'bg-red-500/10',
        borderColor: 'border-red-500/30',
        description: 'Next injection due',
        whatsHappening: [
          'Low medication levels',
          'Baseline returning',
          'Time to re-dose'
        ],
        whatToExpect: [
          'Appetite more normal',
          'Ready for next dose',
          'Effects mostly gone'
        ],
        tips: [
          'Inject today for best results',
          'Consistent timing matters',
          'Rotate injection sites'
        ]
      }
    ]
  },
  'Triple Agonist': {
    phases: [
      {
        name: 'Absorption',
        hours: [0, 24],
        icon: '⬆️',
        color: 'text-blue-400',
        bgColor: 'bg-blue-500/10',
        borderColor: 'border-blue-500/30',
        description: 'Triple-action medication loading',
        whatsHappening: [
          'GLP-1, GIP, and Glucagon receptors activating',
          'Complex metabolic changes initiating',
          'Medication entering circulation'
        ],
        whatToExpect: [
          'Minimal effects first hours',
          'Possible energy changes',
          'Side effects unlikely yet'
        ],
        tips: [
          'Eat normally today',
          'Stay hydrated',
          'Monitor how you feel'
        ]
      },
      {
        name: 'Rising Effect',
        hours: [24, 48],
        icon: '📈',
        color: 'text-yellow-400',
        bgColor: 'bg-yellow-500/10',
        borderColor: 'border-yellow-500/30',
        description: 'Triple receptor activation building',
        whatsHappening: [
          'All three receptors becoming active',
          'Appetite suppression starting',
          'Metabolic rate increasing',
          'Energy expenditure rising'
        ],
        whatToExpect: [
          'Noticeable appetite reduction',
          'Possible energy boost',
          'Mild GI effects may start'
        ],
        tips: [
          'Reduce portion sizes',
          'High protein priority',
          'Normal activity encouraged'
        ]
      },
      {
        name: 'Peak Power',
        hours: [48, 96],
        icon: '🔥',
        color: 'text-green-500',
        bgColor: 'bg-green-500/10',
        borderColor: 'border-green-500/30',
        description: 'Maximum triple-agonist effect',
        whatsHappening: [
          'Peak blood levels achieved',
          'All three pathways maximally active',
          'Strongest appetite suppression',
          'Maximum fat burning',
          'Highest energy expenditure'
        ],
        whatToExpect: [
          'Dramatic hunger reduction',
          'Increased heart rate possible',
          'Enhanced thermogenesis',
          'Strongest effects of the week'
        ],
        tips: [
          'Monitor heart rate if concerned',
          'Prioritize protein intake',
          'Prime fat loss window',
          'Stay well hydrated',
          'Listen to your body'
        ]
      },
      {
        name: 'Cruise Phase',
        hours: [96, 144],
        icon: '⚡',
        color: 'text-cyan-400',
        bgColor: 'bg-cyan-500/10',
        borderColor: 'border-cyan-500/30',
        description: 'Sustained triple action',
        whatsHappening: [
          'Stable therapeutic levels',
          'Consistent multi-pathway effects',
          'Optimal metabolic state'
        ],
        whatToExpect: [
          'Excellent appetite control',
          'Steady elevated energy',
          'Side effects usually minimal',
          'Best overall feeling'
        ],
        tips: [
          'Great time for intense workouts',
          'Body recomposition most effective',
          'Maintain hydration and electrolytes',
          'Enjoy the powerful effects'
        ]
      },
      {
        name: 'Declining',
        hours: [144, 168],
        icon: '📉',
        color: 'text-orange-400',
        bgColor: 'bg-orange-500/10',
        borderColor: 'border-orange-500/30',
        description: 'Effects tapering off',
        whatsHappening: [
          'Medication levels dropping',
          'Receptor activity decreasing',
          'Effects gradually fading'
        ],
        whatToExpect: [
          'Appetite slowly returning',
          'Energy normalizing',
          'Still effective, but less'
        ],
        tips: [
          'Stay mindful with food',
          'Prepare for next dose',
          'Normal transition'
        ]
      },
      {
        name: 'Trough',
        hours: [168, 999],
        icon: '💉',
        color: 'text-red-400',
        bgColor: 'bg-red-500/10',
        borderColor: 'border-red-500/30',
        description: 'Re-dose needed',
        whatsHappening: [
          'Low medication levels',
          'Baseline state returning',
          'Time for next injection'
        ],
        whatToExpect: [
          'Hunger more normal',
          'Energy baseline',
          'Ready for next cycle'
        ],
        tips: [
          'Inject today',
          'Rotate injection site',
          'Cycle restarts tomorrow'
        ]
      }
    ]
  },
  'Hormone': {
    phases: [
      {
        name: 'Loading',
        hours: [0, 24],
        icon: '⬆️',
        color: 'text-blue-400',
        bgColor: 'bg-blue-500/10',
        borderColor: 'border-blue-500/30',
        description: 'Testosterone entering system',
        whatsHappening: [
          'Ester slowly releasing hormone',
          'Initial absorption from injection site',
          'Blood levels beginning to rise'
        ],
        whatToExpect: [
          'No immediate effects',
          'Possible injection site soreness',
          'Normal energy levels'
        ],
        tips: [
          'Massage injection site gently',
          'Stay active - promotes absorption',
          'Expect effects tomorrow onward'
        ]
      },
      {
        name: 'Rising',
        hours: [24, 72],
        icon: '📈',
        color: 'text-yellow-400',
        bgColor: 'bg-yellow-500/10',
        borderColor: 'border-yellow-500/30',
        description: 'Testosterone levels climbing',
        whatsHappening: [
          'Blood testosterone increasing',
          'Androgen receptors activating',
          'Protein synthesis ramping up'
        ],
        whatToExpect: [
          'Energy levels improving',
          'Mood enhancement starting',
          'Libido may increase',
          'Motivation improving'
        ],
        tips: [
          'Great time to start workouts',
          'Increased protein synthesis - eat more protein',
          'Notice mood and energy improvements'
        ]
      },
      {
        name: 'Peak',
        hours: [72, 96],
        icon: '💪',
        color: 'text-green-500',
        bgColor: 'bg-green-500/10',
        borderColor: 'border-green-500/30',
        description: 'Maximum testosterone levels',
        whatsHappening: [
          'Peak blood concentration',
          'Maximum anabolic effects',
          'Optimal androgen receptor activation',
          'Strongest muscle-building window'
        ],
        whatToExpect: [
          'Peak energy and motivation',
          'Best gym performance',
          'Heightened libido',
          'Confident, focused mood',
          'Possible oily skin/acne'
        ],
        tips: [
          'Schedule heavy workouts now',
          'Maximum muscle growth potential',
          'High protein intake critical',
          'Manage skin if needed',
          'Leverage the peak performance'
        ]
      },
      {
        name: 'Cruise',
        hours: [96, 144],
        icon: '⚡',
        color: 'text-cyan-400',
        bgColor: 'bg-cyan-500/10',
        borderColor: 'border-cyan-500/30',
        description: 'Optimal therapeutic range',
        whatsHappening: [
          'Stable elevated testosterone',
          'Consistent anabolic effects',
          'Sustained energy and recovery'
        ],
        whatToExpect: [
          'Excellent overall feeling',
          'Stable high energy',
          'Good recovery between workouts',
          'Consistent mood'
        ],
        tips: [
          'Maintain training intensity',
          'Focus on progressive overload',
          'Best time for consistent gains',
          'Enjoy the stable effects'
        ]
      },
      {
        name: 'Declining',
        hours: [144, 168],
        icon: '📉',
        color: 'text-orange-400',
        bgColor: 'bg-orange-500/10',
        borderColor: 'border-orange-500/30',
        description: 'Levels dropping toward baseline',
        whatsHappening: [
          'Testosterone levels falling',
          'Still above baseline',
          'Effects gradually reducing'
        ],
        whatToExpect: [
          'Energy still good but declining',
          'Still have therapeutic effects',
          'Approaching next dose time'
        ],
        tips: [
          'Training still productive',
          'Normal to feel slight changes',
          'Next injection coming soon'
        ]
      },
      {
        name: 'Trough',
        hours: [168, 999],
        icon: '💉',
        color: 'text-red-400',
        bgColor: 'bg-red-500/10',
        borderColor: 'border-red-500/30',
        description: 'Next injection needed',
        whatsHappening: [
          'Levels at or approaching baseline',
          'Time to re-dose for stability',
          'Avoid prolonged trough'
        ],
        whatToExpect: [
          'Energy returning to baseline',
          'Ready for next injection',
          'May notice slight mood dip if delayed'
        ],
        tips: [
          'Inject today for consistency',
          'Don\'t let levels drop too long',
          'Stable levels = better results'
        ]
      }
    ]
  },
  'Peptide': {
    phases: [
      {
        name: 'Rapid Absorption',
        hours: [0, 2],
        icon: '⚡',
        color: 'text-yellow-400',
        bgColor: 'bg-yellow-500/10',
        borderColor: 'border-yellow-500/30',
        description: 'Fast-acting peptide entering system',
        whatsHappening: [
          'Rapid peptide absorption',
          'Quick circulation',
          'Immediate receptor binding'
        ],
        whatToExpect: [
          'Effects starting within minutes to hours',
          'Depending on peptide type',
          'Minimal side effects'
        ],
        tips: [
          'Effects begin quickly',
          'Stay hydrated',
          'Monitor how you respond'
        ]
      },
      {
        name: 'Peak Effect',
        hours: [2, 8],
        icon: '🎯',
        color: 'text-green-500',
        bgColor: 'bg-green-500/10',
        borderColor: 'border-green-500/30',
        description: 'Maximum peptide activity',
        whatsHappening: [
          'Peak blood concentration',
          'Maximum receptor activation',
          'Strongest therapeutic effects'
        ],
        whatToExpect: [
          'Full peptide effects active',
          'Healing/recovery processes enhanced',
          'Optimal therapeutic window'
        ],
        tips: [
          'Best time for targeted activity',
          'Healing peptides: rest/recovery',
          'GH peptides: fasted state ideal',
          'Effects are strongest now'
        ]
      },
      {
        name: 'Active Phase',
        hours: [8, 24],
        icon: '⚡',
        color: 'text-cyan-400',
        bgColor: 'bg-cyan-500/10',
        borderColor: 'border-cyan-500/30',
        description: 'Continued therapeutic activity',
        whatsHappening: [
          'Sustained beneficial effects',
          'Ongoing repair processes',
          'Gradual clearance beginning'
        ],
        whatToExpect: [
          'Effects still present',
          'Recovery processes continuing',
          'Gradually diminishing'
        ],
        tips: [
          'Continue normal activities',
          'Multiple daily doses often used',
          'Next dose timing depends on peptide'
        ]
      },
      {
        name: 'Next Dose',
        hours: [24, 999],
        icon: '💉',
        color: 'text-orange-400',
        bgColor: 'bg-orange-500/10',
        borderColor: 'border-orange-500/30',
        description: 'Ready for next injection',
        whatsHappening: [
          'Peptide mostly cleared',
          'Effects resolved',
          'Time for next dose if scheduled'
        ],
        whatToExpect: [
          'Back to baseline',
          'Ready for next injection',
          'Frequency depends on protocol'
        ],
        tips: [
          'BPC-157/TB-500: Often daily or EOD',
          'GH peptides: Often multiple times daily',
          'Follow your protocol',
          'Consistency matters for results'
        ]
      }
    ]
  },
  'SERM': {
    phases: [
      {
        name: 'Absorption',
        hours: [0, 6],
        icon: '⬆️',
        color: 'text-blue-400',
        bgColor: 'bg-blue-500/10',
        borderColor: 'border-blue-500/30',
        description: 'Oral medication absorbing',
        whatsHappening: [
          'Enclomiphene absorbing from gut',
          'Estrogen receptor blockade beginning',
          'Pituitary signaling starting to shift'
        ],
        whatToExpect: [
          'No immediate effects',
          'Take with or without food as prescribed',
          'Consistent daily timing helps'
        ],
        tips: [
          'Take at same time each day',
          'Stay consistent with dosing',
          'Note any visual changes to report'
        ]
      },
      {
        name: 'Rising',
        hours: [6, 12],
        icon: '📈',
        color: 'text-yellow-400',
        bgColor: 'bg-yellow-500/10',
        borderColor: 'border-yellow-500/30',
        description: 'LH/FSH stimulation building',
        whatsHappening: [
          'Estrogen receptors blocked in hypothalamus/pituitary',
          'LH and FSH release increasing',
          'Natural testosterone production ramping up'
        ],
        whatToExpect: [
          'Effects building through the day',
          'Cumulative effect over days to weeks',
          'Peak benefit with steady-state dosing'
        ],
        tips: [
          'Give it 1–2 weeks for steady state',
          'Track mood and energy if desired',
          'Report any visual symptoms'
        ]
      },
      {
        name: 'Peak',
        hours: [12, 24],
        icon: '🎯',
        color: 'text-green-500',
        bgColor: 'bg-green-500/10',
        borderColor: 'border-green-500/30',
        description: 'Therapeutic effect before next dose',
        whatsHappening: [
          'Sustained LH/FSH elevation',
          'Natural testosterone support',
          'Estrogen modulation active'
        ],
        whatToExpect: [
          'Stable effect with daily use',
          'Steady state after 1–2 weeks of dosing',
          'Long half-life means levels build over time'
        ],
        tips: [
          'Take next dose at usual time',
          'Consistency matters more than exact hour',
          'Monitor with labs as directed'
        ]
      },
      {
        name: 'Next Dose',
        hours: [24, 999],
        icon: '💊',
        color: 'text-orange-400',
        bgColor: 'bg-orange-500/10',
        borderColor: 'border-orange-500/30',
        description: 'Time for next daily dose',
        whatsHappening: [
          'Levels still present (long half-life)',
          'Cumulative effect maintained with daily dosing',
          'Ready for next dose to maintain steady state'
        ],
        whatToExpect: [
          'Take today’s dose to stay on schedule',
          'Skipping can shift steady state',
          'Effects persist due to long half-life'
        ],
        tips: [
          'Take your daily dose today',
          'Same time daily for best consistency',
          'If missed, take when remembered per your protocol'
        ]
      }
    ]
  }
};

const INJECTION_ROUTES = ['SubQ', 'IM'];
const BODY_LOCATIONS = ['Stomach', 'Thigh (Left)', 'Thigh (Right)', 'Arm (Left)', 'Arm (Right)', 'Glute (Left)', 'Glute (Right)', 'Upper Arm', 'Abdomen'];
const SIDE_EFFECTS = ['Nausea', 'Fatigue', 'Headache', 'Injection Site Pain', 'Diarrhea', 'Constipation', 'Dizziness', 'Appetite Loss', 'Acid Reflux', 'Vomiting', 'Insomnia', 'Bloating'];
const MEASUREMENT_TYPES = ['Neck', 'Chest', 'Waist', 'Hips', 'Bicep (L)', 'Bicep (R)', 'Thigh (L)', 'Thigh (R)', 'Calf (L)', 'Calf (R)'];

// Helper: parse to a Date. For plain YYYY-MM-DD (pickers), local midnight that day.
// For ISO datetimes (…T…Z / offset), use the **local** calendar day at local midnight — not UTC YYYY-MM-DD slice
// (that shifted injections & chart dots one day in US/evening–zone cases).
const parseLocalDate = (dateString) => {
  if (dateString instanceof Date) return new Date(dateString.getTime());
  const s = typeof dateString === 'string' ? dateString.trim() : String(dateString).trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) {
    const [y, m, d] = s.split('-').map(Number);
    if (!y || !m || !d) return new Date(NaN);
    return new Date(y, m - 1, d);
  }
  if (/^\d{4}-\d{2}-\d{2}T/.test(s) || s.endsWith('Z')) {
    const inst = new Date(s);
    if (isNaN(inst.getTime())) return new Date(NaN);
    return new Date(inst.getFullYear(), inst.getMonth(), inst.getDate());
  }
  if (/^\d{4}-\d{2}-\d{2}/.test(s)) {
    const [y, m, d] = s.slice(0, 10).split('-').map(Number);
    if (!y || !m || !d) return new Date(NaN);
    return new Date(y, m - 1, d);
  }
  const [year, month, day] = s.split('-').map(Number);
  return new Date(year, month - 1, day);
};

// Preserve the logged clock time for short-half-life level curves; fall back to local midnight.
const getEntryDateTime = (entry) => {
  const day = toCalendarDay(entry?.date);
  if (!day) return new Date(NaN);
  const [year, month, date] = day.split('-').map(Number);
  const timeMatch = typeof entry?.time === 'string' ? entry.time.match(/^(\d{1,2}):(\d{2})/) : null;
  const hour = timeMatch ? Number(timeMatch[1]) : 0;
  const minute = timeMatch ? Number(timeMatch[2]) : 0;
  return new Date(year, month - 1, date, hour, minute, 0, 0);
};

// Today as YYYY-MM-DD in local timezone (fixes date picker showing "next day" in some timezones)
const getTodayLocal = () => {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
};
const formatDateLocal = (d) => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
};
// Normalize any date string to YYYY-MM-DD for calendar-day comparison (ISO → **local** calendar day)
const toCalendarDay = (dateString) => {
  if (!dateString && dateString !== 0) return '';
  if (dateString instanceof Date) {
    const d = dateString;
    if (isNaN(d.getTime())) return '';
    return formatDateLocal(new Date(d.getFullYear(), d.getMonth(), d.getDate()));
  }
  const s = String(dateString).trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s;
  const d = parseLocalDate(dateString);
  return isNaN(d.getTime()) ? '' : formatDateLocal(d);
};

// True if value yields a valid calendar day (used so bad/malformed entry dates don't crash charts or insights)
const isValidEntryDate = (value) => {
  const day = toCalendarDay(value);
  if (!day) return false;
  const d = parseLocalDate(day);
  return d && Number.isFinite(d.getTime());
};

// Sort weight entries by date then id (same-day order = entry order). Use for "previous" / "current" / "start".
const sortWeightByDateAsc = (entries) => [...entries].sort((a, b) => {
  const d = parseLocalDate(a.date) - parseLocalDate(b.date);
  return d !== 0 ? d : ((a.id || 0) - (b.id || 0));
});
const sortWeightByDateDesc = (entries) => [...entries].sort((a, b) => {
  const d = parseLocalDate(b.date) - parseLocalDate(a.date);
  return d !== 0 ? d : ((b.id || 0) - (a.id || 0));
});

const getVialRemainingMg = (v) => {
  if (!v) return 0;
  const r = v.remainingMg;
  if (r !== undefined && r !== null && String(r) !== '' && !isNaN(Number(r))) return Number(r);
  const t = v.totalMg;
  if (t !== undefined && t !== null && !isNaN(Number(t))) return Number(t);
  return 0;
};

/** Drop vials with no remaining product (inventory empty). */
const pruneEmptyVials = (list) => {
  if (!Array.isArray(list)) return [];
  return list.filter((v) => getVialRemainingMg(v) > 0);
};

const PepTalk = () => {
  const {
    user,
    authLoading: supabaseAuthLoading,
    isConfigured: supabaseConfigured,
    pendingCloudRestore,
    resolveCloudRestore,
    signIn: supabaseSignIn,
    signUp: supabaseSignUp,
    signOut: supabaseSignOut,
    syncNow: supabaseSyncNow,
  } = useSupabaseAuth();
  const [cloudEmail, setCloudEmail] = useState('');
  const [cloudPassword, setCloudPassword] = useState('');
  const [cloudAuthMessage, setCloudAuthMessage] = useState('');
  const [cloudBusy, setCloudBusy] = useState(false);
  const [cloudOptOut, setCloudOptOut] = useState(() => {
    try {
      return typeof localStorage !== 'undefined' && localStorage.getItem('peptalk-cloud-opt-out') === 'true';
    } catch {
      return false;
    }
  });
  const [isOnline, setIsOnline] = useState(() => (typeof navigator !== 'undefined' ? navigator.onLine : true));
  const [backgroundSyncError, setBackgroundSyncError] = useState('');

  const [activeTab, setActiveTab] = useState('summary');
  const [weightEntries, setWeightEntries] = useState([]);
  const [injectionEntries, setInjectionEntries] = useState([]);
  const [measurementEntries, setMeasurementEntries] = useState([]);
  const [progressPhotos, setProgressPhotos] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [titrationPlans, setTitrationPlans] = useState([]);
  const [journalEntries, setJournalEntries] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [expandedInjectionMed, setExpandedInjectionMed] = useState(null);
  const [weightHistoryFilterDate, setWeightHistoryFilterDate] = useState('');
  const [showAllWeightHistory, setShowAllWeightHistory] = useState(false);
  const [injectionHistoryFilterDate, setInjectionHistoryFilterDate] = useState('');
  const [injectionHistorySearch, setInjectionHistorySearch] = useState('');
  const [injectionHistoryStatus, setInjectionHistoryStatus] = useState('all');
  const [isLoading, setIsLoading] = useState(true);
  const [showSplash, setShowSplash] = useState(true);
  const [showCelebration, setShowCelebration] = useState(false);
  const [celebrationMessage, setCelebrationMessage] = useState('');
  const [userProfile, setUserProfile] = useState({ height: 70, goalWeight: 200, hydrationGoalOz: 64 });
  const [timeRange, setTimeRange] = useState('all');
  const [activeToolSection, setActiveToolSection] = useState('calculator');
  const [exportFormat, setExportFormat] = useState('json'); // 'json' | 'csv'
  const [csvType, setCsvType] = useState('full'); // 'full' | 'weight' | 'injections'
  const [showWipeConfirm, setShowWipeConfirm] = useState(false);
  const [wipeConfirmChecked, setWipeConfirmChecked] = useState(false);
  const [showGraphicalSummary, setShowGraphicalSummary] = useState(false);
  const [graphicalPdfBusy, setGraphicalPdfBusy] = useState(false);
  const graphicalSummaryCaptureRef = useRef(null);
  const [showWelcomeModal, setShowWelcomeModal] = useState(false);
  const [welcomeDontShowAgain, setWelcomeDontShowAgain] = useState(false);
  const [updatePrompt, setUpdatePrompt] = useState(null);
  const [showLowVialPopup, setShowLowVialPopup] = useState(false);
  const previousActiveTabRef = useRef(null);
  const [selectedVialId, setSelectedVialId] = useState(null);
  const [vials, setVials] = useState([]);
  // Protocol concentration profiles live outside the legacy schedule model. Keep a
  // React copy solely for presentation; dose/history records remain untouched.
  const [doseConcentrations, setDoseConcentrations] = useState({});
  const [blendConversions, setBlendConversions] = useState({}); // { medication: { component: mgPerIU } }
  const [vialMedication, setVialMedication] = useState('Semaglutide');
  const [vialTotalMg, setVialTotalMg] = useState('');
  const [vialUnit, setVialUnit] = useState('mg');
  const [vialBacWaterMl, setVialBacWaterMl] = useState(''); // ml of bac water used for reconstitution
  const [vialConcentrationForMl, setVialConcentrationForMl] = useState(''); // mg/ml when vial size is entered in ml
  const [vialExpiry, setVialExpiry] = useState('');
  const [vialReconstituted, setVialReconstituted] = useState(false);
  const [vialReconstitutedDate, setVialReconstitutedDate] = useState('');
  const [editingVialId, setEditingVialId] = useState(null);
  const [vialRemainingMg, setVialRemainingMg] = useState('');

  
  // Graph visibility state
  const [weightGraphMode, setWeightGraphMode] = useState('both'); // trend | actual | both
  const [chartRangeWeeks, setChartRangeWeeks] = useState(0); // 0 = all, 4, 8, 12
  const [appleHealthImportHistory, setAppleHealthImportHistory] = useState([]);
  const [appleWeightDailyStrategy, setAppleWeightDailyStrategy] = useState('morning');
  const [lastBackupAt, setLastBackupAt] = useState(null);
  const [insightsExpandedMed, setInsightsExpandedMed] = useState(null); // medication name or null
  const [insightsShowLevelsHelp, setInsightsShowLevelsHelp] = useState(false);
  const [insightsChartHiddenMeds, setInsightsChartHiddenMeds] = useState(() => new Set()); // medication names hidden from unified chart
  const [insightsChartRange, setInsightsChartRange] = useState('1m'); // '1w' | '1m' | '3m' | 'all' for estimated levels chart
  const [insightsMedRanges, setInsightsMedRanges] = useState({}); // per-compound detail graph range
  const [insightsInactiveMeds, setInsightsInactiveMeds] = useState([]); // hidden from Insights, history remains intact
  const [insightsSideEffectsExpandedMed, setInsightsSideEffectsExpandedMed] = useState(null); // medication name expanded in side effects by day, or null
  const [weeklyDoseWeightExcludedMeds, setWeeklyDoseWeightExcludedMeds] = useState([]); // med names hidden from Weekly dose & weight change table
  /** 0 Sun … 6 Sat — start of each 7-day bucket for Weekly dose & weight (default 1 = Monday) */
  const [weeklyDoseWeekStartsOn, setWeeklyDoseWeekStartsOn] = useState(1);
  const [goalGuideCategoryId, setGoalGuideCategoryId] = useState(null); // null = pick a goal; id = detail view
  const [goalGuideSearch, setGoalGuideSearch] = useState('');
  const [goalUserStack, setGoalUserStack] = useState([]); // medication names — conceptual stack from Goals guide
  const [goalStackInfoMed, setGoalStackInfoMed] = useState(null); // modal: which med to explain

  // Weight form states
  const [weight, setWeight] = useState('');
  const [weightDate, setWeightDate] = useState(getTodayLocal());
  const [editingWeight, setEditingWeight] = useState(null);
  
  // Fasting window tracker states (separate from weight)
  const [fastingEntries, setFastingEntries] = useState([]);
  const [fastingHours, setFastingHours] = useState('');
  const [fastingDate, setFastingDate] = useState(getTodayLocal());
  const [showFastingForm, setShowFastingForm] = useState(false);
  const [editingFasting, setEditingFasting] = useState(null);
  
  // Notification states
  const [notificationPermission, setNotificationPermission] = useState('default');
  const [notificationSettings, setNotificationSettings] = useState({
    injectionReminders: true,
    reminderTime: '09:00',
    overdueAlerts: true,
    dailySummary: false,
    dailySummaryTime: '07:00',
    weeklySummary: false,
    weeklySummaryDay: 0,
    weeklySummaryTime: '18:00',
    weightReminders: false,
    weightReminderTime: '07:00'
  });
  const [dismissedAlerts, setDismissedAlerts] = useState([]); // Track dismissed alert IDs
  const [doseActions, setDoseActions] = useState([]); // Per-day skip / take-later decisions
  
  // Injection form states
  const [injectionType, setInjectionType] = useState('Semaglutide');
  const [injectionDose, setInjectionDose] = useState('');
  const [injectionUnit, setInjectionUnit] = useState('mg');
  const [injectionDate, setInjectionDate] = useState(getTodayLocal());
  const [injectionTime, setInjectionTime] = useState('09:00');
  const [injectionRoute, setInjectionRoute] = useState('SubQ');
  const [injectionSite, setInjectionSite] = useState('Stomach');
  const [injectionNotes, setInjectionNotes] = useState('');
  const [selectedSideEffects, setSelectedSideEffects] = useState([]);
  const [editingInjection, setEditingInjection] = useState(null);
  const [showMedDropdown, setShowMedDropdown] = useState(false);
  const [medSearchTerm, setMedSearchTerm] = useState('');
  const [trialTargetMg, setTrialTargetMg] = useState(''); // protocol mg → suggest units/mL (Log Injection)

  // Measurement form states
  const [measurementType, setMeasurementType] = useState('Waist');
  const [measurementValue, setMeasurementValue] = useState('');
  const [measurementDate, setMeasurementDate] = useState(getTodayLocal());

  // Schedule form states
  const [scheduleMed, setScheduleMed] = useState('Semaglutide');
  const [scheduleFrequency, setScheduleFrequency] = useState(7);
  const [scheduleDay, setScheduleDay] = useState(0);
  const [scheduleStartDate, setScheduleStartDate] = useState(getTodayLocal());
  const [scheduleType, setScheduleType] = useState('recurring'); // 'recurring' or 'specific_days'
  const [selectedDays, setSelectedDays] = useState([]); // [0,1,2,3,4,5,6] for Sun-Sat
  const [protocolEditorMed, setProtocolEditorMed] = useState(null);
  const [protocolDraft, setProtocolDraft] = useState(null);

  // Titration form states
  const [titrationMed, setTitrationMed] = useState('Semaglutide');
  const [titrationSteps, setTitrationSteps] = useState([{ dose: '', weeks: 4, unit: 'mg' }]);

  // Calculator states
  const [reconPeptideAmount, setReconPeptideAmount] = useState('');
  const [reconPeptideUnit, setReconPeptideUnit] = useState('mg');
  const [reconWaterAmount, setReconWaterAmount] = useState('');
  const [reconDesiredDose, setReconDesiredDose] = useState('');
  const [reconDesiredUnit, setReconDesiredUnit] = useState('mcg');
  const [reconResult, setReconResult] = useState(null);
  const [reconMode, setReconMode] = useState('vial_bac'); // 'vial_bac' = vial + bac → concentration & dose per ml; 'vial_dose' = vial + dose → bac water needed
  const [reconVolumePerDose, setReconVolumePerDose] = useState('0.5'); // ml per dose when solving for bac water
  // Calorie / TDEE calculator
  const [tdeeAge, setTdeeAge] = useState('');
  const [tdeeGender, setTdeeGender] = useState('male');
  const [tdeeWeightLbs, setTdeeWeightLbs] = useState('');
  const [tdeeHeightIn, setTdeeHeightIn] = useState('');
  const [tdeeActivity, setTdeeActivity] = useState('moderate');
  const [tdeeResult, setTdeeResult] = useState(null);

  // Glucose & A1C (optional for GLP-1/diabetes)
  const [glucoseEntries, setGlucoseEntries] = useState([]);
  const [a1cEntries, setA1cEntries] = useState([]);
  const [glucoseValue, setGlucoseValue] = useState('');
  const [glucoseDate, setGlucoseDate] = useState(getTodayLocal());
  const [glucoseType, setGlucoseType] = useState('fasting');
  const [a1cValue, setA1cValue] = useState('');
  const [a1cDate, setA1cDate] = useState(getTodayLocal());
  const [showGlucoseForm, setShowGlucoseForm] = useState(false);
  const [showA1cForm, setShowA1cForm] = useState(false);

  // Bloodwork / Labs (any lab type: Testosterone, LDL, etc.)
  const [labEntries, setLabEntries] = useState([]);
  const [labType, setLabType] = useState('Testosterone');
  const [labValue, setLabValue] = useState('');
  const [labUnit, setLabUnit] = useState('ng/dL');
  const [labDate, setLabDate] = useState(getTodayLocal());
  const [showLabForm, setShowLabForm] = useState(false);
  const LAB_TYPES = ['A1C', 'Testosterone', 'Free Testosterone', 'LDL', 'HDL', 'Triglycerides', 'Fasting Glucose', 'HbA1c', 'Creatinine', 'eGFR', 'Other'];

  // Daily track (hydration & protein from meals + optional extra water)
  const [dailyTrackEntries, setDailyTrackEntries] = useState([]);
  const [nutritionLabel, setNutritionLabel] = useState('');
  const [nutritionCalories, setNutritionCalories] = useState('');
  const [nutritionProtein, setNutritionProtein] = useState('');
  const [nutritionCarbs, setNutritionCarbs] = useState('');
  const [nutritionFat, setNutritionFat] = useState('');
  const [nutritionHydrationOz, setNutritionHydrationOz] = useState('');
  const [extraHydrationOz, setExtraHydrationOz] = useState('');
  const [mealDescription, setMealDescription] = useState('');

  // More tab sub-section (when using 5 tabs)
  const [activeMoreSection, setActiveMoreSection] = useState('profile');

  // Journal form states
  const [journalDate, setJournalDate] = useState(getTodayLocal());
  const [journalContent, setJournalContent] = useState('');
  const [journalMood, setJournalMood] = useState('neutral');
  const [journalEnergy, setJournalEnergy] = useState(5);
  const [journalHunger, setJournalHunger] = useState(5);
  const [editingJournal, setEditingJournal] = useState(null);

  const [sleepEntries, setSleepEntries] = useState([]);
  const [sleepBedDate, setSleepBedDate] = useState(getTodayLocal());
  const [sleepBedTime, setSleepBedTime] = useState('22:30');
  const [sleepWakeTime, setSleepWakeTime] = useState('07:00');
  const [sleepQuality, setSleepQuality] = useState(3);
  const [sleepNotes, setSleepNotes] = useState('');
  const [showSleepForm, setShowSleepForm] = useState(false);
  const [editingSleep, setEditingSleep] = useState(null);
  const [todayStepsInput, setTodayStepsInput] = useState('');
  const [sideEffectSeverity, setSideEffectSeverity] = useState({});
  const [storageQuotaWarning, setStorageQuotaWarning] = useState(false);
  const [lastCloudSyncAt, setLastCloudSyncAt] = useState(() => {
    try {
      return typeof localStorage !== 'undefined' ? localStorage.getItem('peptalk-last-cloud-sync') || '' : '';
    } catch {
      return '';
    }
  });
  const [toastUndo, setToastUndo] = useState(null);
  const [vialPhotoDataUrl, setVialPhotoDataUrl] = useState(null);
  const [vialPhotoRemoved, setVialPhotoRemoved] = useState(false);
  const [faqOpenId, setFaqOpenId] = useState(null);

  // Calendar state
  const [calendarMonth, setCalendarMonth] = useState(new Date());
  const [selectedCalendarDay, setSelectedCalendarDay] = useState(getTodayLocal());

  const photoInputRef = useRef(null);
  const moreSectionRefs = useRef({});
  const undoTimerRef = useRef(null);
  const webProtocolReminderTimersRef = useRef([]);
  const webGeneralReminderTimersRef = useRef([]);

  useEffect(() => { loadData(); }, []);

  // The Protocol concentration UI is currently an event-driven enhancement. Its
  // custom event lets native Today cards update immediately without observing the
  // document or changing any stored dose values.
  useEffect(() => {
    const refreshDoseConcentrations = () => {
      try {
        const saved = JSON.parse(localStorage.getItem('health-dose-concentrations') || '{}');
        setDoseConcentrations(saved && typeof saved === 'object' && !Array.isArray(saved) ? saved : {});
      } catch {
        setDoseConcentrations({});
      }
    };
    const onStorage = (event) => {
      if (event.key === 'health-dose-concentrations') refreshDoseConcentrations();
    };
    window.addEventListener('peptalk-dose-concentrations-changed', refreshDoseConcentrations);
    window.addEventListener('storage', onStorage);
    return () => {
      window.removeEventListener('peptalk-dose-concentrations-changed', refreshDoseConcentrations);
      window.removeEventListener('storage', onStorage);
    };
  }, []);

  // Welcome/tutorial: after local data loads, when Supabase is off — version-based only. When Supabase is on — only after sign-in (version change or first signed-in tutorial). Cloud opt-out treats the app like local-only for welcome.
  useEffect(() => {
    if (isLoading) return;
    if (supabaseConfigured && !cloudOptOut && (!user || supabaseAuthLoading)) return;
    try {
      const hideForever = localStorage.getItem('peptalk-welcome-hide-forever') === 'true';
      if (hideForever) return;
      const lastSeenVersion = localStorage.getItem('peptalk-welcome-version');
      const seenSignedIn = localStorage.getItem('peptalk-welcome-seen-signed-in') === 'true';
      const needVersionWelcome = lastSeenVersion !== APP_VERSION;
      const needPostAuthWelcome = supabaseConfigured && !cloudOptOut && user && !seenSignedIn;
      if (needVersionWelcome && (!supabaseConfigured || cloudOptOut)) setShowWelcomeModal(true);
      else if (supabaseConfigured && !cloudOptOut && user && (needVersionWelcome || needPostAuthWelcome)) setShowWelcomeModal(true);
    } catch (_) {}
  }, [isLoading, supabaseConfigured, cloudOptOut, user, supabaseAuthLoading]);

  useEffect(() => {
    if (supabaseConfigured && !cloudOptOut && !user && !supabaseAuthLoading) setShowWelcomeModal(false);
  }, [supabaseConfigured, cloudOptOut, user, supabaseAuthLoading]);

  useEffect(() => {
    const on = () => setIsOnline(true);
    const off = () => setIsOnline(false);
    window.addEventListener('online', on);
    window.addEventListener('offline', off);
    return () => {
      window.removeEventListener('online', on);
      window.removeEventListener('offline', off);
    };
  }, []);

  useEffect(() => {
    const onResult = (e) => {
      if (e.detail?.ok) {
        setBackgroundSyncError('');
        const iso = new Date().toISOString();
        setLastCloudSyncAt(iso);
        try {
          localStorage.setItem('peptalk-last-cloud-sync', iso);
        } catch (_) {}
      } else if (e.detail?.message) setBackgroundSyncError(e.detail.message);
    };
    window.addEventListener('peptalk:cloud-sync-result', onResult);
    return () => window.removeEventListener('peptalk:cloud-sync-result', onResult);
  }, []);

  useEffect(() => {
    if (!isOnline) setBackgroundSyncError('');
  }, [isOnline]);

  const updateManifestUrl = import.meta.env.VITE_APP_UPDATE_MANIFEST_URL || '';

  useEffect(() => {
    if (!updateManifestUrl || isLoading) return;
    if (supabaseConfigured && !user && !cloudOptOut) return;
    if (showWelcomeModal) return;
    let cancelled = false;
    const run = async () => {
      const info = await checkForAppUpdate(updateManifestUrl, APP_VERSION);
      if (cancelled || !info.updateAvailable) return;
      setUpdatePrompt(info);
    };
    const t = setTimeout(run, 2800);
    return () => {
      cancelled = true;
      clearTimeout(t);
    };
  }, [isLoading, supabaseConfigured, cloudOptOut, user, showWelcomeModal, updateManifestUrl]);

  useEffect(() => {
    if (!updateManifestUrl || isLoading) return;
    if (supabaseConfigured && !user && !cloudOptOut) return;
    if (showWelcomeModal) return;
    const onVis = () => {
      if (document.visibilityState !== 'visible') return;
      checkForAppUpdate(updateManifestUrl, APP_VERSION).then((info) => {
        if (info.updateAvailable) setUpdatePrompt(info);
      });
    };
    document.addEventListener('visibilitychange', onVis);
    return () => document.removeEventListener('visibilitychange', onVis);
  }, [isLoading, supabaseConfigured, cloudOptOut, user, showWelcomeModal, updateManifestUrl]);

  // Hide splash screen after data loads
  useEffect(() => {
    if (!isLoading) {
      setTimeout(() => setShowSplash(false), 1500);
    }
  }, [isLoading]);

  // Reschedule local (push) notifications when app loads and any reminder is on
  useEffect(() => {
    if (!isLoading && notificationPermission === 'granted' && (schedules.some((schedule) => !schedule.paused && schedule.reminderEnabled !== false) || notificationSettings.weightReminders || notificationSettings.dailySummary || notificationSettings.weeklySummary)) {
      scheduleLocalInjectionReminders();
      scheduleProtocolWebReminders();
      scheduleGeneralWebReminders();
    }
    const onVisible = () => {
      if (document.visibilityState === 'visible' && notificationPermission === 'granted') {
        scheduleProtocolWebReminders();
        scheduleGeneralWebReminders();
      }
    };
    document.addEventListener('visibilitychange', onVisible);
    return () => {
      document.removeEventListener('visibilitychange', onVisible);
      webProtocolReminderTimersRef.current.forEach((timer) => clearTimeout(timer));
      webProtocolReminderTimersRef.current = [];
      webGeneralReminderTimersRef.current.forEach((timer) => clearTimeout(timer));
      webGeneralReminderTimersRef.current = [];
    };
  }, [isLoading, notificationPermission, notificationSettings.weightReminders, notificationSettings.weightReminderTime, notificationSettings.dailySummary, notificationSettings.dailySummaryTime, notificationSettings.weeklySummary, notificationSettings.weeklySummaryDay, notificationSettings.weeklySummaryTime, schedules, injectionEntries]);

  // When on More tab, scroll the active section tab into view so Profile isn’t hidden off-screen
  useEffect(() => {
    if (activeTab !== 'more' || !activeMoreSection) return;
    const el = moreSectionRefs.current[activeMoreSection];
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
  }, [activeTab, activeMoreSection]);
  
  // Celebration trigger function
  const celebrate = (message) => {
    setCelebrationMessage(message);
    setShowCelebration(true);
    setTimeout(() => setShowCelebration(false), 3000);
  };
  

  const loadData = async () => {
    setIsLoading(true);
    try {
      const weightData = localStorage.getItem('health-weight-entries');
      const injectionData = localStorage.getItem('health-injection-entries');
      const profileData = localStorage.getItem('health-user-profile');
      const measurementData = localStorage.getItem('health-measurements');
      const photoData = localStorage.getItem('health-photos');
      const scheduleData = localStorage.getItem('health-schedules');
      const titrationData = localStorage.getItem('health-titration');
      const journalData = localStorage.getItem('health-journal');
      const fastingData = localStorage.getItem('health-fasting-entries');
      const notificationSettingsData = localStorage.getItem('health-notification-settings');
      const appleHealthImportHistoryData = localStorage.getItem('health-apple-import-history');
      const appleWeightStrategyData = localStorage.getItem('health-apple-weight-strategy');
      const lastBackupData = localStorage.getItem('health-last-backup-at');
      const dailyTrackData = localStorage.getItem('health-daily-track');
      const glucoseData = localStorage.getItem('health-glucose-entries');
      const a1cData = localStorage.getItem('health-a1c-entries');
      const labData = localStorage.getItem('health-lab-entries');
      const blendConversionData = localStorage.getItem('health-blend-conversions');
      const inactiveInsightsData = localStorage.getItem('health-insights-inactive-meds');
      const doseActionsData = localStorage.getItem('health-dose-actions');
      const doseConcentrationData = localStorage.getItem('health-dose-concentrations');
      {
        const parsed = weightData ? JSON.parse(weightData) : [];
        const existing = Array.isArray(parsed) ? parsed : [];
        const importKey = 'peptalk-apple-health-weight-import-aug-17-27-v1';
        let merged = existing;
        if (localStorage.getItem(importKey) !== 'done') {
          const existingDays = new Set(existing.map((entry) => toCalendarDay(entry.date)));
          merged = [...existing, ...APPLE_HEALTH_WEIGHT_IMPORT.filter((entry) => !existingDays.has(entry.date))];
          localStorage.setItem(importKey, 'done');
          if (merged.length !== existing.length) saveData('health-weight-entries', sortWeightByDateAsc(merged));
        }
        setWeightEntries(sortWeightByDateAsc(merged));
      }
      {
        const parsed = injectionData ? JSON.parse(injectionData) : [];
        const existing = Array.isArray(parsed) ? parsed : [];
        const doseKey = (entry) => `${entry.type}|${toCalendarDay(entry.date)}|${Number(entry.dose)}|${String(entry.unit || 'mg').toLowerCase()}`;
        const imports = [
          { key: 'peptalk-regimen-5-amino-import-v1', entries: REGIMEN_5_AMINO_1MQ_IMPORT },
          { key: 'peptalk-regimen-cagrilintide-import-v1', entries: REGIMEN_CAGRILINTIDE_IMPORT },
          { key: 'peptalk-regimen-tesamorelin-ipamorelin-import-v1', entries: REGIMEN_TESAMORELIN_IPAMORELIN_IMPORT },
          { key: 'peptalk-regimen-testosterone-cypionate-import-v1', entries: REGIMEN_TESTOSTERONE_CYPIONATE_IMPORT },
          { key: 'peptalk-regimen-retatrutide-import-v1', entries: REGIMEN_RETATRUTIDE_IMPORT },
          { key: 'peptalk-regimen-klow-import-v1', entries: REGIMEN_KLOW_IMPORT },
          { key: 'peptalk-regimen-nad-import-v1', entries: REGIMEN_NAD_IMPORT },
        ];
        let merged = [...existing];
        let changed = false;
        imports.forEach(({ key, entries }) => {
          if (localStorage.getItem(key) === 'done') return;
          const existingKeys = new Set(merged.map(doseKey));
          const additions = entries.filter((entry) => !existingKeys.has(doseKey(entry)));
          if (additions.length > 0) {
            merged = [...merged, ...additions];
            changed = true;
          }
          localStorage.setItem(key, 'done');
        });
        merged.sort((a, b) => getEntryDateTime(b) - getEntryDateTime(a));
        setInjectionEntries(merged);
        if (changed) saveData('health-injection-entries', merged);
      }
      if (profileData) {
        const parsed = JSON.parse(profileData);
        setUserProfile({ height: 70, goalWeight: 200, ...parsed, hydrationGoalOz: parsed.hydrationGoalOz ?? 64 });
      }
      if (measurementData) setMeasurementEntries(JSON.parse(measurementData));
      if (photoData) setProgressPhotos(JSON.parse(photoData));
      {
        const parsed = scheduleData ? JSON.parse(scheduleData) : [];
        const existing = Array.isArray(parsed) ? parsed : [];
        const scheduleImports = [
          {
            key: 'peptalk-regimen-5-amino-schedule-v1',
            schedule: { id: 'regimen-5-amino-1mq-daily', medication: '5-Amino-1MQ', frequencyDays: 1, preferredDay: 0, startDate: '2026-07-31', scheduleType: 'specific_days', specificDays: [0, 1, 2, 3, 4, 5, 6], preferredTime: '06:00' },
          },
          {
            key: 'peptalk-regimen-cagrilintide-schedule-v1',
            schedule: { id: 'regimen-cagrilintide-wed-sat', medication: 'Cagrilintide', frequencyDays: 3, preferredDay: 3, startDate: '2026-07-29', scheduleType: 'specific_days', specificDays: [3, 6], preferredTime: '22:00' },
          },
          {
            key: 'peptalk-regimen-tesamorelin-ipamorelin-schedule-v1',
            schedule: { id: 'regimen-tesamorelin-ipamorelin-weekdays', medication: 'Tesamorelin / Ipamorelin', frequencyDays: 1, preferredDay: 1, startDate: '2026-08-22', scheduleType: 'specific_days', specificDays: [1, 2, 3, 4, 5], preferredTime: '06:00' },
          },
          {
            key: 'peptalk-regimen-testosterone-cypionate-schedule-v1',
            schedule: { id: 'regimen-testosterone-cypionate-wed-sat', medication: 'Testosterone Cypionate', frequencyDays: 3, preferredDay: 3, startDate: '2026-07-22', scheduleType: 'specific_days', specificDays: [3, 6], preferredTime: '22:00' },
          },
          {
            key: 'peptalk-regimen-retatrutide-schedule-v1',
            schedule: { id: 'regimen-retatrutide-wed-sat', medication: 'Retatrutide', frequencyDays: 3, preferredDay: 3, startDate: '2026-01-07', scheduleType: 'specific_days', specificDays: [3, 6], preferredTime: '22:00' },
          },
          {
            key: 'peptalk-regimen-klow-schedule-v1',
            schedule: { id: 'regimen-klow-daily', medication: 'KLOW', frequencyDays: 1, preferredDay: 0, startDate: '2026-07-30', scheduleType: 'specific_days', specificDays: [0, 1, 2, 3, 4, 5, 6], preferredTime: '22:00' },
          },
          {
            key: 'peptalk-regimen-nad-schedule-v1',
            schedule: { id: 'regimen-nad-mon-wed-fri', medication: 'NAD+', frequencyDays: 2, preferredDay: 1, startDate: '2026-07-29', scheduleType: 'specific_days', specificDays: [1, 3, 5], preferredTime: '06:00' },
          },
        ];
        let merged = [...existing];
        let changed = false;
        scheduleImports.forEach(({ key, schedule }) => {
          const alreadyExists = merged.some((item) => item.medication === schedule.medication);
          if (localStorage.getItem(key) !== 'done' && !alreadyExists) {
            merged.push(schedule);
            changed = true;
          }
          if (alreadyExists || changed) localStorage.setItem(key, 'done');
        });
        // Backfill the confirmed Regimen concentration onto its protocol. This
        // never changes an entered dose or any history record.
        merged = merged.map((schedule) => {
          const preset = REGIMEN_PROTOCOL_CONCENTRATIONS[schedule.medication];
          const existingConcentration = schedule.doseConcentration;
          const hasConcentration = Number(existingConcentration?.concentration) > 0 || (Number(existingConcentration?.totalMg) > 0 && Number(existingConcentration?.bacWaterMl) > 0);
          if (!preset || hasConcentration) return schedule;
          changed = true;
          return { ...schedule, doseConcentration: { ...preset } };
        });
        setSchedules(merged);
        if (changed) saveData('health-schedules', merged);
      }
      {
        const parsed = titrationData ? JSON.parse(titrationData) : [];
        const existing = Array.isArray(parsed) ? parsed : [];
        const importKey = 'peptalk-regimen-nad-titration-v1';
        let merged = existing;
        const alreadyExists = existing.some((plan) => plan.medication === 'NAD+');
        if (localStorage.getItem(importKey) !== 'done' && !alreadyExists) {
          merged = [...existing, {
            id: 'regimen-nad-titration',
            medication: 'NAD+',
            startDate: '2026-07-29',
            steps: [
              { dose: 20, weeks: 2, unit: 'mg' },
              { dose: 25, weeks: 52, unit: 'mg' },
            ],
          }];
          saveData('health-titration', merged);
        }
        if (alreadyExists || merged !== existing) localStorage.setItem(importKey, 'done');
        setTitrationPlans(merged);
      }
      if (journalData) setJournalEntries(JSON.parse(journalData));
      if (fastingData) setFastingEntries(JSON.parse(fastingData));
      if (notificationSettingsData) setNotificationSettings((current) => ({ ...current, ...JSON.parse(notificationSettingsData) }));
      if (appleHealthImportHistoryData) setAppleHealthImportHistory(JSON.parse(appleHealthImportHistoryData));
      if (['morning', 'latest', 'lowest', 'average'].includes(appleWeightStrategyData)) setAppleWeightDailyStrategy(appleWeightStrategyData);
      if (lastBackupData) setLastBackupAt(lastBackupData);
      if (dailyTrackData) setDailyTrackEntries(JSON.parse(dailyTrackData));
      if (glucoseData) setGlucoseEntries(JSON.parse(glucoseData));
      if (a1cData) setA1cEntries(JSON.parse(a1cData));
      if (labData) setLabEntries(JSON.parse(labData));
      {
        const parsed = blendConversionData ? JSON.parse(blendConversionData) : {};
        const existing = parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? parsed : {};
        const klowImportKey = 'peptalk-klow-80mg-2ml-conversion-v1';
        let merged = existing;
        if (localStorage.getItem(klowImportKey) !== 'done') {
          merged = {
            ...existing,
            KLOW: {
              'GHK-Cu': 0.25,
              'BPC-157': 0.05,
              'TB-500': 0.05,
              KPV: 0.05,
              __mixMl: 2,
              __componentMg: { 'GHK-Cu': 50, 'BPC-157': 10, 'TB-500': 10, KPV: 10 },
              ...(existing.KLOW || {}),
            },
          };
          localStorage.setItem(klowImportKey, 'done');
          saveData('health-blend-conversions', merged);
        }
        setBlendConversions(merged);
      }
      if (inactiveInsightsData) {
        try {
          const parsed = JSON.parse(inactiveInsightsData);
          if (Array.isArray(parsed)) setInsightsInactiveMeds(parsed.filter((name) => typeof name === 'string'));
        } catch (_) { /* ignore */ }
      }
      if (doseActionsData) {
        try {
          const parsed = JSON.parse(doseActionsData);
          if (Array.isArray(parsed)) setDoseActions(parsed);
        } catch (_) { /* ignore */ }
      }
      if (doseConcentrationData) {
        try {
          const parsed = JSON.parse(doseConcentrationData);
          setDoseConcentrations(parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? parsed : {});
        } catch (_) { /* ignore malformed saved concentration profiles */ }
      }
      const sleepData = localStorage.getItem('health-sleep-entries');
      if (sleepData) {
        try {
          const parsed = JSON.parse(sleepData);
          if (Array.isArray(parsed)) setSleepEntries(parsed);
        } catch (_) { /* ignore */ }
      }
      const vialsData = localStorage.getItem('health-vials');
      if (vialsData) {
        const parsed = JSON.parse(vialsData);
        const normalized = parsed.map(v => ({ ...v, remainingMg: v.remainingMg ?? v.totalMg }));
        const pruned = pruneEmptyVials(normalized);
        if (pruned.length !== normalized.length) saveData('health-vials', pruned);
        setVials(pruned);
      }
      const weeklyDoseExcluded = localStorage.getItem('health-weekly-dose-weight-excluded-meds');
      if (weeklyDoseExcluded) {
        try {
          const parsed = JSON.parse(weeklyDoseExcluded);
          if (Array.isArray(parsed)) setWeeklyDoseWeightExcludedMeds(parsed);
        } catch (_) { /* ignore */ }
      }
      const weeklyDoseWeekStart = localStorage.getItem('health-weekly-dose-week-starts-on');
      if (weeklyDoseWeekStart != null && weeklyDoseWeekStart !== '') {
        try {
          const parsed = JSON.parse(weeklyDoseWeekStart);
          if (typeof parsed === 'number' && parsed >= 0 && parsed <= 6) setWeeklyDoseWeekStartsOn(parsed);
        } catch (_) { /* ignore */ }
      }
      const goalsStackData = localStorage.getItem('health-goals-user-stack');
      if (goalsStackData) {
        try {
          const parsed = JSON.parse(goalsStackData);
          if (Array.isArray(parsed)) setGoalUserStack(parsed.filter((x) => typeof x === 'string'));
        } catch (_) { /* ignore */ }
      }

      // Check notification permission status (web vs native)
      if (Capacitor.isNativePlatform()) {
        try {
          const { LocalNotifications } = await import('@capacitor/local-notifications');
          const perm = await LocalNotifications.checkPermissions();
          setNotificationPermission(perm.display === 'granted' ? 'granted' : perm.display === 'denied' ? 'denied' : 'default');
        } catch (_) {
          setNotificationPermission('default');
        }
      } else if ('Notification' in window) {
        setNotificationPermission(Notification.permission);
      }
    } catch (error) {
      console.log('Loading data:', error);
    }
    setIsLoading(false);
  };

  const saveData = (key, data) => {
    try {
      localStorage.setItem(key, JSON.stringify(data));
      setStorageQuotaWarning(false);
      scheduleCloudSync();
      return true;
    } catch (error) {
      console.error('Error saving:', error);
      const name = error?.name || '';
      const code = error?.code;
      if (name === 'QuotaExceededError' || code === 22) setStorageQuotaWarning(true);
      return false;
    }
  };

  const pushUndoToast = (message, onUndo) => {
    if (undoTimerRef.current) clearTimeout(undoTimerRef.current);
    setToastUndo({ message, onUndo });
    undoTimerRef.current = setTimeout(() => {
      setToastUndo(null);
      undoTimerRef.current = null;
    }, 8000);
  };

  // Form reset functions
  const resetWeightForm = () => { setWeight(''); setWeightDate(getTodayLocal()); setEditingWeight(null); setShowAddForm(false); };
  const resetInjectionForm = () => { setInjectionType('Semaglutide'); setInjectionDose(''); setInjectionUnit('mg'); setInjectionDate(getTodayLocal()); setInjectionTime('09:00'); setInjectionRoute('SubQ'); setInjectionSite('Stomach'); setInjectionNotes(''); setSelectedSideEffects([]); setSideEffectSeverity({}); setEditingInjection(null); setShowAddForm(false); setShowMedDropdown(false); setMedSearchTerm(''); setSelectedVialId(null); setTrialTargetMg(''); };
  const resetMeasurementForm = () => { setMeasurementType('Waist'); setMeasurementValue(''); setMeasurementDate(getTodayLocal()); setShowAddForm(false); };
  const resetJournalForm = () => { setJournalContent(''); setJournalMood('neutral'); setJournalEnergy(5); setJournalHunger(5); setJournalDate(getTodayLocal()); setEditingJournal(null); setShowAddForm(false); };
  const resetFastingForm = () => { setFastingHours(''); setFastingDate(getTodayLocal()); setEditingFasting(null); setShowFastingForm(false); };

  // CRUD operations
  const addOrUpdateWeight = () => {
    if (!weight || isNaN(parseFloat(weight))) return;
    const newWeight = parseFloat(weight);
    let updated = editingWeight 
      ? weightEntries.map(e => e.id === editingWeight.id ? { ...e, weight: newWeight, date: weightDate } : e)
      : [...weightEntries, { id: Date.now(), weight: newWeight, date: weightDate }];
    // Store in chronological order (date asc, then id for same-day)
    updated = sortWeightByDateAsc(updated);
    
    // Celebrate meaningful changes without adding progress cards.
    if (!editingWeight && weightEntries.length > 0) {
      const byDateDesc = sortWeightByDateDesc(weightEntries);
      const oldWeight = byDateDesc[0].weight;   // most recent entry by date (and time via id)
      const weightLost = oldWeight - newWeight;
      
      if (weightLost >= 1) celebrate('🎉 Down ' + weightLost.toFixed(1) + ' lbs!');
    }
    
    setWeightEntries(updated);
    saveData('health-weight-entries', updated);
    resetWeightForm();
  };

  const deleteWeight = (id) => {
    const removed = weightEntries.find(e => e.id === id);
    if (!removed) return;
    const prev = weightEntries;
    const updated = prev.filter(e => e.id !== id);
    setWeightEntries(updated);
    if (!saveData('health-weight-entries', updated)) {
      setWeightEntries(prev);
      return;
    }
    pushUndoToast('Weight entry removed', () => {
      const restored = sortWeightByDateAsc([...updated, removed]);
      setWeightEntries(restored);
      saveData('health-weight-entries', restored);
    });
  };

  // Glucose & A1C CRUD
  const addGlucose = () => {
    const v = parseFloat(glucoseValue);
    if (!glucoseValue || isNaN(v) || v < 20 || v > 500) return;
    const updated = [...glucoseEntries, { id: Date.now(), date: glucoseDate, value: v, type: glucoseType }];
    updated.sort((a, b) => (b.date || '').localeCompare(a.date || ''));
    setGlucoseEntries(updated);
    saveData('health-glucose-entries', updated);
    setGlucoseValue('');
    setGlucoseDate(getTodayLocal());
    setShowGlucoseForm(false);
  };
  const deleteGlucose = (id) => {
    const updated = glucoseEntries.filter(e => e.id !== id);
    setGlucoseEntries(updated);
    saveData('health-glucose-entries', updated);
  };
  const addA1c = () => {
    const v = parseFloat(a1cValue);
    if (!a1cValue || isNaN(v) || v < 4 || v > 15) return;
    const updated = [...a1cEntries, { id: Date.now(), date: a1cDate, value: v }];
    updated.sort((a, b) => (b.date || '').localeCompare(a.date || ''));
    setA1cEntries(updated);
    saveData('health-a1c-entries', updated);
    setA1cValue('');
    setA1cDate(getTodayLocal());
    setShowA1cForm(false);
  };
  const deleteA1c = (id) => {
    const updated = a1cEntries.filter(e => e.id !== id);
    setA1cEntries(updated);
    saveData('health-a1c-entries', updated);
  };

  const addLabEntry = () => {
    const v = parseFloat(labValue);
    if (!labType.trim() || isNaN(v)) return;
    const entry = { id: Date.now(), type: labType.trim(), value: v, unit: labUnit.trim() || '—', date: labDate };
    const updated = [...labEntries, entry].sort((a, b) => b.date.localeCompare(a.date));
    setLabEntries(updated);
    saveData('health-lab-entries', updated);
    setLabValue('');
    setLabDate(getTodayLocal());
    setShowLabForm(false);
  };
  const deleteLabEntry = (id) => {
    const updated = labEntries.filter(e => e.id !== id);
    setLabEntries(updated);
    saveData('health-lab-entries', updated);
  };

  // Fasting window CRUD operations
  const addOrUpdateFasting = () => {
    if (!fastingHours || isNaN(parseInt(fastingHours))) return;
    const hours = parseInt(fastingHours);
    if (hours < 1 || hours > 23) return; // Validate reasonable fasting hours
    let updated = editingFasting
      ? fastingEntries.map(e => e.id === editingFasting.id ? { ...e, fastingHours: hours, date: fastingDate } : e)
      : [...fastingEntries, { id: Date.now(), fastingHours: hours, date: fastingDate }];
    updated.sort((a, b) => parseLocalDate(b.date) - parseLocalDate(a.date));
    
    // Calculate the current fasting streak.
    if (!editingFasting) {
      const streak = updated.filter((e, i) => {
        const entryDate = parseLocalDate(e.date);
        const today = new Date();
        const daysDiff = Math.floor((today - entryDate) / (1000 * 60 * 60 * 24));
        return daysDiff === i;
      }).length;
      
      if (streak === 7) celebrate('🔥 7 Day Fasting Streak!');
      if (streak === 14) celebrate('🔥 2 Week Streak!');
      if (streak === 30) celebrate('🏆 30 Day Streak!');
      if (hours >= 16) celebrate('💪 Great ' + hours + ' hour fast!');
    }
    
    setFastingEntries(updated);
    saveData('health-fasting-entries', updated);
    resetFastingForm();
  };

  const deleteFasting = (id) => {
    const updated = fastingEntries.filter(e => e.id !== id);
    setFastingEntries(updated);
    saveData('health-fasting-entries', updated);
  };

  // Schedule local (push-style) notifications on device for when app is closed (Android/iOS)
  const scheduleLocalInjectionReminders = async (settingsOverride, schedulesOverride) => {
    try {
      if (!Capacitor.isNativePlatform()) return;
      const { LocalNotifications } = await import('@capacitor/local-notifications');
      const perm = await LocalNotifications.checkPermissions();
      if (perm.display !== 'granted') await LocalNotifications.requestPermissions();
      const pending = await LocalNotifications.getPending();
      if (pending?.notifications?.length) {
        await LocalNotifications.cancel({ notifications: pending.notifications.map(n => ({ id: n.id })) });
      }
      const settings = settingsOverride ?? notificationSettings;
      const notifications = [];
      let id = 100;
      if ((schedulesOverride ?? schedules).some((schedule) => !schedule.paused && schedule.reminderEnabled !== false)) {
        const upcoming = getNextInjections(schedulesOverride ?? schedules);
        upcoming.forEach(injection => {
          if (injection.reminderEnabled === false || injection.daysUntil < 0 || injection.daysUntil > 14) return;
          const time = /^\d{2}:\d{2}$/.test(injection.preferredTime || '') ? injection.preferredTime : (settings.reminderTime || '09:00');
          const [hr, min] = time.split(':').map(Number);
          const at = new Date();
          at.setDate(at.getDate() + injection.daysUntil);
          at.setHours(hr, min, 0, 0);
          const minutesBefore = Math.max(0, Number(injection.reminderMinutesBefore) || 0);
          at.setMinutes(at.getMinutes() - minutesBefore);
          if (at.getTime() <= Date.now()) return;
          notifications.push({
            id,
            title: `💉 ${injection.medication}`,
            body: `${minutesBefore ? `Scheduled in ${minutesBefore} minutes` : 'Scheduled now'}${injection.dose != null ? ` · ${injection.dose} ${injection.unit || 'mg'}` : ''}`,
            schedule: { at, allowWhileIdle: true }
          });
          id++;
        });
      }
      // Weigh-in reminder: daily at weightReminderTime (id 50)
      if (settings.weightReminders && (settings.weightReminderTime || '07:00')) {
        const [wh, wm] = (settings.weightReminderTime || '07:00').split(':').map(Number);
        const at = new Date();
        at.setHours(wh, wm, 0, 0);
        if (at.getTime() <= Date.now()) at.setDate(at.getDate() + 1);
        notifications.push({
          id: 50,
          title: '⚖️ Weigh-in Reminder',
          body: 'Time to log your weight',
          schedule: { at, allowWhileIdle: true }
        });
      }
      if (settings.dailySummary && (settings.dailySummaryTime || '07:00')) {
        const [sh, sm] = (settings.dailySummaryTime || '07:00').split(':').map(Number);
        const at = new Date();
        at.setHours(sh, sm, 0, 0);
        if (at.getTime() <= Date.now()) at.setDate(at.getDate() + 1);
        notifications.push({
          id: 60,
          title: 'PepTalk — Today',
          body: 'Open your daily schedule to review doses and mark them taken.',
          schedule: { at, allowWhileIdle: true }
        });
      }
      if (settings.weeklySummary && (settings.weeklySummaryTime || '18:00')) {
        const [sh, sm] = (settings.weeklySummaryTime || '18:00').split(':').map(Number);
        const targetDay = Math.min(6, Math.max(0, Number(settings.weeklySummaryDay) || 0));
        const at = new Date();
        const daysAhead = (targetDay - at.getDay() + 7) % 7;
        at.setDate(at.getDate() + daysAhead);
        at.setHours(sh, sm, 0, 0);
        if (at.getTime() <= Date.now()) at.setDate(at.getDate() + 7);
        notifications.push({
          id: 70,
          title: 'PepTalk — Weekly summary',
          body: 'Review your weight trend, protocol adherence, and dose history for the week.',
          schedule: { at, allowWhileIdle: true }
        });
      }
      if (notifications.length) await LocalNotifications.schedule({ notifications });
    } catch (e) {
      console.warn('Local notifications:', e);
    }
  };

  const scheduleProtocolWebReminders = () => {
    webProtocolReminderTimersRef.current.forEach((timer) => clearTimeout(timer));
    webProtocolReminderTimersRef.current = [];
    if (Capacitor.isNativePlatform() || notificationPermission !== 'granted' || typeof Notification === 'undefined') return;
    const now = new Date();
    getNextInjections().forEach((injection) => {
      if (injection.reminderEnabled === false || injection.daysUntil < 0 || injection.daysUntil > 14) return;
      const time = /^\d{2}:\d{2}$/.test(injection.preferredTime || '') ? injection.preferredTime : (notificationSettings.reminderTime || '09:00');
      const [hour, minute] = time.split(':').map(Number);
      const at = new Date(injection.nextDate);
      at.setHours(hour, minute, 0, 0);
      const minutesBefore = Math.max(0, Number(injection.reminderMinutesBefore) || 0);
      at.setMinutes(at.getMinutes() - minutesBefore);
      const reminderDay = formatDateLocal(at);
      const sentKey = `peptalk-protocol-reminder-${reminderDay}-${injection.medication}`;
      if (localStorage.getItem(sentKey) === 'sent') return;
      const delay = Math.max(100, at.getTime() - now.getTime());
      if (delay > 14 * 24 * 60 * 60 * 1000) return;
      const timer = setTimeout(() => {
        if (localStorage.getItem(sentKey) === 'sent') return;
        localStorage.setItem(sentKey, 'sent');
        showNotification({
          title: at.getTime() < Date.now() - 60000 ? `⚠️ ${injection.medication} due` : `💉 ${injection.medication}`,
          body: `${minutesBefore ? `Scheduled in ${minutesBefore} minutes` : `Scheduled for ${formatDoseTime(time)}`}${injection.dose != null ? ` · ${injection.dose} ${injection.unit || 'mg'}` : ''}`,
          tag: `protocol-${injection.medication}-${reminderDay}`,
          requireInteraction: true,
        });
      }, delay);
      webProtocolReminderTimersRef.current.push(timer);
    });
  };

  const scheduleGeneralWebReminders = () => {
    webGeneralReminderTimersRef.current.forEach((timer) => clearTimeout(timer));
    webGeneralReminderTimersRef.current = [];
    if (Capacitor.isNativePlatform() || notificationPermission !== 'granted' || typeof Notification === 'undefined') return;
    const queue = ({ id, title, body, time, weekday = null }) => {
      const at = new Date();
      const [hour, minute] = String(time).split(':').map(Number);
      if (weekday != null) at.setDate(at.getDate() + ((weekday - at.getDay() + 7) % 7));
      at.setHours(hour, minute, 0, 0);
      if (at.getTime() <= Date.now()) at.setDate(at.getDate() + (weekday != null ? 7 : 1));
      const sentKey = `peptalk-general-reminder-${id}-${formatDateLocal(at)}`;
      if (localStorage.getItem(sentKey) === 'sent') return;
      const timer = setTimeout(() => {
        if (localStorage.getItem(sentKey) === 'sent') return;
        localStorage.setItem(sentKey, 'sent');
        showNotification({ title, body, tag: `general-${id}` });
      }, Math.max(100, at.getTime() - Date.now()));
      webGeneralReminderTimersRef.current.push(timer);
    };
    if (notificationSettings.weightReminders) queue({ id: 'weight', title: '⚖️ Log your weight', body: 'Add today’s weight to keep your trend current.', time: notificationSettings.weightReminderTime || '07:00' });
    if (notificationSettings.dailySummary) queue({ id: 'daily', title: 'PepTalk — Today', body: 'Review today’s protocol schedule and mark doses taken.', time: notificationSettings.dailySummaryTime || '07:00' });
    if (notificationSettings.weeklySummary) queue({ id: 'weekly', title: 'PepTalk — Weekly review', body: 'Review your weight trend, adherence, and dose history.', time: notificationSettings.weeklySummaryTime || '18:00', weekday: Math.min(6, Math.max(0, Number(notificationSettings.weeklySummaryDay) || 0)) });
  };

  // Notification functions
  const requestNotificationPermission = async () => {
    try {
      if (Capacitor.isNativePlatform()) {
        const { LocalNotifications } = await import('@capacitor/local-notifications');
        const perm = await LocalNotifications.requestPermissions();
        const status = perm.display === 'granted' ? 'granted' : perm.display === 'denied' ? 'denied' : 'default';
        setNotificationPermission(status);
        if (status === 'granted') {
          scheduleInjectionNotifications();
          await scheduleLocalInjectionReminders();
        }
        return status === 'granted';
      }
      if (!('Notification' in window)) {
        alert('This browser does not support notifications');
        return false;
      }
      const permission = await Notification.requestPermission();
      setNotificationPermission(permission);
      if (permission === 'granted') {
        scheduleInjectionNotifications();
        await scheduleLocalInjectionReminders();
      }
      return permission === 'granted';
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      return false;
    }
  };

  const scheduleInjectionNotifications = () => {
    if (notificationPermission !== 'granted' || !notificationSettings.injectionReminders) return;
    
    const upcoming = getNextInjections();
    upcoming.forEach(injection => {
      if (injection.isDueToday && !injection.isOverdue) {
        showNotification({
          title: '💉 Injection Reminder',
          body: `Time to inject ${injection.medication}!`,
          tag: `injection-${injection.medication}`,
          requireInteraction: true
        });
      } else if (injection.isOverdue && notificationSettings.overdueAlerts) {
        showNotification({
          title: '⚠️ Injection Overdue',
          body: `${injection.medication} is ${Math.abs(injection.daysUntil)} ${Math.abs(injection.daysUntil) === 1 ? 'day' : 'days'} overdue`,
          tag: `injection-overdue-${injection.medication}`,
          requireInteraction: true
        });
      }
    });
  };

  const showNotification = async (options) => {
    try {
      if (Capacitor.isNativePlatform()) {
        const { LocalNotifications } = await import('@capacitor/local-notifications');
        const perm = await LocalNotifications.checkPermissions();
        if (perm.display !== 'granted') {
          alert('Please enable notifications first.');
          return;
        }
        const testId = 99999;
        await LocalNotifications.cancel({ notifications: [{ id: testId }] });
        await LocalNotifications.schedule({
          notifications: [{
            id: testId,
            title: options.title ?? 'Notification',
            body: options.body ?? '',
            schedule: { at: new Date(Date.now() + 500) }
          }]
        });
        return;
      }
      if (!('Notification' in window)) {
        console.log('Notifications not supported');
        return;
      }
      if (Notification.permission !== 'granted') {
        console.log('Notification permission not granted');
        return;
      }
      const defaultOptions = {
        icon: '/icon-192.png',
        badge: '/icon-192.png',
        vibrate: [200, 100, 200],
        requireInteraction: false
      };
      const notification = new Notification(options.title, { ...defaultOptions, ...options });
      notification.onclick = () => {
        window.focus();
        setActiveTab('summary');
        window.scrollTo({ top: 0, behavior: 'smooth' });
        notification.close();
      };
      if (!options.requireInteraction) {
        setTimeout(() => notification.close(), 5000);
      }
      return notification;
    } catch (error) {
      console.error('Error showing notification:', error);
      alert(`Notification: ${options.title}\n${options.body}`);
    }
  };

  const updateNotificationSettings = (newSettings) => {
    const updated = { ...notificationSettings, ...newSettings };
    setNotificationSettings(updated);
    saveData('health-notification-settings', updated);
    if (notificationPermission === 'granted') {
      scheduleLocalInjectionReminders(updated);
    }
  };

  const updateProtocolReminder = (medication, changes) => {
    const updatedSchedules = schedules.map((schedule) => schedule.medication === medication ? { ...schedule, ...changes, updatedAt: new Date().toISOString() } : schedule);
    setSchedules(updatedSchedules);
    saveData('health-schedules', updatedSchedules);
    if (notificationPermission === 'granted') scheduleLocalInjectionReminders(notificationSettings, updatedSchedules);
  };

  const downloadProtocolCalendarAlerts = () => {
    const active = schedules.filter((schedule) => !schedule.paused && schedule.reminderEnabled !== false);
    if (!active.length) {
      alert('Turn on at least one active protocol alert first.');
      return;
    }
    const dayCodes = ['SU', 'MO', 'TU', 'WE', 'TH', 'FR', 'SA'];
    const escapeCalendarText = (value) => String(value || '').replace(/\\/g, '\\\\').replace(/\n/g, '\\n').replace(/,/g, '\\,').replace(/;/g, '\\;');
    const calendarDateTime = (date) => `${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, '0')}${String(date.getDate()).padStart(2, '0')}T${String(date.getHours()).padStart(2, '0')}${String(date.getMinutes()).padStart(2, '0')}00`;
    const now = new Date();
    const events = active.map((schedule) => {
      const start = parseLocalDate(schedule.startDate || getTodayLocal()) || new Date();
      const first = new Date(Math.max(start.getTime(), new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime()));
      const [hour, minute] = (/^\d{2}:\d{2}$/.test(schedule.preferredTime || '') ? schedule.preferredTime : (notificationSettings.reminderTime || '09:00')).split(':').map(Number);
      const minutesBefore = Math.max(0, Number(schedule.reminderMinutesBefore) || 0);
      first.setHours(hour, minute, 0, 0);
      let rule;
      if (schedule.scheduleType === 'specific_days' && schedule.specificDays?.length) {
        while (!schedule.specificDays.includes(first.getDay()) || first.getTime() <= now.getTime()) first.setDate(first.getDate() + 1);
        rule = `FREQ=WEEKLY;BYDAY=${schedule.specificDays.map((day) => dayCodes[day]).join(',')}`;
      } else {
        const interval = Math.max(1, Number(schedule.frequencyDays) || 1);
        const anchor = parseLocalDate(schedule.startDate || getTodayLocal()) || new Date();
        anchor.setHours(hour, minute, 0, 0);
        first.setTime(anchor.getTime());
        while (first.getTime() <= now.getTime()) first.setDate(first.getDate() + interval);
        rule = `FREQ=DAILY;INTERVAL=${interval}`;
      }
      return [
        'BEGIN:VEVENT',
        `UID:peptalk-${escapeCalendarText(schedule.id || schedule.medication)}@isoregret.github.io`,
        `DTSTAMP:${calendarDateTime(now)}`,
        `DTSTART:${calendarDateTime(first)}`,
        `RRULE:${rule}`,
        `SUMMARY:${escapeCalendarText(`PepTalk: ${schedule.medication}`)}`,
        `DESCRIPTION:${escapeCalendarText(`${schedule.dose ?? ''} ${schedule.unit || 'mg'}${schedule.route ? ` · ${schedule.route}` : ''}`.trim())}`,
        'BEGIN:VALARM',
        `TRIGGER:${minutesBefore ? `-PT${minutesBefore}M` : 'PT0M'}`,
        'ACTION:DISPLAY',
        `DESCRIPTION:${escapeCalendarText(minutesBefore ? `${schedule.medication} is scheduled in ${minutesBefore} minutes` : `${schedule.medication} is scheduled now`)}`,
        'END:VALARM',
        'END:VEVENT',
      ].join('\r\n');
    });
    const calendar = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//PepTalk//Protocol Alerts//EN', 'CALSCALE:GREGORIAN', 'METHOD:PUBLISH', ...events, 'END:VCALENDAR'].join('\r\n');
    const url = URL.createObjectURL(new Blob([calendar], { type: 'text/calendar;charset=utf-8' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = 'PepTalk-protocol-alerts.ics';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  const downloadGeneralReminderCalendar = () => {
    const reminders = [
      notificationSettings.weightReminders && { id: 'weight', title: 'PepTalk: Log weight', body: 'Log your weight in PepTalk.', time: notificationSettings.weightReminderTime || '07:00', rule: 'FREQ=DAILY' },
      notificationSettings.dailySummary && { id: 'daily-summary', title: 'PepTalk: Review today', body: 'Review today’s doses and schedule.', time: notificationSettings.dailySummaryTime || '07:00', rule: 'FREQ=DAILY' },
      notificationSettings.weeklySummary && { id: 'weekly-summary', title: 'PepTalk: Weekly summary', body: 'Review your weight trend, protocol adherence, and dose history.', time: notificationSettings.weeklySummaryTime || '18:00', day: Math.min(6, Math.max(0, Number(notificationSettings.weeklySummaryDay) || 0)), rule: `FREQ=WEEKLY;BYDAY=${['SU', 'MO', 'TU', 'WE', 'TH', 'FR', 'SA'][Math.min(6, Math.max(0, Number(notificationSettings.weeklySummaryDay) || 0))]}` },
    ].filter(Boolean);
    if (!reminders.length) {
      alert('Turn on at least one general reminder first.');
      return;
    }
    const pad = (value) => String(value).padStart(2, '0');
    const calendarDateTime = (date) => `${date.getFullYear()}${pad(date.getMonth() + 1)}${pad(date.getDate())}T${pad(date.getHours())}${pad(date.getMinutes())}00`;
    const now = new Date();
    const events = reminders.map((reminder) => {
      const first = new Date();
      const [hour, minute] = reminder.time.split(':').map(Number);
      if (reminder.day != null) first.setDate(first.getDate() + ((reminder.day - first.getDay() + 7) % 7));
      first.setHours(hour, minute, 0, 0);
      if (first.getTime() <= now.getTime()) first.setDate(first.getDate() + (reminder.day != null ? 7 : 1));
      return ['BEGIN:VEVENT', `UID:peptalk-${reminder.id}@isoregret.github.io`, `DTSTAMP:${calendarDateTime(now)}`, `DTSTART:${calendarDateTime(first)}`, `RRULE:${reminder.rule}`, `SUMMARY:${reminder.title}`, `DESCRIPTION:${reminder.body}`, 'BEGIN:VALARM', 'TRIGGER:PT0M', 'ACTION:DISPLAY', `DESCRIPTION:${reminder.body}`, 'END:VALARM', 'END:VEVENT'].join('\r\n');
    });
    const calendar = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//PepTalk//General Reminders//EN', 'CALSCALE:GREGORIAN', 'METHOD:PUBLISH', ...events, 'END:VCALENDAR'].join('\r\n');
    const url = URL.createObjectURL(new Blob([calendar], { type: 'text/calendar;charset=utf-8' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = 'PepTalk-general-reminders.ics';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  const addOrUpdateInjection = () => {
    if (!injectionDose || isNaN(parseFloat(injectionDose)) || Number(injectionDose) <= 0) {
      alert('Enter a dose greater than zero.');
      return;
    }
    const activeProtocol = schedules.find((schedule) => schedule.medication === injectionType && !schedule.paused);
    if (activeProtocol?.unit && String(activeProtocol.unit).toLowerCase() !== String(injectionUnit).toLowerCase()) {
      const proceed = window.confirm(`This protocol is saved in ${activeProtocol.unit}, but this dose is entered in ${injectionUnit}. Save it anyway?`);
      if (!proceed) return;
    }
    const medicationConfig = MEDICATIONS.find((medication) => medication.name === injectionType);
    if (medicationConfig?.blendComponents?.length && ['iu', 'units'].includes(String(injectionUnit).toLowerCase())) {
      const conversion = blendConversions[injectionType] || {};
      const ready = medicationConfig.blendComponents.every((component) => Number(conversion[component]) > 0);
      if (!ready) {
        alert('Finish the blend setup first so PepTalk can show the dose delivered for every compound.');
        return;
      }
    }
    const doseMg = getDoseMgForVial(injectionDose, injectionUnit, selectedVialId, injectionType);
    const selectedVial = vials.find((vial) => String(vial.id) === String(selectedVialId));
    if (selectedVial && doseMg > Number(selectedVial.remainingMg ?? selectedVial.totalMg)) {
      const proceed = window.confirm(`This dose is larger than the remaining ${Number(selectedVial.remainingMg ?? selectedVial.totalMg).toFixed(1)} mg in the selected vial. Save it anyway?`);
      if (!proceed) return;
    }
    const sev = {};
    selectedSideEffects.forEach((ef) => {
      const n = Number(sideEffectSeverity[ef]);
      sev[ef] = n >= 1 && n <= 5 ? n : 3;
    });
    const entryData = {
      type: injectionType,
      dose: parseFloat(injectionDose),
      unit: injectionUnit,
      date: injectionDate,
      time: injectionTime,
      route: injectionRoute,
      site: injectionSite,
      notes: injectionNotes,
      sideEffects: selectedSideEffects,
      sideEffectSeverity: selectedSideEffects.length ? sev : undefined,
      vialId: selectedVialId || undefined,
    };
    let updated = editingInjection
      ? injectionEntries.map(e => e.id === editingInjection.id ? { ...e, ...entryData } : e)
      : [...injectionEntries, { id: Date.now(), ...entryData }];
    updated.sort((a, b) => parseLocalDate(b.date) - parseLocalDate(a.date));
    setInjectionEntries(updated);
    saveData('health-injection-entries', updated);
    // Vial: add back old dose when editing, then deduct new dose if a vial is selected
    let updatedVials = [...vials];
    if (editingInjection?.vialId) {
      const oldDoseMg = getDoseMgForVial(editingInjection.dose, editingInjection.unit || 'mg', editingInjection.vialId, editingInjection.type);
      updatedVials = updatedVials.map(v => v.id === editingInjection.vialId ? { ...v, remainingMg: (v.remainingMg ?? v.totalMg) + oldDoseMg } : v);
    }
    if (selectedVialId) {
      updatedVials = updatedVials.map(v => v.id === selectedVialId ? { ...v, remainingMg: Math.max(0, (v.remainingMg ?? v.totalMg) - doseMg) } : v);
    }
    if (editingInjection?.vialId || selectedVialId) {
      updatedVials = pruneEmptyVials(updatedVials);
      setVials(updatedVials);
      saveData('health-vials', updatedVials);
    }
    resetInjectionForm();
  };

  const deleteInjection = (id) => {
    const removed = injectionEntries.find(e => e.id === id);
    if (!removed) return;
    const prev = injectionEntries;
    const updated = prev.filter(e => e.id !== id);
    setInjectionEntries(updated);
    if (!saveData('health-injection-entries', updated)) {
      setInjectionEntries(prev);
      return;
    }
    pushUndoToast('Injection removed', () => {
      const restored = [...updated, removed].sort((a, b) => parseLocalDate(b.date) - parseLocalDate(a.date));
      setInjectionEntries(restored);
      saveData('health-injection-entries', restored);
    });
  };

  const addMeasurement = () => {
    if (!measurementValue || isNaN(parseFloat(measurementValue))) return;
    const updated = [...measurementEntries, { id: Date.now(), type: measurementType, value: parseFloat(measurementValue), date: measurementDate }];
    updated.sort((a, b) => parseLocalDate(b.date) - parseLocalDate(a.date));
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
      updated = schedules.map(s => s.medication === scheduleMed ? { 
        ...s, 
        frequencyDays: scheduleFrequency, 
        preferredDay: scheduleDay,
        startDate: scheduleStartDate,
        scheduleType: scheduleType,
        specificDays: selectedDays
      } : s);
    } else {
      updated = [...schedules, { 
        id: Date.now(), 
        medication: scheduleMed, 
        frequencyDays: scheduleFrequency, 
        preferredDay: scheduleDay,
        startDate: scheduleStartDate,
        scheduleType: scheduleType,
        specificDays: selectedDays
      }];
    }
    setSchedules(updated);
    saveData('health-schedules', updated);
    if (notificationPermission === 'granted') scheduleLocalInjectionReminders(notificationSettings, updated);
  };

  const deleteSchedule = (id) => {
    const updated = schedules.filter(s => s.id !== id);
    setSchedules(updated);
    saveData('health-schedules', updated);
  };

  const getSavedDoseConcentrationProfile = (medication) => {
    const key = String(medication || '').trim().toLowerCase();
    if (!key) return {};
    const fromState = Object.entries(doseConcentrations).find(([profileKey, value]) =>
      String(profileKey).trim().toLowerCase() === key || String(value?.medication || '').trim().toLowerCase() === key,
    )?.[1];
    if (fromState) return fromState;
    try {
      const saved = JSON.parse(localStorage.getItem('health-dose-concentrations') || '{}');
      return saved?.[key] || {};
    } catch {
      return {};
    }
  };

  const concentrationFieldsForMedication = (medication, protocolConcentration = null) => {
    const profile = protocolConcentration || getSavedDoseConcentrationProfile(medication);
    return {
      concentrationTotalMg: profile.totalMg ? String(profile.totalMg) : '',
      concentrationBacWaterMl: profile.bacWaterMl ? String(profile.bacWaterMl) : '',
      concentrationMgPerMl: profile.concentration ? String(profile.concentration) : '',
    };
  };

  const openProtocolEditor = (medName = null) => {
    const medicationName = medName || schedules[0]?.medication || MEDICATIONS[0].name;
    const existing = schedules.find((schedule) => schedule.medication === medicationName);
    const lastEntry = injectionEntries
      .filter((entry) => entry.type === medicationName)
      .sort((a, b) => getEntryDateTime(b) - getEntryDateTime(a))[0];
    const plan = titrationPlans.find((item) => item.medication === medicationName);
    const currentStep = plan ? getCurrentTitrationDose(plan) : null;
    const medication = MEDICATIONS.find((item) => item.name === medicationName);
    setProtocolEditorMed(medicationName);
    setProtocolDraft({
      medication: medicationName,
      dose: existing?.dose ?? currentStep?.dose ?? lastEntry?.dose ?? '',
      unit: existing?.unit || currentStep?.unit || lastEntry?.unit || 'mg',
      route: existing?.route || lastEntry?.route || 'SubQ',
      scheduleType: existing?.scheduleType || 'recurring',
      frequencyDays: Math.max(1, Number(existing?.frequencyDays || medication?.defaultSchedule || 1)),
      specificDays: Array.isArray(existing?.specificDays) ? existing.specificDays : [],
      preferredTime: existing?.preferredTime || lastEntry?.time || '09:00',
      reminderEnabled: existing?.reminderEnabled !== false,
      reminderMinutesBefore: Math.max(0, Number(existing?.reminderMinutesBefore) || 0),
      startDate: existing?.startDate || toCalendarDay(lastEntry?.date) || getTodayLocal(),
      cycleOnWeeks: existing?.cycleOnWeeks ?? '',
      cycleOffWeeks: existing?.cycleOffWeeks ?? '',
      notes: existing?.protocolNotes || '',
      paused: Boolean(existing?.paused),
      ...concentrationFieldsForMedication(medicationName, existing?.doseConcentration),
    });
  };

  const changeProtocolMedication = (medName) => {
    const existing = schedules.find((schedule) => schedule.medication === medName);
    const lastEntry = injectionEntries
      .filter((entry) => entry.type === medName)
      .sort((a, b) => getEntryDateTime(b) - getEntryDateTime(a))[0];
    const medication = MEDICATIONS.find((item) => item.name === medName);
    setProtocolEditorMed(medName);
    setProtocolDraft({
      medication: medName,
      dose: existing?.dose ?? lastEntry?.dose ?? '',
      unit: existing?.unit || lastEntry?.unit || 'mg',
      route: existing?.route || lastEntry?.route || 'SubQ',
      scheduleType: existing?.scheduleType || 'recurring',
      frequencyDays: Math.max(1, Number(existing?.frequencyDays || medication?.defaultSchedule || 1)),
      specificDays: Array.isArray(existing?.specificDays) ? existing.specificDays : [],
      preferredTime: existing?.preferredTime || lastEntry?.time || '09:00',
      reminderEnabled: existing?.reminderEnabled !== false,
      reminderMinutesBefore: Math.max(0, Number(existing?.reminderMinutesBefore) || 0),
      startDate: existing?.startDate || toCalendarDay(lastEntry?.date) || getTodayLocal(),
      cycleOnWeeks: existing?.cycleOnWeeks ?? '',
      cycleOffWeeks: existing?.cycleOffWeeks ?? '',
      notes: existing?.protocolNotes || '',
      paused: Boolean(existing?.paused),
      ...concentrationFieldsForMedication(medName, existing?.doseConcentration),
    });
  };

  const saveProtocol = () => {
    if (!protocolDraft?.medication) return;
    const numericDose = Number(protocolDraft.dose);
    if (!Number.isFinite(numericDose) || numericDose <= 0) {
      alert('Enter a dose greater than zero.');
      return;
    }
    if (protocolDraft.scheduleType === 'specific_days' && protocolDraft.specificDays.length === 0) {
      alert('Choose at least one dosing day.');
      return;
    }
    const existing = schedules.find((schedule) => schedule.medication === protocolDraft.medication);
    if (existing?.unit && String(existing.unit).toLowerCase() !== String(protocolDraft.unit || 'mg').toLowerCase()) {
      const proceed = window.confirm(`Change this protocol from ${existing.unit} to ${protocolDraft.unit || 'mg'}? Existing dose history keeps its original units.`);
      if (!proceed) return;
    }
    const changeLog = [...(existing?.changeLog || [])];
    if (!existing) {
      changeLog.push({ date: protocolDraft.startDate || getTodayLocal(), type: 'started', label: 'Protocol started' });
    } else {
      if (Number(existing.dose) !== numericDose || String(existing.unit || 'mg') !== String(protocolDraft.unit || 'mg')) {
        changeLog.push({ date: getTodayLocal(), type: 'dose', label: `Dose ${numericDose} ${protocolDraft.unit || 'mg'}` });
      }
      if (Boolean(existing.paused) !== Boolean(protocolDraft.paused)) {
        changeLog.push({ date: getTodayLocal(), type: protocolDraft.paused ? 'paused' : 'resumed', label: protocolDraft.paused ? 'Protocol paused' : 'Protocol resumed' });
      }
    }
    const directConcentration = Number(protocolDraft.concentrationMgPerMl);
    const concentrationTotalMg = Number(protocolDraft.concentrationTotalMg);
    const concentrationBacWaterMl = Number(protocolDraft.concentrationBacWaterMl);
    const protocolDoseConcentration = directConcentration > 0 || (concentrationTotalMg > 0 && concentrationBacWaterMl > 0)
      ? { totalMg: concentrationTotalMg || 0, bacWaterMl: concentrationBacWaterMl || 0, concentration: directConcentration || 0 }
      : existing?.doseConcentration || null;
    const saved = {
      ...(existing || { id: Date.now() }),
      medication: protocolDraft.medication,
      dose: numericDose,
      unit: protocolDraft.unit || 'mg',
      route: protocolDraft.route || 'SubQ',
      scheduleType: protocolDraft.scheduleType,
      frequencyDays: Math.max(1, Number(protocolDraft.frequencyDays) || 1),
      preferredDay: protocolDraft.specificDays[0] ?? existing?.preferredDay ?? 0,
      specificDays: protocolDraft.scheduleType === 'specific_days' ? [...protocolDraft.specificDays].sort() : [],
      preferredTime: protocolDraft.preferredTime || '09:00',
      reminderEnabled: protocolDraft.reminderEnabled !== false,
      reminderMinutesBefore: Math.max(0, Number(protocolDraft.reminderMinutesBefore) || 0),
      startDate: protocolDraft.startDate || getTodayLocal(),
      cycleOnWeeks: protocolDraft.cycleOnWeeks === '' ? null : Math.max(1, Number(protocolDraft.cycleOnWeeks) || 1),
      cycleOffWeeks: protocolDraft.cycleOffWeeks === '' ? null : Math.max(0, Number(protocolDraft.cycleOffWeeks) || 0),
      protocolNotes: protocolDraft.notes || '',
      paused: Boolean(protocolDraft.paused),
      ...(protocolDoseConcentration ? { doseConcentration: protocolDoseConcentration } : {}),
      updatedAt: new Date().toISOString(),
      changeLog: changeLog.slice(-30),
    };
    const updated = existing
      ? schedules.map((schedule) => schedule.medication === saved.medication ? saved : schedule)
      : [...schedules, saved];
    if (directConcentration > 0 || (concentrationTotalMg > 0 && concentrationBacWaterMl > 0)) {
      const key = String(protocolDraft.medication).trim().toLowerCase();
      const nextProfiles = {
        ...doseConcentrations,
        [key]: {
          medication: protocolDraft.medication,
          totalMg: concentrationTotalMg || 0,
          bacWaterMl: concentrationBacWaterMl || 0,
          concentration: directConcentration || 0,
          updatedAt: new Date().toISOString(),
        },
      };
      setDoseConcentrations(nextProfiles);
      saveData('health-dose-concentrations', nextProfiles);
    }
    setSchedules(updated);
    saveData('health-schedules', updated);
    if (notificationPermission === 'granted') scheduleLocalInjectionReminders(notificationSettings, updated);
    if (!saved.paused) setInsightMedicationInactive(saved.medication, false);
    setProtocolEditorMed(null);
    setProtocolDraft(null);
  };

  const saveTitrationPlan = () => {
    const validSteps = titrationSteps.filter(s => s.dose && !isNaN(parseFloat(s.dose)));
    if (validSteps.length === 0) return;
    const existing = titrationPlans.find(t => t.medication === titrationMed);
    let updated;
    if (existing) {
      updated = titrationPlans.map(t => t.medication === titrationMed ? { ...t, steps: validSteps, startDate: getTodayLocal() } : t);
    } else {
      updated = [...titrationPlans, { id: Date.now(), medication: titrationMed, steps: validSteps, startDate: getTodayLocal() }];
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

  // Journal CRUD operations
  const addOrUpdateJournal = () => {
    if (!journalContent.trim()) return;
    if (editingJournal) {
      const updated = journalEntries.map(e => e.id === editingJournal.id ? { ...e, date: journalDate, content: journalContent, mood: journalMood, energy: journalEnergy, hunger: journalHunger } : e);
      setJournalEntries(updated);
      saveData('health-journal', updated);
    } else {
      const newEntry = { id: Date.now(), date: journalDate, content: journalContent, mood: journalMood, energy: journalEnergy, hunger: journalHunger };
      const updated = [...journalEntries, newEntry];
      setJournalEntries(updated);
      saveData('health-journal', updated);
    }
    resetJournalForm();
  };

  const deleteJournal = (id) => {
    const removed = journalEntries.find(e => e.id === id);
    if (!removed) return;
    const prev = journalEntries;
    const updated = prev.filter(e => e.id !== id);
    setJournalEntries(updated);
    if (!saveData('health-journal', updated)) {
      setJournalEntries(prev);
      return;
    }
    pushUndoToast('Journal entry removed', () => {
      const restored = [...updated, removed];
      setJournalEntries(restored);
      saveData('health-journal', restored);
    });
  };

  const resetSleepForm = () => {
    setSleepBedDate(getTodayLocal());
    setSleepBedTime('22:30');
    setSleepWakeTime('07:00');
    setSleepQuality(3);
    setSleepNotes('');
    setEditingSleep(null);
    setShowSleepForm(false);
  };

  const addOrUpdateSleep = () => {
    const hours = computeSleepHours(sleepBedDate, sleepBedTime, sleepWakeTime);
    if (hours == null) return;
    const q = parseInt(sleepQuality, 10);
    const row = {
      id: editingSleep ? editingSleep.id : Date.now(),
      date: sleepBedDate,
      bedTime: sleepBedTime,
      wakeTime: sleepWakeTime,
      quality: q >= 1 && q <= 5 ? q : 3,
      hours,
      notes: sleepNotes.trim() || undefined,
    };
    const updated = editingSleep
      ? sleepEntries.map((e) => (e.id === editingSleep.id ? row : e))
      : [...sleepEntries, row];
    updated.sort((a, b) => String(b.date).localeCompare(String(a.date)) || (b.id || 0) - (a.id || 0));
    setSleepEntries(updated);
    saveData('health-sleep-entries', updated);
    resetSleepForm();
  };

  const deleteSleep = (id) => {
    const updated = sleepEntries.filter((e) => e.id !== id);
    setSleepEntries(updated);
    saveData('health-sleep-entries', updated);
  };

  const saveTodaySteps = () => {
    const n = parseInt(todayStepsInput, 10);
    if (isNaN(n) || n < 0 || n > 200000) return;
    const todayStr = getTodayLocal();
    const existing = dailyTrackEntries.find((e) => e.date === todayStr);
    let updated;
    if (existing) {
      updated = dailyTrackEntries.map((e) => (e.date === todayStr ? { ...e, steps: n } : e));
    } else {
      updated = [...dailyTrackEntries, { id: Date.now(), date: todayStr, hydrationOz: 0, proteinG: 0, meals: [], steps: n }];
    }
    setDailyTrackEntries(updated);
    saveData('health-daily-track', updated);
    setTodayStepsInput('');
  };

  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      const updated = [...progressPhotos, { id: Date.now(), data: reader.result, date: getTodayLocal(), note: '' }];
      setProgressPhotos(updated);
      saveData('health-photos', updated);
    };
    reader.readAsDataURL(file);
  };

  // Export all data to JSON file (on native: write to cache + share so user can save)
  const exportData = async () => {
    const allData = {
      exportDate: new Date().toISOString(),
      version: '1.0',
      weightEntries,
      injectionEntries,
      measurementEntries,
      progressPhotos,
      schedules,
      titrationPlans,
      journalEntries,
      dailyTrackEntries,
      glucoseEntries,
      a1cEntries,
      labEntries,
      sleepEntries,
      userProfile,
      vials,
      blendConversions,
      insightsInactiveMeds,
      appleHealthImportHistory,
      appleWeightDailyStrategy,
      doseActions
    };

    const dataStr = JSON.stringify(allData, null, 2);
    const filename = `health-tracker-backup-${getTodayLocal()}.json`;

    if (Capacitor.isNativePlatform()) {
      try {
        const { Filesystem, Directory, Encoding } = await import('@capacitor/filesystem');
        const { Share } = await import('@capacitor/share');
        const result = await Filesystem.writeFile({
          path: filename,
          data: dataStr,
          directory: Directory.Cache,
          encoding: Encoding.UTF8
        });
        await Share.share({
          title: 'PepTalk backup',
          files: [result.uri],
          dialogTitle: 'Save backup (e.g. to Files or Drive)'
        });
        const completedAt = new Date().toISOString();
        setLastBackupAt(completedAt);
        localStorage.setItem('health-last-backup-at', completedAt);
      } catch (err) {
        console.error('Export failed:', err);
        alert('Export failed: ' + (err?.message || String(err)));
      }
      return;
    }

    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    const completedAt = new Date().toISOString();
    setLastBackupAt(completedAt);
    localStorage.setItem('health-last-backup-at', completedAt);
  };

  const verifyBackupFile = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (loadEvent) => {
      try {
        const data = JSON.parse(String(loadEvent.target?.result || ''));
        if (!data.version || !data.exportDate || !Array.isArray(data.weightEntries) || !Array.isArray(data.injectionEntries)) throw new Error('Invalid backup');
        alert(`Backup verified. ${data.weightEntries.length} weights, ${data.injectionEntries.length} doses, and ${(data.schedules || []).length} protocols are readable.`);
      } catch (_) {
        alert('This file is not a valid PepTalk backup.');
      } finally {
        event.target.value = '';
      }
    };
    reader.readAsText(file);
  };

  // Import data from JSON file
  const importData = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const imported = JSON.parse(event.target.result);
        
        // Validate the data structure
        if (!imported.version || !imported.exportDate) {
          alert('Invalid backup file format');
          return;
        }
        
        // Confirm before overwriting
        const confirmImport = window.confirm(
          `This will replace all current data with backup from ${new Date(imported.exportDate).toLocaleDateString()}. Continue?`
        );
        
        if (!confirmImport) return;
        
        // Import all data
        if (imported.weightEntries) {
          setWeightEntries(imported.weightEntries);
          saveData('health-weight-entries', imported.weightEntries);
        }
        if (imported.injectionEntries) {
          setInjectionEntries(imported.injectionEntries);
          saveData('health-injection-entries', imported.injectionEntries);
        }
        if (imported.measurementEntries) {
          setMeasurementEntries(imported.measurementEntries);
          saveData('health-measurements', imported.measurementEntries);
        }
        if (imported.progressPhotos) {
          setProgressPhotos(imported.progressPhotos);
          saveData('health-photos', imported.progressPhotos);
        }
        if (imported.schedules) {
          setSchedules(imported.schedules);
          saveData('health-schedules', imported.schedules);
        }
        if (imported.titrationPlans) {
          setTitrationPlans(imported.titrationPlans);
          saveData('health-titration', imported.titrationPlans);
        }
        if (imported.journalEntries) {
          setJournalEntries(imported.journalEntries);
          saveData('health-journal', imported.journalEntries);
        }
        if (imported.dailyTrackEntries) {
          setDailyTrackEntries(imported.dailyTrackEntries);
          saveData('health-daily-track', imported.dailyTrackEntries);
        }
        if (imported.glucoseEntries) {
          setGlucoseEntries(imported.glucoseEntries);
          saveData('health-glucose-entries', imported.glucoseEntries);
        }
        if (imported.a1cEntries) {
          setA1cEntries(imported.a1cEntries);
          saveData('health-a1c-entries', imported.a1cEntries);
        }
        if (imported.labEntries) {
          setLabEntries(imported.labEntries);
          saveData('health-lab-entries', imported.labEntries);
        }
        if (imported.sleepEntries) {
          setSleepEntries(imported.sleepEntries);
          saveData('health-sleep-entries', imported.sleepEntries);
        }
        if (imported.userProfile) {
          setUserProfile(imported.userProfile);
          saveData('health-user-profile', imported.userProfile);
        }
        if (imported.vials) {
          setVials(imported.vials);
          saveData('health-vials', imported.vials);
        }
        if (imported.blendConversions && typeof imported.blendConversions === 'object' && !Array.isArray(imported.blendConversions)) {
          setBlendConversions(imported.blendConversions);
          saveData('health-blend-conversions', imported.blendConversions);
        }
        if (Array.isArray(imported.insightsInactiveMeds)) {
          setInsightsInactiveMeds(imported.insightsInactiveMeds);
          saveData('health-insights-inactive-meds', imported.insightsInactiveMeds);
        }
        if (Array.isArray(imported.appleHealthImportHistory)) {
          setAppleHealthImportHistory(imported.appleHealthImportHistory);
          saveData('health-apple-import-history', imported.appleHealthImportHistory);
        }
        if (['morning', 'latest', 'lowest', 'average'].includes(imported.appleWeightDailyStrategy)) {
          setAppleWeightDailyStrategy(imported.appleWeightDailyStrategy);
          saveData('health-apple-weight-strategy', imported.appleWeightDailyStrategy);
        }
        if (Array.isArray(imported.doseActions)) {
          setDoseActions(imported.doseActions);
          saveData('health-dose-actions', imported.doseActions);
        }
        
        alert('Data imported successfully!');
        e.target.value = ''; // Reset file input
            } catch (error) {
        alert('Error importing data. Please check the file format.');
        console.error('Import error:', error);
      }
    };

    reader.readAsText(file);
  };

  const importAppleHealthWeights = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (loadEvent) => {
      try {
        const text = String(loadEvent.target?.result || '');
        const candidates = [];
        if (/\.xml$/i.test(file.name) || text.includes('HKQuantityTypeIdentifierBodyMass')) {
          const recordPattern = /<Record\b[^>]*type="HKQuantityTypeIdentifierBodyMass"[^>]*>/g;
          const records = text.match(recordPattern) || [];
          records.forEach((record) => {
            const readAttribute = (name) => record.match(new RegExp(`${name}="([^"]+)"`))?.[1] || '';
            const rawValue = Number(readAttribute('value'));
            const unit = readAttribute('unit').toLowerCase();
            const startDate = readAttribute('startDate');
            const day = startDate.slice(0, 10);
            if (!/^\d{4}-\d{2}-\d{2}$/.test(day) || !Number.isFinite(rawValue) || rawValue <= 0) return;
            const pounds = unit === 'kg' ? rawValue * 2.2046226218 : rawValue;
            candidates.push({ day, timestamp: startDate, weight: Number(pounds.toFixed(1)) });
          });
        } else {
          const lines = text.split(/\r?\n/).filter(Boolean);
          const headers = (lines.shift() || '').split(',').map((value) => value.trim().replace(/^"|"$/g, '').toLowerCase());
          const dateIndex = headers.findIndex((value) => value.includes('date') || value.includes('start'));
          const weightIndex = headers.findIndex((value) => value.includes('weight') || value.includes('value'));
          const unitIndex = headers.findIndex((value) => value.includes('unit'));
          lines.forEach((line) => {
            const values = line.match(/("[^"]*"|[^,]+)/g)?.map((value) => value.trim().replace(/^"|"$/g, '')) || [];
            const dateValue = values[dateIndex >= 0 ? dateIndex : 0] || '';
            const rawValue = Number(values[weightIndex >= 0 ? weightIndex : 1]);
            const unit = String(values[unitIndex] || 'lb').toLowerCase();
            const parsed = new Date(dateValue);
            const day = /^\d{4}-\d{2}-\d{2}/.test(dateValue) ? dateValue.slice(0, 10) : (isNaN(parsed.getTime()) ? '' : formatDateLocal(parsed));
            if (!day || !Number.isFinite(rawValue) || rawValue <= 0) return;
            candidates.push({ day, timestamp: dateValue, weight: Number((unit.includes('kg') ? rawValue * 2.2046226218 : rawValue).toFixed(1)) });
          });
        }

        if (candidates.length === 0) {
          alert('No Apple Health body-weight records were found in this file.');
          return;
        }
        const readingsByDay = new Map();
        candidates.sort((a, b) => String(a.timestamp).localeCompare(String(b.timestamp))).forEach((item) => {
          readingsByDay.set(item.day, [...(readingsByDay.get(item.day) || []), item]);
        });
        const dailyReadings = [...readingsByDay.entries()].map(([day, readings]) => {
          if (appleWeightDailyStrategy === 'latest') return readings[readings.length - 1];
          if (appleWeightDailyStrategy === 'lowest') return readings.reduce((lowest, item) => item.weight < lowest.weight ? item : lowest, readings[0]);
          if (appleWeightDailyStrategy === 'average') return { ...readings[0], day, weight: Number((readings.reduce((sum, item) => sum + item.weight, 0) / readings.length).toFixed(1)) };
          const morning = readings.filter((item) => {
            const match = String(item.timestamp).match(/T(\d{2}):/);
            return match && Number(match[1]) < 12;
          });
          return morning[0] || readings[0];
        });
        const existingDays = new Set(weightEntries.map((entry) => toCalendarDay(entry.date)));
        const imported = dailyReadings
          .filter((item) => !existingDays.has(item.day))
          .map((item, index) => ({ id: Date.now() + index, weight: item.weight, date: item.day, source: 'Apple Health import' }));
        const merged = sortWeightByDateDesc([...weightEntries, ...imported]);
        setWeightEntries(merged);
        saveData('health-weight-entries', merged);
        const importRecord = {
          id: Date.now(),
          importedAt: new Date().toISOString(),
          fileName: file.name,
          found: readingsByDay.size,
          added: imported.length,
          skipped: readingsByDay.size - imported.length,
          strategy: appleWeightDailyStrategy,
        };
        const nextImportHistory = [importRecord, ...appleHealthImportHistory].slice(0, 10);
        setAppleHealthImportHistory(nextImportHistory);
        saveData('health-apple-import-history', nextImportHistory);
        alert(imported.length > 0 ? `Imported ${imported.length} daily weight records from Apple Health.` : 'Those Apple Health dates are already in PepTalk. Nothing was duplicated.');
      } catch (error) {
        console.error('Apple Health import failed:', error);
        alert('PepTalk could not read that Apple Health file. Choose export.xml or a weight CSV.');
      } finally {
        event.target.value = '';
      }
    };
    reader.readAsText(file);
  };

  // Print/save as PDF — Constitute calculator (opens print dialog; user can "Save as PDF")
  const printDoctorSummary = () => {
    const sortedWeights = sortWeightByDateAsc(weightEntries);
    const sortedInjections = [...injectionEntries].sort((a, b) => parseLocalDate(b.date) - parseLocalDate(a.date));
    const byMed = {};
    sortedInjections.forEach(inj => {
      if (!byMed[inj.type]) byMed[inj.type] = [];
      if (byMed[inj.type].length < 20) byMed[inj.type].push(inj);
    });
    const weightRows = sortedWeights.slice(-60).reverse().map(e =>
      `<tr><td>${new Date(parseLocalDate(e.date)).toLocaleDateString('en-US')}</td><td>${e.weight} lbs</td></tr>`
    ).join('');
    const injectionRows = Object.entries(byMed).map(([med, list]) =>
      `<tr><td>${med}</td><td>${list.map(i => `${new Date(parseLocalDate(i.date)).toLocaleDateString('en-US')}: ${i.dose}${i.unit}`).join('; ')}</td></tr>`
    ).join('');
    const measurementRows = [...measurementEntries].sort((a, b) => parseLocalDate(b.date) - parseLocalDate(a.date)).slice(0, 50).map(e =>
      `<tr><td>${e.type}</td><td>${e.value}"</td><td>${new Date(parseLocalDate(e.date)).toLocaleDateString('en-US')}</td></tr>`
    ).join('');
    const recentJournals = [...journalEntries].sort((a, b) => parseLocalDate(b.date) - parseLocalDate(a.date)).slice(0, 30).map(e =>
      `<tr><td>${new Date(parseLocalDate(e.date)).toLocaleDateString('en-US')}</td><td>${e.mood}</td><td>${e.energy}/10</td><td>${e.hunger}/10</td><td>${(e.content || '').replace(/</g, '&lt;').substring(0, 200)}${(e.content || '').length > 200 ? '…' : ''}</td></tr>`
    ).join('');
    const win = window.open('', '_blank');
    win.document.write(`
<!DOCTYPE html>
<html><head><meta charset="utf-8"><title>PepTalk – Constitute Calculator</title>
<style>
  body { font-family: system-ui, sans-serif; padding: 24px; color: #1e293b; max-width: 800px; margin: 0 auto; }
  h1 { font-size: 1.5rem; margin-bottom: 4px; }
  .meta { color: #64748b; font-size: 0.875rem; margin-bottom: 24px; }
  h2 { font-size: 1.1rem; margin-top: 20px; margin-bottom: 8px; border-bottom: 1px solid #e2e8f0; }
  table { border-collapse: collapse; width: 100%; margin-bottom: 16px; font-size: 0.875rem; }
  th, td { border: 1px solid #e2e8f0; padding: 8px 12px; text-align: left; }
  th { background: #f1f5f9; }
  @media print { body { padding: 12px; } }
</style></head><body>
<h1>PepTalk – Health Summary for Provider</h1>
<p class="meta">Generated ${new Date().toLocaleDateString('en-US', { dateStyle: 'long' })}. Use browser Print → Save as PDF to export.</p>
<h2>Weight history (recent)</h2>
<table><thead><tr><th>Date</th><th>Weight</th></tr></thead><tbody>${weightRows || '<tr><td colspan="2">No entries</td></tr>'}</tbody></table>
<h2>Injections summary</h2>
<table><thead><tr><th>Medication</th><th>Recent doses</th></tr></thead><tbody>${injectionRows || '<tr><td colspan="2">No entries</td></tr>'}</tbody></table>
<h2>Body measurements</h2>
<table><thead><tr><th>Type</th><th>Value</th><th>Date</th></tr></thead><tbody>${measurementRows || '<tr><td colspan="3">No entries</td></tr>'}</tbody></table>
<h2>Journal (recent)</h2>
<table><thead><tr><th>Date</th><th>Mood</th><th>Energy</th><th>Hunger</th><th>Notes</th></tr></thead><tbody>${recentJournals || '<tr><td colspan="5">No entries</td></tr>'}</tbody></table>
${userProfile?.goalWeight ? `<p class="meta">Goal weight: ${userProfile.goalWeight} lbs.</p>` : ''}
</body></html>`);
    win.document.close();
    win.focus();
    setTimeout(() => { try { win.print(); } finally { win.close(); } }, 400);
  };

  const exportClinicianPdfFile = () => {
    try {
      downloadClinicianSummaryPdf({
        generatedAt: new Date().toISOString(),
        userProfile,
        weightEntries,
        injectionEntries,
        journalEntries,
        labEntries,
        glucoseEntries,
        sleepEntries,
        goalStack: goalUserStack,
        schedules,
        titrationPlans,
        vials,
        medicationInsights: getMedicationInsights(),
      });
    } catch (err) {
      console.error(err);
      alert('Could not generate PDF.');
    }
  };

  const handleGraphicalSummaryPdf = async () => {
    const el = graphicalSummaryCaptureRef.current;
    if (!el) return;
    setGraphicalPdfBusy(true);
    try {
      await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
      await downloadGraphicalSummaryPdf(el);
    } catch (err) {
      console.error(err);
      alert('Could not save visual summary PDF.');
    } finally {
      setGraphicalPdfBusy(false);
    }
  };

  const exportCSV = async () => {
    const sortedWeights = sortWeightByDateAsc(weightEntries);
    const sortedInjections = [...injectionEntries].sort((a, b) => parseLocalDate(a.date) - parseLocalDate(b.date));
    const sortedGlucose = sortByDateDesc(glucoseEntries);
    const sortedA1c = sortByDateDesc(a1cEntries);
    const rows = [];
    if (csvType === 'weight') {
      rows.push('Date,Weight (lbs)');
      sortedWeights.forEach(e => rows.push(`${e.date},${e.weight}`));
    } else if (csvType === 'injections') {
      rows.push('Date,Medication,Dose,Unit,Route,Site');
      sortedInjections.forEach(e => rows.push(`${e.date},${e.type},${e.dose},${e.unit || ''},${e.route || ''},${e.site || ''}`));
    } else {
      rows.push('Type,Date,Value,Medication,Dose,Unit,Route,Site');
      sortedWeights.forEach(e => rows.push(`Weight,${e.date},${e.weight},,,,,`));
      sortedInjections.forEach(e => rows.push(`Injection,${e.date},,${e.type},${e.dose},${e.unit},${e.route || ''},${e.site || ''}`));
      sortedGlucose.forEach(e => rows.push(`Glucose,${e.date},${e.value} mg/dL (${e.type}),,,`));
      sortedA1c.forEach(e => rows.push(`A1C,${e.date},${e.value}%,,,`));
      labEntries.sort((a, b) => a.date.localeCompare(b.date)).forEach(e => rows.push(`Lab,${e.date},${e.value} ${e.unit},${e.type},,,,`));
    }
    const csv = rows.join('\n');
    const filename = csvType === 'weight' ? `PepTalk-weight-${getTodayLocal()}.csv` : csvType === 'injections' ? `PepTalk-injections-${getTodayLocal()}.csv` : `PepTalk-export-${getTodayLocal()}.csv`;

    if (Capacitor.isNativePlatform()) {
      try {
        const { Filesystem, Directory, Encoding } = await import('@capacitor/filesystem');
        const { Share } = await import('@capacitor/share');
        const result = await Filesystem.writeFile({
          path: filename,
          data: csv,
          directory: Directory.Cache,
          encoding: Encoding.UTF8
        });
        await Share.share({
          title: 'PepTalk export',
          files: [result.uri],
          dialogTitle: 'Save CSV (e.g. to Files or Drive)'
        });
      } catch (err) {
        console.error('CSV export failed:', err);
        alert('Export failed: ' + (err?.message || String(err)));
      }
      return;
    }

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const runExport = async () => {
    if (exportFormat === 'json') await exportData();
    else if (exportFormat === 'csv') await exportCSV();
  };

// Wipe ALL local data and reset state (factory reset)
const wipeAllData = () => {
  const keysToRemove = [
    'health-weight-entries',
    'health-injection-entries',
    'health-measurements',
    'health-photos',
    'health-schedules',
    'health-titration',
    'health-journal',
    'health-daily-track',
    'health-glucose-entries',
    'health-a1c-entries',
    'health-lab-entries',
    'health-user-profile',
    'health-vials',
    'health-blend-conversions',
    'health-insights-inactive-meds',
    'health-weekly-dose-weight-excluded-meds',
    'health-goals-user-stack',
    'health-sleep-entries',
    'health-apple-import-history',
    'health-apple-weight-strategy',
    'health-last-backup-at',
    'health-dose-actions',
    'peptalk-cloud-opt-out',
  ];

  keysToRemove.forEach((k) => localStorage.removeItem(k));

  setCloudOptOut(false);

  setWeightEntries([]);
  setInjectionEntries([]);
  setMeasurementEntries([]);
  setProgressPhotos([]);
  setSchedules([]);
  setTitrationPlans([]);
  setJournalEntries([]);
  setDailyTrackEntries([]);
  setGlucoseEntries([]);
  setA1cEntries([]);
  setLabEntries([]);
  setVials([]);
  setBlendConversions({});
  setInsightsInactiveMeds([]);
  setWeeklyDoseWeightExcludedMeds([]);
  setGoalUserStack([]);
  setSleepEntries([]);
  setAppleHealthImportHistory([]);
  setAppleWeightDailyStrategy('morning');
  setLastBackupAt(null);
  setDoseActions([]);
  setUserProfile({ height: 70, goalWeight: 200, hydrationGoalOz: 64 });

  setShowWipeConfirm(false);
  setWipeConfirmChecked(false);

  setActiveTab('summary');
  setActiveToolSection('calculator');

  setCelebrationMessage('All data wiped. Fresh start ✨');
  setShowCelebration(true);
  setTimeout(() => setShowCelebration(false), 2500);
};

  const deletePhoto = (id) => {
    const updated = progressPhotos.filter(p => p.id !== id);
    setProgressPhotos(updated);
    saveData('health-photos', updated);
  };

  const toggleSideEffect = (effect) => {
    setSelectedSideEffects((prev) => (prev.includes(effect) ? prev.filter((e) => e !== effect) : [...prev, effect]));
    setSideEffectSeverity((prev) => {
      if (prev[effect] !== undefined) {
        const { [effect]: _, ...rest } = prev;
        return rest;
      }
      return { ...prev, [effect]: 3 };
    });
  };
  const getMedicationColor = (type) => MEDICATIONS.find(m => m.name === type)?.color || '#6b7280';

  // Filtering and calculations
  const getFilteredData = (entries) => {
    if (timeRange === 'all') return entries;
    const months = { '1m': 1, '3m': 3, '6m': 6, '12m': 12 };
    const cutoffDate = new Date();
    cutoffDate.setMonth(cutoffDate.getMonth() - months[timeRange]);
    cutoffDate.setHours(0, 0, 0, 0);
    return entries.filter(e => {
      const day = toCalendarDay(e.date);
      if (!day) return false;
      const d = parseLocalDate(day);
      return !isNaN(d.getTime()) && d >= cutoffDate;
    });
  };

  const getDateRangeLabel = () => {
    const filtered = getFilteredData(weightEntries);
    if (filtered.length === 0) return '';
    const sorted = [...filtered].sort((a, b) => parseLocalDate(a.date) - parseLocalDate(b.date));
    const formatDate = (d) => new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    return `${formatDate(sorted[0].date)} – ${formatDate(sorted[sorted.length - 1].date)}`;
  };

  const sortByDateDesc = (entries) => [...entries].sort((a, b) => (b.date || '').localeCompare(a.date || ''));
  // Week in review: this week (Mon–today) weight change, injections, hydration
  const getWeeklyDigest = () => {
    const now = new Date();
    const dayOfWeek = now.getDay();
    const toMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() + toMonday);
    const startStr = formatDateLocal(startOfWeek);
    const todayStr = getTodayLocal();

    const weightInWeek = weightEntries.filter(e => e.date >= startStr && e.date <= todayStr);
    const sortedWeights = sortWeightByDateAsc(weightEntries);
    const beforeWeek = sortedWeights.filter(e => e.date < startStr);
    const firstWeightOfWeek = weightInWeek.length ? parseFloat(sortWeightByDateAsc(weightInWeek)[0].weight) : (beforeWeek.length ? parseFloat(beforeWeek[beforeWeek.length - 1].weight) : null);
    const lastWeightOfWeek = weightInWeek.length ? parseFloat(sortWeightByDateDesc(weightInWeek)[0].weight) : (sortedWeights.length ? parseFloat(sortedWeights[sortedWeights.length - 1].weight) : null);
    const weightChange = (firstWeightOfWeek != null && lastWeightOfWeek != null) ? firstWeightOfWeek - lastWeightOfWeek : null;
    const weightStr = weightChange != null ? (weightChange > 0 ? `−${weightChange.toFixed(1)}` : weightChange < 0 ? `+${Math.abs(weightChange).toFixed(1)}` : '0') + ' lb' : '—';

    const injectionsInWeek = injectionEntries.filter(e => e.date >= startStr && e.date <= todayStr);
    let expectedInjections = 0;
    schedules.filter((schedule) => !schedule.paused).forEach(s => {
      if (s.scheduleType === 'specific_days' && s.specificDays?.length) expectedInjections += s.specificDays.length;
      else if (s.frequencyDays) expectedInjections += Math.min(7, Math.ceil(7 / s.frequencyDays));
    });
    if (expectedInjections === 0 && injectionEntries.length > 0) {
      const meds = [...new Set(injectionEntries.map(i => i.type))];
      meds.forEach(() => { expectedInjections += 1; });
    }
    const injStr = `${injectionsInWeek.length}/${expectedInjections || '?'}`;

    const weekDates = [];
    const d = new Date(startOfWeek);
    while (d <= now) {
      weekDates.push(formatDateLocal(new Date(d)));
      d.setDate(d.getDate() + 1);
    }
    const hydratedDays = weekDates.filter(date => dailyTrackEntries.some(e => e.date === date)).length;
    const hydrationStr = `${hydratedDays}/7 days`;

    const glucoseInWeek = glucoseEntries.filter(e => e.date >= startStr && e.date <= todayStr);
    const avgGlucose = glucoseInWeek.length ? (glucoseInWeek.reduce((s, e) => s + parseFloat(e.value), 0) / glucoseInWeek.length).toFixed(0) : null;
    const lastGlucose = glucoseEntries.length ? sortByDateDesc(glucoseEntries)[0] : null;

    const lastA1c = a1cEntries.length ? sortByDateDesc(a1cEntries)[0] : null;

    const journalInWeek = journalEntries.filter(e => e.date >= startStr && e.date <= todayStr).length;
    const labsInWeek = labEntries.filter(e => e.date >= startStr && e.date <= todayStr).length;
    const sleepInWeek = sleepEntries.filter(e => e.date >= startStr && e.date <= todayStr);
    const avgSleepHours = sleepInWeek.length
      ? Math.round((sleepInWeek.reduce((s, e) => s + (Number(e.hours) || 0), 0) / sleepInWeek.length) * 10) / 10
      : null;
    let stepsSum = 0;
    let stepsDays = 0;
    weekDates.forEach((date) => {
      const row = dailyTrackEntries.find(e => e.date === date);
      if (row?.steps != null && Number(row.steps) > 0) {
        stepsSum += Number(row.steps);
        stepsDays += 1;
      }
    });
    const injWithFx = injectionsInWeek.filter((e) => (e.sideEffects || []).length > 0).length;

    return {
      weightStr,
      injStr,
      hydrationStr,
      avgGlucose,
      lastGlucose,
      lastA1c,
      journalInWeek,
      labsInWeek,
      avgSleepHours,
      sleepNights: sleepInWeek.length,
      stepsSum,
      stepsDays,
      injWithFx,
    };
  };

  const calculateBMI = (weightLbs, heightInches) => heightInches ? ((weightLbs / (heightInches * heightInches)) * 703).toFixed(1) : null;
  const getBMICategory = (bmi) => {
    if (!bmi) return { label: '-', color: 'text-gray-400' };
    if (bmi < 18.5) return { label: 'Underweight', color: 'text-blue-400' };
    if (bmi < 25) return { label: 'Normal', color: 'text-green-500' };
    if (bmi < 30) return { label: 'Overweight', color: 'text-yellow-400' };
    return { label: 'Obese', color: 'text-red-400' };
  };

  const getWeightStats = () => {
    const filtered = getFilteredData(weightEntries);
    if (filtered.length === 0) return { current: '-', change: 0, trend: 'neutral', bmi: null, percentChange: 0, weeklyAvg: 0, toGoal: 0, estimatedGoalDate: null };
    const sorted = sortWeightByDateDesc(filtered); // most recent first (by date then id)
    const sortedAsc = sortWeightByDateAsc(filtered);
    const current = sorted[0].weight;
    const first = sortedAsc[0].weight; // oldest in range
    const change = current - first;
    const percentChange = (change / first) * 100;
    const bmi = calculateBMI(current, userProfile.height);
    const toGoal = current - (userProfile.goalWeight || 200);
    
    const firstDate = parseLocalDate(toCalendarDay(sortedAsc[0].date));
    const lastDate = parseLocalDate(toCalendarDay(sorted[0].date));
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

  const isWeightOutlier = (entry) => {
    const sorted = sortWeightByDateAsc(weightEntries);
    const index = sorted.findIndex((item) => item.id === entry.id);
    if (index <= 0) return false;
    const current = Number(entry.weight);
    const previous = Number(sorted[index - 1].weight);
    return Number.isFinite(current) && Number.isFinite(previous) && Math.abs(current - previous) >= 5;
  };

  // "On track?" — compare user's weekly loss to typical GLP-1 loss for their medication and dose (from trials)
  const getOnTrackInfo = () => {
    const filtered = getFilteredData(weightEntries);
    if (filtered.length < 2) return null;
    // Use most recent GLP-1–type injection (user may also log hormones etc.; "On track?" is for GLP-1)
    const medName = (e) => e.type ?? e.medication;
    const lastGlp1Injection = [...injectionEntries]
      .filter(e => {
        const med = MEDICATIONS.find(m => m.name === medName(e));
        return med && ['GLP-1', 'GLP-1/GIP', 'Triple Agonist'].includes(med.category);
      })
      .sort((a, b) => parseLocalDate(b.date) - parseLocalDate(a.date))[0];
    if (!lastGlp1Injection) return null;
    const lastInjection = lastGlp1Injection;
    const med = MEDICATIONS.find(m => m.name === medName(lastInjection));
    if (!med) return null;
    const injectionMed = medName(lastInjection);
    // Weekly dose (mg per 7 days): sum of this med's injections in the last 7 days
    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const injectionsLast7Days = injectionEntries.filter(e => medName(e) === injectionMed && parseLocalDate(e.date) >= sevenDaysAgo);
    const weeklyDoseMg = injectionsLast7Days.length > 0
      ? injectionsLast7Days.reduce((sum, inj) => sum + toDoseMgForLevel(inj), 0)
      : toDoseMgForLevel(lastInjection);
    const typical = getTypicalWeeklyLossForDose(injectionMed, weeklyDoseMg);
    const userLoss = -parseFloat(stats.weeklyAvg); // positive = lbs lost per week
    const doseLabel = injectionsLast7Days.length > 1 ? `${weeklyDoseMg} mg/week` : `${lastInjection.dose}${lastInjection.unit}`;

    // Time on current medication (calendar days since first injection of this med)
    const firstMedInjection = [...injectionEntries]
      .filter(e => medName(e) === injectionMed)
      .sort((a, b) => parseLocalDate(a.date) - parseLocalDate(b.date))[0];
    const daysOnMed = firstMedInjection
      ? Math.max(1, Math.round((now - parseLocalDate(firstMedInjection.date)) / (1000 * 60 * 60 * 24)))
      : null;

    if (userLoss <= 0) {
      return { med: injectionMed, dose: doseLabel, typical, userLoss: 0, status: 'slower', daysOnMed };
    }
    const ratio = userLoss / typical;
    let status = 'on_track';
    if (ratio >= 1.2) status = 'ahead';
    else if (ratio < 0.7) status = 'slower';
    return { med: injectionMed, dose: doseLabel, typical, userLoss, status, daysOnMed };
  };

  // Chart data: your cumulative weight loss vs typical — week 1 through current week + 1
  const getYouVsTypicalChartData = () => {
    const onTrack = getOnTrackInfo();
    if (!onTrack) return [];
    const filtered = getFilteredData(weightEntries);
    const sorted = sortWeightByDateAsc(filtered);
    if (sorted.length < 2) return [];
    const startDate = parseLocalDate(toCalendarDay(sorted[0].date));
    const startWeight = parseFloat(sorted[0].weight);
    const msPerWeek = 7 * 24 * 60 * 60 * 1000;
    const now = new Date();
    const currentWeekIndex = Math.floor((now - startDate) / msPerWeek);
    const endWeek = Math.max(1, currentWeekIndex + 1);
    const points = [];
    for (let w = 1; w <= endWeek; w++) {
      const weekEnd = new Date(startDate);
      weekEnd.setDate(weekEnd.getDate() + w * 7);
      const weekLabel = `W${w}`;
      const typicalLoss = onTrack.typical * w;
      const weightsUpToWeekEnd = sorted.filter(e => parseLocalDate(toCalendarDay(e.date)) <= weekEnd);
      const latestInWindow = weightsUpToWeekEnd.length ? weightsUpToWeekEnd[weightsUpToWeekEnd.length - 1] : null;
      const userLoss = latestInWindow ? Math.max(0, startWeight - parseFloat(latestInWindow.weight)) : null;
      if (userLoss !== null) {
        points.push({ weekLabel, weeks: w, userLoss, typicalLoss });
      }
    }
    return points.length > 1 ? points : [];
  };

  // Progress targets used only by the compact "At this pace" forecast.
  const getPaceTargets = () => {
    const sorted = sortWeightByDateAsc(weightEntries);
    if (sorted.length === 0) return [];
    const startWeight = parseFloat(sorted[0].weight);
    const currentWeight = parseFloat(stats.current);
    if (stats.current === '-' || isNaN(currentWeight)) return [];
    const goalWeight = userProfile?.goalWeight ? parseFloat(userProfile.goalWeight) : startWeight - 30;
    const totalToLose = startWeight - goalWeight;
    if (totalToLose <= 0) return [];
    const list = [];
    for (let lb = 5; lb <= Math.ceil(totalToLose / 5) * 5; lb += 5) {
      const achieved = (startWeight - currentWeight) >= lb;
      const toGo = achieved ? 0 : lb - (startWeight - currentWeight);
      list.push({ label: `${lb} lb down`, achieved, toGo });
    }
    return list;
  };

  const getNextInjections = (scheduleList = schedules) => {
    const upcoming = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayStr = formatDateLocal(today);
    const msPerDay = 24 * 60 * 60 * 1000;

    scheduleList.filter((item) => !item.paused).forEach(schedule => {
      const medicationInjections = injectionEntries
        .filter(e => e.type === schedule.medication)
        .sort((a, b) => parseLocalDate(b.date) - parseLocalDate(a.date));
      const lastInjection = medicationInjections[0];
      let nextDate;

      if (schedule.scheduleType === 'specific_days' && schedule.specificDays?.length > 0) {
        // Next injection = next calendar day that is one of the scheduled weekdays
        const specificDays = schedule.specificDays;
        let start = new Date(today);
        start.setHours(0, 0, 0, 0);
        if (lastInjection) {
          const lastDayStr = toCalendarDay(lastInjection.date);
          const lastDayOfWeek = parseLocalDate(lastDayStr).getDay();
          if (lastDayStr === todayStr && specificDays.includes(lastDayOfWeek)) {
            start.setDate(start.getDate() + 1);
          }
        }
        for (let i = 0; i < 8; i++) {
          const d = new Date(start);
          d.setDate(start.getDate() + i);
          d.setHours(0, 0, 0, 0);
          if (specificDays.includes(d.getDay())) {
            nextDate = d;
            break;
          }
        }
        if (!nextDate) {
          nextDate = new Date(today);
          nextDate.setDate(today.getDate() + 7);
        }
      } else {
        if (lastInjection) {
          nextDate = parseLocalDate(lastInjection.date);
          nextDate.setDate(nextDate.getDate() + (schedule.frequencyDays ?? 7));
        } else {
          nextDate = new Date(today);
        }
        nextDate.setHours(0, 0, 0, 0);
      }

      const daysUntil = Math.round((nextDate - today) / msPerDay);

      upcoming.push({
        medication: schedule.medication,
        dose: schedule.dose,
        unit: schedule.unit || 'mg',
        preferredTime: schedule.preferredTime || notificationSettings.reminderTime || '09:00',
        reminderEnabled: schedule.reminderEnabled !== false,
        reminderMinutesBefore: Math.max(0, Number(schedule.reminderMinutesBefore) || 0),
        nextDate,
        daysUntil,
        isOverdue: daysUntil < 0,
        isDueToday: daysUntil === 0
      });
    });

    return upcoming.sort((a, b) => a.daysUntil - b.daysUntil);
  };

  // Logging streak: days with weight logged in last 7, and consecutive weeks with at least one entry
  const getLoggingStreak = () => {
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    const dayStrs = new Set();
    for (let i = 0; i < 7; i++) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      dayStrs.add(formatDateLocal(d));
    }
    const entriesInLast7 = weightEntries.filter(e => dayStrs.has(toCalendarDay(e.date)));
    const uniqueDays = new Set(entriesInLast7.map(e => toCalendarDay(e.date)));
    const weekKey = (dateStr) => {
      const d = parseLocalDate(dateStr);
      const start = new Date(d);
      start.setDate(start.getDate() - start.getDay());
      return formatDateLocal(start);
    };
    const byWeek = {};
    weightEntries.forEach(e => {
      const w = weekKey(toCalendarDay(e.date));
      if (!byWeek[w]) byWeek[w] = true;
    });
    let weeksInRow = 0;
    for (let i = 0; i < 52; i++) {
      const d = new Date(now);
      d.setDate(d.getDate() - i * 7);
      const w = weekKey(formatDateLocal(d));
      if (byWeek[w]) weeksInRow++; else break;
    }
    return { daysLoggedLast7: uniqueDays.size, weeksInRow };
  };

  // Most-mentioned side effects from injection logs (for Insights/Summary)
  const getSideEffectsSummary = () => {
    const counts = {};
    injectionEntries.forEach(entry => {
      (entry.sideEffects || []).forEach(se => {
        counts[se] = (counts[se] || 0) + 1;
      });
    });
    const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]);
    return sorted.slice(0, 5).map(([name]) => name);
  };

  // Side effects by day in cycle (we only log on injection day = day 0)
  const getSideEffectsByDayInCycle = (medicationName) => {
    const entries = injectionEntries.filter(e => e.type === medicationName && (e.sideEffects?.length ?? 0) > 0);
    const day0 = {};
    entries.forEach(entry => {
      (entry.sideEffects || []).forEach(se => {
        day0[se] = (day0[se] || 0) + 1;
      });
    });
    return { day0 };
  };

  // Typical dose in mg for a medication (from most recent injection)
  const getTypicalDoseMg = (medicationName) => {
    const last = injectionEntries.filter(e => e.type === medicationName).sort((a, b) => parseLocalDate(b.date) - parseLocalDate(a.date))[0];
    if (!last) return null;
    return toDoseMgForLevel(last);
  };

  const getLowVials = () => {
    if (!vials.length) return [];
    return vials.filter(v => {
      const rem = v.remainingMg ?? v.totalMg;
      if (rem <= 0) return false;
      const typical = getTypicalDoseMg(v.medication);
      return typical != null && rem < typical;
    });
  };

  // When returning to Summary tab, show low-vial popup if any vials are low (so the user notices)
  useEffect(() => {
    if (activeTab !== 'summary') {
      previousActiveTabRef.current = activeTab;
      return;
    }
    const wasAway = previousActiveTabRef.current != null && previousActiveTabRef.current !== 'summary';
    previousActiveTabRef.current = activeTab;
    if (wasAway && getLowVials().length > 0) setShowLowVialPopup(true);
  }, [activeTab, vials]);

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

  const getSummaryChartData = (maxWeeks = 0) => {
    const filteredWeights = getFilteredData(weightEntries);
    const filteredInjections = getFilteredData(injectionEntries);
    // Use only dates that have a weight entry so the line is accurate (no null interpolation)
    const weightDates = new Set();
    filteredWeights.forEach(e => {
      const day = toCalendarDay(e.date);
      if (day) weightDates.add(day);
    });
    let sortedDates = Array.from(weightDates).sort((a, b) => parseLocalDate(a) - parseLocalDate(b));
    if (maxWeeks > 0 && sortedDates.length > 0) {
      const lastDay = parseLocalDate(sortedDates[sortedDates.length - 1]);
      const cutoff = new Date(lastDay);
      cutoff.setDate(cutoff.getDate() - maxWeeks * 7);
      cutoff.setHours(0, 0, 0, 0);
      sortedDates = sortedDates.filter(d => parseLocalDate(d) >= cutoff);
    }
    const points = sortedDates.map(date => {
      const dayWeights = filteredWeights.filter(e => toCalendarDay(e.date) === date);
      const weightEntry = dayWeights.length === 0 ? null : dayWeights.sort((a, b) => (b.id || 0) - (a.id || 0))[0];
      const dayInjections = filteredInjections.filter(e => toCalendarDay(e.date) === date);
      const doseData = {};
      const unitData = {};
      dayInjections.forEach(inj => {
        const doseInMg = toDoseMgForLevel(inj);
        doseData[inj.type] = doseInMg;
        unitData[inj.type] = inj.unit;
      });
      const injectionsForTooltip = dayInjections.map(inj => ({ type: inj.type, dose: inj.dose, unit: inj.unit, route: inj.route, site: inj.site }));
      return { date: parseLocalDate(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }), fullDate: date, weight: weightEntry?.weight != null ? parseFloat(weightEntry.weight) : null, units: unitData, hasInjection: dayInjections.length > 0, injections: injectionsForTooltip, ...doseData };
    });
    // 7-day moving average trend line (use parseLocalDate so timezone matches weight dates)
    points.forEach(p => {
      const pointDate = parseLocalDate(p.fullDate);
      const windowStart = new Date(pointDate);
      windowStart.setDate(windowStart.getDate() - 6);
      const inWindow = filteredWeights.filter(e => {
        const day = toCalendarDay(e.date);
        if (!day) return false;
        const d = parseLocalDate(day);
        return d >= windowStart && d <= pointDate;
      });
      p.weightTrend = inWindow.length ? inWindow.reduce((s, e) => s + parseFloat(e.weight), 0) / inWindow.length : null;
    });
    return points;
  };

  const getLoggedMedications = () => {
    const filteredInjections = getFilteredData(injectionEntries);
    return Array.from(new Set(filteredInjections.map(e => e.type)));
  };

  const getMeasurementStats = () => {
    const stats = {};
    MEASUREMENT_TYPES.forEach(type => {
      const typeEntries = measurementEntries.filter(e => e.type === type).sort((a, b) => parseLocalDate(b.date) - parseLocalDate(a.date));
      if (typeEntries.length > 0) {
        const current = typeEntries[0].value;
        const first = typeEntries[typeEntries.length - 1].value;
        stats[type] = { current, change: (current - first).toFixed(1), entries: typeEntries.length };
      }
    });
    return stats;
  };

  const getMeasurementChartData = () => {
    const dates = [...new Set(measurementEntries.map(e => toCalendarDay(e.date)).filter(Boolean))].sort(
      (a, b) => parseLocalDate(a) - parseLocalDate(b)
    );
    return dates.map(date => {
      const dataPoint = { date: parseLocalDate(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) };
      MEASUREMENT_TYPES.forEach(type => {
        const entry = measurementEntries.find(e => toCalendarDay(e.date) === date && e.type === type);
        if (entry) dataPoint[type] = parseFloat(entry.value);
      });
      return dataPoint;
    });
  };

  // Stack timeline: which meds are active by month (from schedules with startDate)
  const getStackTimelineMonths = () => {
    const withStart = schedules.filter(s => s.startDate);
    if (withStart.length === 0) return [];
    const startDates = withStart.map(s => s.startDate);
    const minDate = startDates.sort()[0];
    const start = parseLocalDate(minDate);
    const end = new Date();
    end.setMonth(end.getMonth() + 3); // show 3 months ahead
    const months = [];
    const cursor = new Date(start.getFullYear(), start.getMonth(), 1);
    while (cursor <= end) {
      const monthEnd = new Date(cursor.getFullYear(), cursor.getMonth() + 1, 0);
      const monthEndStr = formatDateLocal(monthEnd);
      const active = withStart.filter(s => s.startDate <= monthEndStr).map(s => s.medication);
      const prevActive = cursor.getMonth() === 0
        ? withStart.filter(s => s.startDate <= formatDateLocal(new Date(cursor.getFullYear() - 1, 11, 31))).map(s => s.medication)
        : withStart.filter(s => s.startDate <= formatDateLocal(new Date(cursor.getFullYear(), cursor.getMonth() - 1, 31))).map(s => s.medication);
      const added = active.filter(m => !prevActive.includes(m));
      months.push({
        label: cursor.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
        active,
        added
      });
      cursor.setMonth(cursor.getMonth() + 1);
    }
    return months;
  };

  // Injection site heatmap: count by site (last 30 days), color green/yellow/red
  const getInjectionSiteCounts = () => {
    const now = new Date();
    const cutoff = new Date(now);
    cutoff.setDate(cutoff.getDate() - 30);
    const cutoffStr = formatDateLocal(cutoff);
    const recent = injectionEntries.filter(e => e.date >= cutoffStr);
    const bySite = {};
    recent.forEach(e => {
      const site = e.site || 'Other';
      bySite[site] = (bySite[site] || 0) + 1;
    });
    const allSites = [...BODY_LOCATIONS];
    Object.keys(bySite).filter(s => !allSites.includes(s)).forEach(s => allSites.push(s));
    return allSites.map(site => {
      const count = bySite[site] || 0;
      const status = count <= 2 ? 'green' : count <= 5 ? 'yellow' : 'red';
      return { site, count, status };
    }).filter(x => x.count > 0).sort((a, b) => b.count - a.count);
  };

  // All body locations with count and status for body map (0 = green/safe)
  const getInjectionSiteCountsForMap = () => {
    const now = new Date();
    const cutoff = new Date(now);
    cutoff.setDate(cutoff.getDate() - 30);
    const cutoffStr = formatDateLocal(cutoff);
    const recent = injectionEntries.filter(e => e.date >= cutoffStr);
    const bySite = {};
    recent.forEach(e => {
      const site = e.site || 'Other';
      bySite[site] = (bySite[site] || 0) + 1;
    });
    return BODY_LOCATIONS.map(site => {
      const count = bySite[site] || 0;
      const status = count <= 2 ? 'green' : count <= 5 ? 'yellow' : 'red';
      return { site, count, status };
    });
  };

  // Side-effect intelligence: correlate side effects with days since injection, suggest tips
  const getSideEffectPatterns = () => {
    const withEffects = injectionEntries.filter(e => e.sideEffects && e.sideEffects.length > 0).sort((a, b) => a.date.localeCompare(b.date));
    if (withEffects.length < 2) return null;
    const byMed = {};
    withEffects.forEach(inj => {
      if (!byMed[inj.type]) byMed[inj.type] = [];
      byMed[inj.type].push(inj);
    });
    const patterns = [];
    Object.entries(byMed).forEach(([med, entries]) => {
      entries.forEach((entry, i) => {
        const entryDate = parseLocalDate(entry.date);
        (entry.sideEffects || []).forEach(se => {
          let daysSince = null;
          if (i > 0) {
            const prev = parseLocalDate(entries[i - 1].date);
            daysSince = Math.round((entryDate - prev) / (24 * 60 * 60 * 1000));
          }
          patterns.push({ med, sideEffect: se, date: entry.date, daysSince });
        });
      });
    });
    const byEffect = {};
    patterns.forEach(p => {
      const key = `${p.med}|${p.sideEffect}`;
      if (!byEffect[key]) byEffect[key] = { med: p.med, sideEffect: p.sideEffect, days: [] };
      if (p.daysSince != null) byEffect[key].days.push(p.daysSince);
    });
    const insights = Object.values(byEffect)
      .filter(x => x.days.length >= 2)
      .map(x => {
        const avg = x.days.reduce((a, b) => a + b, 0) / x.days.length;
        const in24_48 = x.days.filter(d => d >= 1 && d <= 2).length / x.days.length;
        let suggestion = null;
        if (in24_48 >= 0.5) suggestion = 'Try evening injections so peak falls during sleep, or split dose (half twice per week). Increase electrolytes and small meals.';
        else if (avg <= 0.5) suggestion = 'Effect often same day — consider timing (e.g. evening) or smaller dose.';
        return { ...x, avgDays: Math.round(avg * 10) / 10, in24_48, suggestion };
      })
      .filter(x => x.suggestion);
    return insights.length ? insights : null;
  };

  const getCalendarDays = () => {
    const year = calendarMonth.getFullYear();
    const month = calendarMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - startDate.getDay());
    const days = [];
    for (let i = 0; i < 42; i++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);
      const dateStr = formatDateLocal(date);
      const injections = injectionEntries.filter(inj => inj.date === dateStr);
      const scheduled = schedules.flatMap((schedule) => {
        const protocolStart = parseLocalDate(schedule.startDate || dateStr);
        const dayStart = parseLocalDate(dateStr);
        if (!protocolStart || !dayStart || dayStart < protocolStart) return [];
        const dayDifference = Math.round((dayStart - protocolStart) / 86400000);
        const isDue = schedule.scheduleType === 'specific_days' && Array.isArray(schedule.specificDays)
          ? schedule.specificDays.includes(date.getDay())
          : dayDifference % Math.max(1, Number(schedule.frequencyDays) || 7) === 0;
        if (!isDue) return [];
        const taken = injections.find((entry) => entry.type === schedule.medication);
        const status = taken ? 'taken' : schedule.paused ? 'paused' : dateStr < getTodayLocal() ? 'missed' : 'scheduled';
        return [{ medication: schedule.medication, dose: schedule.dose, unit: schedule.unit, status, taken }];
      });
      const isCurrentMonth = date.getMonth() === month;
      days.push({ date, dateStr, injections, scheduled, isCurrentMonth, isToday: dateStr === getTodayLocal() });
    }
    return days;
  };

  const calculateReconstitution = () => {
    const vialMg = reconPeptideUnit === 'mg' ? parseFloat(reconPeptideAmount) : parseFloat(reconPeptideAmount) / 1000;
    if (!reconPeptideAmount || isNaN(vialMg) || vialMg <= 0) return;

    if (reconMode === 'vial_bac') {
      // Vial + Bac water → concentration and dose (volume per desired dose)
      const bacMl = parseFloat(reconWaterAmount);
      if (!reconWaterAmount || isNaN(bacMl) || bacMl <= 0) return;
      const concentrationMgPerMl = vialMg / bacMl;
      const concentrationMcgPerMl = concentrationMgPerMl * 1000;
      let mlPerDose = null;
      let unitsPerDose = null;
      if (reconDesiredDose) {
        const desiredMg = reconDesiredUnit === 'mg' ? parseFloat(reconDesiredDose) : parseFloat(reconDesiredDose) / 1000;
        if (!isNaN(desiredMg) && desiredMg > 0) {
          mlPerDose = desiredMg / concentrationMgPerMl;
          unitsPerDose = mlPerDose * 100;
        }
      }
      setReconResult({
        mode: 'vial_bac',
        concentration: concentrationMgPerMl.toFixed(2),
        concentrationMcg: concentrationMcgPerMl.toFixed(0),
        bacMl,
        mlPerDose: mlPerDose != null ? mlPerDose.toFixed(3) : null,
        unitsPerDose: unitsPerDose != null ? unitsPerDose.toFixed(1) : null,
        desiredDose: reconDesiredDose ? `${reconDesiredDose} ${reconDesiredUnit}` : null
      });
      return;
    }

    // Vial + Desired dose → bac water needed (so that volumePerDose ml = desired dose)
    const desiredMg = reconDesiredUnit === 'mg' ? parseFloat(reconDesiredDose) : parseFloat(reconDesiredDose) / 1000;
    const volumePerDoseMl = parseFloat(reconVolumePerDose) || 0.5;
    if (!reconDesiredDose || isNaN(desiredMg) || desiredMg <= 0 || volumePerDoseMl <= 0) return;
    // desiredMg per volumePerDoseMl → concentration = desiredMg / volumePerDoseMl; vialMg = concentration * bacMl → bacMl = vialMg / concentration = vialMg * volumePerDoseMl / desiredMg
    const bacMl = (vialMg * volumePerDoseMl) / desiredMg;
    const concentrationMgPerMl = vialMg / bacMl;
    setReconResult({
      mode: 'vial_dose',
      bacMl: bacMl.toFixed(2),
      concentration: concentrationMgPerMl.toFixed(2),
      mlPerDose: volumePerDoseMl.toFixed(2),
      unitsPerDose: (volumePerDoseMl * 100).toFixed(1)
    });
  };

  // Calorie / TDEE calculator (Mifflin-St Jeor BMR, then activity multiplier)
  const ACTIVITY_MULT = { sedentary: 1.2, light: 1.375, moderate: 1.55, active: 1.725, very: 1.9 };
  const calculateTDEE = () => {
    const age = parseInt(tdeeAge, 10);
    const weightKg = parseFloat(tdeeWeightLbs) / 2.205;
    const heightCm = parseFloat(tdeeHeightIn) * 2.54;
    if (!age || !tdeeWeightLbs || !tdeeHeightIn || weightKg <= 0 || heightCm <= 0) return;
    const bmr = (10 * weightKg) + (6.25 * heightCm) - (5 * age) + (tdeeGender === 'male' ? 5 : -161);
    const tdee = Math.round(bmr * (ACTIVITY_MULT[tdeeActivity] || 1.55));
    setTdeeResult({ bmr: Math.round(bmr), tdee });
  };

  // Daily track: hydration & protein derived from meals; optional extra water
  const todayStr = getTodayLocal();
  const todayDaily = dailyTrackEntries.find(e => e.date === todayStr);
  const todayMeals = todayDaily?.meals ?? [];
  const proteinFromMeals = todayMeals.reduce((s, m) => s + (m.protein ?? 0), 0);
  const hydrationFromMeals = todayMeals.reduce((s, m) => s + (m.hydrationOz ?? 0), 0);
  const proteinToday = todayMeals.length > 0 ? proteinFromMeals : (todayDaily?.proteinG ?? 0);
  const hydrationToday = hydrationFromMeals + (todayDaily?.extraHydrationOz ?? (todayMeals.length > 0 ? 0 : todayDaily?.hydrationOz ?? 0));

  const saveExtraHydration = () => {
    const oz = extraHydrationOz !== '' ? parseFloat(extraHydrationOz) : 0;
    if (isNaN(oz) || oz < 0) return;
    const existing = dailyTrackEntries.find(e => e.date === todayStr);
    const updated = existing
      ? dailyTrackEntries.map(e => e.date === todayStr ? { ...e, extraHydrationOz: oz } : e)
      : [...dailyTrackEntries, { id: Date.now(), date: todayStr, hydrationOz: 0, proteinG: 0, meals: [], extraHydrationOz: oz }];
    updated.sort((a, b) => b.date.localeCompare(a.date));
    setDailyTrackEntries(updated);
    saveData('health-daily-track', updated);
    setExtraHydrationOz('');
  };

  const addQuickWater = (oz) => {
    const existing = dailyTrackEntries.find(e => e.date === todayStr);
    const currentExtra = existing?.extraHydrationOz ?? (existing && todayMeals.length === 0 ? (existing.hydrationOz ?? 0) : 0) ?? 0;
    const newExtra = currentExtra + oz;
    const updated = existing
      ? dailyTrackEntries.map(e => e.date === todayStr ? { ...e, extraHydrationOz: newExtra } : e)
      : [...dailyTrackEntries, { id: Date.now(), date: todayStr, hydrationOz: 0, proteinG: 0, meals: [], extraHydrationOz: newExtra }];
    updated.sort((a, b) => b.date.localeCompare(a.date));
    setDailyTrackEntries(updated);
    saveData('health-daily-track', updated);
  };

  const addNutritionEntry = () => {
    const calories = nutritionCalories !== '' ? parseFloat(nutritionCalories) : 0;
    if (isNaN(calories) || calories < 0) return;
    const protein = nutritionProtein !== '' ? parseFloat(nutritionProtein) : 0;
    const carbs = nutritionCarbs !== '' ? parseFloat(nutritionCarbs) : 0;
    const fat = nutritionFat !== '' ? parseFloat(nutritionFat) : 0;
    const hydrationOz = nutritionHydrationOz !== '' ? parseFloat(nutritionHydrationOz) : 0;
    const meal = {
      id: Date.now(),
      label: nutritionLabel.trim() || 'Meal',
      calories,
      protein: isNaN(protein) ? 0 : protein,
      carbs: isNaN(carbs) ? 0 : carbs,
      fat: isNaN(fat) ? 0 : fat,
      hydrationOz: isNaN(hydrationOz) ? 0 : Math.max(0, hydrationOz)
    };
    const existing = dailyTrackEntries.find(e => e.date === todayStr);
    const meals = [...(existing?.meals ?? []), meal];
    const updated = existing
      ? dailyTrackEntries.map(e => e.date === todayStr ? { ...e, meals } : e)
      : [...dailyTrackEntries, { id: Date.now(), date: todayStr, hydrationOz: 0, proteinG: 0, meals }];
    updated.sort((a, b) => b.date.localeCompare(a.date));
    setDailyTrackEntries(updated);
    saveData('health-daily-track', updated);
    setNutritionLabel('');
    setNutritionCalories('');
    setNutritionProtein('');
    setNutritionCarbs('');
    setNutritionFat('');
    setNutritionHydrationOz('');
    setMealDescription('');
  };

  const applyMealEstimate = () => {
    const est = estimateMealFromDescription(mealDescription);
    if (!est) return;
    setNutritionLabel(est.label);
    setNutritionCalories(String(est.calories));
    setNutritionProtein(String(est.protein));
    setNutritionCarbs(String(est.carbs));
    setNutritionFat(String(est.fat));
    setNutritionHydrationOz(est.hydrationOz ? String(est.hydrationOz) : '');
  };

  const deleteNutritionEntry = (mealId) => {
    const existing = dailyTrackEntries.find(e => e.date === todayStr);
    if (!existing?.meals?.length) return;
    const meals = existing.meals.filter(m => m.id !== mealId);
    const updated = dailyTrackEntries.map(e => e.date === todayStr ? { ...e, meals } : e);
    setDailyTrackEntries(updated);
    saveData('health-daily-track', updated);
  };

  // Suggest next injection site for rotation (based on last injection site for this med)
  const getSuggestedInjectionSite = (medicationName) => {
    const recent = injectionEntries
      .filter(e => e.type === medicationName)
      .sort((a, b) => parseLocalDate(b.date) - parseLocalDate(a.date))
      .slice(0, 10);
    if (recent.length === 0) return BODY_LOCATIONS[0];
    const lastSite = recent[0].site || 'Stomach';
    const idx = BODY_LOCATIONS.indexOf(lastSite);
    const nextIdx = idx >= 0 ? (idx + 1) % BODY_LOCATIONS.length : 0;
    return BODY_LOCATIONS[nextIdx];
  };

  const filteredGoalCategories = useMemo(() => {
    const q = goalGuideSearch.trim().toLowerCase();
    if (!q) return GOAL_CATEGORIES;
    return GOAL_CATEGORIES.filter((cat) => {
      if (cat.title.toLowerCase().includes(q) || cat.description.toLowerCase().includes(q)) return true;
      if (cat.clinicianTips?.some((t) => t.toLowerCase().includes(q))) return true;
      return cat.items.some(
        (i) =>
          i.medicationName.toLowerCase().includes(q) ||
          i.explain.toLowerCase().includes(q) ||
          (i.stacksWellWith || []).some(
            (s) => s.medicationName.toLowerCase().includes(q) || s.why.toLowerCase().includes(q)
          )
      );
    });
  }, [goalGuideSearch]);

  const stackSuggestionList = useMemo(() => getStackSuggestions(goalUserStack), [goalUserStack]);

  const userHasLoggedMedication = (name) => injectionEntries.some((e) => e.type === name);

  const persistGoalUserStack = (next) => {
    setGoalUserStack(next);
    saveData('health-goals-user-stack', next);
  };
  const addToGoalUserStack = (medicationName) => {
    if (!medicationName || goalUserStack.includes(medicationName)) return;
    persistGoalUserStack([...goalUserStack, medicationName]);
  };
  const removeFromGoalUserStack = (medicationName) => {
    persistGoalUserStack(goalUserStack.filter((x) => x !== medicationName));
  };

  const goalStackMedColor = (name) => MEDICATIONS.find((m) => m.name === name)?.color || '#94a3b8';

  const handleGoalTrackAction = (action) => {
    setActiveTab(action.tab);
    if (action.moreSection) setActiveMoreSection(action.moreSection);
    setShowAddForm(!!action.openInjectionForm);
  };

  // Convert injection dose to mg-equivalent for pharmacokinetic weighting (same units = comparable)
  const toDoseMg = (inj) => {
    let dose = parseFloat(inj.dose);
    if (isNaN(dose)) return 0;
    if (inj.unit === 'mcg') return dose / 1000;
    if (inj.unit === 'ml') return dose; // generic: no vial context
    if (inj.unit === 'units') {
      if (inj.type === 'Retatrutide') return dose / RETATRUTIDE_UNITS_PER_MG;
      return dose / 100;
    }
    if (inj.unit === 'IU') return dose / 1000;
    return dose; // mg
  };

  // mg/ml from vial record (stored concentration, or totalMg ÷ bac water when reconstituted)
  const getVialConcentrationMgPerMl = (v) => {
    if (!v) return 0;
    const c = parseFloat(v.concentration);
    if (!isNaN(c) && c > 0) return c;
    const bac = parseFloat(v.bacWaterMl);
    const total = parseFloat(v.totalMg);
    if (!isNaN(bac) && bac > 0 && !isNaN(total) && total > 0) return total / bac;
    return 0;
  };

  const formatSyringeDoseNumber = (value) => {
    const number = Number(value);
    if (!Number.isFinite(number)) return '';
    if (number >= 10) return number.toFixed(1).replace(/\.0$/, '');
    if (number >= 1) return number.toFixed(2).replace(/0$/, '').replace(/\.$/, '');
    return number.toFixed(3).replace(/0+$/, '').replace(/\.$/, '');
  };

  // Dose profiles are the source of truth for presentation. A saved vial is only
  // a fallback, so this never supplies a concentration that the user has not saved.
  const getKnownSyringeConcentration = (medication, protocolConcentration, vialId) => {
    const key = String(medication || '').trim().toLowerCase();
    if (!key) return 0;
    const protocolValue = getVialConcentrationMgPerMl(protocolConcentration);
    if (protocolValue > 0) return protocolValue;
    // Read the persisted profile as a defensive fallback for a profile written by
    // an older form enhancer before it could emit the React refresh event.
    let storedProfiles = doseConcentrations;
    try {
      const saved = JSON.parse(localStorage.getItem('health-dose-concentrations') || '{}');
      if (saved && typeof saved === 'object' && !Array.isArray(saved)) storedProfiles = { ...saved, ...doseConcentrations };
    } catch { /* use the current React copy */ }
    const profile = Object.entries(storedProfiles).find(([profileKey, value]) =>
      String(profileKey).trim().toLowerCase() === key || String(value?.medication || '').trim().toLowerCase() === key,
    )?.[1];
    const profileConcentration = getVialConcentrationMgPerMl(profile);
    if (profileConcentration > 0) return profileConcentration;
    const linkedVial = vialId ? vials.find((vial) => vial.id === vialId) : null;
    const linkedConcentration = getVialConcentrationMgPerMl(linkedVial);
    if (linkedConcentration > 0) return linkedConcentration;
    const matchingVial = vials.find((vial) => String(vial.medication || '').trim().toLowerCase() === key && getVialConcentrationMgPerMl(vial) > 0);
    return getVialConcentrationMgPerMl(matchingVial);
  };

  const getSyringeDosePair = (dose, unit, medication, protocolConcentration, vialId) => {
    const amount = Number(dose);
    const concentration = getKnownSyringeConcentration(medication, protocolConcentration, vialId);
    if (!(amount > 0) || !(concentration > 0)) return null;
    const normalizedUnit = String(unit || 'mg').trim().toLowerCase();
    if (normalizedUnit === 'units' || normalizedUnit === 'unit') return { mg: (amount / 100) * concentration, units: amount };
    if (normalizedUnit === 'mg') return { mg: amount, units: (amount / concentration) * 100 };
    if (normalizedUnit === 'mcg') return { mg: amount / 1000, units: ((amount / 1000) / concentration) * 100 };
    if (normalizedUnit === 'ml') return { mg: amount * concentration, units: amount * 100 };
    return null;
  };

  const formatTodayDose = (row) => {
    const pair = getSyringeDosePair(row.dose, row.unit, row.medication, row.protocolConcentration, row.entry?.vialId || row.lastEntry?.vialId);
    if (pair) return `${formatSyringeDoseNumber(pair.mg)} mg · ${formatSyringeDoseNumber(pair.units)} units`;
    return row.dose != null ? `${formatSyringeDoseNumber(row.dose)} ${row.unit}` : 'Dose not set';
  };

  // Protocol is the source of truth for this display. A vial may only support
  // legacy records; no protocol dose or history value is changed here.
  const formatProtocolDose = (schedule) => {
    const pair = getSyringeDosePair(schedule.dose, schedule.unit, schedule.medication, schedule.doseConcentration, null);
    if (pair) return `${formatSyringeDoseNumber(pair.mg)} mg · ${formatSyringeDoseNumber(pair.units)} units`;
    return schedule.dose != null ? `${formatSyringeDoseNumber(schedule.dose)} ${schedule.unit || 'mg'}` : 'Dose not set';
  };

  // For vial deduction: ml × conc; U-100 units × conc; Retatrutide pen dial = units ÷ 10 per mg (not U-100 volume)
  const getDoseMgForVial = (dose, unit, vialId, medicationName) => {
    const u = (unit || 'mg').toLowerCase();
    const v = vialId ? vials.find(x => x.id === vialId) : null;
    const med = medicationName ?? v?.medication;
    const d = parseFloat(dose);
    if (u === 'units' && med === 'Retatrutide') {
      return isNaN(d) ? 0 : d / RETATRUTIDE_UNITS_PER_MG;
    }
    const conc = getVialConcentrationMgPerMl(v);
    if (u === 'ml' && vialId && conc > 0) return d * conc;
    if (u === 'units' && vialId && conc > 0) return (d / 100) * conc;
    return toDoseMg({ dose, unit: unit || 'mg', type: med });
  };

  const getVialForecast = (vial) => {
    const remainingMg = Number(vial.remainingMg ?? vial.totalMg) || 0;
    const schedule = schedules.find((item) => item.medication === vial.medication && !item.paused);
    if (!schedule || remainingMg <= 0) return null;
    const doseMg = getDoseMgForVial(schedule.dose, schedule.unit, vial.id, vial.medication);
    if (!Number.isFinite(doseMg) || doseMg <= 0) return null;
    const dosesRemaining = Math.max(0, Math.floor(remainingMg / doseMg));
    const dosesPerWeek = schedule.scheduleType === 'specific_days' && Array.isArray(schedule.specificDays)
      ? Math.max(1, schedule.specificDays.length)
      : Math.max(0.25, 7 / Math.max(1, Number(schedule.frequencyDays) || 7));
    const daysRemaining = Math.floor((dosesRemaining / dosesPerWeek) * 7);
    const through = new Date();
    through.setDate(through.getDate() + daysRemaining);
    return { dosesRemaining, through: formatDateLocal(through) };
  };

  // For level/curve only: ml → mg using linked vial, inventory vial, or med-specific assumed mg/ml (TRT oil) when no vial is set.
  const toDoseMgForLevel = (inj) => {
    if (!inj || isNaN(parseFloat(inj.dose))) return 0;
    const doseNum = parseFloat(inj.dose);
    const unit = (inj.unit || '').toLowerCase();
    const treatAsMl = unit === 'ml' || (doseNum > 0 && doseNum < 2 && inj.type && /testosterone|cypionate|enanthate/i.test(inj.type));
    if (treatAsMl) {
      if (inj.vialId) return getDoseMgForVial(inj.dose, 'ml', inj.vialId, inj.type);
      const v = vials.find((v) => v.medication === inj.type && getVialConcentrationMgPerMl(v) > 0);
      if (v) return doseNum * getVialConcentrationMgPerMl(v);
      const med = MEDICATIONS.find(m => m.name === inj.type);
      const assumed = med && parseFloat(med.assumedConcentrationMgPerMl);
      if (!isNaN(assumed) && assumed > 0) return doseNum * assumed;
      return 0;
    }
    if (unit === 'units') {
      if (inj.type === 'Retatrutide') return doseNum / RETATRUTIDE_UNITS_PER_MG;
      if (inj.vialId) {
        const mg = getDoseMgForVial(inj.dose, 'units', inj.vialId, inj.type);
        if (mg > 0) return mg;
      }
      const v = vials.find((v) => v.medication === inj.type && getVialConcentrationMgPerMl(v) > 0);
      if (v) return (doseNum / 100) * getVialConcentrationMgPerMl(v);
    }
    return toDoseMg(inj);
  };

  // For level % denominator: max single-shot mg in the set (stable vs "most recent" when recent rows are ml or typos).
  const getReferenceDoseMgForLevelPct = (injections) => {
    if (!Array.isArray(injections) || injections.length === 0) return 0;
    let maxMg = 0;
    injections.forEach(inj => {
      const mg = toDoseMgForLevel(inj);
      if (mg > maxMg) maxMg = mg;
    });
    return maxMg;
  };

  // Convert vial amount + unit to mg for storage/deduction
  const vialAmountToMg = (amount, unit, concentrationMgPerMl) => {
    const a = parseFloat(amount);
    if (isNaN(a) || a <= 0) return 0;
    if (unit === 'mg') return a;
    if (unit === 'mcg') return a / 1000;
    if (unit === 'ml') {
      const c = parseFloat(concentrationMgPerMl);
      return a * (isNaN(c) || c <= 0 ? 1 : c); // assume 1 mg/ml if not set
    }
    return a; // units, IU: treat as mg equivalent
  };

  // Effective hours for decay: IM absorbs faster so dose "enters" sooner (earlier peak)
  const getEffectiveHoursForDecay = (injection, medication, hoursElapsed) => {
    const route = injection.route || 'SubQ';
    if (route === 'IM' && medication.peakHours) {
      return hoursElapsed + medication.peakHours * 0.35; // IM: treat as if injected ~35% of peak-time earlier
    }
    return hoursElapsed;
  };

  // Medication level calculations (pharmacokinetics) — weighted by user's actual dose; SubQ vs IM affects curve
  const calculateMedicationLevel = (injection, medication) => {
    const now = new Date();
    const injectionDate = parseLocalDate(toCalendarDay(injection.date));
    if (!injectionDate || !Number.isFinite(injectionDate.getTime())) return 0;
    const hoursElapsed = (now - injectionDate) / (1000 * 60 * 60);
    
    if (hoursElapsed < 0) return 0; // Future injection
    if (!medication.halfLife) return 0;
    
    const effectiveHours = getEffectiveHoursForDecay(injection, medication, hoursElapsed);
    const doseMg = toDoseMgForLevel(injection);
    const halfLivesElapsed = effectiveHours / medication.halfLife;
    const remainingMg = doseMg * Math.pow(0.5, halfLivesElapsed);
    
    return Math.max(0, remainingMg);
  };

  // Get current phase based on hours since injection (medication-specific first, then category fallback)
  const getCurrentPhase = (hoursAgo, category, medName) => {
    const timeline = (medName && MEDICATION_PHASE_TIMELINES[medName]) || PHASE_TIMELINES[category];
    if (!timeline) return null;
    
    // Find which phase we're in based on hours elapsed
    for (let i = 0; i < timeline.phases.length; i++) {
      const phase = timeline.phases[i];
      const [minHours, maxHours] = phase.hours;
      if (hoursAgo >= minHours && (hoursAgo < maxHours || maxHours === 999)) {
        return {
          ...phase,
          phaseIndex: i,
          totalPhases: timeline.phases.length,
          hoursIntoPhase: hoursAgo - minHours,
          hoursRemainingInPhase: maxHours === 999 ? null : maxHours - hoursAgo
        };
      }
    }
    return null;
  };

  const getMedicationInsights = () => {
    const insights = [];
    const now = new Date();
    const sevenDaysAgo = new Date(now - 7 * 24 * 60 * 60 * 1000);
    const withValidDate = injectionEntries.filter(inj => isValidEntryDate(inj.date));

    // Get recent injections (last 90 days; fall back to all if none recent — e.g. sample data). Skip entries with bad dates.
    let recentInjections = withValidDate.filter(inj => {
      const injDate = parseLocalDate(toCalendarDay(inj.date));
      const daysAgo = (now - injDate) / (1000 * 60 * 60 * 24);
      return daysAgo <= 90;
    });
    if (recentInjections.length === 0) recentInjections = withValidDate;
    
    // Group by medication type
    const byMedication = {};
    recentInjections.forEach(inj => {
      if (!byMedication[inj.type]) byMedication[inj.type] = [];
      byMedication[inj.type].push(inj);
    });
    
    // Calculate insights for each medication
    Object.entries(byMedication).forEach(([medName, injections]) => {
      const medication = MEDICATIONS.find(m => m.name === medName);
      if (!medication) return;
      
      // Sort by date, most recent first (use toCalendarDay so bad date formats don't break)
      const sorted = injections.sort((a, b) => getEntryDateTime(b) - getEntryDateTime(a));
      const lastInjection = sorted[0];
      const lastDate = getEntryDateTime(lastInjection);
      const hoursAgo = lastDate && Number.isFinite(lastDate.getTime()) ? (now - lastDate) / (1000 * 60 * 60) : 0;
      
      // Calculate TOTAL current level from ALL recent injections, weighted by user's actual dose
      let totalRemainingMg = 0;
      injections.forEach(inj => {
        const injDate = getEntryDateTime(inj);
        if (!injDate || !Number.isFinite(injDate.getTime())) return;
        const hoursElapsed = (now - injDate) / (1000 * 60 * 60);
        if (hoursElapsed >= 0) {
          const effectiveHours = getEffectiveHoursForDecay(inj, medication, hoursElapsed);
          const doseMg = toDoseMgForLevel(inj);
          const halfLivesElapsed = effectiveHours / medication.halfLife;
          const remaining = doseMg * Math.pow(0.5, halfLivesElapsed);
          if (remaining > 0.0001) totalRemainingMg += remaining;
        }
      });
      // Display as % of largest logged dose (mg) in this window — avoids 1000% when "most recent" dose parses tiny but older shots still contribute.
      const refDoseMg = getReferenceDoseMgForLevelPct(injections);
      const rawLevel = refDoseMg > 0 ? (totalRemainingMg / refDoseMg) * 100 : 0;
      const currentLevel = Math.min(1000, rawLevel);
      
      // Get current phase from timeline (medication-specific first, then category)
      const currentPhase = getCurrentPhase(hoursAgo, medication.category, medication.name);
      const timeline = (medName && MEDICATION_PHASE_TIMELINES[medName]) || PHASE_TIMELINES[medication.category];

      // Fallback to simple phase if timeline not available
      let phase = currentPhase ? currentPhase.name : 'Active';
      let phaseColor = currentPhase ? currentPhase.color : 'text-gold-400';

      // Calculate next injection time
      const schedule = schedules.find(s => s.medication === medName);
      let nextInjection = null;
      if (schedule) {
        const lastDay = toCalendarDay(lastInjection.date);
        const nextDate = lastDay ? new Date(parseLocalDate(lastDay)) : null;
        if (nextDate && Number.isFinite(nextDate.getTime())) {
          if (schedule.scheduleType === 'specific_days' && Array.isArray(schedule.specificDays) && schedule.specificDays.length > 0) {
            for (let offset = 1; offset <= 7; offset += 1) {
              const candidate = new Date(nextDate);
              candidate.setDate(candidate.getDate() + offset);
              if (schedule.specificDays.includes(candidate.getDay())) {
                nextDate.setTime(candidate.getTime());
                break;
              }
            }
          } else {
            nextDate.setDate(nextDate.getDate() + schedule.frequencyDays);
          }
          if (schedule.preferredTime && /^\d{2}:\d{2}$/.test(schedule.preferredTime)) {
            const [hour, minute] = schedule.preferredTime.split(':').map(Number);
            nextDate.setHours(hour, minute, 0, 0);
          }
          nextInjection = nextDate;
        }
      }

      insights.push({
        medication: medName,
        color: medication.color,
        category: medication.category,
        currentLevel: Math.round(currentLevel), // Round to whole number
        currentRemainingMg: totalRemainingMg,
        phase,
        phaseColor,
        currentPhase, // Full phase object with details
        timeline, // Medication-specific or category timeline for phase list
        lastInjection: lastInjection.date,
        lastDose: lastInjection.dose,
        lastUnit: lastInjection.unit,
        hoursAgo: hoursAgo.toFixed(1),
        nextInjection,
        effectProfile: (medName && MEDICATION_EFFECT_PROFILES[medName]) || EFFECT_PROFILES[medication.category]
      });
    });
    
    return insights.sort((a, b) => parseFloat(b.currentLevel) - parseFloat(a.currentLevel));
  };

  const getMedicationLevelChartData = (medName) => {
    const medication = MEDICATIONS.find(m => m.name === medName);
    if (!medication) return [];
    
    const recentInjections = injectionEntries
      .filter(inj => inj.type === medName)
      .sort((a, b) => parseLocalDate(toCalendarDay(a.date)) - parseLocalDate(toCalendarDay(b.date)));
    
    if (recentInjections.length === 0) return [];
    
    const now = new Date();
    const data = [];
    
    // Generate data points for the last 14 days. Compare by calendar day only so any injection
    // logged on that day is always included and the curve goes up on injection days.
    for (let i = -14; i <= 0; i++) {
      const date = new Date(now);
      date.setDate(date.getDate() + i);
      date.setHours(23, 59, 59, 999);
      const dateStr = formatDateLocal(date);
      
      // Include all injections on or before this calendar day (string comparison YYYY-MM-DD)
      const injectionsBeforeDate = recentInjections.filter(inj => toCalendarDay(inj.date) <= dateStr);
      let totalRemainingMg = 0;
      injectionsBeforeDate.forEach(inj => {
        const injDay = toCalendarDay(inj.date);
        const injDate = parseLocalDate(injDay); // start of injection day
        const hoursElapsed = (date.getTime() - injDate.getTime()) / (1000 * 60 * 60);
        const effectiveHours = getEffectiveHoursForDecay(inj, medication, hoursElapsed);
        const doseMg = toDoseMgForLevel(inj);
        const halfLivesElapsed = effectiveHours / medication.halfLife;
        const remaining = doseMg * Math.pow(0.5, halfLivesElapsed);
        if (remaining > 0.0001) totalRemainingMg += remaining;
      });
      const refDoseMg = getReferenceDoseMgForLevelPct(injectionsBeforeDate);
      const level = refDoseMg > 0 ? (totalRemainingMg / refDoseMg) * 100 : 0;
      const injectionDatesSet = new Set(recentInjections.map(inj => toCalendarDay(inj.date)));
      const hasInjection = injectionDatesSet.has(dateStr);

      data.push({
        date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        fullDate: dateStr,
        level: Math.round(level),
        injectionDay: hasInjection
      });
    }

    return data;
  };

  const getBlendBreakdown = (entry) => {
    const medication = MEDICATIONS.find((med) => med.name === entry?.type);
    const components = medication?.blendComponents || [];
    const conversion = blendConversions[entry?.type] || {};
    const unit = String(entry?.unit || '').toLowerCase();
    if (!components.length || !['iu', 'units'].includes(unit)) return [];
    return components.map((component) => {
      const mgPerIU = Number(conversion[component]);
      return {
        component,
        mgPerIU: Number.isFinite(mgPerIU) && mgPerIU > 0 ? mgPerIU : null,
        mg: Number.isFinite(mgPerIU) && mgPerIU > 0 ? Number(entry.dose) * mgPerIU : null,
      };
    });
  };

  const getBlendSetup = (medication, medName) => {
    const saved = blendConversions[medName] || {};
    const components = medication?.blendComponents || [];
    const mixMl = saved.__mixMl ?? medication?.reconstitutionMl ?? '';
    const componentMg = Object.fromEntries(components.map((component) => [
      component,
      saved.__componentMg?.[component] ?? medication?.vialComposition?.[component] ?? '',
    ]));
    return { mixMl, componentMg };
  };

  const updateBlendSetup = (medication, medName, { mixMl: rawMixMl, component, componentMg: rawComponentMg }) => {
    const current = blendConversions[medName] || {};
    const setup = getBlendSetup(medication, medName);
    const nextMixMl = rawMixMl !== undefined ? rawMixMl : setup.mixMl;
    const nextComponentMg = {
      ...setup.componentMg,
      ...(component ? { [component]: rawComponentMg } : {}),
    };
    const numericMixMl = Number(nextMixMl);
    const rates = {};
    (medication?.blendComponents || []).forEach((name) => {
      const amountMg = Number(nextComponentMg[name]);
      rates[name] = numericMixMl > 0 && amountMg > 0 ? amountMg / (numericMixMl * 100) : '';
    });
    const next = {
      ...blendConversions,
      [medName]: {
        ...current,
        ...rates,
        __mixMl: nextMixMl,
        __componentMg: nextComponentMg,
      },
    };
    setBlendConversions(next);
    saveData('health-blend-conversions', next);
  };

  const renderBlendSetup = (medication, medName, latestEntry = null) => {
    const components = medication?.blendComponents || [];
    if (!components.length) return null;
    const setup = getBlendSetup(medication, medName);
    const ready = Number(setup.mixMl) > 0 && components.every((component) => Number(setup.componentMg[component]) > 0);
    const totalMg = components.reduce((sum, component) => sum + (Number(setup.componentMg[component]) || 0), 0);
    const totalMgPerIU = ready ? totalMg / (Number(setup.mixMl) * 100) : null;
    const breakdown = latestEntry ? getBlendBreakdown(latestEntry).filter((item) => item.mg != null) : [];
    return (
      <div className="rounded-xl border border-white/[0.08] bg-white/[0.025] p-3">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div>
            <h4 className="text-sm font-semibold text-white">Blend setup</h4>
            <p className="text-[11px] text-gray-500 mt-0.5">Enter vial strength and mixing water once. PepTalk calculates each compound per IU.</p>
          </div>
          <span className={`text-[10px] rounded-full px-2 py-1 ${ready ? 'bg-green-500/15 text-green-400' : 'bg-amber-500/10 text-amber-300'}`}>{ready ? 'Ready' : 'Needs mix'}</span>
        </div>
        <label className="block mb-3">
          <span className="text-[11px] text-gray-400 block mb-1">Mixing water</span>
          <div className="flex items-center rounded-lg bg-slate-800 border border-white/[0.08] overflow-hidden max-w-[160px]">
            <input
              type="number"
              min="0"
              step="0.1"
              inputMode="decimal"
              value={setup.mixMl}
              onChange={(event) => updateBlendSetup(medication, medName, { mixMl: event.target.value })}
              className="w-full min-w-0 bg-transparent px-2.5 py-2 text-sm text-white outline-none"
              placeholder="0.0"
            />
            <span className="pr-2 text-[10px] text-gray-500">mL</span>
          </div>
        </label>
        <div className={`grid gap-2 ${components.length > 2 ? 'grid-cols-2 sm:grid-cols-4' : 'grid-cols-2'}`}>
          {components.map((component) => (
            <label key={component} className="block min-w-0">
              <span className="text-[11px] text-gray-400 block truncate mb-1" title={component}>{component}</span>
              <div className="flex items-center rounded-lg bg-slate-800 border border-white/[0.08] overflow-hidden">
                <input
                  type="number"
                  min="0"
                  step="0.1"
                  inputMode="decimal"
                  value={setup.componentMg[component]}
                  onChange={(event) => updateBlendSetup(medication, medName, { component, componentMg: event.target.value })}
                  className="w-full min-w-0 bg-transparent px-2.5 py-2 text-sm text-white outline-none"
                  placeholder="0"
                />
                <span className="pr-2 text-[10px] text-gray-500">mg</span>
              </div>
              {ready && <span className="mt-1 block text-[10px] text-gold-400/80">{Number(blendConversions[medName]?.[component]).toFixed(3)} mg/IU</span>}
            </label>
          ))}
        </div>
        {ready && <p className="mt-3 text-[11px] text-gray-400">{totalMg.toFixed(totalMg % 1 ? 1 : 0)} mg total · {totalMgPerIU.toFixed(3)} mg/IU</p>}
        {breakdown.length > 0 && <p className="mt-2 text-xs text-gold-400/90">{latestEntry.dose} {latestEntry.unit} = {breakdown.map((item) => `${item.component} ${item.mg.toFixed(3)} mg`).join(' + ')}</p>}
      </div>
    );
  };

  // Regimen-style detail data: one time-aware level curve and summary for each compound.
  const getCompoundDetailData = (medName, range = '1m') => {
    const medication = MEDICATIONS.find((med) => med.name === medName);
    const entries = injectionEntries
      .filter((entry) => entry.type === medName && isValidEntryDate(entry.date))
      .sort((a, b) => getEntryDateTime(a) - getEntryDateTime(b));
    if (!medication || entries.length === 0) return null;

    const now = new Date();
    const blendComponents = medication.blendComponents || [];
    const blendRates = blendConversions[medName] || {};
    const blendConversionComplete = blendComponents.length > 0 && blendComponents.every((component) => Number(blendRates[component]) > 0);
    const doseForLevel = (entry) => {
      const unit = String(entry.unit || '').toLowerCase();
      if (blendConversionComplete && ['iu', 'units'].includes(unit)) {
        const totalMgPerIU = blendComponents.reduce((sum, component) => sum + Number(blendRates[component] || 0), 0);
        return Number(entry.dose) * totalMgPerIU;
      }
      return toDoseMgForLevel(entry);
    };
    const firstDoseAt = getEntryDateTime(entries[0]);
    const lastDoseAt = getEntryDateTime(entries[entries.length - 1]);
    const daysByRange = { '1w': 7, '1m': 30, '3m': 90, '6m': 180 };
    const requestedDays = daysByRange[range];
    const rangeStart = range === 'all'
      ? new Date(firstDoseAt)
      : new Date(now.getTime() - (requestedDays || 30) * 24 * 60 * 60 * 1000);
    const chartStart = rangeStart < firstDoseAt ? new Date(firstDoseAt) : rangeStart;
    const futureHours = Math.max(24, Math.min(72, (medication.defaultSchedule || 1) * 24));
    const chartEnd = new Date(now.getTime() + futureHours * 60 * 60 * 1000);
    const spanDays = Math.max(1, (chartEnd - chartStart) / (24 * 60 * 60 * 1000));
    const stepHours = spanDays <= 10 ? 2 : spanDays <= 40 ? 6 : spanDays <= 100 ? 18 : 36;
    const timestamps = new Set([chartStart.getTime(), now.getTime(), chartEnd.getTime()]);
    for (let ts = chartStart.getTime(); ts <= chartEnd.getTime(); ts += stepHours * 60 * 60 * 1000) timestamps.add(ts);
    entries.forEach((entry) => {
      const ts = getEntryDateTime(entry).getTime();
      if (ts >= chartStart.getTime() && ts <= chartEnd.getTime()) {
        timestamps.add(ts);
        timestamps.add(Math.max(chartStart.getTime(), ts - 60 * 1000));
      }
    });

    const points = [...timestamps].sort((a, b) => a - b).map((timestamp) => {
      let remainingMg = 0;
      entries.forEach((entry) => {
        const doseAt = getEntryDateTime(entry).getTime();
        if (doseAt > timestamp) return;
        const hoursElapsed = (timestamp - doseAt) / (60 * 60 * 1000);
        const effectiveHours = getEffectiveHoursForDecay(entry, medication, hoursElapsed);
        const remaining = doseForLevel(entry) * Math.pow(0.5, effectiveHours / medication.halfLife);
        if (Number.isFinite(remaining) && remaining > 0.0001) remainingMg += remaining;
      });
      const isFuture = timestamp > now.getTime();
      const isNow = timestamp === now.getTime();
      const doseEntry = entries.find((entry) => Math.abs(getEntryDateTime(entry).getTime() - timestamp) < 60 * 1000);
      return {
        timestamp,
        actualMg: !isFuture || isNow ? Number(remainingMg.toFixed(3)) : null,
        projectedMg: isFuture || isNow ? Number(remainingMg.toFixed(3)) : null,
        dose: doseEntry ? `${doseEntry.dose} ${doseEntry.unit || 'mg'}` : null,
      };
    });

    const schedule = schedules.find((item) => item.medication === medName);
    const loggedUnits = [...new Set(entries.map((entry) => String(entry.unit || 'mg').toLowerCase()))];
    const levelUnit = blendConversionComplete
      ? 'mg'
      : loggedUnits.length === 1 && loggedUnits[0] === 'iu'
      ? 'IU'
      : loggedUnits.length === 1 && loggedUnits[0] === 'units'
        ? 'units'
        : 'mg';
    const frequencyDays = Math.max(1, Number(schedule?.frequencyDays || medication.defaultSchedule || 1));
    const adherenceStart = new Date(Math.max(firstDoseAt.getTime(), now.getTime() - 30 * 24 * 60 * 60 * 1000));
    let expectedDoses;
    if (schedule?.scheduleType === 'specific_days' && Array.isArray(schedule.specificDays) && schedule.specificDays.length > 0) {
      expectedDoses = 0;
      const cursor = new Date(adherenceStart);
      cursor.setHours(0, 0, 0, 0);
      const endDay = new Date(now);
      endDay.setHours(23, 59, 59, 999);
      while (cursor <= endDay) {
        if (schedule.specificDays.includes(cursor.getDay())) expectedDoses += 1;
        cursor.setDate(cursor.getDate() + 1);
      }
      expectedDoses = Math.max(1, expectedDoses);
    } else {
      expectedDoses = Math.max(1, Math.floor((now - adherenceStart) / (frequencyDays * 24 * 60 * 60 * 1000)) + 1);
    }
    const actualDoseDays = new Set(entries.filter((entry) => getEntryDateTime(entry) >= adherenceStart && getEntryDateTime(entry) <= now).map((entry) => toCalendarDay(entry.date))).size;
    const adherence = Math.min(100, Math.round((actualDoseDays / expectedDoses) * 100));
    const nextDoseAt = new Date(lastDoseAt);
    if (schedule?.scheduleType === 'specific_days' && Array.isArray(schedule.specificDays) && schedule.specificDays.length > 0) {
      for (let offset = 1; offset <= 7; offset += 1) {
        const candidate = new Date(lastDoseAt);
        candidate.setDate(candidate.getDate() + offset);
        if (schedule.specificDays.includes(candidate.getDay())) {
          nextDoseAt.setTime(candidate.getTime());
          break;
        }
      }
    } else {
      nextDoseAt.setDate(nextDoseAt.getDate() + frequencyDays);
    }
    if (schedule?.preferredTime && /^\d{2}:\d{2}$/.test(schedule.preferredTime)) {
      const [hour, minute] = schedule.preferredTime.split(':').map(Number);
      nextDoseAt.setHours(hour, minute, 0, 0);
    }

    return {
      medication,
      entries: [...entries].reverse(),
      points,
      timeOnDays: Math.max(1, Math.floor((now - firstDoseAt) / (24 * 60 * 60 * 1000)) + 1),
      adherence,
      nextDoseAt,
      frequencyDays,
      levelUnit,
      currentRemaining: points.find((point) => point.timestamp === now.getTime())?.actualMg || 0,
      blendConversionComplete,
      paused: Boolean(schedule?.paused),
    };
  };

  // Weekly breakdown: total dose per week (per medication) + weight change per week
  const getWeeklyDoseAndWeightSummary = () => {
    if (weightEntries.length < 2 || injectionEntries.length === 0) return { rows: [], meds: [] };
    const medNames = [...new Set(injectionEntries.map(inj => inj.type).filter(Boolean))];
    const sortedWeights = sortWeightByDateAsc(weightEntries);
    const startDate = parseLocalDate(toCalendarDay(sortedWeights[0].date));
    const endDate = parseLocalDate(toCalendarDay(sortedWeights[sortedWeights.length - 1].date));
    if (!startDate || !endDate) return { rows: [], meds: medNames };

    const msPerDay = 24 * 60 * 60 * 1000;
    const msPerWeek = 7 * msPerDay;

    // Start of each 7-day bucket (anchor = weeklyDoseWeekStartsOn: 0 Sun … 6 Sat)
    const startOfWeek = (d) => {
      const date = new Date(d);
      const day = date.getDay();
      const anchor = weeklyDoseWeekStartsOn;
      const diff = (day - anchor + 7) % 7;
      date.setDate(date.getDate() - diff);
      date.setHours(0, 0, 0, 0);
      return date;
    };

    const firstWeekStart = startOfWeek(startDate);
    const lastWeekStart = startOfWeek(endDate);
    const weekCount = Math.max(1, Math.round((lastWeekStart - firstWeekStart) / msPerWeek) + 1);

    const injectionsByWeek = {};
    injectionEntries.forEach(inj => {
      const d = parseLocalDate(toCalendarDay(inj.date));
      if (!d || !Number.isFinite(d.getTime())) return;
      const weekKey = formatDateLocal(startOfWeek(d));
      const doseMg = toDoseMgForLevel(inj);
      if (!injectionsByWeek[weekKey]) {
        injectionsByWeek[weekKey] = {
          totalMg: 0,
          perMed: {}
        };
      }
      const bucket = injectionsByWeek[weekKey];
      const safeDose = doseMg || 0;
      bucket.totalMg += safeDose;

      const medName = inj.type || 'Other';
      const rawUnit = String(inj.unit || 'mg').toLowerCase();
      const displayUnit = rawUnit === 'iu' ? 'IU' : rawUnit === 'units' ? 'units' : 'mg';
      const displayDose = displayUnit === 'mg' ? safeDose : (Number(inj.dose) || 0);
      if (!bucket.perMed[medName]) {
        bucket.perMed[medName] = { doseMg: 0, displayDose: 0, unit: displayUnit };
      }
      bucket.perMed[medName].doseMg += doseMg || 0;
      bucket.perMed[medName].displayDose += displayDose;
    });

    const rows = [];
    for (let i = 0; i < weekCount; i++) {
      const ws = new Date(firstWeekStart);
      ws.setDate(ws.getDate() + i * 7);
      ws.setHours(0, 0, 0, 0);
      const weekEnd = new Date(ws);
      weekEnd.setDate(weekEnd.getDate() + 6);
      weekEnd.setHours(23, 59, 59, 999);
      const wsKey = formatDateLocal(ws);

      // Weight change in this week:
      // - Start = last weight before week start (if any), otherwise first weight in this week
      // - End   = last weight recorded in this week
      const weekWeights = sortedWeights.filter(w => {
        const d = parseLocalDate(toCalendarDay(w.date));
        return d && d >= ws && d <= weekEnd;
      });
      const hasDoses = !!injectionsByWeek[wsKey];
      if (weekWeights.length === 0 && !hasDoses) continue;

      let change = null;
      let weekStartWeight = null;
      let weekEndWeight = null;
      if (weekWeights.length > 0) {
        const weightsBeforeWeek = sortedWeights.filter(w => {
          const d = parseLocalDate(toCalendarDay(w.date));
          return d && d < ws;
        });
        const startW = weightsBeforeWeek.length
          ? weightsBeforeWeek[weightsBeforeWeek.length - 1].weight
          : weekWeights[0].weight;
        const endW = weekWeights[weekWeights.length - 1].weight;
        const sw = parseFloat(startW);
        const ew = parseFloat(endW);
        if (!Number.isNaN(sw)) weekStartWeight = sw;
        if (!Number.isNaN(ew)) weekEndWeight = ew;
        if (startW != null && endW != null && !Number.isNaN(sw) && !Number.isNaN(ew)) {
          change = ew - sw;
        }
      }

      const doseBucket = injectionsByWeek[wsKey] || { totalMg: 0, perMed: {} };
      rows.push({
        weekIndex: rows.length + 1,
        weekLabel: `${ws.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} – ${weekEnd.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`,
        totalDoseMg: doseBucket.totalMg,
        perMed: doseBucket.perMed,
        weightChange: change,
        weekStartWeight,
        weekEndWeight
      });
    }

    return { rows, meds: medNames };
  };

  // Phase label for a given day based on hours since last injection (Rising → Peak → Falling → Trough)
  // Trough = right before next dose; for weekly drugs with ~6–7 day half-life, that's day 6–7
  const getPhaseLabelForDay = (hoursSinceInjection, med, isInjectionDay) => {
    if (isInjectionDay && hoursSinceInjection < 24) return 'Injection';
    const peak = med.peakHours || 24;
    const halfLife = med.halfLife || 168;
    if (hoursSinceInjection <= peak * 0.8) return 'Rising';
    if (hoursSinceInjection <= peak * 2) return 'Peak';           // Peak through ~day 2–4 for weekly drugs
    if (hoursSinceInjection <= halfLife * 0.85) return 'Falling'; // Falling until ~day 5–6
    return 'Trough';                                              // Trough = last day(s) before next dose
  };

  // Unified chart: one graph with one curve per medication, estimated levels from half-life decay.
  // "All" = start on first logged injection date → today. Week/Month/3 mo = go back from current date by that period → today.
  const getUnifiedMedicationLevelChartData = () => {
    const nowReal = new Date();
    const todayStr = formatDateLocal(nowReal);
    const endOfToday = new Date(nowReal);
    endOfToday.setHours(23, 59, 59, 999);
    const validInjections = injectionEntries.filter(inj => isValidEntryDate(inj.date));
    const medNames = [...new Set(validInjections.map(inj => inj.type))];
    const medications = medNames.map(name => MEDICATIONS.find(m => m.name === name)).filter(Boolean);
    if (medications.length === 0 || validInjections.length === 0) return { data: [], medications: [] };

    const firstInjectionDate = validInjections.reduce((earliest, inj) => {
      const dayStr = toCalendarDay(inj.date);
      if (!dayStr) return earliest;
      const d = parseLocalDate(dayStr);
      if (!d || !Number.isFinite(d.getTime())) return earliest;
      return !earliest || d.getTime() < earliest.getTime() ? d : earliest;
    }, null);
    if (!firstInjectionDate || !Number.isFinite(firstInjectionDate.getTime())) return { data: [], medications: [] };

    let chartStart;
    if (insightsChartRange === 'all') {
      chartStart = new Date(firstInjectionDate);
      chartStart.setHours(23, 59, 59, 999);
    } else {
      const daysBack = insightsChartRange === '1w' ? 7 : insightsChartRange === '1m' ? 30 : 90;
      chartStart = new Date(nowReal);
      chartStart.setDate(chartStart.getDate() - daysBack);
      chartStart.setHours(23, 59, 59, 999);
    }

    const data = [];
    const endTime = endOfToday.getTime();
    let date = new Date(chartStart);
    date.setHours(23, 59, 59, 999);
    while (date.getTime() <= endTime) {
      const dateStr = formatDateLocal(date);
      const isToday = dateStr === todayStr;
      // Use **local midnight** for past/future days so injection dots align with that calendar day on the
      // X-axis (end-of-day timestamps sat near the next tick and looked “off by one”). Today uses real time.
      const startOfThisDay = new Date(date);
      startOfThisDay.setHours(0, 0, 0, 0);
      const timeForRow = isToday ? nowReal.getTime() : startOfThisDay.getTime();
      const injectionMeds = new Set();
      const injectionDoses = {}; // { medName: { dose, unit } } for tooltip
      const phaseByMed = {};
      const remainingMgByMed = {};
      let totalActiveMg = 0;
      const row = {
        date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        fullDate: dateStr,
        timestamp: timeForRow,
        isToday,
        injectionMedNames: [],
        injectionDoses,
        phaseByMed,
        remainingMgByMed
      };
      medications.forEach(med => {
        const injOnDay = validInjections.find(inj => inj.type === med.name && toCalendarDay(inj.date) === dateStr);
        if (injOnDay) {
          injectionMeds.add(med.name);
          injectionDoses[med.name] = { dose: String(injOnDay.dose), unit: injOnDay.unit || 'mg' };
        }
      });
      medications.forEach(med => {
        const recentInjections = validInjections
          .filter(inj => inj.type === med.name)
          .sort((a, b) => parseLocalDate(toCalendarDay(a.date)) - parseLocalDate(toCalendarDay(b.date)));
        const injectionsBeforeDate = recentInjections.filter(inj => toCalendarDay(inj.date) <= dateStr);
        if (injectionsBeforeDate.length === 0) {
          row[med.name] = null;
          return;
        }
        let totalRemainingMg = 0;
        injectionsBeforeDate.forEach(inj => {
          const dayStr = toCalendarDay(inj.date);
          if (!dayStr) return;
          const injDate = parseLocalDate(dayStr);
          if (!injDate || !Number.isFinite(injDate.getTime())) return;
          const hoursElapsed = (timeForRow - injDate.getTime()) / (1000 * 60 * 60);
          const effectiveHours = getEffectiveHoursForDecay(inj, med, hoursElapsed);
          const doseMg = toDoseMgForLevel(inj);
          const halfLivesElapsed = effectiveHours / med.halfLife;
          const remaining = doseMg * Math.pow(0.5, halfLivesElapsed);
          if (Number.isFinite(remaining) && remaining > 0.0001) totalRemainingMg += remaining;
        });
        totalActiveMg += totalRemainingMg;
        remainingMgByMed[med.name] = totalRemainingMg;
        const refDoseMg = getReferenceDoseMgForLevelPct(injectionsBeforeDate);
        const pct = refDoseMg > 0 ? (totalRemainingMg / refDoseMg) * 100 : null;
        row[med.name] = pct != null && Number.isFinite(pct) ? Math.min(1000, Math.round(pct)) : null;
        const lastInj = injectionsBeforeDate[injectionsBeforeDate.length - 1];
        const lastDayStr = lastInj ? toCalendarDay(lastInj.date) : '';
        const lastInjDate = lastDayStr ? parseLocalDate(lastDayStr) : null;
        const hoursSinceInjection = lastInjDate && Number.isFinite(lastInjDate.getTime())
          ? (timeForRow - lastInjDate.getTime()) / (1000 * 60 * 60)
          : 0;
        const isInjectionDay = injectionMeds.has(med.name);
        const phaseFromTimeline = getCurrentPhase(hoursSinceInjection, med.category, med.name);
        row.phaseByMed[med.name] = (isInjectionDay && hoursSinceInjection < 24)
          ? 'Injection'
          : (phaseFromTimeline ? phaseFromTimeline.name : getPhaseLabelForDay(hoursSinceInjection, med, isInjectionDay));
      });
      row.injectionMedNames = Array.from(injectionMeds);
      row.totalActiveMg = totalActiveMg;
      if (isToday) {
        const insights = getMedicationInsights();
        let sumActiveMg = 0;
        insights.forEach(insight => {
          row[insight.medication] = insight.currentLevel;
          const med = medications.find(m => m.name === insight.medication);
          if (med) {
            const withValidDate = validInjections.filter(inj => isValidEntryDate(inj.date));
            const recentInjections = withValidDate.filter(inj => inj.type === insight.medication);
            let totalRemainingMg = 0;
            recentInjections.forEach(inj => {
              const injDate = parseLocalDate(toCalendarDay(inj.date));
              if (!injDate || !Number.isFinite(injDate.getTime())) return;
              const hoursElapsed = (nowReal - injDate) / (1000 * 60 * 60);
              if (hoursElapsed >= 0) {
                const effectiveHours = getEffectiveHoursForDecay(inj, med, hoursElapsed);
                const doseMg = toDoseMgForLevel(inj);
                const halfLivesElapsed = effectiveHours / med.halfLife;
                const remaining = doseMg * Math.pow(0.5, halfLivesElapsed);
                if (remaining > 0.0001) totalRemainingMg += remaining;
              }
            });
            row.remainingMgByMed[insight.medication] = totalRemainingMg;
            sumActiveMg += totalRemainingMg;
          }
        });
        row.totalActiveMg = sumActiveMg;
      }
      data.push(row);
      date.setDate(date.getDate() + 1);
      date.setHours(23, 59, 59, 999);
    }
    return { data, medications };
  };

  const filteredMedications = MEDICATIONS.filter(med => med.name.toLowerCase().includes(medSearchTerm.toLowerCase()) || med.category.toLowerCase().includes(medSearchTerm.toLowerCase()));
  const groupedMedications = filteredMedications.reduce((acc, med) => { if (!acc[med.category]) acc[med.category] = []; acc[med.category].push(med); return acc; }, {});

  const stats = getWeightStats();
  const bmiCategory = getBMICategory(stats.bmi);
  const medicationInsights = getMedicationInsights();
  const activeMedicationInsights = medicationInsights.filter((insight) => !insightsInactiveMeds.includes(insight.medication));
  const inactiveMedicationInsights = medicationInsights.filter((insight) => insightsInactiveMeds.includes(insight.medication));
  const setInsightMedicationInactive = (medName, inactive) => {
    const next = inactive
      ? [...new Set([...insightsInactiveMeds, medName])]
      : insightsInactiveMeds.filter((name) => name !== medName);
    setInsightsInactiveMeds(next);
    saveData('health-insights-inactive-meds', next);
    if (inactive && insightsExpandedMed === medName) setInsightsExpandedMed(null);
  };
  const upcomingInjections = getNextInjections();
  const formatDoseTime = (value) => {
    const [hourRaw, minute = '00'] = String(value || '09:00').split(':');
    const hour = Number(hourRaw);
    if (!Number.isFinite(hour)) return value || 'Any time';
    const suffix = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minute} ${suffix}`;
  };
  const getTodayDoseRows = () => {
    const todayStr = getTodayLocal();
    const todayDate = parseLocalDate(todayStr);
    const rows = [];

    schedules.filter((schedule) => !schedule.paused).forEach((schedule) => {
      const medEntries = injectionEntries
        .filter((entry) => entry.type === schedule.medication)
        .sort((a, b) => getEntryDateTime(b) - getEntryDateTime(a));
      const todayEntry = medEntries.find((entry) => toCalendarDay(entry.date) === todayStr);
      const lastEntry = medEntries[0] || null;
      const plan = titrationPlans.find((item) => item.medication === schedule.medication);
      const currentStep = plan ? getCurrentTitrationDose(plan) : null;
      const dose = todayEntry?.dose ?? schedule.dose ?? currentStep?.dose ?? lastEntry?.dose ?? null;
      const unit = todayEntry?.unit || schedule.unit || currentStep?.unit || lastEntry?.unit || 'mg';
      const preferredTime = schedule.preferredTime || lastEntry?.time || '09:00';
      const todayAction = doseActions.find((action) => action.medication === schedule.medication && action.date === todayStr);
      const actionTime = todayAction?.status === 'later' && /^\d{2}:\d{2}$/.test(todayAction.time || '') ? todayAction.time : preferredTime;
      const startDay = toCalendarDay(schedule.startDate) || todayStr;
      const specificDays = schedule.scheduleType === 'specific_days' && schedule.specificDays?.length
        ? schedule.specificDays
        : null;

      if (specificDays?.includes(todayDate.getDay())) {
        rows.push({
          medication: schedule.medication,
          status: todayEntry ? 'done' : todayAction?.status === 'skipped' ? 'skipped' : 'due',
          preferredTime: actionTime,
          dose,
          unit,
          protocolConcentration: schedule.doseConcentration || null,
          entry: todayEntry || null,
          lastEntry,
          action: todayAction || null,
        });
        return;
      }

      if (specificDays) {
        for (let offset = 1; offset <= 7; offset += 1) {
          const expected = new Date(todayDate);
          expected.setDate(expected.getDate() - offset);
          if (!specificDays.includes(expected.getDay())) continue;
          const expectedDay = formatDateLocal(expected);
          if (expectedDay < startDay) break;
          const fulfilled = medEntries.some((entry) => {
            const day = toCalendarDay(entry.date);
            return day >= expectedDay && day <= todayStr;
          });
          if (!fulfilled) {
            rows.push({
              medication: schedule.medication,
              status: 'overdue',
              preferredTime,
              dose,
              unit,
              protocolConcentration: schedule.doseConcentration || null,
              entry: null,
              lastEntry,
              overdueDays: offset,
            });
          }
          break;
        }
        return;
      }

      const upcoming = upcomingInjections.find((item) => item.medication === schedule.medication);
      if (todayEntry || upcoming?.isDueToday || upcoming?.isOverdue) {
        rows.push({
          medication: schedule.medication,
          status: todayEntry ? 'done' : todayAction?.status === 'skipped' ? 'skipped' : upcoming?.isOverdue ? 'overdue' : 'due',
          preferredTime: actionTime,
          dose,
          unit,
          protocolConcentration: schedule.doseConcentration || null,
          entry: todayEntry || null,
          lastEntry,
          action: todayAction || null,
          overdueDays: upcoming?.isOverdue ? Math.abs(upcoming.daysUntil) : 0,
        });
      }
    });

    return rows.sort((a, b) => {
      if (a.status === 'overdue' && b.status !== 'overdue') return -1;
      if (b.status === 'overdue' && a.status !== 'overdue') return 1;
      return String(a.preferredTime).localeCompare(String(b.preferredTime));
    });
  };
  const todayDoseRows = getTodayDoseRows();

  const setTodayDoseAction = (row, status) => {
    const today = getTodayLocal();
    const remaining = doseActions.filter((action) => !(action.medication === row.medication && action.date === today));
    let next = remaining;
    if (status === 'skipped') {
      next = [...remaining, { id: Date.now(), medication: row.medication, date: today, status: 'skipped' }];
    } else if (status === 'later') {
      const base = new Date();
      const [hour, minute] = String(row.preferredTime || '09:00').split(':').map(Number);
      base.setHours(Number.isFinite(hour) ? hour : base.getHours(), Number.isFinite(minute) ? minute : base.getMinutes(), 0, 0);
      if (base.getTime() < Date.now()) base.setTime(Date.now());
      base.setHours(base.getHours() + 1);
      const time = `${String(base.getHours()).padStart(2, '0')}:${String(base.getMinutes()).padStart(2, '0')}`;
      next = [...remaining, { id: Date.now(), medication: row.medication, date: today, status: 'later', time }];
    }
    setDoseActions(next);
    saveData('health-dose-actions', next);
  };

  const openTodayDoseForm = (row) => {
    const now = new Date();
    const actualTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    const source = row.entry || row.lastEntry || {};
    setEditingInjection(row.entry || null);
    setInjectionType(row.medication);
    setInjectionDose(row.dose != null ? String(row.dose) : '');
    setInjectionUnit(row.unit || 'mg');
    setInjectionDate(getTodayLocal());
    setInjectionTime(row.entry?.time || actualTime);
    setInjectionRoute(source.route || 'SubQ');
    setInjectionSite(source.site || getSuggestedInjectionSite(row.medication) || 'Stomach');
    setInjectionNotes(source.notes || '');
    setSelectedSideEffects(source.sideEffects || []);
    setSideEffectSeverity(source.sideEffectSeverity || {});
    setSelectedVialId(source.vialId || null);
    setTrialTargetMg('');
    setActiveTab('injections');
    setShowAddForm(true);
  };

  const markTodayDoseTaken = (row) => {
    if (row.status === 'done') return;
    if (row.dose == null || isNaN(Number(row.dose))) {
      openTodayDoseForm(row);
      return;
    }
    const now = new Date();
    const time = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    const source = row.lastEntry || {};
    const linkedVial = source.vialId && vials.some((vial) => vial.id === source.vialId) ? source.vialId : null;
    const newEntry = {
      id: Date.now(),
      type: row.medication,
      dose: Number(row.dose),
      unit: row.unit || 'mg',
      date: getTodayLocal(),
      time,
      route: source.route || 'SubQ',
      notes: 'Logged from Today',
      sideEffects: [],
      ...(linkedVial ? { vialId: linkedVial } : {}),
    };
    const previousEntries = injectionEntries;
    const updatedEntries = [newEntry, ...injectionEntries].sort((a, b) => getEntryDateTime(b) - getEntryDateTime(a));
    if (!saveData('health-injection-entries', updatedEntries)) return;
    setInjectionEntries(updatedEntries);
    const remainingActions = doseActions.filter((action) => !(action.medication === row.medication && action.date === getTodayLocal()));
    if (remainingActions.length !== doseActions.length) {
      setDoseActions(remainingActions);
      saveData('health-dose-actions', remainingActions);
    }

    const previousVials = vials;
    let updatedVials = vials;
    if (linkedVial) {
      const doseMg = getDoseMgForVial(newEntry.dose, newEntry.unit, linkedVial, newEntry.type);
      updatedVials = pruneEmptyVials(vials.map((vial) => vial.id === linkedVial
        ? { ...vial, remainingMg: Math.max(0, (vial.remainingMg ?? vial.totalMg) - doseMg) }
        : vial));
      setVials(updatedVials);
      saveData('health-vials', updatedVials);
    }

    pushUndoToast(`${row.medication} marked taken`, () => {
      setInjectionEntries(previousEntries);
      saveData('health-injection-entries', previousEntries);
      if (linkedVial) {
        setVials(previousVials);
        saveData('health-vials', previousVials);
      }
    });
  };
  const measurementStats = getMeasurementStats();

  const dismissWelcomeModal = () => {
    setShowWelcomeModal(false);
    try {
      localStorage.setItem('peptalk-welcome-version', APP_VERSION);
      if (welcomeDontShowAgain) localStorage.setItem('peptalk-welcome-hide-forever', 'true');
      if (supabaseConfigured && user) localStorage.setItem('peptalk-welcome-seen-signed-in', 'true');
    } catch (_) {}
  };

  const onCloudSignInSuccess = () => {
    try {
      localStorage.removeItem('peptalk-cloud-opt-out');
    } catch (_) {}
    setCloudOptOut(false);
  };

  const continueOfflineOnly = async () => {
    try {
      localStorage.setItem('peptalk-cloud-opt-out', 'true');
    } catch (_) {}
    setCloudOptOut(true);
    await supabaseSignOut();
  };

  const clearCloudOptOut = () => {
    try {
      localStorage.removeItem('peptalk-cloud-opt-out');
    } catch (_) {}
    setCloudOptOut(false);
  };

  const showBlockingSplash = isLoading || showSplash || (supabaseConfigured && supabaseAuthLoading);
  const splashSubtitle = isLoading ? 'Loading your data...' : supabaseAuthLoading ? 'Checking session…' : 'Loading your data...';
  const showOfflineBanner = supabaseConfigured && !isOnline;
  const showSyncFailBanner = supabaseConfigured && isOnline && user && !!backgroundSyncError;

  if (showBlockingSplash) {
    return (
      <div className="min-h-screen flex items-center justify-center overflow-hidden bg-[var(--bg-base)]">
        <div className="text-center relative">
          {/* Outer glow ring */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="splash-ring w-48 h-48 rounded-full border-2 border-accent/30" />
          </div>
          <div className="relative mb-6 splash-icon-wrap">
            <div className="absolute inset-0 bg-accent/25 blur-3xl rounded-full splash-glow" />
            <div className="absolute inset-0 rounded-full border border-accent/20 splash-ring-inner" />
            <Activity className="h-24 w-24 text-gold-400 mx-auto relative splash-float" strokeWidth={1.5} />
          </div>
          <h1 className="text-4xl font-bold text-white mb-2 tracking-tight splash-title">PepTalk</h1>
          <p className="text-gold-400 text-sm font-medium splash-subtitle">{splashSubtitle}</p>
          <div className="flex justify-center gap-1 mt-4 splash-dots">
            <span className="w-2 h-2 rounded-full bg-accent/60 splash-dot" style={{ animationDelay: '0s' }} />
            <span className="w-2 h-2 rounded-full bg-accent/60 splash-dot" style={{ animationDelay: '0.2s' }} />
            <span className="w-2 h-2 rounded-full bg-accent/60 splash-dot" style={{ animationDelay: '0.4s' }} />
          </div>
        </div>
        <style>{`
          .splash-glow {
            animation: splash-glow 2.5s ease-in-out infinite;
          }
          @keyframes splash-glow {
            0%, 100% { opacity: 0.6; transform: scale(1); }
            50% { opacity: 1; transform: scale(1.15); }
          }
          .splash-ring {
            animation: splash-ring 3s linear infinite;
          }
          @keyframes splash-ring {
            from { transform: rotate(0deg); opacity: 0.4; }
            50% { opacity: 0.8; }
            to { transform: rotate(360deg); opacity: 0.4; }
          }
          .splash-ring-inner {
            animation: splash-ring-inner 4s linear infinite reverse;
          }
          @keyframes splash-ring-inner {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
          .splash-float {
            animation: splash-float 2.5s ease-in-out infinite;
          }
          @keyframes splash-float {
            0%, 100% { transform: translateY(0) scale(1); }
            50% { transform: translateY(-12px) scale(1.05); }
          }
          .splash-title {
            animation: splash-title 0.8s cubic-bezier(0.22, 1, 0.36, 1) 0.2s both;
          }
          @keyframes splash-title {
            from { opacity: 0; transform: translateY(16px) scale(0.92); }
            to { opacity: 1; transform: translateY(0) scale(1); }
          }
          .splash-subtitle {
            animation: splash-subtitle 0.6s ease-out 0.5s both;
          }
          @keyframes splash-subtitle {
            from { opacity: 0; transform: translateY(8px); }
            to { opacity: 1; transform: translateY(0); }
          }
          .splash-dots {
            animation: splash-fade 0.5s ease-out 0.7s both;
          }
          .splash-dot {
            animation: splash-dot-bounce 1.2s ease-in-out infinite;
          }
          @keyframes splash-dot-bounce {
            0%, 100% { transform: translateY(0); opacity: 0.6; }
            50% { transform: translateY(-4px); opacity: 1; }
          }
          @keyframes splash-fade {
            from { opacity: 0; }
            to { opacity: 1; }
          }
        `}</style>
      </div>
    );
  }

  if (supabaseConfigured && !user && !cloudOptOut) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-[var(--bg-base)] gap-3">
        {showOfflineBanner && (
          <div className="w-full max-w-md flex items-start gap-2 rounded-xl border border-amber-500/30 bg-amber-500/10 px-3 py-2.5 text-amber-100/95 text-sm">
            <WifiOff className="h-4 w-4 flex-shrink-0 mt-0.5 text-amber-400" aria-hidden />
            <span>
              <strong className="text-amber-50">You&apos;re offline.</strong> Sign-in needs a network connection. Your data on this device stays put until you can connect.
            </span>
          </div>
        )}
        <div className="w-full max-w-md ui-card p-6 border border-cyan-500/25">
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-accent/15 border border-accent/30 mb-3">
              <Activity className="h-8 w-8 text-gold-400" strokeWidth={1.5} />
            </div>
            <h1 className="text-2xl font-bold text-white tracking-tight">PepTalk</h1>
            <p className="text-gray-400 text-sm mt-2">Sign in to sync across devices, or use the app on this device only without an account.</p>
          </div>
          <form
            className="space-y-3"
            onSubmit={async (e) => {
              e.preventDefault();
              setCloudAuthMessage('');
              setCloudBusy(true);
              const { error } = await supabaseSignIn(cloudEmail, cloudPassword);
              setCloudBusy(false);
              if (error) setCloudAuthMessage(formatCloudError(error));
              else {
                onCloudSignInSuccess();
                setCloudPassword('');
                setCloudAuthMessage('');
              }
            }}
          >
            <div>
              <label className="text-gray-400 text-sm block mb-1">Email</label>
              <input type="email" autoComplete="email" value={cloudEmail} onChange={(e) => setCloudEmail(e.target.value)} className="w-full bg-slate-700 text-white rounded-lg px-4 py-2.5" placeholder="you@example.com" />
            </div>
            <div>
              <label className="text-gray-400 text-sm block mb-1">Password</label>
              <input type="password" autoComplete="current-password" value={cloudPassword} onChange={(e) => setCloudPassword(e.target.value)} className="w-full bg-slate-700 text-white rounded-lg px-4 py-2.5" placeholder="••••••••" />
            </div>
            <div className="flex flex-wrap gap-2 pt-1">
              <button type="submit" disabled={cloudBusy} className="flex-1 min-w-[8rem] ui-btn-primary py-2.5 disabled:opacity-50">Sign in</button>
              <button
                type="button"
                disabled={cloudBusy}
                className="flex-1 min-w-[8rem] py-2.5 rounded-lg font-medium bg-white/10 text-gray-200 hover:bg-white/15 disabled:opacity-50"
                onClick={async () => {
                  setCloudAuthMessage('');
                  setCloudBusy(true);
                  const { error } = await supabaseSignUp(cloudEmail, cloudPassword);
                  setCloudBusy(false);
                  if (error) setCloudAuthMessage(formatCloudError(error));
                  else setCloudAuthMessage('Check your email to confirm your account (if required by your Supabase project).');
                }}
              >
                Sign up
              </button>
            </div>
            {cloudAuthMessage && <p className="text-gray-400 text-xs pt-1">{cloudAuthMessage}</p>}
          </form>
          <div className="mt-4 pt-4 border-t border-white/10">
            <button
              type="button"
              disabled={cloudBusy}
              onClick={continueOfflineOnly}
              className="w-full py-2.5 rounded-lg text-sm font-medium bg-white/5 text-gray-300 border border-white/15 hover:bg-white/10 disabled:opacity-50"
            >
              Continue without account (offline only)
            </button>
            <p className="text-gray-500 text-xs mt-2 text-center">Data stays on this device until you sign in later from Profile.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="app-shell min-h-screen pb-32 bg-[var(--bg-base)]">
      {storageQuotaWarning && (
        <div className="sticky top-0 z-40 mb-2 -mt-1">
          <div className="flex items-start gap-2 rounded-xl border border-orange-500/35 bg-orange-500/10 px-3 py-2.5 text-orange-100/95 text-sm">
            <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5 text-orange-400" aria-hidden />
            <span>
              <strong className="text-orange-50">Storage almost full.</strong> Could not save some data. Export a backup (More → Tools → Data), then remove old photos or vial images, or clear space.
            </span>
            <button type="button" onClick={() => setStorageQuotaWarning(false)} className="text-orange-200 hover:text-white p-1 rounded-lg shrink-0" aria-label="Dismiss"><X className="h-4 w-4" /></button>
          </div>
        </div>
      )}
      {(showOfflineBanner || showSyncFailBanner) && (
        <div className="sticky top-0 z-40 space-y-2 mb-2 -mt-1">
          {showOfflineBanner && (
            <div className="flex items-start gap-2 rounded-xl border border-amber-500/30 bg-amber-500/10 px-3 py-2.5 text-amber-100/95 text-sm shadow-lg shadow-black/20">
              <WifiOff className="h-4 w-4 flex-shrink-0 mt-0.5 text-amber-400" aria-hidden />
              <span>
                <strong className="text-amber-50">You&apos;re offline.</strong> Changes are saved on this device. Cloud backup will resume when you&apos;re back online.
              </span>
            </div>
          )}
          {showSyncFailBanner && (
            <div className="flex items-start gap-2 rounded-xl border border-red-500/25 bg-red-500/10 px-3 py-2.5 text-sm text-red-100/90 shadow-lg shadow-black/20">
              <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5 text-red-400" aria-hidden />
              <span className="flex-1 min-w-0">{backgroundSyncError}</span>
              <button
                type="button"
                onClick={() => setBackgroundSyncError('')}
                className="text-red-200/90 hover:text-white p-1 rounded-lg shrink-0"
                aria-label="Dismiss"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>
      )}
      {/* Success Celebration Popup */}
      {showCelebration && (
        <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
          <div className="animate-celebrate bg-gradient-to-r from-accent to-gold-600 text-gray-900 px-8 py-4 rounded-2xl shadow-2xl shadow-accent/40 pointer-events-auto transform scale-110">
            <div className="text-2xl font-bold text-center">{celebrationMessage}</div>
          </div>
        </div>
      )}
      
      {/* Wipe Data Confirmation */}
{showWipeConfirm && (
  <div className="ui-modal-overlay" onClick={() => { setShowWipeConfirm(false); setWipeConfirmChecked(false); }}>
    <div className="ui-modal" onClick={e => e.stopPropagation()}>
      <h3 className="text-white text-xl font-semibold mb-2">Reset PepTalk?</h3>
      <p className="text-gray-300 text-sm mb-4">
        This permanently deletes all weight, injections, measurements, photos, schedules, and journal entries on this device.
      </p>

      <label className="flex items-start gap-3 rounded-xl p-3 mb-4 cursor-pointer border border-white/[0.08] bg-[var(--bg-elevated)]">
        <input
          type="checkbox"
          checked={wipeConfirmChecked}
          onChange={(e) => setWipeConfirmChecked(e.target.checked)}
          className="mt-1"
        />
        <span className="text-gray-200 text-sm">
          I understand this cannot be undone.
        </span>
      </label>

      <div className="flex gap-3 mt-4">
        <button
          onClick={() => { setShowWipeConfirm(false); setWipeConfirmChecked(false); }}
          className="flex-1 ui-btn-ghost py-3"
        >
          Cancel
        </button>
        <button
          disabled={!wipeConfirmChecked}
          onClick={wipeAllData}
          className={`flex-1 font-semibold py-3 rounded-xl transition-all ${
            wipeConfirmChecked
              ? 'bg-red-500 hover:bg-red-400 text-white shadow-lg shadow-red-500/30'
              : 'bg-red-500/30 text-white/50 cursor-not-allowed'
          }`}
        >
          Wipe Data
        </button>
      </div>
    </div>
  </div>
)}

      {/* Welcome / Update modal — after sign-in when cloud is on; version updates; "Do not show again" hides forever */}
      <GraphicalSummaryModal
        ref={graphicalSummaryCaptureRef}
        open={showGraphicalSummary}
        onClose={() => setShowGraphicalSummary(false)}
        onDownloadPdf={handleGraphicalSummaryPdf}
        pdfBusy={graphicalPdfBusy}
        weightEntries={weightEntries}
        injectionEntries={injectionEntries}
        sleepEntries={sleepEntries}
        glucoseEntries={glucoseEntries}
        labEntries={labEntries}
        journalEntries={journalEntries}
        dailyTrackEntries={dailyTrackEntries}
        measurementEntries={measurementEntries}
        userProfile={userProfile}
        schedules={schedules}
        vials={vials}
      />

      {showWelcomeModal && (
        <div className="ui-modal-overlay" onClick={dismissWelcomeModal}>
          <div className="ui-modal max-h-[85vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-white flex items-center gap-2"><BookOpen className="h-6 w-6 text-gold-400" />Welcome to PepTalk</h3>
              <button type="button" onClick={dismissWelcomeModal} className="p-2 text-gray-400 hover:text-white rounded-lg"><X className="h-5 w-5" /></button>
            </div>
            <p className="text-gold-400 text-sm font-medium mb-3">v{APP_VERSION} — A clearer, fully modernized PepTalk</p>
            <div className="text-gray-300 text-sm space-y-3 mb-4 pr-2">
              <p><strong className="text-white">Summary</strong> — Morning, evening, and completed doses with one-tap Taken, Take later, and Skip actions, plus your weekly review.</p>
              <p><strong className="text-white">Weight</strong> — A prominent seven-day trend, clean Apple Health imports, and flags for readings worth reviewing.</p>
              <p><strong className="text-white">Protocols</strong> — The source of truth for dose, schedule, alerts, phases, blends, cycles, and inventory.</p>
              <p><strong className="text-white">Insights</strong> — Estimated medication levels, protocol phases, detailed history, and weekly dose-versus-weight analysis.</p>
              <p><strong className="text-white">More</strong> — Dose logging and history, calendar, labs, general reminders, vial inventory, and verified backups.</p>
              {weightEntries.length === 0 && injectionEntries.length === 0 && (
                <p className="bg-accent/10 border border-accent/20 rounded-lg p-2.5 text-gold-400 text-xs mt-2">Get started by logging your first weight or injection from Summary.</p>
              )}
            </div>
            <label className="flex items-start gap-3 rounded-xl p-3 mb-4 cursor-pointer border border-white/[0.08] bg-[var(--bg-card)]">
              <input type="checkbox" checked={welcomeDontShowAgain} onChange={(e) => setWelcomeDontShowAgain(e.target.checked)} className="mt-1" />
              <span className="text-gray-200 text-sm">Do not show this again (even after updates)</span>
            </label>
            <button type="button" onClick={dismissWelcomeModal} className="w-full ui-btn-primary py-3">
              Got it
            </button>
          </div>
        </div>
      )}

      {/* APK / app update — optional manifest URL on your site (see VITE_APP_UPDATE_MANIFEST_URL) */}
      {updatePrompt && (
        <div className="ui-modal-overlay" onClick={() => { dismissUpdatePrompt(updatePrompt.latestVersion); setUpdatePrompt(null); }}>
          <div className="ui-modal max-w-md" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center gap-2 mb-2">
              <Download className="h-6 w-6 text-cyan-400 flex-shrink-0" />
              <h3 className="text-white font-semibold text-lg">Update available</h3>
            </div>
            <p className="text-gold-400 text-sm font-medium mb-3">
              Version {updatePrompt.latestVersion} is ready (you have v{APP_VERSION}).
            </p>
            {updatePrompt.releaseNotes ? (
              <p className="text-gray-300 text-sm mb-4 whitespace-pre-wrap">{updatePrompt.releaseNotes}</p>
            ) : (
              <p className="text-gray-400 text-sm mb-4">Download the new APK from the site to install this update.</p>
            )}
            <div className="flex flex-col gap-2">
              <button
                type="button"
                className="w-full py-3 rounded-lg font-medium bg-cyan-600 hover:bg-cyan-500 text-white flex items-center justify-center gap-2"
                onClick={() => {
                  openDownloadUrl(updatePrompt.downloadUrl);
                  dismissUpdatePrompt(updatePrompt.latestVersion);
                  setUpdatePrompt(null);
                }}
              >
                <Download className="h-4 w-4" />
                Download update
              </button>
              <button
                type="button"
                className="w-full py-3 rounded-lg font-medium bg-white/10 hover:bg-white/15 text-gray-200"
                onClick={() => {
                  dismissUpdatePrompt(updatePrompt.latestVersion);
                  setUpdatePrompt(null);
                }}
              >
                Not now
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Cloud backup: choose local vs account when both exist */}
      {pendingCloudRestore && (
        <div className="ui-modal-overlay" onClick={() => {}}>
          <div className="ui-modal max-w-md" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-white font-semibold text-lg mb-2 flex items-center gap-2"><Cloud className="h-6 w-6 text-cyan-400" />Restore from your account?</h3>
            <p className="text-gray-400 text-sm mb-4">
              We found a saved backup in your cloud account
              {pendingCloudRestore.updatedAt && (
                <span> (last updated {new Date(pendingCloudRestore.updatedAt).toLocaleString()})</span>
              )}.
              This device already has data. Choose what to keep.
            </p>
            <div className="flex flex-col gap-2">
              <button
                type="button"
                className="w-full py-3 rounded-lg font-medium bg-cyan-600 hover:bg-cyan-500 text-white"
                onClick={() => resolveCloudRestore('cloud')}
              >
                Use cloud backup (replace this device)
              </button>
              <button
                type="button"
                className="w-full py-3 rounded-lg font-medium bg-white/10 hover:bg-white/15 text-gray-200"
                onClick={() => resolveCloudRestore('local')}
              >
                Keep this device &amp; upload to cloud (overwrite backup)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Low-vial popup — shows when returning to Summary tab so the user notices */}
      {showLowVialPopup && getLowVials().length > 0 && (
        <div className="ui-modal-overlay" onClick={() => setShowLowVialPopup(false)}>
          <div className="ui-modal max-w-sm" onClick={e => e.stopPropagation()}>
            <div className="flex items-start gap-3">
              <AlertCircle className="h-8 w-8 text-amber-400 flex-shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                <h3 className="text-amber-400 font-semibold text-base mb-2">Vial low — less than one dose left</h3>
                <ul className="text-gray-300 text-sm space-y-1 list-disc list-inside mb-4">
                  {getLowVials().map(v => {
                    const rem = (v.remainingMg ?? v.totalMg).toFixed(1);
                    const typical = getTypicalDoseMg(v.medication);
                    return <li key={v.id}>{v.medication}: {rem} mg left (your usual dose is ~{typical?.toFixed(1)} mg)</li>;
                  })}
                </ul>
                <div className="flex flex-col gap-2">
                  <button type="button" onClick={() => { setShowLowVialPopup(false); setActiveTab('more'); setActiveMoreSection('tools'); setActiveToolSection('vials'); }} className="w-full py-2.5 rounded-lg font-medium text-sm bg-amber-500/20 text-amber-400 border border-amber-500/40 hover:bg-amber-500/30">
                    Manage vials
                  </button>
                  <button type="button" onClick={() => setShowLowVialPopup(false)} className="w-full ui-btn-primary py-2.5 text-sm">
                    Got it
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes celebrate {
          0% { transform: scale(0) rotate(-180deg); opacity: 0; }
          50% { transform: scale(1.2) rotate(0deg); }
          100% { transform: scale(1) rotate(0deg); opacity: 1; }
        }
        .animate-celebrate { animation: celebrate 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55); }
        
        /* Legacy named actions inherit the new tactile button system. */
        .btn-primary {
          background: linear-gradient(135deg, #7cf7e4 0%, #4dd8c8 100%);
          color: #071612;
          box-shadow: 0 10px 30px -16px rgba(94, 234, 212, 0.8);
        }
        .btn-primary:hover {
          box-shadow: 0 14px 34px -16px rgba(94, 234, 212, 0.9);
        }
        .btn-primary:active {
          box-shadow: 0 6px 20px -12px rgba(94, 234, 212, 0.75);
        }
        
        .btn-secondary {
          background: linear-gradient(135deg, rgba(167,139,250,.22), rgba(94,234,212,.14));
          border: 1px solid rgba(167,139,250,.32);
          box-shadow: inset 0 1px 0 rgba(255,255,255,.08), 0 12px 30px -22px rgba(139,92,246,.8);
        }
        .btn-secondary:hover {
          border-color: rgba(167,139,250,.55);
          box-shadow: inset 0 1px 0 rgba(255,255,255,.1), 0 14px 34px -20px rgba(139,92,246,.9);
        }
        
        .btn-amber {
          background: linear-gradient(135deg, #e8b84c 0%, #c99b2e 100%);
          box-shadow: 0 4px 12px rgba(232, 184, 76, 0.3);
        }
        .btn-amber:hover {
          box-shadow: 0 6px 16px rgba(232, 184, 76, 0.4);
        }
        
        /* Card hover effects */
        .card-hover {
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .card-hover:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
        }
        
        /* Smooth tab transitions */
        .tab-enter { animation: tab-enter 0.3s ease-out; }
        @keyframes tab-enter {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        /* Alert slide in */
        .alert-enter {
          animation: alert-enter 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55);
        }
        @keyframes alert-enter {
          from { opacity: 0; transform: translateX(-100px); }
          to { opacity: 1; transform: translateX(0); }
        }
        
        /* Smooth dismiss animation */
        .alert-exit {
          animation: alert-exit 0.3s ease-in forwards;
        }
        @keyframes alert-exit {
          to { opacity: 0; transform: translateX(100px); }
        }
        
        /* Pulse animation for important elements */
        .pulse-glow {
          animation: pulse-glow 2s ease-in-out infinite;
        }
        @keyframes pulse-glow {
          0%, 100% { box-shadow: 0 0 0 0 rgba(139, 92, 246, 0.4); }
          50% { box-shadow: 0 0 20px 10px rgba(139, 92, 246, 0.2); }
        }
        
        /* Float animation for icons */
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        
        /* Injection reminder card — slide in + soft entrance */
        .animate-injection-reminder {
          animation: injection-reminder-in 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
        }
        @keyframes injection-reminder-in {
          from { opacity: 0; transform: translateY(-8px) scale(0.98); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        
        /* Bell icon subtle pulse on reminder card */
        .injection-reminder-bell {
          animation: injection-bell-pulse 2s ease-in-out infinite;
        }
        @keyframes injection-bell-pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.85; transform: scale(1.05); }
        }
        
        /* Header injection alert — soft border glow pulse */
        .injection-notify-pulse {
          animation: injection-notify-pulse 2.5s ease-in-out infinite;
        }
        @keyframes injection-notify-pulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(234, 179, 8, 0.2); }
          50% { box-shadow: 0 0 12px 2px rgba(234, 179, 8, 0.15); }
        }
        .injection-notify-pulse.ui-alert-danger {
          animation-name: injection-notify-pulse-danger;
        }
        @keyframes injection-notify-pulse-danger {
          0%, 100% { box-shadow: 0 0 0 0 rgba(248, 113, 113, 0.2); }
          50% { box-shadow: 0 0 12px 2px rgba(248, 113, 113, 0.2); }
        }
      `}</style>
      
      <div className="app-frame max-w-2xl mx-auto">
        <header className="app-header flex items-center justify-between gap-3 mb-5">
          <div className="flex items-center gap-3 min-w-0">
            <div className="brand-mark h-11 w-11 text-slate-950 flex items-center justify-center shrink-0">
              <Syringe className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <h1 className="text-[1.35rem] font-bold text-white tracking-tight">PepTalk</h1>
              <p className="page-context text-xs mt-0.5 font-medium">
                {activeTab === 'summary' ? 'Today' : activeTab === 'weight' ? 'Progress' : activeTab === 'protocols' ? 'Regimen' : activeTab === 'insights' ? 'Progress · analysis' : activeTab === 'injections' ? 'Dose history' : 'More'}
              </p>
            </div>
          </div>
          <div className={`status-pill h-9 px-3 flex items-center gap-2 text-[11px] font-semibold shrink-0 ${user ? 'status-pill--online' : ''}`}>
            <Cloud className="h-3.5 w-3.5" />{user ? 'Backed up' : 'On device'}
          </div>
        </header>

        {/* Upcoming Injections Alert — single box for all due/overdue */}
        {activeTab !== 'summary' && (() => {
          const dueOrOverdue = upcomingInjections.filter(inj => (inj.isDueToday || inj.isOverdue) && !dismissedAlerts.includes(`${inj.medication}-${inj.daysUntil}`));
          if (dueOrOverdue.length === 0) return null;
          const hasOverdue = dueOrOverdue.some(inj => inj.isOverdue);
          return (
            <div key="injection-alert" className={`alert-enter mb-3 ui-alert injection-notify-pulse ${hasOverdue ? 'ui-alert-danger' : 'ui-alert-warning'}`}>
              <Bell className={`h-5 w-5 shrink-0 ${hasOverdue ? 'text-red-400' : 'text-gold-400'}`} />
              <div className="flex-1 min-w-0">
                <div className={`font-semibold text-sm ${hasOverdue ? 'text-red-400' : 'text-gold-400'}`}>
                  {hasOverdue && dueOrOverdue.every(inj => inj.isOverdue) ? 'Injections Overdue' : dueOrOverdue.every(inj => inj.isDueToday) ? 'Injections Due Today' : 'Injections Due'}
                </div>
                <div className="text-white text-sm mt-0.5">
                  {dueOrOverdue.map((inj, i) => (
                    <span key={`${inj.medication}-${inj.daysUntil}`}>
                      {i > 0 && ', '}
                      {inj.medication}
                      {inj.isOverdue && ` (${Math.abs(inj.daysUntil)} day${Math.abs(inj.daysUntil) !== 1 ? 's' : ''} overdue)`}
                    </span>
                  ))}
                </div>
              </div>
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); setDismissedAlerts([...dismissedAlerts, ...dueOrOverdue.map(inj => `${inj.medication}-${inj.daysUntil}`)]); }}
                className="ui-btn-ghost p-2 rounded-lg"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          );
        })()}

        {/* SUMMARY TAB */}
        {(activeTab === 'summary' || activeTab === 'cycles') && (
          <div key="summary" className="space-y-4 tab-enter">
            {/* Today — the primary daily action surface */}
            <section className="ui-hero-panel overflow-hidden">
              <div className="ui-hero-panel__wash" aria-hidden />
              <div className="ui-hero-panel__top-bar" aria-hidden />
              <div className="ui-hero-panel__body">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-gold-400">Today</p>
                    <h2 className="mt-1 text-xl font-semibold text-white">
                      {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                    </h2>
                    <p className="mt-1 text-xs text-gray-500">Your full dose schedule, in time order.</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => { setActiveTab('weight'); setShowAddForm(true); }}
                    className="shrink-0 rounded-xl border border-white/[0.08] bg-white/[0.04] px-3 py-2 text-xs font-medium text-gray-300 hover:bg-white/[0.08]"
                  >
                    <Scale className="mr-1.5 inline h-3.5 w-3.5" />Log weight
                  </button>
                </div>

                {todayDoseRows.length > 0 ? (
                  <div className="mt-5 space-y-4">
                    {[
                      ['Morning', todayDoseRows.filter((row) => !['done', 'skipped'].includes(row.status) && Number(String(row.preferredTime || '09:00').split(':')[0]) < 12)],
                      ['Evening', todayDoseRows.filter((row) => !['done', 'skipped'].includes(row.status) && Number(String(row.preferredTime || '09:00').split(':')[0]) >= 12)],
                      ['Completed', todayDoseRows.filter((row) => ['done', 'skipped'].includes(row.status))],
                    ].filter(([, rows]) => rows.length > 0).map(([group, rows]) => (
                      <div key={group}>
                        <div className="mb-2 flex items-center justify-between"><p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-gray-500">{group}</p><span className="text-[10px] text-gray-600">{rows.length}</span></div>
                        <div className="space-y-2.5">
                          {rows.map((row) => {
                            const color = getMedicationColor(row.medication);
                            const isDone = row.status === 'done';
                            const isSkipped = row.status === 'skipped';
                            const isOverdue = row.status === 'overdue';
                            return (
                              <div key={`${row.medication}-${row.status}`} className={`rounded-2xl border p-3.5 transition-all ${isOverdue ? 'border-rose-400/25 bg-rose-500/[0.07]' : isDone ? 'border-emerald-400/15 bg-emerald-500/[0.05]' : isSkipped ? 'border-white/[0.05] bg-white/[0.025] opacity-70' : 'border-white/[0.07] bg-black/15'}`}>
                                <div className="flex items-center gap-3">
                                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl" style={{ backgroundColor: `${color}1f` }}>
                                    {isDone ? <CheckCircle className="h-5 w-5 text-emerald-400" /> : isSkipped ? <X className="h-5 w-5 text-gray-500" /> : <Syringe className="h-5 w-5" style={{ color }} />}
                                  </div>
                                  <div className="min-w-0 flex-1">
                                    <div className="flex items-center gap-2"><h3 className="truncate text-sm font-semibold text-white">{row.medication}</h3>{isOverdue && <span className="rounded-full bg-rose-500/15 px-2 py-0.5 text-[10px] font-semibold text-rose-300">Overdue</span>}{row.action?.status === 'later' && <span className="rounded-full bg-violet-500/15 px-2 py-0.5 text-[10px] font-semibold text-violet-300">Later</span>}</div>
                                    <p className="mt-0.5 text-xs font-medium text-gray-300">{formatTodayDose(row)}</p>
                                    <p className="mt-0.5 text-[11px] text-gray-500">{isDone ? `Taken ${formatDoseTime(row.entry?.time)}` : isSkipped ? 'Skipped today' : isOverdue ? `${row.overdueDays} day${row.overdueDays === 1 ? '' : 's'} late` : formatDoseTime(row.preferredTime)}</p>
                                  </div>
                                  {isDone ? <button type="button" onClick={() => openTodayDoseForm(row)} className="shrink-0 rounded-xl px-3 py-2 text-xs font-medium text-gray-400 hover:bg-white/[0.05] hover:text-white">Edit</button> : isSkipped ? <button type="button" onClick={() => setTodayDoseAction(row, null)} className="shrink-0 rounded-xl px-3 py-2 text-xs font-medium text-gray-400 hover:bg-white/[0.05] hover:text-white">Restore</button> : <button type="button" onClick={() => markTodayDoseTaken(row)} className="shrink-0 rounded-xl bg-accent px-3.5 py-2.5 text-xs font-bold text-slate-950 shadow-[0_5px_20px_rgba(45,212,191,.2)]">Taken</button>}
                                </div>
                                {!isDone && !isSkipped && <div className="mt-2.5 flex items-center gap-2 pl-[52px]"><button type="button" onClick={() => setTodayDoseAction(row, 'later')} className="text-[11px] font-medium text-violet-300 hover:text-violet-200">Take 1h later</button><span className="text-gray-700">•</span><button type="button" onClick={() => setTodayDoseAction(row, 'skipped')} className="text-[11px] font-medium text-gray-500 hover:text-gray-300">Skip today</button><span className="text-gray-700">•</span><button type="button" onClick={() => openTodayDoseForm(row)} className="text-[11px] font-medium text-gray-500 hover:text-gold-400">Details</button></div>}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="mt-5 rounded-2xl border border-green-400/15 bg-green-500/[0.05] p-4 text-center">
                    <CheckCircle className="mx-auto h-6 w-6 text-green-400" />
                    <p className="mt-2 text-sm font-semibold text-white">Nothing scheduled today</p>
                    <p className="mt-1 text-xs text-gray-500">Your next scheduled dose will appear here.</p>
                  </div>
                )}

                <button
                  type="button"
                  onClick={() => { setActiveTab('injections'); setShowAddForm(true); }}
                  className="mt-3 w-full rounded-xl border border-dashed border-white/[0.09] py-2.5 text-xs font-medium text-gray-500 hover:border-gold-400/30 hover:text-gold-400"
                >
                  <Plus className="mr-1.5 inline h-3.5 w-3.5" />Log an unscheduled dose
                </button>
                <button type="button" onClick={() => { setActiveTab('protocols'); setActiveMoreSection('tools'); setActiveToolSection('schedule'); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="mt-2 w-full py-2 text-xs font-medium text-gray-500 hover:text-gold-400">
                  Manage or add protocols
                </button>
              </div>
            </section>

            <section className="pt-today-quick grid grid-cols-2 gap-2">
              <button type="button" onClick={() => { setActiveTab('weight'); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="rounded-2xl border border-white/[0.07] bg-white/[0.025] p-3 text-left hover:bg-white/[0.05]">
                <span className="block text-[10px] font-semibold uppercase tracking-[0.15em] text-gray-500">Progress</span><span className="mt-1 block text-sm font-semibold text-white">Weight & check-ins</span>
              </button>
              <button type="button" onClick={() => { setActiveTab('protocols'); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="rounded-2xl border border-white/[0.07] bg-white/[0.025] p-3 text-left hover:bg-white/[0.05]">
                <span className="block text-[10px] font-semibold uppercase tracking-[0.15em] text-gray-500">Regimen</span><span className="mt-1 block text-sm font-semibold text-white">Manage protocols</span>
              </button>
            </section>

            <div className="pt-today-secondary space-y-4">
            {/* Time Range Selector */}
            <div className="ui-segmented">
              {[{ id: '1m', label: '1m' }, { id: '3m', label: '3m' }, { id: '6m', label: '6m' }, { id: '12m', label: '12m' }, { id: 'all', label: 'All' }].map(range => (
                <button
                  key={range.id}
                  onClick={() => setTimeRange(range.id)}
                  className={`ui-segmented-btn ${timeRange === range.id ? 'ui-segmented-btn-active' : ''}`}
                >
                  {range.label}
                </button>
              ))}
            </div>

            {/* Vial low — directly above Weight Change (single in-page warning) */}
            {vials.length > 0 && (() => {
              const low = vials.filter(v => {
                const rem = v.remainingMg ?? v.totalMg;
                if (rem <= 0) return false;
                const typical = getTypicalDoseMg(v.medication);
                return typical != null && rem < typical;
              });
              if (low.length === 0) return null;
              return (
                <div className="ui-card p-4 border-amber-500/30 bg-amber-500/10">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="h-5 w-5 text-amber-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <h3 className="text-amber-400 font-medium text-sm">Vial low — less than one dose left</h3>
                      <ul className="text-gray-300 text-xs mt-1 space-y-0.5 list-disc list-inside">
                        {low.map(v => {
                          const rem = (v.remainingMg ?? v.totalMg).toFixed(1);
                          const typical = getTypicalDoseMg(v.medication);
                          return <li key={v.id}>{v.medication}: {rem} mg left (your usual dose is ~{typical?.toFixed(1)} mg)</li>;
                        })}
                      </ul>
                      <button type="button" onClick={() => { setActiveTab('more'); setActiveMoreSection('tools'); setActiveToolSection('vials'); }} className="text-amber-400 hover:text-amber-300 text-xs mt-2 font-medium">Manage vials in More → Tools</button>
                    </div>
                  </div>
                </div>
              );
            })()}

            {/* Weight Change — one calm, readable snapshot */}
            <div className="ui-hero-panel overflow-hidden">
              <div className="ui-hero-panel__wash" aria-hidden />
              <div className="ui-hero-panel__top-bar" aria-hidden />
              <div className="ui-hero-panel__body">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-gray-500">Current weight</p>
                    <div className="mt-1 text-4xl font-semibold tracking-tight text-white">{stats.current}<span className="ml-1.5 text-base font-normal text-gray-500">lb</span></div>
                  </div>
                  <div className="text-right">
                    <span className={`inline-flex rounded-full px-3 py-1.5 text-sm font-semibold ${parseFloat(stats.change) < 0 ? 'bg-green-500/12 text-green-400' : parseFloat(stats.change) > 0 ? 'bg-red-500/12 text-red-400' : 'bg-white/[0.06] text-gray-300'}`}>
                      {parseFloat(stats.change) > 0 ? '+' : ''}{stats.change} lb
                    </span>
                    <p className="mt-1.5 text-[11px] text-gray-500">{getDateRangeLabel()}</p>
                  </div>
                </div>
                <div className="mt-5 grid grid-cols-3 divide-x divide-white/[0.07] border-t border-white/[0.07] pt-4">
                  <div className="pr-3">
                    <div className="text-[10px] uppercase tracking-wider text-gray-600">Weekly</div>
                    <div className={`mt-1 text-sm font-semibold ${parseFloat(stats.weeklyAvg) < 0 ? 'text-green-400' : parseFloat(stats.weeklyAvg) > 0 ? 'text-red-400' : 'text-white'}`}>{stats.weeklyAvg} <span className="text-[10px] font-normal text-gray-500">lb/wk</span></div>
                  </div>
                  <div className="px-3">
                    <div className="text-[10px] uppercase tracking-wider text-gray-600">Change</div>
                    <div className="mt-1 text-sm font-semibold text-white">{stats.percentChange}%</div>
                  </div>
                  <div className="pl-3">
                    <div className="text-[10px] uppercase tracking-wider text-gray-600">BMI</div>
                    <div className={`mt-1 text-sm font-semibold ${bmiCategory.color}`}>{stats.bmi || '—'}</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Weight chart — directly after Weight Change */}
            {weightEntries.length > 0 && (() => {
              const summaryData = getSummaryChartData(chartRangeWeeks);
              const pointCount = summaryData.length;
              const xInterval = pointCount > 12 ? Math.max(0, Math.floor(pointCount / 6)) : 0;
              const weightValues = summaryData.map(p => p.weight).filter(w => w != null && !isNaN(w));
              const wMin = weightValues.length ? Math.min(...weightValues) : 0;
              const wMax = weightValues.length ? Math.max(...weightValues) : 100;
              const yDomain = [Math.floor(wMin) - 2, Math.ceil(wMax) + 2];
              const trendPoints = summaryData.filter((point) => point.weightTrend != null);
              const lastTrendPoint = trendPoints[trendPoints.length - 1];
              const priorTrendPoint = trendPoints[Math.max(0, trendPoints.length - 8)];
              const weeklyTrendRate = lastTrendPoint && priorTrendPoint && lastTrendPoint !== priorTrendPoint
                ? lastTrendPoint.weightTrend - priorTrendPoint.weightTrend
                : null;
              const chartDayLabels = new Map(summaryData.map((point) => [point.fullDate, point.date]));
              const protocolEvents = schedules.flatMap((schedule) => {
                const events = schedule.changeLog?.length
                  ? schedule.changeLog
                  : schedule.startDate ? [{ date: schedule.startDate, type: 'started', label: `${schedule.medication} started` }] : [];
                return events.map((event) => ({ ...event, medication: schedule.medication }));
              }).filter((event) => chartDayLabels.has(toCalendarDay(event.date))).slice(-8);
              return (
              <div className="ui-hero-panel overflow-hidden relative z-10">
                <div className="ui-hero-panel__wash" aria-hidden />
                <div className="ui-hero-panel__top-bar" aria-hidden />
                <div className="relative">
                <div className="px-2 sm:px-3 pt-5 pb-1">
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
                    <div>
                      <h3 className="text-gray-200 text-sm font-semibold">Weight trend</h3>
                      {lastTrendPoint && <p className="mt-0.5 text-[11px] text-gray-500">7-day trend {lastTrendPoint.weightTrend.toFixed(1)} lb{weeklyTrendRate != null ? ` · ${weeklyTrendRate > 0 ? '+' : ''}${weeklyTrendRate.toFixed(1)} lb/week` : ''}</p>}
                    </div>
                    <div className="flex items-center gap-1">
                      {[4, 8, 12, 0].map((w) => (
                        <button
                          key={w || 'all'}
                          type="button"
                          onClick={() => setChartRangeWeeks(w)}
                          className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${chartRangeWeeks === w ? 'bg-accent/25 text-gold-400' : 'text-gray-500 hover:text-gray-300 hover:bg-white/5'}`}
                        >
                          {w === 0 ? 'All' : `${w}w`}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="-mx-1 sm:-mx-2 w-full">
                  <ResponsiveContainer width="100%" height={280}>
                    <ComposedChart data={summaryData} margin={{ top: 8, right: 8, left: 28, bottom: 4 }}>
                      <defs>
                        <linearGradient id="weightFill" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#e8b84c" stopOpacity={0.12} />
                          <stop offset="100%" stopColor="#e8b84c" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="0" stroke="#334155" vertical={false} strokeOpacity={0.4} />
                      <XAxis 
                        dataKey="date" 
                        axisLine={false} 
                        tickLine={false} 
                        stroke="#64748b" 
                        fontSize={11} 
                        tickMargin={8}
                        interval={xInterval}
                        minTickGap={pointCount > 14 ? 56 : pointCount > 8 ? 40 : 32}
                      />
                      <YAxis 
                        yAxisId="weight"
                        axisLine={false} 
                        tickLine={false} 
                        stroke="#64748b" 
                        fontSize={11} 
                        tickMargin={6}
                        width={32}
                        domain={yDomain}
                        tickFormatter={(v) => `${v}`}
                        allowDecimals={false}
                        tickCount={6}
                      />
                      {lastTrendPoint?.weightTrend != null && (
                        <ReferenceLine 
                          yAxisId="weight"
                          y={lastTrendPoint.weightTrend}
                          stroke="#e8b84c" 
                          strokeWidth={1}
                          strokeDasharray="4 4"
                          strokeOpacity={0.55}
                          label={({ viewBox }) => viewBox && (
                            <text x={viewBox.x + 2} y={viewBox.y + 14} fill="#e8b84c" fontSize={11} textAnchor="start" fontWeight={500}>
                              Trend {lastTrendPoint.weightTrend.toFixed(1)}
                            </text>
                          )}
                        />
                      )}
                      {protocolEvents.map((event, index) => (
                        <ReferenceLine
                          key={`${event.medication}-${event.date}-${index}`}
                          yAxisId="weight"
                          x={chartDayLabels.get(toCalendarDay(event.date))}
                          stroke="#a78bfa"
                          strokeWidth={1}
                          strokeDasharray="2 4"
                          strokeOpacity={0.45}
                          label={{ value: index === protocolEvents.length - 1 ? 'Protocol' : '', position: 'insideTopRight', fill: '#a78bfa', fontSize: 9 }}
                        />
                      ))}
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'rgba(24, 24, 28, 0.96)', 
                          border: '1px solid rgba(255,255,255,0.1)', 
                          borderRadius: '10px', 
                          padding: '10px 14px',
                          boxShadow: '0 10px 40px rgba(0,0,0,0.3)'
                        }} 
                        labelStyle={{ color: '#94a3b8', fontSize: 12 }}
                        formatter={(value, name) => { 
                          if (value == null) return null; 
                          if (name === 'Weight') return [value, 'Weight (lbs)'];
                          if (name === '7-day average') return [value?.toFixed?.(1) ?? value, '7-day avg (lbs)'];
                          return [value, name]; 
                        }} 
                        labelFormatter={(label) => label}
                        content={({ active, payload, label }) => {
                          if (!active || !payload?.length) return null;
                          const p = payload[0]?.payload;
                          return (
                            <div className="rounded-lg bg-[var(--bg-elevated)] border border-white/10 px-3 py-2 shadow-xl min-w-[160px]">
                              <div className="text-gray-300 text-sm font-medium mb-1.5">{label}</div>
                              {p?.weight != null && <div className="text-white text-sm">Weight: {p.weight} lbs</div>}
                              {p?.weightTrend != null && <div className="text-gray-400 text-xs">7-day avg: {p.weightTrend.toFixed(1)} lbs</div>}
                              {p?.injections?.length > 0 && (
                                <div className="mt-2 pt-2 border-t border-slate-600/50">
                                  <div className="text-green-500 text-xs font-medium mb-1">Injections</div>
                                  {p.injections.map((inj, i) => (
                                    <div key={i} className="text-gray-200 text-xs">{inj.type} {inj.dose}{inj.unit}{(inj.route || inj.site) && <span className="text-gray-500"> · {[inj.route, inj.site].filter(Boolean).join(' ')}</span>}</div>
                                  ))}
                                </div>
                              )}
                            </div>
                          );
                        }}
                      />
                      {weightGraphMode !== 'trend' && (
                        <Area 
                          yAxisId="weight" 
                          type="monotone" 
                          dataKey="weight" 
                          fill="url(#weightFill)" 
                          stroke="none" 
                          isAnimationActive={true}
                          connectNulls={false}
                        />
                      )}
                      {weightGraphMode !== 'trend' && (
                        <Line 
                          yAxisId="weight" 
                          type="monotone" 
                          dataKey="weight" 
                          stroke="#94a3b8"
                          strokeOpacity={0.5}
                          strokeWidth={1.25}
                          dot={({ cx, cy, payload }) => {
                            if (payload.weight == null || chartRangeWeeks === 0) return null;
                            return (
                              <circle 
                                cx={cx} 
                                cy={cy} 
                                r={payload.hasInjection ? 2 : 1.25}
                                fill={payload.hasInjection ? '#101722' : '#94a3b8'}
                                stroke={payload.hasInjection ? '#34d399' : '#94a3b8'}
                                strokeWidth={payload.hasInjection ? 0.75 : 0}
                              />
                            );
                          }}
                          activeDot={{ r: 3, stroke: '#94a3b8', strokeWidth: 1, fill: '#101722' }}
                          connectNulls={false}
                          name="Weight"
                        />
                      )}
                      {weightGraphMode !== 'actual' && (
                        <Line 
                          yAxisId="weight" 
                          type="monotone" 
                          dataKey="weightTrend" 
                          stroke="#5EEAD4"
                          strokeWidth={4.5}
                          dot={false} 
                          connectNulls={false}
                          name="7-day average"
                        />
                      )}
                    </ComposedChart>
                  </ResponsiveContainer>
                </div>
                <div className="px-2 sm:px-3 pb-1">
                  <div className="flex flex-col items-center gap-2 mt-3 pt-3 border-t border-white/[0.04]">
                    <div className="inline-flex rounded-xl border border-white/[0.07] bg-black/15 p-1">
                      {[['trend', 'Trend'], ['actual', 'Actual'], ['both', 'Both']].map(([mode, label]) => (
                        <button key={mode} type="button" onClick={() => setWeightGraphMode(mode)} className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${weightGraphMode === mode ? 'bg-gold-400/15 text-gold-300' : 'text-gray-500 hover:text-gray-300'}`}>{label}</button>
                      ))}
                    </div>
                    <p className="text-center text-[11px] text-gray-500">Mint = 7-day trend · gray = readings · purple = protocol change · green ring = injection day</p>
                    {protocolEvents.length > 0 && (
                      <div className="flex max-w-full flex-wrap justify-center gap-1.5">
                        {protocolEvents.slice(-4).map((event, index) => <span key={`${event.date}-${event.medication}-${index}`} className="rounded-full bg-violet-400/10 px-2 py-1 text-[10px] text-violet-300">{event.medication}: {event.label}</span>)}
                      </div>
                    )}
                  </div>
                </div>
                </div>
              </div>
              );
            })()}

            {/* Week in review + protocol snapshot */}
            {(() => {
              const d = getWeeklyDigest();
              return (
                <div className="ui-card overflow-hidden border-accent/20">
                  <div className="border-b border-white/[0.06] bg-gradient-to-r from-accent/[0.09] to-violet-500/[0.07] p-4">
                    <div className="flex items-center justify-between gap-3"><div><h3 className="text-white text-sm font-semibold flex items-center gap-2"><Calendar className="h-4 w-4 text-gold-400" />Weekly review</h3><p className="mt-1 text-[11px] text-gray-500">Your progress and protocol consistency at a glance.</p></div><button type="button" onClick={() => setActiveTab('insights')} className="rounded-xl border border-white/[0.08] bg-white/[0.04] px-3 py-2 text-[11px] font-medium text-gray-300">Full insights</button></div>
                  </div>
                  <div className="grid grid-cols-3 gap-2 p-4">
                    <div className="rounded-2xl border border-white/[0.06] bg-black/15 p-3"><Scale className="h-4 w-4 text-cyan-300" /><div className="mt-2 text-lg font-semibold text-white">{d.weightStr}</div><div className="mt-0.5 text-[10px] uppercase tracking-wider text-gray-600">Weight</div></div>
                    <div className="rounded-2xl border border-white/[0.06] bg-black/15 p-3"><Syringe className="h-4 w-4 text-violet-300" /><div className="mt-2 text-lg font-semibold text-white">{d.injStr}</div><div className="mt-0.5 text-[10px] uppercase tracking-wider text-gray-600">Doses</div></div>
                    <div className="rounded-2xl border border-white/[0.06] bg-black/15 p-3"><Droplets className="h-4 w-4 text-sky-300" /><div className="mt-2 text-lg font-semibold text-white">{d.hydrationStr.split(' ')[0]}</div><div className="mt-0.5 text-[10px] uppercase tracking-wider text-gray-600">Hydrated</div></div>
                  </div>
                  <div className="px-4 pb-3"><div className="flex flex-wrap gap-1.5">{schedules.filter((schedule) => !schedule.paused).slice(0, 6).map((schedule) => <span key={schedule.id} className="rounded-full border border-white/[0.06] bg-white/[0.03] px-2 py-1 text-[10px] text-gray-400">{schedule.medication}</span>)}</div></div>
                  <p className="mx-4 mb-4 text-gray-500 text-[11px] leading-relaxed border-t border-white/[0.06] pt-3">
                    <span className="text-gray-400 font-medium">At a glance: </span>
                    {d.labsInWeek} lab entr{d.labsInWeek === 1 ? 'y' : 'ies'}
                    {d.sleepNights > 0 ? ` · ~${d.avgSleepHours}h sleep avg (${d.sleepNights} night${d.sleepNights !== 1 ? 's' : ''})` : ''}
                    {d.stepsDays > 0 ? ` · ${d.stepsSum.toLocaleString()} steps logged (${d.stepsDays} day${d.stepsDays !== 1 ? 's' : ''})` : ''}
                    {d.injWithFx > 0 ? ` · ${d.injWithFx} injection${d.injWithFx !== 1 ? 's' : ''} with side effects noted` : ''}.
                  </p>
                </div>
              );
            })()}

            {/* Hydration goal progress — always show; default goal 64 oz if not set */}
            {(() => {
              const goal = Number(userProfile?.hydrationGoalOz) || 64;
              const current = Math.round(hydrationToday);
              const pct = goal > 0 ? Math.min(100, (current / goal) * 100) : 0;
              return (
                <div className="ui-card p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-gray-400 text-sm flex items-center gap-1.5"><Droplet className="h-4 w-4 text-sky-400" />Hydration today</span>
                    <span className="text-white font-medium">{current} / {goal} oz</span>
                  </div>
                  <div className="h-2 rounded-full bg-white/10 overflow-hidden">
                    <div className="h-full rounded-full bg-sky-500/90 transition-all duration-500" style={{ width: `${pct}%` }} />
                  </div>
                  <div className="flex items-center justify-between mt-2 gap-2">
                    {goal > 0 && (
                      <div className="flex gap-1.5">
                        <button type="button" onClick={() => addQuickWater(8)} className="px-2.5 py-1 rounded-lg bg-sky-500/20 text-sky-400 hover:bg-sky-500/30 text-xs font-medium">
                          +8 oz
                        </button>
                        <button type="button" onClick={() => addQuickWater(16)} className="px-2.5 py-1 rounded-lg bg-sky-500/20 text-sky-400 hover:bg-sky-500/30 text-xs font-medium">
                          +16 oz
                        </button>
                      </div>
                    )}
                    <button type="button" onClick={() => { setActiveTab('more'); setActiveMoreSection('profile'); }} className="text-gray-500 hover:text-gold-400 text-xs ml-auto">
                      Edit target
                    </button>
                  </div>
                </div>
              );
            })()}

            {/* Logging streak */}
            {(() => {
              const streak = getLoggingStreak();
              if (streak.daysLoggedLast7 === 0 && streak.weeksInRow === 0) return null;
              return (
                <div className="text-gray-400 text-xs">
                  {streak.daysLoggedLast7 > 0 && <span>Logged weight {streak.daysLoggedLast7} of last 7 days</span>}
                  {streak.weeksInRow > 0 && streak.daysLoggedLast7 > 0 && ' · '}
                  {streak.weeksInRow > 0 && <span>{streak.weeksInRow} week{streak.weeksInRow !== 1 ? 's' : ''} in a row</span>}
                </div>
              );
            })()}

            {/* Dashboard phase line: current phase for all active meds */}
            {getMedicationInsights().length > 0 && (() => {
              const insights = getMedicationInsights().filter(i => i.phase);
              if (insights.length === 0) return null;
              return (
                <div className="ui-card p-3 space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-gray-400 text-sm">Current phase</span>
                    <button type="button" onClick={() => setActiveTab('insights')} className="text-gold-400 hover:text-gold-300 text-xs font-medium">View Insights</button>
                  </div>
                  <div className="flex flex-wrap gap-x-3 gap-y-1.5">
                    {insights.map(insight => (
                      <span key={insight.medication} className="text-sm">
                        <span className={`font-semibold ${insight.phaseColor}`}>{insight.phase}</span>
                        <span className="text-gray-400"> for {insight.medication}</span>
                      </span>
                    ))}
                  </div>
                </div>
              );
            })()}

            {/* Your vials — remaining volume on Summary */}
            {vials.length > 0 && (
              <div className="ui-hero-panel">
                <div className="ui-hero-panel__wash" aria-hidden />
                <div className="ui-hero-panel__top-bar" aria-hidden />
                <div className="ui-hero-panel__body">
                <h3 className="text-white font-medium text-sm mb-2 flex items-center gap-2"><Syringe className="h-4 w-4 text-gold-400" />Your vials</h3>
                <div className="space-y-2">
                  {vials.map(v => {
                    const remMg = v.remainingMg ?? v.totalMg;
                    const totalMg = v.totalMg;
                    const conc = v.concentration;
                    const remMl = conc > 0 ? remMg / conc : null;
                    const totalMl = conc > 0 ? totalMg / conc : null;
                    const isLow = remMg <= 0;
                    const forecast = getVialForecast(v);
                    return (
                      <div key={v.id} className={`flex justify-between items-center py-2 px-3 rounded-lg text-sm ${isLow ? 'bg-slate-700/50 opacity-70' : 'bg-slate-700/30'}`}>
                        <span className="text-white font-medium">{v.medication}</span>
                        <span className="text-gray-400">
                          {remMg.toFixed(1)} / {totalMg.toFixed(1)} mg
                          {conc > 0 && remMl != null && totalMl != null && <span className="text-gray-500 ml-1">· {remMl.toFixed(1)} / {totalMl.toFixed(1)} ml</span>}
                          {forecast && <span className="block text-[10px] text-gold-400/80">~{forecast.dosesRemaining} doses · through {parseLocalDate(forecast.through).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>}
                        </span>
                      </div>
                    );
                  })}
                </div>
                <button type="button" onClick={() => { setActiveTab('more'); setActiveMoreSection('tools'); setActiveToolSection('vials'); }} className="text-gray-500 hover:text-gold-400 text-xs mt-2">Add or edit in More → Tools → Vials</button>
                </div>
              </div>
            )}

            {/* Progress + comparison section in a responsive grid */}
            <div className="grid gap-4 md:grid-cols-2">
              {/* On track? — compare to typical GLP-1 loss */}
              {getOnTrackInfo() && (
                <div className="ui-card p-4">
                  <h3 className="text-white font-semibold mb-3 flex items-center gap-2"><Activity className="h-4 w-4 text-gold-400" />On track?</h3>
                  {(() => {
                    const info = getOnTrackInfo();
                    const statusMsg = info.status === 'ahead' ? "You're ahead of typical loss — great progress." : info.status === 'slower' ? "You're losing slower than average. Normal early on or at lower doses." : "Your loss is in line with typical results for your medication.";
                    const statusColor = info.status === 'ahead' ? 'text-green-500' : info.status === 'slower' ? 'text-gold-400' : 'text-green-500';
                    const paceTargets = getPaceTargets();
                    return (
                      <div className="space-y-2">
                        <p className="text-gray-300 text-sm">On {info.med} {info.dose}, people typically lose about <strong className="text-white">{info.typical} lb/week</strong>. You're averaging <strong className="text-white">{info.userLoss.toFixed(1)} lb/week</strong>.</p>
                        <p className={`text-sm font-medium ${statusColor}`}>{statusMsg}</p>
                        {info.daysOnMed && (
                          <p className="text-gray-400 text-xs">
                            On this medication for <span className="text-gray-200 font-medium">{info.daysOnMed} day{info.daysOnMed !== 1 ? 's' : ''}</span>.
                          </p>
                        )}
                        {paceTargets.length > 0 && info.userLoss > 0 && (
                          <div className="pt-1 border-t border-white/[0.06] mt-2">
                            <p className="text-gray-400 text-[11px] mb-1 font-medium">At this pace:</p>
                            <ul className="space-y-0.5 text-[11px]">
                              {paceTargets.map((target, idx) => {
                                const weeksTo = target.achieved || target.toGo <= 0 ? 0 : target.toGo / info.userLoss;
                                const isAchieved = target.achieved || target.toGo <= 0;
                                const daysTo = Math.max(1, Math.round(weeksTo * 7));
                                const etaText = isAchieved
                                  ? 'reached'
                                  : weeksTo < 1
                                    ? `${daysTo} day${daysTo !== 1 ? 's' : ''}`
                                    : `${weeksTo.toFixed(1)} week${weeksTo >= 2 ? 's' : ''}`;
                                return (
                                  <li key={idx} className="flex items-center gap-2">
                                    {isAchieved ? (
                                      <CheckCircle className="h-3 w-3 text-green-500 flex-shrink-0" />
                                    ) : (
                                      <span className="w-3 h-3 rounded-full border border-gray-500 flex-shrink-0" />
                                    )}
                                    <span className={`flex-1 ${isAchieved ? 'text-gray-500 line-through' : 'text-gray-300'}`}>
                                      {target.label}
                                    </span>
                                    <span className={`text-right ${isAchieved ? 'text-green-500' : 'text-gray-400'}`}>
                                      {isAchieved ? 'reached' : `~${etaText}`}
                                    </span>
                                  </li>
                                );
                              })}
                            </ul>
                          </div>
                        )}
                      </div>
                    );
                  })()}
                </div>
              )}

              {/* Your loss vs typical — cumulative weight loss chart (full width on md+) */}
              {getYouVsTypicalChartData().length > 0 && (
                <div className="ui-card overflow-hidden md:col-span-2">
                  <div className="px-5 pt-5 pb-1">
                    <h3 className="text-gray-300 text-sm font-medium mb-1">Your loss vs typical</h3>
                    <p className="text-gray-500 text-xs mb-4">Cumulative lbs lost: you vs average for your medication at your dose (clinical trials).</p>
                    <ResponsiveContainer width="100%" height={220}>
                      <ComposedChart data={getYouVsTypicalChartData()} margin={{ top: 8, right: 16, left: 8, bottom: 4 }}>
                        <CartesianGrid strokeDasharray="0" stroke="#334155" vertical={false} strokeOpacity={0.4} />
                        <XAxis dataKey="weekLabel" axisLine={false} tickLine={false} stroke="#64748b" fontSize={11} tickMargin={8} interval="preserveStartEnd" minTickGap={24} />
                        <YAxis axisLine={false} tickLine={false} stroke="#64748b" fontSize={11} tickMargin={8} width={32} domain={[0, 'auto']} tickFormatter={(v) => `${v}`} />
                        <Tooltip contentStyle={{ backgroundColor: 'rgba(24, 24, 28, 0.96)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', padding: '8px 12px' }} labelStyle={{ color: '#94a3b8', fontSize: 12 }} formatter={(value) => [value != null ? value.toFixed(1) : '-', '']} labelFormatter={(label, payload) => payload?.[0]?.payload?.weekLabel ? `${payload[0].payload.weekLabel} — You: ${(payload[0].payload.userLoss ?? 0).toFixed(1)} lb, Typical: ${(payload[0].payload.typicalLoss ?? 0).toFixed(1)} lb` : label} />
                        <Line type="monotone" dataKey="userLoss" name="You" stroke="#e8b84c" strokeWidth={2.5} dot={{ fill: '#e8b84c', r: 3 }} connectNulls />
                        <Line type="monotone" dataKey="typicalLoss" name="Typical" stroke="#64748b" strokeWidth={2} strokeDasharray="4 4" dot={{ fill: '#64748b', r: 2 }} connectNulls />
                        <Legend wrapperStyle={{ fontSize: 11 }} formatter={(value) => <span className="text-gray-300">{value}</span>} />
                      </ComposedChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              )}

              {/* Upcoming Injections (full width on md+) */}
              {upcomingInjections.length > 0 && (
                <div className="ui-card p-4 md:col-span-2">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-white font-semibold flex items-center gap-2"><Bell className="h-4 w-4 text-gold-400" />Upcoming Injections</h3>
                    <button type="button" onClick={() => { setActiveTab('more'); setActiveMoreSection('tools'); setActiveToolSection('notifications'); }} className="text-gold-400 hover:text-gold-300 text-xs font-medium flex items-center gap-1">
                      <Bell className="h-3.5 w-3" />Remind me
                    </button>
                  </div>
                  <div className="space-y-2">
                    {upcomingInjections.slice(0, 3).map((inj, idx) => {
                      const suggestedSite = getSuggestedInjectionSite(inj.medication);
                      return (
                        <div key={idx} className="rounded-lg p-3 ui-card-inner space-y-1">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="p-2 rounded-lg" style={{ backgroundColor: `${getMedicationColor(inj.medication)}20` }}>
                                <Syringe className="h-4 w-4" style={{ color: getMedicationColor(inj.medication) }} />
                              </div>
                              <span className="text-white">{inj.medication}</span>
                            </div>
                            <div className={`text-sm font-medium ${inj.isOverdue ? 'text-red-400' : inj.isDueToday ? 'text-gold-400' : 'text-gray-400'}`}>
                              {inj.isOverdue
                                ? `${Math.abs(inj.daysUntil)} ${Math.abs(inj.daysUntil) === 1 ? 'day' : 'days'} overdue`
                                : inj.isDueToday
                                  ? 'Due today'
                                  : inj.daysUntil === 1
                                    ? 'Tomorrow'
                                    : `In ${inj.daysUntil} days`}
                            </div>
                          </div>
                          {suggestedSite && (
                            <p className="text-gray-500 text-xs pl-11">Suggested site: <span className="text-gold-400">{suggestedSite}</span></p>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Last Dose vs Recommended - GLP-1 Titration Tracking */}
            {titrationPlans.filter(p => {
              const med = MEDICATIONS.find(m => m.name === p.medication);
              return med && (med.category === 'GLP-1' || med.category === 'GLP-1/GIP' || med.category === 'Triple Agonist');
            }).length > 0 && (
              <div className="ui-card p-4 border-accent/20 bg-accent/5">
                <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
                  <Activity className="h-4 w-4 text-violet-400" />
                  Dose Tracking
                </h3>
                {titrationPlans.filter(p => {
                  const med = MEDICATIONS.find(m => m.name === p.medication);
                  return med && (med.category === 'GLP-1' || med.category === 'GLP-1/GIP' || med.category === 'Triple Agonist');
                }).map(plan => {
                  const current = getCurrentTitrationDose(plan);
                  if (!current) return null;
                  
                  // Get last actual injection
                  const lastInjection = injectionEntries
                    .filter(inj => inj.type === plan.medication)
                    .sort((a, b) => parseLocalDate(b.date) - parseLocalDate(a.date))[0];
                  
                  if (!lastInjection) return null;
                  
                  // Compare last injection to recommended dose
                  const lastDose = parseFloat(lastInjection.dose);
                  const recommendedDose = parseFloat(current.dose);
                  const isOnTrack = lastDose === recommendedDose;
                  const isBehind = lastDose < recommendedDose;
                  const isAhead = lastDose > recommendedDose;
                  
                  return (
                    <div key={plan.id} className="rounded-xl p-3 mb-2 border border-white/[0.06] bg-[var(--bg-card)]">
                      <div className="text-white font-medium mb-3">{plan.medication}</div>
                      
                      <div className="grid grid-cols-2 gap-3 mb-3">
                        {/* Last Dose Taken */}
                        <div className="bg-slate-700/50 rounded-lg p-3">
                          <div className="text-gray-400 text-xs mb-1">Last Dose Taken</div>
                          <div className="text-2xl font-bold text-gold-400">
                            {lastInjection.dose}{lastInjection.unit}
                          </div>
                          <div className="text-gray-500 text-xs mt-1">
                            {new Date(parseLocalDate(lastInjection.date)).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                          </div>
                        </div>
                        
                        {/* Recommended Dose */}
                        <div className="bg-slate-700/50 rounded-lg p-3">
                          <div className="text-gray-400 text-xs mb-1">Recommended Dose</div>
                          <div className="text-2xl font-bold text-violet-400">
                            {current.dose}{current.unit}
                          </div>
                          <div className="text-gray-500 text-xs mt-1">
                            Step {current.step} of {plan.steps.length}
                          </div>
                        </div>
                      </div>
                      
                      {/* Status - Clickable when behind schedule */}
                      {isBehind ? (
                        <button
                          onClick={() => {
                            setActiveTab('more');
                            setActiveMoreSection('tools');
                            setActiveToolSection('titration');
                          }}
                          className="w-full rounded-lg p-3 text-center text-sm bg-accent/20 text-gold-400 hover:bg-accent/30 transition-colors border border-accent/30"
                        >
                          <div className="font-medium">Ready to increase?</div>
                          <div className="text-xs mt-1">Plan next dose at {current.dose}{current.unit}</div>
                          <div className="text-xs text-gold-400/70 mt-1">Tap to view titration plan →</div>
                        </button>
                      ) : (
                        <div className={`rounded-lg p-2 text-center text-sm ${
                          isOnTrack ? 'bg-green-500/20 text-green-500' : 
                          'bg-accent/20 text-gold-400'
                        }`}>
                          {isOnTrack && '✓ On Track - Taking recommended dose'}
                          {isAhead && `Ahead of schedule - Currently at ${lastDose}${lastInjection.unit}`}
                        </div>
                      )}
                      
                      {/* Next Step Preview */}
                      {current.nextDose && !current.completed && (
                        <div className="mt-2 text-xs text-gray-400 text-center">
                          Next: {current.nextDose.dose}{current.nextDose.unit} in {current.weeksRemaining} weeks
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {/* Titration Progress */}
            {titrationPlans.length > 0 && (
              <div className="ui-card p-4">
                <h3 className="text-white font-medium mb-3 flex items-center gap-2"><TrendingUp className="h-4 w-4 text-violet-400" />Titration Progress</h3>
                {titrationPlans.map(plan => {
                  const current = getCurrentTitrationDose(plan);
                  if (!current) return null;
                  return (
                    <div key={plan.id} className="rounded-xl p-3 mb-2 border border-white/[0.04] bg-slate-700/40">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-white font-medium">{plan.medication}</span>
                        {current.completed && <span className="text-xs bg-green-500/20 text-green-500 px-2 py-1 rounded">Complete</span>}
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="text-2xl font-bold" style={{ color: getMedicationColor(plan.medication) }}>{current.dose}{current.unit}</div>
                        {current.nextDose && <span className="text-gray-400 text-sm">→ {current.nextDose.dose}{current.nextDose.unit} in {current.weeksRemaining} weeks</span>}
                      </div>
                      <div className="mt-2 bg-slate-600 rounded-full h-2">
                        <div className="h-2 rounded-full bg-accent" style={{ width: `${(current.step / plan.steps.length) * 100}%` }}></div>
                      </div>
                      <div className="text-gray-400 text-xs mt-1">Step {current.step} of {plan.steps.length}</div>
                    </div>
                  );
                })}
              </div>
            )}

            </div>
          </div>
        )}

        {/* INSIGHTS TAB */}
        {activeTab === 'insights' && (
          <div key="insights" className="space-y-4 tab-enter">
            <div className="flex items-end justify-between gap-3 pb-1">
              {insightsExpandedMed ? (
                <button type="button" onClick={() => setInsightsExpandedMed(null)} className="inline-flex items-center gap-2 text-left text-sm font-medium text-gray-300 hover:text-white">
                  <ChevronLeft className="h-4 w-4" />
                  All active stacks
                </button>
              ) : (
                <div>
                  <button type="button" onClick={() => setActiveTab('weight')} className="mb-2 inline-flex items-center gap-1 text-xs font-semibold text-violet-300 hover:text-violet-200">
                    <ChevronLeft className="h-3.5 w-3.5" /> Progress
                  </button>
                  <h2 className="text-xl font-bold text-white tracking-tight">Advanced analysis</h2>
                  <p className="text-gray-500 text-xs mt-1">Tap a stack for levels, phase, protocol, and dose history.</p>
                </div>
              )}
              {!insightsExpandedMed && <span className="rounded-full bg-white/[0.05] px-2.5 py-1 text-xs text-gray-400">{activeMedicationInsights.length} active</span>}
            </div>

            {!insightsExpandedMed && inactiveMedicationInsights.length > 0 && (
              <div className="ui-card p-3">
                <div className="flex items-center justify-between gap-3 mb-2">
                  <div>
                    <h3 className="text-sm font-semibold text-gray-200">Inactive stacks</h3>
                    <p className="text-[11px] text-gray-500">Hidden only—dose history is still saved.</p>
                  </div>
                  <span className="text-xs text-gray-500">{inactiveMedicationInsights.length}</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {inactiveMedicationInsights.map((insight) => (
                    <button key={insight.medication} type="button" onClick={() => setInsightMedicationInactive(insight.medication, false)} className="rounded-lg border border-white/[0.07] bg-white/[0.03] px-2.5 py-1.5 text-[11px] text-gray-400 hover:text-white">
                      Restore {insight.medication}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {false && (() => {
              const cutoff = new Date();
              cutoff.setDate(cutoff.getDate() - 30);
              const recent = injectionEntries.filter((e) => parseLocalDate(e.date) >= cutoff);
              const agg = {};
              recent.forEach((inj) => {
                (inj.sideEffects || []).forEach((fx) => {
                  const sev = inj.sideEffectSeverity?.[fx] ?? 3;
                  if (!agg[fx]) agg[fx] = { sum: 0, n: 0 };
                  agg[fx].sum += sev;
                  agg[fx].n += 1;
                });
              });
              const rows = Object.entries(agg)
                .map(([fx, v]) => ({ fx, avg: Math.round((v.sum / v.n) * 10) / 10, n: v.n }))
                .sort((a, b) => b.avg - a.avg);
              if (rows.length === 0) return null;
              return (
                <div className="ui-card p-4">
                  <h3 className="text-white font-semibold text-sm mb-2">Side effect intensity (last 30 days)</h3>
                  <p className="text-gray-500 text-xs mb-3">Averages of the 1–5 scores you logged with each injection.</p>
                  <div className="space-y-2">
                    {rows.map((r) => (
                      <div key={r.fx} className="flex items-center gap-3 text-sm">
                        <span className="text-gray-300 flex-1 min-w-0 truncate">{r.fx}</span>
                        <div className="flex-1 h-2 rounded-full bg-white/10 overflow-hidden max-w-[120px]">
                          <div className="h-full rounded-full bg-orange-500/70" style={{ width: `${(r.avg / 5) * 100}%` }} />
                        </div>
                        <span className="text-orange-300 text-xs w-[4.5rem] text-right shrink-0">{r.avg}/5 · {r.n}×</span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })()}
            {/* Single unified graph: estimated medication levels from half-life (all peptides/hormones) */}
            {false && getMedicationInsights().length > 0 && (() => {
              const { data: unifiedData, medications: unifiedMeds } = getUnifiedMedicationLevelChartData();
              if (unifiedData.length === 0) return null;
              const visibleMeds = unifiedMeds.filter(med => !insightsChartHiddenMeds.has(med.name));
              const dataMax = unifiedData.reduce((m, row) => {
                visibleMeds.forEach(med => { const v = row[med.name]; if (v != null && v > m) m = v; });
                return m;
              }, 0);
              const yMax = Math.max(200, Math.ceil((dataMax * 1.12) / 50) * 50);
              const yTicks = [];
              for (let t = 0; t <= yMax; t += (yMax <= 300 ? 50 : yMax <= 500 ? 100 : 200)) yTicks.push(t);
              if (yTicks[yTicks.length - 1] < yMax) yTicks.push(yMax);
              const toggleMedVisibility = (medName) => {
                setInsightsChartHiddenMeds(prev => {
                  const next = new Set(prev);
                  if (next.has(medName)) next.delete(medName);
                  else next.add(medName);
                  return next;
                });
              };
              return (
                <div className="ui-hero-panel relative z-30 overflow-visible">
                  <div className="ui-hero-panel__wash" aria-hidden />
                  <div className="ui-hero-panel__top-bar" aria-hidden />
                  <div className="relative p-4">
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-1">
                    <h3 className="text-white font-semibold text-sm">Estimated medication levels</h3>
                    <div className="flex rounded-lg bg-white/[0.06] p-0.5">
                      {[{ id: '1w', label: 'Week' }, { id: '1m', label: 'Month' }, { id: '3m', label: '3 mo' }, { id: 'all', label: 'All' }].map(({ id, label }) => (
                        <button key={id} type="button" onClick={() => setInsightsChartRange(id)} className={`px-2.5 py-1 text-[11px] rounded-md transition-colors ${insightsChartRange === id ? 'bg-white/15 text-white font-medium' : 'text-gray-400 hover:text-gray-300'}`}>{label}</button>
                      ))}
                    </div>
                  </div>
                  <p className="text-gray-500 text-xs mb-2">Half-life model from logged doses. Hover for dose & phase · tap a medication below to show/hide.</p>
                  <div className="insights-level-chart overflow-visible relative">
                  <ResponsiveContainer width="100%" height={280} className="!overflow-visible">
                    <ComposedChart data={unifiedData} margin={{ top: 20, right: 12, left: 4, bottom: 24 }}>
                      <defs>
                        {visibleMeds.map(med => (
                          <linearGradient key={med.name} id={`area-${med.name.replace(/\s/g, '')}`} x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor={med.color} stopOpacity={0.45} />
                            <stop offset="100%" stopColor={med.color} stopOpacity={0.08} />
                          </linearGradient>
                        ))}
                      </defs>
                      <CartesianGrid stroke="#64748b" strokeOpacity={0.18} vertical={true} horizontal={true} strokeDasharray="2 4" />
                      <ReferenceLine y={100} stroke="#94a3b8" strokeOpacity={0.35} strokeDasharray="4 4" />
                      <XAxis
                        dataKey="timestamp"
                        type="number"
                        domain={unifiedData.length ? [unifiedData[0].timestamp, unifiedData[unifiedData.length - 1].timestamp] : undefined}
                        tickCount={14}
                        stroke="#94a3b8"
                        fontSize={11}
                        tickMargin={8}
                        tickLine={false}
                        axisLine={{ stroke: '#334155', strokeOpacity: 0.5 }}
                        tickFormatter={(ts) => new Date(ts).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      />
                      <YAxis stroke="#64748b" fontSize={10} tickFormatter={(v) => `${v}%`} domain={[0, yMax]} ticks={yTicks} width={36} tickLine={false} axisLine={false} />
                      <Tooltip
                        cursor={{ stroke: '#64748b', strokeWidth: 1, strokeOpacity: 0.5 }}
                        wrapperStyle={{ zIndex: 10000 }}
                        contentStyle={{ backgroundColor: 'transparent', border: 'none', padding: 0, boxShadow: 'none' }}
                        content={({ active, payload }) => {
                          if (!active || !payload?.length) return null;
                          const row = payload[0]?.payload;
                          if (!row) return null;
                          const dateLabel = row.fullDate
                            ? parseLocalDate(row.fullDate).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
                            : row.date;
                          const injectionDoses = row.injectionDoses || {};
                          const phaseByMed = row.phaseByMed || {};
                          return (
                            <div
                              className="space-y-2"
                              style={{
                                backgroundColor: 'rgba(30, 41, 59, 0.97)',
                                border: '1px solid rgba(148, 163, 184, 0.2)',
                                borderRadius: '8px',
                                padding: '10px 12px',
                                minWidth: '160px',
                                boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
                                backdropFilter: 'blur(12px)',
                                color: '#e2e8f0'
                              }}
                            >
                              <div className="text-slate-400 text-[11px] font-medium border-b border-slate-600/50 pb-1.5 mb-1.5">{dateLabel}</div>
                              <div className="text-slate-500 text-[10px] mb-1.5">{row.isToday ? 'Same as cards below' : 'Level on this day'}</div>
                              {unifiedMeds.filter(m => row[m.name] != null).map((med) => {
                                const value = row[med.name];
                                const doseInfo = injectionDoses[med.name];
                                const levelNum = value != null ? parseFloat(value) : 0;
                                const statusLabel = levelNum >= 150 ? 'Steady state' : levelNum >= 100 ? 'Building up' : 'Single dose range';
                                const mgActive = row.remainingMgByMed && row.remainingMgByMed[med.name] != null && row.remainingMgByMed[med.name] > 0
                                  ? row.remainingMgByMed[med.name].toFixed(1)
                                  : null;
                                return (
                                  <div key={med.name} className="flex items-start justify-between gap-3 text-xs">
                                    <div className="flex items-center gap-1.5 min-w-0">
                                      <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: med.color }} />
                                      <span className="text-slate-200 truncate">{med.name}</span>
                                    </div>
                                    <div className="text-right flex-shrink-0">
                                      <span className="font-medium text-white">{value != null ? `${value}%` : '—'}</span>
                                      {doseInfo && <div className="text-emerald-400/90 text-[10px] mt-0.5">{doseInfo.dose}{doseInfo.unit}</div>}
                                      {mgActive != null && <div className="text-amber-400/90 text-[10px] mt-0.5">{mgActive} mg est.</div>}
                                      <div className="text-slate-500 text-[10px] mt-0.5">{statusLabel}</div>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          );
                        }}
                      />
                      <Legend
                        content={() => (
                          <div className="mt-2 pt-2 border-t border-white/[0.06]">
                            <div className="flex flex-col gap-1.5 sm:flex-row sm:items-center sm:justify-between sm:gap-2">
                              <div className="min-w-0 flex-1 pb-1">
                                <div className="flex flex-wrap gap-1">
                                  {unifiedMeds.map((med) => {
                                    const isHidden = insightsChartHiddenMeds.has(med.name);
                                    return (
                                      <button
                                        key={med.name}
                                        type="button"
                                        onClick={() => toggleMedVisibility(med.name)}
                                        title={med.name}
                                        className="inline-flex items-center gap-1 max-w-[9.5rem] shrink-0 rounded-md border border-white/[0.06] bg-slate-900/50 px-1.5 py-0.5 text-[10px] leading-tight hover:bg-white/[0.06] transition-colors"
                                      >
                                        <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: isHidden ? '#475569' : med.color }} />
                                        <span className={`truncate ${isHidden ? 'text-gray-500 line-through' : 'text-gray-300'}`}>{med.name}</span>
                                      </button>
                                    );
                                  })}
                                </div>
                              </div>
                              <div className="flex shrink-0 items-center gap-1 self-center text-[10px] text-gray-500 sm:self-auto">
                                <span className="w-1.5 h-1.5 rounded-full bg-amber-400/90" />
                                <span className="whitespace-nowrap">Injection day</span>
                              </div>
                            </div>
                          </div>
                        )}
                      />
                      {visibleMeds.map(med => (
                        <Area
                          key={`area-${med.name}`}
                          type="natural"
                          dataKey={med.name}
                          fill={`url(#area-${med.name.replace(/\s/g, '')})`}
                          stroke="none"
                          connectNulls={false}
                          isAnimationActive={true}
                        />
                      ))}
                      {visibleMeds.map(med => (
                        <Line
                          key={med.name}
                          type="natural"
                          dataKey={med.name}
                          stroke={med.color}
                          strokeWidth={2.5}
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          connectNulls={false}
                          isAnimationActive={true}
                          dot={(props) => {
                            const { cx, cy, payload, dataKey } = props;
                            if (payload == null || payload[dataKey] == null) return null;
                            const names = payload.injectionMedNames;
                            const isInjectionDay = Array.isArray(names) && names.includes(dataKey);
                            if (!isInjectionDay) return null;
                            return (
                              <g key={props.key}>
                                <circle cx={cx} cy={cy} r={6} fill={med.color} fillOpacity={0.45} />
                                <circle cx={cx} cy={cy} r={3} fill="rgba(255,255,255,0.95)" stroke={med.color} strokeWidth={1} />
                                <circle cx={cx} cy={cy} r={5} fill="none" stroke="#eab308" strokeWidth={1.5} strokeOpacity={0.9} />
                              </g>
                            );
                          }}
                          activeDot={(props) => {
                            const { cx, cy, payload, dataKey } = props;
                            const isInjectionDay = Array.isArray(payload?.injectionMedNames) && payload.injectionMedNames.includes(dataKey);
                            return (
                              <g>
                                <circle cx={cx} cy={cy} r={7} fill={med.color} fillOpacity={0.4} />
                                <circle cx={cx} cy={cy} r={4} fill="white" stroke={med.color} strokeWidth={1.5} />
                                {isInjectionDay && <circle cx={cx} cy={cy} r={6} fill="none" stroke="#eab308" strokeWidth={2} />}
                              </g>
                            );
                          }}
                        />
                      ))}
                    </ComposedChart>
                  </ResponsiveContainer>
                  </div>
                  </div>
                </div>
              );
            })()}

            {/* Weekly breakdown: dose & weight change */}
            {false && (() => {
              const { rows, meds } = getWeeklyDoseAndWeightSummary();
              if (!rows.length) return null;
              const visibleMeds = meds.filter((m) => !weeklyDoseWeightExcludedMeds.includes(m));
              const getWeeklyDisplayUnit = (medName) => rows.find((row) => row.perMed?.[medName]?.unit)?.perMed?.[medName]?.unit || 'mg';
              const totalWeightChange = rows.reduce((sum, row) => {
                return row.weightChange != null ? sum + row.weightChange : sum;
              }, 0);
              const toggleWeeklyDoseMedExcluded = (medName) => {
                setWeeklyDoseWeightExcludedMeds((prev) => {
                  const next = prev.includes(medName) ? prev.filter((x) => x !== medName) : [...prev, medName];
                  saveData('health-weekly-dose-weight-excluded-meds', next);
                  return next;
                });
              };
              return (
                <div className="ui-card p-4 relative z-0">
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:flex-wrap sm:justify-between mb-2">
                    <div className="flex flex-wrap items-center gap-2 min-w-0">
                      <h3 className="text-white font-semibold text-sm flex items-center gap-2 shrink-0">
                        <Activity className="h-4 w-4 text-gold-400 shrink-0" />
                        Weekly dose &amp; weight change
                      </h3>
                      <button
                        type="button"
                        onClick={async () => {
                          const built = buildWeeklyDoseWeightPdf({
                            rows,
                            visibleMeds,
                            weekStartsOnLabel: getWeekStartsOnLabel(weeklyDoseWeekStartsOn),
                            totalWeightChange,
                            appVersion: APP_VERSION,
                          });
                          if (!built) {
                            alert('Nothing to export yet — you need at least two weight entries and some injections.');
                            return;
                          }
                          try {
                            await savePdfBlob(built.blob, built.filename, {
                              title: 'Weekly dose & weight',
                              dialogTitle: 'Save weekly dose PDF',
                            });
                          } catch (e) {
                            console.error(e);
                            alert(`Could not save PDF: ${e?.message || String(e)}`);
                          }
                        }}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-white/[0.1] bg-slate-800/80 px-2.5 py-1 text-[11px] font-medium text-gray-200 hover:bg-slate-700/90 hover:border-gold-500/30 transition-colors"
                      >
                        <FileDown className="h-3.5 w-3.5 text-gold-400/90" />
                        Download PDF
                      </button>
                    </div>
                    <div className={`text-xs font-semibold px-2.5 py-1.5 rounded-full border self-start sm:self-auto ${
                      totalWeightChange < 0
                        ? 'border-green-400 text-green-300 bg-green-500/10'
                        : totalWeightChange > 0
                          ? 'border-red-400 text-red-300 bg-red-500/10'
                          : 'border-gray-500 text-gray-300 bg-white/5'
                    }`}>
                      Total weight:{' '}
                      {totalWeightChange === 0
                        ? '0.0 lb'
                        : `${totalWeightChange.toFixed(1)} lb`}
                    </div>
                  </div>
                  <p className="text-gray-400 text-xs mb-3 leading-relaxed">
                    <span className="hidden sm:inline">Weekly </span><strong className="text-gray-300">dose totals</strong> use each compound&apos;s logged unit (mg, IU, or units). Each week shows <strong className="text-gray-400">start weight</strong> and <strong className="text-gray-400">end weight</strong>. Hide meds below to declutter.
                  </p>
                  <div className="flex flex-col gap-2 mb-3 text-xs text-gray-400 sm:flex-row sm:flex-wrap sm:items-center sm:gap-x-3 sm:gap-y-2">
                    <label htmlFor="weekly-dose-week-start" className="text-gray-500 shrink-0">
                      Week starts on
                    </label>
                    <select
                      id="weekly-dose-week-start"
                      value={weeklyDoseWeekStartsOn}
                      onChange={(e) => {
                        const v = Number(e.target.value);
                        if (v >= 0 && v <= 6) {
                          setWeeklyDoseWeekStartsOn(v);
                          saveData('health-weekly-dose-week-starts-on', v);
                        }
                      }}
                      className="bg-slate-700 text-white rounded-lg px-3 py-2 sm:py-1.5 border border-white/[0.08] text-xs w-full sm:w-auto sm:max-w-[14rem]"
                    >
                      <option value={1}>Monday (default)</option>
                      <option value={3}>Wednesday (mid-week titration)</option>
                      <option value={0}>Sunday</option>
                      <option value={2}>Tuesday</option>
                      <option value={4}>Thursday</option>
                      <option value={5}>Friday</option>
                      <option value={6}>Saturday</option>
                    </select>
                    <span className="text-gray-500 text-[11px] leading-snug sm:max-w-md">
                      Each block is 7 days from that start; doses are summed in that window.
                    </span>
                  </div>
                  {meds.length > 0 && (
                    <div className="mb-3 pb-3 border-b border-white/10">
                      <div className="flex flex-wrap items-center gap-x-2 gap-y-1 mb-2">
                        <span className="text-gray-500 text-[11px] uppercase tracking-wide">Show meds</span>
                        {meds.length > 1 && (
                          <button
                            type="button"
                            onClick={() => {
                              setWeeklyDoseWeightExcludedMeds([]);
                              saveData('health-weekly-dose-weight-excluded-meds', []);
                            }}
                            className="text-[11px] font-medium text-accent hover:text-gold-400 ml-auto sm:ml-0"
                          >
                            Show all
                          </button>
                        )}
                      </div>
                      <div className="flex flex-wrap gap-2 pb-1">
                        {meds.map((medName) => {
                          const show = !weeklyDoseWeightExcludedMeds.includes(medName);
                          const dot = MEDICATIONS.find((m) => m.name === medName)?.color || '#9ca3af';
                          return (
                            <label
                              key={medName}
                              className="inline-flex items-center gap-1.5 cursor-pointer text-[11px] text-gray-200 shrink-0 rounded-lg border border-white/[0.08] bg-slate-800/60 px-2 py-1.5 sm:border-0 sm:bg-transparent sm:px-0 sm:py-0"
                            >
                              <input
                                type="checkbox"
                                className="rounded border-white/20 bg-slate-700 text-accent focus:ring-accent shrink-0"
                                checked={show}
                                onChange={() => toggleWeeklyDoseMedExcluded(medName)}
                              />
                              <span className="flex items-center gap-1.5 min-w-0 max-w-[11rem] sm:max-w-none">
                                <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: dot }} />
                                <span className="truncate" title={medName}>{medName}</span>
                              </span>
                            </label>
                          );
                        })}
                      </div>
                    </div>
                  )}
                  {/* Cards — phones & tablets (wide table only at xl to avoid horizontal scroll) */}
                  <div className="xl:hidden space-y-2 max-h-[min(40rem,80vh)] overflow-y-auto pr-0.5">
                    {rows.map((row, idx) => {
                      const doseLines = visibleMeds.map((medName) => {
                        const dose = row.perMed?.[medName]?.displayDose;
                        const unit = row.perMed?.[medName]?.unit || getWeeklyDisplayUnit(medName);
                        return { medName, dose: dose != null && dose > 0 ? dose : null, unit };
                      }).filter((x) => x.dose != null);
                      return (
                        <div
                          key={`mobile-${row.weekLabel}-${idx}`}
                          className="rounded-xl border border-white/[0.08] bg-slate-950/40 p-3"
                        >
                          <div className="flex items-start justify-between gap-2 mb-2">
                            <div className="min-w-0">
                              <span className="text-gray-500 text-[11px]">W{row.weekIndex}</span>
                              <div className="text-sm text-gray-100 font-medium leading-snug">{row.weekLabel}</div>
                            </div>
                            <div
                              className={`text-sm font-semibold tabular-nums shrink-0 text-right ${
                                row.weightChange == null
                                  ? 'text-gray-500'
                                  : row.weightChange < 0
                                    ? 'text-green-400'
                                    : row.weightChange > 0
                                      ? 'text-red-400'
                                      : 'text-gray-200'
                              }`}
                            >
                              <div className="text-[10px] font-normal text-gray-500 mb-0.5">Week Δ</div>
                              {row.weightChange == null ? '—' : `${row.weightChange > 0 ? '+' : ''}${row.weightChange.toFixed(1)} lb`}
                            </div>
                          </div>
                          {row.weekStartWeight != null && row.weekEndWeight != null ? (
                            <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5 text-[11px] text-gray-400 mb-2 pb-2 border-b border-white/[0.06]">
                              <span>
                                Start <span className="text-gray-200 tabular-nums font-medium">{row.weekStartWeight.toFixed(1)}</span> lb
                              </span>
                              <span className="text-gray-600">→</span>
                              <span>
                                End <span className="text-gray-200 tabular-nums font-medium">{row.weekEndWeight.toFixed(1)}</span> lb
                              </span>
                            </div>
                          ) : (
                            <p className="text-[11px] text-gray-500 mb-2 pb-2 border-b border-white/[0.06]">Log weight during this week to see start → end.</p>
                          )}
                          {doseLines.length === 0 ? (
                            <p className="text-[11px] text-gray-500">
                              {visibleMeds.length === 0
                                ? 'Turn on at least one med under Show meds to list weekly mg.'
                                : 'No dose logged for visible meds this week.'}
                            </p>
                          ) : (
                            <ul className="space-y-1.5 text-xs">
                              {doseLines.map(({ medName, dose, unit }) => (
                                <li key={medName} className="flex justify-between gap-2 text-gray-300">
                                  <span className="text-gray-400 min-w-0 truncate" title={medName}>{medName}</span>
                                  <span className="tabular-nums shrink-0">{dose.toFixed(2)} {unit}/wk</span>
                                </li>
                              ))}
                            </ul>
                          )}
                        </div>
                      );
                    })}
                  </div>
                  {/* xl+: wide table */}
                  <div className="hidden xl:block peptalk-scroll-panel max-h-[min(28rem,70vh)] overflow-auto rounded-lg border border-white/[0.06] bg-slate-950/25">
                    <table className="min-w-full text-xs">
                      <thead className="sticky top-0 z-[1] bg-slate-900/95 backdrop-blur-sm border-b border-white/10 shadow-[0_1px_0_rgba(0,0,0,0.2)]">
                        <tr className="text-gray-400">
                          <th className="py-2 pr-3 pl-2 text-left font-medium w-[1%] whitespace-nowrap">Week</th>
                          {visibleMeds.map((medName) => (
                            <th key={medName} className="py-2 px-2 text-right font-medium min-w-[5rem] max-w-[9rem]">
                              <span className="block leading-tight line-clamp-2" title={medName}>{medName}</span>
                              <span className="block text-[10px] font-normal text-gray-500 normal-case tracking-normal">{getWeeklyDisplayUnit(medName)} / wk</span>
                            </th>
                          ))}
                          <th className="py-2 px-2 text-right font-medium whitespace-nowrap tabular-nums">Start lb</th>
                          <th className="py-2 px-2 text-right font-medium whitespace-nowrap tabular-nums">End lb</th>
                          <th className="py-2 pl-2 pr-3 text-right font-medium whitespace-nowrap">Δ lb</th>
                        </tr>
                      </thead>
                      <tbody>
                        {rows.map((row, idx) => (
                          <tr key={`${row.weekLabel}-${idx}`} className="border-b border-white/[0.04] last:border-b-0">
                            <td className="py-2 pr-3 pl-2 text-gray-200 align-top">
                              <span className="text-gray-500 mr-1 text-[11px]">W{row.weekIndex}</span>
                              <span className="whitespace-nowrap">{row.weekLabel}</span>
                            </td>
                            {visibleMeds.map((medName) => {
                              const dose = row.perMed?.[medName]?.displayDose;
                              if (dose == null || dose <= 0) {
                                return (
                                  <td key={medName} className="py-2 px-2 text-right text-gray-500 align-top">
                                    —
                                  </td>
                                );
                              }
                              return (
                                <td key={medName} className="py-2 px-2 text-right text-gray-200 tabular-nums align-top">
                                  {dose.toFixed(2)}
                                </td>
                              );
                            })}
                            <td className="py-2 px-2 text-right text-gray-200 tabular-nums align-top">
                              {row.weekStartWeight != null ? row.weekStartWeight.toFixed(1) : '—'}
                            </td>
                            <td className="py-2 px-2 text-right text-gray-200 tabular-nums align-top">
                              {row.weekEndWeight != null ? row.weekEndWeight.toFixed(1) : '—'}
                            </td>
                            <td className={`py-2 pl-2 pr-3 text-right tabular-nums align-top ${row.weightChange == null ? 'text-gray-500' : row.weightChange < 0 ? 'text-green-400' : row.weightChange > 0 ? 'text-red-400' : 'text-gray-200'}`}>
                              {row.weightChange == null ? '—' : row.weightChange.toFixed(1)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              );
            })()}

            {/* Side effects from logs */}
            {false && getSideEffectsSummary().length > 0 && (
              <div className="ui-card p-4">
                <h3 className="text-white font-semibold mb-2 text-sm">From your logs</h3>
                <p className="text-gray-400 text-xs mb-2">Most mentioned side effects</p>
                <div className="flex flex-wrap gap-2">
                  {getSideEffectsSummary().map(se => (
                    <span key={se} className="text-xs bg-orange-500/20 text-orange-300 px-2.5 py-1 rounded-lg">{se}</span>
                  ))}
                </div>
              </div>
            )}

            {/* Side effects by day in cycle — reference only; shows all your logged meds */}
            {false && (() => {
              const loggedMeds = getLoggedMedications();
              if (loggedMeds.length === 0) return null;
              return (
                <div className="ui-card overflow-hidden">
                  <h3 className="text-white font-semibold mb-1 text-sm px-4 pt-4">Side effects by day in cycle</h3>
                  <p className="text-gray-400 text-xs mb-3 px-4">Reference: what’s commonly reported by day. Tap a medication to expand.</p>
                  <div className="divide-y divide-white/10">
                    {loggedMeds.map(medName => {
                      const med = MEDICATIONS.find(m => m.name === medName);
                      const color = med?.color || '#6b7280';
                      const byDay = TYPICAL_SIDE_EFFECTS_BY_DAY[medName];
                      const hasData = byDay && Array.isArray(byDay) && byDay.length > 0;
                      const isExpanded = insightsSideEffectsExpandedMed === medName;
                      return (
                        <div key={medName} className="overflow-hidden" style={{ borderLeftWidth: '4px', borderLeftColor: color }}>
                          <button type="button" onClick={() => setInsightsSideEffectsExpandedMed(isExpanded ? null : medName)} className="w-full px-4 py-3 flex items-center justify-between gap-2 text-left hover:bg-white/[0.03] transition-colors">
                            <div className="flex items-center gap-2 min-w-0">
                              <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: color }} />
                              <span className="text-white font-medium text-sm truncate">{medName}</span>
                            </div>
                            <ChevronDown className={`h-4 w-4 text-gray-500 flex-shrink-0 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                          </button>
                          {isExpanded && (
                          <div className="px-4 pb-4 pt-0 border-t border-white/[0.04]">
                            {hasData ? (
                              <div className="space-y-2.5 mt-3">
                                {byDay.map(({ day, effects }, i) => (
                                  <div key={i}>
                                    <div className="text-gray-500 text-[10px] font-medium uppercase tracking-wider mb-1">{day}</div>
                                    <div className="flex flex-wrap gap-1">
                                      {effects.map(ef => (
                                        <span key={ef} className="text-gray-300 text-xs bg-slate-700/60 px-2 py-0.5 rounded">{ef}</span>
                                      ))}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <p className="text-gray-500 text-xs mt-3">No reference pattern for this compound yet. Log side effects when you inject to see your patterns in the cards above.</p>
                            )}
                          </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })()}

            {/* Side-effect intelligence — correlate symptoms with dosing, suggest tips */}
            {false && (() => {
              const patterns = getSideEffectPatterns();
              return patterns && patterns.length > 0 && (
              <div className="ui-card p-4 border border-gold-500/20 bg-gold-500/5">
                <h3 className="text-white font-semibold mb-2 text-sm flex items-center gap-2">Side-effect patterns</h3>
                <p className="text-gray-400 text-xs mb-3">Correlated with your injection timing. Use this to adjust dosing.</p>
                <div className="space-y-3">
                  {patterns.slice(0, 5).map((p, i) => (
                    <div key={i} className="bg-slate-800/50 rounded-lg p-3">
                      <div className="text-gold-400 font-medium text-xs">{p.med} · {p.sideEffect}</div>
                      <p className="text-gray-300 text-xs mt-1">{p.suggestion}</p>
                    </div>
                  ))}
                </div>
                <p className="text-gray-500 text-xs mt-2">Tip: Try evening injections, split doses, or increase electrolytes to smooth peaks.</p>
              </div>
              );
            })()}

            {activeMedicationInsights.length === 0 ? (
              <div className="ui-card p-8 text-center">
                <div className="w-14 h-14 rounded-2xl bg-slate-700/50 flex items-center justify-center mx-auto mb-4">
                  <Activity className="h-7 w-7 text-gray-400" />
                </div>
                <h3 className="text-white font-semibold mb-1">{medicationInsights.length ? 'No active stacks' : 'No medication data yet'}</h3>
                <p className="text-gray-400 text-sm mb-5">{medicationInsights.length ? 'Restore a stack above whenever you start it again.' : 'Log an injection to see levels and when to dose next.'}</p>
                {!medicationInsights.length && <button onClick={() => setActiveTab('injections')} className="ui-btn-primary px-5 py-2.5 text-sm">Log injection</button>}
              </div>
            ) : (
              <>
                {/* Active Medications Overview */}
                {activeMedicationInsights.filter((insight) => !insightsExpandedMed || insight.medication === insightsExpandedMed).map(insight => {
                  const isExpanded = insightsExpandedMed === insight.medication;
                  const levelNum = parseFloat(insight.currentLevel);
                  const statusLabel = levelNum >= 150 ? 'Steady state' : levelNum >= 100 ? 'Building up' : 'Single dose range';
                  const statusColor = levelNum >= 150 ? 'text-green-500' : levelNum >= 100 ? 'text-gold-400' : 'text-gray-400';
                  return (
                  <div key={insight.medication} className={`ui-card overflow-hidden ${isExpanded ? 'border-gold-500/20 shadow-2xl shadow-black/20' : ''}`}>
                    {/* Compact header — always visible */}
                    <div className="flex items-center">
                    <button type="button" onClick={() => setInsightsExpandedMed(isExpanded ? null : insight.medication)} className="min-w-0 flex-1 px-4 py-4 pr-2 flex items-center gap-3 text-left hover:bg-white/[0.03] transition-colors">
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: `${insight.color}22` }}>
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: insight.color }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-white truncate">{insight.medication}</div>
                        <div className="text-gray-400 text-xs mt-0.5">{insight.hoursAgo < 24 ? `Last dose ${insight.hoursAgo}h ago` : `Last dose ${(insight.hoursAgo / 24).toFixed(1)} days ago`} · {insight.lastDose}{insight.lastUnit}</div>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <div className="text-2xl font-bold text-white">{insight.currentLevel}%</div>
                        <div className={`text-xs font-medium ${statusColor}`}>{statusLabel}</div>
                      </div>
                      <ChevronDown className={`h-5 w-5 text-gray-500 flex-shrink-0 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                    </button>
                    {!isExpanded && <button
                      type="button"
                      onClick={() => {
                        if (window.confirm(`Mark ${insight.medication} inactive? Its dose history will stay saved.`)) setInsightMedicationInactive(insight.medication, true);
                      }}
                      className="mr-2 h-7 w-7 shrink-0 rounded-lg text-gray-600 hover:bg-white/[0.04] hover:text-gray-300"
                      title={`Mark ${insight.medication} inactive`}
                      aria-label={`Mark ${insight.medication} inactive`}
                    ><X className="h-3 w-3 mx-auto" /></button>}
                    </div>

                    {/* Expanded content */}
                    {isExpanded && (
                    <div className="px-4 pb-4 pt-0 border-t border-white/[0.06] space-y-4">
                    {/* Phase + next dose one-liner */}
                    <div className="flex flex-wrap items-center gap-2 pt-3">
                      <span className={`text-sm font-medium ${insight.phaseColor}`}>● {insight.phase}</span>
                      {insight.nextInjection && (
                        <span className="text-gray-400 text-xs">Next: {new Date(insight.nextInjection).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                      <button
                        type="button"
                        onClick={() => openTodayDoseForm({ medication: insight.medication, dose: insight.lastDose, unit: insight.lastUnit || 'mg', scheduleTime: '', existing: null })}
                        className="ui-btn-primary inline-flex min-h-11 items-center justify-center gap-2 px-3 text-sm"
                      >
                        <Syringe className="h-4 w-4" /> Log dose
                      </button>
                      <button
                        type="button"
                        onClick={() => openProtocolEditor(insight.medication)}
                        className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-white/[0.08] bg-white/[0.035] px-3 text-sm font-medium text-gray-200 hover:bg-white/[0.07]"
                      >
                        <Edit2 className="h-4 w-4" /> Edit protocol
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          if (window.confirm(`Archive ${insight.medication}? Its dose history will stay saved.`)) {
                            setInsightMedicationInactive(insight.medication, true);
                            setInsightsExpandedMed(null);
                          }
                        }}
                        className="col-span-2 inline-flex min-h-10 items-center justify-center gap-2 rounded-xl border border-white/[0.06] px-3 text-xs font-medium text-gray-500 hover:border-red-500/20 hover:text-red-300 sm:col-span-1"
                      >
                        Archive stack
                      </button>
                    </div>

                    {/* Per-compound level surface — inspired by the user's Regimen reference. */}
                    {(() => {
                      const range = insightsMedRanges[insight.medication] || '1m';
                      const detail = getCompoundDetailData(insight.medication, range);
                      if (!detail) return null;
                      const remaining = Number(detail.currentRemaining || 0);
                      const remainingLabel = remaining >= 10 ? remaining.toFixed(1) : remaining.toFixed(2).replace(/0+$/, '').replace(/\.$/, '');
                      const now = new Date();
                      const next = detail.nextDoseAt;
                      const dayDiff = Math.round((new Date(next.getFullYear(), next.getMonth(), next.getDate()) - new Date(now.getFullYear(), now.getMonth(), now.getDate())) / (24 * 60 * 60 * 1000));
                      const dayLabel = dayDiff === 0 ? 'Today' : dayDiff === 1 ? 'Tomorrow' : next.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                      const nextLabel = detail.paused ? 'Paused' : `${dayLabel}, ${next.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}`;
                      return (
                        <div className="space-y-3">
                          <div className="flex flex-wrap gap-1.5">
                            {[['1w', '1W'], ['1m', '1M'], ['3m', '3M'], ['6m', '6M'], ['all', 'All']].map(([id, label]) => (
                              <button
                                key={id}
                                type="button"
                                onClick={() => setInsightsMedRanges((previous) => ({ ...previous, [insight.medication]: id }))}
                                className={`rounded-full border px-3 py-1.5 text-[11px] font-medium transition-colors ${range === id ? 'border-white/20 bg-white/12 text-white' : 'border-white/[0.08] text-gray-500 hover:text-gray-300'}`}
                              >
                                {label}
                              </button>
                            ))}
                          </div>

                          {renderBlendSetup(detail.medication, insight.medication, detail.entries[0])}

                          <div
                            className="rounded-2xl border border-white/[0.08] overflow-hidden"
                            style={{
                              backgroundColor: 'rgba(15, 23, 42, 0.72)',
                              backgroundImage: `radial-gradient(${insight.color}20 0.8px, transparent 0.8px)`,
                              backgroundSize: '16px 16px',
                            }}
                          >
                            <div className="px-4 pt-4 flex items-start justify-between gap-3">
                              <div>
                                <div className="flex items-center gap-2 text-sm font-medium text-gray-200">
                                  <Activity className="h-4 w-4" style={{ color: insight.color }} />
                                  Medication level
                                </div>
                                <div className="mt-2 text-4xl font-semibold tracking-tight text-white">~{remainingLabel} <span className="text-base font-normal text-gray-400">{detail.levelUnit}</span></div>
                                <div className="mt-1 text-xs text-gray-500">Estimated t½ ~{detail.medication.halfLife}h</div>
                              </div>
                              <span className="text-xs text-gray-400">{statusLabel}</span>
                            </div>
                            <div className="px-1 pt-2">
                              <ResponsiveContainer width="100%" height={230}>
                                <ComposedChart data={detail.points} margin={{ top: 12, right: 10, left: 0, bottom: 4 }}>
                                  <defs>
                                    <linearGradient id={`compound-fill-${insight.medication.replace(/[^a-z0-9]/gi, '')}`} x1="0" y1="0" x2="0" y2="1">
                                      <stop offset="0%" stopColor={insight.color} stopOpacity={0.28} />
                                      <stop offset="100%" stopColor={insight.color} stopOpacity={0.02} />
                                    </linearGradient>
                                  </defs>
                                  <XAxis
                                    dataKey="timestamp"
                                    type="number"
                                    domain={['dataMin', 'dataMax']}
                                    tickLine={false}
                                    axisLine={{ stroke: '#334155', strokeOpacity: 0.5 }}
                                    minTickGap={42}
                                    fontSize={10}
                                    stroke="#64748b"
                                    tickFormatter={(timestamp) => new Date(timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                  />
                                  <YAxis hide domain={[0, 'auto']} />
                                  <Tooltip
                                    cursor={{ stroke: '#64748b', strokeOpacity: 0.35 }}
                                    contentStyle={{ backgroundColor: 'rgba(15,23,42,.96)', border: '1px solid rgba(255,255,255,.1)', borderRadius: 10, fontSize: 11 }}
                                    labelFormatter={(timestamp) => new Date(timestamp).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}
                                    formatter={(value, name, item) => [`${Number(value).toFixed(2)} ${detail.levelUnit}${item?.payload?.dose ? ` · dose ${item.payload.dose}` : ''}`, name === 'projectedMg' ? 'Projected' : 'Estimated']}
                                  />
                                  <Area type="linear" dataKey="actualMg" stroke="none" fill={`url(#compound-fill-${insight.medication.replace(/[^a-z0-9]/gi, '')})`} connectNulls={false} />
                                  <Line
                                    type="linear"
                                    dataKey="actualMg"
                                    stroke={insight.color}
                                    strokeWidth={2.5}
                                    connectNulls={false}
                                    dot={({ cx, cy, payload }) => payload?.dose ? <circle cx={cx} cy={cy} r={2.5} fill="#111827" stroke={insight.color} strokeWidth={1.5} /> : null}
                                    activeDot={{ r: 4, fill: insight.color, stroke: '#111827', strokeWidth: 2 }}
                                  />
                                  <Line type="linear" dataKey="projectedMg" stroke={insight.color} strokeOpacity={0.65} strokeWidth={2} strokeDasharray="5 5" dot={false} connectNulls={false} />
                                </ComposedChart>
                              </ResponsiveContainer>
                            </div>
                            <div className="grid grid-cols-3 gap-2 border-t border-white/[0.07] bg-black/10 px-4 py-3">
                              <div><div className="text-[10px] uppercase tracking-wider text-gray-500">Time on</div><div className="mt-1 text-sm font-semibold text-white">{detail.timeOnDays}d</div></div>
                              <div><div className="text-[10px] uppercase tracking-wider text-gray-500">Adherence</div><div className="mt-1 text-sm font-semibold text-white">{detail.adherence}%</div></div>
                              <div><div className="text-[10px] uppercase tracking-wider text-gray-500">Next</div><div className="mt-1 text-sm font-semibold text-white leading-tight">{nextLabel}</div></div>
                            </div>
                          </div>

                          <div className="rounded-2xl border border-white/[0.07] bg-white/[0.025] overflow-hidden">
                            <div className="px-4 py-3 flex items-center justify-between border-b border-white/[0.06]">
                              <div><h5 className="text-sm font-semibold text-white">Recent doses</h5><p className="text-[11px] text-gray-500">Latest history for this compound</p></div>
                              <button type="button" onClick={() => setActiveTab('injections')} className="text-[11px] font-medium text-gold-400">All doses</button>
                            </div>
                            {detail.entries.slice(0, 5).map((entry) => {
                              const blendDose = getBlendBreakdown(entry).filter((item) => item.mg != null);
                              return (
                                <div key={entry.id} className="px-4 py-2.5 flex items-start justify-between gap-3 border-b border-white/[0.05] last:border-0">
                                  <div className="min-w-0">
                                    <div className="text-sm font-semibold text-white">{entry.dose} {entry.unit || 'mg'}</div>
                                    {blendDose.length > 0 && <div className="mt-0.5 text-[10px] leading-relaxed text-gold-400/75">{blendDose.map((item) => `${item.component} ${item.mg.toFixed(3)} mg`).join(' · ')}</div>}
                                    {(entry.site || entry.route) && <div className="mt-0.5 text-[11px] text-gray-500">{[entry.site, entry.route].filter(Boolean).join(' · ')}</div>}
                                  </div>
                                  <div className="shrink-0 text-right text-[11px] text-gray-500">{getEntryDateTime(entry).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}<br />{getEntryDateTime(entry).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}</div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })()}

                    {insight.effectProfile?.splitDoseTip && (
                      <p className="text-gold-400 text-xs bg-accent/10 border border-accent/20 rounded-lg p-2.5">💡 {insight.effectProfile.splitDoseTip}</p>
                    )}

                    {/* Phase progress — compact */}
                    {insight.currentPhase && insight.timeline && Array.isArray(insight.timeline.phases) && (
                      <div>
                        <div className="flex items-center justify-between gap-2 mb-2">
                          {insight.timeline.phases.map((phase, idx) => (
                            <div key={idx} className={`text-[10px] ${idx === insight.currentPhase.phaseIndex ? insight.currentPhase.color : 'text-gray-500'}`}>{phase.name}</div>
                          ))}
                        </div>
                        <div className="relative h-1.5 bg-slate-700 rounded-full overflow-hidden">
                          <div className={`absolute h-full ${insight.currentPhase.bgColor || 'bg-slate-600'} transition-all`} style={{ width: `${insight.currentPhase.totalPhases > 0 ? ((insight.currentPhase.phaseIndex + 1) / insight.currentPhase.totalPhases) * 100 : 0}%` }} />
                        </div>
                        <p className="text-gray-400 text-xs mt-2">{insight.currentPhase.description}</p>
                      </div>
                    )}

                    {/* Current phase — compact, useful, and easy to scan. */}
                    {insight.currentPhase && (
                      <div className={`rounded-2xl border p-4 ${insight.currentPhase.borderColor} ${insight.currentPhase.bgColor}`}>
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <div className="text-[10px] font-medium uppercase tracking-[0.16em] text-gray-500">Current phase</div>
                            <div className="mt-1 flex items-center gap-2">
                              <span aria-hidden>{insight.currentPhase.icon}</span>
                              <h5 className={`font-semibold ${insight.currentPhase.color}`}>{insight.currentPhase.name}</h5>
                            </div>
                          </div>
                          <span className="shrink-0 rounded-full border border-white/[0.08] bg-black/10 px-2.5 py-1 text-[10px] text-gray-400">
                            {insight.lastInjection ? `Last dose ${new Date(insight.lastInjection).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}` : 'No dose date'}
                          </span>
                        </div>
                        <p className="mt-3 text-sm leading-relaxed text-gray-300">{insight.currentPhase.description}</p>
                        {Array.isArray(insight.currentPhase.whatToExpect) && insight.currentPhase.whatToExpect.length > 0 && (
                          <div className="mt-3 border-t border-white/[0.06] pt-3">
                            <div className="text-[10px] font-medium uppercase tracking-wider text-gray-500">What to expect</div>
                            <p className="mt-1 text-xs leading-relaxed text-gray-400">{insight.currentPhase.whatToExpect.slice(0, 2).join(' · ')}</p>
                          </div>
                        )}
                      </div>
                    )}
                    </div>
                    )}
                  </div>
                    );
                })}

                {!insightsExpandedMed && (() => {
                  const { rows } = getWeeklyDoseAndWeightSummary();
                  if (!rows.length) return null;
                  return (
                    <section className="ui-card overflow-hidden mt-4">
                      <div className="flex items-start justify-between gap-3 border-b border-white/[0.06] p-4">
                        <div>
                          <h3 className="text-sm font-semibold text-white flex items-center gap-2"><Calendar className="h-4 w-4 text-gold-400" />Weekly stack &amp; weight</h3>
                          <p className="mt-1 text-[11px] text-gray-500">What you took each week and how your weight changed.</p>
                        </div>
                        <select
                          value={weeklyDoseWeekStartsOn}
                          onChange={(event) => {
                            const value = Number(event.target.value);
                            setWeeklyDoseWeekStartsOn(value);
                            saveData('health-weekly-dose-week-starts-on', value);
                          }}
                          className="rounded-lg border border-white/[0.07] bg-slate-800 px-2 py-1.5 text-[11px] text-gray-300"
                          aria-label="Week starts on"
                        >
                          <option value={1}>Mon</option>
                          <option value={0}>Sun</option>
                          <option value={2}>Tue</option>
                          <option value={3}>Wed</option>
                          <option value={4}>Thu</option>
                          <option value={5}>Fri</option>
                          <option value={6}>Sat</option>
                        </select>
                      </div>
                      <div className="divide-y divide-white/[0.06]">
                        {[...rows].reverse().map((row) => {
                          const doses = Object.entries(row.perMed || {}).filter(([, value]) => Number(value?.displayDose) > 0);
                          return (
                            <div key={`${row.weekIndex}-${row.weekLabel}`} className="p-4">
                              <div className="flex items-start justify-between gap-3">
                                <div>
                                  <div className="text-sm font-medium text-gray-200">{row.weekLabel}</div>
                                  <div className="mt-1 text-[11px] text-gray-500">
                                    {row.weekStartWeight != null || row.weekEndWeight != null
                                      ? `${row.weekStartWeight != null ? row.weekStartWeight.toFixed(1) : '—'} → ${row.weekEndWeight != null ? row.weekEndWeight.toFixed(1) : '—'} lb`
                                      : 'No weight logged'}
                                  </div>
                                </div>
                                <span className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ${row.weightChange == null ? 'bg-white/[0.04] text-gray-500' : row.weightChange < 0 ? 'bg-green-500/12 text-green-400' : row.weightChange > 0 ? 'bg-red-500/12 text-red-400' : 'bg-white/[0.05] text-gray-300'}`}>
                                  {row.weightChange == null ? '—' : `${row.weightChange > 0 ? '+' : ''}${row.weightChange.toFixed(1)} lb`}
                                </span>
                              </div>
                              <div className="mt-3 flex flex-wrap gap-1.5">
                                {doses.length ? doses.map(([medName, value]) => (
                                  <span key={medName} className="rounded-lg border border-white/[0.06] bg-white/[0.025] px-2.5 py-1.5 text-[11px] text-gray-300">
                                    <span className="font-medium text-white">{medName}</span> · {Number(value.displayDose).toFixed(2).replace(/\.00$/, '')} {value.unit || 'mg'}
                                  </span>
                                )) : <span className="text-[11px] text-gray-600">No doses logged</span>}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </section>
                  );
                })()}
            </>
            )}
          </div>
        )}

        {/* WEIGHT TAB — progress-first dashboard */}
        {activeTab === 'weight' && (() => {
          const chartData = getSummaryChartData(chartRangeWeeks);
          const trendPoints = chartData.filter((point) => point.weightTrend != null);
          const latestTrend = trendPoints[trendPoints.length - 1];
          const priorTrend = trendPoints[Math.max(0, trendPoints.length - 8)];
          const trendWeekChange = latestTrend && priorTrend && latestTrend !== priorTrend
            ? latestTrend.weightTrend - priorTrend.weightTrend
            : null;
          const sortedAsc = [...weightEntries].sort((a, b) => parseLocalDate(a.date) - parseLocalDate(b.date));
          const thirtyCutoff = new Date();
          thirtyCutoff.setDate(thirtyCutoff.getDate() - 30);
          const last30 = sortedAsc.filter((entry) => parseLocalDate(entry.date) >= thirtyCutoff);
          const thirtyDayChange = last30.length > 1 ? Number(last30[last30.length - 1].weight) - Number(last30[0].weight) : null;
          const weightValues = chartData.map((point) => point.weight).filter((value) => value != null && !Number.isNaN(value));
          const yDomain = weightValues.length
            ? [Math.floor(Math.min(...weightValues)) - 2, Math.ceil(Math.max(...weightValues)) + 2]
            : ['auto', 'auto'];
          const xInterval = chartData.length > 12 ? Math.max(0, Math.floor(chartData.length / 6)) : 0;
          const { rows: weeklyRows } = getWeeklyDoseAndWeightSummary();
          const historyRows = sortWeightByDateDesc(weightEntries).filter((entry) => {
            if (!weightHistoryFilterDate) return true;
            const selected = parseLocalDate(weightHistoryFilterDate);
            const entryDate = parseLocalDate(entry.date);
            if (!selected || !entryDate) return true;
            const start = new Date(selected);
            const diff = start.getDay() === 0 ? -6 : 1 - start.getDay();
            start.setDate(start.getDate() + diff);
            start.setHours(0, 0, 0, 0);
            const end = new Date(start);
            end.setDate(end.getDate() + 7);
            return entryDate >= start && entryDate < end;
          });
          const visibleHistoryRows = showAllWeightHistory ? historyRows : historyRows.slice(0, 5);
          const formatDelta = (value) => value == null || Number.isNaN(value) ? '—' : `${value > 0 ? '+' : ''}${value.toFixed(1)}`;
          return (
          <div key="weight-dashboard" className="space-y-4 tab-enter">
            <div className="flex items-end justify-between gap-3 px-1">
              <div>
                <h2 className="text-2xl font-bold tracking-tight text-white">Weight</h2>
                <p className="mt-1 text-sm text-gray-400">Your readings, trend, and weekly stack response.</p>
              </div>
              <div className="flex items-center gap-2">
                <button type="button" onClick={() => setActiveTab('insights')} className="inline-flex min-h-11 items-center gap-2 rounded-2xl border border-white/[0.1] bg-white/[0.04] px-3 text-xs font-semibold text-gray-200 hover:bg-white/[0.07]">
                  <Activity className="h-4 w-4 text-violet-300" /><span className="hidden sm:inline">Analysis</span>
                </button>
                <label className="inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-2xl border border-white/[0.1] bg-white/[0.04] px-3 text-xs font-semibold text-gray-200">
                  <Download className="h-4 w-4 text-violet-300" />
                  <span className="hidden sm:inline">Apple Health</span>
                  <input type="file" accept=".xml,.csv,text/xml,text/csv" onChange={importAppleHealthWeights} className="hidden" />
                </label>
                <button type="button" onClick={() => { resetWeightForm(); setShowAddForm(true); }} className="ui-btn-primary inline-flex min-h-11 items-center gap-2 px-3 text-xs">
                  <Plus className="h-4 w-4" /> Log weight
                </button>
              </div>
            </div>

            <section className="weight-snapshot-grid grid grid-cols-2 gap-2 sm:grid-cols-4">
              <div className="weight-stat weight-stat--primary">
                <span>Current</span><strong>{stats.current || '—'}</strong><small>lb</small>
              </div>
              <div className="weight-stat">
                <span>7-day trend</span><strong>{latestTrend ? latestTrend.weightTrend.toFixed(1) : '—'}</strong><small>lb</small>
              </div>
              <div className="weight-stat">
                <span>This week</span><strong className={trendWeekChange != null && trendWeekChange < 0 ? 'text-emerald-300' : trendWeekChange > 0 ? 'text-rose-300' : ''}>{formatDelta(trendWeekChange)}</strong><small>lb</small>
              </div>
              <div className="weight-stat">
                <span>30 days</span><strong className={thirtyDayChange != null && thirtyDayChange < 0 ? 'text-emerald-300' : thirtyDayChange > 0 ? 'text-rose-300' : ''}>{formatDelta(thirtyDayChange)}</strong><small>lb</small>
              </div>
            </section>

            {weightEntries.length > 0 ? (
              <section className="weight-chart-panel ui-hero-panel overflow-hidden">
                <div className="ui-hero-panel__wash" aria-hidden />
                <div className="ui-hero-panel__top-bar" aria-hidden />
                <div className="relative px-3 pt-4 sm:px-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-accent/80">Primary trend</div>
                      <h3 className="mt-1 text-base font-semibold text-white">Seven-day average</h3>
                      <p className="mt-0.5 text-xs text-gray-400">Mint shows direction. Daily readings stay quiet in gray.</p>
                    </div>
                    <div className="ui-segmented !rounded-2xl !border-white/[0.08]">
                      {[4, 8, 12, 26, 0].map((weeks) => (
                        <button key={weeks || 'all'} type="button" onClick={() => setChartRangeWeeks(weeks)} className={`ui-segmented-btn !min-w-10 !px-2 ${chartRangeWeeks === weeks ? 'ui-segmented-btn-active' : ''}`}>
                          {weeks === 0 ? 'All' : weeks === 26 ? '6m' : `${weeks}w`}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="relative -mx-1 mt-3">
                  <ResponsiveContainer width="100%" height={310}>
                    <ComposedChart data={chartData} margin={{ top: 10, right: 12, left: 22, bottom: 8 }}>
                      <defs>
                        <linearGradient id="weightPageTrendFill" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#5EEAD4" stopOpacity={0.18} />
                          <stop offset="100%" stopColor="#5EEAD4" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid vertical={false} stroke="rgba(148,163,184,.16)" />
                      <XAxis dataKey="date" axisLine={false} tickLine={false} tickMargin={10} interval={xInterval} minTickGap={42} fontSize={11} />
                      <YAxis axisLine={false} tickLine={false} tickMargin={7} width={34} domain={yDomain} allowDecimals={false} tickCount={6} fontSize={11} />
                      <Tooltip content={({ active, payload, label }) => {
                        if (!active || !payload?.length) return null;
                        const point = payload[0]?.payload;
                        return <div className="rounded-2xl border border-white/[0.1] bg-slate-950/95 px-3 py-2.5 shadow-2xl"><div className="text-xs font-semibold text-white">{label}</div>{point?.weight != null && <div className="mt-1 text-sm text-gray-200">Reading {point.weight} lb</div>}{point?.weightTrend != null && <div className="text-xs text-accent">Trend {point.weightTrend.toFixed(1)} lb</div>}{point?.injections?.length > 0 && <div className="mt-2 border-t border-white/[0.08] pt-2 text-[11px] text-violet-200">{point.injections.map((item) => item.type).join(' · ')}</div>}</div>;
                      }} />
                      {weightGraphMode !== 'actual' && <Area type="monotone" dataKey="weightTrend" fill="url(#weightPageTrendFill)" stroke="none" connectNulls={false} />}
                      {weightGraphMode !== 'trend' && <Line type="monotone" dataKey="weight" stroke="#94A3B8" strokeOpacity={0.55} strokeWidth={1.25} dot={{ r: 1.25, fill: '#94A3B8', strokeWidth: 0 }} activeDot={{ r: 3, fill: '#0F172A', stroke: '#CBD5E1', strokeWidth: 1.5 }} connectNulls={false} name="Reading" />}
                      {weightGraphMode !== 'actual' && <Line type="monotone" dataKey="weightTrend" stroke="#5EEAD4" strokeWidth={4.5} dot={false} activeDot={{ r: 4, fill: '#071612', stroke: '#99F6E4', strokeWidth: 2 }} connectNulls={false} name="7-day trend" />}
                    </ComposedChart>
                  </ResponsiveContainer>
                </div>
                <div className="relative flex items-center justify-between gap-3 border-t border-white/[0.06] px-4 py-3">
                  <p className="text-[11px] text-gray-400">Daily injection details appear when you tap a point.</p>
                  <div className="inline-flex rounded-xl bg-black/20 p-1">
                    {[['trend', 'Trend'], ['both', 'Both'], ['actual', 'Readings']].map(([mode, label]) => <button key={mode} type="button" onClick={() => setWeightGraphMode(mode)} className={`rounded-lg px-2.5 py-1.5 text-[11px] font-semibold ${weightGraphMode === mode ? 'bg-accent/15 text-accent' : 'text-gray-500'}`}>{label}</button>)}
                  </div>
                </div>
              </section>
            ) : (
              <section className="ui-card p-8 text-center"><Scale className="mx-auto h-10 w-10 text-accent" /><h3 className="mt-3 font-semibold text-white">Log your first weight</h3><p className="mt-1 text-sm text-gray-400">Your seven-day trend will build as readings are added.</p><button type="button" onClick={() => setShowAddForm(true)} className="ui-btn-primary mt-4">Add weight</button></section>
            )}

            {showAddForm && (
              <section className="ui-card p-4">
                <div className="flex items-center justify-between gap-3"><div><div className="text-[10px] font-semibold uppercase tracking-[0.16em] text-accent/80">Quick entry</div><h3 className="mt-1 font-semibold text-white">{editingWeight ? 'Edit weight' : 'Log weight'}</h3></div><button type="button" onClick={resetWeightForm} className="rounded-xl p-2 text-gray-400 hover:bg-white/[0.05] hover:text-white" aria-label="Close weight form"><X className="h-4 w-4" /></button></div>
                <div className="mt-4 grid grid-cols-[1fr_9rem] gap-3"><label><span className="mb-1.5 block text-xs font-medium text-gray-400">Weight (lb)</span><input type="number" step="0.1" inputMode="decimal" value={weight} onChange={(event) => setWeight(event.target.value)} className="w-full px-4 py-3 text-xl font-semibold" placeholder={stats.current || 'Weight'} /></label><label><span className="mb-1.5 block text-xs font-medium text-gray-400">Date</span><input type="date" value={weightDate} onChange={(event) => setWeightDate(event.target.value)} className="w-full px-3 py-3 text-sm" /></label></div>
                <button type="button" onClick={addOrUpdateWeight} className="ui-btn-primary mt-4 w-full">{editingWeight ? 'Save changes' : 'Save weight'}</button>
              </section>
            )}

            {weeklyRows.length > 0 && (
              <section className="ui-card overflow-hidden">
                <div className="flex items-start justify-between gap-3 border-b border-white/[0.06] p-4"><div><div className="text-[10px] font-semibold uppercase tracking-[0.16em] text-violet-300">Stack response</div><h3 className="mt-1 text-base font-semibold text-white">Weekly weight &amp; protocols</h3><p className="mt-1 text-xs text-gray-400">What you took and how your weight moved.</p></div><select value={weeklyDoseWeekStartsOn} onChange={(event) => { const value = Number(event.target.value); setWeeklyDoseWeekStartsOn(value); saveData('health-weekly-dose-week-starts-on', value); }} className="!min-h-10 !w-20 !px-2 !py-1 text-xs" aria-label="Week starts on"><option value={1}>Mon</option><option value={0}>Sun</option><option value={2}>Tue</option><option value={3}>Wed</option><option value={4}>Thu</option><option value={5}>Fri</option><option value={6}>Sat</option></select></div>
                <div className="divide-y divide-white/[0.06]">
                  {weeklyRows.slice(-6).reverse().map((row) => {
                    const doses = Object.entries(row.perMed || {}).filter(([, value]) => Number(value?.displayDose) > 0);
                    return <div key={`${row.weekIndex}-${row.weekLabel}`} className="p-4"><div className="flex items-start justify-between gap-3"><div><div className="text-sm font-semibold text-white">{row.weekLabel}</div><div className="mt-1 text-xs text-gray-400">{row.weekStartWeight != null ? row.weekStartWeight.toFixed(1) : '—'} → {row.weekEndWeight != null ? row.weekEndWeight.toFixed(1) : '—'} lb</div></div><span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${row.weightChange == null ? 'bg-white/[0.05] text-gray-400' : row.weightChange < 0 ? 'bg-emerald-500/12 text-emerald-300' : row.weightChange > 0 ? 'bg-rose-500/12 text-rose-300' : 'bg-white/[0.05] text-gray-300'}`}>{row.weightChange == null ? '—' : `${row.weightChange > 0 ? '+' : ''}${row.weightChange.toFixed(1)} lb`}</span></div><div className="mt-3 flex flex-wrap gap-1.5">{doses.length ? doses.map(([medName, value]) => <span key={medName} className="rounded-xl border border-white/[0.08] bg-white/[0.035] px-2.5 py-1.5 text-[11px] text-gray-300"><strong className="text-white">{medName}</strong> · {Number(value.displayDose).toFixed(2).replace(/\.00$/, '')} {value.unit || 'mg'}</span>) : <span className="text-xs text-gray-500">No doses logged</span>}</div></div>;
                  })}
                </div>
                {weeklyRows.length > 6 && <button type="button" onClick={() => setActiveTab('insights')} className="w-full border-t border-white/[0.06] px-4 py-3 text-xs font-semibold text-accent">See full history in Insights</button>}
              </section>
            )}

            <section className="ui-card overflow-hidden">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/[0.06] p-4"><div><h3 className="font-semibold text-white">Weight history</h3><p className="mt-1 text-xs text-gray-400">Five recent entries, with unusual changes flagged.</p></div><div className="flex items-center gap-2"><input type="date" value={weightHistoryFilterDate} onChange={(event) => setWeightHistoryFilterDate(event.target.value)} className="!min-h-10 !w-36 !px-2 !py-1 text-xs" aria-label="Filter weight history by week" />{weightHistoryFilterDate && <button type="button" onClick={() => setWeightHistoryFilterDate('')} className="text-xs font-medium text-gray-400">Clear</button>}</div></div>
              {visibleHistoryRows.length ? <div className="divide-y divide-white/[0.06]">{visibleHistoryRows.map((entry) => <div key={entry.id} className="flex items-center justify-between gap-3 px-4 py-3"><div className="min-w-0"><div className="flex items-baseline gap-2"><span className="text-lg font-semibold text-white">{entry.weight}</span><span className="text-xs text-gray-500">lb</span>{isWeightOutlier(entry) && <span className="rounded-full bg-amber-500/10 px-2 py-0.5 text-[10px] font-semibold text-amber-300">Review</span>}</div><div className="mt-0.5 text-xs text-gray-400">{parseLocalDate(entry.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</div></div><div className="flex items-center gap-1"><button type="button" onClick={() => { setEditingWeight(entry); setWeight(entry.weight.toString()); setWeightDate(entry.date); setShowAddForm(true); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="rounded-xl p-2.5 text-gray-400 hover:bg-white/[0.05] hover:text-white" aria-label={`Edit ${entry.weight} pounds`}><Edit2 className="h-4 w-4" /></button><button type="button" onClick={() => deleteWeight(entry.id)} className="rounded-xl p-2.5 text-gray-500 hover:bg-red-500/10 hover:text-red-300" aria-label={`Delete ${entry.weight} pounds`}><Trash2 className="h-4 w-4" /></button></div></div>)}</div> : <div className="p-8 text-center text-sm text-gray-400">No weight entries in this week.</div>}
              {historyRows.length > 5 && <button type="button" onClick={() => setShowAllWeightHistory((value) => !value)} className="w-full border-t border-white/[0.06] px-4 py-3 text-xs font-semibold text-accent">{showAllWeightHistory ? 'Show recent only' : `Show all ${historyRows.length} entries`}</button>}
            </section>
          </div>
          );
        })()}

        {/* Legacy weight tools are retained in data but no longer displayed on this focused page. */}
        {false && activeTab === 'weight' && (
          <div key="weight" className="space-y-4 tab-enter">
            <div className="ui-card p-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-400 text-sm">Height (for BMI)</span>
                <span className="text-white text-sm">{userProfile?.height ?? 70} in</span>
                <button type="button" onClick={() => { setActiveTab('more'); setActiveMoreSection('profile'); }} className="text-gold-400 hover:text-accent text-xs">
                  Edit in Profile
                </button>
              </div>
            </div>

            <div className="ui-hero-panel">
              <div className="ui-hero-panel__wash" aria-hidden />
              <div className="ui-hero-panel__top-bar" aria-hidden />
              <div className="ui-hero-panel__body">
                <div className="grid grid-cols-2 gap-3">
                  <div className="ui-card p-4">
                    <div className="text-gray-400 text-sm mb-1">Current Weight</div>
                    <div className="text-2xl font-bold text-white">{stats.current} <span className="text-sm text-gray-400">lbs</span></div>
                  </div>
                  <div className="ui-card p-4">
                    <div className="text-gray-400 text-sm mb-1">BMI</div>
                    <div className={`text-2xl font-bold ${bmiCategory.color}`}>{stats.bmi || '-'}</div>
                    <div className={`text-xs ${bmiCategory.color}`}>{bmiCategory.label}</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-2xl p-4 border border-accent/20 bg-accent/5 backdrop-blur-sm">
              <p className="text-gray-300 text-sm mb-2">Use the Calorie / TDEE calculator when you want a practical nutrition reference.</p>
              <button onClick={() => { setActiveTab('more'); setActiveMoreSection('tools'); setActiveToolSection('calculator'); }} className="text-gold-400 hover:text-gold-400 text-sm font-medium flex items-center gap-2">
                <Calculator className="h-4 w-4" /> Open Calorie & TDEE Calculator
              </button>
            </div>

            {showAddForm && (
              <div className="ui-card p-4">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-white font-medium">{editingWeight ? 'Edit Entry' : 'Add Weight'}</h3>
                  <button onClick={resetWeightForm} className="text-gray-400 hover:text-white"><X className="h-5 w-5" /></button>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="text-gray-400 text-sm block mb-1">Weight (lbs)</label>
                    <input type="number" step="0.1" value={weight} onChange={(e) => setWeight(e.target.value)} className="w-full bg-slate-700 text-white rounded-lg px-4 py-3" placeholder="Enter weight" />
                  </div>
                  <div>
                    <label className="text-gray-400 text-sm block mb-1">Date</label>
                    <input type="date" value={weightDate} onChange={(e) => setWeightDate(e.target.value)} className="w-full bg-slate-700 text-white rounded-lg px-4 py-3" />
                  </div>
                  <button onClick={addOrUpdateWeight} className="w-full btn-primary text-white font-medium py-3 rounded-lg transform hover:scale-105 transition-all">{editingWeight ? 'Update' : 'Add Entry'}</button>
                </div>
              </div>
            )}

            <div className="ui-card p-4">
              <div className="flex justify-between items-center mb-4 gap-2">
                <h3 className="text-white font-medium">History</h3>
                <div className="flex items-center gap-2">
                  <input
                    type="date"
                    value={weightHistoryFilterDate}
                    onChange={(e) => setWeightHistoryFilterDate(e.target.value)}
                    className="bg-slate-800 text-gray-200 text-xs rounded-lg px-2 py-1.5"
                    title="Filter by week (pick any day in the week)"
                  />
                  {weightHistoryFilterDate && (
                    <button
                      type="button"
                      onClick={() => setWeightHistoryFilterDate('')}
                      className="text-gray-500 hover:text-gray-300 text-xs"
                    >
                      Clear
                    </button>
                  )}
                  {!showAddForm && (
                    <button onClick={() => setShowAddForm(true)} className="bg-green-500 hover:bg-green-600 text-white p-2 rounded-lg">
                      <Plus className="h-5 w-5" />
                    </button>
                  )}
                </div>
              </div>
              {weightEntries.length === 0 ? (
                <div className="text-center py-12 px-4">
                  <div className="relative mb-4">
                    <div className="absolute inset-0 bg-green-500/10 blur-2xl rounded-full"></div>
                    <Scale className="h-16 w-16 mx-auto text-green-500 relative animate-bounce" style={{ animationDuration: '3s' }} />
                  </div>
                  <h3 className="text-white font-medium mb-2">Track Your Progress</h3>
                  <p className="text-gray-400 text-sm mb-4">Start logging your weight to see your journey unfold</p>
                  <button 
                    onClick={() => setShowAddForm(true)} 
                    className="btn-primary text-white font-medium px-6 py-2 rounded-lg inline-flex items-center gap-2"
                  >
                    <Plus className="h-4 w-4" />
                    Add First Entry
                  </button>
                </div>
              ) : (
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {(() => {
                    const sorted = sortWeightByDateDesc(weightEntries);
                    if (!weightHistoryFilterDate) return sorted;
                    const selected = parseLocalDate(weightHistoryFilterDate);
                    if (!selected) return sorted;
                    const startOfWeek = (d) => {
                      const date = new Date(d);
                      const day = date.getDay();
                      const diff = day === 0 ? -6 : 1 - day;
                      date.setDate(date.getDate() + diff);
                      date.setHours(0, 0, 0, 0);
                      return date;
                    };
                    const ws = startOfWeek(selected);
                    const we = new Date(ws.getTime() + 6 * 24 * 60 * 60 * 1000);
                    return sorted.filter(entry => {
                      const d = parseLocalDate(entry.date);
                      return d && d >= ws && d <= we;
                    });
                  })().map((entry) => (
                    <div key={entry.id} className="flex items-center justify-between bg-slate-700/50 rounded-lg p-3 group">
                      <div className="flex items-center gap-3">
                        <div className="bg-pink-500/20 p-2 rounded-lg"><Scale className="h-5 w-5 text-pink-400" /></div>
                        <div>
                          <div className="text-white font-medium">{entry.weight} lbs</div>
                          <div className="text-gray-400 text-sm">{parseLocalDate(entry.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</div>
                          {isWeightOutlier(entry) && <div className="mt-1 text-[10px] font-medium text-amber-300">Large change — tap Edit to review</div>}
                        </div>
                      </div>
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => { setEditingWeight(entry); setWeight(entry.weight.toString()); setWeightDate(entry.date); setShowAddForm(true); }} className="p-2 text-gray-400 hover:text-white hover:bg-slate-600 rounded-lg"><Edit2 className="h-4 w-4" /></button>
                        <button onClick={() => deleteWeight(entry.id)} className="p-2 text-gray-400 hover:text-red-400 hover:bg-slate-600 rounded-lg"><Trash2 className="h-4 w-4" /></button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Fasting Window Tracker - Separate Section */}
            <div className="bg-gradient-to-br from-accent/10 to-gold-600/10 border border-accent/30 rounded-xl p-4">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-accent/20 rounded-lg">
                    <Clock className="h-5 w-5 text-gold-400" />
                  </div>
                  <div>
                    <h3 className="text-white font-medium">Fasting Window Tracker</h3>
                    <p className="text-gray-400 text-xs">Track your daily intermittent fasting</p>
                  </div>
                </div>
                {!showFastingForm && (
                  <button onClick={() => setShowFastingForm(true)} className="bg-accent hover:bg-gold-600 text-white p-2 rounded-lg">
                    <Plus className="h-5 w-5" />
                  </button>
                )}
              </div>

              {/* Fasting Stats Summary */}
              {fastingEntries.length > 0 && (
                <div className="grid grid-cols-3 gap-3 mb-4">
                  <div className="bg-[var(--bg-card)] rounded-lg p-3 text-center">
                    <div className="text-gray-400 text-xs">Current Streak</div>
                    <div className="text-2xl font-bold text-gold-400">
                      {(() => {
                        const sorted = [...fastingEntries].sort((a, b) => parseLocalDate(b.date) - parseLocalDate(a.date));
                        let streak = 0;
                        const today = new Date();
                        for (let i = 0; i < sorted.length; i++) {
                          const entryDate = parseLocalDate(sorted[i].date);
                          const daysDiff = Math.floor((today - entryDate) / (1000 * 60 * 60 * 24));
                          if (daysDiff === i) streak++;
                          else break;
                        }
                        return streak;
                      })()}
                    </div>
                    <div className="text-gray-500 text-xs">days</div>
                  </div>
                  <div className="bg-[var(--bg-card)] rounded-lg p-3 text-center">
                    <div className="text-gray-400 text-xs">Avg Window</div>
                    <div className="text-2xl font-bold text-gold-400">
                      {fastingEntries.length > 0 ? Math.round(fastingEntries.reduce((sum, e) => sum + e.fastingHours, 0) / fastingEntries.length) : 0}
                    </div>
                    <div className="text-gray-500 text-xs">hours</div>
                  </div>
                  <div className="bg-[var(--bg-card)] rounded-lg p-3 text-center">
                    <div className="text-gray-400 text-xs">Total Days</div>
                    <div className="text-2xl font-bold text-gold-400">{fastingEntries.length}</div>
                    <div className="text-gray-500 text-xs">logged</div>
                  </div>
                </div>
              )}

              {/* Fasting Form */}
              {showFastingForm && (
                <div className="bg-[var(--bg-card)] rounded-xl p-4 mb-4">
                  <div className="flex justify-between items-center mb-4">
                    <h4 className="text-white font-medium">{editingFasting ? 'Edit Fasting' : 'Log Fasting Window'}</h4>
                    <button onClick={resetFastingForm} className="text-gray-400 hover:text-white">
                      <X className="h-5 w-5" />
                    </button>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <label className="text-gray-400 text-sm block mb-1">Fasting Window</label>
                      <div className="flex gap-2 items-center">
                        <input 
                          type="number" 
                          step="1" 
                          min="1" 
                          max="23" 
                          value={fastingHours} 
                          onChange={(e) => setFastingHours(e.target.value)} 
                          className="flex-1 bg-slate-700 text-white rounded-lg px-4 py-3 text-center text-2xl font-bold" 
                          placeholder="14" 
                        />
                        <span className="text-gray-400 text-xl">/</span>
                        <div className="flex-1 bg-slate-700/50 text-gray-400 rounded-lg px-4 py-3 text-center text-2xl font-bold">
                          {fastingHours ? 24 - parseInt(fastingHours) : '10'}
                        </div>
                      </div>
                      <p className="text-gray-500 text-xs mt-2">
                        {fastingHours && parseInt(fastingHours) >= 1 && parseInt(fastingHours) <= 23 ? (
                          <>Fast for {fastingHours} hours, eat for {24 - parseInt(fastingHours)} hours</>
                        ) : (
                          'Enter fasting hours (e.g., 14 for 14/10 fast, 16 for 16/8 fast)'
                        )}
                      </p>
                    </div>
                    <div>
                      <label className="text-gray-400 text-sm block mb-1">Date</label>
                      <input 
                        type="date" 
                        value={fastingDate} 
                        onChange={(e) => setFastingDate(e.target.value)} 
                        className="w-full bg-slate-700 text-white rounded-lg px-4 py-3" 
                      />
                    </div>
                    <button 
                      onClick={addOrUpdateFasting} 
                      className="w-full btn-amber text-white font-medium py-3 rounded-lg transform hover:scale-105 transition-all"
                    >
                      {editingFasting ? 'Update' : 'Log Fasting'}
                    </button>
                  </div>
                </div>
              )}

              {/* Fasting History */}
              <div>
                <h4 className="text-white font-medium mb-2 text-sm">Fasting History</h4>
                {fastingEntries.length === 0 ? (
                  <div className="text-center py-10 px-4">
                    <div className="relative mb-4">
                      <div className="absolute inset-0 bg-accent/10 blur-2xl rounded-full"></div>
                      <Clock className="h-16 w-16 mx-auto text-gold-400 relative" style={{ animation: 'pulse-glow 2s ease-in-out infinite' }} />
                    </div>
                    <h3 className="text-white font-medium mb-2">Start Fasting Tracker</h3>
                    <p className="text-gray-400 text-sm mb-4">Log your intermittent fasting windows and build streaks!</p>
                    <button 
                      onClick={() => setShowFastingForm(true)} 
                      className="btn-amber text-white font-medium px-6 py-2 rounded-lg inline-flex items-center gap-2"
                    >
                      <Plus className="h-4 w-4" />
                      Log First Fast
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {[...fastingEntries].sort((a, b) => parseLocalDate(b.date) - parseLocalDate(a.date)).map((entry) => (
                      <div key={entry.id} className="flex items-center justify-between bg-[var(--bg-card)] rounded-lg p-3 group">
                        <div className="flex items-center gap-3">
                          <div className="bg-accent/20 p-2 rounded-lg">
                            <Clock className="h-5 w-5 text-gold-400" />
                          </div>
                          <div>
                            <div className="text-white font-medium flex items-center gap-2">
                              <span className="text-2xl">{entry.fastingHours}</span>
                              <span className="text-gray-400">/</span>
                              <span className="text-gray-400 text-xl">{24 - entry.fastingHours}</span>
                              <span className="text-xs bg-accent/20 text-gold-400 px-2 py-0.5 rounded ml-1">
                                {entry.fastingHours}/{24 - entry.fastingHours}
                              </span>
                            </div>
                            <div className="text-gray-400 text-sm">
                              {parseLocalDate(entry.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button 
                            onClick={() => { 
                              setEditingFasting(entry); 
                              setFastingHours(entry.fastingHours.toString()); 
                              setFastingDate(entry.date); 
                              setShowFastingForm(true); 
                            }} 
                            className="p-2 text-gray-400 hover:text-white hover:bg-slate-700 rounded-lg"
                          >
                            <Edit2 className="h-4 w-4" />
                          </button>
                          <button 
                            onClick={() => deleteFasting(entry.id)} 
                            className="p-2 text-gray-400 hover:text-red-400 hover:bg-slate-700 rounded-lg"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* INJECTIONS TAB */}
        {activeTab === 'injections' && (
          <div key="injections" className="space-y-4 tab-enter">
            <div className="flex items-center justify-between gap-3">
              <div><h2 className="text-xl font-bold tracking-tight text-white">Doses</h2><p className="mt-0.5 text-xs text-gray-500">Log administrations and review dose history.</p></div>
              <button type="button" onClick={() => { setActiveTab('protocols'); setActiveMoreSection('tools'); setActiveToolSection('schedule'); }} className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-white/[0.08] bg-white/[0.035] px-3 text-xs font-medium text-gray-200"><Layers className="h-4 w-4 text-gold-400" /> Protocols</button>
            </div>
            <div className="grid grid-cols-4 gap-2">
              {['GLP-1', 'Peptide', 'Hormone', 'Other'].map(cat => {
                const count = injectionEntries.filter(e => {
                  const med = MEDICATIONS.find(m => m.name === e.type);
                  if (!med) return cat === 'Other';
                  if (cat === 'GLP-1') return med.category === 'GLP-1' || med.category === 'GLP-1/GIP';
                  if (cat === 'Peptide') return med.category === 'Peptide' || med.category === 'Triple Agonist';
                  if (cat === 'Hormone') return med.category === 'Hormone';
                  return med.category === 'Other';
                }).length;
                return <div key={cat} className="bg-[var(--bg-card)] rounded-xl p-2 text-center"><div className="text-lg font-bold text-white">{count}</div><div className="text-xs text-gray-400 truncate">{cat}</div></div>;
              })}
            </div>

            {/* Your vials — remaining volume on Injections page */}
            {vials.length > 0 && (
              <div className="ui-hero-panel">
                <div className="ui-hero-panel__wash" aria-hidden />
                <div className="ui-hero-panel__top-bar" aria-hidden />
                <div className="ui-hero-panel__body">
                <h3 className="text-white font-medium text-sm mb-2 flex items-center gap-2"><Syringe className="h-4 w-4 text-gold-400" />Your vials</h3>
                <div className="space-y-2">
                  {vials.map(v => {
                    const remMg = v.remainingMg ?? v.totalMg;
                    const totalMg = v.totalMg;
                    const conc = v.concentration;
                    const remMl = conc > 0 ? remMg / conc : null;
                    const totalMl = conc > 0 ? totalMg / conc : null;
                    const isLow = remMg <= 0;
                    const forecast = getVialForecast(v);
                    return (
                      <div key={v.id} className={`flex justify-between items-center py-2 px-3 rounded-lg text-sm ${isLow ? 'bg-slate-700/50 opacity-70' : 'bg-slate-700/30'}`}>
                        <span className="text-white font-medium">{v.medication}</span>
                        <span className="text-gray-400">
                          {remMg.toFixed(1)} / {totalMg.toFixed(1)} mg
                          {conc > 0 && remMl != null && totalMl != null && <span className="text-gray-500 ml-1">· {remMl.toFixed(1)} / {totalMl.toFixed(1)} ml</span>}
                          {forecast && <span className="block text-[10px] text-gold-400/80">~{forecast.dosesRemaining} doses · through {parseLocalDate(forecast.through).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>}
                        </span>
                      </div>
                    );
                  })}
                </div>
                <button type="button" onClick={() => { setActiveTab('more'); setActiveMoreSection('tools'); setActiveToolSection('vials'); }} className="text-gray-500 hover:text-gold-400 text-xs mt-2">Add or edit in More → Tools → Vials</button>
                </div>
              </div>
            )}

            {showAddForm && (
              <div className="ui-hero-panel">
                <div className="ui-hero-panel__wash" aria-hidden />
                <div className="ui-hero-panel__top-bar" aria-hidden />
                <div className="ui-hero-panel__body">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-white font-medium">{editingInjection ? 'Edit Injection' : 'Log Injection'}</h3>
                  <button onClick={resetInjectionForm} className="text-gray-400 hover:text-white"><X className="h-5 w-5" /></button>
                </div>
                <div className="space-y-4">
                  <div className="relative">
                    <label className="text-gray-400 text-sm block mb-1">Medication</label>
                    <button onClick={() => setShowMedDropdown(!showMedDropdown)} className="w-full bg-slate-700 text-white rounded-lg px-4 py-3 text-left flex items-center justify-between">
                      <span style={{ color: getMedicationColor(injectionType) }}>{injectionType}</span>
                      <ChevronDown className={`h-5 w-5 transition-transform ${showMedDropdown ? 'rotate-180' : ''}`} />
                    </button>
                    {showMedDropdown && (
                      <div className="absolute z-10 w-full mt-1 bg-slate-700 rounded-lg shadow-xl max-h-64 overflow-y-auto">
                        <input type="text" placeholder="Search..." value={medSearchTerm} onChange={(e) => setMedSearchTerm(e.target.value)} className="w-full bg-slate-600 text-white px-4 py-2 rounded-t-lg" autoFocus />
                        {Object.entries(groupedMedications).map(([category, meds]) => (
                          <div key={category}>
                            <div className="px-4 py-1 text-xs font-medium text-gray-400 bg-[var(--bg-card)]">{category}</div>
                            {meds.map(med => <button key={med.name} onClick={() => { setInjectionType(med.name); setShowMedDropdown(false); setMedSearchTerm(''); }} className="w-full px-4 py-2 text-left hover:bg-slate-600 flex items-center gap-2"><div className="w-3 h-3 rounded-full" style={{ backgroundColor: med.color }}></div><span className="text-white">{med.name}</span></button>)}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  <div>
                    <label className="text-gray-400 text-sm block mb-1">Dose</label>
                    <div className="flex gap-2">
                      <input type="number" step="0.01" value={injectionDose} onChange={(e) => setInjectionDose(e.target.value)} className="flex-1 bg-slate-700 text-white rounded-lg px-4 py-3" placeholder="Amount" />
                      <select value={injectionUnit} onChange={(e) => setInjectionUnit(e.target.value)} className="bg-slate-700 text-white rounded-lg px-3 py-3">
                        <option value="mg">mg</option><option value="mcg">mcg</option><option value="ml">ml</option><option value="units">units</option><option value="IU">IU</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="text-gray-400 text-sm block mb-1">Date &amp; time</label>
                    <div className="flex gap-2">
                      <input type="date" value={injectionDate} onChange={(e) => setInjectionDate(e.target.value)} className="flex-1 bg-slate-700 text-white rounded-lg px-4 py-3" />
                      <input type="time" value={injectionTime} onChange={(e) => setInjectionTime(e.target.value)} className="w-[7rem] bg-slate-700 text-white rounded-lg px-3 py-3" />
                    </div>
                  </div>
                  {(() => {
                    const matchingVials = vials.filter(v => v.medication === injectionType);
                    const availableVials = matchingVials.filter(v => (v.remainingMg ?? v.totalMg) > 0);
                    const linkedVialWhenEditing = editingInjection?.vialId ? matchingVials.find(v => v.id === editingInjection.vialId) : null;
                    const options = [...availableVials];
                    if (linkedVialWhenEditing && !options.find(o => o.id === linkedVialWhenEditing.id))
                      options.push(linkedVialWhenEditing);
                    if (options.length === 0 && matchingVials.length === 0) {
                      return (
                        <p className="text-gray-500 text-xs">Add vials in More → Tools → Vials for this medication to track inventory.</p>
                      );
                    }
                    if (options.length === 0) return null;
                    return (
                      <div>
                        <label className="text-gray-400 text-sm block mb-1">Use from vial (optional)</label>
                        <select value={selectedVialId != null ? String(selectedVialId) : ''} onChange={(e) => setSelectedVialId(e.target.value ? Number(e.target.value) : null)} className="w-full bg-slate-700 text-white rounded-lg px-4 py-3">
                          <option value="">None</option>
                          {options.map(v => {
                            const rem = v.remainingMg ?? v.totalMg;
                            return (
                              <option key={v.id} value={v.id}>
                                {rem.toFixed(1)} mg left{v.expiry ? ` · Exp ${v.expiry}` : ''}{rem <= 0 ? ' (empty)' : ''}
                              </option>
                            );
                          })}
                        </select>
                        {selectedVialId && injectionDose && (() => {
                          const v = vials.find(x => x.id === selectedVialId);
                          const remaining = v ? (v.remainingMg ?? v.totalMg) : 0;
                          const deduct = getDoseMgForVial(injectionDose, injectionUnit, selectedVialId, injectionType);
                          const after = Math.max(0, remaining - deduct);
                          const conc = getVialConcentrationMgPerMl(v);
                          const u = (injectionUnit || '').toLowerCase();
                          let breakdown = null;
                          if (deduct > 0) {
                            if (injectionType === 'Retatrutide' && u === 'units') {
                              breakdown = `${injectionDose} units ÷ ${RETATRUTIDE_UNITS_PER_MG} = ${deduct.toFixed(2)} mg (Retatrutide pen dial)`;
                            } else if (conc > 0) {
                              if (u === 'units') {
                                const ml = parseFloat(injectionDose) / 100;
                                breakdown = `${injectionDose} units = ${ml.toFixed(3)} mL (U-100) × ${conc.toFixed(2)} mg/mL ≈ ${deduct.toFixed(2)} mg`;
                              } else if (u === 'ml') {
                                breakdown = `${injectionDose} mL × ${conc.toFixed(2)} mg/mL ≈ ${deduct.toFixed(2)} mg`;
                              }
                            }
                          }
                          return (
                            <div className="text-gray-500 text-xs mt-1 space-y-0.5">
                              {breakdown && <p className="text-gray-400">{breakdown}</p>}
                              {conc <= 0 && (u === 'units' || u === 'ml') && injectionType !== 'Retatrutide' && (
                                <p className="text-amber-400/90">Set vial total (mg) + BAC (ml) or concentration so units convert to mg.</p>
                              )}
                              <p>After this dose: {after.toFixed(1)} mg remaining in vial</p>
                            </div>
                          );
                        })()}
                      </div>
                    );
                  })()}
                  {(() => {
                    const target = parseFloat(trialTargetMg);
                    const hasTarget = !isNaN(target) && target > 0;
                    const vPick = selectedVialId ? vials.find((x) => x.id === selectedVialId) : vials.find((x) => x.medication === injectionType && getVialConcentrationMgPerMl(x) > 0);
                    const conc = vPick ? getVialConcentrationMgPerMl(vPick) : 0;
                    let unitsOut = null;
                    let mlOut = null;
                    let hint = null;
                    if (hasTarget) {
                      if (injectionType === 'Retatrutide') {
                        unitsOut = target * RETATRUTIDE_UNITS_PER_MG;
                        hint = 'Retatrutide pen: 10 units = 1 mg on the dial.';
                      } else if (conc > 0) {
                        mlOut = target / conc;
                        unitsOut = mlOut * 100;
                        hint = `U-100 syringe: ${conc.toFixed(2)} mg/mL from vial${vPick && selectedVialId !== vPick.id ? ' (first vial with concentration for this med)' : ''}.`;
                      } else {
                        hint = 'Add this medication under Tools → Vials with total mg + BAC (or mg/mL) so concentration is known.';
                      }
                    }
                    return (
                      <div className="rounded-xl border border-accent/25 bg-accent/5 p-3 space-y-2">
                        <label className="text-gray-300 text-sm font-medium block">Trial / protocol target (mg per dose)</label>
                        <p className="text-gray-500 text-xs">From study notes—see suggested syringe units (or mL) for your current vial.</p>
                        <div className="flex flex-wrap gap-2 items-end">
                          <div className="flex-1 min-w-[8rem]">
                            <input
                              type="number"
                              step="0.01"
                              min="0"
                              value={trialTargetMg}
                              onChange={(e) => setTrialTargetMg(e.target.value)}
                              className="w-full bg-slate-700 text-white rounded-lg px-3 py-2.5"
                              placeholder="e.g. 1"
                            />
                          </div>
                          {hasTarget && unitsOut != null && (
                            <button
                              type="button"
                              onClick={() => {
                                setInjectionDose(unitsOut.toFixed(1));
                                setInjectionUnit('units');
                              }}
                              className="px-3 py-2.5 rounded-lg text-sm font-medium bg-accent text-gray-900 hover:brightness-105"
                            >
                              Apply units to dose
                            </button>
                          )}
                          {hasTarget && mlOut != null && mlOut > 0 && injectionType !== 'Retatrutide' && (
                            <button
                              type="button"
                              onClick={() => {
                                setInjectionDose(mlOut.toFixed(3));
                                setInjectionUnit('ml');
                              }}
                              className="px-3 py-2.5 rounded-lg text-sm font-medium bg-white/10 text-gray-200 hover:bg-white/15"
                            >
                              Apply mL to dose
                            </button>
                          )}
                        </div>
                        {hasTarget && unitsOut != null && (
                          <p className="text-gold-400/95 text-sm">
                            ≈ <strong>{unitsOut.toFixed(1)}</strong> units
                            {mlOut != null && mlOut > 0 && injectionType !== 'Retatrutide' && (
                              <span className="text-gray-400 font-normal"> · {mlOut.toFixed(3)} mL</span>
                            )}
                          </p>
                        )}
                        {hasTarget && hint && (
                          <p className={`text-xs ${conc <= 0 && injectionType !== 'Retatrutide' ? 'text-amber-400/90' : 'text-gray-500'}`}>{hint}</p>
                        )}
                      </div>
                    );
                  })()}
                  <div>
                    <label className="text-gray-400 text-sm block mb-2">Route <span className="text-gold-400">*</span></label>
                    <div className="flex gap-2">
                      {INJECTION_ROUTES.map((route) => (
                        <button key={route} type="button" onClick={() => setInjectionRoute(route)} className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all ${injectionRoute === route ? 'bg-accent text-gray-900' : 'bg-white/10 text-gray-300 hover:bg-white/15'}`}>{route === 'SubQ' ? 'SubQ (subcutaneous)' : 'IM (intramuscular)'}</button>
                      ))}
                    </div>
                    <p className="text-gray-500 text-xs mt-1">IM absorbs faster → earlier peak; level curve reflects route.</p>
                  </div>
                  <div>
                    <label className="text-gray-400 text-sm block mb-2">Body location</label>
                    {!editingInjection && (() => {
                      const suggested = getSuggestedInjectionSite(injectionType);
                      if (suggested && suggested !== injectionSite) {
                        return (
                          <div className="flex items-center justify-between gap-2 mb-2 p-2 rounded-lg bg-accent/10 border border-accent/20">
                            <span className="text-gray-300 text-xs">Rotate: try <strong className="text-gold-400">{suggested}</strong></span>
                            <button type="button" onClick={() => setInjectionSite(suggested)} className="text-xs font-medium text-accent hover:text-gold-400 whitespace-nowrap">Use suggested</button>
                          </div>
                        );
                      }
                      return null;
                    })()}
                    <div className="grid grid-cols-3 gap-2">
                      {BODY_LOCATIONS.map(loc => <button key={loc} type="button" onClick={() => setInjectionSite(loc)} className={`p-2 rounded-lg text-xs transition-all ${injectionSite === loc ? 'bg-accent text-gray-900' : 'bg-white/10 text-gray-300 hover:bg-white/15'}`}>{loc}</button>)}
                    </div>
                  </div>
                  <div>
                    <label className="text-gray-400 text-sm block mb-2">Side effects (tap to toggle, then set intensity 1–5)</label>
                    <div className="flex flex-wrap gap-2">
                      {SIDE_EFFECTS.map(effect => <button key={effect} type="button" onClick={() => toggleSideEffect(effect)} className={`px-3 py-1 rounded-full text-xs transition-all ${selectedSideEffects.includes(effect) ? 'bg-orange-500 text-white' : 'bg-white/10 text-gray-300 hover:bg-white/15'}`}>{effect}</button>)}
                    </div>
                    {selectedSideEffects.length > 0 && (
                      <div className="mt-3 space-y-2 rounded-lg bg-black/20 border border-white/[0.06] p-3">
                        {selectedSideEffects.map((effect) => (
                          <div key={effect} className="flex items-center gap-2 flex-wrap">
                            <span className="text-gray-400 text-xs w-32 shrink-0">{effect}</span>
                            <input
                              type="range"
                              min={1}
                              max={5}
                              value={sideEffectSeverity[effect] ?? 3}
                              onChange={(e) => setSideEffectSeverity((s) => ({ ...s, [effect]: parseInt(e.target.value, 10) }))}
                              className="flex-1 min-w-[100px] h-2 accent-orange-500"
                            />
                            <span className="text-gray-300 text-xs w-10">{sideEffectSeverity[effect] ?? 3}/5</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  <div>
                    <label className="text-gray-400 text-sm block mb-1">Notes</label>
                    <textarea value={injectionNotes} onChange={(e) => setInjectionNotes(e.target.value)} className="w-full bg-slate-700 text-white rounded-lg px-4 py-3 resize-none" rows={2} placeholder="Optional notes..." />
                  </div>
                  <button onClick={addOrUpdateInjection} className="w-full btn-secondary text-white font-medium py-3 rounded-lg transform hover:scale-105 transition-all">{editingInjection ? 'Update' : 'Log Injection'}</button>
                </div>
                </div>
              </div>
            )}

            <div className="ui-card overflow-hidden">
              <div className="flex items-center justify-between gap-3 p-4 border-b border-white/[0.06]">
                <div>
                  <h3 className="text-white font-semibold">Dose history</h3>
                  <p className="text-gray-500 text-xs mt-0.5">Grouped by medication. Tap one to see every dose and location.</p>
                </div>
                {!showAddForm && <button onClick={() => setShowAddForm(true)} className="bg-accent hover:bg-gold-400 text-gray-900 p-2.5 rounded-xl shadow-gold-glow shrink-0"><Plus className="h-5 w-5" /></button>}
              </div>
              <div className="grid gap-2 border-b border-white/[0.06] p-3 sm:grid-cols-[1fr_auto]">
                <label className="relative"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" /><input value={injectionHistorySearch} onChange={(event) => setInjectionHistorySearch(event.target.value)} className="w-full rounded-xl border border-white/[0.06] bg-slate-800 py-2.5 pl-9 pr-3 text-sm text-white placeholder:text-gray-600" placeholder="Search doses, sites, or notes" /></label>
                <select value={injectionHistoryStatus} onChange={(event) => setInjectionHistoryStatus(event.target.value)} className="rounded-xl border border-white/[0.06] bg-slate-800 px-3 py-2.5 text-sm text-white"><option value="all">All stacks</option><option value="active">Active</option><option value="paused">Paused</option><option value="archived">Archived</option></select>
              </div>
              {injectionEntries.length === 0 ? (
                <div className="text-center py-8 text-gray-400 text-sm"><Syringe className="h-10 w-10 mx-auto mb-2 opacity-40" /><p>No doses logged</p></div>
              ) : (
                <div>
                  {(() => {
                    let filtered = [...injectionEntries];
                    const search = injectionHistorySearch.trim().toLowerCase();
                    if (search) filtered = filtered.filter((entry) => [entry.type, entry.site, entry.route, entry.notes, entry.dose, entry.unit].some((value) => String(value || '').toLowerCase().includes(search)));
                    if (injectionHistoryStatus !== 'all') filtered = filtered.filter((entry) => {
                      const schedule = schedules.find((item) => item.medication === entry.type);
                      if (injectionHistoryStatus === 'archived') return insightsInactiveMeds.includes(entry.type);
                      if (injectionHistoryStatus === 'paused') return !!schedule?.paused && !insightsInactiveMeds.includes(entry.type);
                      return !!schedule && !schedule.paused && !insightsInactiveMeds.includes(entry.type);
                    });
                    if (injectionHistoryFilterDate) {
                      const selected = parseLocalDate(injectionHistoryFilterDate);
                      if (selected) {
                        const day = selected.getDay();
                        const ws = new Date(selected);
                        ws.setDate(ws.getDate() + (day === 0 ? -6 : 1 - day));
                        ws.setHours(0, 0, 0, 0);
                        const we = new Date(ws.getTime() + (7 * 24 * 60 * 60 * 1000) - 1);
                        filtered = filtered.filter((entry) => {
                          const date = parseLocalDate(entry.date);
                          return date && date >= ws && date <= we;
                        });
                      }
                    }
                    const byMed = filtered.reduce((acc, entry) => {
                      const name = entry.type || 'Other';
                      if (!acc[name]) acc[name] = [];
                      acc[name].push(entry);
                      return acc;
                    }, {});
                    const names = Object.keys(byMed).sort((a, b) => a.localeCompare(b));
                    if (!names.length) return <p className="p-5 text-center text-sm text-gray-500">No doses during that week.</p>;
                    return names.map((medName) => {
                      const entries = byMed[medName].sort((a, b) => parseLocalDate(b.date) - parseLocalDate(a.date));
                      const latest = entries[0];
                      const medication = MEDICATIONS.find((med) => med.name === medName);
                      const blendComponents = medication?.blendComponents || [];
                      const color = getMedicationColor(medName);
                      const expanded = expandedInjectionMed === medName;
                      return (
                        <section key={medName} className="border-b border-white/[0.06] last:border-0">
                          <button type="button" onClick={() => setExpandedInjectionMed(expanded ? null : medName)} className="w-full px-4 py-3.5 flex items-center gap-3 text-left hover:bg-white/[0.025] active:bg-white/[0.04] transition-colors">
                            <div className="h-10 w-10 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: `${color}18`, color }}><Syringe className="h-4.5 w-4.5" /></div>
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-2"><span className="font-semibold text-sm text-white truncate">{medName}</span><span className="text-[10px] rounded-full bg-white/[0.06] text-gray-500 px-2 py-0.5">{entries.length}</span></div>
                              <p className="text-xs text-gray-500 mt-1">Latest: {latest.dose} {latest.unit} · {parseLocalDate(latest.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                            </div>
                            <ChevronDown className={`h-4 w-4 text-gray-500 transition-transform ${expanded ? 'rotate-180' : ''}`} />
                          </button>
                          {expanded && (
                            <div className="px-4 pb-3">
                              {blendComponents.length > 0 && (
                                <div className="mb-3">{renderBlendSetup(medication, medName, latest)}</div>
                              )}
                              <div className="rounded-xl border border-white/[0.06] overflow-hidden bg-black/10">
                                {entries.map((entry) => {
                                  const breakdown = getBlendBreakdown(entry).filter((item) => item.mg != null);
                                  return (
                                  <div key={entry.id} className="px-3 py-3 border-b border-white/[0.06] last:border-0">
                                    <div className="flex items-start gap-3">
                                      <div className="min-w-0 flex-1">
                                        <div className="flex items-baseline justify-between gap-2">
                                          <span className="text-sm font-semibold text-white">{entry.dose} {entry.unit}</span>
                                          <span className="text-[11px] text-gray-500 shrink-0">{parseLocalDate(entry.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                                        </div>
                                        {breakdown.length > 0 && <p className="text-xs text-gold-400/90 mt-1">{breakdown.map((item) => `${item.component} ${item.mg.toFixed(3)} mg`).join(' · ')}</p>}
                                        {(entry.route || entry.site) && <p className="text-xs text-gold-400/80 mt-1">{[entry.route, entry.site].filter(Boolean).join(' · ')}</p>}
                                        {entry.sideEffects?.length > 0 && <p className="text-[11px] text-orange-300/80 mt-1.5">Side effects: {entry.sideEffects.map((effect) => `${effect}${entry.sideEffectSeverity?.[effect] != null ? ` ${entry.sideEffectSeverity[effect]}/5` : ''}`).join(', ')}</p>}
                                        {entry.notes && <p className="text-[11px] text-gray-500 mt-1 line-clamp-2">{entry.notes}</p>}
                                      </div>
                                      <div className="flex gap-1 shrink-0">
                                        <button onClick={() => { setEditingInjection(entry); setInjectionType(entry.type); setInjectionDose(entry.dose.toString()); setInjectionUnit(entry.unit || 'mg'); setInjectionDate(entry.date); setInjectionTime(entry.time || '09:00'); setInjectionRoute(entry.route || 'SubQ'); setInjectionSite(entry.site || 'Stomach'); setInjectionNotes(entry.notes || ''); setSelectedSideEffects(entry.sideEffects || []); setSideEffectSeverity(entry.sideEffectSeverity || Object.fromEntries((entry.sideEffects || []).map((ef) => [ef, 3]))); setSelectedVialId(entry.vialId ?? null); setTrialTargetMg(''); setShowAddForm(true); }} className="h-8 w-8 rounded-lg bg-white/[0.05] text-gray-400 flex items-center justify-center" title="Edit"><Edit2 className="h-3.5 w-3.5" /></button>
                                        <button onClick={() => deleteInjection(entry.id)} className="h-8 w-8 rounded-lg bg-white/[0.05] text-gray-500 hover:text-red-400 flex items-center justify-center" title="Delete"><Trash2 className="h-3.5 w-3.5" /></button>
                                      </div>
                                    </div>
                                  </div>
                                  );
                                })}
                              </div>
                            </div>
                          )}
                        </section>
                      );
                    });
                  })()}
                </div>
              )}
              <div className="px-4 py-3 border-t border-white/[0.06] flex items-center gap-2">
                <input type="date" value={injectionHistoryFilterDate} onChange={(e) => setInjectionHistoryFilterDate(e.target.value)} className="bg-slate-800 text-gray-300 text-xs rounded-lg px-2 py-1.5" title="Filter by week" />
                {injectionHistoryFilterDate && <button type="button" onClick={() => setInjectionHistoryFilterDate('')} className="text-gray-500 hover:text-gray-300 text-xs">Clear week</button>}
              </div>
            </div>
          </div>
        )}

        {/* JOURNAL TAB — promoted from More for quick access to feelings & side effects */}
        {activeTab === 'journal' && (
          <div key="journal" className="space-y-4 tab-enter">
            {showAddForm && (
              <div className="ui-hero-panel">
                <div className="ui-hero-panel__wash" aria-hidden />
                <div className="ui-hero-panel__top-bar" aria-hidden />
                <div className="ui-hero-panel__body">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-white font-medium">{editingJournal ? 'Edit Entry' : 'New Journal Entry'}</h3>
                  <button onClick={resetJournalForm} className="text-gray-400 hover:text-white"><X className="h-5 w-5" /></button>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="text-gray-400 text-sm block mb-1">Date</label>
                    <input type="date" value={journalDate} onChange={(e) => setJournalDate(e.target.value)} className="w-full bg-slate-700 text-white rounded-lg px-4 py-3" />
                  </div>
                  <div>
                    <label className="text-gray-400 text-sm block mb-2">How are you feeling?</label>
                    <div className="flex gap-2">
                      {[
                        { value: 'happy', icon: Smile, color: 'text-green-500', label: 'Great' },
                        { value: 'neutral', icon: Meh, color: 'text-gray-400', label: 'Okay' },
                        { value: 'sad', icon: Frown, color: 'text-gold-400', label: 'Rough' }
                      ].map(mood => (
                        <button key={mood.value} onClick={() => setJournalMood(mood.value)}
                          className={`flex-1 py-3 rounded-lg transition-all ${journalMood === mood.value ? 'bg-slate-600' : 'bg-slate-700 hover:bg-slate-650'}`}>
                          <mood.icon className={`h-6 w-6 mx-auto ${mood.color}`} />
                          <div className="text-xs text-gray-400 mt-1">{mood.label}</div>
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="text-gray-400 text-sm block mb-1">Energy Level: {journalEnergy}/10</label>
                    <input type="range" min="1" max="10" value={journalEnergy} onChange={(e) => setJournalEnergy(parseInt(e.target.value))}
                      className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer" />
                  </div>
                  <div>
                    <label className="text-gray-400 text-sm block mb-1">Hunger Level: {journalHunger}/10</label>
                    <input type="range" min="1" max="10" value={journalHunger} onChange={(e) => setJournalHunger(parseInt(e.target.value))}
                      className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer" />
                  </div>
                  <div>
                    <label className="text-gray-400 text-sm block mb-1">Notes & Observations</label>
                    <textarea value={journalContent} onChange={(e) => setJournalContent(e.target.value)}
                      className="w-full bg-slate-700 text-white rounded-lg px-4 py-3 min-h-32" placeholder="How did you feel today? Any side effects? Non-scale victories?" />
                  </div>
                  <button onClick={addOrUpdateJournal} className="w-full btn-secondary text-white font-medium py-3 rounded-lg transform hover:scale-105 transition-all">
                    {editingJournal ? 'Update Entry' : 'Save Entry'}
                  </button>
                </div>
                </div>
              </div>
            )}

            <div className="ui-card p-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-white font-medium flex items-center gap-2"><BookOpen className="h-4 w-4 text-violet-400" />Journal Entries</h3>
                {!showAddForm && <button onClick={() => setShowAddForm(true)} className="bg-accent hover:bg-gold-400 text-gray-900 p-2 rounded-lg shadow-gold-glow"><Plus className="h-5 w-5" /></button>}
              </div>
              {journalEntries.length === 0 ? (
                <div className="text-center py-12 px-4">
                  <div className="relative mb-4">
                    <div className="absolute inset-0 bg-violet-500/10 blur-2xl rounded-full"></div>
                    <BookOpen className="h-16 w-16 mx-auto text-violet-400 relative" style={{ animation: 'float 3s ease-in-out infinite' }} />
                  </div>
                  <h3 className="text-white font-medium mb-2">Start Your Journal</h3>
                  <p className="text-gray-400 text-sm mb-4">Track feelings, side effects, and victories</p>
                  <button
                    onClick={() => setShowAddForm(true)}
                    className="btn-secondary text-white font-medium px-6 py-2 rounded-lg inline-flex items-center gap-2"
                  >
                    <Plus className="h-4 w-4" />
                    Write First Entry
                  </button>
                </div>
              ) : (
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {[...journalEntries].sort((a, b) => parseLocalDate(b.date) - parseLocalDate(a.date)).map((entry) => (
                    <div key={entry.id} className="bg-slate-700/50 rounded-lg p-4 group">
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex items-center gap-2">
                          {entry.mood === 'happy' && <Smile className="h-5 w-5 text-green-500" />}
                          {entry.mood === 'neutral' && <Meh className="h-5 w-5 text-gray-400" />}
                          {entry.mood === 'sad' && <Frown className="h-5 w-5 text-gold-400" />}
                          <span className="text-white font-medium">{parseLocalDate(entry.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}</span>
                        </div>
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => { setEditingJournal(entry); setJournalDate(entry.date); setJournalContent(entry.content); setJournalMood(entry.mood); setJournalEnergy(entry.energy); setJournalHunger(entry.hunger); setShowAddForm(true); }}
                            className="p-2 text-gray-400 hover:text-white hover:bg-slate-600 rounded-lg"><Edit2 className="h-4 w-4" /></button>
                          <button onClick={() => deleteJournal(entry.id)} className="p-2 text-gray-400 hover:text-red-400 hover:bg-slate-600 rounded-lg"><Trash2 className="h-4 w-4" /></button>
                        </div>
                      </div>
                      <div className="flex gap-4 mb-2 text-sm">
                        <div className="flex items-center gap-1 text-gray-400">
                          <Zap className="h-4 w-4" />
                          <span>Energy: {entry.energy}/10</span>
                        </div>
                        <div className="flex items-center gap-1 text-gray-400">
                          <Activity className="h-4 w-4" />
                          <span>Hunger: {entry.hunger}/10</span>
                        </div>
                      </div>
                      <p className="text-white whitespace-pre-wrap">{entry.content}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* GOALS — goal-first peptide education (curated); not medical advice */}
        {activeTab === 'goals' && (
          <div key="goals" className="space-y-4 tab-enter">
            <div className="text-center pb-1">
              <h2 className="text-xl font-bold text-white tracking-tight flex items-center justify-center gap-2">
                <Sparkles className="h-6 w-6 text-accent" />
                Goals &amp; peptides
              </h2>
              <p className="text-gray-400 text-sm mt-1">Pick an outcome — see what people often discuss and what stacks come up together</p>
            </div>
            {!goalGuideCategoryId && (
              <div className="ui-hero-panel ui-hero-panel--sticky z-20">
                <div className="ui-hero-panel__wash" aria-hidden />
                <div className="ui-hero-panel__top-bar" aria-hidden />
                <div className="ui-hero-panel__body">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <h3 className="text-white font-bold text-sm sm:text-base tracking-tight flex items-center gap-2">
                      <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-accent/20 border border-accent/35 shadow-inner">
                        <Layers className="h-4 w-4 text-gold-400" />
                      </span>
                      Your current stack
                    </h3>
                    {goalUserStack.length > 0 && (
                      <button
                        type="button"
                        onClick={() => persistGoalUserStack([])}
                        className="text-[11px] font-semibold uppercase tracking-wide text-amber-200/70 hover:text-red-400 transition-colors"
                      >
                        Clear all
                      </button>
                    )}
                  </div>
                  <p className="text-amber-100/55 text-[11px] sm:text-xs mb-3 leading-relaxed border-l-2 border-accent/40 pl-3">
                    Your personal combo list (not a prescription). Add from the guides below — <span className="text-amber-100/75">tap a medication name</span> to read what it does. This card stays pinned while you scroll.
                  </p>
                  {goalUserStack.length === 0 ? (
                    <p className="text-gray-400 text-xs sm:text-sm rounded-xl bg-black/25 border border-white/[0.06] px-3 py-3">
                      Nothing here yet. Open any goal below and tap <span className="text-gold-400 font-medium">Add to stack</span>.
                    </p>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {goalUserStack.map((name) => (
                        <div
                          key={name}
                          className="inline-flex items-center gap-1.5 pl-2.5 pr-1 py-1.5 rounded-xl bg-black/35 border border-accent/25 text-xs text-gray-100 max-w-full shadow-sm"
                        >
                          <span className="w-2 h-2 rounded-full shrink-0 ring-2 ring-accent/30" style={{ backgroundColor: goalStackMedColor(name) }} />
                          <button
                            type="button"
                            onClick={() => setGoalStackInfoMed(name)}
                            className="appearance-none truncate font-medium text-left min-w-0 flex-1 bg-transparent border-0 cursor-pointer text-gray-100 hover:text-gold-400 hover:underline decoration-gold-400/40 underline-offset-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/45 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 rounded-md -my-0.5 py-0.5 -ml-0.5 pl-0.5 pr-1 transition-colors"
                            title={`${name} — tap for guide info`}
                            aria-label={`What ${name} does — open details`}
                          >
                            {name}
                          </button>
                          <button
                            type="button"
                            onClick={() => removeFromGoalUserStack(name)}
                            className="appearance-none p-1 rounded-md text-gray-500 hover:text-red-400 hover:bg-red-500/10 shrink-0 border-0 bg-transparent cursor-pointer"
                            title="Remove from stack"
                            aria-label={`Remove ${name} from stack`}
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                  {goalUserStack.length > 0 && (() => {
                    const timing = getStackTimingContent(goalUserStack);
                    return (
                      <div className="mt-4 rounded-xl border border-amber-500/25 bg-amber-950/20 px-3 py-3 space-y-2">
                        <h4 className="text-amber-200/90 text-xs font-semibold flex items-center gap-2"><Clock className="h-3.5 w-3.5 shrink-0" />Stack timing &amp; spacing (educational only)</h4>
                        {timing.pairWarnings.map((w, i) => (
                          <p key={i} className="text-amber-200/85 text-[11px] leading-relaxed border-l-2 border-amber-500/50 pl-2">{w}</p>
                        ))}
                        <ul className="text-gray-400 text-[11px] space-y-1 list-disc list-inside">
                          {[...timing.general, ...timing.perMed].slice(0, 10).map((t, i) => (
                            <li key={i}>{t}</li>
                          ))}
                        </ul>
                      </div>
                    );
                  })()}
                </div>
              </div>
            )}
            <div className="ui-card p-4 border-amber-500/25 bg-amber-500/5">
              <p className="text-amber-200/90 text-xs leading-relaxed">{GOAL_GUIDE_DISCLAIMER}</p>
            </div>
            {!goalGuideCategoryId ? (
              <>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500 pointer-events-none" />
                  <input
                    type="search"
                    value={goalGuideSearch}
                    onChange={(e) => setGoalGuideSearch(e.target.value)}
                    placeholder="Search goals or medications…"
                    className="w-full bg-slate-800/80 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-accent/40"
                    autoComplete="off"
                  />
                </div>
                {filteredGoalCategories.length === 0 ? (
                  <p className="text-center text-gray-500 text-sm py-10">
                    No goals match &quot;{goalGuideSearch.trim()}&quot;. Try another word or clear search.
                  </p>
                ) : (
                  <div className="grid gap-3 sm:grid-cols-2">
                    {filteredGoalCategories.map((cat) => (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => setGoalGuideCategoryId(cat.id)}
                        className="ui-card p-4 text-left hover:border-accent/40 transition-colors group"
                      >
                        <h3 className="text-white font-semibold text-sm group-hover:text-gold-400 transition-colors">{cat.title}</h3>
                        <p className="text-gray-500 text-xs mt-2 leading-relaxed">{cat.description}</p>
                        <span className="inline-flex items-center gap-1 text-accent text-xs font-medium mt-3">
                          View suggestions
                          <ChevronDown className="h-3 w-3 -rotate-90" />
                        </span>
                      </button>
                    ))}
                  </div>
                )}
                <div className="ui-card p-4">
                  <h3 className="text-white font-semibold text-sm flex items-center gap-2 mb-1">
                    <Sparkles className="h-4 w-4 text-violet-400" />
                    Suggested additions
                  </h3>
                  <p className="text-gray-500 text-xs mb-3 leading-relaxed">
                    Peptides and meds our guides associate with your stack. Tap info for full context, or add to extend your stack plan.
                  </p>
                  {stackSuggestionList.length === 0 ? (
                    <p className="text-gray-600 text-xs">
                      {goalUserStack.length === 0
                        ? 'Add at least one item to your stack to see pairing ideas from the guide.'
                        : 'No extra pairings are listed in the guide for this exact combo — you can still explore other goal categories above.'}
                    </p>
                  ) : (
                    <ul className="space-y-4">
                      {stackSuggestionList.map((sug) => (
                        <li key={sug.medicationName} className="pb-4 border-b border-white/[0.06] last:border-0 last:pb-0">
                          <div className="flex flex-wrap items-start justify-between gap-2">
                            <div className="flex items-center gap-2 min-w-0">
                              <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: goalStackMedColor(sug.medicationName) }} />
                              <span className="text-white text-sm font-medium">{sug.medicationName}</span>
                            </div>
                            <div className="flex items-center gap-1.5 shrink-0">
                              <button
                                type="button"
                                onClick={() => setGoalStackInfoMed(sug.medicationName)}
                                className="px-2 py-1 rounded-lg text-[11px] font-medium bg-white/[0.06] text-gray-300 border border-white/10 hover:border-accent/30 hover:text-gold-400"
                              >
                                What it does
                              </button>
                              <button
                                type="button"
                                onClick={() => addToGoalUserStack(sug.medicationName)}
                                disabled={goalUserStack.includes(sug.medicationName)}
                                className="px-2 py-1 rounded-lg text-[11px] font-medium bg-accent/20 text-gold-400 border border-accent/35 hover:bg-accent/30 disabled:opacity-40 disabled:pointer-events-none"
                              >
                                {goalUserStack.includes(sug.medicationName) ? 'In stack' : 'Add to stack'}
                              </button>
                            </div>
                          </div>
                          <ul className="mt-2 space-y-1 text-[11px] text-gray-500 leading-relaxed list-disc pl-4 marker:text-gray-600">
                            {sug.reasons.slice(0, 4).map((r, ri) => (
                              <li key={ri}>{r}</li>
                            ))}
                            {sug.reasons.length > 4 && (
                              <li className="list-none text-gray-600 italic">+{sug.reasons.length - 4} more reasons in info…</li>
                            )}
                          </ul>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </>
            ) : (() => {
              const cat = GOAL_CATEGORIES.find((c) => c.id === goalGuideCategoryId);
              const medColor = (name) => MEDICATIONS.find((m) => m.name === name)?.color || '#94a3b8';
              if (!cat) {
                return (
                  <div className="space-y-3">
                    <button
                      type="button"
                      onClick={() => setGoalGuideCategoryId(null)}
                      className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors"
                    >
                      <ChevronLeft className="h-4 w-4" />
                      All goals
                    </button>
                    <p className="text-gray-500 text-sm">That goal isn&apos;t available.</p>
                  </div>
                );
              }
              return (
                <div className="space-y-4">
                  <button
                    type="button"
                    onClick={() => setGoalGuideCategoryId(null)}
                    className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors"
                  >
                    <ChevronLeft className="h-4 w-4" />
                    All goals
                  </button>
                  <div className="ui-card p-4">
                    <h3 className="text-white font-semibold text-lg">{cat.title}</h3>
                    <p className="text-gray-400 text-sm mt-2 leading-relaxed">{cat.description}</p>
                  </div>
                  {(GOAL_TRACK_ACTIONS[cat.id] || []).length > 0 && (
                    <div className="ui-card p-4">
                      <p className="text-gray-500 text-[11px] font-semibold uppercase tracking-wide mb-2">Track in PepTalk</p>
                      <div className="flex flex-wrap gap-2">
                        {GOAL_TRACK_ACTIONS[cat.id].map((action) => (
                          <button
                            key={`${action.tab}-${action.label}`}
                            type="button"
                            onClick={() => handleGoalTrackAction(action)}
                            className="px-3 py-1.5 rounded-lg text-xs font-medium bg-white/[0.06] text-gray-200 border border-white/[0.08] hover:bg-accent/15 hover:text-gold-400 hover:border-accent/30 transition-colors"
                          >
                            {action.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                  {cat.clinicianTips?.length > 0 && (
                    <details className="ui-card p-4 group" open>
                      <summary className="flex cursor-pointer list-none items-center gap-2 text-sm font-medium text-white [&::-webkit-details-marker]:hidden">
                        <Stethoscope className="h-4 w-4 text-cyan-400 shrink-0" />
                        Questions for your clinician
                        <ChevronDown className="h-4 w-4 text-gray-500 ml-auto shrink-0 transition-transform group-open:rotate-180" />
                      </summary>
                      <ul className="mt-3 space-y-2 text-xs text-gray-400 leading-relaxed list-disc pl-4 marker:text-cyan-500/80">
                        {cat.clinicianTips.map((tip, ti) => (
                          <li key={ti}>{tip}</li>
                        ))}
                      </ul>
                    </details>
                  )}
                  <div className="space-y-3">
                    {cat.items.map((item) => (
                      <div key={item.medicationName} className="ui-card p-4 border-white/[0.06]">
                        <div className="flex flex-wrap items-start gap-3">
                          <span className="w-2.5 h-2.5 rounded-full mt-1.5 shrink-0" style={{ backgroundColor: medColor(item.medicationName) }} />
                          <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-start justify-between gap-2">
                              <h4 className="text-white font-medium text-sm">{item.medicationName}</h4>
                              <div className="flex flex-col items-end gap-1.5 shrink-0">
                                {goalUserStack.includes(item.medicationName) && (
                                  <span className="inline-flex items-center gap-1 text-[10px] font-medium text-violet-300/90">
                                    <Layers className="h-3 w-3" />
                                    In your stack
                                  </span>
                                )}
                                {userHasLoggedMedication(item.medicationName) && (
                                  <span className="inline-flex items-center gap-1 text-[10px] font-medium text-emerald-400/90">
                                    <CheckCircle className="h-3 w-3" />
                                    In your logs
                                  </span>
                                )}
                                <div className="flex items-center gap-1">
                                  <button
                                    type="button"
                                    onClick={() => setGoalStackInfoMed(item.medicationName)}
                                    className="p-1.5 rounded-lg text-gray-400 border border-white/10 hover:text-gold-400 hover:border-accent/30"
                                    title="What it does"
                                  >
                                    <Info className="h-3.5 w-3.5" />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => addToGoalUserStack(item.medicationName)}
                                    disabled={goalUserStack.includes(item.medicationName)}
                                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-medium bg-accent/15 text-gold-400 border border-accent/25 hover:bg-accent/25 transition-colors disabled:opacity-45 disabled:pointer-events-none"
                                  >
                                    <Plus className="h-3 w-3" />
                                    {goalUserStack.includes(item.medicationName) ? 'In stack' : 'Add to stack'}
                                  </button>
                                </div>
                              </div>
                            </div>
                            <p className="text-gray-400 text-xs mt-2 leading-relaxed">{item.explain}</p>
                            {item.stacksWellWith?.length > 0 && (
                              <div className="mt-4 pt-3 border-t border-white/[0.06]">
                                <p className="text-gold-400/90 text-[11px] font-semibold uppercase tracking-wide mb-2">Often discussed together</p>
                                <ul className="space-y-2.5">
                                  {item.stacksWellWith.map((s) => (
                                    <li key={`${item.medicationName}-${s.medicationName}`} className="flex gap-2 text-xs">
                                      <span className="w-1.5 h-1.5 rounded-full mt-1.5 shrink-0" style={{ backgroundColor: medColor(s.medicationName) }} />
                                      <div className="min-w-0 flex-1">
                                        <div className="flex flex-wrap items-center justify-between gap-2">
                                          <span className="text-gray-200 font-medium">{s.medicationName}</span>
                                          <div className="flex items-center gap-1 shrink-0">
                                            <button
                                              type="button"
                                              onClick={() => setGoalStackInfoMed(s.medicationName)}
                                              className="p-1 rounded text-gray-500 hover:text-gold-400"
                                              title="What it does"
                                            >
                                              <Info className="h-3 w-3" />
                                            </button>
                                            <button
                                              type="button"
                                              onClick={() => addToGoalUserStack(s.medicationName)}
                                              disabled={goalUserStack.includes(s.medicationName)}
                                              className="text-[10px] font-medium text-accent hover:text-gold-400 disabled:opacity-40 disabled:pointer-events-none"
                                            >
                                              {goalUserStack.includes(s.medicationName) ? 'In stack' : 'Add to stack'}
                                            </button>
                                          </div>
                                        </div>
                                        <p className="text-gray-500 mt-0.5 leading-relaxed">{s.why}</p>
                                        {userHasLoggedMedication(s.medicationName) && (
                                          <span className="inline-flex items-center gap-0.5 text-[10px] text-emerald-400/80 mt-1">
                                            <CheckCircle className="h-2.5 w-2.5" />
                                            Logged before
                                          </span>
                                        )}
                                      </div>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })()}
            {goalStackInfoMed && (() => {
              const hits = getMedicationEducation(goalStackInfoMed).sort((a, b) => {
                if (a.role === b.role) return 0;
                return a.role === 'primary' ? -1 : 1;
              });
              return (
                <div
                  className="fixed inset-0 z-[90] flex items-end sm:items-center justify-center p-4 bg-black/65 backdrop-blur-sm"
                  role="dialog"
                  aria-modal="true"
                  aria-labelledby="goal-stack-info-title"
                  onClick={() => setGoalStackInfoMed(null)}
                >
                  <div
                    className="bg-[var(--bg-elevated)] rounded-2xl border border-white/10 max-w-lg w-full max-h-[min(88vh,640px)] overflow-hidden shadow-2xl flex flex-col"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="flex items-start justify-between gap-3 p-4 border-b border-white/[0.06]">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: goalStackMedColor(goalStackInfoMed) }} />
                        <h3 id="goal-stack-info-title" className="text-white font-semibold text-base truncate">
                          {goalStackInfoMed}
                        </h3>
                      </div>
                      <button
                        type="button"
                        onClick={() => setGoalStackInfoMed(null)}
                        className="p-2 rounded-lg text-gray-500 hover:text-white hover:bg-white/10"
                        aria-label="Close"
                      >
                        <X className="h-5 w-5" />
                      </button>
                    </div>
                    <div className="p-4 overflow-y-auto flex-1 space-y-4">
                      {hits.length === 0 ? (
                        <p className="text-gray-500 text-sm leading-relaxed">
                          No guide blurb for this exact name. You can still log it from the Injections tab if it&apos;s in your med list.
                        </p>
                      ) : (
                        hits.map((h, hi) => (
                          <div key={`${h.goalId}-${hi}-${h.role}`} className="rounded-xl bg-white/[0.04] border border-white/[0.06] p-3">
                            <div className="flex items-center justify-between gap-2 mb-2 flex-wrap">
                              <span className="text-[10px] font-semibold uppercase tracking-wide text-gray-500">
                                {h.role === 'primary' ? 'Main entry' : 'Stack note'}
                              </span>
                              <span className="text-xs text-gray-400">{h.goalTitle}</span>
                            </div>
                            <p className="text-gray-300 text-xs leading-relaxed">{h.explain}</p>
                            <button
                              type="button"
                              onClick={() => {
                                setGoalGuideCategoryId(h.goalId);
                                setGoalStackInfoMed(null);
                              }}
                              className="mt-2 text-[11px] font-medium text-accent hover:text-gold-400"
                            >
                              Open &quot;{h.goalTitle}&quot; guide →
                            </button>
                          </div>
                        ))
                      )}
                    </div>
                    <div className="p-4 border-t border-white/[0.06] flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => addToGoalUserStack(goalStackInfoMed)}
                        disabled={goalUserStack.includes(goalStackInfoMed)}
                        className="flex-1 min-w-[8rem] py-2.5 rounded-xl text-sm font-medium bg-accent/20 text-gold-400 border border-accent/35 hover:bg-accent/30 disabled:opacity-40 disabled:pointer-events-none"
                      >
                        {goalUserStack.includes(goalStackInfoMed) ? 'Already in stack' : 'Add to stack'}
                      </button>
                      <button
                        type="button"
                        onClick={() => setGoalStackInfoMed(null)}
                        className="px-4 py-2.5 rounded-xl text-sm text-gray-400 hover:text-white border border-white/10"
                      >
                        Close
                      </button>
                    </div>
                  </div>
                </div>
              );
            })()}
          </div>
        )}

        {/* MORE TAB */}
        {(activeTab === 'more' || activeTab === 'protocols') && (
          <div key="more" className="space-y-4 tab-enter">
            {activeTab === 'more' && (
            <div className="menu-3d more-menu grid grid-cols-2 sm:grid-cols-3 gap-2 p-2.5">
              {[
                { id: 'profile', icon: User, label: 'Profile' },
                { id: 'doses', icon: Syringe, label: 'Doses' },
                { id: 'calendar', icon: CalendarDays, label: 'Calendar' },
                { id: 'tools', icon: Wrench, label: 'Tools' },
                { id: 'labs', icon: Activity, label: 'Labs' },
                { id: 'help', icon: HelpCircle, label: 'Help' }
              ].map(section => (
                <button
                  key={section.id}
                  ref={el => { moreSectionRefs.current[section.id] = el; }}
                  onClick={() => {
                    if (section.id === 'doses') {
                      setActiveTab('injections');
                      setShowAddForm(false);
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                      return;
                    }
                    setActiveMoreSection(section.id);
                  }}
                  className={`menu-3d-item more-menu-item min-h-16 flex items-center gap-3 py-3 px-3 font-medium text-sm ${activeMoreSection === section.id ? 'menu-3d-item-active' : ''}`}
                >
                  <span className="more-menu-icon"><section.icon className="h-4 w-4 flex-shrink-0" /></span><span>{section.label}</span>
                </button>
              ))}
            </div>
            )}
            {activeMoreSection === 'profile' && (
              <div className="space-y-4">
                <div className="ui-card p-4 border border-cyan-500/20">
                  <h3 className="text-white font-medium mb-2 flex items-center gap-2"><Cloud className="h-5 w-5 text-cyan-400" />Account &amp; cloud backup</h3>
                  <p className="text-gray-400 text-xs mb-4">
                    Sign in to save your data to Supabase. If you lose your phone, sign in on a new device to restore. Data is still stored locally on this device.
                  </p>
                  {supabaseConfigured && user && (
                    <p className="text-gray-500 text-xs mb-3 -mt-2">
                      Backup runs in the background after you save. Offline? Everything stays on this device until you&apos;re online again.
                      {lastCloudSyncAt && (
                        <span className="block mt-1 text-gray-500">
                          Last cloud sync:{' '}
                          <span className="text-gray-300">{new Date(lastCloudSyncAt).toLocaleString()}</span>
                        </span>
                      )}
                    </p>
                  )}
                  {!supabaseConfigured && (
                    <div className="text-amber-400/90 text-xs mb-3 space-y-2">
                      <p>
                        Cloud sign-in is not configured for this deployment. Use one of the following:
                      </p>
                      <ul className="list-disc pl-4 text-gray-400 space-y-1">
                        <li>
                          <strong className="text-amber-200/90">Web (GitHub Pages, static host):</strong> copy{' '}
                          <code className="text-gray-300">public/supabase-config.example.json</code> to{' '}
                          <code className="text-gray-300">public/supabase-config.json</code>, fill in{' '}
                          <code className="text-gray-300">url</code> and <code className="text-gray-300">anonKey</code> from your Supabase project settings, then rebuild and redeploy. The file is served next to the app (anon key is public by design; use RLS in Supabase).
                        </li>
                        <li>
                          <strong className="text-amber-200/90">Local dev or CI build:</strong> set{' '}
                          <code className="text-gray-300">VITE_SUPABASE_URL</code> and{' '}
                          <code className="text-gray-300">VITE_SUPABASE_ANON_KEY</code> in <code className="text-gray-300">.env</code> and run <code className="text-gray-300">npm run build</code>.
                        </li>
                      </ul>
                    </div>
                  )}
                  {supabaseConfigured && supabaseAuthLoading && (
                    <p className="text-gray-500 text-xs mb-2">Checking session…</p>
                  )}
                  {supabaseConfigured && !user && !supabaseAuthLoading && cloudOptOut && (
                    <p className="text-cyan-200/85 text-xs mb-3">
                      You&apos;re using PepTalk on this device only. Sign in below to enable cloud backup, or use &quot;Show full-screen sign-in&quot; if you prefer the dedicated sign-in page.
                    </p>
                  )}
                  {supabaseConfigured && !user && !supabaseAuthLoading && (
                    <form
                      className="space-y-3"
                      onSubmit={async (e) => {
                        e.preventDefault();
                        setCloudAuthMessage('');
                        setCloudBusy(true);
                        const { error } = await supabaseSignIn(cloudEmail, cloudPassword);
                        setCloudBusy(false);
                        if (error) setCloudAuthMessage(formatCloudError(error));
                        else {
                          onCloudSignInSuccess();
                          setCloudPassword('');
                          setCloudAuthMessage('Signed in. Syncing…');
                        }
                      }}
                    >
                      <div>
                        <label className="text-gray-400 text-sm block mb-1">Email</label>
                        <input type="email" autoComplete="email" value={cloudEmail} onChange={(e) => setCloudEmail(e.target.value)} className="w-full bg-slate-700 text-white rounded-lg px-4 py-2.5" placeholder="you@example.com" />
                      </div>
                      <div>
                        <label className="text-gray-400 text-sm block mb-1">Password</label>
                        <input type="password" autoComplete="current-password" value={cloudPassword} onChange={(e) => setCloudPassword(e.target.value)} className="w-full bg-slate-700 text-white rounded-lg px-4 py-2.5" placeholder="••••••••" />
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <button type="submit" disabled={cloudBusy} className="flex-1 min-w-[8rem] ui-btn-primary py-2.5 disabled:opacity-50">Sign in</button>
                        <button
                          type="button"
                          disabled={cloudBusy}
                          className="flex-1 min-w-[8rem] py-2.5 rounded-lg font-medium bg-white/10 text-gray-200 hover:bg-white/15 disabled:opacity-50"
                          onClick={async () => {
                            setCloudAuthMessage('');
                            setCloudBusy(true);
                            const { error } = await supabaseSignUp(cloudEmail, cloudPassword);
                            setCloudBusy(false);
                            if (error) setCloudAuthMessage(formatCloudError(error));
                            else setCloudAuthMessage('Check your email to confirm your account (if required by your Supabase project).');
                          }}
                        >
                          Sign up
                        </button>
                      </div>
                      {cloudAuthMessage && <p className="text-gray-400 text-xs">{cloudAuthMessage}</p>}
                    </form>
                  )}
                  {supabaseConfigured && !user && !supabaseAuthLoading && cloudOptOut && (
                    <button
                      type="button"
                      onClick={clearCloudOptOut}
                      className="mt-3 w-full py-2 rounded-lg text-xs font-medium bg-white/5 text-gray-400 border border-white/10 hover:bg-white/10"
                    >
                      Show full-screen sign-in
                    </button>
                  )}
                  {supabaseConfigured && user && (
                    <div className="space-y-3">
                      <p className="text-gray-300 text-sm">Signed in as <strong className="text-white">{user.email}</strong></p>
                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          className="px-4 py-2.5 rounded-lg font-medium bg-cyan-600 hover:bg-cyan-500 text-white text-sm disabled:opacity-50"
                          disabled={cloudBusy}
                          onClick={async () => {
                            setCloudBusy(true);
                            setCloudAuthMessage('');
                            const r = await supabaseSyncNow();
                            setCloudBusy(false);
                            if (r?.ok) {
                              setCloudAuthMessage('Backup saved to cloud.');
                              setBackgroundSyncError('');
                            } else if (r?.code === 'no_session' || r?.code === 'not_configured') {
                              setCloudAuthMessage('');
                            } else {
                              setCloudAuthMessage(r?.message ? `Sync failed: ${r.message}` : 'Sync failed.');
                            }
                          }}
                        >
                          {cloudBusy ? 'Syncing…' : 'Sync now'}
                        </button>
                        <button
                          type="button"
                          className="px-4 py-2.5 rounded-lg font-medium bg-white/10 text-gray-200 hover:bg-white/15 text-sm"
                          onClick={async () => {
                            setCloudAuthMessage('');
                            await supabaseSignOut();
                          }}
                        >
                          Sign out
                        </button>
                      </div>
                      {cloudAuthMessage && <p className="text-gray-400 text-xs">{cloudAuthMessage}</p>}
                    </div>
                  )}
                </div>
                <div className="ui-card p-4">
                  <h3 className="text-white font-medium mb-4 flex items-center gap-2"><User className="h-5 w-5 text-gold-400" />Profile settings</h3>
                  <p className="text-gray-400 text-xs mb-4">Keep the basic measurements used by BMI and hydration tracking.</p>
                  <div className="space-y-4">
                    <div>
                      <label className="text-gray-400 text-sm block mb-1">Height (inches)</label>
                      <input type="number" min="0" step="0.5" value={userProfile?.height ?? 70} onChange={(e) => { const p = { ...userProfile, height: parseFloat(e.target.value) || 70 }; setUserProfile(p); saveData('health-user-profile', p); }} className="w-full bg-slate-700 text-white rounded-lg px-4 py-2.5" />
                    </div>
                    <div>
                      <label className="text-gray-400 text-sm block mb-1">Daily hydration goal (oz)</label>
                      <input type="number" min="0" step="8" value={userProfile?.hydrationGoalOz ?? 64} onChange={(e) => { const v = e.target.value === '' ? 64 : parseInt(e.target.value, 10); const p = { ...userProfile, hydrationGoalOz: isNaN(v) ? 64 : v }; setUserProfile(p); saveData('health-user-profile', p); }} className="w-full bg-slate-700 text-white rounded-lg px-4 py-2.5" placeholder="64" />
                      <p className="text-gray-500 text-xs mt-1">0 = hide hydration progress bar</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
            {activeMoreSection === 'body' && (
          <div className="space-y-4">
            {/* Measurement Stats */}
            {Object.keys(measurementStats).length > 0 && (
              <div className="grid grid-cols-2 gap-3">
                {Object.entries(measurementStats).map(([type, data]) => (
                  <div key={type} className="ui-card p-3">
                    <div className="text-gray-400 text-xs">{type}</div>
                    <div className="text-xl font-bold text-white">{data.current}"</div>
                    <div className={`text-xs ${parseFloat(data.change) < 0 ? 'text-green-500' : parseFloat(data.change) > 0 ? 'text-red-400' : 'text-gray-400'}`}>
                      {parseFloat(data.change) > 0 ? '+' : ''}{data.change}"
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Body Measurements Chart */}
            {measurementEntries.length > 0 && getMeasurementChartData().length > 0 && (
              <div className="bg-[var(--bg-card)] rounded-xl p-4">
                <h3 className="text-white font-medium mb-3">Measurement Progress</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={getMeasurementChartData()}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                    <XAxis dataKey="date" stroke="#94a3b8" fontSize={10} />
                    <YAxis stroke="#94a3b8" fontSize={10} unit='"' />
                    <Tooltip contentStyle={{ backgroundColor: 'rgba(24, 24, 28, 0.95)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', backdropFilter: 'blur(12px)' }} />
                    <Legend wrapperStyle={{ fontSize: '10px' }} />
                    {MEASUREMENT_TYPES.map((type, idx) => {
                      const colors = ['#06b6d4', '#8b5cf6', '#ec4899', '#e8b84c', '#10b981', '#3b82f6', '#ef4444', '#a855f7', '#14b8a6', '#f97316'];
                      return <Line key={type} type="monotone" dataKey={type} stroke={colors[idx % colors.length]} strokeWidth={2} dot={{ r: 4 }} connectNulls name={type} />;
                    })}
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}

            {/* Add Measurement Form */}
            {showAddForm && (
              <div className="ui-card p-4">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-white font-medium">Add Measurement</h3>
                  <button onClick={resetMeasurementForm} className="text-gray-400 hover:text-white"><X className="h-5 w-5" /></button>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="text-gray-400 text-sm block mb-2">Body Part</label>
                    <div className="grid grid-cols-2 gap-2">
                      {MEASUREMENT_TYPES.map(type => <button key={type} onClick={() => setMeasurementType(type)} className={`p-2 rounded-lg text-sm transition-all ${measurementType === type ? 'bg-cyan-500 text-white' : 'bg-white/10 text-gray-300 hover:bg-white/15'}`}>{type}</button>)}
                    </div>
                  </div>
                  <div>
                    <label className="text-gray-400 text-sm block mb-1">Measurement (inches)</label>
                    <input type="number" step="0.25" value={measurementValue} onChange={(e) => setMeasurementValue(e.target.value)} className="w-full bg-slate-700 text-white rounded-lg px-4 py-3" placeholder="e.g., 34.5" />
                  </div>
                  <div>
                    <label className="text-gray-400 text-sm block mb-1">Date</label>
                    <input type="date" value={measurementDate} onChange={(e) => setMeasurementDate(e.target.value)} className="w-full bg-slate-700 text-white rounded-lg px-4 py-3" />
                  </div>
                  <button onClick={addMeasurement} className="w-full bg-cyan-500 hover:bg-cyan-600 text-white font-medium py-3 rounded-lg">Add Measurement</button>
                </div>
              </div>
            )}

            {/* Progress Photos */}
            <div className="ui-card p-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-white font-medium flex items-center gap-2"><Camera className="h-4 w-4 text-gold-400" />Progress Photos</h3>
                <button onClick={() => photoInputRef.current?.click()} className="bg-cyan-500 hover:bg-cyan-600 text-white p-2 rounded-lg"><Plus className="h-5 w-5" /></button>
                <input ref={photoInputRef} type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
              </div>
              {progressPhotos.length === 0 ? (
                <div className="text-center py-12 px-4">
                  <div className="relative mb-4">
                    <div className="absolute inset-0 bg-pink-500/10 blur-2xl rounded-full"></div>
                    <Camera className="h-16 w-16 mx-auto text-pink-400 relative" style={{ animation: 'pulse-glow 2s ease-in-out infinite' }} />
                  </div>
                  <h3 className="text-white font-medium mb-2">Document Your Journey</h3>
                  <p className="text-gray-400 text-sm mb-4">Visual progress is the best motivation!</p>
                  <button 
                    onClick={() => document.querySelector('input[type="file"]').click()} 
                    className="bg-gradient-to-r from-pink-500 to-rose-600 shadow-lg shadow-pink-500/30 hover:shadow-xl hover:scale-105 active:scale-95 transition-all text-white font-medium px-6 py-2 rounded-lg inline-flex items-center gap-2"
                  >
                    <Camera className="h-4 w-4" />
                    Add First Photo
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-3 gap-2">
                  {progressPhotos.sort((a, b) => parseLocalDate(b.date) - parseLocalDate(a.date)).map(photo => (
                    <div key={photo.id} className="relative group">
                      <img src={photo.data} alt="Progress" className="w-full h-24 object-cover rounded-lg" />
                      <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-xs p-1 rounded-b-lg">{parseLocalDate(photo.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</div>
                      <button onClick={() => deletePhoto(photo.id)} className="absolute top-1 right-1 bg-red-500 p-1 rounded opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 className="h-3 w-3 text-white" /></button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Measurement History */}
            <div className="ui-card p-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-white font-medium">Measurement History</h3>
                {!showAddForm && <button onClick={() => setShowAddForm(true)} className="bg-cyan-500 hover:bg-cyan-600 text-white p-2 rounded-lg"><Plus className="h-5 w-5" /></button>}
              </div>
              {measurementEntries.length === 0 ? (
                <div className="text-center py-8 text-gray-400"><Ruler className="h-12 w-12 mx-auto mb-2 opacity-50" /><p>No measurements yet</p></div>
              ) : (
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {measurementEntries.map((entry) => (
                    <div key={entry.id} className="flex items-center justify-between bg-slate-700/50 rounded-lg p-3 group">
                      <div className="flex items-center gap-3">
                        <div className="bg-accent/20 p-2 rounded-lg border border-accent/20"><Ruler className="h-5 w-5 text-gold-400" /></div>
                        <div>
                          <div className="text-white font-medium">{entry.type}: {entry.value}"</div>
                          <div className="text-gray-400 text-sm">{parseLocalDate(entry.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</div>
                        </div>
                      </div>
                      <button onClick={() => deleteMeasurement(entry.id)} className="p-2 text-gray-400 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 className="h-4 w-4" /></button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
            )}
            {activeMoreSection === 'daily' && (
          <div className="space-y-4">
            <div className="ui-card p-4">
              <h3 className="text-white font-medium mb-3 flex items-center gap-2"><Droplets className="h-4 w-4 text-sky-400" /><Beef className="h-4 w-4 text-gold-400" /><UtensilsCrossed className="h-4 w-4 text-gold-400" />Daily — Hydration, Protein & Nutrition</h3>
              <p className="text-gray-500 text-xs mb-3">Hydration and protein today are calculated from your meal entries below. Add optional extra water if you don’t log drinks as meals.</p>
              <div className="flex items-center gap-2 mb-2 flex-wrap">
                <label className="text-gray-400 text-xs">Daily hydration goal (oz)</label>
                <input type="number" min="0" step="8" value={userProfile?.hydrationGoalOz ?? ''} onChange={(e) => { const v = e.target.value === '' ? 0 : parseInt(e.target.value, 10); const p = { ...userProfile, hydrationGoalOz: isNaN(v) ? 0 : v }; setUserProfile(p); saveData('health-user-profile', p); }} className="w-16 bg-slate-700 text-white rounded-lg px-3 py-2 text-sm" placeholder="64" />
                <span className="text-gray-500 text-xs">0 = hide</span>
              </div>
              {(userProfile?.hydrationGoalOz ?? 0) > 0 && (
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-gray-400 text-sm">Today</span>
                    <span className="text-white font-medium">{Math.round(hydrationToday)} / {userProfile.hydrationGoalOz} oz</span>
                  </div>
                  <div className="h-2 rounded-full bg-white/10 overflow-hidden">
                    <div className="h-full rounded-full bg-sky-500/90 transition-all duration-500" style={{ width: `${Math.min(100, (hydrationToday / (userProfile.hydrationGoalOz || 1)) * 100)}%` }} />
                  </div>
                </div>
              )}
              <div className="flex items-center gap-2 mb-4 flex-wrap">
                <label className="text-gray-400 text-xs">Extra water (oz)</label>
                <input type="number" min="0" step="1" value={extraHydrationOz} onChange={(e) => setExtraHydrationOz(e.target.value)} className="w-20 bg-slate-700 text-white rounded-lg px-3 py-2 text-sm" placeholder="0" />
                <button onClick={saveExtraHydration} className="bg-slate-600 hover:bg-slate-500 text-white text-sm font-medium px-3 py-2 rounded-lg">Save</button>
                <button onClick={() => { setActiveMoreSection('tools'); setActiveToolSection('calculator'); }} className="text-gold-400 hover:text-gold-400 text-sm font-medium flex items-center gap-1">
                  <Calculator className="h-4 w-4" /> TDEE calculator
                </button>
              </div>
              <p className="text-gray-400 text-sm mb-4">Today: <span className="text-sky-400">{hydrationToday} oz</span> hydration · <span className="text-gold-400">{proteinToday} g</span> protein</p>

              <div className="border-t border-white/[0.06] pt-4 mt-4">
                <h4 className="text-gray-300 text-sm font-medium mb-2 flex items-center gap-2"><UtensilsCrossed className="h-4 w-4" />Meals & calories</h4>
                <p className="text-gray-500 text-xs mb-3">Add meals or snacks; hydration and protein today update from these entries. Use &quot;Estimate macros&quot; for quick add from a short description.</p>
                <div className="flex gap-2 mb-3">
                  <input type="text" value={mealDescription} onChange={(e) => setMealDescription(e.target.value)} className="flex-1 bg-slate-700 text-white rounded-lg px-3 py-2 text-sm" placeholder="e.g. 2 eggs, chicken salad, water 16 oz" />
                  <button type="button" onClick={applyMealEstimate} className="bg-accent/80 hover:bg-accent text-gray-900 text-sm font-medium px-3 py-2 rounded-lg whitespace-nowrap">Estimate macros</button>
                </div>
                <div className="grid grid-cols-2 gap-2 mb-2">
                  <div className="col-span-2">
                    <label className="text-gray-400 text-xs block mb-1">Label (e.g. Breakfast)</label>
                    <input type="text" value={nutritionLabel} onChange={(e) => setNutritionLabel(e.target.value)} className="w-full bg-slate-700 text-white rounded-lg px-3 py-2 text-sm" placeholder="Breakfast, Lunch, Snack…" />
                  </div>
                  <div>
                    <label className="text-gray-400 text-xs block mb-1">Calories</label>
                    <input type="number" min="0" step="1" value={nutritionCalories} onChange={(e) => setNutritionCalories(e.target.value)} className="w-full bg-slate-700 text-white rounded-lg px-3 py-2 text-sm" placeholder="0" />
                  </div>
                  <div>
                    <label className="text-gray-400 text-xs block mb-1">Protein (g)</label>
                    <input type="number" min="0" step="1" value={nutritionProtein} onChange={(e) => setNutritionProtein(e.target.value)} className="w-full bg-slate-700 text-white rounded-lg px-3 py-2 text-sm" placeholder="0" />
                  </div>
                  <div>
                    <label className="text-gray-400 text-xs block mb-1">Carbs (g)</label>
                    <input type="number" min="0" step="1" value={nutritionCarbs} onChange={(e) => setNutritionCarbs(e.target.value)} className="w-full bg-slate-700 text-white rounded-lg px-3 py-2 text-sm" placeholder="0" />
                  </div>
                  <div>
                    <label className="text-gray-400 text-xs block mb-1">Fat (g)</label>
                    <input type="number" min="0" step="1" value={nutritionFat} onChange={(e) => setNutritionFat(e.target.value)} className="w-full bg-slate-700 text-white rounded-lg px-3 py-2 text-sm" placeholder="0" />
                  </div>
                  <div>
                    <label className="text-gray-400 text-xs block mb-1">Water (oz) — for drinks</label>
                    <input type="number" min="0" step="1" value={nutritionHydrationOz} onChange={(e) => setNutritionHydrationOz(e.target.value)} className="w-full bg-slate-700 text-white rounded-lg px-3 py-2 text-sm" placeholder="0" />
                  </div>
                </div>
                <button onClick={addNutritionEntry} className="w-full bg-slate-600 hover:bg-slate-500 text-white text-sm font-medium py-2 rounded-lg mb-4">Add entry</button>

                {(todayDaily?.meals?.length ?? 0) > 0 && (
                  <>
                    <div className="space-y-2 mb-3 max-h-40 overflow-y-auto">
                      {(todayDaily?.meals ?? []).map((meal) => (
                        <div key={meal.id} className="flex items-center justify-between bg-slate-700/50 rounded-lg px-3 py-2 text-sm group">
                          <div>
                            <span className="text-white font-medium">{meal.label}</span>
                            <span className="text-gray-400 ml-2">{meal.calories} cal</span>
                            {(meal.protein > 0 || meal.carbs > 0 || meal.fat > 0) && (
                              <span className="text-gray-500 text-xs ml-2">P {meal.protein}g · C {meal.carbs}g · F {meal.fat}g</span>
                            )}
                            {(meal.hydrationOz ?? 0) > 0 && (
                              <span className="text-sky-400 text-xs ml-2">{meal.hydrationOz} oz</span>
                            )}
                          </div>
                          <button type="button" onClick={() => deleteNutritionEntry(meal.id)} className="p-1.5 text-gray-400 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity rounded"><Trash2 className="h-4 w-4" /></button>
                        </div>
                      ))}
                    </div>
                    <div className="rounded-lg bg-slate-700/60 px-3 py-2 text-sm border border-white/[0.04]">
                      <span className="text-gray-400">Today&apos;s totals: </span>
                      <span className="text-white font-medium">{(todayDaily?.meals ?? []).reduce((s, m) => s + (m.calories || 0), 0)} cal</span>
                      <span className="text-gray-400 mx-2">·</span>
                      <span className="text-gold-400">P {(todayDaily?.meals ?? []).reduce((s, m) => s + (m.protein || 0), 0)}g</span>
                      <span className="text-gray-400 mx-2">·</span>
                      <span className="text-green-500">C {(todayDaily?.meals ?? []).reduce((s, m) => s + (m.carbs || 0), 0)}g</span>
                      <span className="text-gray-400 mx-2">·</span>
                      <span className="text-violet-400">F {(todayDaily?.meals ?? []).reduce((s, m) => s + (m.fat || 0), 0)}g</span>
                    </div>
                  </>
                )}
              </div>

            </div>
          </div>
            )}
            {(activeMoreSection === 'tools' || activeTab === 'protocols') && (
          <div className="space-y-4">
            {/* Tool Section Selector - 3D */}
            {activeTab !== 'protocols' && (
            <div className="menu-3d tool-menu flex p-1.5 overflow-x-auto">
              {[
                { id: 'calculator', label: 'Calculators' }, 
                { id: 'schedule', label: 'Protocols' },
                { id: 'titration', label: 'Titration' }, 
                { id: 'notifications', label: 'Notifications' },
                { id: 'vials', label: 'Vials' },
                { id: 'data', label: 'Data' }
              ].map(section => (
                <button key={section.id} onClick={() => setActiveToolSection(section.id)}
                  className={`menu-3d-item tool-menu-item flex-1 whitespace-nowrap px-4 py-2.5 text-sm font-medium ${activeToolSection === section.id ? 'menu-3d-item-active' : ''}`}>
                  {section.label}
                </button>
              ))}
            </div>
            )}

            {/* Calculators Section */}
            {activeToolSection === 'calculator' && (
              <>
                <div className="ui-card p-4">
                  <h3 className="text-white font-medium mb-3 flex items-center gap-2"><Activity className="h-5 w-5 text-green-500" />Reconstitution Calculator</h3>
                  <div className="mb-3">
                    <label className="text-gray-400 text-sm block mb-1">Calculate</label>
                    <select value={reconMode} onChange={(e) => { setReconMode(e.target.value); setReconResult(null); }} className="w-full bg-slate-700 text-white rounded-lg px-4 py-2">
                      <option value="vial_bac">Vial + Bac water → Concentration & dose per draw</option>
                      <option value="vial_dose">Vial + Desired dose → Bac water to add</option>
                    </select>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <label className="text-gray-400 text-sm block mb-1">Vial (peptide in vial)</label>
                      <div className="flex gap-2">
                        <input type="number" step="0.1" value={reconPeptideAmount} onChange={(e) => setReconPeptideAmount(e.target.value)} className="flex-1 bg-slate-700 text-white rounded-lg px-4 py-2" placeholder="e.g., 5" title="Total peptide in the vial" />
                        <select value={reconPeptideUnit} onChange={(e) => setReconPeptideUnit(e.target.value)} className="bg-slate-700 text-white rounded-lg px-3 py-2"><option value="mg">mg</option><option value="mcg">mcg</option></select>
                      </div>
                    </div>
                    {reconMode === 'vial_bac' && (
                      <>
                        <div>
                          <label className="text-gray-400 text-sm block mb-1">BAC Water (mL)</label>
                          <input type="number" step="0.1" value={reconWaterAmount} onChange={(e) => setReconWaterAmount(e.target.value)} className="w-full bg-slate-700 text-white rounded-lg px-4 py-2" placeholder="e.g., 2" title="Bacteriostatic water volume added to the vial" />
                        </div>
                        <div>
                          <label className="text-gray-400 text-sm block mb-1">Desired dose per injection (optional)</label>
                          <div className="flex gap-2">
                            <input type="number" step="0.01" value={reconDesiredDose} onChange={(e) => setReconDesiredDose(e.target.value)} className="flex-1 bg-slate-700 text-white rounded-lg px-4 py-2" placeholder="e.g., 250" />
                            <select value={reconDesiredUnit} onChange={(e) => setReconDesiredUnit(e.target.value)} className="bg-slate-700 text-white rounded-lg px-3 py-2"><option value="mcg">mcg</option><option value="mg">mg</option></select>
                          </div>
                        </div>
                      </>
                    )}
                    {reconMode === 'vial_dose' && (
                      <>
                        <div>
                          <label className="text-gray-400 text-sm block mb-1">Desired dose per injection</label>
                          <div className="flex gap-2">
                            <input type="number" step="0.01" value={reconDesiredDose} onChange={(e) => setReconDesiredDose(e.target.value)} className="flex-1 bg-slate-700 text-white rounded-lg px-4 py-2" placeholder="e.g., 1" />
                            <select value={reconDesiredUnit} onChange={(e) => setReconDesiredUnit(e.target.value)} className="bg-slate-700 text-white rounded-lg px-3 py-2"><option value="mg">mg</option><option value="mcg">mcg</option></select>
                          </div>
                        </div>
                        <div>
                          <label className="text-gray-400 text-sm block mb-1">Volume per dose (mL)</label>
                          <input type="number" step="0.01" min="0.1" value={reconVolumePerDose} onChange={(e) => setReconVolumePerDose(e.target.value)} className="w-full bg-slate-700 text-white rounded-lg px-4 py-2" placeholder="0.5" title="How much volume you want to draw per injection" />
                        </div>
                      </>
                    )}
                    <button onClick={calculateReconstitution} className="w-full bg-green-500 hover:bg-green-600 text-white font-medium py-2 rounded-lg">Calculate</button>
                    {reconResult && (
                      <div className="bg-slate-700/50 rounded-lg p-4 text-center space-y-2">
                        {reconResult.mode === 'vial_bac' && (
                          <>
                            <div className="text-gray-400 text-xs">Concentration: {reconResult.concentration} mg/mL ({reconResult.concentrationMcg} mcg/mL)</div>
                            {reconResult.mlPerDose != null && reconResult.desiredDose && (
                              <>
                                <div className="text-gray-300 text-sm mt-1">For {reconResult.desiredDose} dose:</div>
                                <div className="text-2xl font-bold text-green-500">{reconResult.mlPerDose} mL</div>
                                <div className="text-gray-400 text-sm">or</div>
                                <div className="text-xl font-bold text-violet-400">{reconResult.unitsPerDose} units</div>
                              </>
                            )}
                          </>
                        )}
                        {reconResult.mode === 'vial_dose' && (
                          <>
                            <div className="text-gray-300 text-sm">Add bac water</div>
                            <div className="text-2xl font-bold text-green-500">{reconResult.bacMl} mL</div>
                            <div className="text-gray-400 text-xs mt-1">Then {reconResult.mlPerDose} mL = 1 dose ({reconResult.unitsPerDose} units) · {reconResult.concentration} mg/mL</div>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                <div className="ui-card p-4">
                  <h3 className="text-white font-medium mb-4 flex items-center gap-2"><Activity className="h-5 w-5 text-gold-400" />Calorie / TDEE Calculator</h3>
                  <p className="text-gray-400 text-sm mb-3">Estimates BMR and total daily energy expenditure.</p>
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-gray-400 text-sm block mb-1">Age</label>
                        <input type="number" min="15" max="120" value={tdeeAge} onChange={(e) => setTdeeAge(e.target.value)} className="w-full bg-slate-700 text-white rounded-lg px-4 py-2" placeholder="30" />
                      </div>
                      <div>
                        <label className="text-gray-400 text-sm block mb-1">Gender</label>
                        <select value={tdeeGender} onChange={(e) => setTdeeGender(e.target.value)} className="w-full bg-slate-700 text-white rounded-lg px-4 py-2">
                          <option value="male">Male</option>
                          <option value="female">Female</option>
                        </select>
                      </div>
                    </div>
                    <div>
                      <label className="text-gray-400 text-sm block mb-1">Weight (lbs)</label>
                      <input type="number" step="0.1" value={tdeeWeightLbs} onChange={(e) => setTdeeWeightLbs(e.target.value)} className="w-full bg-slate-700 text-white rounded-lg px-4 py-2" placeholder="e.g., 180" />
                    </div>
                    <div>
                      <label className="text-gray-400 text-sm block mb-1">Height (inches)</label>
                      <input type="number" step="0.1" value={tdeeHeightIn} onChange={(e) => setTdeeHeightIn(e.target.value)} className="w-full bg-slate-700 text-white rounded-lg px-4 py-2" placeholder="e.g., 70" />
                    </div>
                    <div>
                      <label className="text-gray-400 text-sm block mb-1">Activity level</label>
                      <select value={tdeeActivity} onChange={(e) => setTdeeActivity(e.target.value)} className="w-full bg-slate-700 text-white rounded-lg px-4 py-2">
                        <option value="sedentary">Sedentary (little/no exercise)</option>
                        <option value="light">Light (1–3 days/week)</option>
                        <option value="moderate">Moderate (3–5 days/week)</option>
                        <option value="active">Active (6–7 days/week)</option>
                        <option value="very">Very active (intense daily)</option>
                      </select>
                    </div>
                    <button onClick={calculateTDEE} className="w-full bg-accent hover:bg-gold-600 text-gray-900 font-medium py-2 rounded-lg">Calculate TDEE</button>
                    {tdeeResult && (
                      <div className="bg-slate-700/50 rounded-lg p-4 text-center space-y-1">
                        <div className="text-gray-400 text-xs">BMR (basal metabolic rate)</div>
                        <div className="text-xl font-bold text-gold-400">{tdeeResult.bmr} cal/day</div>
                        <div className="text-gray-400 text-xs mt-2">TDEE (maintenance)</div>
                        <div className="text-2xl font-bold text-green-500">{tdeeResult.tdee} cal/day</div>
                        <div className="text-gray-500 text-xs mt-1">Deficit -500 ≈ {tdeeResult.tdee - 500} cal for ~1 lb/wk loss</div>
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}

            {/* Schedules Section */}
            {activeToolSection === 'schedule' && (
              <div className="space-y-4">
                <div className="ui-card p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="flex items-center gap-2 font-semibold text-white"><Layers className="h-5 w-5 text-gold-400" />Protocols</h3>
                      <p className="mt-1 text-xs leading-relaxed text-gray-400">Manage dose, units, timing, route, cycles, blend strength, and pauses in one place.</p>
                    </div>
                    <span className="rounded-full bg-white/[0.05] px-2.5 py-1 text-xs text-gray-400">{schedules.length}</span>
                  </div>
                  <button type="button" onClick={() => openProtocolEditor(MEDICATIONS.find((medication) => !schedules.some((schedule) => schedule.medication === medication.name))?.name || MEDICATIONS[0].name)} className="ui-btn-primary mt-4 flex min-h-11 w-full items-center justify-center gap-2 text-sm font-semibold"><Plus className="h-4 w-4" /> Add protocol</button>
                </div>

                <div className="ui-card p-4">
                  <div className="flex items-start gap-3"><Bell className="mt-0.5 h-5 w-5 shrink-0 text-gold-400" /><div><div className="font-medium text-white">Protocol alert delivery</div><p className="mt-1 text-xs leading-relaxed text-gray-400">Days, medication time, and lead time are set inside each protocol. Apple Calendar is the most reliable option while PepTalk is a web app.</p></div></div>
                  <div className="mt-3 grid gap-2 sm:grid-cols-2">
                    {notificationPermission !== 'granted' && notificationPermission !== 'denied' && <button type="button" onClick={requestNotificationPermission} className="min-h-11 rounded-xl border border-white/[0.08] bg-white/[0.04] px-4 text-sm font-semibold text-white">Enable web alerts</button>}
                    <button type="button" onClick={downloadProtocolCalendarAlerts} className="flex min-h-11 items-center justify-center gap-2 rounded-xl bg-sky-500 px-4 text-sm font-semibold text-white hover:bg-sky-400"><Download className="h-4 w-4" />Add to Apple Calendar</button>
                  </div>
                </div>

                {/* Stack Timeline: which compounds are active by month */}
                {getStackTimelineMonths().length > 0 && (
                  <div className="ui-card p-4 mb-4">
                    <h3 className="text-white font-medium mb-2 flex items-center gap-2">
                      <CalendarDays className="h-4 w-4 text-gold-400" />
                      Your stack timeline
                    </h3>
                    <p className="text-gray-400 text-xs mb-3">When each compound joined your stack (set Start date on each schedule).</p>
                    <div className="space-y-2">
                      {getStackTimelineMonths().map((m) => (
                        <div key={m.label} className="flex flex-wrap items-center gap-2 text-sm">
                          <span className="text-gray-500 font-medium w-16 shrink-0">{m.label}</span>
                          <span className="text-gray-300">
                            {m.added.length > 0 && m.active.length > 0 && (
                              <>
                                {m.added.length === m.active.length ? m.active.map(med => (
                                  <span key={med} className="inline-flex items-center px-2 py-0.5 rounded mr-1 mb-1 text-xs" style={{ backgroundColor: `${getMedicationColor(med)}22`, color: getMedicationColor(med) }}>{med}</span>
                                )) : (
                                  <>
                                    {m.active.filter(x => !m.added.includes(x)).map(med => (
                                      <span key={med} className="inline-flex items-center px-2 py-0.5 rounded mr-1 mb-1 text-xs bg-slate-600/50 text-gray-300">{med}</span>
                                    ))}
                                    {m.added.map(med => (
                                      <span key={med} className="inline-flex items-center px-2 py-0.5 rounded mr-1 mb-1 text-xs border border-green-500/50 bg-green-500/10 text-green-400">+ {med}</span>
                                    ))}
                                  </>
                                )}
                              </>
                            )}
                            {m.added.length === 0 && m.active.length > 0 && m.active.map(med => (
                              <span key={med} className="inline-flex items-center px-2 py-0.5 rounded mr-1 mb-1 text-xs bg-slate-600/50 text-gray-300">{med}</span>
                            ))}
                            {m.active.length === 0 && <span className="text-gray-500">—</span>}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {schedules.length > 0 && (
                  <div className="ui-card p-4">
                    <h3 className="text-white font-medium mb-3">Your regimen</h3>
                    <div className="space-y-2">
                      {schedules.map(schedule => (
                        <div key={schedule.id} className={`flex items-center justify-between gap-3 rounded-xl border p-3 ${schedule.paused ? 'border-white/[0.05] bg-slate-800/35 opacity-70' : 'border-white/[0.06] bg-slate-700/40'}`}>
                          <button type="button" onClick={() => openProtocolEditor(schedule.medication)} className="flex min-w-0 flex-1 items-center gap-3 text-left">
                            <div className="p-2 rounded-lg" style={{ backgroundColor: `${getMedicationColor(schedule.medication)}20` }}>
                              <Syringe className="h-4 w-4" style={{ color: getMedicationColor(schedule.medication) }} />
                            </div>
                            <div className="min-w-0">
                              <div className="flex items-center gap-2"><span className="truncate text-sm font-medium text-white">{schedule.medication}</span>{schedule.paused && <span className="rounded-full bg-amber-500/10 px-2 py-0.5 text-[9px] font-medium text-amber-300">Paused</span>}</div>
                              <div className="mt-0.5 text-xs text-gray-400">
                                <span className="font-medium text-gray-200">{formatProtocolDose(schedule)}</span><span className="text-gray-600"> · </span>
                                {schedule.scheduleType === 'specific_days' && schedule.specificDays?.length > 0 
                                  ? `${schedule.specificDays.map(d => ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][d]).join(', ')}`
                                  : `Every ${schedule.frequencyDays} days`}
                                {schedule.preferredTime && ` · ${formatDoseTime(schedule.preferredTime)}`}
                              </div>
                              {(schedule.route || schedule.cycleOnWeeks) && <div className="mt-0.5 text-[10px] text-gray-500">{[schedule.route, schedule.cycleOnWeeks ? `${schedule.cycleOnWeeks} wk on${schedule.cycleOffWeeks != null ? ` / ${schedule.cycleOffWeeks} off` : ''}` : null].filter(Boolean).join(' · ')}</div>}
                            </div>
                          </button>
                          <button type="button" onClick={() => openProtocolEditor(schedule.medication)} className="shrink-0 rounded-lg p-2 text-gray-500 hover:bg-white/[0.05] hover:text-white" aria-label={`Edit ${schedule.medication} protocol`}><Edit2 className="h-4 w-4" /></button>
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
                {/* Titration Guidance */}
                <div className="rounded-2xl p-4 border border-accent/20 bg-gradient-to-br from-accent/10 to-gold-600/5 backdrop-blur-sm">
                  <h3 className="text-white font-medium mb-3 flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-violet-400" />
                    Titration Guidelines
                  </h3>
                  
                  <div className="space-y-3 text-sm">
                    {/* GLP-1 Guidance */}
                    <div className="bg-[var(--bg-card)] rounded-lg p-3">
                      <div className="text-violet-400 font-medium mb-1">GLP-1 Medications</div>
                      <div className="text-gray-300 text-xs space-y-1">
                        <p><strong>Semaglutide:</strong> Start 0.25mg → 0.5mg → 1mg → 1.7mg → 2.4mg (4 weeks each)</p>
                        <p><strong>Tirzepatide:</strong> Start 2.5mg → 5mg → 7.5mg → 10mg → 12.5mg → 15mg (4 weeks each)</p>
                        <p><strong>Retatrutide:</strong> Start 1mg → 2mg → 4mg → 8mg → 12mg (4-8 weeks each)</p>
                        <p className="text-gray-400 mt-2">💡 Increase only if tolerating well with minimal side effects</p>
                      </div>
                    </div>

                    {/* Hormone Guidance */}
                    <div className="bg-[var(--bg-card)] rounded-lg p-3">
                      <div className="text-gold-400 font-medium mb-1">Testosterone (TRT)</div>
                      <div className="text-gray-300 text-xs space-y-1">
                        <p><strong>Typical Start:</strong> 100-150mg/week split into 2 doses</p>
                        <p><strong>Titration:</strong> Adjust by 25-50mg based on blood work every 6-8 weeks</p>
                        <p><strong>Target:</strong> Mid-normal testosterone levels (500-800 ng/dL)</p>
                        <p className="text-gray-400 mt-2">⚠️ Requires regular blood work - adjust based on labs!</p>
                      </div>
                    </div>

                    {/* Peptide Guidance */}
                    <div className="bg-[var(--bg-card)] rounded-lg p-3">
                      <div className="text-green-500 font-medium mb-1">Peptides (BPC-157, TB-500)</div>
                      <div className="text-gray-300 text-xs space-y-1">
                        <p><strong>BPC-157:</strong> Typically 250-500mcg daily, no titration needed</p>
                        <p><strong>TB-500:</strong> 2-5mg twice weekly, can increase if needed</p>
                        <p className="text-gray-400 mt-2">💡 Most peptides don't require gradual titration</p>
                      </div>
                    </div>

                    <div className="bg-accent/10 border border-accent/30 rounded-lg p-2 text-xs">
                      <p className="text-gold-400 font-medium">⚠️ Important</p>
                      <p className="text-gray-300 mt-1">
                        These are general guidelines. Always follow your healthcare provider's specific titration protocol.
                        Monitor for side effects and adjust pace accordingly.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="ui-card p-4">
                  <h3 className="text-white font-medium mb-4 flex items-center gap-2"><TrendingUp className="h-5 w-5 text-violet-400" />Create Titration Plan</h3>
                  <div className="space-y-3">
                    <div>
                      <label className="text-gray-400 text-sm block mb-1">Medication</label>
                      <select value={titrationMed} onChange={(e) => setTitrationMed(e.target.value)} className="w-full bg-slate-700 text-white rounded-lg px-4 py-3">
                        {MEDICATIONS.map(med => <option key={med.name} value={med.name}>{med.name}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="text-gray-400 text-sm block mb-2">Dose Steps</label>
                      {titrationSteps.map((step, idx) => (
                        <div key={idx} className="flex gap-2 mb-2">
                          <input type="number" step="0.1" value={step.dose} onChange={(e) => { const updated = [...titrationSteps]; updated[idx].dose = e.target.value; setTitrationSteps(updated); }}
                            className="flex-1 bg-slate-700 text-white rounded-lg px-3 py-2 text-sm" placeholder="Dose" />
                          <select value={step.unit} onChange={(e) => { const updated = [...titrationSteps]; updated[idx].unit = e.target.value; setTitrationSteps(updated); }}
                            className="bg-slate-700 text-white rounded-lg px-2 py-2 text-sm"><option value="mg">mg</option><option value="mcg">mcg</option></select>
                          <input type="number" value={step.weeks} onChange={(e) => { const updated = [...titrationSteps]; updated[idx].weeks = parseInt(e.target.value); setTitrationSteps(updated); }}
                            className="w-16 bg-slate-700 text-white rounded-lg px-2 py-2 text-sm text-center" />
                          <span className="text-gray-400 text-sm self-center">wks</span>
                          {titrationSteps.length > 1 && <button onClick={() => setTitrationSteps(titrationSteps.filter((_, i) => i !== idx))} className="text-red-400 hover:text-red-300"><X className="h-4 w-4" /></button>}
                        </div>
                      ))}
                      <button onClick={() => setTitrationSteps([...titrationSteps, { dose: '', weeks: 4, unit: 'mg' }])} className="text-violet-400 text-sm hover:text-violet-300">+ Add Step</button>
                    </div>
                    <button onClick={saveTitrationPlan} className="w-full btn-secondary text-white font-medium py-3 rounded-lg transform hover:scale-105 transition-all">Save Titration Plan</button>
                  </div>
                </div>

                {titrationPlans.length > 0 && (
                  <div className="ui-card p-4">
                    <h3 className="text-white font-medium mb-3">Active Titration Plans</h3>
                    {titrationPlans.map(plan => {
                      const current = getCurrentTitrationDose(plan);
                      return (
                        <div key={plan.id} className="rounded-xl p-3 mb-2 border border-white/[0.04] bg-slate-700/40">
                          <div className="flex justify-between items-start">
                            <div>
                              <div className="text-white font-medium">{plan.medication}</div>
                              <div className="text-gray-400 text-xs">Started {new Date(plan.startDate).toLocaleDateString()}</div>
                            </div>
                            <button onClick={() => deleteTitrationPlan(plan.id)} className="text-gray-400 hover:text-red-400"><Trash2 className="h-4 w-4" /></button>
                          </div>
                          <div className="mt-2 flex flex-wrap gap-2">
                            {plan.steps.map((step, idx) => (
                              <div key={idx} className={`px-2 py-1 rounded text-xs ${current && idx + 1 === current.step ? 'bg-violet-500 text-white' : 'bg-slate-600 text-gray-300'}`}>
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

            {/* Notifications Section */}
            {activeToolSection === 'notifications' && (
              <div className="space-y-4">
                <div className="ui-card p-4">
                  <h3 className="text-white font-medium mb-4 flex items-center gap-2">
                    <Bell className="h-5 w-5 text-gold-400" />
                    General reminders
                  </h3>

                  {/* Permission Status */}
                  <div className={`rounded-lg p-4 mb-4 ${
                    notificationPermission === 'granted' ? 'bg-green-500/20 border border-green-500/30' :
                    notificationPermission === 'denied' ? 'bg-red-500/20 border border-red-500/30' :
                    'bg-slate-700/50 border border-slate-600'
                  }`}>
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <div className="text-white font-medium">Notification Permission</div>
                        <div className="text-gray-400 text-sm">
                          {notificationPermission === 'granted' && 'Notifications are enabled.'}
                          {notificationPermission === 'denied' && (Capacitor.isNativePlatform() ? 'Notifications blocked. Enable in device Settings → Apps → PepTalk → Notifications.' : 'Notifications blocked. Enable in browser settings.')}
                          {notificationPermission === 'default' && 'Allow notifications for weight and summary reminders.'}
                        </div>
                      </div>
                      {notificationPermission !== 'granted' && notificationPermission !== 'denied' && (
                        <button 
                          onClick={requestNotificationPermission}
                          className="bg-accent hover:bg-gold-600 text-white px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap"
                        >
                          Enable
                        </button>
                      )}
                    </div>
                    {notificationPermission === 'denied' && (
                      <div className="text-xs text-gray-400 mt-2">
                        {Capacitor.isNativePlatform() ? 'To enable: Settings → Apps → PepTalk → Notifications → Allow' : 'To enable: Open browser settings → Permissions → Notifications → Allow for this site'}
                      </div>
                    )}
                  </div>

                  {/* Notification Settings */}
                  {notificationPermission === 'granted' && (
                    <div className="space-y-4">
                      {/* Weight Log Reminders */}
                      <div className="rounded-xl p-4 border border-white/[0.04] bg-slate-700/40">
                        <div className="flex items-center justify-between mb-3">
                          <div>
                            <div className="text-white font-medium">Weight Log Reminders</div>
                            <div className="text-gray-400 text-sm">Daily reminder to log your weight</div>
                          </div>
                          <button
                            onClick={() => updateNotificationSettings({ weightReminders: !notificationSettings.weightReminders })}
                            className={`relative w-12 h-6 rounded-full transition-colors ${
                              notificationSettings.weightReminders ? 'bg-pink-500' : 'bg-slate-600'
                            }`}
                          >
                            <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                              notificationSettings.weightReminders ? 'right-1' : 'left-1'
                            }`} />
                          </button>
                        </div>
                        {notificationSettings.weightReminders && (
                          <div>
                            <label className="text-gray-400 text-sm block mb-1">Reminder Time</label>
                            <input
                              type="time"
                              value={notificationSettings.weightReminderTime}
                              onChange={(e) => updateNotificationSettings({ weightReminderTime: e.target.value })}
                              className="w-full bg-slate-600 text-white rounded-lg px-4 py-2"
                            />
                            <p className="text-gray-500 text-xs mt-1">Daily reminder to log your morning weight</p>
                          </div>
                        )}
                      </div>

                      <div className="rounded-xl p-4 border border-white/[0.04] bg-slate-700/40">
                        <div className="flex items-center justify-between mb-3">
                          <div><div className="text-white font-medium">Daily Schedule Summary</div><div className="text-gray-400 text-sm">A morning prompt to review today’s doses</div></div>
                          <button onClick={() => updateNotificationSettings({ dailySummary: !notificationSettings.dailySummary })} className={`relative w-12 h-6 rounded-full transition-colors ${notificationSettings.dailySummary ? 'bg-sky-500' : 'bg-slate-600'}`}><div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${notificationSettings.dailySummary ? 'right-1' : 'left-1'}`} /></button>
                        </div>
                        {notificationSettings.dailySummary && <div><label className="text-gray-400 text-sm block mb-1">Summary time</label><input type="time" value={notificationSettings.dailySummaryTime || '07:00'} onChange={(e) => updateNotificationSettings({ dailySummaryTime: e.target.value })} className="w-full bg-slate-600 text-white rounded-lg px-4 py-2" /></div>}
                      </div>

                      <div className="rounded-xl p-4 border border-white/[0.04] bg-slate-700/40">
                        <div className="flex items-center justify-between mb-3">
                          <div><div className="text-white font-medium">Weekly Summary</div><div className="text-gray-400 text-sm">Review weight trend, adherence, and dose history</div></div>
                          <button onClick={() => updateNotificationSettings({ weeklySummary: !notificationSettings.weeklySummary })} className={`relative w-12 h-6 rounded-full transition-colors ${notificationSettings.weeklySummary ? 'bg-violet-500' : 'bg-slate-600'}`}><div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${notificationSettings.weeklySummary ? 'right-1' : 'left-1'}`} /></button>
                        </div>
                        {notificationSettings.weeklySummary && (
                          <div className="grid grid-cols-2 gap-3">
                            <label><span className="text-gray-400 text-sm block mb-1">Day</span><select value={notificationSettings.weeklySummaryDay ?? 0} onChange={(event) => updateNotificationSettings({ weeklySummaryDay: Number(event.target.value) })} className="w-full bg-slate-600 text-white rounded-lg px-3 py-2">{['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].map((day, index) => <option key={day} value={index}>{day}</option>)}</select></label>
                            <label><span className="text-gray-400 text-sm block mb-1">Time</span><input type="time" value={notificationSettings.weeklySummaryTime || '18:00'} onChange={(event) => updateNotificationSettings({ weeklySummaryTime: event.target.value })} className="w-full bg-slate-600 text-white rounded-lg px-3 py-2" /></label>
                          </div>
                        )}
                      </div>

                      {/* Test Notification */}
                      <button
                        onClick={() => showNotification({
                          title: '🎉 Test Notification',
                          body: 'Notifications are working. Weight and summary reminders will appear like this.',
                          tag: 'test'
                        })}
                        className="w-full btn-secondary text-white font-medium py-3 rounded-lg transform hover:scale-105 transition-all"
                      >
                        Send Test Notification
                      </button>
                    </div>
                  )}
                  <div className="mt-4 rounded-xl border border-sky-400/20 bg-sky-500/[0.06] p-4">
                    <div className="flex items-start gap-3"><CalendarDays className="mt-0.5 h-5 w-5 shrink-0 text-sky-300" /><div><div className="font-medium text-white">Reliable iPhone reminders</div><p className="mt-1 text-xs leading-relaxed text-gray-400">Because PepTalk is currently a web app, iPhone may suspend web notifications when it is closed. Add the enabled general reminders to Apple Calendar for reliable delivery.</p></div></div>
                    <button type="button" onClick={downloadGeneralReminderCalendar} className="mt-3 flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-sky-500 px-4 text-sm font-semibold text-white hover:bg-sky-400"><Download className="h-4 w-4" />Add general reminders to Apple Calendar</button>
                    <p className="mt-2 text-[10px] text-gray-500">On iPhone, open the downloaded PepTalk calendar file and choose Add All.</p>
                  </div>
                </div>
              </div>
            )}

            {/* Vials / Inventory Section */}
            {activeToolSection === 'vials' && (
              <div className="space-y-4">
                <div className="ui-card p-4">
                  <h3 className="text-white font-medium mb-4 flex items-center gap-2"><Syringe className="h-5 w-5 text-gold-400" />Vial inventory</h3>
                  <p className="text-gray-400 text-sm mb-4">Reconstitution calculator: enter vial size and bac water (for peptides/hormones that need reconstitution). Pre‑constituted meds (e.g. testosterone in oil): use <strong>Volume (ml)</strong> + <strong>Concentration (mg/ml)</strong> — e.g. label &quot;250 mg/mL&quot; means 250 mg/ml concentration. 10 ml × 250 = 2500 mg total. When you log an injection and choose a vial, the dose is subtracted automatically.</p>
                  <div className="space-y-3">
                    {editingVialId != null ? (
                      <>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-gold-400 font-medium text-sm">Edit vial</span>
                          <button type="button" onClick={() => { setEditingVialId(null); setVialTotalMg(''); setVialRemainingMg(''); setVialConcentrationForMl(''); setVialBacWaterMl(''); setVialExpiry(''); setVialReconstituted(false); setVialReconstitutedDate(''); setVialPhotoDataUrl(null); setVialPhotoRemoved(false); }} className="text-gray-400 hover:text-white text-sm">Cancel</button>
                        </div>
                        <div>
                          <label className="text-gray-400 text-sm block mb-1">Medication</label>
                          <select value={vialMedication} onChange={(e) => setVialMedication(e.target.value)} className="w-full bg-slate-700 text-white rounded-lg px-4 py-2">
                            {MEDICATIONS.map(m => <option key={m.name} value={m.name}>{m.name}</option>)}
                          </select>
                        </div>
                        <p className="text-gray-500 text-xs leading-relaxed">
                          If you fix <strong className="text-gray-400">total mg</strong> and <strong className="text-gray-400">BAC</strong>, Insights and weekly mg already use the new concentration for past injections linked to this vial—no need to re-log them. Only <strong className="text-gray-400">remaining mg</strong> may still reflect old math; use the button below after updating total/BAC.
                        </p>
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="text-gray-400 text-sm block mb-1">Total (mg)</label>
                            <input type="number" step="0.01" min="0" value={vialTotalMg} onChange={(e) => setVialTotalMg(e.target.value)} className="w-full bg-slate-700 text-white rounded-lg px-4 py-2" />
                          </div>
                          <div>
                            <label className="text-gray-400 text-sm block mb-1">Remaining (mg)</label>
                            <input type="number" step="0.01" min="0" value={vialRemainingMg} onChange={(e) => setVialRemainingMg(e.target.value)} className="w-full bg-slate-700 text-white rounded-lg px-4 py-2" />
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            const totalMg = parseFloat(vialTotalMg);
                            if (isNaN(totalMg) || totalMg <= 0) return;
                            const bacMl = parseFloat(vialBacWaterMl);
                            const concManual = vialConcentrationForMl ? parseFloat(vialConcentrationForMl) : NaN;
                            const concFromBac = !isNaN(bacMl) && bacMl > 0 ? totalMg / bacMl : undefined;
                            const concentration = (!isNaN(concManual) && concManual > 0)
                              ? concManual
                              : (concFromBac && concFromBac > 0)
                                ? concFromBac
                                : undefined;
                            const tempVial = {
                              concentration: concentration && concentration > 0 ? concentration : undefined,
                              bacWaterMl: !isNaN(bacMl) && bacMl > 0 ? bacMl : undefined,
                              totalMg,
                            };
                            const conc = getVialConcentrationMgPerMl(tempVial);
                            let usedMg = 0;
                            injectionEntries.forEach((inj) => {
                              if (inj.vialId !== editingVialId) return;
                              const d = parseFloat(inj.dose);
                              if (isNaN(d)) return;
                              const u = (inj.unit || 'mg').toLowerCase();
                              const med = inj.type;
                              if (u === 'units' && med === 'Retatrutide') {
                                usedMg += d / RETATRUTIDE_UNITS_PER_MG;
                                return;
                              }
                              if (u === 'ml' && conc > 0) {
                                usedMg += d * conc;
                                return;
                              }
                              if (u === 'units' && conc > 0) {
                                usedMg += (d / 100) * conc;
                                return;
                              }
                              if (u === 'mcg') usedMg += d / 1000;
                              else if (u === 'ml') usedMg += d;
                              else if (u === 'units') usedMg += d / 100;
                              else if (u === 'iu') usedMg += d / 1000;
                              else usedMg += d;
                            });
                            const rem = Math.max(0, totalMg - usedMg);
                            setVialRemainingMg(String(Math.round(rem * 1000) / 1000));
                          }}
                          className="w-full text-xs font-medium py-2 rounded-lg border border-accent/40 text-accent hover:bg-accent/10"
                        >
                          Set remaining from injection history (uses Total, BAC &amp; concentration above)
                        </button>
                        <div>
                          <label className="text-gray-400 text-sm block mb-1">Bac water (mL)</label>
                          <input type="number" step="0.1" min="0" value={vialBacWaterMl} onChange={(e) => setVialBacWaterMl(e.target.value)} className="w-full bg-slate-700 text-white rounded-lg px-4 py-2" placeholder="e.g. 2.5" />
                          <p className="text-gray-500 text-xs mt-1">Used with total mg to compute mg/mL for unit doses. Leave blank if you only use concentration below.</p>
                        </div>
                        <div>
                          <label className="text-gray-400 text-sm block mb-1">Concentration (mg/ml)</label>
                          <input type="number" step="0.1" min="0" value={vialConcentrationForMl} onChange={(e) => setVialConcentrationForMl(e.target.value)} className="w-full bg-slate-700 text-white rounded-lg px-4 py-2" placeholder="e.g. 26.7 or leave blank" />
                          <p className="text-gray-500 text-xs mt-1">Optional if you entered BAC; otherwise total mg ÷ BAC.</p>
                        </div>
                        <div>
                          <label className="text-gray-400 text-sm block mb-1">Expiry / use-by (optional)</label>
                          <input type="date" value={vialExpiry} onChange={(e) => setVialExpiry(e.target.value)} className="w-full bg-slate-700 text-white rounded-lg px-4 py-2" />
                        </div>
                        <div>
                          <label className="text-gray-400 text-sm block mb-1">Vial label photo (optional)</label>
                          {vialPhotoDataUrl && !vialPhotoRemoved && (
                            <img src={vialPhotoDataUrl} alt="" className="h-16 w-16 object-cover rounded-lg mb-2 border border-white/10" />
                          )}
                          <div className="flex flex-wrap gap-2 items-center">
                            <label className="px-3 py-2 rounded-lg bg-slate-600 text-white text-xs cursor-pointer">
                              Choose image
                              <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={async (e) => {
                                  const f = e.target.files?.[0];
                                  if (!f) return;
                                  const url = await compressImageFileToDataUrl(f);
                                  if (url) {
                                    setVialPhotoDataUrl(url);
                                    setVialPhotoRemoved(false);
                                  }
                                  e.target.value = '';
                                }}
                              />
                            </label>
                            {vialPhotoDataUrl && !vialPhotoRemoved && (
                              <button type="button" onClick={() => { setVialPhotoRemoved(true); setVialPhotoDataUrl(null); }} className="text-xs text-red-400 hover:text-red-300 px-2">
                                Remove photo
                              </button>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <input type="checkbox" id="vial-recon-edit" checked={vialReconstituted} onChange={(e) => setVialReconstituted(e.target.checked)} className="rounded bg-slate-700" />
                          <label htmlFor="vial-recon-edit" className="text-gray-400 text-sm">Reconstituted</label>
                        </div>
                        {vialReconstituted && (
                          <div>
                            <label className="text-gray-400 text-sm block mb-1">Reconstituted on</label>
                            <input type="date" value={vialReconstitutedDate} onChange={(e) => setVialReconstitutedDate(e.target.value)} className="w-full bg-slate-700 text-white rounded-lg px-4 py-2" />
                          </div>
                        )}
                        <button
                          onClick={() => {
                            const totalMg = parseFloat(vialTotalMg);
                            const remainingMg = parseFloat(vialRemainingMg);
                            if (isNaN(totalMg) || totalMg <= 0) return;
                            const bacMl = parseFloat(vialBacWaterMl);
                            const concManual = vialConcentrationForMl ? parseFloat(vialConcentrationForMl) : undefined;
                            const concFromBac = !isNaN(bacMl) && bacMl > 0 ? totalMg / bacMl : undefined;
                            const concentration = (concManual && concManual > 0) ? concManual : (concFromBac && concFromBac > 0) ? concFromBac : undefined;
                            let updated = vials.map(v => v.id === editingVialId ? {
                              ...v,
                              medication: vialMedication,
                              totalMg,
                              remainingMg: isNaN(remainingMg) || remainingMg < 0 ? v.remainingMg : Math.min(remainingMg, totalMg),
                              concentration: concentration && concentration > 0 ? concentration : v.concentration,
                              bacWaterMl: !isNaN(bacMl) && bacMl > 0 ? bacMl : v.bacWaterMl,
                              expiry: vialExpiry || null,
                              reconstitutedDate: vialReconstituted && vialReconstitutedDate ? vialReconstitutedDate : null,
                              photoDataUrl: vialPhotoRemoved ? undefined : (vialPhotoDataUrl || v.photoDataUrl),
                            } : v);
                            updated = pruneEmptyVials(updated);
                            setVials(updated);
                            saveData('health-vials', updated);
                            setEditingVialId(null);
                            setVialTotalMg('');
                            setVialRemainingMg('');
                            setVialConcentrationForMl('');
                            setVialBacWaterMl('');
                            setVialExpiry('');
                            setVialReconstituted(false);
                            setVialReconstitutedDate('');
                            setVialPhotoDataUrl(null);
                            setVialPhotoRemoved(false);
                          }}
                          className="w-full ui-btn-primary py-2.5"
                        >
                          Update vial
                        </button>
                      </>
                    ) : (
                      <>
                    <div>
                      <label className="text-gray-400 text-sm block mb-1">Medication</label>
                      <select value={vialMedication} onChange={(e) => setVialMedication(e.target.value)} className="w-full bg-slate-700 text-white rounded-lg px-4 py-2">
                        {MEDICATIONS.map(m => <option key={m.name} value={m.name}>{m.name}</option>)}
                      </select>
                    </div>
                    <div className="flex gap-2">
                      <div className="flex-1">
                        <label className="text-gray-400 text-sm block mb-1">{MEDICATIONS.find(m => m.name === vialMedication)?.preConstituted ? 'Vial size (total in vial)' : 'Vial size (peptide in vial)'}</label>
                        <input type="number" step="0.01" min="0" value={vialTotalMg} onChange={(e) => setVialTotalMg(e.target.value)} className="w-full bg-slate-700 text-white rounded-lg px-4 py-2" placeholder={vialUnit === 'ml' ? 'e.g. 10' : MEDICATIONS.find(m => m.name === vialMedication)?.preConstituted ? 'e.g. 200' : 'e.g. 5'} />
                      </div>
                      <div className="w-24 min-w-[5rem] flex-shrink-0">
                        <label className="text-gray-400 text-sm block mb-1">Unit</label>
                        <select value={vialUnit} onChange={(e) => setVialUnit(e.target.value)} className="w-full bg-slate-700 text-white rounded-lg px-2 py-2 text-sm">
                          <option value="mg">mg</option>
                          <option value="mcg">mcg</option>
                          <option value="ml">ml</option>
                          <option value="units">units</option>
                          <option value="IU">IU</option>
                        </select>
                      </div>
                    </div>
                    {vialUnit === 'ml' && (
                      <div>
                        <label className="text-gray-400 text-sm block mb-1">Concentration (mg/ml)</label>
                        <input type="number" step="0.1" min="0" value={vialConcentrationForMl} onChange={(e) => setVialConcentrationForMl(e.target.value)} className="w-full bg-slate-700 text-white rounded-lg px-4 py-2" placeholder="e.g. 250" />
                        <p className="text-gray-500 text-xs mt-1">Label often says &quot;250 mg/mL&quot; — that&apos;s concentration. Total mg = volume × concentration. 10 ml × 250 mg/ml = 2500 mg. Dose 0.5 ml = 125 mg.</p>
                      </div>
                    )}
                    {MEDICATIONS.find(m => m.name === vialMedication)?.preConstituted ? (
                      <p className="text-gray-500 text-xs">Pre-constituted (e.g. in oil). Use Volume (ml) + Concentration (mg/ml) above for total mg.</p>
                    ) : (
                      <div>
                        <label className="text-gray-400 text-sm block mb-1">Bac water vol (ml)</label>
                        <input type="number" step="0.1" min="0" value={vialBacWaterMl} onChange={(e) => setVialBacWaterMl(e.target.value)} className="w-full bg-slate-700 text-white rounded-lg px-4 py-2" placeholder="e.g. 2" />
                        <p className="text-gray-500 text-xs mt-1">Dose = vial size ÷ bac water. Example: 5 mg + 2 ml → 2.5 mg/ml.</p>
                      </div>
                    )}
                    <div>
                      <label className="text-gray-400 text-sm block mb-1">Expiry / use-by date (optional)</label>
                      <input type="date" value={vialExpiry} onChange={(e) => setVialExpiry(e.target.value)} className="w-full bg-slate-700 text-white rounded-lg px-4 py-2" />
                      <p className="text-gray-500 text-xs mt-1">Use printed expiry or use-by after reconstitution, whichever is earlier.</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <input type="checkbox" id="vial-recon" checked={vialReconstituted} onChange={(e) => setVialReconstituted(e.target.checked)} className="rounded bg-slate-700" />
                      <label htmlFor="vial-recon" className="text-gray-400 text-sm">Reconstituted</label>
                    </div>
                    {vialReconstituted && (
                      <div>
                        <label className="text-gray-400 text-sm block mb-1">Reconstituted on</label>
                        <input type="date" value={vialReconstitutedDate} onChange={(e) => setVialReconstitutedDate(e.target.value)} className="w-full bg-slate-700 text-white rounded-lg px-4 py-2" />
                        <p className="text-gray-500 text-xs mt-1">Many peptides are stable 28–56 days after reconstitution.</p>
                      </div>
                    )}
                    <div>
                      <label className="text-gray-400 text-sm block mb-1">Vial label photo (optional)</label>
                      {vialPhotoDataUrl && (
                        <img src={vialPhotoDataUrl} alt="" className="h-16 w-16 object-cover rounded-lg mb-2 border border-white/10" />
                      )}
                      <label className="inline-block px-3 py-2 rounded-lg bg-slate-600 text-white text-xs cursor-pointer">
                        Choose image
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={async (e) => {
                            const f = e.target.files?.[0];
                            if (!f) return;
                            const url = await compressImageFileToDataUrl(f);
                            if (url) setVialPhotoDataUrl(url);
                            e.target.value = '';
                          }}
                        />
                      </label>
                      {vialPhotoDataUrl && (
                        <button type="button" onClick={() => setVialPhotoDataUrl(null)} className="ml-2 text-xs text-red-400 hover:text-red-300 px-2">
                          Clear
                        </button>
                      )}
                    </div>
                    <button
                      onClick={() => {
                        const concentrationForMl = vialUnit === 'ml' ? (vialConcentrationForMl || '1') : null;
                        const totalMg = vialAmountToMg(vialTotalMg, vialUnit, concentrationForMl);
                        if (totalMg <= 0) return;
                        const bacMl = parseFloat(vialBacWaterMl);
                        const concentration = (bacMl > 0 && !isNaN(bacMl)) ? totalMg / bacMl : (vialUnit === 'ml' && vialConcentrationForMl) ? parseFloat(vialConcentrationForMl) : undefined;
                        const newVial = {
                          id: Date.now(),
                          medication: vialMedication,
                          totalMg,
                          remainingMg: totalMg,
                          unit: 'mg',
                          concentration: concentration && concentration > 0 ? concentration : undefined,
                          bacWaterMl: bacMl > 0 && !isNaN(bacMl) ? bacMl : undefined,
                          expiry: vialExpiry || null,
                          reconstitutedDate: vialReconstituted && vialReconstitutedDate ? vialReconstitutedDate : null,
                          photoDataUrl: vialPhotoDataUrl || undefined,
                        };
                        const updated = [...vials, newVial];
                        setVials(updated);
                        saveData('health-vials', updated);
                        setVialTotalMg('');
                        setVialBacWaterMl('');
                        setVialConcentrationForMl('');
                        setVialExpiry('');
                        setVialReconstituted(false);
                        setVialReconstitutedDate('');
                        setVialPhotoDataUrl(null);
                        setVialPhotoRemoved(false);
                      }}
                      className="w-full ui-btn-primary py-2.5"
                    >
                      Add vial
                    </button>
                      </>
                    )}
                  </div>
                </div>
                {vials.length > 0 && (
                  <div className="ui-card p-4">
                    <h4 className="text-white font-medium mb-3">Your vials</h4>
                    <div className="space-y-2">
                      {vials.map(v => {
                        const remMg = v.remainingMg ?? v.totalMg;
                        const totalMg = v.totalMg;
                        const conc = v.concentration;
                        const isLow = remMg <= 0;
                        const useBy = v.reconstitutedDate ? (() => {
                          const d = new Date(v.reconstitutedDate);
                          d.setDate(d.getDate() + 28);
                          return d.toISOString().slice(0, 10);
                        })() : null;
                        const remMl = conc > 0 ? remMg / conc : null;
                        const totalMl = conc > 0 ? totalMg / conc : null;
                        const forecast = getVialForecast(v);
                        const isRunningLow = Boolean(forecast && forecast.dosesRemaining <= 3);
                        return (
                          <div key={v.id} className={`flex items-center justify-between rounded-2xl border p-3 gap-3 ${isLow ? 'border-rose-400/15 bg-rose-500/[0.04] opacity-70' : isRunningLow ? 'border-amber-300/20 bg-amber-400/[0.04]' : 'border-white/[0.05] bg-slate-700/40'}`}>
                            <div className="flex items-center gap-3 min-w-0">
                              {v.photoDataUrl && (
                                <img src={v.photoDataUrl} alt="" className="h-10 w-10 rounded-md object-cover border border-white/10 shrink-0" />
                              )}
                              <div className="min-w-0">
                              <span className="text-white font-medium">{v.medication}</span>{isRunningLow && <span className="ml-2 rounded-full bg-amber-400/10 px-2 py-0.5 text-[10px] font-semibold text-amber-300">Low · {forecast.dosesRemaining} doses</span>}
                              <span className="text-gray-400 text-sm ml-2">{remMg.toFixed(1)} / {totalMg.toFixed(1)} mg</span>
                              {conc > 0 && <span className="text-gray-500 text-xs ml-2">· {conc.toFixed(1)} mg/ml{remMl != null && totalMl != null ? ` · ${remMl.toFixed(1)} / ${totalMl.toFixed(1)} ml` : ''}</span>}
                              {v.expiry && <span className="text-gray-500 text-xs ml-2">· Exp {v.expiry}</span>}
                              {v.reconstitutedDate && <span className="text-gray-500 text-xs ml-2 block">Recon {v.reconstitutedDate}{useBy ? ` · use by ${useBy}` : ''}</span>}
                              {forecast && <span className="block text-xs text-gold-400/80">Inventory forecast: ~{forecast.dosesRemaining} doses · through {parseLocalDate(forecast.through).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>}
                              </div>
                            </div>
                            <div className="flex items-center gap-1 shrink-0">
                              <button onClick={() => { setEditingVialId(v.id); setVialMedication(v.medication); setVialTotalMg(String(v.totalMg)); setVialRemainingMg(String(v.remainingMg ?? v.totalMg)); setVialConcentrationForMl(v.concentration ? String(v.concentration) : ''); setVialBacWaterMl(v.bacWaterMl != null ? String(v.bacWaterMl) : ''); setVialExpiry(v.expiry || ''); setVialReconstituted(!!v.reconstitutedDate); setVialReconstitutedDate(v.reconstitutedDate || ''); setVialPhotoDataUrl(v.photoDataUrl || null); setVialPhotoRemoved(false); }} className="p-2 text-gray-400 hover:text-gold-400 rounded-lg" title="Edit vial"><Edit2 className="h-4 w-4" /></button>
                              <button onClick={() => { const updated = vials.filter(x => x.id !== v.id); setVials(updated); saveData('health-vials', updated); if (editingVialId === v.id) setEditingVialId(null); }} className="p-2 text-gray-400 hover:text-red-400 rounded-lg"><Trash2 className="h-4 w-4" /></button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Data Management Section */}
            {activeToolSection === 'data' && (
              <div className="space-y-4">
                <div className="ui-card p-4">
                  <h3 className="text-white font-medium mb-4 flex items-center gap-2">
                    <Activity className="h-5 w-5 text-gold-400" />
                    Export & Import Data
                  </h3>
                  
                  <div className="space-y-4">
                    <div className="rounded-xl border border-sky-400/15 bg-sky-500/[0.05] p-4">
                      <div className="flex items-start gap-3">
                        <div className="rounded-xl bg-sky-400/10 p-2"><Activity className="h-5 w-5 text-sky-300" /></div>
                        <div className="min-w-0 flex-1">
                          <h4 className="font-medium text-white">Apple Health &amp; iPhone</h4>
                          <p className="mt-1 text-xs leading-relaxed text-gray-400">Import body-weight history without replacing your PepTalk data. Choose how PepTalk reduces multiple same-day readings to one clean graph point.</p>
                        </div>
                      </div>
                      <label className="mt-4 block"><span className="mb-1.5 block text-xs font-medium text-gray-400">Daily reading rule</span><select value={appleWeightDailyStrategy} onChange={(event) => { setAppleWeightDailyStrategy(event.target.value); saveData('health-apple-weight-strategy', event.target.value); }} className="w-full rounded-xl border border-white/[0.06] bg-slate-700 px-3 py-3 text-white"><option value="morning">First morning reading</option><option value="latest">Latest reading of the day</option><option value="lowest">Lowest reading of the day</option><option value="average">Daily average</option></select></label>
                      <label className="mt-4 flex min-h-11 w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-sky-500 px-4 text-sm font-semibold text-white hover:bg-sky-400">
                        <Download className="h-4 w-4" /> Import Apple Health weights
                        <input type="file" accept=".xml,.csv,text/xml,text/csv" onChange={importAppleHealthWeights} className="hidden" />
                      </label>
                      <div className="mt-3 rounded-xl bg-black/10 p-3 text-[11px] leading-relaxed text-gray-400">
                        <span className="font-medium text-gray-300">On iPhone:</span> Health → your profile picture → Export All Health Data → save to Files. In Files, tap the ZIP once to unzip it, then choose <span className="text-gray-200">export.xml</span> here.
                      </div>
                      <p className="mt-2 text-[10px] leading-relaxed text-gray-500">Apple does not allow a web page to read HealthKit automatically. True background sync requires a native iPhone app; this importer is the private, no-cost web alternative.</p>
                      {appleHealthImportHistory.length > 0 && (
                        <div className="mt-3 border-t border-white/[0.06] pt-3">
                          <div className="mb-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-gray-500">Import history</div>
                          <div className="space-y-1.5">
                            {appleHealthImportHistory.slice(0, 3).map((item) => (
                              <div key={item.id} className="flex items-center justify-between gap-3 rounded-lg bg-black/10 px-3 py-2 text-[11px]">
                                <div className="min-w-0"><div className="truncate text-gray-300">{item.fileName}</div><div className="text-gray-500">{new Date(item.importedAt).toLocaleString()}</div></div>
                                <div className="shrink-0 text-right text-sky-300">+{item.added}<div className="text-[10px] text-gray-500">{item.skipped} skipped</div></div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      <div className="mt-3 border-t border-white/[0.06] pt-3 text-[11px] text-gray-400"><span className="font-medium text-gray-300">Install PepTalk:</span> open it in Safari, tap Share, then “Add to Home Screen.”</div>
                    </div>

                    {/* Export — choose format then export */}
                    <div className="rounded-xl p-4 border border-white/[0.04] bg-slate-700/40">
                      <h4 className="text-white font-medium mb-2 flex items-center gap-2">
                        <FileDown className="h-5 w-5 text-gold-400" />
                        Export data
                      </h4>
                      <p className="text-gray-400 text-sm mb-3">
                        Choose the type of export you need, then tap Export.
                      </p>
                      <div className="mb-3 flex items-center justify-between rounded-xl border border-white/[0.05] bg-black/10 px-3 py-2 text-xs"><span className="text-gray-500">Last full backup</span><span className={lastBackupAt ? 'text-emerald-300' : 'text-amber-300'}>{lastBackupAt ? new Date(lastBackupAt).toLocaleString() : 'Not backed up yet'}</span></div>
                      <div className="mb-4">
                        <label className="text-gray-400 text-xs block mb-2">Export as</label>
                        <select value={exportFormat} onChange={(e) => setExportFormat(e.target.value)} className="w-full bg-slate-700 text-white rounded-lg px-4 py-3 border border-white/[0.06]">
                          <option value="json">JSON Backup — full backup, import later</option>
                          <option value="csv">CSV — for spreadsheets</option>
                        </select>
                      </div>
                      {exportFormat === 'csv' && (
                        <div className="mb-4">
                          <label className="text-gray-400 text-xs block mb-2">CSV contents</label>
                          <select value={csvType} onChange={(e) => setCsvType(e.target.value)} className="w-full bg-slate-700 text-white rounded-lg px-4 py-3 border border-white/[0.06]">
                            <option value="full">Full — weight, injections, glucose, A1C</option>
                            <option value="weight">Weight only</option>
                            <option value="injections">Injections only</option>
                          </select>
                        </div>
                      )}
                      <button onClick={runExport} className="w-full bg-accent hover:bg-gold-600 text-gray-900 font-medium py-3 rounded-lg flex items-center justify-center gap-2 shadow-accent/20">
                        <FileDown className="h-5 w-5" />
                        {exportFormat === 'json' ? 'Export backup (JSON)' : `Download CSV${csvType !== 'full' ? ` (${csvType})` : ''}`}
                      </button>
                      <label className="mt-2 flex min-h-10 w-full cursor-pointer items-center justify-center gap-2 rounded-xl border border-white/[0.07] bg-white/[0.035] px-4 text-xs font-medium text-gray-300 hover:bg-white/[0.06]"><CheckCircle className="h-4 w-4 text-emerald-300" />Verify a backup file<input type="file" accept="application/json,.json" onChange={verifyBackupFile} className="hidden" /></label>
                      <div className="flex flex-col sm:flex-row gap-2 mt-3">
                        <button type="button" onClick={exportClinicianPdfFile} className="flex-1 py-2.5 rounded-lg font-medium text-sm bg-white/10 text-gray-100 hover:bg-white/15 flex items-center justify-center gap-2">
                          <FileText className="h-4 w-4" />
                          Download PDF summary
                        </button>
                        <button type="button" onClick={printDoctorSummary} className="flex-1 py-2.5 rounded-lg font-medium text-sm bg-white/10 text-gray-100 hover:bg-white/15 flex items-center justify-center gap-2">
                          <FileDown className="h-4 w-4" />
                          Print / Save as PDF
                        </button>
                      </div>
                      <button
                        type="button"
                        onClick={() => setShowGraphicalSummary(true)}
                        className="w-full mt-2 py-2.5 rounded-lg font-medium text-sm bg-white/10 text-gray-100 hover:bg-white/15 flex items-center justify-center gap-2 border border-white/[0.06]"
                      >
                        <BarChart3 className="h-4 w-4 text-gold-400" />
                        Open protocol-style summary
                      </button>
                      <p className="text-gray-500 text-[11px] mt-2">PDF tools package your recent tracker records for visits. Protocol-style summary uses a worksheet layout with stack details, schedules, vials, and charts.</p>
                    </div>

                    {/* Import Section */}
                    <div className="rounded-xl p-4 border border-white/[0.04] bg-slate-700/40">
                      <h4 className="text-white font-medium mb-2">Import Data</h4>
                      <p className="text-gray-400 text-sm mb-3">
                        Restore data from a backup file.
                      </p>
                      <div className="bg-accent/20 border border-accent/50 rounded-lg p-3 mb-3">
                        <p className="text-gold-400 text-sm flex items-center gap-2">
                          <AlertCircle className="h-4 w-4" />
                          <span>Warning: This will replace all current data!</span>
                        </p>
                      </div>
                      <label className="w-full bg-accent hover:bg-gold-400 text-gray-900 font-medium py-3 rounded-lg flex items-center justify-center gap-2 cursor-pointer shadow-gold-glow">
                        <Plus className="h-5 w-5" />
                        Import Data File
                        <input type="file" accept=".json" onChange={importData} className="hidden" />
                      </label>
                    </div>
{/* Danger Zone */}
<div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
  <h4 className="text-white font-medium mb-2">Danger Zone</h4>
  <p className="text-gray-300 text-sm mb-3">
    Permanently deletes all saved PepTalk data on this device.
  </p>
  <button
    onClick={() => { setShowWipeConfirm(true); setWipeConfirmChecked(false); }}
    className="w-full bg-red-500 hover:bg-red-600 text-white font-medium py-3 rounded-lg"
  >
    Wipe All Data
  </button>
</div>
                    {/* Data Summary */}
                    <div className="rounded-xl p-4 border border-white/[0.04] bg-slate-700/40">
                      <h4 className="text-white font-medium mb-3">Current Data Summary</h4>
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-400">Weight entries:</span>
                          <span className="text-white font-medium">{weightEntries.length}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Injections:</span>
                          <span className="text-white font-medium">{injectionEntries.length}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Measurements:</span>
                          <span className="text-white font-medium">{measurementEntries.length}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Progress photos:</span>
                          <span className="text-white font-medium">{progressPhotos.length}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Schedules:</span>
                          <span className="text-white font-medium">{schedules.length}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
            )}
            {activeMoreSection === 'wellness' && (
          <div className="space-y-4 tab-enter">
            <div className="ui-card p-4">
              <h2 className="text-xl font-bold text-white mb-1 flex items-center gap-2"><Moon className="h-6 w-6 text-indigo-400" />Sleep</h2>
              <p className="text-gray-400 text-sm mb-4">Log bed / wake times and a simple quality score. Shown in Summary &quot;This week&quot;.</p>
              {!showSleepForm ? (
                <button type="button" onClick={() => { setEditingSleep(null); setSleepBedDate(getTodayLocal()); setShowSleepForm(true); }} className="w-full py-3 rounded-xl border-2 border-dashed border-gray-500 text-gray-400 hover:text-white hover:border-indigo-500/50 text-sm font-medium flex items-center justify-center gap-2"><Plus className="h-4 w-4" />Log sleep</button>
              ) : (
                <div className="rounded-xl p-4 bg-slate-700/50 space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gold-400 text-sm font-medium">{editingSleep ? 'Edit sleep' : 'Add sleep'}</span>
                    <button type="button" onClick={resetSleepForm} className="text-gray-400 hover:text-white"><X className="h-5 w-5" /></button>
                  </div>
                  <div>
                    <label className="text-gray-400 text-xs block mb-1">Night (bed date)</label>
                    <input type="date" value={sleepBedDate} onChange={(e) => setSleepBedDate(e.target.value)} className="w-full bg-slate-700 text-white rounded-lg px-4 py-2" />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-gray-400 text-xs block mb-1">Bed time</label>
                      <input type="time" value={sleepBedTime} onChange={(e) => setSleepBedTime(e.target.value)} className="w-full bg-slate-700 text-white rounded-lg px-4 py-2" />
                    </div>
                    <div>
                      <label className="text-gray-400 text-xs block mb-1">Wake time</label>
                      <input type="time" value={sleepWakeTime} onChange={(e) => setSleepWakeTime(e.target.value)} className="w-full bg-slate-700 text-white rounded-lg px-4 py-2" />
                    </div>
                  </div>
                  <div>
                    <label className="text-gray-400 text-xs block mb-1">Sleep quality: {sleepQuality}/5</label>
                    <input type="range" min={1} max={5} value={sleepQuality} onChange={(e) => setSleepQuality(parseInt(e.target.value, 10))} className="w-full accent-indigo-500" />
                  </div>
                  <div>
                    <label className="text-gray-400 text-xs block mb-1">Notes (optional)</label>
                    <input type="text" value={sleepNotes} onChange={(e) => setSleepNotes(e.target.value)} className="w-full bg-slate-700 text-white rounded-lg px-4 py-2" placeholder="e.g. restless, caffeine late" />
                  </div>
                  <button type="button" onClick={addOrUpdateSleep} className="w-full ui-btn-primary py-2.5">{editingSleep ? 'Update' : 'Save'}</button>
                </div>
              )}
              {sleepEntries.length > 0 && (
                <div className="mt-4 space-y-2 max-h-56 overflow-y-auto">
                  {[...sleepEntries].sort((a, b) => String(b.date).localeCompare(String(a.date))).map((e) => (
                    <div key={e.id} className="flex items-center justify-between gap-2 py-2 border-b border-white/5 text-sm">
                      <div>
                        <span className="text-white">{e.date}</span>
                        <span className="text-gray-400 ml-2">{e.bedTime} → {e.wakeTime}</span>
                        <span className="text-indigo-300 ml-2">~{e.hours}h · Q{e.quality}/5</span>
                      </div>
                      <div className="flex gap-1 shrink-0">
                        <button type="button" onClick={() => { setEditingSleep(e); setSleepBedDate(e.date); setSleepBedTime(e.bedTime); setSleepWakeTime(e.wakeTime); setSleepQuality(e.quality); setSleepNotes(e.notes || ''); setShowSleepForm(true); }} className="p-1.5 text-gray-400 hover:text-white rounded-md"><Edit2 className="h-3.5 w-3.5" /></button>
                        <button type="button" onClick={() => deleteSleep(e.id)} className="p-1.5 text-gray-400 hover:text-red-400 rounded-md"><Trash2 className="h-3.5 w-3.5" /></button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              {sleepEntries.length > 1 && (
                <div className="mt-4 h-40">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={[...sleepEntries].sort((a, b) => String(a.date).localeCompare(String(b.date))).slice(-14).map((e) => ({ label: e.date.slice(5), hours: e.hours, quality: e.quality }))}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                      <XAxis dataKey="label" stroke="#94a3b8" fontSize={10} />
                      <YAxis stroke="#94a3b8" fontSize={10} domain={[0, 14]} />
                      <Tooltip contentStyle={{ backgroundColor: 'rgba(30,41,59,0.95)', border: '1px solid rgba(255,255,255,0.08)' }} />
                      <Line type="monotone" dataKey="hours" stroke="#818cf8" strokeWidth={2} dot={{ r: 3 }} name="Hours" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>
            <div className="ui-card p-4">
              <h3 className="text-white font-medium mb-2 flex items-center gap-2"><Activity className="h-5 w-5 text-sky-400" />Activity / steps</h3>
              <p className="text-gray-400 text-xs mb-3">
                Log today&apos;s step count for your weekly Summary. Automatic sync from Google Health Connect is not enabled in this build — manual entry only for now.
              </p>
              <div className="flex gap-2 flex-wrap">
                <input type="number" min={0} max={200000} value={todayStepsInput} onChange={(e) => setTodayStepsInput(e.target.value)} placeholder="Steps today" className="flex-1 min-w-[8rem] bg-slate-700 text-white rounded-lg px-4 py-2" />
                <button type="button" onClick={saveTodaySteps} className="ui-btn-primary px-4 py-2">Save</button>
              </div>
              {(() => {
                const t = getTodayLocal();
                const row = dailyTrackEntries.find((e) => e.date === t);
                return row?.steps != null ? <p className="text-gray-500 text-xs mt-2">Today logged: <span className="text-white font-medium">{row.steps}</span> steps</p> : null;
              })()}
            </div>
          </div>
            )}
            {activeMoreSection === 'help' && (
          <div className="space-y-4 tab-enter">
            <div className="ui-card p-4">
              <h2 className="text-xl font-bold text-white mb-2 flex items-center gap-2"><HelpCircle className="h-6 w-6 text-gold-400" />FAQ</h2>
              <p className="text-gray-400 text-sm mb-4">Quick answers about PepTalk. Not medical advice.</p>
              <div className="space-y-2">
                {PEP_TALK_FAQ.map((item, idx) => (
                  <div key={idx} className="rounded-xl border border-white/[0.06] bg-slate-800/40 overflow-hidden">
                    <button type="button" onClick={() => setFaqOpenId(faqOpenId === idx ? null : idx)} className="w-full text-left px-4 py-3 flex justify-between items-center gap-2 text-white text-sm font-medium hover:bg-white/5">
                      {item.q}
                      <ChevronDown className={`h-4 w-4 shrink-0 transition-transform ${faqOpenId === idx ? 'rotate-180' : ''}`} />
                    </button>
                    {faqOpenId === idx && <p className="px-4 pb-3 text-gray-400 text-sm leading-relaxed">{item.a}</p>}
                  </div>
                ))}
              </div>
            </div>
          </div>
            )}
            {activeMoreSection === 'glucose' && (
          <div className="space-y-4 tab-enter">
            <div className="ui-card p-4">
              <h2 className="text-xl font-bold text-white mb-1 flex items-center gap-2"><Droplet className="h-6 w-6 text-green-500" />Glucose & A1C</h2>
              <p className="text-gray-400 text-sm mb-4">Log blood sugar and A1C. Shown in &quot;This week&quot; on Summary.</p>
              <div className="mb-4">
                {!showGlucoseForm ? (
                  <button onClick={() => setShowGlucoseForm(true)} className="w-full py-3 rounded-xl border-2 border-dashed border-gray-500 text-gray-400 hover:text-white hover:border-emerald-500/50 text-sm font-medium flex items-center justify-center gap-2"><Plus className="h-4 w-4" />Log glucose</button>
                ) : (
                  <div className="rounded-xl p-4 bg-slate-700/50 space-y-3">
                    <div className="flex gap-2">
                      <input type="number" step="1" min="20" max="500" value={glucoseValue} onChange={(e) => setGlucoseValue(e.target.value)} className="flex-1 bg-slate-700 text-white rounded-lg px-4 py-3 text-lg" placeholder="mg/dL" />
                      <select value={glucoseType} onChange={(e) => setGlucoseType(e.target.value)} className="bg-slate-700 text-white rounded-lg px-3 py-3 text-sm">
                        <option value="fasting">Fasting</option>
                        <option value="post_meal">Post-meal</option>
                        <option value="random">Random</option>
                      </select>
                    </div>
                    <input type="date" value={glucoseDate} onChange={(e) => setGlucoseDate(e.target.value)} className="w-full bg-slate-700 text-white rounded-lg px-4 py-3" />
                    <div className="flex gap-2">
                      <button onClick={addGlucose} className="flex-1 bg-green-500 hover:bg-green-600 text-white py-3 rounded-lg font-medium">Add</button>
                      <button onClick={() => { setShowGlucoseForm(false); setGlucoseValue(''); }} className="px-4 py-3 text-gray-400 hover:text-white rounded-lg">Cancel</button>
                    </div>
                  </div>
                )}
              </div>
              {glucoseEntries.length > 0 && (
                <>
                  <h3 className="text-gray-300 font-medium mb-2">Glucose trend (last 14 days)</h3>
                  <div className="mb-4 h-44">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={(() => {
                        const now = new Date();
                        const points = [];
                        for (let i = 13; i >= 0; i--) {
                          const d = new Date(now);
                          d.setDate(d.getDate() - i);
                          const dateStr = formatDateLocal(d);
                          const dayEntries = glucoseEntries.filter(e => e.date === dateStr);
                          const avg = dayEntries.length ? (dayEntries.reduce((s, e) => s + parseFloat(e.value), 0) / dayEntries.length).toFixed(0) : null;
                          points.push({ date: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }), fullDate: dateStr, value: avg != null ? parseInt(avg, 10) : null });
                        }
                        return points;
                      })()}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                        <XAxis dataKey="date" stroke="#94a3b8" fontSize={10} />
                        <YAxis stroke="#94a3b8" fontSize={10} domain={[60, 180]} />
                        <Tooltip contentStyle={{ backgroundColor: 'rgba(30,41,59,0.95)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px' }} formatter={(v) => [v != null ? `${v} mg/dL` : '—', 'Glucose']} />
                        <Line type="monotone" dataKey="value" stroke="#10b981" strokeWidth={2} dot={{ fill: '#10b981', r: 4 }} connectNulls name="Glucose" />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="space-y-1 max-h-40 overflow-y-auto">
                    {sortByDateDesc(glucoseEntries).slice(0, 20).map(e => (
                      <div key={e.id} className="flex items-center justify-between py-2 border-b border-white/5">
                        <span className="text-gray-300">{parseLocalDate(e.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} · {e.type === 'fasting' ? 'Fasting' : e.type === 'post_meal' ? 'Post-meal' : 'Random'}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-white font-medium">{e.value} mg/dL</span>
                          <button onClick={() => deleteGlucose(e.id)} className="p-2 text-gray-400 hover:text-red-400 rounded-lg hover:bg-slate-600"><Trash2 className="h-4 w-4" /></button>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
              <div className="mt-6 pt-4 border-t border-white/10">
                <h3 className="text-gray-300 font-medium mb-2">A1C</h3>
                {!showA1cForm ? (
                  <button onClick={() => setShowA1cForm(true)} className="w-full py-3 rounded-xl border-2 border-dashed border-gray-500 text-gray-400 hover:text-white hover:border-cyan-500/50 text-sm font-medium flex items-center gap-2"><Plus className="h-4 w-4" />Log A1C</button>
                ) : (
                  <div className="rounded-xl p-4 bg-slate-700/50 space-y-3">
                    <input type="number" step="0.1" min="4" max="15" value={a1cValue} onChange={(e) => setA1cValue(e.target.value)} className="w-full bg-slate-700 text-white rounded-lg px-4 py-3 text-lg" placeholder="A1C %" />
                    <input type="date" value={a1cDate} onChange={(e) => setA1cDate(e.target.value)} className="w-full bg-slate-700 text-white rounded-lg px-4 py-3" />
                    <div className="flex gap-2">
                      <button onClick={addA1c} className="flex-1 bg-cyan-500 hover:bg-cyan-600 text-white py-3 rounded-lg font-medium">Add</button>
                      <button onClick={() => { setShowA1cForm(false); setA1cValue(''); }} className="px-4 py-3 text-gray-400 hover:text-white rounded-lg">Cancel</button>
                    </div>
                  </div>
                )}
                {a1cEntries.length > 0 && (
                  <div className="mt-3 space-y-1">
                    {sortByDateDesc(a1cEntries).map(e => (
                      <div key={e.id} className="flex items-center justify-between py-2 border-b border-white/5">
                        <span className="text-gray-300">{parseLocalDate(e.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-cyan-400 font-medium">{e.value}%</span>
                          <button onClick={() => deleteA1c(e.id)} className="p-2 text-gray-400 hover:text-red-400 rounded-lg hover:bg-slate-600"><Trash2 className="h-4 w-4" /></button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
            )}
            {activeMoreSection === 'labs' && (
          <div className="space-y-4 tab-enter">
            <div className="ui-card p-4">
              <h2 className="text-xl font-bold text-white mb-1 flex items-center gap-2"><Activity className="h-6 w-6 text-cyan-400" />Bloodwork & Labs</h2>
              <p className="text-gray-400 text-sm mb-4">Log any lab result (Testosterone, lipids, etc.) and see trends over time.</p>
              {!showLabForm ? (
                <button onClick={() => setShowLabForm(true)} className="w-full py-3 rounded-xl border-2 border-dashed border-gray-500 text-gray-400 hover:text-white hover:border-cyan-500/50 text-sm font-medium flex items-center justify-center gap-2"><Plus className="h-4 w-4" />Log lab result</button>
              ) : (
                <div className="rounded-xl p-4 bg-slate-700/50 space-y-3">
                  <div>
                    <label className="text-gray-400 text-xs block mb-1">Lab type</label>
                    <select value={labType} onChange={(e) => setLabType(e.target.value)} className="w-full bg-slate-700 text-white rounded-lg px-4 py-3">
                      {LAB_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>
                  <div className="flex gap-2">
                    <div className="flex-1">
                      <label className="text-gray-400 text-xs block mb-1">Value</label>
                      <input type="number" step="any" value={labValue} onChange={(e) => setLabValue(e.target.value)} className="w-full bg-slate-700 text-white rounded-lg px-4 py-3" placeholder="e.g. 45" />
                    </div>
                    <div className="w-24">
                      <label className="text-gray-400 text-xs block mb-1">Unit</label>
                      <input type="text" value={labUnit} onChange={(e) => setLabUnit(e.target.value)} className="w-full bg-slate-700 text-white rounded-lg px-3 py-3 text-sm" placeholder="ng/dL" />
                    </div>
                  </div>
                  <input type="date" value={labDate} onChange={(e) => setLabDate(e.target.value)} className="w-full bg-slate-700 text-white rounded-lg px-4 py-3" />
                  <div className="flex gap-2">
                    <button onClick={addLabEntry} className="flex-1 bg-cyan-500 hover:bg-cyan-600 text-white py-3 rounded-lg font-medium">Add</button>
                    <button onClick={() => { setShowLabForm(false); setLabValue(''); }} className="px-4 py-3 text-gray-400 hover:text-white rounded-lg">Cancel</button>
                  </div>
                </div>
              )}
              {labEntries.length > 0 && (
                <div className="mt-4 space-y-4">
                  {[...new Set(labEntries.map(e => e.type))].sort().map(type => {
                    const byType = labEntries.filter(e => e.type === type).sort((a, b) => b.date.localeCompare(a.date));
                    const last = byType[0];
                    const prev = byType[1];
                    const trend = prev != null && last.value != null && prev.value != null ? (last.value > prev.value ? '↑' : last.value < prev.value ? '↓' : '→') : null;
                    return (
                      <div key={type} className="rounded-lg bg-slate-700/40 p-3">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-white font-medium">{type}</span>
                          {trend && <span className={`text-xs font-medium ${trend === '↑' ? 'text-green-400' : trend === '↓' ? 'text-red-400' : 'text-gray-400'}`}>{trend} from {prev.value} {last.unit}</span>}
                        </div>
                        <div className="space-y-1.5">
                          {byType.slice(0, 10).map(e => (
                            <div key={e.id} className="flex justify-between items-center text-sm">
                              <span className="text-gray-300">{e.value} {e.unit}</span>
                              <span className="text-gray-500 text-xs">{parseLocalDate(e.date).toLocaleDateString('en-US')}</span>
                              <button onClick={() => deleteLabEntry(e.id)} className="p-1 text-gray-400 hover:text-red-400 rounded"><Trash2 className="h-3.5 w-3.5" /></button>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
            )}
            {activeMoreSection === 'calendar' && (
          <div className="space-y-4">
            <div className="ui-card p-4">
              <div className="flex justify-between items-center mb-4">
                <button onClick={() => { const newMonth = new Date(calendarMonth); newMonth.setMonth(newMonth.getMonth() - 1); setCalendarMonth(newMonth); }}
                  className="p-2 text-white hover:bg-slate-700 rounded-lg">←</button>
                <h3 className="text-white font-medium">{calendarMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</h3>
                <button onClick={() => { const newMonth = new Date(calendarMonth); newMonth.setMonth(newMonth.getMonth() + 1); setCalendarMonth(newMonth); }}
                  className="p-2 text-white hover:bg-slate-700 rounded-lg">→</button>
              </div>
              
              <div className="grid grid-cols-7 gap-1 mb-2">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                  <div key={day} className="text-center text-gray-400 text-xs font-medium py-2">{day}</div>
                ))}
              </div>
              
              <div className="grid grid-cols-7 gap-1">
                {getCalendarDays().map((day, idx) => (
                  <button type="button" onClick={() => setSelectedCalendarDay(day.dateStr)} key={idx} className={`min-h-16 p-1 rounded-xl border text-left transition-all ${selectedCalendarDay === day.dateStr ? 'border-accent bg-accent/15 shadow-[0_0_20px_-12px_rgba(45,212,191,.8)]' : day.isToday ? 'border-accent/50 bg-accent/10' : day.isCurrentMonth ? 'border-slate-700 bg-slate-700/30' : 'border-slate-800 bg-[var(--bg-card)]/20'}`}>
                    <div className={`text-xs ${day.isCurrentMonth ? 'text-white' : 'text-slate-600'}`}>{day.date.getDate()}</div>
                    {day.scheduled.length > 0 && (
                      <div className="mt-1 space-y-0.5">
                        {day.scheduled.slice(0, 2).map((item, i) => (
                          <div key={i} className={`text-[9px] px-1 py-0.5 rounded truncate ${item.status === 'missed' ? 'bg-red-500/15 text-red-300' : item.status === 'paused' ? 'bg-slate-600/40 text-gray-500' : item.status === 'taken' ? 'bg-emerald-500/15 text-emerald-300' : 'bg-gold-400/15 text-gold-300'}`} title={`${item.medication}: ${item.status}`}>
                            {item.status === 'taken' ? '✓ ' : item.status === 'missed' ? '! ' : item.status === 'paused' ? 'Ⅱ ' : '• '}{item.medication.split(' ')[0]}
                          </div>
                        ))}
                        {day.scheduled.length > 2 && <div className="text-[9px] text-gray-400 px-1">+{day.scheduled.length - 2}</div>}
                      </div>
                    )}
                  </button>
                ))}
              </div>
              {(() => {
                const selected = getCalendarDays().find((day) => day.dateStr === selectedCalendarDay);
                if (!selected) return null;
                const weights = weightEntries.filter((entry) => toCalendarDay(entry.date) === selected.dateStr);
                return <div className="mt-4 rounded-2xl border border-white/[0.06] bg-black/15 p-3"><div className="flex items-center justify-between"><div><div className="text-sm font-semibold text-white">{selected.date.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}</div><div className="mt-0.5 text-[11px] text-gray-500">{selected.scheduled.length} scheduled · {weights.length ? `${Number(weights[weights.length - 1].weight).toFixed(1)} lb` : 'No weight logged'}</div></div>{selected.isToday && <span className="rounded-full bg-accent/10 px-2 py-1 text-[10px] font-semibold text-gold-300">Today</span>}</div>{selected.scheduled.length > 0 ? <div className="mt-3 space-y-1.5">{selected.scheduled.map((item, index) => <div key={`${item.medication}-${index}`} className="flex items-center justify-between rounded-xl bg-white/[0.03] px-3 py-2"><span className="truncate text-xs text-gray-300">{item.medication}</span><span className={`text-[10px] font-semibold ${item.status === 'taken' ? 'text-emerald-300' : item.status === 'missed' ? 'text-rose-300' : item.status === 'paused' ? 'text-gray-500' : 'text-gold-300'}`}>{item.status}</span></div>)}</div> : <p className="mt-3 text-xs text-gray-500">No protocol doses scheduled.</p>}</div>;
              })()}
              <div className="mt-3 flex flex-wrap gap-3 border-t border-white/[0.06] pt-3 text-[10px] text-gray-400"><span className="text-emerald-300">✓ Taken</span><span className="text-gold-300">• Scheduled</span><span className="text-red-300">! Missed</span><span>Ⅱ Paused</span></div>
            </div>

            <div className="ui-card p-4">
              <h3 className="text-white font-medium mb-3">Adherence Summary</h3>
              <div className="grid grid-cols-2 gap-3">
                {schedules.map(schedule => {
                  const expectedItems = getCalendarDays().filter((day) => day.isCurrentMonth).flatMap((day) => day.scheduled).filter((item) => item.medication === schedule.medication && item.status !== 'paused');
                  const expectedInjections = expectedItems.length;
                  const takenInjections = expectedItems.filter((item) => item.status === 'taken').length;
                  const adherence = expectedInjections > 0 ? Math.min(100, Math.round((takenInjections / expectedInjections) * 100)) : 0;
                  return (
                    <div key={schedule.id} className="bg-slate-700/50 rounded-lg p-3">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: getMedicationColor(schedule.medication) }}></div>
                        <span className="text-white text-sm font-medium">{schedule.medication}</span>
                      </div>
                      <div className="text-2xl font-bold text-white">{adherence}%</div>
                      <div className="text-xs text-gray-400">{takenInjections} of {expectedInjections} scheduled this month</div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
            )}
          </div>
        )}
      </div>
      {protocolEditorMed && protocolDraft && (
        <div className="fixed inset-0 z-[180] bg-slate-950/90 backdrop-blur-md" role="dialog" aria-modal="true" aria-label="Protocol editor">
          <div className="mx-auto flex h-full max-w-2xl flex-col bg-[var(--bg-primary)] shadow-2xl">
            <div className="sticky top-0 z-10 flex items-center justify-between gap-3 border-b border-white/[0.07] bg-slate-950/95 px-4 py-3 backdrop-blur-xl">
              <div>
                <div className="text-[10px] font-medium uppercase tracking-[0.18em] text-gold-400/75">Protocol</div>
                <h2 className="text-lg font-semibold text-white">{schedules.some((schedule) => schedule.medication === protocolDraft.medication) ? 'Edit protocol' : 'New protocol'}</h2>
              </div>
              <button type="button" onClick={() => { setProtocolEditorMed(null); setProtocolDraft(null); }} className="rounded-xl border border-white/[0.07] p-2 text-gray-400 hover:bg-white/[0.05] hover:text-white" aria-label="Close protocol editor">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-4 py-4 pb-32">
              <div className="space-y-4">
                <section className="ui-card p-4">
                  <label className="block text-xs font-medium text-gray-400">Compound</label>
                  <select value={protocolDraft.medication} onChange={(event) => changeProtocolMedication(event.target.value)} className="mt-1.5 w-full rounded-xl border border-white/[0.07] bg-slate-800 px-3 py-3 text-white">
                    {MEDICATIONS.map((medication) => <option key={medication.name} value={medication.name}>{medication.name}</option>)}
                  </select>

                  <div className="mt-4 grid grid-cols-[1fr_7rem] gap-3">
                    <label className="block">
                      <span className="text-xs font-medium text-gray-400">Dose</span>
                      <input type="number" min="0" step="any" inputMode="decimal" value={protocolDraft.dose} onChange={(event) => setProtocolDraft((draft) => ({ ...draft, dose: event.target.value }))} className="mt-1.5 w-full rounded-xl border border-white/[0.07] bg-slate-800 px-3 py-3 text-white" placeholder="0" />
                    </label>
                    <label className="block">
                      <span className="text-xs font-medium text-gray-400">Unit</span>
                      <select value={protocolDraft.unit} onChange={(event) => setProtocolDraft((draft) => ({ ...draft, unit: event.target.value }))} className="mt-1.5 w-full rounded-xl border border-white/[0.07] bg-slate-800 px-3 py-3 text-white">
                        {['mg', 'mcg', 'IU', 'units', 'mL'].map((unit) => <option key={unit} value={unit}>{unit}</option>)}
                      </select>
                    </label>
                  </div>

                  {(() => {
                    const totalMg = Number(protocolDraft.concentrationTotalMg);
                    const bacWaterMl = Number(protocolDraft.concentrationBacWaterMl);
                    const directConcentration = Number(protocolDraft.concentrationMgPerMl);
                    const concentration = directConcentration > 0 ? directConcentration : totalMg > 0 && bacWaterMl > 0 ? totalMg / bacWaterMl : 0;
                    const dose = Number(protocolDraft.dose);
                    const unit = String(protocolDraft.unit || '').toLowerCase();
                    const pair = dose > 0 && concentration > 0
                      ? unit === 'units' ? { mg: (dose / 100) * concentration, units: dose }
                        : unit === 'mg' ? { mg: dose, units: (dose / concentration) * 100 }
                          : unit === 'mcg' ? { mg: dose / 1000, units: ((dose / 1000) / concentration) * 100 }
                            : unit === 'ml' ? { mg: dose * concentration, units: dose * 100 }
                              : null
                      : null;
                    return (
                      <div className="mt-4 rounded-xl border border-accent/20 bg-accent/[0.045] p-3">
                        <div className="flex items-start justify-between gap-3"><div><h3 className="text-sm font-semibold text-white">Dose concentration</h3><p className="mt-0.5 text-[11px] text-gray-400">Saved for this compound’s U-100 syringe math. No inventory vial is required.</p></div><span className="rounded-full border border-accent/20 px-2 py-1 text-[10px] font-semibold text-accent">Optional</span></div>
                        <div className="mt-3 grid grid-cols-2 gap-3">
                          <label className="block"><span className="text-xs font-medium text-gray-400">Vial strength (mg)</span><input type="number" min="0" step="any" inputMode="decimal" value={protocolDraft.concentrationTotalMg} onChange={(event) => setProtocolDraft((draft) => ({ ...draft, concentrationTotalMg: event.target.value }))} className="mt-1.5 w-full rounded-xl border border-white/[0.07] bg-slate-800 px-3 py-2.5 text-white" placeholder="5" /></label>
                          <label className="block"><span className="text-xs font-medium text-gray-400">BAC water (mL)</span><input type="number" min="0" step="any" inputMode="decimal" value={protocolDraft.concentrationBacWaterMl} onChange={(event) => setProtocolDraft((draft) => ({ ...draft, concentrationBacWaterMl: event.target.value }))} className="mt-1.5 w-full rounded-xl border border-white/[0.07] bg-slate-800 px-3 py-2.5 text-white" placeholder="2" /></label>
                        </div>
                        <label className="mt-3 block"><span className="text-xs font-medium text-gray-400">Or known concentration (mg/mL)</span><input type="number" min="0" step="any" inputMode="decimal" value={protocolDraft.concentrationMgPerMl} onChange={(event) => setProtocolDraft((draft) => ({ ...draft, concentrationMgPerMl: event.target.value }))} className="mt-1.5 w-full rounded-xl border border-white/[0.07] bg-slate-800 px-3 py-2.5 text-white" placeholder="2.5" /></label>
                        {concentration > 0 ? <div className="mt-3 rounded-lg bg-black/15 px-3 py-2 text-xs text-gray-300"><span className="font-semibold text-accent">{formatSyringeDoseNumber(concentration)} mg/mL</span>{pair && <span className="ml-2">· Today will show <span className="font-semibold text-white">{formatSyringeDoseNumber(pair.mg)} mg · {formatSyringeDoseNumber(pair.units)} units</span></span>}</div> : <p className="mt-3 text-[11px] text-gray-500">Enter a concentration to display the paired dose on Today. PepTalk will not guess one.</p>}
                      </div>
                    );
                  })()}

                  <label className="mt-4 block">
                    <span className="text-xs font-medium text-gray-400">Route</span>
                    <select value={protocolDraft.route} onChange={(event) => setProtocolDraft((draft) => ({ ...draft, route: event.target.value }))} className="mt-1.5 w-full rounded-xl border border-white/[0.07] bg-slate-800 px-3 py-3 text-white">
                      {['SubQ', 'IM', 'Oral', 'Nasal', 'Other'].map((route) => <option key={route} value={route}>{route}</option>)}
                    </select>
                  </label>
                </section>

                <section className="ui-card p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div><h3 className="text-sm font-semibold text-white">Dose schedule</h3><p className="mt-0.5 text-[11px] text-gray-500">Controls what appears on Today.</p></div>
                    <label className="flex items-center gap-2 text-xs text-gray-400">
                      <input type="checkbox" checked={protocolDraft.paused} onChange={(event) => setProtocolDraft((draft) => ({ ...draft, paused: event.target.checked }))} className="h-4 w-4 rounded border-white/20 bg-slate-800 accent-amber-500" />
                      Paused
                    </label>
                  </div>

                  <div className="mt-4 grid grid-cols-2 gap-2 rounded-xl bg-slate-900/60 p-1">
                    <button type="button" onClick={() => setProtocolDraft((draft) => ({ ...draft, scheduleType: 'recurring' }))} className={`rounded-lg px-3 py-2 text-xs font-medium ${protocolDraft.scheduleType === 'recurring' ? 'bg-gold-500 text-slate-950' : 'text-gray-400'}`}>Every X days</button>
                    <button type="button" onClick={() => setProtocolDraft((draft) => ({ ...draft, scheduleType: 'specific_days' }))} className={`rounded-lg px-3 py-2 text-xs font-medium ${protocolDraft.scheduleType === 'specific_days' ? 'bg-gold-500 text-slate-950' : 'text-gray-400'}`}>Specific days</button>
                  </div>

                  {protocolDraft.scheduleType === 'recurring' ? (
                    <label className="mt-4 block">
                      <span className="text-xs font-medium text-gray-400">Repeat every</span>
                      <div className="mt-1.5 flex items-center gap-2">
                        <input type="number" min="1" step="1" inputMode="numeric" value={protocolDraft.frequencyDays} onChange={(event) => setProtocolDraft((draft) => ({ ...draft, frequencyDays: event.target.value }))} className="w-24 rounded-xl border border-white/[0.07] bg-slate-800 px-3 py-3 text-white" />
                        <span className="text-sm text-gray-400">day{Number(protocolDraft.frequencyDays) === 1 ? '' : 's'}</span>
                      </div>
                    </label>
                  ) : (
                    <div className="mt-4">
                      <div className="text-xs font-medium text-gray-400">Dose on</div>
                      <div className="mt-2 grid grid-cols-7 gap-1.5">
                        {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, index) => {
                          const selected = protocolDraft.specificDays.includes(index);
                          return <button key={`${day}-${index}`} type="button" onClick={() => setProtocolDraft((draft) => ({ ...draft, specificDays: selected ? draft.specificDays.filter((value) => value !== index) : [...draft.specificDays, index].sort() }))} className={`aspect-square rounded-xl text-xs font-semibold ${selected ? 'bg-gold-500 text-slate-950' : 'border border-white/[0.07] bg-slate-800 text-gray-500'}`}>{day}</button>;
                        })}
                      </div>
                    </div>
                  )}

                  <div className="mt-4 grid grid-cols-2 gap-3">
                    <label className="block"><span className="text-xs font-medium text-gray-400">Medication time</span><input type="time" value={protocolDraft.preferredTime} onChange={(event) => setProtocolDraft((draft) => ({ ...draft, preferredTime: event.target.value }))} className="mt-1.5 w-full rounded-xl border border-white/[0.07] bg-slate-800 px-3 py-3 text-white" /></label>
                    <label className="block"><span className="text-xs font-medium text-gray-400">Start date</span><input type="date" value={protocolDraft.startDate} onChange={(event) => setProtocolDraft((draft) => ({ ...draft, startDate: event.target.value }))} className="mt-1.5 w-full rounded-xl border border-white/[0.07] bg-slate-800 px-3 py-3 text-white" /></label>
                  </div>
                  <div className="mt-4 rounded-xl border border-white/[0.06] bg-slate-900/40 p-3">
                    <div className="flex items-center justify-between gap-3">
                      <div><div className="text-sm font-medium text-white">Protocol alert</div><div className="mt-0.5 text-[11px] text-gray-500">Uses this protocol’s selected dose days only.</div></div>
                      <button type="button" onClick={() => setProtocolDraft((draft) => ({ ...draft, reminderEnabled: draft.reminderEnabled === false }))} className={`relative h-6 w-12 shrink-0 rounded-full transition-colors ${protocolDraft.reminderEnabled !== false ? 'bg-accent' : 'bg-slate-600'}`} aria-label="Toggle protocol reminder"><span className={`absolute top-1 h-4 w-4 rounded-full bg-white transition-all ${protocolDraft.reminderEnabled !== false ? 'right-1' : 'left-1'}`} /></button>
                    </div>
                    {protocolDraft.reminderEnabled !== false && (
                      <label className="mt-3 block">
                        <span className="text-xs font-medium text-gray-400">Alert me</span>
                        <select value={String(protocolDraft.reminderMinutesBefore || 0)} onChange={(event) => setProtocolDraft((draft) => ({ ...draft, reminderMinutesBefore: Number(event.target.value) }))} className="mt-1.5 w-full rounded-xl border border-white/[0.07] bg-slate-800 px-3 py-3 text-white">
                          <option value="0">At medication time</option>
                          <option value="5">5 minutes before</option>
                          <option value="10">10 minutes before</option>
                          <option value="15">15 minutes before</option>
                          <option value="30">30 minutes before</option>
                          <option value="60">1 hour before</option>
                        </select>
                        <span className="mt-2 block text-[11px] text-gray-500">Alert: {Math.max(0, Number(protocolDraft.reminderMinutesBefore) || 0) ? `${Math.max(0, Number(protocolDraft.reminderMinutesBefore) || 0)} minutes before ${formatDoseTime(protocolDraft.preferredTime)}` : formatDoseTime(protocolDraft.preferredTime)} · scheduled dose days only</span>
                      </label>
                    )}
                  </div>
                </section>

                <section className="ui-card p-4">
                  <h3 className="text-sm font-semibold text-white">Cycle</h3>
                  <p className="mt-0.5 text-[11px] text-gray-500">Optional. Leave blank for a continuous protocol.</p>
                  <div className="mt-3 grid grid-cols-2 gap-3">
                    <label className="block"><span className="text-xs font-medium text-gray-400">Weeks on</span><input type="number" min="1" step="1" value={protocolDraft.cycleOnWeeks} onChange={(event) => setProtocolDraft((draft) => ({ ...draft, cycleOnWeeks: event.target.value }))} className="mt-1.5 w-full rounded-xl border border-white/[0.07] bg-slate-800 px-3 py-3 text-white" placeholder="Continuous" /></label>
                    <label className="block"><span className="text-xs font-medium text-gray-400">Weeks off</span><input type="number" min="0" step="1" value={protocolDraft.cycleOffWeeks} onChange={(event) => setProtocolDraft((draft) => ({ ...draft, cycleOffWeeks: event.target.value }))} className="mt-1.5 w-full rounded-xl border border-white/[0.07] bg-slate-800 px-3 py-3 text-white" placeholder="0" /></label>
                  </div>
                </section>

                {renderBlendSetup(MEDICATIONS.find((medication) => medication.name === protocolDraft.medication), protocolDraft.medication, injectionEntries.filter((entry) => entry.type === protocolDraft.medication).sort((a, b) => getEntryDateTime(b) - getEntryDateTime(a))[0])}

                <section className="ui-card p-4">
                  <label className="block"><span className="text-xs font-medium text-gray-400">Protocol notes</span><textarea rows="3" value={protocolDraft.notes} onChange={(event) => setProtocolDraft((draft) => ({ ...draft, notes: event.target.value }))} className="mt-1.5 w-full resize-none rounded-xl border border-white/[0.07] bg-slate-800 px-3 py-3 text-white" placeholder="Prescriber instructions, timing notes, or cycle details" /></label>
                  <button type="button" onClick={() => { setTitrationMed(protocolDraft.medication); setProtocolEditorMed(null); setProtocolDraft(null); setActiveTab('more'); setActiveMoreSection('tools'); setActiveToolSection('titration'); }} className="mt-3 text-xs font-medium text-gray-400 hover:text-gold-400">Open separate titration plan →</button>
                </section>
              </div>
            </div>

            <div className="absolute inset-x-0 bottom-0 mx-auto max-w-2xl border-t border-white/[0.08] bg-slate-950/95 p-4 backdrop-blur-xl">
              <button type="button" onClick={saveProtocol} className="ui-btn-primary flex min-h-12 w-full items-center justify-center gap-2 text-sm font-semibold"><CheckCircle className="h-4 w-4" /> Save protocol</button>
            </div>
          </div>
        </div>
      )}

      <nav className="peptalk-bottom-nav" aria-label="Main navigation">
        <div className="bottom-nav-shell max-w-2xl mx-auto grid grid-cols-5 gap-1">
          {MAIN_TABS.map((tab) => (
            <button
              type="button"
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id);
                if (tab.id === 'protocols') {
                  setActiveMoreSection('tools');
                  setActiveToolSection('schedule');
                }
                setShowAddForm(false);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className={`ui-tab ${activeTab === tab.id || (tab.id === 'more' && activeTab === 'injections') ? 'ui-tab-active' : ''}`}
            >
              <tab.icon className="h-5 w-5 shrink-0" />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </nav>
      {toastUndo && (
        <div className="fixed bottom-20 left-3 right-3 z-[100] max-w-lg mx-auto flex items-center gap-2 rounded-xl border border-accent/40 bg-slate-900/95 backdrop-blur-md px-3 py-3 shadow-lg shadow-black/40">
          <span className="flex-1 text-sm text-gray-200">{toastUndo.message}</span>
          <button
            type="button"
            className="shrink-0 ui-btn-primary px-3 py-1.5 text-sm"
            onClick={() => {
              toastUndo.onUndo?.();
              setToastUndo(null);
              if (undoTimerRef.current) clearTimeout(undoTimerRef.current);
            }}
          >
            Undo
          </button>
          <button
            type="button"
            className="text-gray-400 p-1 rounded-lg hover:bg-white/10"
            onClick={() => {
              setToastUndo(null);
              if (undoTimerRef.current) clearTimeout(undoTimerRef.current);
            }}
            aria-label="Dismiss"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}
      <footer className="py-3 text-center text-gray-500 text-xs border-t border-white/[0.04]">
        PepTalk v{APP_VERSION}
      </footer>
    </div>
  );
};

export default PepTalk;
