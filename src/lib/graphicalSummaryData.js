/** Pure builders for graphical summary charts (no React). */

import { MEDICATION_EFFECT_PROFILES } from '../medicationInsights.js';

function parseLocalDate(ds) {
  const p = String(ds).slice(0, 10).split('-').map(Number);
  if (p.length < 3) return 0;
  return new Date(p[0], p[1] - 1, p[2]).getTime();
}

/** Mon-first column index 0..6 from calendar weekday 0=Sun … 6=Sat */
export function jsWeekdayToMonIndex(d) {
  const n = Number(d);
  if (n === 0) return 6;
  if (n >= 1 && n <= 6) return n - 1;
  return 0;
}

export function formatScheduleSummary(schedule) {
  if (!schedule) return '—';
  if (schedule.scheduleType === 'specific_days' && Array.isArray(schedule.specificDays) && schedule.specificDays.length > 0) {
    const names = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    return schedule.specificDays.map((day) => names[day]).join(', ');
  }
  const n = Number(schedule.frequencyDays);
  if (n > 0) return `Every ${n} day${n === 1 ? '' : 's'}`;
  return '—';
}

export function buildProtocolKpis(weightEntries, userProfile) {
  const sorted = [...(weightEntries || [])]
    .filter((e) => e?.date && e.weight != null && !isNaN(Number(e.weight)))
    .sort((a, b) => String(a.date).localeCompare(String(b.date)));
  const start = sorted.length ? Number(sorted[0].weight) : null;
  const current = sorted.length ? Number(sorted[sorted.length - 1].weight) : null;
  const g = userProfile?.goalWeight != null && !isNaN(Number(userProfile.goalWeight)) ? Number(userProfile.goalWeight) : null;
  const toLose = start != null && g != null ? Math.max(0, Math.round((start - g) * 10) / 10) : null;
  const lost = start != null && current != null ? Math.max(0, Math.round((start - current) * 10) / 10) : null;
  return { startWeight: start, currentWeight: current, goalWeight: g, toLose, lost };
}

function calendarDateFromEntry(ds) {
  const p = String(ds).slice(0, 10).split('-').map(Number);
  if (p.length < 3) return null;
  return new Date(p[0], p[1] - 1, p[2]);
}

/** BMI category label (same bands as Summary). */
export function getBmiCategoryLabel(bmiStr) {
  const b = Number(bmiStr);
  if (bmiStr == null || bmiStr === '' || isNaN(b)) return null;
  if (b < 18.5) return 'Underweight';
  if (b < 25) return 'Normal';
  if (b < 30) return 'Overweight';
  return 'Obese';
}

/**
 * Full weight statistics for protocol summary (all logged weights; mirrors Summary-style stats).
 */
export function buildProtocolWeightStats(weightEntries, userProfile) {
  const sorted = [...(weightEntries || [])]
    .filter((e) => e?.date && e.weight != null && !isNaN(Number(e.weight)))
    .sort((a, b) => String(a.date).localeCompare(String(b.date)) || (Number(a.id) || 0) - (Number(b.id) || 0));
  if (sorted.length === 0) return null;

  const oldest = sorted[0];
  const latest = sorted[sorted.length - 1];
  const current = Number(latest.weight);
  const first = Number(oldest.weight);
  const change = current - first;
  const percentChange = first !== 0 ? (change / first) * 100 : 0;

  const height = userProfile?.height != null && !isNaN(Number(userProfile.height)) ? Number(userProfile.height) : null;
  const bmi = height ? ((current / (height * height)) * 703).toFixed(1) : null;

  const goal = userProfile?.goalWeight != null && !isNaN(Number(userProfile.goalWeight)) ? Number(userProfile.goalWeight) : null;
  const toGoal = goal != null ? current - goal : null;

  const firstD = calendarDateFromEntry(oldest.date);
  const lastD = calendarDateFromEntry(latest.date);
  const msWeek = 7 * 24 * 60 * 60 * 1000;
  const weeks = firstD && lastD ? Math.max(1, (lastD.getTime() - firstD.getTime()) / msWeek) : 1;
  const weeklyAvg = change / weeks;

  let estimatedGoalDate = null;
  if (weeklyAvg < 0 && toGoal != null && toGoal > 0) {
    const weeksToGoal = toGoal / Math.abs(weeklyAvg);
    const d = new Date();
    d.setDate(d.getDate() + weeksToGoal * 7);
    estimatedGoalDate = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  }

  const lastWeighIn = String(latest.date).slice(0, 10);

  return {
    current: current.toFixed(1),
    change: change.toFixed(1),
    percentChange: percentChange.toFixed(1),
    weeklyAvg: weeklyAvg.toFixed(1),
    toGoal: toGoal != null ? toGoal.toFixed(1) : null,
    bmi,
    bmiCategory: bmi != null ? getBmiCategoryLabel(bmi) : null,
    estimatedGoalDate,
    lastWeighIn,
    weightEntryCount: sorted.length,
  };
}

/** Injection activity lines for protocol summary. */
export function buildProtocolActivityStats(injectionEntries) {
  const valid = (injectionEntries || []).filter((e) => e?.date);
  const meds = new Set(valid.map((e) => e.type).filter(Boolean));
  const byDate = [...valid].sort((a, b) => String(b.date).localeCompare(String(a.date)));
  const last = byDate[0];
  return {
    injectionCount: valid.length,
    medicationCount: meds.size,
    lastInjection: last?.date ? String(last.date).slice(0, 10) : null,
  };
}

export function buildStackSummaryRows(schedules, vials, injectionEntries, limit = 16) {
  const meds = [];
  const seen = new Set();
  for (const s of schedules || []) {
    if (s?.medication && !seen.has(s.medication)) {
      seen.add(s.medication);
      meds.push(s.medication);
    }
  }
  for (const v of vials || []) {
    if (v?.medication && !seen.has(v.medication)) {
      seen.add(v.medication);
      meds.push(v.medication);
    }
  }
  if (meds.length === 0) {
    const inj = [...(injectionEntries || [])].sort((a, b) => parseLocalDate(b.date) - parseLocalDate(a.date)).slice(0, 50);
    for (const e of inj) {
      if (e?.type && !seen.has(e.type)) {
        seen.add(e.type);
        meds.push(e.type);
      }
    }
  }
  return meds.slice(0, limit).map((med) => {
    const schedule = (schedules || []).find((s) => s.medication === med);
    const lasts = (injectionEntries || [])
      .filter((e) => e.type === med)
      .sort((a, b) => parseLocalDate(b.date) - parseLocalDate(a.date));
    const last = lasts[0];
    const dose =
      last != null && last.dose != null && !isNaN(Number(last.dose))
        ? `${last.dose}${last.unit ? ` ${last.unit}` : ' mg'}`
        : '—';
    const vial = (vials || []).find((vv) => vv.medication === med);
    let vialSize = '—';
    if (vial && vial.totalMg != null && !isNaN(Number(vial.totalMg))) {
      vialSize = `${Number(vial.totalMg)} mg vial`;
      if (vial.concentration != null && !isNaN(Number(vial.concentration))) {
        vialSize += ` (${Number(vial.concentration).toFixed(1)} mg/ml)`;
      }
    }
    const profile = MEDICATION_EFFECT_PROFILES[med];
    const purpose = profile?.effects?.[0] ?? '—';
    const timing = last != null ? [last.route, last.site].filter(Boolean).join(' · ') || '—' : '—';
    return {
      product: med,
      dose,
      frequency: formatScheduleSummary(schedule),
      timing,
      purpose,
      vialSize,
    };
  });
}

/**
 * Weekly grid for protocol summary.
 *
 * **Rows:** Every medication that has either a Calendar schedule OR at least one injection log.
 *
 * **Checkmarks:**
 * - If you saved a schedule (More → Calendar): ✓ = that plan — either every day in `specificDays`,
 *   or for “recurring / every N days” only the **preferred weekday** (one ✓), not every actual pin.
 * - If there is **no** schedule for a med but you have injections: ✓ = weekdays you **actually logged**
 *   an injection in the last `lookbackDays` (default 56), so ad-hoc logging still shows up.
 */
export function buildWeeklyScheduleMatrix(schedules, injectionEntries, options = {}) {
  const lookbackDays = typeof options.lookbackDays === 'number' ? options.lookbackDays : 56;
  const rows = [];

  const byMed = {};
  const scheduleOrder = [];
  for (const s of schedules || []) {
    if (!s?.medication) continue;
    if (!byMed[s.medication]) {
      byMed[s.medication] = s;
      scheduleOrder.push(s.medication);
    }
  }

  const injMeds = [...new Set((injectionEntries || []).map((e) => e.type).filter(Boolean))].sort((a, b) =>
    a.localeCompare(b)
  );

  const orderedMeds = [];
  const seen = new Set();
  for (const m of scheduleOrder) {
    if (!seen.has(m)) {
      seen.add(m);
      orderedMeds.push(m);
    }
  }
  for (const m of injMeds) {
    if (!seen.has(m)) {
      seen.add(m);
      orderedMeds.push(m);
    }
  }

  const cutoff = new Date();
  cutoff.setHours(0, 0, 0, 0);
  cutoff.setDate(cutoff.getDate() - lookbackDays);
  const cutoffMs = cutoff.getTime();

  for (const med of orderedMeds) {
    const schedule = byMed[med];
    const lasts = (injectionEntries || [])
      .filter((e) => e.type === med)
      .sort((a, b) => parseLocalDate(b.date) - parseLocalDate(a.date));
    const last = lasts[0];
    const dosePart = last != null && last.dose != null ? `${last.dose}${last.unit ? ` ${last.unit}` : ''}` : '';
    const routePart = last?.route || '';
    const label = [med, dosePart, routePart].filter(Boolean).join(' · ') || med;

    const cells = Array(7).fill('—');

    if (schedule) {
      if (schedule.scheduleType === 'specific_days' && schedule.specificDays?.length) {
        for (const d of schedule.specificDays) {
          const idx = jsWeekdayToMonIndex(d);
          if (idx >= 0 && idx < 7) cells[idx] = '✓';
        }
      } else {
        const pd = schedule.preferredDay != null ? Number(schedule.preferredDay) : 0;
        const idx = jsWeekdayToMonIndex(pd);
        if (idx >= 0 && idx < 7) cells[idx] = '✓';
      }
    } else {
      const weekdaysHit = new Set();
      const recentInWindow = lasts.filter((e) => parseLocalDate(e.date) >= cutoffMs);
      for (const e of recentInWindow) {
        const p = String(e.date).slice(0, 10).split('-').map(Number);
        if (p.length < 3) continue;
        const dt = new Date(p[0], p[1] - 1, p[2]);
        weekdaysHit.add(dt.getDay());
      }
      weekdaysHit.forEach((dayJs) => {
        const idx = jsWeekdayToMonIndex(dayJs);
        if (idx >= 0 && idx < 7) cells[idx] = '✓';
      });
    }

    rows.push({ label, cells });
  }

  return rows;
}

export function buildVialInventoryRows(vials) {
  return (vials || []).map((v) => ({
    product: v.medication || '—',
    remaining:
      v.remainingMg != null && !isNaN(Number(v.remainingMg)) ? `${Number(v.remainingMg).toFixed(1)} mg` : '—',
    total: v.totalMg != null && !isNaN(Number(v.totalMg)) ? `${Number(v.totalMg).toFixed(1)} mg` : '—',
    notes: [v.expiry ? `Exp ${v.expiry}` : null, v.reconstitutedDate ? `Recon ${v.reconstitutedDate}` : null]
      .filter(Boolean)
      .join(' · ') || '—',
  }));
}

export function buildWeightSeries(weightEntries, limit = 120) {
  if (!Array.isArray(weightEntries) || !weightEntries.length) return [];
  const sorted = [...weightEntries]
    .filter((e) => e?.date && e.weight != null && !isNaN(Number(e.weight)))
    .sort((a, b) => String(a.date).localeCompare(String(b.date)));
  return sorted.slice(-limit).map((e) => ({
    label: String(e.date).slice(5).replace('-', '/'),
    w: Number(Number(e.weight).toFixed(1)),
  }));
}

export function buildInjectionWeeks(injectionEntries, numWeeks = 14) {
  const now = new Date();
  now.setHours(12, 0, 0, 0);
  const start = new Date(now);
  start.setDate(start.getDate() - (numWeeks - 1) * 7);
  const day = start.getDay();
  const toMon = day === 0 ? -6 : 1 - day;
  start.setDate(start.getDate() + toMon);
  const weeks = [];
  for (let i = 0; i < numWeeks; i++) {
    const ws = new Date(start);
    ws.setDate(start.getDate() + i * 7);
    const we = new Date(ws);
    we.setDate(ws.getDate() + 6);
    const wsStr = `${ws.getFullYear()}-${String(ws.getMonth() + 1).padStart(2, '0')}-${String(ws.getDate()).padStart(2, '0')}`;
    const weStr = `${we.getFullYear()}-${String(we.getMonth() + 1).padStart(2, '0')}-${String(we.getDate()).padStart(2, '0')}`;
    const count = (injectionEntries || []).filter((e) => {
      const d = String(e.date).slice(0, 10);
      return d >= wsStr && d <= weStr;
    }).length;
    weeks.push({
      label: `${ws.getMonth() + 1}/${ws.getDate()}`,
      count,
    });
  }
  return weeks;
}

export function buildSleepSeries(sleepEntries, limit = 28) {
  return [...(sleepEntries || [])]
    .filter((e) => e?.date && e.hours != null && !isNaN(Number(e.hours)))
    .sort((a, b) => String(a.date).localeCompare(String(b.date)))
    .slice(-limit)
    .map((e) => ({
      label: String(e.date).slice(5),
      hours: Number(e.hours),
      q: e.quality ?? null,
    }));
}

export function buildGlucoseDaily(glucoseEntries, days = 14) {
  const now = new Date();
  const points = [];
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const ds = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    const dayE = (glucoseEntries || []).filter((e) => String(e.date).slice(0, 10) === ds);
    const avg = dayE.length ? dayE.reduce((s, e) => s + Number(e.value), 0) / dayE.length : null;
    points.push({
      label: `${d.getMonth() + 1}/${d.getDate()}`,
      mg: avg != null ? Math.round(avg) : null,
    });
  }
  return points;
}

export function buildStepsSeries(dailyTrackEntries, days = 21) {
  const now = new Date();
  const out = [];
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const ds = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    const row = (dailyTrackEntries || []).find((e) => e.date === ds);
    out.push({
      label: `${d.getMonth() + 1}/${d.getDate()}`,
      steps: row?.steps != null && Number(row.steps) > 0 ? Number(row.steps) : null,
    });
  }
  return out;
}

export function buildLabSeriesByType(labEntries, maxTypes = 4, minPoints = 2) {
  const by = {};
  (labEntries || []).forEach((e) => {
    if (!e?.type || e.value == null || isNaN(Number(e.value))) return;
    if (!by[e.type]) by[e.type] = [];
    by[e.type].push({ date: String(e.date).slice(0, 10), v: Number(e.value) });
  });
  return Object.entries(by)
    .filter(([, rows]) => rows.length >= minPoints)
    .sort((a, b) => b[1].length - a[1].length)
    .slice(0, maxTypes)
    .map(([type, rows]) => ({
      type,
      data: rows
        .sort((a, b) => a.date.localeCompare(b.date))
        .map((r) => ({ label: r.date.slice(5), value: r.v })),
    }));
}

export function buildSideEffectBars(injectionEntries, days = 45) {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - days);
  cutoff.setHours(0, 0, 0, 0);
  const recent = (injectionEntries || []).filter((e) => {
    const ds = String(e.date).slice(0, 10);
    const p = ds.split('-').map(Number);
    if (p.length < 3) return false;
    return new Date(p[0], p[1] - 1, p[2]) >= cutoff;
  });
  const agg = {};
  recent.forEach((inj) => {
    (inj.sideEffects || []).forEach((fx) => {
      const sev = inj.sideEffectSeverity?.[fx] ?? 3;
      if (!agg[fx]) agg[fx] = { sum: 0, n: 0 };
      agg[fx].sum += sev;
      agg[fx].n += 1;
    });
  });
  return Object.entries(agg)
    .map(([name, { sum, n }]) => ({ name, avg: Math.round((sum / n) * 10) / 10 }))
    .sort((a, b) => b.avg - a.avg)
    .slice(0, 12);
}

export function buildJournalMoodPie(journalEntries) {
  const counts = { happy: 0, neutral: 0, sad: 0, other: 0 };
  (journalEntries || []).forEach((e) => {
    const m = e.mood || 'other';
    if (m in counts && m !== 'other') counts[m]++;
    else counts.other++;
  });
  return [
    { name: 'Great', value: counts.happy, fill: '#22c55e' },
    { name: 'Okay', value: counts.neutral, fill: '#94a3b8' },
    { name: 'Rough', value: counts.sad, fill: '#eab308' },
    { name: 'Other', value: counts.other, fill: '#64748b' },
  ].filter((x) => x.value > 0);
}

export function buildMeasurementSeries(measurementEntries, type = 'Waist', limit = 80) {
  return [...(measurementEntries || [])]
    .filter((e) => e.type === type && e.value != null && !isNaN(Number(e.value)))
    .sort((a, b) => String(a.date).localeCompare(String(b.date)))
    .slice(-limit)
    .map((e) => ({ label: String(e.date).slice(5), v: Number(e.value) }));
}
