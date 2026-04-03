import React, { forwardRef, useMemo } from 'react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import { X, FileDown, BarChart3 } from 'lucide-react';
import {
  buildWeightSeries,
  buildInjectionWeeks,
  buildSleepSeries,
  buildGlucoseDaily,
  buildStepsSeries,
  buildLabSeriesByType,
  buildSideEffectBars,
  buildJournalMoodPie,
  buildMeasurementSeries,
  buildProtocolKpis,
  buildStackSummaryRows,
  buildWeeklyScheduleMatrix,
  buildVialInventoryRows,
} from './lib/graphicalSummaryData.js';

const B = '#cccccc';
const sheetBorder = { borderColor: B };
const axisCommon = { fill: '#334155', fontSize: 10 };
const gridStroke = '#e5e7eb';
const tooltipStyle = {
  backgroundColor: '#ffffff',
  border: `1px solid ${B}`,
  borderRadius: 4,
  fontSize: 11,
};

function fmtLb(n) {
  if (n == null || isNaN(n)) return '—';
  return `${n} lbs`;
}

function SectionBanner({ children, variant = 'navy' }) {
  const bg = variant === 'green' ? 'bg-[#27AE60]' : 'bg-[#0F3460]';
  return (
    <div className={`${bg} text-white text-center font-bold text-[11px] sm:text-xs tracking-wide uppercase py-2 px-2 border border-[#cccccc] border-b-0`}>
      {children}
    </div>
  );
}

function SubBanner({ children }) {
  return (
    <div
      className="text-center text-[10px] sm:text-[11px] py-2 px-3 border border-[#cccccc] border-t-0 border-b-0 bg-[#16213E] text-[#CCCCCC] italic"
      style={{ fontFamily: 'Arial, Helvetica, sans-serif' }}
    >
      {children}
    </div>
  );
}

const WDAY = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const GraphicalSummaryModal = forwardRef(function GraphicalSummaryModal(
  {
    open,
    onClose,
    onDownloadPdf,
    pdfBusy,
    weightEntries,
    injectionEntries,
    sleepEntries,
    glucoseEntries,
    labEntries,
    journalEntries,
    dailyTrackEntries,
    measurementEntries,
    userProfile,
    schedules,
    vials,
  },
  ref
) {
  const weightData = useMemo(() => buildWeightSeries(weightEntries), [weightEntries]);
  const injWeeks = useMemo(() => buildInjectionWeeks(injectionEntries), [injectionEntries]);
  const sleepData = useMemo(() => buildSleepSeries(sleepEntries), [sleepEntries]);
  const glucoseData = useMemo(() => buildGlucoseDaily(glucoseEntries), [glucoseEntries]);
  const stepsData = useMemo(() => buildStepsSeries(dailyTrackEntries), [dailyTrackEntries]);
  const labSeries = useMemo(() => buildLabSeriesByType(labEntries), [labEntries]);
  const sideBars = useMemo(() => buildSideEffectBars(injectionEntries), [injectionEntries]);
  const moodPie = useMemo(() => buildJournalMoodPie(journalEntries), [journalEntries]);
  const waistData = useMemo(() => buildMeasurementSeries(measurementEntries, 'Waist'), [measurementEntries]);
  const kpis = useMemo(() => buildProtocolKpis(weightEntries, userProfile), [weightEntries, userProfile]);
  const stackRows = useMemo(
    () => buildStackSummaryRows(schedules, vials, injectionEntries),
    [schedules, vials, injectionEntries]
  );
  const weekMatrix = useMemo(() => buildWeeklyScheduleMatrix(schedules, injectionEntries), [schedules, injectionEntries]);
  const vialRows = useMemo(() => buildVialInventoryRows(vials), [vials]);

  const hasSteps = stepsData.some((d) => d.steps != null);
  const hasGlucose = glucoseData.some((d) => d.mg != null);

  const goalLine = useMemo(() => {
    const parts = [];
    if (kpis.startWeight != null && kpis.goalWeight != null) {
      parts.push(`Start ${fmtLb(kpis.startWeight)} → goal ${fmtLb(kpis.goalWeight)}`);
    } else if (kpis.goalWeight != null) {
      parts.push(`Goal weight ${fmtLb(kpis.goalWeight)}`);
    }
    if (kpis.currentWeight != null) {
      parts.push(`Current ${fmtLb(kpis.currentWeight)}`);
    }
    if (userProfile?.height != null) {
      parts.push(`Height ${userProfile.height} in`);
    }
    return parts.length ? parts.join(' · ') : 'Log weight and a goal in Tools to see progress tiles.';
  }, [kpis, userProfile]);

  if (!open) return null;

  const thKpi = 'bg-[#D6EAF8] text-[#0F3460] font-bold text-[8px] sm:text-[9px] uppercase text-center px-1 py-2 border border-[#cccccc] leading-tight';
  const tdKpi = 'bg-white text-gray-900 text-center text-[11px] sm:text-sm font-semibold px-1 py-3 border border-[#cccccc]';
  const thStack =
    'bg-[#D5F5E3] text-[#0F3460] font-bold text-[8px] sm:text-[9px] uppercase text-left px-2 py-2 border border-[#cccccc]';
  const tdStack = 'bg-white text-gray-900 text-[9px] sm:text-[10px] px-2 py-2 border border-[#cccccc] align-top leading-snug';
  const tdStackAlt = 'bg-[#F9FAFB] text-gray-900 text-[9px] sm:text-[10px] px-2 py-2 border border-[#cccccc] align-top leading-snug';

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center bg-black/75 p-2 sm:p-3"
      role="dialog"
      aria-modal="true"
      aria-labelledby="graphical-summary-title"
    >
      <div className="relative flex w-full max-w-5xl max-h-[94vh] flex-col rounded-2xl border border-white/10 bg-[var(--bg-elevated)] shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between gap-2 border-b border-white/10 px-4 py-3 shrink-0">
          <div className="flex items-center gap-2 min-w-0">
            <BarChart3 className="h-5 w-5 text-gold-400 shrink-0" />
            <h2 id="graphical-summary-title" className="text-white font-semibold text-sm sm:text-base truncate">
              Protocol-style summary
            </h2>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => onDownloadPdf?.()}
              disabled={pdfBusy}
              className="inline-flex items-center gap-1.5 rounded-lg bg-accent px-3 py-2 text-xs font-semibold text-gray-900 disabled:opacity-50"
            >
              <FileDown className="h-4 w-4" />
              {pdfBusy ? 'Saving…' : 'PDF'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/10"
              aria-label="Close"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="overflow-y-auto flex-1 min-h-0 p-2 sm:p-4 bg-slate-900/40">
          <div
            ref={ref}
            className="mx-auto shadow-lg"
            style={{
              width: '100%',
              maxWidth: 920,
              fontFamily: 'Arial, Helvetica, sans-serif',
              backgroundColor: '#f1f5f9',
              ...sheetBorder,
            }}
          >
            {/* Title strip — matches workbook hero row */}
            <div className="bg-[#1A1A2E] text-white text-center font-bold text-sm sm:text-base md:text-lg py-3 px-4 border border-[#cccccc] border-b-0 tracking-tight">
              PEP TALK — PEPTIDE &amp; INJECTION PROTOCOL SUMMARY
            </div>
            <SubBanner>
              {goalLine}
              <span className="block mt-1 not-italic text-[#94a3b8]">
                Generated {new Date().toLocaleString()} · For personal records only · Not medical advice
              </span>
            </SubBanner>

            {/* KPI row — Start / Goal / To lose / Progress */}
            <div className="grid grid-cols-4 border border-[#cccccc] border-t-0">
              <div className={thKpi}>Start weight</div>
              <div className={thKpi}>Goal weight</div>
              <div className={thKpi}>To lose</div>
              <div className={thKpi}>Lost so far</div>
              <div className={tdKpi}>{fmtLb(kpis.startWeight)}</div>
              <div className={tdKpi}>{fmtLb(kpis.goalWeight)}</div>
              <div className={tdKpi}>{fmtLb(kpis.toLose)}</div>
              <div className={tdKpi}>
                {kpis.lost != null ? `${fmtLb(kpis.lost)}${kpis.lost > 0 ? ' ✓' : ''}` : '—'}
              </div>
            </div>

            <div className="mt-4 border border-[#cccccc]">
              <SectionBanner>Stack summary at a glance</SectionBanner>
              {stackRows.length === 0 ? (
                <div className="bg-[#FEF9E7] text-[#0F3460] text-[10px] sm:text-xs px-3 py-4 text-center border-t border-[#cccccc]">
                  Add schedules (More → Calendar) or log injections / vials to populate this table.
                </div>
              ) : (
                <div className="overflow-x-auto border-t border-[#cccccc]">
                  <table className="w-full border-collapse min-w-[640px]">
                    <thead>
                      <tr>
                        <th className={thStack}>Product</th>
                        <th className={thStack}>Dose</th>
                        <th className={thStack}>Frequency</th>
                        <th className={thStack}>Timing / site</th>
                        <th className={thStack}>Focus</th>
                        <th className={thStack}>Vial</th>
                      </tr>
                    </thead>
                    <tbody>
                      {stackRows.map((row, i) => (
                        <tr key={row.product}>
                          <td className={i % 2 ? tdStackAlt : tdStack}>{row.product}</td>
                          <td className={i % 2 ? tdStackAlt : tdStack}>{row.dose}</td>
                          <td className={i % 2 ? tdStackAlt : tdStack}>{row.frequency}</td>
                          <td className={i % 2 ? tdStackAlt : tdStack}>{row.timing}</td>
                          <td className={i % 2 ? tdStackAlt : tdStack}>{row.purpose}</td>
                          <td className={i % 2 ? tdStackAlt : tdStack}>{row.vialSize}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {weekMatrix.length > 0 && (
              <div className="mt-4 border border-[#cccccc]">
                <SectionBanner>Weekly injection schedule</SectionBanner>
                <div className="overflow-x-auto border-t border-[#cccccc]">
                  <table className="w-full border-collapse min-w-[720px]">
                    <thead>
                      <tr>
                        <th
                          className="bg-[#D6EAF8] text-[#0F3460] font-bold text-[8px] sm:text-[9px] uppercase text-left px-2 py-2 border border-[#cccccc] min-w-[140px]"
                        >
                          Peptide / timing
                        </th>
                        {WDAY.map((d) => (
                          <th
                            key={d}
                            className="bg-[#D6EAF8] text-[#0F3460] font-bold text-[8px] sm:text-[9px] uppercase text-center px-1 py-2 border border-[#cccccc] w-10"
                          >
                            {d}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {weekMatrix.map((row, i) => (
                        <tr key={row.label}>
                          <td
                            className={`${i % 2 ? 'bg-[#F2F2F2]' : 'bg-white'} text-[9px] sm:text-[10px] px-2 py-2 border border-[#cccccc] font-medium text-gray-900`}
                          >
                            {row.label}
                          </td>
                          {row.cells.map((c, j) => (
                            <td
                              key={j}
                              className={`${i % 2 ? 'bg-[#F2F2F2]' : 'bg-white'} text-center text-xs border border-[#cccccc] py-2 ${
                                c === '✓' ? 'text-[#27AE60] font-bold' : 'text-gray-400'
                              }`}
                            >
                              {c}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <p className="text-[9px] text-[#0F3460] bg-[#FEF9E7] px-3 py-2 border-t border-[#cccccc] leading-relaxed">
                  ✓ = day included in your saved schedule (specific days or preferred day for recurring). Update schedules under{' '}
                  <strong>More → Calendar</strong> to match your protocol.
                </p>
              </div>
            )}

            {vialRows.length > 0 && (
              <div className="mt-4 border border-[#cccccc]">
                <SectionBanner variant="green">Vial inventory (no pricing)</SectionBanner>
                <div className="overflow-x-auto border-t border-[#cccccc]">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr>
                        <th className={thStack}>Product</th>
                        <th className={thStack}>Remaining</th>
                        <th className={thStack}>Total size</th>
                        <th className={thStack}>Notes</th>
                      </tr>
                    </thead>
                    <tbody>
                      {vialRows.map((row, i) => (
                        <tr key={`${row.product}-${i}`}>
                          <td className={i % 2 ? tdStackAlt : tdStack}>{row.product}</td>
                          <td className={i % 2 ? tdStackAlt : tdStack}>{row.remaining}</td>
                          <td className={i % 2 ? tdStackAlt : tdStack}>{row.total}</td>
                          <td className={i % 2 ? tdStackAlt : tdStack}>{row.notes}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            <div className="mt-4 border border-[#cccccc]">
              <SectionBanner>Reconstitution reminders</SectionBanner>
              <div className="bg-white text-[9px] sm:text-[10px] text-gray-800 px-3 sm:px-4 py-3 border-t border-[#cccccc] space-y-1.5 leading-relaxed">
                <p className="font-bold text-[#0F3460] text-[10px] uppercase tracking-wide">General steps (all peptides)</p>
                <p>
                  <strong>1.</strong> Wipe the peptide vial stopper and BAC water vial with alcohol and let dry.
                </p>
                <p>
                  <strong>2.</strong> Draw the required BAC water with a sterile syringe.
                </p>
                <p>
                  <strong>3.</strong> Inject BAC slowly down the inside wall of the peptide vial (do not spray forcefully onto powder).
                </p>
                <p>
                  <strong>4.</strong> Gently swirl until dissolved — <strong>never shake</strong>.
                </p>
                <p>
                  <strong>5.</strong> Store reconstituted vials refrigerated per product guidance; label with date.
                </p>
                <p>
                  <strong>6.</strong> Allow the vial to warm toward room temperature before injecting if your protocol calls for it.
                </p>
              </div>
            </div>

            <div className="mt-5 border border-[#cccccc]">
              <SectionBanner>Tracking charts</SectionBanner>
              <p className="bg-[#FDEDEC] text-[#0F3460] text-[9px] sm:text-[10px] px-3 py-2 border-b border-[#cccccc]">
                Trends from your PepTalk logs (same data as before, worksheet-style frames).
              </p>

              <div className="p-3 sm:p-4 space-y-4 bg-[#f8fafc]">
                {[
                  {
                    title: 'Weight (lbs)',
                    empty: weightData.length === 0,
                    node: (
                      <div className="h-[220px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart data={weightData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} />
                            <XAxis dataKey="label" tick={axisCommon} stroke="#94a3b8" />
                            <YAxis tick={axisCommon} stroke="#94a3b8" width={36} domain={['auto', 'auto']} />
                            <Tooltip contentStyle={tooltipStyle} />
                            <Line type="monotone" dataKey="w" name="Weight" stroke="#0F3460" strokeWidth={2} dot={false} />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                    ),
                  },
                  {
                    title: 'Injections per week',
                    empty: injWeeks.every((w) => w.count === 0),
                    node: (
                      <div className="h-[220px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={injWeeks} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} />
                            <XAxis dataKey="label" tick={axisCommon} stroke="#94a3b8" />
                            <YAxis tick={axisCommon} stroke="#94a3b8" width={28} allowDecimals={false} />
                            <Tooltip contentStyle={tooltipStyle} />
                            <Bar dataKey="count" name="Injections" fill="#27AE60" radius={[2, 2, 0, 0]} />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    ),
                  },
                  {
                    title: 'Sleep (hours)',
                    empty: sleepData.length === 0,
                    node: (
                      <div className="h-[220px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={sleepData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} />
                            <XAxis dataKey="label" tick={axisCommon} stroke="#94a3b8" />
                            <YAxis tick={axisCommon} stroke="#94a3b8" width={28} domain={[0, 14]} />
                            <Tooltip contentStyle={tooltipStyle} />
                            <Bar dataKey="hours" name="Hours" fill="#6366f1" radius={[2, 2, 0, 0]} />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    ),
                  },
                  {
                    title: 'Glucose — daily average (mg/dL)',
                    empty: !hasGlucose,
                    node: (
                      <div className="h-[220px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart data={glucoseData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} />
                            <XAxis dataKey="label" tick={axisCommon} stroke="#94a3b8" />
                            <YAxis tick={axisCommon} stroke="#94a3b8" width={36} domain={['auto', 'auto']} />
                            <Tooltip contentStyle={tooltipStyle} />
                            <Line type="monotone" dataKey="mg" name="Glucose" stroke="#E94560" strokeWidth={2} connectNulls dot={{ r: 2 }} />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                    ),
                  },
                  {
                    title: 'Steps (logged days)',
                    empty: !hasSteps,
                    node: (
                      <div className="h-[220px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={stepsData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} />
                            <XAxis dataKey="label" tick={axisCommon} stroke="#94a3b8" />
                            <YAxis tick={axisCommon} stroke="#94a3b8" width={40} />
                            <Tooltip contentStyle={tooltipStyle} />
                            <Bar dataKey="steps" name="Steps" fill="#0ea5e9" radius={[2, 2, 0, 0]} />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    ),
                  },
                  {
                    title: 'Waist measurement',
                    empty: waistData.length === 0,
                    node: (
                      <div className="h-[200px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart data={waistData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} />
                            <XAxis dataKey="label" tick={axisCommon} stroke="#94a3b8" />
                            <YAxis tick={axisCommon} stroke="#94a3b8" width={36} domain={['auto', 'auto']} />
                            <Tooltip contentStyle={tooltipStyle} />
                            <Line type="monotone" dataKey="v" name="Waist" stroke="#9333ea" strokeWidth={2} dot={{ r: 2 }} />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                    ),
                  },
                ].map((block) => (
                  <div key={block.title} className="border border-[#cccccc] bg-white shadow-sm">
                    <div className="bg-[#F2F2F2] text-[#0F3460] font-bold text-[10px] uppercase px-3 py-1.5 border-b border-[#cccccc]">
                      {block.title}
                    </div>
                    {block.empty ? (
                      <p className="text-gray-500 text-xs py-10 text-center">No data yet</p>
                    ) : (
                      block.node
                    )}
                  </div>
                ))}

                {labSeries.map(({ type, data }) => (
                  <div key={type} className="border border-[#cccccc] bg-white shadow-sm">
                    <div className="bg-[#F2F2F2] text-[#0F3460] font-bold text-[10px] uppercase px-3 py-1.5 border-b border-[#cccccc]">
                      Lab — {type}
                    </div>
                    {data.length === 0 ? (
                      <p className="text-gray-500 text-xs py-10 text-center">No data yet</p>
                    ) : (
                      <div className="h-[200px] w-full p-1">
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} />
                            <XAxis dataKey="label" tick={axisCommon} stroke="#94a3b8" />
                            <YAxis tick={axisCommon} stroke="#94a3b8" width={40} domain={['auto', 'auto']} />
                            <Tooltip contentStyle={tooltipStyle} />
                            <Line type="monotone" dataKey="value" name={type} stroke="#0891b2" strokeWidth={2} dot={{ r: 2 }} />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                    )}
                  </div>
                ))}

                <div className="border border-[#cccccc] bg-white shadow-sm">
                  <div className="bg-[#F2F2F2] text-[#0F3460] font-bold text-[10px] uppercase px-3 py-1.5 border-b border-[#cccccc]">
                    Side effect intensity (avg 1–5, recent)
                  </div>
                  {sideBars.length === 0 ? (
                    <p className="text-gray-500 text-xs py-10 text-center">No data yet</p>
                  ) : (
                    <div className="w-full p-1" style={{ height: Math.min(320, 40 + sideBars.length * 22) }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart layout="vertical" data={sideBars} margin={{ top: 8, right: 16, left: 4, bottom: 8 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} horizontal={false} />
                          <XAxis type="number" domain={[0, 5]} tick={axisCommon} stroke="#94a3b8" />
                          <YAxis type="category" dataKey="name" width={100} tick={axisCommon} stroke="#94a3b8" />
                          <Tooltip contentStyle={tooltipStyle} />
                          <Bar dataKey="avg" name="Avg" fill="#F5A623" radius={[0, 2, 2, 0]} barSize={14} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  )}
                </div>

                <div className="border border-[#cccccc] bg-white shadow-sm">
                  <div className="bg-[#F2F2F2] text-[#0F3460] font-bold text-[10px] uppercase px-3 py-1.5 border-b border-[#cccccc]">
                    Journal mood mix
                  </div>
                  {moodPie.length === 0 ? (
                    <p className="text-gray-500 text-xs py-10 text-center">No data yet</p>
                  ) : (
                    <div className="h-[240px] w-full p-1">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie data={moodPie} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={78} label>
                            {moodPie.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.fill} />
                            ))}
                          </Pie>
                          <Tooltip contentStyle={tooltipStyle} />
                          <Legend wrapperStyle={{ fontSize: 11, color: '#334155' }} />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

export default GraphicalSummaryModal;
