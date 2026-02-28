import React, { useState, useEffect, useRef } from 'react';
import { Capacitor } from '@capacitor/core';
import { ComposedChart, LineChart, Line, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, ReferenceArea, ReferenceLine } from 'recharts';
import { Scale, Syringe, Plus, TrendingDown, TrendingUp, Calendar, Trash2, Edit2, X, Activity, Calculator, LayoutDashboard, Wrench, ChevronDown, Bell, Ruler, Camera, Target, Clock, CheckCircle, AlertCircle, BookOpen, Smile, Meh, Frown, Zap, CalendarDays, Droplets, Beef, FileDown, MoreHorizontal, Trophy, UtensilsCrossed, Droplet, User } from 'lucide-react';
import { MEDICATION_EFFECT_PROFILES, MEDICATION_PHASE_TIMELINES } from './medicationInsights';

const APP_VERSION = '1.0.8';

// Comprehensive peptide/medication list with pharmacokinetic data
const MEDICATIONS = [
  { name: 'Semaglutide', category: 'GLP-1', color: '#10b981', defaultSchedule: 7, halfLife: 168, peakHours: 48, effectDuration: 168 },
  { name: 'Rybelsus (Oral Semaglutide)', category: 'GLP-1', color: '#10b981', defaultSchedule: 1, halfLife: 168, peakHours: 4, effectDuration: 24 },
  { name: 'Tirzepatide', category: 'GLP-1/GIP', color: '#14b8a6', defaultSchedule: 7, halfLife: 120, peakHours: 48, effectDuration: 168 },
  { name: 'Liraglutide', category: 'GLP-1', color: '#059669', defaultSchedule: 1, halfLife: 13, peakHours: 12, effectDuration: 24 },
  { name: 'Dulaglutide', category: 'GLP-1', color: '#0d9488', defaultSchedule: 7, halfLife: 120, peakHours: 48, effectDuration: 168 },
  { name: 'Retatrutide', category: 'Triple Agonist', color: '#8b5cf6', defaultSchedule: 7, halfLife: 168, peakHours: 48, effectDuration: 168 },
  { name: 'Testosterone Cypionate', category: 'Hormone', color: '#3b82f6', defaultSchedule: 7, halfLife: 192, peakHours: 48, effectDuration: 168, preConstituted: true },
  { name: 'Testosterone Enanthate', category: 'Hormone', color: '#2563eb', defaultSchedule: 7, halfLife: 108, peakHours: 48, effectDuration: 168, preConstituted: true },
  { name: 'HCG', category: 'Hormone', color: '#6366f1', defaultSchedule: 3, halfLife: 33, peakHours: 12, effectDuration: 72 },
  { name: 'BPC-157', category: 'Peptide', color: '#e8b84c', defaultSchedule: 1, halfLife: 4, peakHours: 2, effectDuration: 24 },
  { name: 'TB-500', category: 'Peptide', color: '#d97706', defaultSchedule: 3, halfLife: 240, peakHours: 24, effectDuration: 168 },
  { name: 'Ipamorelin', category: 'Peptide', color: '#fbbf24', defaultSchedule: 1, halfLife: 2, peakHours: 1, effectDuration: 4 },
  { name: 'CJC-1295', category: 'Peptide', color: '#f97316', defaultSchedule: 1, halfLife: 168, peakHours: 12, effectDuration: 168 },
  { name: 'Tesamorelin', category: 'Peptide', color: '#ea580c', defaultSchedule: 1, halfLife: 0.5, peakHours: 0.25, effectDuration: 3 },
  { name: 'Sermorelin', category: 'Peptide', color: '#fb923c', defaultSchedule: 1, halfLife: 0.2, peakHours: 0.1, effectDuration: 1 },
  { name: 'MK-677', category: 'Peptide', color: '#c2410c', defaultSchedule: 1, halfLife: 24, peakHours: 2, effectDuration: 24 },
  { name: 'AOD-9604', category: 'Peptide', color: '#ec4899', defaultSchedule: 1, halfLife: 0.5, peakHours: 0.5, effectDuration: 3 },
  { name: 'Melanotan II', category: 'Peptide', color: '#db2777', defaultSchedule: 7, halfLife: 33, peakHours: 12, effectDuration: 168 },
  { name: 'PT-141', category: 'Peptide', color: '#be185d', defaultSchedule: 0, halfLife: 3, peakHours: 1, effectDuration: 8 },
  { name: 'Enclomiphene (Enclo)', category: 'SERM', color: '#7c3aed', defaultSchedule: 1, halfLife: 120, peakHours: 24, effectDuration: 24 },
  { name: 'Kisspeptin', category: 'Peptide', color: '#a855f7', defaultSchedule: 3, halfLife: 4, peakHours: 2, effectDuration: 24 },
  { name: 'Gonadorelin', category: 'Peptide', color: '#9333ea', defaultSchedule: 2, halfLife: 0.3, peakHours: 0.5, effectDuration: 4 },
  { name: 'Fragment 176-191', category: 'Peptide', color: '#06b6d4', defaultSchedule: 1, halfLife: 2, peakHours: 1, effectDuration: 12 },
  { name: 'GHK-Cu', category: 'Peptide', color: '#0ea5e9', defaultSchedule: 1, halfLife: 2, peakHours: 2, effectDuration: 24 },
  { name: 'Semax', category: 'Peptide', color: '#6366f1', defaultSchedule: 1, halfLife: 0.5, peakHours: 0.5, effectDuration: 4 },
  { name: 'Epithalon', category: 'Peptide', color: '#64748b', defaultSchedule: 7, halfLife: 1, peakHours: 1, effectDuration: 24 },
  { name: 'BPC-157 (Oral)', category: 'Peptide', color: '#eab308', defaultSchedule: 1, halfLife: 4, peakHours: 2, effectDuration: 24 },
  { name: 'Anamorelin', category: 'Peptide', color: '#ca8a04', defaultSchedule: 1, halfLife: 2, peakHours: 1, effectDuration: 8 },
  { name: 'Other', category: 'Other', color: '#6b7280', defaultSchedule: 7, halfLife: 168, peakHours: 24, effectDuration: 168 }
];

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

// Helper function to parse dates in local timezone (fixes off-by-one day bug)
const parseLocalDate = (dateString) => {
  const [year, month, day] = dateString.split('-').map(Number);
  return new Date(year, month - 1, day);
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
// Normalize any date string to YYYY-MM-DD for calendar-day comparison (handles ISO with time)
const toCalendarDay = (dateString) => {
  if (!dateString) return '';
  const s = String(dateString).trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s;
  if (/^\d{4}-\d{2}-\d{2}/.test(s)) return s.slice(0, 10);
  const d = parseLocalDate(s);
  return isNaN(d.getTime()) ? '' : formatDateLocal(d);
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

const PepTalk = () => {
  const [activeTab, setActiveTab] = useState('summary');
  const [weightEntries, setWeightEntries] = useState([]);
  const [injectionEntries, setInjectionEntries] = useState([]);
  const [measurementEntries, setMeasurementEntries] = useState([]);
  const [progressPhotos, setProgressPhotos] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [titrationPlans, setTitrationPlans] = useState([]);
  const [journalEntries, setJournalEntries] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showSplash, setShowSplash] = useState(true);
  const [showCelebration, setShowCelebration] = useState(false);
  const [celebrationMessage, setCelebrationMessage] = useState('');
  const [userProfile, setUserProfile] = useState({ height: 70, goalWeight: 200, hydrationGoalOz: 64 });
  const [timeRange, setTimeRange] = useState('all');
  const [activeToolSection, setActiveToolSection] = useState('calculator');
  const [showCalculatorUnitRef, setShowCalculatorUnitRef] = useState(false);
  const [exportFormat, setExportFormat] = useState('json'); // 'json' | 'csv'
  const [showWipeConfirm, setShowWipeConfirm] = useState(false);
  const [wipeConfirmChecked, setWipeConfirmChecked] = useState(false);
  const [showWelcomeModal, setShowWelcomeModal] = useState(false);
  const [welcomeDontShowAgain, setWelcomeDontShowAgain] = useState(false);
  const [selectedVialId, setSelectedVialId] = useState(null);
  const [vials, setVials] = useState([]);
  const [vialMedication, setVialMedication] = useState('Semaglutide');
  const [vialTotalMg, setVialTotalMg] = useState('');
  const [vialUnit, setVialUnit] = useState('mg');
  const [vialBacWaterMl, setVialBacWaterMl] = useState(''); // ml of bac water used for reconstitution
  const [vialConcentrationForMl, setVialConcentrationForMl] = useState(''); // mg/ml when vial size is entered in ml
  const [vialExpiry, setVialExpiry] = useState('');
  const [vialReconstituted, setVialReconstituted] = useState(false);
  const [vialReconstitutedDate, setVialReconstitutedDate] = useState('');

  
  // Graph visibility state
  const [visibleLines, setVisibleLines] = useState({ weight: true, trend: true });
  const [chartRangeWeeks, setChartRangeWeeks] = useState(0); // 0 = all, 4, 8, 12
  const [insightsExpandedMed, setInsightsExpandedMed] = useState(null); // medication name or null
  const [insightsShowLevelsHelp, setInsightsShowLevelsHelp] = useState(false);
  
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
    weightReminders: false,
    weightReminderTime: '07:00'
  });
  const [dismissedAlerts, setDismissedAlerts] = useState([]); // Track dismissed alert IDs
  
  // Injection form states
  const [injectionType, setInjectionType] = useState('Semaglutide');
  const [injectionDose, setInjectionDose] = useState('');
  const [injectionUnit, setInjectionUnit] = useState('mg');
  const [injectionDate, setInjectionDate] = useState(getTodayLocal());
  const [injectionRoute, setInjectionRoute] = useState('SubQ');
  const [injectionSite, setInjectionSite] = useState('Stomach');
  const [injectionNotes, setInjectionNotes] = useState('');
  const [selectedSideEffects, setSelectedSideEffects] = useState([]);
  const [editingInjection, setEditingInjection] = useState(null);
  const [showMedDropdown, setShowMedDropdown] = useState(false);
  const [medSearchTerm, setMedSearchTerm] = useState('');

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

  // Calendar state
  const [calendarMonth, setCalendarMonth] = useState(new Date());

  const photoInputRef = useRef(null);
  const moreSectionRefs = useRef({});

  useEffect(() => { loadData(); }, []);

  // Show welcome/update modal when app version changes (unless user chose "Do not show again")
  useEffect(() => {
    if (isLoading) return;
    try {
      const hideForever = localStorage.getItem('peptalk-welcome-hide-forever') === 'true';
      const lastSeenVersion = localStorage.getItem('peptalk-welcome-version');
      if (!hideForever && lastSeenVersion !== APP_VERSION) setShowWelcomeModal(true);
    } catch (_) {}
  }, [isLoading]);
  
  // Hide splash screen after data loads
  useEffect(() => {
    if (!isLoading) {
      setTimeout(() => setShowSplash(false), 1500);
    }
  }, [isLoading]);

  // Reschedule local (push) notifications when app loads and any reminder is on
  useEffect(() => {
    if (!isLoading && notificationPermission === 'granted' && (notificationSettings.injectionReminders || notificationSettings.weightReminders)) {
      scheduleLocalInjectionReminders();
    }
  }, [isLoading, notificationPermission, notificationSettings.injectionReminders, notificationSettings.reminderTime, notificationSettings.weightReminders, notificationSettings.weightReminderTime]);

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
      const dailyTrackData = localStorage.getItem('health-daily-track');
      const glucoseData = localStorage.getItem('health-glucose-entries');
      const a1cData = localStorage.getItem('health-a1c-entries');
      
      if (weightData) {
        const parsed = JSON.parse(weightData);
        setWeightEntries(sortWeightByDateAsc(parsed));
      }
      if (injectionData) setInjectionEntries(JSON.parse(injectionData));
      if (profileData) {
        const parsed = JSON.parse(profileData);
        setUserProfile({ height: 70, goalWeight: 200, ...parsed, hydrationGoalOz: parsed.hydrationGoalOz ?? 64 });
      }
      if (measurementData) setMeasurementEntries(JSON.parse(measurementData));
      if (photoData) setProgressPhotos(JSON.parse(photoData));
      if (scheduleData) setSchedules(JSON.parse(scheduleData));
      if (titrationData) setTitrationPlans(JSON.parse(titrationData));
      if (journalData) setJournalEntries(JSON.parse(journalData));
      if (fastingData) setFastingEntries(JSON.parse(fastingData));
      if (notificationSettingsData) setNotificationSettings(JSON.parse(notificationSettingsData));
      if (dailyTrackData) setDailyTrackEntries(JSON.parse(dailyTrackData));
      if (glucoseData) setGlucoseEntries(JSON.parse(glucoseData));
      if (a1cData) setA1cEntries(JSON.parse(a1cData));
      const vialsData = localStorage.getItem('health-vials');
      if (vialsData) {
        const parsed = JSON.parse(vialsData);
        setVials(parsed.map(v => ({ ...v, remainingMg: v.remainingMg ?? v.totalMg })));
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
    try { localStorage.setItem(key, JSON.stringify(data)); } catch (error) { console.error('Error saving:', error); }
  };

  // Form reset functions
  const resetWeightForm = () => { setWeight(''); setWeightDate(getTodayLocal()); setEditingWeight(null); setShowAddForm(false); };
  const resetInjectionForm = () => { setInjectionType('Semaglutide'); setInjectionDose(''); setInjectionUnit('mg'); setInjectionDate(getTodayLocal()); setInjectionRoute('SubQ'); setInjectionSite('Stomach'); setInjectionNotes(''); setSelectedSideEffects([]); setEditingInjection(null); setShowAddForm(false); setShowMedDropdown(false); setMedSearchTerm(''); setSelectedVialId(null); };
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
    
    // Check for milestones and celebrate! Use date/time order, not array position.
    if (!editingWeight && weightEntries.length > 0) {
      const byDateDesc = sortWeightByDateDesc(weightEntries);
      const byDateAsc = sortWeightByDateAsc(weightEntries);
      const oldWeight = byDateDesc[0].weight;   // most recent entry by date (and time via id)
      const startWeight = byDateAsc[0].weight; // oldest entry by date
      const weightLost = oldWeight - newWeight;
      const totalLost = startWeight - newWeight;
      
      if (weightLost >= 1) celebrate('🎉 Down ' + weightLost.toFixed(1) + ' lbs!');
      if (Math.floor(totalLost) % 10 === 0 && totalLost >= 10) celebrate('🏆 ' + Math.floor(totalLost) + ' lbs lost total!');
      if (userProfile.goalWeight && newWeight <= userProfile.goalWeight) celebrate('🎯 Goal Weight Reached!');
    }
    
    setWeightEntries(updated);
    saveData('health-weight-entries', updated);
    resetWeightForm();
  };

  const deleteWeight = (id) => {
    const updated = weightEntries.filter(e => e.id !== id);
    setWeightEntries(updated);
    saveData('health-weight-entries', updated);
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

  // Fasting window CRUD operations
  const addOrUpdateFasting = () => {
    if (!fastingHours || isNaN(parseInt(fastingHours))) return;
    const hours = parseInt(fastingHours);
    if (hours < 1 || hours > 23) return; // Validate reasonable fasting hours
    let updated = editingFasting
      ? fastingEntries.map(e => e.id === editingFasting.id ? { ...e, fastingHours: hours, date: fastingDate } : e)
      : [...fastingEntries, { id: Date.now(), fastingHours: hours, date: fastingDate }];
    updated.sort((a, b) => parseLocalDate(b.date) - parseLocalDate(a.date));
    
    // Calculate streak and celebrate milestones
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
  const scheduleLocalInjectionReminders = async (settingsOverride) => {
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
      const [hr, min] = (settings.reminderTime || '09:00').split(':').map(Number);
      const notifications = [];
      let id = 1;
      if (settings.injectionReminders) {
        const upcoming = getNextInjections();
        upcoming.forEach(injection => {
          if (injection.daysUntil < 0 || injection.daysUntil > 14) return;
          const at = new Date();
          at.setDate(at.getDate() + injection.daysUntil);
          at.setHours(hr, min, 0, 0);
          if (at.getTime() <= Date.now()) return;
          notifications.push({
            id,
            title: injection.isOverdue ? '⚠️ Injection Overdue' : '💉 Injection Reminder',
            body: injection.isOverdue
              ? `${injection.medication} is ${Math.abs(injection.daysUntil)} ${Math.abs(injection.daysUntil) === 1 ? 'day' : 'days'} overdue`
              : `Time to inject ${injection.medication}!`,
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
      if (notifications.length) await LocalNotifications.schedule({ notifications });
    } catch (e) {
      console.warn('Local notifications:', e);
    }
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
    if (notificationPermission === 'granted') scheduleLocalInjectionReminders(updated);
  };

  const addOrUpdateInjection = () => {
    if (!injectionDose || isNaN(parseFloat(injectionDose))) return;
    const doseMg = toDoseMg({ dose: injectionDose, unit: injectionUnit });
    const entryData = { type: injectionType, dose: parseFloat(injectionDose), unit: injectionUnit, date: injectionDate, route: injectionRoute, site: injectionSite, notes: injectionNotes, sideEffects: selectedSideEffects, vialId: selectedVialId || undefined };
    let updated = editingInjection
      ? injectionEntries.map(e => e.id === editingInjection.id ? { ...e, ...entryData } : e)
      : [...injectionEntries, { id: Date.now(), ...entryData }];
    updated.sort((a, b) => parseLocalDate(b.date) - parseLocalDate(a.date));
    setInjectionEntries(updated);
    saveData('health-injection-entries', updated);
    // Vial: add back old dose when editing, then deduct new dose if a vial is selected
    let updatedVials = [...vials];
    if (editingInjection?.vialId) {
      const oldDoseMg = toDoseMg({ dose: editingInjection.dose, unit: editingInjection.unit || 'mg' });
      updatedVials = updatedVials.map(v => v.id === editingInjection.vialId ? { ...v, remainingMg: (v.remainingMg ?? v.totalMg) + oldDoseMg } : v);
    }
    if (selectedVialId) {
      updatedVials = updatedVials.map(v => v.id === selectedVialId ? { ...v, remainingMg: Math.max(0, (v.remainingMg ?? v.totalMg) - doseMg) } : v);
    }
    if (editingInjection?.vialId || selectedVialId) {
      setVials(updatedVials);
      saveData('health-vials', updatedVials);
    }
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
    const updated = journalEntries.filter(e => e.id !== id);
    setJournalEntries(updated);
    saveData('health-journal', updated);
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
      userProfile,
      vials
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
        if (imported.userProfile) {
          setUserProfile(imported.userProfile);
          saveData('health-user-profile', imported.userProfile);
        }
        if (imported.vials) {
          setVials(imported.vials);
          saveData('health-vials', imported.vials);
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

  const exportCSV = async () => {
    const sortedWeights = sortWeightByDateAsc(weightEntries);
    const sortedInjections = [...injectionEntries].sort((a, b) => parseLocalDate(a.date) - parseLocalDate(b.date));
    const sortedGlucose = sortByDateDesc(glucoseEntries);
    const sortedA1c = sortByDateDesc(a1cEntries);
    const rows = [];
    rows.push('Type,Date,Value,Medication,Dose,Unit,Route,Site');
    sortedWeights.forEach(e => rows.push(`Weight,${e.date},${e.weight},,,,,`));
    sortedInjections.forEach(e => rows.push(`Injection,${e.date},,${e.type},${e.dose},${e.unit},${e.route || ''},${e.site || ''}`));
    sortedGlucose.forEach(e => rows.push(`Glucose,${e.date},${e.value} mg/dL (${e.type}),,,`));
    sortedA1c.forEach(e => rows.push(`A1C,${e.date},${e.value}%,,,`));
    const csv = rows.join('\n');
    const filename = `PepTalk-export-${getTodayLocal()}.csv`;

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
    'health-user-profile',
    'health-vials',
  ];

  keysToRemove.forEach((k) => localStorage.removeItem(k));

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
  setVials([]);
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
    schedules.forEach(s => {
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

    return { weightStr, injStr, hydrationStr, avgGlucose, lastGlucose, lastA1c };
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
    
    const firstDate = new Date(sortedAsc[0].date);
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
      ? injectionsLast7Days.reduce((sum, inj) => sum + toDoseMg(inj), 0)
      : toDoseMg(lastInjection);
    const typical = getTypicalWeeklyLossForDose(injectionMed, weeklyDoseMg);
    const userLoss = -parseFloat(stats.weeklyAvg); // positive = lbs lost per week
    const doseLabel = injectionsLast7Days.length > 1 ? `${weeklyDoseMg} mg/week` : `${lastInjection.dose}${lastInjection.unit}`;
    if (userLoss <= 0) return { med: injectionMed, dose: doseLabel, typical, userLoss: 0, status: 'slower' };
    const ratio = userLoss / typical;
    let status = 'on_track';
    if (ratio >= 1.2) status = 'ahead';
    else if (ratio < 0.7) status = 'slower';
    return { med: injectionMed, dose: doseLabel, typical, userLoss, status };
  };

  // Chart data: your cumulative weight loss vs typical — week 1 through current week + 1
  const getYouVsTypicalChartData = () => {
    const onTrack = getOnTrackInfo();
    if (!onTrack) return [];
    const filtered = getFilteredData(weightEntries);
    const sorted = sortWeightByDateAsc(filtered);
    if (sorted.length < 2) return [];
    const startDate = parseLocalDate(sorted[0].date);
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
      const weightsUpToWeekEnd = sorted.filter(e => parseLocalDate(e.date) <= weekEnd);
      const latestInWindow = weightsUpToWeekEnd.length ? weightsUpToWeekEnd[weightsUpToWeekEnd.length - 1] : null;
      const userLoss = latestInWindow ? Math.max(0, startWeight - parseFloat(latestInWindow.weight)) : null;
      if (userLoss !== null) {
        points.push({ weekLabel, weeks: w, userLoss, typicalLoss });
      }
    }
    return points.length > 1 ? points : [];
  };

  // Milestones: 5 lb down, 10 lb down, ... from start weight toward goal
  const getMilestones = () => {
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
      list.push({ label: `${lb} lb down`, lb, achieved, toGo });
    }
    return list;
  };

  const getNextInjections = () => {
    const upcoming = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayStr = formatDateLocal(today);
    const msPerDay = 24 * 60 * 60 * 1000;

    schedules.forEach(schedule => {
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
    return toDoseMg({ dose: last.dose, unit: last.unit || 'mg' });
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

  const getSummaryChartData = (maxWeeks = 0) => {
    const filteredWeights = getFilteredData(weightEntries);
    const filteredInjections = getFilteredData(injectionEntries);
    const allDates = new Set();
    filteredWeights.forEach(e => allDates.add(e.date));
    filteredInjections.forEach(e => allDates.add(e.date));
    let sortedDates = Array.from(allDates).sort((a, b) => new Date(a) - new Date(b));
    if (maxWeeks > 0 && sortedDates.length > 0) {
      const cutoff = new Date(sortedDates[sortedDates.length - 1]);
      cutoff.setDate(cutoff.getDate() - maxWeeks * 7);
      sortedDates = sortedDates.filter(d => new Date(d) >= cutoff);
    }
    const points = sortedDates.map(date => {
      const dayWeights = filteredWeights.filter(e => e.date === date);
      const weightEntry = dayWeights.length === 0 ? null : dayWeights.sort((a, b) => (b.id || 0) - (a.id || 0))[0];
      const dayInjections = filteredInjections.filter(e => e.date === date);
      const doseData = {};
      const unitData = {};
      dayInjections.forEach(inj => {
        let doseInMg = parseFloat(inj.dose);
        if (inj.unit === 'mcg') doseInMg = inj.dose / 1000;
        if (inj.unit === 'ml') doseInMg = inj.dose;
        if (inj.unit === 'units') doseInMg = inj.dose / 100;
        if (inj.unit === 'IU') doseInMg = inj.dose / 1000;
        doseData[inj.type] = doseInMg;
        unitData[inj.type] = inj.unit;
      });
      const injectionsForTooltip = dayInjections.map(inj => ({ type: inj.type, dose: inj.dose, unit: inj.unit, route: inj.route, site: inj.site }));
      return { date: parseLocalDate(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }), fullDate: date, weight: weightEntry?.weight != null ? parseFloat(weightEntry.weight) : null, units: unitData, hasInjection: dayInjections.length > 0, injections: injectionsForTooltip, ...doseData };
    });
    // 7-day moving average trend line
    points.forEach(p => {
      const pointDate = new Date(p.fullDate);
      const windowStart = new Date(pointDate);
      windowStart.setDate(windowStart.getDate() - 6);
      const inWindow = filteredWeights.filter(e => {
        const d = parseLocalDate(e.date);
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
    const dates = [...new Set(measurementEntries.map(e => e.date))].sort();
    return dates.map(date => {
      const dataPoint = { date: parseLocalDate(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) };
      MEASUREMENT_TYPES.forEach(type => {
        const entry = measurementEntries.find(e => e.date === date && e.type === type);
        if (entry) dataPoint[type] = parseFloat(entry.value);
      });
      return dataPoint;
    });
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
      const isCurrentMonth = date.getMonth() === month;
      days.push({ date, dateStr, injections, isCurrentMonth, isToday: dateStr === getTodayLocal() });
    }
    return days;
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

  // Convert injection dose to mg-equivalent for pharmacokinetic weighting (same units = comparable)
  const toDoseMg = (inj) => {
    let dose = parseFloat(inj.dose);
    if (isNaN(dose)) return 0;
    if (inj.unit === 'mcg') return dose / 1000;
    if (inj.unit === 'ml') return dose;
    if (inj.unit === 'units') return dose / 100;
    if (inj.unit === 'IU') return dose / 1000;
    return dose; // mg
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
    const injectionDate = parseLocalDate(injection.date);
    const hoursElapsed = (now - injectionDate) / (1000 * 60 * 60);
    
    if (hoursElapsed < 0) return 0; // Future injection
    if (!medication.halfLife) return 0;
    
    const effectiveHours = getEffectiveHoursForDecay(injection, medication, hoursElapsed);
    const doseMg = toDoseMg(injection);
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
    
    // Get recent injections (last 90 days; fall back to all if none recent — e.g. sample data)
    let recentInjections = injectionEntries.filter(inj => {
      const injDate = parseLocalDate(inj.date);
      const daysAgo = (now - injDate) / (1000 * 60 * 60 * 24);
      return daysAgo <= 90;
    });
    if (recentInjections.length === 0) recentInjections = injectionEntries;
    
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
      
      // Sort by date, most recent first
      const sorted = injections.sort((a, b) => parseLocalDate(b.date) - parseLocalDate(a.date));
      const lastInjection = sorted[0];
      const hoursAgo = (now - parseLocalDate(lastInjection.date)) / (1000 * 60 * 60);
      
      // Calculate TOTAL current level from ALL recent injections, weighted by user's actual dose
      let totalRemainingMg = 0;
      injections.forEach(inj => {
        const injDate = parseLocalDate(inj.date);
        const hoursElapsed = (now - injDate) / (1000 * 60 * 60);
        if (hoursElapsed >= 0) {
          const effectiveHours = getEffectiveHoursForDecay(inj, medication, hoursElapsed);
          const doseMg = toDoseMg(inj);
          const halfLivesElapsed = effectiveHours / medication.halfLife;
          const remaining = doseMg * Math.pow(0.5, halfLivesElapsed);
          if (remaining > 0.0001) totalRemainingMg += remaining;
        }
      });
      // Display as % of last dose (100% = one dose equivalent remaining)
      const lastDoseMg = toDoseMg(lastInjection);
      const currentLevel = lastDoseMg > 0 ? (totalRemainingMg / lastDoseMg) * 100 : 0;
      
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
        const nextDate = new Date(parseLocalDate(lastInjection.date));
        nextDate.setDate(nextDate.getDate() + schedule.frequencyDays);
        nextInjection = nextDate;
      }

      insights.push({
        medication: medName,
        color: medication.color,
        category: medication.category,
        currentLevel: Math.round(currentLevel), // Round to whole number
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
      .sort((a, b) => parseLocalDate(a.date) - parseLocalDate(b.date));
    
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
        const doseMg = toDoseMg(inj);
        const halfLivesElapsed = effectiveHours / medication.halfLife;
        const remaining = doseMg * Math.pow(0.5, halfLivesElapsed);
        if (remaining > 0.0001) totalRemainingMg += remaining;
      });
      // Display as % of most recent dose at that point in time (100% = one dose equivalent)
      const lastInjAtDate = injectionsBeforeDate[injectionsBeforeDate.length - 1];
      const lastDoseMg = lastInjAtDate ? toDoseMg(lastInjAtDate) : 0;
      const level = lastDoseMg > 0 ? (totalRemainingMg / lastDoseMg) * 100 : 0;
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

  const filteredMedications = MEDICATIONS.filter(med => med.name.toLowerCase().includes(medSearchTerm.toLowerCase()) || med.category.toLowerCase().includes(medSearchTerm.toLowerCase()));
  const groupedMedications = filteredMedications.reduce((acc, med) => { if (!acc[med.category]) acc[med.category] = []; acc[med.category].push(med); return acc; }, {});

  const stats = getWeightStats();
  const bmiCategory = getBMICategory(stats.bmi);
  const upcomingInjections = getNextInjections();
  const measurementStats = getMeasurementStats();

  if (isLoading || showSplash) {
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
          <p className="text-gold-400 text-sm font-medium splash-subtitle">Loading your data...</p>
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

  return (
    <div className="min-h-screen p-3 pb-28 transition-all duration-300 bg-[var(--bg-base)]">
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

      {/* Welcome / Update modal — shows when app version changes; "Do not show again" hides forever */}
      {showWelcomeModal && (
        <div className="ui-modal-overlay" onClick={() => { setShowWelcomeModal(false); try { localStorage.setItem('peptalk-welcome-version', APP_VERSION); if (welcomeDontShowAgain) localStorage.setItem('peptalk-welcome-hide-forever', 'true'); } catch (_) {} }}>
          <div className="ui-modal max-h-[85vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-white flex items-center gap-2"><BookOpen className="h-6 w-6 text-gold-400" />Welcome to PepTalk</h3>
              <button type="button" onClick={() => { setShowWelcomeModal(false); try { localStorage.setItem('peptalk-welcome-version', APP_VERSION); if (welcomeDontShowAgain) localStorage.setItem('peptalk-welcome-hide-forever', 'true'); } catch (_) {} }} className="p-2 text-gray-400 hover:text-white rounded-lg"><X className="h-5 w-5" /></button>
            </div>
            <p className="text-gold-400 text-sm font-medium mb-3">v{APP_VERSION} — How to use the app</p>
            <div className="text-gray-300 text-sm space-y-3 mb-4 pr-2">
              <p><strong className="text-white">Summary</strong> — Your dashboard. Use &quot;Log weight&quot; and &quot;Log injection&quot; for quick entries. View stats, goal date, milestones, and upcoming injections.</p>
              <p><strong className="text-white">Weight</strong> — Log and edit weight entries. See your trend and chart.</p>
              <p><strong className="text-white">Injections</strong> — Log doses (medication, amount, date, SubQ/IM, site, side effects). Keeps a full history.</p>
              <p><strong className="text-white">Insights</strong> — Medication levels over time, phases, and when to dose next. Tap a medication to expand details.</p>
              <p><strong className="text-white">Journal</strong> — Track how you feel, energy, hunger, and notes. Great for side effects and non-scale victories.</p>
              <p><strong className="text-white">More</strong> — Body measurements &amp; progress photos, daily nutrition/hydration, calendar, <strong className="text-gold-400">Tools</strong> (calculators, schedules, titration, reminders, export/import), and Glucose &amp; A1C.</p>
              {weightEntries.length === 0 && injectionEntries.length === 0 && (
                <p className="bg-accent/10 border border-accent/20 rounded-lg p-2.5 text-gold-400 text-xs mt-2">Get started: set your goal weight in More → Tools, then log your first weight and injection from Summary.</p>
              )}
            </div>
            <label className="flex items-start gap-3 rounded-xl p-3 mb-4 cursor-pointer border border-white/[0.08] bg-[var(--bg-card)]">
              <input type="checkbox" checked={welcomeDontShowAgain} onChange={(e) => setWelcomeDontShowAgain(e.target.checked)} className="mt-1" />
              <span className="text-gray-200 text-sm">Do not show this again (even after updates)</span>
            </label>
            <button type="button" onClick={() => { setShowWelcomeModal(false); try { localStorage.setItem('peptalk-welcome-version', APP_VERSION); if (welcomeDontShowAgain) localStorage.setItem('peptalk-welcome-hide-forever', 'true'); } catch (_) {} }} className="w-full ui-btn-primary py-3">
              Got it
            </button>
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
        
        /* Smooth transitions for all interactive elements */
        button, .transition-all { transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1); }
        button:active { transform: scale(0.95); }
        button:hover { transform: translateY(-1px); }
        
        /* Enhanced button styles with shadows */
        .btn-primary {
          background: linear-gradient(135deg, #10b981 0%, #059669 100%);
          box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
        }
        .btn-primary:hover {
          box-shadow: 0 6px 16px rgba(16, 185, 129, 0.4);
        }
        .btn-primary:active {
          box-shadow: 0 2px 8px rgba(16, 185, 129, 0.3);
        }
        
        .btn-secondary {
          background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%);
          box-shadow: 0 4px 12px rgba(139, 92, 246, 0.3);
        }
        .btn-secondary:hover {
          box-shadow: 0 6px 16px rgba(139, 92, 246, 0.4);
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
      `}</style>
      
      <div className="max-w-2xl mx-auto px-1">
        <header className="text-center mb-5">
          <h1 className="text-xl font-bold text-white tracking-tight">PepTalk</h1>
          <p className="text-gold-400 text-xs mt-0.5 font-medium">Weight · Injections · Insights · Tools</p>
        </header>

        {/* Upcoming Injections Alert */}
        {upcomingInjections
          .filter(inj => (inj.isDueToday || inj.isOverdue) && !dismissedAlerts.includes(`${inj.medication}-${inj.daysUntil}`))
          .map((injection) => (
          <div key={injection.medication} className={`alert-enter mb-3 ui-alert ${injection.isOverdue ? 'ui-alert-danger' : 'ui-alert-warning'}`}>
            <Bell className={`h-5 w-5 shrink-0 ${injection.isOverdue ? 'text-red-400' : 'text-gold-400'}`} />
            <div className="flex-1 min-w-0">
              <div className={`font-semibold text-sm ${injection.isOverdue ? 'text-red-400' : 'text-gold-400'}`}>
                {injection.isOverdue ? 'Injection Overdue' : 'Injection Due Today'}
              </div>
              <div className="text-white text-sm mt-0.5">{injection.medication}</div>
              {injection.isOverdue && (
                <div className="text-gray-400 text-xs mt-0.5">{Math.abs(injection.daysUntil)} {Math.abs(injection.daysUntil) === 1 ? 'day' : 'days'} overdue</div>
              )}
            </div>
            <button
              onClick={() => setDismissedAlerts([...dismissedAlerts, `${injection.medication}-${injection.daysUntil}`])}
              className="ui-btn-ghost p-2 rounded-lg"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ))}

        {/* Tab Navigation */}
        <div className="mb-4">
          <div className="ui-tab-bar p-1 overflow-x-auto">
            {[
              { id: 'summary', icon: LayoutDashboard, label: 'Summary' },
              { id: 'weight', icon: Scale, label: 'Weight' },
              { id: 'injections', icon: Syringe, label: 'Injections' },
              { id: 'insights', icon: Activity, label: 'Insights' },
              { id: 'journal', icon: BookOpen, label: 'Journal' },
              { id: 'more', icon: MoreHorizontal, label: 'More' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => { setActiveTab(tab.id); setShowAddForm(false); }}
                className={`ui-tab whitespace-nowrap ${activeTab === tab.id ? 'ui-tab-active' : ''}`}
              >
                <tab.icon className="h-4 w-4 shrink-0" />
                <span className="truncate max-w-full text-[11px]">{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* SUMMARY TAB */}
        {activeTab === 'summary' && (
          <div key="summary" className="space-y-4 tab-enter">
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

            {/* Quick actions — log from Summary */}
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => { setActiveTab('weight'); setShowAddForm(true); }}
                className="flex-1 ui-btn-primary py-2.5 text-sm flex items-center justify-center gap-2"
              >
                <Scale className="h-4 w-4" />
                Log weight
              </button>
              <button
                type="button"
                onClick={() => { setActiveTab('injections'); setShowAddForm(true); }}
                className="flex-1 ui-btn-primary py-2.5 text-sm flex items-center justify-center gap-2"
              >
                <Syringe className="h-4 w-4" />
                Log injection
              </button>
            </div>

            {/* Low-vial alert: remaining &lt; typical dose */}
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

            {/* Your vials — remaining volume on Summary */}
            {vials.length > 0 && (
              <div className="ui-card p-4">
                <h3 className="text-white font-medium text-sm mb-2 flex items-center gap-2"><Syringe className="h-4 w-4 text-gold-400" />Your vials</h3>
                <div className="space-y-2">
                  {vials.map(v => {
                    const remMg = v.remainingMg ?? v.totalMg;
                    const totalMg = v.totalMg;
                    const conc = v.concentration;
                    const remMl = conc > 0 ? remMg / conc : null;
                    const totalMl = conc > 0 ? totalMg / conc : null;
                    const isLow = remMg <= 0;
                    return (
                      <div key={v.id} className={`flex justify-between items-center py-2 px-3 rounded-lg text-sm ${isLow ? 'bg-slate-700/50 opacity-70' : 'bg-slate-700/30'}`}>
                        <span className="text-white font-medium">{v.medication}</span>
                        <span className="text-gray-400">
                          {remMg.toFixed(1)} / {totalMg.toFixed(1)} mg
                          {conc > 0 && remMl != null && totalMl != null && <span className="text-gray-500 ml-1">· {remMl.toFixed(1)} / {totalMl.toFixed(1)} ml</span>}
                        </span>
                      </div>
                    );
                  })}
                </div>
                <button type="button" onClick={() => { setActiveTab('more'); setActiveMoreSection('tools'); setActiveToolSection('vials'); }} className="text-gray-500 hover:text-gold-400 text-xs mt-2">Add or edit in More → Tools → Vials</button>
              </div>
            )}

            {/* Weight Change — stats and estimated goal date (above Goal card) */}
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold text-white">Weight Change</h2>
              <span className="text-gray-400 text-sm">{getDateRangeLabel()}</span>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div className="ui-card p-4">
                <div className="flex items-center gap-2 text-gold-400 text-xs font-semibold mb-1"><Scale className="h-3 w-3" />Total change</div>
                <div className={`text-xl font-bold ${parseFloat(stats.change) < 0 ? 'text-green-500' : parseFloat(stats.change) > 0 ? 'text-red-400' : 'text-white'}`}>{stats.change}<span className="text-sm font-normal text-gray-400"> lbs</span></div>
              </div>
              <div className="ui-card p-4">
                <div className="flex items-center gap-2 text-gold-400 text-xs font-semibold mb-1"><Activity className="h-3 w-3" />Current BMI</div>
                <div className={`text-xl font-bold ${bmiCategory.color}`}>{stats.bmi || '-'}</div>
              </div>
              <div className="ui-card p-4">
                <div className="flex items-center gap-2 text-gold-400 text-xs font-semibold mb-1"><Scale className="h-3 w-3" />Weight</div>
                <div className="text-xl font-bold text-white">{stats.current}<span className="text-sm font-normal text-gray-400"> lbs</span></div>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div className="ui-card p-4">
                <div className="flex items-center gap-2 text-gold-400 text-xs font-semibold mb-1"><TrendingDown className="h-3 w-3" />Percent</div>
                <div className={`text-xl font-bold ${parseFloat(stats.percentChange) < 0 ? 'text-green-500' : parseFloat(stats.percentChange) > 0 ? 'text-red-400' : 'text-white'}`}>{stats.percentChange}<span className="text-sm font-normal text-gray-400">%</span></div>
              </div>
              <div className="ui-card p-4">
                <div className="flex items-center gap-2 text-gold-400 text-xs font-semibold mb-1"><Calendar className="h-3 w-3" />Weekly avg</div>
                <div className={`text-xl font-bold ${parseFloat(stats.weeklyAvg) < 0 ? 'text-green-500' : parseFloat(stats.weeklyAvg) > 0 ? 'text-red-400' : 'text-white'}`}>{stats.weeklyAvg}<span className="text-sm font-normal text-gray-400"> lbs/wk</span></div>
              </div>
              <div className="ui-card p-4">
                <div className="flex items-center gap-2 text-gold-400 text-xs font-semibold mb-1"><Target className="h-3 w-3" />To goal</div>
                <div className="text-xl font-bold text-white">{stats.toGoal}<span className="text-sm font-normal text-gray-400"> lbs</span></div>
              </div>
            </div>
            {stats.estimatedGoalDate && (
              <div className="ui-card p-4 border-accent/25 bg-accent/10">
                <div className="flex items-center gap-3">
                  <div className="bg-accent/20 p-2.5 rounded-xl border border-accent/30"><Target className="h-5 w-5 text-gold-400" /></div>
                  <div>
                    <div className="text-gold-400 text-sm font-semibold">Estimated Goal Date</div>
                    <div className="text-white text-lg font-bold mt-0.5">{stats.estimatedGoalDate}</div>
                    <div className="text-gray-400 text-xs mt-0.5">Based on your {stats.weeklyAvg} lbs/week average</div>
                  </div>
                </div>
              </div>
            )}

            {/* Goal weight + progress — below Weight Change */}
            {userProfile?.goalWeight && (() => {
              const goal = parseFloat(userProfile.goalWeight);
              const current = parseFloat(stats.current) || 0;
              const hasWeight = current > 0;
              const filtered = getFilteredData(weightEntries);
              const startWeight = filtered.length ? parseFloat(sortWeightByDateAsc(filtered)[0].weight) : current;
              const totalToLose = startWeight - goal;
              const progress = totalToLose > 0 && hasWeight ? Math.min(100, ((startWeight - current) / totalToLose) * 100) : 0;
              return (
                <div className="ui-card p-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-gray-400 text-sm">Goal</span>
                    <span className="text-white font-medium">{userProfile.goalWeight} lbs</span>
                  </div>
                  <div className="h-2 rounded-full bg-white/10 overflow-hidden">
                    <div className="h-full rounded-full bg-gradient-to-r from-accent to-gold-500 transition-all duration-500" style={{ width: `${Math.max(0, progress)}%` }} />
                  </div>
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>{hasWeight ? `${stats.current} lbs now` : 'Add weight to see progress'}</span>
                    <span>{hasWeight ? (stats.toGoal || '—') + ' to go' : '—'}</span>
                  </div>
                </div>
              );
            })()}

            {/* Week in review */}
            {(() => {
              const d = getWeeklyDigest();
              return (
                <div className="ui-card p-4 border-accent/20 bg-accent/5">
                  <h3 className="text-gold-400 text-sm font-semibold mb-2 flex items-center gap-2"><Calendar className="h-4 w-4" />This week</h3>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-gray-200 text-sm">
                    <span><Scale className="h-3.5 w-3 inline mr-1 text-gray-400" />Weight {d.weightStr}</span>
                    <span><Syringe className="h-3.5 w-3 inline mr-1 text-gray-400" />{d.injStr} injections</span>
                    <span><Droplets className="h-3.5 w-3 inline mr-1 text-gray-400" />{d.hydrationStr} hydrated</span>
                    {d.avgGlucose != null && <span className="text-green-500">Glucose avg {d.avgGlucose} mg/dL</span>}
                    {d.avgGlucose == null && d.lastGlucose && <span className="text-green-500">Last glucose {d.lastGlucose.value} mg/dL</span>}
                    {d.lastA1c && <span className="text-cyan-400">A1C {d.lastA1c.value}%</span>}
                  </div>
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
                  <button type="button" onClick={() => { setActiveTab('more'); setActiveMoreSection('profile'); }} className="text-gray-500 hover:text-gold-400 text-xs mt-1.5">
                    Edit goal in More → Profile
                  </button>
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

            {/* On track? — compare to typical GLP-1 loss */}
            {getOnTrackInfo() && (
              <div className="ui-card p-4">
                <h3 className="text-white font-semibold mb-3 flex items-center gap-2"><Activity className="h-4 w-4 text-gold-400" />On track?</h3>
                {(() => {
                  const info = getOnTrackInfo();
                  const statusMsg = info.status === 'ahead' ? "You're ahead of typical loss — great progress." : info.status === 'slower' ? "You're losing slower than average. Normal early on or at lower doses." : "Your loss is in line with typical results for your medication.";
                  const statusColor = info.status === 'ahead' ? 'text-green-500' : info.status === 'slower' ? 'text-gold-400' : 'text-green-500';
                  return (
                    <div className="space-y-2">
                      <p className="text-gray-300 text-sm">On {info.med} {info.dose}, people typically lose about <strong className="text-white">{info.typical} lb/week</strong>. You're averaging <strong className="text-white">{info.userLoss.toFixed(1)} lb/week</strong>.</p>
                      <p className={`text-sm font-medium ${statusColor}`}>{statusMsg}</p>
                    </div>
                  );
                })()}
              </div>
            )}

            {/* Your loss vs typical — cumulative weight loss chart */}
            {getYouVsTypicalChartData().length > 0 && (
              <div className="ui-card overflow-hidden">
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

            {/* Milestones — 5 lb down, 10 lb down, ... */}
            {getMilestones().length > 0 && (
              <div className="ui-card p-4">
                <h3 className="text-white font-semibold mb-3 flex items-center gap-2"><Trophy className="h-4 w-4 text-gold-400" />Milestones</h3>
                <div className="flex flex-wrap gap-2">
                  {getMilestones().map((m, i) => (
                    <div key={i} className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm ${m.achieved ? 'bg-green-500/20 text-green-500 border border-green-500/30' : 'bg-slate-700/50 text-gray-400 border border-white/[0.04]'}`}>
                      {m.achieved ? <CheckCircle className="h-4 w-4 flex-shrink-0" /> : <span className="w-4 h-4 rounded-full border-2 border-gray-500 flex-shrink-0" />}
                      <span>{m.label}</span>
                      {!m.achieved && m.toGo > 0 && <span className="text-gray-500 text-xs">— {m.toGo.toFixed(0)} lb to go</span>}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Upcoming Injections */}
            {upcomingInjections.length > 0 && (
              <div className="ui-card p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-white font-semibold flex items-center gap-2"><Bell className="h-4 w-4 text-gold-400" />Upcoming Injections</h3>
                  <button type="button" onClick={() => { setActiveTab('more'); setActiveMoreSection('tools'); setActiveToolSection('notifications'); }} className="text-gold-400 hover:text-gold-300 text-xs font-medium flex items-center gap-1">
                    <Bell className="h-3.5 w-3" />Remind me
                  </button>
                </div>
                <div className="space-y-2">
                  {upcomingInjections.slice(0, 3).map((inj, idx) => (
                    <div key={idx} className="flex items-center justify-between rounded-lg p-3 ui-card-inner">
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
                  ))}
                </div>
              </div>
            )}

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

            {/* Weight chart — clean, modern (goal weight is at top of Summary + editable in More → Profile) */}
            {weightEntries.length > 0 && (() => {
              const summaryData = getSummaryChartData(chartRangeWeeks);
              const pointCount = summaryData.length;
              // Limit X-axis ticks so labels don't overlap (4w can have ~28 points → unreadable)
              const xInterval = pointCount > 12 ? Math.max(0, Math.floor(pointCount / 6)) : 0;
              const showAllDots = pointCount <= 35;
              // Y-axis domain from actual weight values only (avoids bad top tick like "0002")
              const weightValues = summaryData.map(p => p.weight).filter(w => w != null && !isNaN(w));
              const wMin = weightValues.length ? Math.min(...weightValues) : 0;
              const wMax = weightValues.length ? Math.max(...weightValues) : 100;
              const yDomain = [Math.floor(wMin) - 2, Math.ceil(wMax) + 2];
              // Current weight = most recent point with a value (for reference line + highlight)
              const lastPointWithWeight = [...summaryData].reverse().find(p => p.weight != null);
              const currentWeight = lastPointWithWeight?.weight;
              const currentWeightDate = lastPointWithWeight?.fullDate;
              return (
              <div className="ui-card overflow-hidden">
                <div className="px-5 pt-5 pb-1">
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
                    <h3 className="text-gray-300 text-sm font-medium">Weight over time</h3>
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
                  <ResponsiveContainer width="100%" height={280}>
                    <ComposedChart data={summaryData} margin={{ top: 8, right: 16, left: 104, bottom: 4 }}>
                      <defs>
                        <linearGradient id="weightFill" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#e8b84c" stopOpacity={0.2} />
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
                        tickMargin={8}
                        width={36}
                        domain={yDomain}
                        tickFormatter={(v) => `${v}`}
                      />
                      {currentWeight != null && (
                        <ReferenceLine 
                          yAxisId="weight"
                          y={currentWeight} 
                          stroke="#e8b84c" 
                          strokeWidth={1.5} 
                          strokeDasharray="4 4"
                          strokeOpacity={0.8}
                          label={{ value: `Current: ${currentWeight} lbs`, position: 'left', fill: '#e8b84c', fontSize: 11, fontWeight: 600 }}
                        />
                      )}
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
                      {visibleLines.weight && (
                        <Area 
                          yAxisId="weight" 
                          type="monotone" 
                          dataKey="weight" 
                          fill="url(#weightFill)" 
                          stroke="none" 
                          isAnimationActive={true}
                          connectNulls 
                        />
                      )}
                      {visibleLines.weight && (
                        <Line 
                          yAxisId="weight" 
                          type="monotone" 
                          dataKey="weight" 
                          stroke="#e8b84c" 
                          strokeWidth={2.5} 
                          dot={({ cx, cy, payload }) => {
                            if (payload.weight == null) return null;
                            if (!showAllDots && !payload.hasInjection) return null;
                            const isInjectionDay = payload.hasInjection;
                            const r = isInjectionDay ? 6 : 4;
                            return (
                              <circle 
                                cx={cx} 
                                cy={cy} 
                                r={r} 
                                fill="#0f172a" 
                                stroke={isInjectionDay ? '#10b981' : '#e8b84c'} 
                                strokeWidth={2}
                              />
                            );
                          }}
                          activeDot={{ r: 6, stroke: '#e8b84c', strokeWidth: 2, fill: '#0f172a' }}
                          connectNulls 
                          name="Weight"
                        />
                      )}
                      {visibleLines.trend !== false && (
                        <Line 
                          yAxisId="weight" 
                          type="monotone" 
                          dataKey="weightTrend" 
                          stroke="#64748b" 
                          strokeWidth={1.5} 
                          strokeDasharray="6 4" 
                          dot={false} 
                          connectNulls 
                          name="7-day average"
                        />
                      )}
                    </ComposedChart>
                  </ResponsiveContainer>
                  <div className="flex flex-col items-center gap-2 mt-3 pt-3 border-t border-white/[0.04]">
                    <div className="flex items-center gap-6">
                      <button 
                        onClick={() => setVisibleLines(prev => ({ ...prev, weight: !prev.weight }))}
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition-all ${visibleLines.weight ? 'bg-accent/15 text-gold-400' : 'text-gray-500'}`}
                      >
                        <span className={`w-2.5 h-2.5 rounded-full ${visibleLines.weight ? 'bg-gold-400' : 'bg-slate-600'}`} />
                        Weight
                      </button>
                      <button 
                        onClick={() => setVisibleLines(prev => ({ ...prev, trend: !prev.trend }))}
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition-all ${visibleLines.trend !== false ? 'bg-slate-500/15 text-gray-300' : 'text-gray-500'}`}
                      >
                        <span className={`inline-block w-5 h-0.5 rounded-full ${visibleLines.trend !== false ? 'bg-slate-400' : 'bg-slate-600'}`} />
                        7-day average
                      </button>
                    </div>
                    <p className="text-gray-500 text-xs">Green ring = injection that day{!showAllDots && ' · Dots only on injection days when zoomed out'}</p>
                  </div>
                </div>
              </div>
              );
            })()}
          </div>
        )}

        {/* INSIGHTS TAB */}
        {activeTab === 'insights' && (
          <div key="insights" className="space-y-4 tab-enter">
            {/* Hero: simple headline */}
            <div className="text-center pb-2">
              <h2 className="text-xl font-bold text-white tracking-tight">Insights</h2>
              <p className="text-gray-400 text-sm mt-1">Your medication levels at a glance</p>
            </div>

            {/* Side effects from logs */}
            {getSideEffectsSummary().length > 0 && (
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

            {/* Side effects by day in cycle */}
            {(() => {
              const medNamesWithEffects = [...new Set(injectionEntries.filter(e => (e.sideEffects?.length ?? 0) > 0).map(e => e.type))];
              if (medNamesWithEffects.length === 0) return null;
              return (
                <div className="ui-card p-4">
                  <h3 className="text-white font-semibold mb-2 text-sm">Side effects by day in cycle</h3>
                  <p className="text-gray-400 text-xs mb-3">Reported on injection day (day 0). Many people feel effects peak 1–2 days after; use Journal to track how you feel the next day.</p>
                  {medNamesWithEffects.map(medName => {
                    const byDay = getSideEffectsByDayInCycle(medName);
                    const day0 = byDay.day0 || {};
                    const entries = Object.entries(day0).sort((a, b) => b[1] - a[1]);
                    if (entries.length === 0) return null;
                    return (
                      <div key={medName} className="mb-3 last:mb-0">
                        <div className="text-gold-400 text-xs font-medium mb-1">{medName}</div>
                        <div className="text-gray-300 text-xs">
                          <span className="text-gray-500">Day 0 (injection day): </span>
                          {entries.map(([name, count]) => (
                            <span key={name} className="inline-block bg-orange-500/20 text-orange-300 px-2 py-0.5 rounded mr-1 mb-1">{name} ({count})</span>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              );
            })()}

            {/* How levels work — one line + optional expand */}
            <div className="ui-card overflow-hidden">
              <button type="button" onClick={() => setInsightsShowLevelsHelp(!insightsShowLevelsHelp)} className="w-full px-4 py-3 flex items-center justify-between gap-2 text-left hover:bg-white/[0.03] transition-colors">
                <span className="text-gray-300 text-sm">Levels can be &gt;100% when doses build up (steady state). SubQ vs IM affects the curve.</span>
                <ChevronDown className={`h-4 w-4 text-gray-500 flex-shrink-0 transition-transform ${insightsShowLevelsHelp ? 'rotate-180' : ''}`} />
              </button>
              {insightsShowLevelsHelp && (
                <div className="px-4 pb-4 pt-0 border-t border-white/[0.04]">
                  <p className="text-gray-400 text-xs mt-3">When you inject regularly, new doses add to what's still in your system — that's steady-state accumulation. 0–100% = single dose range; 100–150% = building up; 150–200% = steady state (optimal). Route (SubQ vs IM) is modeled so IM shows faster absorption.</p>
                  <div className="flex gap-2 mt-3">
                    <div className="flex-1 bg-slate-700/50 rounded-lg p-2 text-center text-xs"><div className="text-gray-400">Single</div><div className="text-white font-medium">0–100%</div></div>
                    <div className="flex-1 bg-yellow-500/10 rounded-lg p-2 text-center text-xs"><div className="text-yellow-400">Building</div><div className="text-white font-medium">100–150%</div></div>
                    <div className="flex-1 bg-green-500/10 rounded-lg p-2 text-center text-xs"><div className="text-green-500">Steady ✓</div><div className="text-white font-medium">150–200%</div></div>
                  </div>
                </div>
              )}
            </div>

            {getMedicationInsights().length === 0 ? (
              <div className="ui-card p-8 text-center">
                <div className="w-14 h-14 rounded-2xl bg-slate-700/50 flex items-center justify-center mx-auto mb-4">
                  <Activity className="h-7 w-7 text-gray-400" />
                </div>
                <h3 className="text-white font-semibold mb-1">No medication data yet</h3>
                <p className="text-gray-400 text-sm mb-5">Log an injection to see levels and when to dose next.</p>
                <button onClick={() => setActiveTab('injections')} className="ui-btn-primary px-5 py-2.5 text-sm">
                  Log injection
                </button>
              </div>
            ) : (
              <>
                {/* Active Medications Overview */}
                {getMedicationInsights().map(insight => {
                  const isExpanded = insightsExpandedMed === insight.medication;
                  const levelNum = parseFloat(insight.currentLevel);
                  const statusLabel = levelNum >= 150 ? 'Steady state' : levelNum >= 100 ? 'Building up' : 'Single dose range';
                  const statusColor = levelNum >= 150 ? 'text-green-500' : levelNum >= 100 ? 'text-gold-400' : 'text-gray-400';
                  return (
                  <div key={insight.medication} className="ui-card overflow-hidden">
                    {/* Compact header — always visible */}
                    <button type="button" onClick={() => setInsightsExpandedMed(isExpanded ? null : insight.medication)} className="w-full px-4 py-4 flex items-center gap-4 text-left hover:bg-white/[0.03] transition-colors">
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

                    {insight.effectProfile?.splitDoseTip && (
                      <p className="text-gold-400 text-xs bg-accent/10 border border-accent/20 rounded-lg p-2.5">💡 {insight.effectProfile.splitDoseTip}</p>
                    )}

                    {/* Medication Level Chart */}
                    {getMedicationLevelChartData(insight.medication).length > 0 && (
                      <div className="mb-3">
                        <h4 className="text-gray-400 text-xs font-medium mb-2">Level (last 14 days)</h4>
                        <ResponsiveContainer width="100%" height={160}>
                          <LineChart data={getMedicationLevelChartData(insight.medication)} margin={{ top: 8, right: 20, left: 0, bottom: 4 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                            {/* Reference zones */}
                            <ReferenceArea y1={0} y2={100} fill="#475569" fillOpacity={0.1} />
                            <ReferenceArea y1={100} y2={150} fill="#eab308" fillOpacity={0.1} />
                            <ReferenceArea y1={150} y2={200} fill="#10b981" fillOpacity={0.1} />
                            <XAxis dataKey="date" stroke="#94a3b8" fontSize={9} tickMargin={4} interval="preserveStartEnd" />
                            <YAxis stroke="#94a3b8" fontSize={9} tickFormatter={(v) => `${v}%`} domain={[0, 200]} ticks={[0, 50, 100, 150, 200]} width={36} />
                            <Tooltip 
                              contentStyle={{ backgroundColor: 'rgba(24, 24, 28, 0.95)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', backdropFilter: 'blur(12px)' }}
                              formatter={(value) => [`${value}%`, 'Level']}
                            />
                            <Line
                              type="monotone"
                              dataKey="level"
                              stroke={insight.color}
                              strokeWidth={3}
                              dot={(props) => {
                                const { cx, cy, payload } = props;
                                if (payload.level == null) return null;
                                const isInjectionDay = payload.injectionDay;
                                return (
                                  <g>
                                    {isInjectionDay && (
                                      <circle cx={cx} cy={cy} r={8} fill="none" stroke="#10b981" strokeWidth={2} strokeDasharray="3 2" />
                                    )}
                                    <circle cx={cx} cy={cy} r={isInjectionDay ? 5 : 4} fill={insight.color} stroke={isInjectionDay ? '#10b981' : 'transparent'} strokeWidth={isInjectionDay ? 2 : 0} />
                                  </g>
                                );
                              }}
                            />
                          </LineChart>
                        </ResponsiveContainer>
                        <div className="flex flex-wrap items-center gap-3 mt-2 pt-2 border-t border-white/[0.06]">
                          <div className="flex items-center gap-1.5 text-gray-400 text-xs">
                            <span className="inline-flex items-center justify-center w-4 h-4 rounded-full border-2 border-dashed border-green-500 bg-transparent" style={{ borderStyle: 'dashed' }} />
                            <span><strong className="text-gray-300">Green ring</strong> = day you logged an injection</span>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Phase progress — compact */}
                    {insight.currentPhase && insight.timeline && (
                      <div>
                        <div className="flex items-center justify-between gap-2 mb-2">
                          {insight.timeline.phases.map((phase, idx) => (
                            <div key={idx} className={`text-[10px] ${idx === insight.currentPhase.phaseIndex ? insight.currentPhase.color : 'text-gray-500'}`}>{phase.name}</div>
                          ))}
                        </div>
                        <div className="relative h-1.5 bg-slate-700 rounded-full overflow-hidden">
                          <div className={`absolute h-full ${insight.currentPhase.bgColor} transition-all`} style={{ width: `${((insight.currentPhase.phaseIndex + 1) / insight.currentPhase.totalPhases) * 100}%` }} />
                        </div>
                        <p className="text-gray-400 text-xs mt-2">{insight.currentPhase.description}</p>
                      </div>
                    )}

                    {/* Phase detail card — overhauled */}
                    {insight.currentPhase && (
                      <div className="ui-card overflow-hidden">
                        {/* Header: phase name + injection date highlight */}
                        <div className={`${insight.currentPhase.bgColor} ${insight.currentPhase.borderColor} border-b border-inherit px-4 py-3`}>
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <div className="flex items-center gap-2">
                              <span className="text-xl" aria-hidden>{insight.currentPhase.icon}</span>
                              <h5 className={`${insight.currentPhase.color} font-semibold text-base`}>{insight.currentPhase.name}</h5>
                            </div>
                            <div className="flex items-center gap-1.5 text-xs">
                              <span className="text-gray-400">Injection recorded</span>
                              <span className="px-2 py-0.5 rounded-md bg-green-500/25 text-green-400 font-medium border border-green-500/40">
                                {insight.lastInjection ? new Date(insight.lastInjection).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }) : '—'}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="p-4 space-y-4">
                          <section>
                            <h6 className="flex items-center gap-1.5 text-gray-300 text-xs font-semibold uppercase tracking-wider mb-2">
                              <Zap className="h-3.5 w-3 text-gold-400/80" />
                              What&apos;s happening
                            </h6>
                            <ul className="space-y-1.5 pl-0.5">
                              {insight.currentPhase.whatsHappening.map((item, i) => (
                                <li key={i} className="text-gray-300 text-sm flex items-start gap-2">
                                  <span className="text-gold-400/70 mt-1.5 shrink-0 w-1 h-1 rounded-full bg-current" />
                                  <span>{item}</span>
                                </li>
                              ))}
                            </ul>
                          </section>
                          <section className="pt-3 border-t border-white/[0.06]">
                            <h6 className="flex items-center gap-1.5 text-gray-300 text-xs font-semibold uppercase tracking-wider mb-2">
                              <Activity className="h-3.5 w-3 text-cyan-400/80" />
                              What to expect
                            </h6>
                            <ul className="space-y-1.5 pl-0.5">
                              {insight.currentPhase.whatToExpect.map((item, i) => (
                                <li key={i} className="text-gray-300 text-sm flex items-start gap-2">
                                  <span className="text-cyan-400/70 mt-1.5 shrink-0 w-1 h-1 rounded-full bg-current" />
                                  <span>{item}</span>
                                </li>
                              ))}
                            </ul>
                          </section>
                          <section className="pt-3 border-t border-white/[0.06]">
                            <h6 className="flex items-center gap-1.5 text-gray-300 text-xs font-semibold uppercase tracking-wider mb-2">
                              <CheckCircle className="h-3.5 w-3 text-green-500/80" />
                              Tips for this phase
                            </h6>
                            <ul className="space-y-1.5 pl-0.5">
                              {insight.currentPhase.tips.map((tip, i) => (
                                <li key={i} className="text-gray-300 text-sm flex items-start gap-2">
                                  <span className="text-green-500/70 mt-1.5 shrink-0 w-1 h-1 rounded-full bg-current" />
                                  <span>{tip}</span>
                                </li>
                              ))}
                            </ul>
                          </section>
                        </div>
                      </div>
                    )}

                    {/* Next dose reminder — one line */}
                    {(() => {
                      const medication = MEDICATIONS.find(m => m.name === insight.medication);
                      if (!medication) return null;
                      const hoursAgo = parseFloat(insight.hoursAgo);
                      const expectedFrequencyHours = medication.defaultSchedule * 24;
                      const hoursOverdue = hoursAgo - expectedFrequencyHours;
                      const daysUntilTypical = (expectedFrequencyHours - hoursAgo) / 24;
                      let urgencyColor = 'bg-green-500/10 border-green-500/20';
                      let urgencyText = `Next dose in ~${Math.ceil(daysUntilTypical)} days`;
                      if (hoursOverdue > 24) { urgencyColor = 'bg-red-500/10 border-red-500/30'; urgencyText = `Overdue by ${Math.ceil(hoursOverdue / 24)} day(s) — inject soon`; }
                      else if (hoursOverdue > 0 || insight.phase === 'Trough') { urgencyColor = 'bg-red-500/10 border-red-500/30'; urgencyText = 'Inject today'; }
                      else if (daysUntilTypical <= 1) { urgencyColor = 'bg-yellow-500/10 border-yellow-500/30'; urgencyText = 'Inject tomorrow or within 24h'; }
                      else if (daysUntilTypical <= 2) { urgencyColor = 'bg-cyan-500/10 border-cyan-500/30'; urgencyText = `Plan in ${Math.ceil(daysUntilTypical)} days`; }
                      return (
                        <div className={`${urgencyColor} border rounded-lg px-3 py-2 text-sm text-gray-200`}>{urgencyText}</div>
                      );
                    })()}

                    {/* One-line insight */}
                    <p className="text-gray-400 text-xs">
                      {levelNum >= 150 ? 'Steady state — optimal level.' : levelNum >= 100 ? 'Building up — keep consistent dosing.' : levelNum < 50 ? 'Levels low — plan next dose.' : 'Track side effects in Journal to spot patterns.'}
                    </p>
                    </div>
                    )}
                  </div>
                );
                })}
              </>
            )}
          </div>
        )}

        {/* WEIGHT TAB */}
        {activeTab === 'weight' && (
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

            <div className="rounded-2xl p-4 border border-accent/20 bg-accent/5 backdrop-blur-sm">
              <p className="text-gray-300 text-sm mb-2">For best results, use our Calorie / TDEE calculator to align your intake with your goals.</p>
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
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-white font-medium">History</h3>
                {!showAddForm && <button onClick={() => setShowAddForm(true)} className="bg-green-500 hover:bg-green-600 text-white p-2 rounded-lg"><Plus className="h-5 w-5" /></button>}
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
                  {sortWeightByDateDesc(weightEntries).map((entry) => (
                    <div key={entry.id} className="flex items-center justify-between bg-slate-700/50 rounded-lg p-3 group">
                      <div className="flex items-center gap-3">
                        <div className="bg-pink-500/20 p-2 rounded-lg"><Scale className="h-5 w-5 text-pink-400" /></div>
                        <div>
                          <div className="text-white font-medium">{entry.weight} lbs</div>
                          <div className="text-gray-400 text-sm">{parseLocalDate(entry.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</div>
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
            <div className="grid grid-cols-4 gap-2">
              {['GLP-1', 'Peptide', 'Hormone', 'Other'].map(cat => {
                const count = injectionEntries.filter(e => { const med = MEDICATIONS.find(m => m.name === e.type); return med?.category === cat || (cat === 'Other' && (!med || med.category === 'Other' || med.category === 'Triple Agonist' || med.category === 'GLP-1/GIP')); }).length;
                return <div key={cat} className="bg-[var(--bg-card)] rounded-xl p-2 text-center"><div className="text-lg font-bold text-white">{count}</div><div className="text-xs text-gray-400 truncate">{cat}</div></div>;
              })}
            </div>

            {/* Your vials — remaining volume on Injections page */}
            {vials.length > 0 && (
              <div className="ui-card p-4">
                <h3 className="text-white font-medium text-sm mb-2 flex items-center gap-2"><Syringe className="h-4 w-4 text-gold-400" />Your vials</h3>
                <div className="space-y-2">
                  {vials.map(v => {
                    const remMg = v.remainingMg ?? v.totalMg;
                    const totalMg = v.totalMg;
                    const conc = v.concentration;
                    const remMl = conc > 0 ? remMg / conc : null;
                    const totalMl = conc > 0 ? totalMg / conc : null;
                    const isLow = remMg <= 0;
                    return (
                      <div key={v.id} className={`flex justify-between items-center py-2 px-3 rounded-lg text-sm ${isLow ? 'bg-slate-700/50 opacity-70' : 'bg-slate-700/30'}`}>
                        <span className="text-white font-medium">{v.medication}</span>
                        <span className="text-gray-400">
                          {remMg.toFixed(1)} / {totalMg.toFixed(1)} mg
                          {conc > 0 && remMl != null && totalMl != null && <span className="text-gray-500 ml-1">· {remMl.toFixed(1)} / {totalMl.toFixed(1)} ml</span>}
                        </span>
                      </div>
                    );
                  })}
                </div>
                <button type="button" onClick={() => { setActiveTab('more'); setActiveMoreSection('tools'); setActiveToolSection('vials'); }} className="text-gray-500 hover:text-gold-400 text-xs mt-2">Add or edit in More → Tools → Vials</button>
              </div>
            )}

            {showAddForm && (
              <div className="ui-card p-4">
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
                    <label className="text-gray-400 text-sm block mb-1">Date</label>
                    <input type="date" value={injectionDate} onChange={(e) => setInjectionDate(e.target.value)} className="w-full bg-slate-700 text-white rounded-lg px-4 py-3" />
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
                          const deduct = toDoseMg({ dose: injectionDose, unit: injectionUnit });
                          const after = Math.max(0, remaining - deduct);
                          return <p className="text-gray-500 text-xs mt-1">After this dose: {after.toFixed(1)} mg remaining</p>;
                        })()}
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
                    <label className="text-gray-400 text-sm block mb-2">Side Effects</label>
                    <div className="flex flex-wrap gap-2">
                      {SIDE_EFFECTS.map(effect => <button key={effect} onClick={() => toggleSideEffect(effect)} className={`px-3 py-1 rounded-full text-xs transition-all ${selectedSideEffects.includes(effect) ? 'bg-orange-500 text-white' : 'bg-white/10 text-gray-300 hover:bg-white/15'}`}>{effect}</button>)}
                    </div>
                  </div>
                  <div>
                    <label className="text-gray-400 text-sm block mb-1">Notes</label>
                    <textarea value={injectionNotes} onChange={(e) => setInjectionNotes(e.target.value)} className="w-full bg-slate-700 text-white rounded-lg px-4 py-3 resize-none" rows={2} placeholder="Optional notes..." />
                  </div>
                  <button onClick={addOrUpdateInjection} className="w-full btn-secondary text-white font-medium py-3 rounded-lg transform hover:scale-105 transition-all">{editingInjection ? 'Update' : 'Log Injection'}</button>
                </div>
              </div>
            )}

            <div className="ui-card p-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-white font-medium">History</h3>
                {!showAddForm && <button onClick={() => setShowAddForm(true)} className="bg-accent hover:bg-gold-400 text-gray-900 p-2 rounded-lg shadow-gold-glow"><Plus className="h-5 w-5" /></button>}
              </div>
              {injectionEntries.length === 0 ? (
                <div className="text-center py-8 text-gray-400"><Syringe className="h-12 w-12 mx-auto mb-2 opacity-50" /><p>No injections logged</p></div>
              ) : (
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {injectionEntries.map((entry) => (
                    <div key={entry.id} className="bg-slate-700/50 rounded-lg p-3 group">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3">
                          <div className="p-2 rounded-lg mt-1" style={{ backgroundColor: `${getMedicationColor(entry.type)}20` }}><Syringe className="h-5 w-5" style={{ color: getMedicationColor(entry.type) }} /></div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2"><span className="text-white font-medium">{entry.type}</span><span className="text-gray-300">{entry.dose} {entry.unit}</span></div>
                            <div className="text-gray-400 text-sm">{parseLocalDate(entry.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}{(entry.route || entry.site) && <span className="ml-2">• {[entry.route, entry.site].filter(Boolean).join(' · ')}</span>}</div>
                            {entry.sideEffects?.length > 0 && <div className="flex flex-wrap gap-1 mt-2">{entry.sideEffects.map(effect => <span key={effect} className="text-xs bg-orange-500/20 text-orange-300 px-2 py-0.5 rounded">{effect}</span>)}</div>}
                            {entry.notes && <div className="text-sm text-gray-400 mt-2 italic">{entry.notes}</div>}
                          </div>
                        </div>
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => { setEditingInjection(entry); setInjectionType(entry.type); setInjectionDose(entry.dose.toString()); setInjectionUnit(entry.unit || 'mg'); setInjectionDate(entry.date); setInjectionRoute(entry.route || 'SubQ'); setInjectionSite(entry.site || 'Stomach'); setInjectionNotes(entry.notes || ''); setSelectedSideEffects(entry.sideEffects || []); setSelectedVialId(entry.vialId ?? null); setShowAddForm(true); }} className="p-2 text-gray-400 hover:text-white hover:bg-slate-600 rounded-lg"><Edit2 className="h-4 w-4" /></button>
                          <button onClick={() => deleteInjection(entry.id)} className="p-2 text-gray-400 hover:text-red-400 hover:bg-slate-600 rounded-lg"><Trash2 className="h-4 w-4" /></button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* JOURNAL TAB — promoted from More for quick access to feelings & side effects */}
        {activeTab === 'journal' && (
          <div key="journal" className="space-y-4 tab-enter">
            {showAddForm && (
              <div className="ui-card p-4">
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

        {/* MORE TAB */}
        {activeTab === 'more' && (
          <div key="more" className="space-y-4 tab-enter">
            <div className="menu-3d flex rounded-xl p-1.5 overflow-x-auto overflow-y-hidden bg-[var(--bg-elevated)] backdrop-blur-sm scroll-smooth" style={{ scrollbarWidth: 'thin' }}>
              {[
                { id: 'profile', icon: User, label: 'Profile' },
                { id: 'body', icon: Ruler, label: 'Body' },
                { id: 'daily', icon: UtensilsCrossed, label: 'Daily' },
                { id: 'calendar', icon: CalendarDays, label: 'Calendar' },
                { id: 'tools', icon: Wrench, label: 'Tools' },
                { id: 'glucose', icon: Droplet, label: 'Glucose' }
              ].map(section => (
                <button
                  key={section.id}
                  ref={el => { moreSectionRefs.current[section.id] = el; }}
                  onClick={() => setActiveMoreSection(section.id)}
                  className={`menu-3d-item flex-1 min-w-[4.5rem] flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl font-medium transition-all text-sm whitespace-nowrap ${activeMoreSection === section.id ? 'menu-3d-item-active bg-accent text-gray-900 shadow-accent/20' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
                >
                  <section.icon className="h-4 w-4 flex-shrink-0" />{section.label}
                </button>
              ))}
            </div>
            {activeMoreSection === 'profile' && (
              <div className="space-y-4">
                <div className="ui-card p-4">
                  <h3 className="text-white font-medium mb-4 flex items-center gap-2"><User className="h-5 w-5 text-gold-400" />Profile & goals</h3>
                  <p className="text-gray-400 text-xs mb-4">Set your goal weight, height (for BMI), and daily hydration goal. These drive progress and reminders.</p>
                  <div className="space-y-4">
                    <div>
                      <label className="text-gray-400 text-sm block mb-1">Goal weight (lbs)</label>
                      <input type="number" min="0" step="1" value={userProfile?.goalWeight ?? 200} onChange={(e) => { const p = { ...userProfile, goalWeight: parseFloat(e.target.value) || 200 }; setUserProfile(p); saveData('health-user-profile', p); }} className="w-full bg-slate-700 text-white rounded-lg px-4 py-2.5" />
                    </div>
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
            {activeMoreSection === 'tools' && (
          <div className="space-y-4">
            {/* Tool Section Selector - 3D */}
            <div className="menu-3d flex rounded-xl p-1.5 overflow-x-auto bg-[var(--bg-elevated)] backdrop-blur-sm">
              {[
                { id: 'calculator', label: 'Calculators' }, 
                { id: 'schedule', label: 'Schedules' }, 
                { id: 'titration', label: 'Titration' }, 
                { id: 'notifications', label: 'Notifications' }, 
                { id: 'vials', label: 'Vials' },
                { id: 'data', label: 'Data' }
              ].map(section => (
                <button key={section.id} onClick={() => setActiveToolSection(section.id)}
                  className={`menu-3d-item flex-1 whitespace-nowrap px-4 py-2 text-sm font-medium rounded-lg transition-all ${activeToolSection === section.id ? 'menu-3d-item-active bg-accent text-gray-900' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}>
                  {section.label}
                </button>
              ))}
            </div>

            {/* Calculators Section */}
            {activeToolSection === 'calculator' && (
              <>
                <div className="ui-card p-4">
                  <h3 className="text-white font-medium mb-4 flex items-center gap-2"><Calculator className="h-5 w-5 text-gold-400" />Dose Calculator</h3>
                  <div className="space-y-3">
                    <div>
                      <label className="text-gray-400 text-sm block mb-1">Concentration (mg/ml)</label>
                      <input type="number" step="0.01" value={calcConcentration} onChange={(e) => setCalcConcentration(e.target.value)} className="w-full bg-slate-700 text-white rounded-lg px-4 py-2" placeholder="e.g., 2.5" />
                    </div>
                    <div>
                      <label className="text-gray-400 text-sm block mb-1">Desired Dose</label>
                      <div className="flex gap-2">
                        <input type="number" step="0.01" value={calcDesiredDose} onChange={(e) => setCalcDesiredDose(e.target.value)} className="flex-1 bg-slate-700 text-white rounded-lg px-4 py-2" placeholder="e.g., 0.5" />
                        <select value={calcDesiredUnit} onChange={(e) => setCalcDesiredUnit(e.target.value)} className="bg-slate-700 text-white rounded-lg px-3 py-2"><option value="mg">mg</option><option value="mcg">mcg</option></select>
                      </div>
                    </div>
                    <button onClick={calculateDose} className="w-full btn-secondary text-white font-medium py-2 rounded-lg transform hover:scale-105 transition-all">Calculate</button>
                    {calcResult && (
                      <div className="bg-slate-700/50 rounded-lg p-4 text-center">
                        <div className="text-2xl font-bold text-green-500">{calcResult.ml} mL</div>
                        <div className="text-gray-400 text-sm">or</div>
                        <div className="text-xl font-bold text-violet-400">{calcResult.units} units</div>
                      </div>
                    )}
                    <div className="pt-2 border-t border-white/5">
                      <button type="button" onClick={() => setShowCalculatorUnitRef(!showCalculatorUnitRef)} className="text-gray-400 hover:text-gold-400 text-xs font-medium flex items-center gap-1">
                        {showCalculatorUnitRef ? 'Hide' : 'Show'} unit reference
                        <ChevronDown className={`h-3.5 w-3.5 transition-transform ${showCalculatorUnitRef ? 'rotate-180' : ''}`} />
                      </button>
                      {showCalculatorUnitRef && (
                        <div className="mt-2 space-y-1 text-sm">
                          <div className="flex justify-between text-gray-400"><span>1 mL</span><span className="text-white">= 100 units</span></div>
                          <div className="flex justify-between text-gray-400"><span>1 mg</span><span className="text-white">= 1000 mcg</span></div>
                          <div className="flex justify-between text-gray-400"><span>0.5 mL</span><span className="text-white">= 50 units</span></div>
                          <div className="flex justify-between text-gray-400"><span>0.1 mL</span><span className="text-white">= 10 units</span></div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="ui-card p-4">
                  <h3 className="text-white font-medium mb-4 flex items-center gap-2"><Activity className="h-5 w-5 text-green-500" />Reconstitution Calculator</h3>
                  <div className="space-y-3">
                    <div>
                      <label className="text-gray-400 text-sm block mb-1">Vial (peptide in vial)</label>
                      <div className="flex gap-2">
                        <input type="number" step="0.1" value={reconPeptideAmount} onChange={(e) => setReconPeptideAmount(e.target.value)} className="flex-1 bg-slate-700 text-white rounded-lg px-4 py-2" placeholder="e.g., 5" title="Total peptide in the vial" />
                        <select value={reconPeptideUnit} onChange={(e) => setReconPeptideUnit(e.target.value)} className="bg-slate-700 text-white rounded-lg px-3 py-2"><option value="mg">mg</option><option value="mcg">mcg</option></select>
                      </div>
                    </div>
                    <div>
                      <label className="text-gray-400 text-sm block mb-1">BAC Water (mL)</label>
                      <input type="number" step="0.1" value={reconWaterAmount} onChange={(e) => setReconWaterAmount(e.target.value)} className="w-full bg-slate-700 text-white rounded-lg px-4 py-2" placeholder="e.g., 2" title="Bacteriostatic water volume added to the vial" />
                    </div>
                    <div>
                      <label className="text-gray-400 text-sm block mb-1">Desired Dose</label>
                      <div className="flex gap-2">
                        <input type="number" step="0.01" value={reconDesiredDose} onChange={(e) => setReconDesiredDose(e.target.value)} className="flex-1 bg-slate-700 text-white rounded-lg px-4 py-2" placeholder="e.g., 250" />
                        <select value={reconDesiredUnit} onChange={(e) => setReconDesiredUnit(e.target.value)} className="bg-slate-700 text-white rounded-lg px-3 py-2"><option value="mcg">mcg</option><option value="mg">mg</option></select>
                      </div>
                    </div>
                    <button onClick={calculateReconstitution} className="w-full bg-green-500 hover:bg-green-600 text-white font-medium py-2 rounded-lg">Calculate</button>
                    {reconResult && (
                      <div className="bg-slate-700/50 rounded-lg p-4 text-center">
                        <div className="text-gray-400 text-xs">Concentration: {reconResult.concentration} mg/mL</div>
                        <div className="text-2xl font-bold text-green-500 mt-1">{reconResult.ml} mL</div>
                        <div className="text-gray-400 text-sm">or</div>
                        <div className="text-xl font-bold text-violet-400">{reconResult.units} units</div>
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
                  <h3 className="text-white font-medium mb-4 flex items-center gap-2"><Bell className="h-5 w-5 text-gold-400" />Add Injection Schedule</h3>
                  <div className="space-y-3">
                    <div>
                      <label className="text-gray-400 text-sm block mb-1">Medication</label>
                      <select value={scheduleMed} onChange={(e) => { setScheduleMed(e.target.value); const med = MEDICATIONS.find(m => m.name === e.target.value); if (med) setScheduleFrequency(med.defaultSchedule); }}
                        className="w-full bg-slate-700 text-white rounded-lg px-4 py-3">
                        {MEDICATIONS.map(med => <option key={med.name} value={med.name}>{med.name}</option>)}
                      </select>
                      {MEDICATION_EFFECT_PROFILES[scheduleMed]?.splitDoseTip && (
                        <div className="mt-2 p-3 rounded-lg bg-slate-700/80 border border-white/5">
                          <p className="text-gray-300 text-xs mb-2">{MEDICATION_EFFECT_PROFILES[scheduleMed].splitDoseTip}</p>
                          <button
                            type="button"
                            onClick={() => { setScheduleType('specific_days'); setSelectedDays([1, 4]); setScheduleFrequency(3); }}
                            className="text-xs font-medium text-gold-400 hover:text-gold-400"
                          >
                            Use twice weekly (split dose) → Mon & Thu
                          </button>
                        </div>
                      )}
                    </div>
                    
                    <div>
                      <label className="text-gray-400 text-sm block mb-1">Start Date</label>
                      <input type="date" value={scheduleStartDate} onChange={(e) => setScheduleStartDate(e.target.value)} 
                        className="w-full bg-slate-700 text-white rounded-lg px-4 py-3" />
                    </div>
                    
                    <div>
                      <label className="text-gray-400 text-sm block mb-1">Schedule Type</label>
                      <div className="flex gap-2">
                        <button 
                          onClick={() => setScheduleType('recurring')}
                          className={`flex-1 py-2 rounded-lg text-sm transition-all ${scheduleType === 'recurring' ? 'bg-accent text-white' : 'bg-slate-700 text-gray-400'}`}
                        >
                          Every X Days
                        </button>
                        <button 
                          onClick={() => setScheduleType('specific_days')}
                          className={`flex-1 py-2 rounded-lg text-sm transition-all ${scheduleType === 'specific_days' ? 'bg-accent text-white' : 'bg-slate-700 text-gray-400'}`}
                        >
                          Specific Days
                        </button>
                      </div>
                    </div>
                    
                    {scheduleType === 'recurring' && (
                      <div>
                        <label className="text-gray-400 text-sm block mb-1">Frequency (days)</label>
                        <input type="number" value={scheduleFrequency} onChange={(e) => setScheduleFrequency(parseInt(e.target.value))} 
                          className="w-full bg-slate-700 text-white rounded-lg px-4 py-3" placeholder="e.g., 7" />
                        <p className="text-gray-500 text-xs mt-1">Inject every {scheduleFrequency} day{scheduleFrequency > 1 ? 's' : ''}</p>
                      </div>
                    )}
                    
                    {scheduleType === 'specific_days' && (
                      <div>
                        <label className="text-gray-400 text-sm block mb-2">Select Days of Week</label>
                        <div className="grid grid-cols-7 gap-2">
                          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day, idx) => (
                            <button
                              key={idx}
                              onClick={() => {
                                if (selectedDays.includes(idx)) {
                                  setSelectedDays(selectedDays.filter(d => d !== idx));
                                } else {
                                  setSelectedDays([...selectedDays, idx].sort());
                                }
                              }}
                              className={`py-2 px-1 rounded-lg text-xs transition-all ${
                                selectedDays.includes(idx) 
                                  ? 'bg-accent text-white font-medium' 
                                  : 'bg-slate-700 text-gray-400'
                              }`}
                            >
                              {day}
                            </button>
                          ))}
                        </div>
                        {selectedDays.length > 0 && (
                          <p className="text-gray-400 text-xs mt-2">
                            Selected: {selectedDays.map(d => ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][d]).join(', ')}
                          </p>
                        )}
                      </div>
                    )}
                    
                    <button onClick={addSchedule} className="w-full bg-accent hover:bg-gold-600 text-white font-medium py-3 rounded-lg">
                      Save Schedule
                    </button>
                  </div>
                </div>

                {schedules.length > 0 && (
                  <div className="ui-card p-4">
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
                              <div className="text-gray-400 text-sm">
                                {schedule.scheduleType === 'specific_days' && schedule.specificDays?.length > 0 
                                  ? `${schedule.specificDays.map(d => ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][d]).join(', ')}`
                                  : `Every ${schedule.frequencyDays} days`}
                              </div>
                              {schedule.startDate && (
                                <div className="text-gray-500 text-xs">Started: {new Date(schedule.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</div>
                              )}
                            </div>
                          </div>
                          <button onClick={() => deleteSchedule(schedule.id)} className="p-2 text-gray-400 hover:text-red-400"><Trash2 className="h-4 w-4" /></button>
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
                    Push Notifications
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
                          {notificationPermission === 'granted' && 'Notifications enabled! You\'ll receive injection reminders.'}
                          {notificationPermission === 'denied' && (Capacitor.isNativePlatform() ? 'Notifications blocked. Enable in device Settings → Apps → PepTalk → Notifications.' : 'Notifications blocked. Enable in browser settings.')}
                          {notificationPermission === 'default' && 'Allow notifications to get injection reminders.'}
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
                      {/* Injection Reminders */}
                      <div className="rounded-xl p-4 border border-white/[0.04] bg-slate-700/40">
                        <div className="flex items-center justify-between mb-3">
                          <div>
                            <div className="text-white font-medium">Injection Reminders</div>
                            <div className="text-gray-400 text-sm">Get notified when injections are due</div>
                          </div>
                          <button
                            onClick={() => updateNotificationSettings({ injectionReminders: !notificationSettings.injectionReminders })}
                            className={`relative w-12 h-6 rounded-full transition-colors ${
                              notificationSettings.injectionReminders ? 'bg-accent' : 'bg-slate-600'
                            }`}
                          >
                            <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                              notificationSettings.injectionReminders ? 'right-1' : 'left-1'
                            }`} />
                          </button>
                        </div>
                        {notificationSettings.injectionReminders && (
                          <div>
                            <label className="text-gray-400 text-sm block mb-1">Reminder Time</label>
                            <input
                              type="time"
                              value={notificationSettings.reminderTime}
                              onChange={(e) => updateNotificationSettings({ reminderTime: e.target.value })}
                              className="w-full bg-slate-600 text-white rounded-lg px-4 py-2"
                            />
                            <p className="text-gray-500 text-xs mt-1">You'll be notified at this time on injection days</p>
                          </div>
                        )}
                      </div>

                      {/* Overdue Alerts */}
                      <div className="rounded-xl p-4 border border-white/[0.04] bg-slate-700/40">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="text-white font-medium">Overdue Alerts</div>
                            <div className="text-gray-400 text-sm">Get alerted when injections are overdue</div>
                          </div>
                          <button
                            onClick={() => updateNotificationSettings({ overdueAlerts: !notificationSettings.overdueAlerts })}
                            className={`relative w-12 h-6 rounded-full transition-colors ${
                              notificationSettings.overdueAlerts ? 'bg-red-500' : 'bg-slate-600'
                            }`}
                          >
                            <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                              notificationSettings.overdueAlerts ? 'right-1' : 'left-1'
                            }`} />
                          </button>
                        </div>
                      </div>

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

                      {/* Test Notification */}
                      <button
                        onClick={() => showNotification({
                          title: '🎉 Test Notification',
                          body: 'Notifications are working! You\'ll receive injection reminders like this.',
                          tag: 'test'
                        })}
                        className="w-full btn-secondary text-white font-medium py-3 rounded-lg transform hover:scale-105 transition-all"
                      >
                        Send Test Notification
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Vials / Inventory Section */}
            {activeToolSection === 'vials' && (
              <div className="space-y-4">
                <div className="ui-card p-4">
                  <h3 className="text-white font-medium mb-4 flex items-center gap-2"><Syringe className="h-5 w-5 text-gold-400" />Vial inventory</h3>
                  <p className="text-gray-400 text-sm mb-4">Reconstitution calculator: enter vial size and bac water (for peptides/hormones that need reconstitution). Pre‑constituted meds (e.g. testosterone in oil): enter total amount only. When you log an injection and choose a vial, the dose is subtracted automatically.</p>
                  <div className="space-y-3">
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
                      <div className="w-20 flex-shrink-0">
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
                        <input type="number" step="0.1" min="0" value={vialConcentrationForMl} onChange={(e) => setVialConcentrationForMl(e.target.value)} className="w-full bg-slate-700 text-white rounded-lg px-4 py-2" placeholder="e.g. 200" />
                        <p className="text-gray-500 text-xs mt-1">Total mg = volume (ml) × concentration. Example: 10 ml × 200 mg/ml = 2000 mg.</p>
                      </div>
                    )}
                    {MEDICATIONS.find(m => m.name === vialMedication)?.preConstituted ? (
                      <p className="text-gray-500 text-xs">Pre-constituted (e.g. in oil). No bac water needed — just total amount in vial.</p>
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
                          reconstitutedDate: vialReconstituted && vialReconstitutedDate ? vialReconstitutedDate : null
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
                      }}
                      className="w-full ui-btn-primary py-2.5"
                    >
                      Add vial
                    </button>
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
                        return (
                          <div key={v.id} className={`flex items-center justify-between rounded-lg p-3 ${isLow ? 'bg-slate-700/50 opacity-70' : 'bg-slate-700/50'}`}>
                            <div>
                              <span className="text-white font-medium">{v.medication}</span>
                              <span className="text-gray-400 text-sm ml-2">{remMg.toFixed(1)} / {totalMg.toFixed(1)} mg</span>
                              {conc > 0 && <span className="text-gray-500 text-xs ml-2">· {conc.toFixed(1)} mg/ml{remMl != null && totalMl != null ? ` · ${remMl.toFixed(1)} / ${totalMl.toFixed(1)} ml` : ''}</span>}
                              {v.expiry && <span className="text-gray-500 text-xs ml-2">· Exp {v.expiry}</span>}
                              {v.reconstitutedDate && <span className="text-gray-500 text-xs ml-2 block">Recon {v.reconstitutedDate}{useBy ? ` · use by ${useBy}` : ''}</span>}
                            </div>
                            <button onClick={() => { const updated = vials.filter(x => x.id !== v.id); setVials(updated); saveData('health-vials', updated); }} className="p-2 text-gray-400 hover:text-red-400 rounded-lg"><Trash2 className="h-4 w-4" /></button>
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
                    {/* Export — choose format then export */}
                    <div className="rounded-xl p-4 border border-white/[0.04] bg-slate-700/40">
                      <h4 className="text-white font-medium mb-2 flex items-center gap-2">
                        <FileDown className="h-5 w-5 text-gold-400" />
                        Export data
                      </h4>
                      <p className="text-gray-400 text-sm mb-3">
                        Choose the type of export you need, then tap Export.
                      </p>
                      <div className="mb-4">
                        <label className="text-gray-400 text-xs block mb-2">Export as</label>
                        <select value={exportFormat} onChange={(e) => setExportFormat(e.target.value)} className="w-full bg-slate-700 text-white rounded-lg px-4 py-3 border border-white/[0.06]">
                          <option value="json">JSON Backup — full backup, import later</option>
                          <option value="csv">CSV — weight & injections (spreadsheets)</option>
                        </select>
                      </div>
                      <button onClick={runExport} className="w-full bg-accent hover:bg-gold-600 text-gray-900 font-medium py-3 rounded-lg flex items-center justify-center gap-2 shadow-accent/20">
                        <FileDown className="h-5 w-5" />
                        {exportFormat === 'json' ? 'Export backup (JSON)' : 'Download CSV'}
                      </button>
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
                          <span className="text-gray-400">Journal entries:</span>
                          <span className="text-white font-medium">{journalEntries.length}</span>
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
                  <div key={idx} className={`min-h-16 p-1 rounded-lg border ${day.isToday ? 'border-accent bg-accent/10' : day.isCurrentMonth ? 'border-slate-700 bg-slate-700/30' : 'border-slate-800 bg-[var(--bg-card)]/20'}`}>
                    <div className={`text-xs ${day.isCurrentMonth ? 'text-white' : 'text-slate-600'}`}>{day.date.getDate()}</div>
                    {day.injections.length > 0 && (
                      <div className="mt-1 space-y-0.5">
                        {day.injections.slice(0, 2).map((inj, i) => (
                          <div key={i} className="text-[10px] px-1 py-0.5 rounded truncate" style={{ backgroundColor: `${getMedicationColor(inj.type)}40`, color: getMedicationColor(inj.type) }}>
                            {inj.dose}{inj.unit}
                          </div>
                        ))}
                        {day.injections.length > 2 && <div className="text-[9px] text-gray-400 px-1">+{day.injections.length - 2}</div>}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="ui-card p-4">
              <h3 className="text-white font-medium mb-3">Adherence Summary</h3>
              <div className="grid grid-cols-2 gap-3">
                {schedules.map(schedule => {
                  const scheduledDays = schedules.filter(s => s.medication === schedule.medication).length;
                  const actualInjections = injectionEntries.filter(inj => inj.type === schedule.medication && parseLocalDate(inj.date).getMonth() === calendarMonth.getMonth()).length;
                  const expectedInjections = Math.ceil(30 / schedule.frequencyDays);
                  const adherence = expectedInjections > 0 ? Math.min(100, Math.round((actualInjections / expectedInjections) * 100)) : 0;
                  return (
                    <div key={schedule.id} className="bg-slate-700/50 rounded-lg p-3">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: getMedicationColor(schedule.medication) }}></div>
                        <span className="text-white text-sm font-medium">{schedule.medication}</span>
                      </div>
                      <div className="text-2xl font-bold text-white">{adherence}%</div>
                      <div className="text-xs text-gray-400">{actualInjections} of ~{expectedInjections} this month</div>
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
      <footer className="py-3 text-center text-gray-500 text-xs border-t border-white/[0.04]">
        PepTalk v{APP_VERSION}
      </footer>
    </div>
  );
};

export default PepTalk;
