/**
 * Medication-specific effect profiles and phase timelines for Insights.
 * Keys must match MEDICATIONS[].name in App.jsx exactly.
 * Fallback: if a medication has no entry here, App uses category-based EFFECT_PROFILES and PHASE_TIMELINES.
 */

// Shared phase styling (reuse for consistency)
const phaseStyle = (name, icon, color, bg, border) => ({
  name,
  icon,
  color: `text-${color}-400`,
  bgColor: `bg-${color}-500/10`,
  borderColor: `border-${color}-500/30`,
});

export const MEDICATION_EFFECT_PROFILES = {
  'Semaglutide': {
    effects: ['Appetite suppression', 'Blood sugar control', 'Weight loss', 'Gastric emptying delay'],
    sideEffects: ['Nausea', 'Constipation', 'Fatigue', 'Heartburn', 'Vomiting'],
    peakEffects: 'Peak blood levels around 1–3 days after injection; strongest appetite suppression days 2–4',
    steadyState: '4–5 weeks of weekly dosing to reach steady state'
  },
  'Rybelsus (Oral Semaglutide)': {
    effects: ['Appetite suppression', 'Blood sugar control', 'Weight loss', 'Gastric emptying delay'],
    sideEffects: ['Nausea', 'Constipation', 'Diarrhea', 'Heartburn', 'Decreased appetite'],
    peakEffects: 'Peak blood levels 1–4 hours after morning dose; take on empty stomach, wait 30 min before eating',
    steadyState: '4–5 weeks of daily dosing to reach steady state'
  },
  'Tirzepatide': {
    effects: ['GLP-1 and GIP dual action', 'Appetite suppression', 'Insulin sensitivity', 'Weight loss'],
    sideEffects: ['Nausea', 'Diarrhea', 'Decreased appetite', 'Injection site reactions'],
    peakEffects: 'Peak concentration ~2–3 days; maximum effect on appetite and glucose in first half of the week',
    steadyState: '4–5 weeks of weekly dosing for steady state'
  },
  'Liraglutide': {
    effects: ['Daily GLP-1 action', 'Appetite control', 'Blood sugar management', 'Weight loss'],
    sideEffects: ['Nausea', 'Diarrhea', 'Constipation', 'Headache'],
    peakEffects: 'Peak effect within 8–12 hours of injection; effects last through the day',
    steadyState: 'About 2–3 days of daily dosing to reach steady state'
  },
  'Dulaglutide': {
    effects: ['Once-weekly GLP-1', 'Appetite suppression', 'Blood sugar control', 'Weight loss'],
    sideEffects: ['Nausea', 'Diarrhea', 'Abdominal pain', 'Decreased appetite'],
    peakEffects: 'Peak levels 24–72 hours after injection; strongest effects mid-week',
    steadyState: '2–4 weeks of weekly dosing for steady state'
  },
  'Retatrutide': {
    effects: ['GLP-1 / GIP / Glucagon triple agonist', 'Appetite control', 'Metabolic boost', 'Fat loss'],
    sideEffects: ['Nausea', 'Increased heart rate', 'Fatigue', 'GI upset'],
    peakEffects: 'Peak effect 1–3 days post-injection; strong appetite suppression through the week',
    steadyState: '4–6 weeks of weekly dosing for full effect',
    splitDoseTip: 'Half dose twice per week (e.g. 2mg Mon & 2mg Thu instead of 4mg once) can give steadier levels and sometimes better tolerability.'
  },
  'Testosterone Cypionate': {
    effects: ['Sustained testosterone release', 'Muscle mass', 'Energy', 'Libido', 'Mood'],
    sideEffects: ['Injection site pain', 'Acne', 'Mood swings', 'Elevated hematocrit'],
    peakEffects: 'Peak blood levels ~24–48 hours; ester cleaves slowly over ~7–8 days',
    steadyState: '4–6 weeks of weekly injections for stable levels',
    splitDoseTip: 'Half dose twice per week (e.g. Mon & Thu) often gives steadier levels, less E2 spike, and sometimes lower hematocrit.'
  },
  'Testosterone Enanthate': {
    effects: ['Sustained testosterone release', 'Anabolic support', 'Energy', 'Libido'],
    sideEffects: ['Injection site pain', 'Acne', 'Mood changes', 'Hair loss in some'],
    peakEffects: 'Peak levels ~2–3 days; slightly shorter ester than cypionate',
    steadyState: '4–5 weeks of weekly dosing for steady state',
    splitDoseTip: 'Half dose twice per week (e.g. Mon & Thu) often gives steadier levels and smoother mood/energy.'
  },
  'HCG': {
    effects: ['LH-like stimulation', 'Testosterone support', 'Fertility', 'Testicular function'],
    sideEffects: ['Injection site reactions', 'Headache', 'Fatigue', 'Mood changes'],
    peakEffects: 'Peak effect within 24–48 hours; typically dosed 2–3× per week',
    steadyState: '1–2 weeks of consistent dosing for stable effect'
  },
  'BPC-157': {
    effects: ['Tissue repair', 'Gut healing', 'Tendon/ligament support', 'Anti-inflammatory'],
    sideEffects: ['Rare; injection site discomfort possible'],
    peakEffects: 'Peak activity within 1–2 hours; healing effects build over days to weeks',
    steadyState: 'Often used in 4–6 week cycles; daily or EOD dosing'
  },
  'TB-500': {
    effects: ['Tissue repair', 'Angiogenesis', 'Flexibility', 'Recovery'],
    sideEffects: ['Generally well tolerated', 'Injection site reactions possible'],
    peakEffects: 'Long half-life; peak effect within 24 hours; benefits accumulate over weeks',
    steadyState: 'Loading phase 2–4 weeks, then maintenance 1–2× per week'
  },
  'Ipamorelin': {
    effects: ['Growth hormone release', 'Fat loss', 'Sleep', 'Recovery'],
    sideEffects: ['Hunger increase', 'Flushing', 'Mild water retention'],
    peakEffects: 'GH pulse within ~1 hour; short-lived; best taken fasted before bed',
    steadyState: 'No true steady state; effect is per-dose pulse'
  },
  'CJC-1295': {
    effects: ['Sustained GH release', 'Fat loss', 'Recovery', 'Sleep quality'],
    sideEffects: ['Flushing', 'Hunger', 'Water retention', 'Numbness/tingling'],
    peakEffects: 'Peak GH release 2–4 hours; elevated GH for several hours',
    steadyState: 'Often dosed 1–2× per week; effects build over weeks'
  },
  'Tesamorelin': {
    effects: ['GH release', 'Visceral fat reduction', 'Lipid support'],
    sideEffects: ['Injection site reactions', 'Joint pain', 'Fluid retention'],
    peakEffects: 'Rapid peak (~15–30 min); short half-life; once-daily injection. Example: 10 mg vial + 2 mL BAC → 5 mg/mL; 18 U‑100 units ≈ 0.9 mg drawn (protocols often round to ~1 mg).',
    steadyState: 'Daily dosing; full body composition effects over months'
  },
  'Sermorelin': {
    effects: ['Natural GH pulse', 'Recovery', 'Sleep', 'Body composition'],
    sideEffects: ['Injection site reactions', 'Flushing', 'Hunger'],
    peakEffects: 'Very short half-life; peak GH within minutes; pulse lasts ~1–2 hours',
    steadyState: 'Typically daily; effect is per-dose pulse'
  },
  'MK-677': {
    effects: ['GH and IGF-1 elevation', 'Muscle support', 'Sleep', 'Appetite'],
    sideEffects: ['Increased hunger', 'Water retention', 'Numbness', 'Blood sugar effects'],
    peakEffects: 'Oral; peak IGF-1 over 1–2 weeks; take daily at same time',
    steadyState: '2–4 weeks of daily dosing for peak IGF-1'
  },
  'AOD-9604': {
    effects: ['Fat metabolism', 'Lipolysis', 'Weight support'],
    sideEffects: ['Generally well tolerated'],
    peakEffects: 'Short half-life; peak effect within 1–2 hours; often dosed daily',
    steadyState: 'Daily use; body composition changes over weeks'
  },
  'MOTS-C': {
    effects: ['Mitochondrial support', 'Metabolic health', 'Endurance', 'Recovery'],
    sideEffects: ['Generally well tolerated', 'Injection site possible'],
    peakEffects: 'Peak within 1–2 hours; often dosed 2–3× per week',
    steadyState: 'Protocol-dependent; 2–3× per week common'
  },
  'Melanotan II': {
    effects: ['Tanning', 'Libido', 'Appetite suppression'],
    sideEffects: ['Nausea', 'Flushing', 'Facial flushing', 'Yawning'],
    peakEffects: 'Peak effect within hours; tanning builds over days; half-life ~1–2 days',
    steadyState: 'Loading phase then 1–2× per week maintenance'
  },
  'PT-141': {
    effects: ['Libido', 'Sexual function', 'On-demand use'],
    sideEffects: ['Flushing', 'Nausea', 'Yawning', 'Stretching'],
    peakEffects: 'Onset 15–45 minutes; effect lasts several hours; not for daily use',
    steadyState: 'As-needed; no steady state'
  },
  'Enclomiphene (Enclo)': {
    effects: ['LH/FSH stimulation', 'Natural testosterone', 'Estrogen receptor blockade', 'Fertility support'],
    sideEffects: ['Visual disturbances', 'Mood changes', 'Hot flashes', 'Headache'],
    peakEffects: 'Days 1–2 of daily dosing; steady state in 1–2 weeks',
    steadyState: '1–2 weeks of consistent daily dosing'
  },
  'KLOW': {
    effects: ['Tissue repair', 'Anti-inflammatory', 'GHK-Cu + BPC-157 + KPV + TB-500 blend'],
    sideEffects: ['Injection site reactions', 'Generally well tolerated'],
    peakEffects: 'Peak within 1–2 hours; blend of short-acting peptides; typically daily',
    steadyState: '8–16 week protocols common; daily dosing; healing builds over weeks'
  },
  'Kisspeptin': {
    effects: ['GnRH release', 'LH/FSH pulse', 'Testosterone support', 'Fertility signaling'],
    sideEffects: ['Flushing', 'Mild nausea', 'Injection site reactions'],
    peakEffects: 'Peak LH pulse within 1–2 hours; short-lived; often 2–3× per week',
    steadyState: 'Pulsatile; no single steady state; protocol-dependent'
  },
  'Tesa/Ipa Blend (5mg/5mg)': {
    effects: ['GH release', 'Tesamorelin + Ipamorelin', 'Visceral fat support', 'Recovery'],
    sideEffects: ['Injection site reactions', 'Flushing', 'Hunger possible'],
    peakEffects: 'Fast Tesa peak ~15–30 min; Ipa peak ~1 h; combined GH pulse; daily typical',
    steadyState: 'Per-dose pulse; daily use; body composition over time'
  },
  'CJC/Ipa Blend (10mg/10mg)': {
    effects: ['GH release', 'CJC-1295 (no DAC) + Ipamorelin in one vial', 'Recovery', 'Sleep stack'],
    sideEffects: ['Injection site reactions', 'Flushing', 'Hunger possible', 'Water retention in some'],
    peakEffects: 'Ipamorelin peak ~1 h; Mod GRF–style CJC (no DAC) synergizes with Ipa. Example: 10+10 mg + 2 mL BAC → 10 mg/mL; 4 U‑100 units ≈ 0.4 mg total (~200 mcg each in a 1:1 blend).',
    steadyState: 'Per-dose pulse; vial total mg = both peptides combined for concentration math'
  },
  'Tesa/Ipa/CJC Blend (6mg/3mg/3mg)': {
    effects: ['GH release', 'Tesamorelin + Ipamorelin + CJC (no DAC) premix', 'Recovery', 'Body composition'],
    sideEffects: ['Injection site reactions', 'Flushing', 'Hunger', 'Fluid retention possible'],
    peakEffects: 'Tesa rapid peak; Ipa ~1 h; triple GH-axis blend; follow prescriber protocol',
    steadyState: 'Per-dose pulse; total mg = sum of all three peptides for reconstitution'
  },
  'BPC/TB Blend (5mg/5mg)': {
    effects: ['Tissue repair', 'BPC-157 + TB-500 premix', 'Recovery', 'Angiogenesis support'],
    sideEffects: ['Injection site reactions', 'Generally well tolerated'],
    peakEffects: 'BPC peaks ~1–2 h; TB-500 longer half-life; often daily or EOD in protocols',
    steadyState: 'Healing builds over weeks; total mg = both peptides for vial concentration'
  },
  'Gonadorelin': {
    effects: ['GnRH analog', 'LH/FSH release', 'Testosterone stimulation'],
    sideEffects: ['Injection site reactions', 'Flushing possible'],
    peakEffects: 'Very short half-life; peak LH/FSH within 30–60 minutes',
    steadyState: 'Pulse dosing 2–3× per week; effect per injection'
  },
  'Fragment 176-191': {
    effects: ['Fat loss', 'Lipolysis', 'Preserves lean mass', 'Metabolic support'],
    sideEffects: ['Generally well tolerated', 'Injection site possible'],
    peakEffects: 'Peak within 1–2 hours; short half-life; often daily or BID',
    steadyState: 'Daily dosing; body composition over 4–8 weeks'
  },
  'GHK-Cu': {
    effects: ['Skin repair', 'Collagen', 'Wound healing', 'Anti-inflammatory'],
    sideEffects: ['Injection site reactions', 'Blue-green tint at site'],
    peakEffects: 'Peak within 1–2 hours; local and systemic effects; often daily',
    steadyState: 'Daily or EOD; skin/healing benefits over weeks'
  },
  'Semax': {
    effects: ['Cognitive support', 'Neuroprotection', 'Focus', 'Stress resilience'],
    sideEffects: ['Generally well tolerated', 'Nasal irritation if nasal'],
    peakEffects: 'Very short half-life; peak effect within 30–60 minutes; often 1–2× daily',
    steadyState: 'Effect is per dose; use as needed or on schedule'
  },
  'Epithalon': {
    effects: ['Telomere support', 'Longevity research', 'Sleep', 'Antioxidant'],
    sideEffects: ['Generally well tolerated'],
    peakEffects: 'Short half-life; often used in 10–20 day cycles; 1× daily',
    steadyState: 'Cycle-based; not a traditional steady state'
  },
  'BPC-157 (Oral)': {
    effects: ['Gut healing', 'Systemic repair', 'Convenience of oral dosing'],
    sideEffects: ['Rare; GI tolerance usually good'],
    peakEffects: 'Peak within 1–2 hours; absorption varies; daily dosing',
    steadyState: '4–6 week cycles common; daily use'
  },
  'Anamorelin': {
    effects: ['Ghrelin agonist', 'Appetite', 'Lean mass support', 'Cachexia support'],
    sideEffects: ['Glucose effects', 'Fatigue', 'Nausea possible'],
    peakEffects: 'Peak within 1–2 hours; short half-life; typically daily',
    steadyState: 'Daily dosing; appetite and weight over weeks'
  }
};

// Phase timeline templates: { phases: [ { name, hours, icon, color, bgColor, borderColor, description, whatsHappening, whatToExpect, tips } ] }
export const MEDICATION_PHASE_TIMELINES = {
  'Semaglutide': {
    phases: [
      { name: 'Absorption', hours: [0, 24], icon: '⬆️', color: 'text-blue-400', bgColor: 'bg-blue-500/10', borderColor: 'border-blue-500/30', description: 'Semaglutide entering your bloodstream', whatsHappening: ['Subcutaneous depot releasing slowly', 'GLP-1 receptors starting to activate', 'Blood levels beginning to rise'], whatToExpect: ['Minimal effect in first hours', 'Some notice slight appetite change by day 1', 'Nausea uncommon this early'], tips: ['Stay hydrated', 'Eat normally today', 'Rotate injection site for next week'] },
      { name: 'Rising', hours: [24, 48], icon: '📈', color: 'text-yellow-400', bgColor: 'bg-yellow-500/10', borderColor: 'border-yellow-500/30', description: 'Semaglutide levels building', whatsHappening: ['Peak blood concentration approaching', 'Appetite suppression increasing', 'Gastric emptying slowing'], whatToExpect: ['Appetite reduction becoming clear', 'Feeling full on less food', 'Nausea may start (often mild)'], tips: ['Smaller portions', 'Bland foods if nauseated', 'Sip water'] },
      { name: 'Peak', hours: [48, 96], icon: '🎯', color: 'text-emerald-400', bgColor: 'bg-emerald-500/10', borderColor: 'border-emerald-500/30', description: 'Maximum Semaglutide effect', whatsHappening: ['Peak concentration reached', 'Strongest appetite suppression', 'Food noise at minimum'], whatToExpect: ['Best hunger control of the week', 'Highest nausea risk if it occurs', 'Prime window for weight loss'], tips: ['Prioritize protein', 'Small, frequent meals', 'Ginger if needed for nausea'] },
      { name: 'Cruise', hours: [96, 144], icon: '⚡', color: 'text-cyan-400', bgColor: 'bg-cyan-500/10', borderColor: 'border-cyan-500/30', description: 'Stable therapeutic level', whatsHappening: ['Steady Semaglutide levels', 'Consistent appetite control', 'Sustained effect'], whatToExpect: ['Comfortable suppression', 'Side effects often minimal', 'Good energy'], tips: ['Exercise is very effective now', 'Keep consistent eating', 'Track weight'] },
      { name: 'Declining', hours: [144, 168], icon: '📉', color: 'text-orange-400', bgColor: 'bg-orange-500/10', borderColor: 'border-orange-500/30', description: 'Levels dropping toward next dose', whatsHappening: ['Concentration decreasing', 'Appetite slowly returning', 'Effect still present but less'], whatToExpect: ['Hunger may increase', 'Still some control', 'Normal before next shot'], tips: ['Plan next injection', 'Stay mindful of portions'] },
      { name: 'Trough', hours: [168, 999], icon: '💉', color: 'text-red-400', bgColor: 'bg-red-500/10', borderColor: 'border-red-500/30', description: 'Time for your next Semaglutide dose', whatsHappening: ['Levels at lowest', 'Baseline appetite returning', 'Ready for next weekly dose'], whatToExpect: ['Hunger closer to baseline', 'Inject today to stay on schedule', 'Weekly rhythm'], tips: ['Take your weekly injection today', 'Rotate site', 'Same day each week'] }
    ]
  },
  'Tirzepatide': {
    phases: [
      { name: 'Absorption', hours: [0, 24], icon: '⬆️', color: 'text-blue-400', bgColor: 'bg-blue-500/10', borderColor: 'border-blue-500/30', description: 'Tirzepatide entering system', whatsHappening: ['GLP-1 and GIP receptors activating', 'Absorption from injection site', 'Metabolic effects starting'], whatToExpect: ['Minimal effect early', 'Some feel change by day 1', 'Side effects rare yet'], tips: ['Hydrate', 'Eat normally', 'Note injection site'] },
      { name: 'Rising', hours: [24, 48], icon: '📈', color: 'text-yellow-400', bgColor: 'bg-yellow-500/10', borderColor: 'border-yellow-500/30', description: 'Dual agonist building', whatsHappening: ['Peak concentration approaching', 'Appetite and glucose effects increasing', 'Dual action ramping'], whatToExpect: ['Appetite reduction noticeable', 'Possible energy shift', 'Mild GI effects possible'], tips: ['Smaller portions', 'Hydrate', 'Monitor how you feel'] },
      { name: 'Peak', hours: [48, 96], icon: '🎯', color: 'text-emerald-400', bgColor: 'bg-emerald-500/10', borderColor: 'border-emerald-500/30', description: 'Maximum Tirzepatide effect', whatsHappening: ['Peak blood levels', 'Strongest appetite suppression', 'Best metabolic window'], whatToExpect: ['Strong hunger control', 'Possible nausea', 'Best weight loss window'], tips: ['High protein', 'Eat slowly', 'Stay active'] },
      { name: 'Cruise', hours: [96, 144], icon: '⚡', color: 'text-cyan-400', bgColor: 'bg-cyan-500/10', borderColor: 'border-cyan-500/30', description: 'Stable dual-agonist effect', whatsHappening: ['Stable levels', 'Sustained appetite control', 'Consistent metabolic benefit'], whatToExpect: ['Comfortable suppression', 'Side effects often minimal', 'Feel your best'], tips: ['Exercise', 'Consistent meals', 'Track progress'] },
      { name: 'Declining', hours: [144, 168], icon: '📉', color: 'text-orange-400', bgColor: 'bg-orange-500/10', borderColor: 'border-orange-500/30', description: 'Effects tapering', whatsHappening: ['Levels dropping', 'Appetite slowly returning', 'Still therapeutic'], whatToExpect: ['Hunger increasing', 'Still some control', 'Normal before next dose'], tips: ['Plan next injection', 'Mindful portions'] },
      { name: 'Trough', hours: [168, 999], icon: '💉', color: 'text-red-400', bgColor: 'bg-red-500/10', borderColor: 'border-red-500/30', description: 'Next Tirzepatide dose due', whatsHappening: ['Lowest levels', 'Baseline returning', 'Time to re-dose'], whatToExpect: ['Hunger more normal', 'Inject today', 'Weekly schedule'], tips: ['Weekly injection today', 'Rotate site', 'Same day each week'] }
    ]
  },
  'Liraglutide': {
    phases: [
      { name: 'Rising', hours: [0, 4], icon: '⬆️', color: 'text-blue-400', bgColor: 'bg-blue-500/10', borderColor: 'border-blue-500/30', description: 'Liraglutide absorbing', whatsHappening: ['Daily GLP-1 absorbing', 'Receptors activating', 'Levels rising'], whatToExpect: ['Effect building within hours', 'Take at same time daily', 'Peak later in day'], tips: ['Same time daily', 'With or without food per label', 'Rotate sites'] },
      { name: 'Peak', hours: [4, 12], icon: '🎯', color: 'text-emerald-400', bgColor: 'bg-emerald-500/10', borderColor: 'border-emerald-500/30', description: 'Peak Liraglutide effect', whatsHappening: ['Peak concentration', 'Strongest appetite control', 'Full GLP-1 effect'], whatToExpect: ['Best hunger control of the day', 'Possible nausea', 'Good glucose effect'], tips: ['Protein-focused meals', 'Small portions', 'Hydrate'] },
      { name: 'Active', hours: [12, 24], icon: '⚡', color: 'text-cyan-400', bgColor: 'bg-cyan-500/10', borderColor: 'border-cyan-500/30', description: 'Sustained effect through day', whatsHappening: ['Levels declining but active', 'Appetite still suppressed', 'Coverage through 24h'], whatToExpect: ['Stable effect', 'Side effects often mild', 'Ready for next dose tomorrow'], tips: ['Consistent eating', 'Next dose same time tomorrow', 'Track daily'] },
      { name: 'Next dose', hours: [24, 999], icon: '💉', color: 'text-orange-400', bgColor: 'bg-orange-500/10', borderColor: 'border-orange-500/30', description: 'Time for next daily Liraglutide', whatsHappening: ['Levels low', 'Take next dose', 'Daily rhythm'], whatToExpect: ['Inject today', 'Same time as yesterday', 'Build steady state over days'], tips: ['Daily injection', 'Same time', 'Rotate sites'] }
    ]
  },
  'Dulaglutide': {
    phases: [
      { name: 'Absorption', hours: [0, 24], icon: '⬆️', color: 'text-blue-400', bgColor: 'bg-blue-500/10', borderColor: 'border-blue-500/30', description: 'Dulaglutide entering system', whatsHappening: ['Weekly GLP-1 absorbing', 'Concentration rising', 'Effects building'], whatToExpect: ['Minimal early', 'Building through day 1', 'Peak ahead'], tips: ['Hydrate', 'Eat normally', 'Note site'] },
      { name: 'Rising', hours: [24, 72], icon: '📈', color: 'text-yellow-400', bgColor: 'bg-yellow-500/10', borderColor: 'border-yellow-500/30', description: 'Levels building', whatsHappening: ['Peak approaching', 'Appetite suppression increasing', 'Glucose effects improving'], whatToExpect: ['Noticeable appetite change', 'Possible GI effects', 'Strongest effects mid-week'], tips: ['Smaller meals', 'Bland if nauseated', 'Hydrate'] },
      { name: 'Peak / Cruise', hours: [72, 120], icon: '🎯', color: 'text-emerald-400', bgColor: 'bg-emerald-500/10', borderColor: 'border-emerald-500/30', description: 'Optimal Dulaglutide effect', whatsHappening: ['Peak to stable levels', 'Best appetite control', 'Sustained benefit'], whatToExpect: ['Comfortable suppression', 'Often minimal side effects', 'Good energy'], tips: ['Exercise', 'Consistent eating', 'Track weight'] },
      { name: 'Declining', hours: [120, 168], icon: '📉', color: 'text-orange-400', bgColor: 'bg-orange-500/10', borderColor: 'border-orange-500/30', description: 'Levels declining', whatsHappening: ['Concentration falling', 'Appetite returning slowly', 'Still therapeutic'], whatToExpect: ['Hunger may increase', 'Still some control', 'Next dose soon'], tips: ['Plan next injection', 'Mindful portions'] },
      { name: 'Trough', hours: [168, 999], icon: '💉', color: 'text-red-400', bgColor: 'bg-red-500/10', borderColor: 'border-red-500/30', description: 'Next weekly Dulaglutide due', whatsHappening: ['Lowest levels', 'Baseline returning', 'Re-dose day'], whatToExpect: ['Inject today', 'Weekly schedule', 'Rotate site'], tips: ['Weekly dose today', 'Same day each week', 'Rotate injection site'] }
    ]
  },
  'Retatrutide': {
    phases: [
      { name: 'Absorption', hours: [0, 24], icon: '⬆️', color: 'text-blue-400', bgColor: 'bg-blue-500/10', borderColor: 'border-blue-500/30', description: 'Retatrutide loading', whatsHappening: ['Triple agonist absorbing', 'GLP-1, GIP, Glucagon receptors activating', 'Levels rising'], whatToExpect: ['Minimal first hours', 'Building through day 1', 'Peak ahead'], tips: ['Hydrate', 'Eat normally', 'Note injection site'] },
      { name: 'Rising', hours: [24, 48], icon: '📈', color: 'text-yellow-400', bgColor: 'bg-yellow-500/10', borderColor: 'border-yellow-500/30', description: 'Triple action building', whatsHappening: ['Peak concentration approaching', 'Appetite and metabolic effects increasing', 'All three pathways active'], whatToExpect: ['Strong appetite reduction', 'Possible energy boost', 'Monitor heart rate if relevant'], tips: ['Smaller portions', 'High protein', 'Stay hydrated'] },
      { name: 'Peak', hours: [48, 96], icon: '🔥', color: 'text-emerald-400', bgColor: 'bg-emerald-500/10', borderColor: 'border-emerald-500/30', description: 'Maximum Retatrutide effect', whatsHappening: ['Peak levels', 'Strongest appetite suppression', 'Maximum metabolic effect'], whatToExpect: ['Dramatic hunger reduction', 'Possible increased HR', 'Prime fat loss window'], tips: ['Monitor HR if needed', 'Prioritize protein', 'Listen to body'] },
      { name: 'Cruise', hours: [96, 144], icon: '⚡', color: 'text-cyan-400', bgColor: 'bg-cyan-500/10', borderColor: 'border-cyan-500/30', description: 'Sustained triple agonist effect', whatsHappening: ['Stable levels', 'Consistent appetite control', 'Optimal metabolic state'], whatToExpect: ['Excellent control', 'Side effects often minimal', 'Best feeling of week'], tips: ['Intense workouts effective', 'Maintain hydration', 'Track progress'] },
      { name: 'Declining', hours: [144, 168], icon: '📉', color: 'text-orange-400', bgColor: 'bg-orange-500/10', borderColor: 'border-orange-500/30', description: 'Effects tapering', whatsHappening: ['Levels dropping', 'Appetite returning', 'Still effective'], whatToExpect: ['Hunger increasing', 'Normal before next dose', 'Prepare for injection'], tips: ['Mindful eating', 'Next dose soon', 'Rotate site'] },
      { name: 'Trough', hours: [168, 999], icon: '💉', color: 'text-red-400', bgColor: 'bg-red-500/10', borderColor: 'border-red-500/30', description: 'Next Retatrutide dose due', whatsHappening: ['Lowest levels', 'Time to re-dose', 'Weekly cycle'], whatToExpect: ['Inject today', 'Weekly schedule', 'Consistent timing'], tips: ['Weekly injection today', 'Rotate site', 'Same day each week'] }
    ]
  },
  'Testosterone Cypionate': {
    phases: [
      { name: 'Loading', hours: [0, 24], icon: '⬆️', color: 'text-blue-400', bgColor: 'bg-blue-500/10', borderColor: 'border-blue-500/30', description: 'Cypionate ester absorbing', whatsHappening: ['Ester cleaving slowly', 'Testosterone releasing from depot', 'Blood levels rising'], whatToExpect: ['No immediate change', 'Possible injection site soreness', 'Peak in 1–2 days'], tips: ['Massage site gently', 'Stay active', 'Peak ahead'] },
      { name: 'Rising', hours: [24, 72], icon: '📈', color: 'text-yellow-400', bgColor: 'bg-yellow-500/10', borderColor: 'border-yellow-500/30', description: 'Testosterone levels climbing', whatsHappening: ['Blood testosterone increasing', 'Androgen receptors activating', 'Protein synthesis ramping'], whatToExpect: ['Energy improving', 'Mood and libido may increase', 'Motivation up'], tips: ['Good time for workouts', 'Adequate protein', 'Notice mood/energy'] },
      { name: 'Peak', hours: [72, 96], icon: '💪', color: 'text-emerald-400', bgColor: 'bg-emerald-500/10', borderColor: 'border-emerald-500/30', description: 'Peak testosterone from this shot', whatsHappening: ['Peak concentration', 'Maximum anabolic effect', 'Strongest window'], whatToExpect: ['Peak energy and motivation', 'Best gym performance', 'Possible oily skin/acne'], tips: ['Heavy workouts now', 'High protein', 'Manage skin if needed'] },
      { name: 'Cruise', hours: [96, 144], icon: '⚡', color: 'text-cyan-400', bgColor: 'bg-cyan-500/10', borderColor: 'border-cyan-500/30', description: 'Stable therapeutic range', whatsHappening: ['Stable elevated testosterone', 'Consistent anabolic support', 'Sustained energy'], whatToExpect: ['Excellent feeling', 'Stable energy', 'Good recovery'], tips: ['Progressive overload', 'Consistent training', 'Enjoy stability'] },
      { name: 'Declining', hours: [144, 168], icon: '📉', color: 'text-orange-400', bgColor: 'bg-orange-500/10', borderColor: 'border-orange-500/30', description: 'Levels dropping toward next dose', whatsHappening: ['Testosterone declining', 'Still above baseline', 'Effects gradually less'], whatToExpect: ['Energy still good', 'Therapeutic effect continues', 'Next shot soon'], tips: ['Training still productive', 'Next injection soon', 'Normal dip'] },
      { name: 'Trough', hours: [168, 999], icon: '💉', color: 'text-red-400', bgColor: 'bg-red-500/10', borderColor: 'border-red-500/30', description: 'Next Cypionate dose due', whatsHappening: ['Levels at trough', 'Re-dose for stability', 'Avoid long trough'], whatToExpect: ['Inject today', 'Stable levels = better results', 'Weekly rhythm'], tips: ['Weekly injection today', 'Don’t extend trough', 'Rotate site'] }
    ]
  },
  'Testosterone Enanthate': {
    phases: [
      { name: 'Loading', hours: [0, 24], icon: '⬆️', color: 'text-blue-400', bgColor: 'bg-blue-500/10', borderColor: 'border-blue-500/30', description: 'Enanthate ester absorbing', whatsHappening: ['Ester releasing testosterone', 'Absorption from injection site', 'Levels beginning to rise'], whatToExpect: ['No immediate effect', 'Possible site soreness', 'Peak in ~2–3 days'], tips: ['Massage site', 'Stay active', 'Peak ahead'] },
      { name: 'Rising', hours: [24, 72], icon: '📈', color: 'text-yellow-400', bgColor: 'bg-yellow-500/10', borderColor: 'border-yellow-500/30', description: 'Testosterone climbing', whatsHappening: ['Blood levels increasing', 'Androgen receptors activating', 'Anabolic effects building'], whatToExpect: ['Energy and mood improving', 'Libido may increase', 'Better recovery'], tips: ['Train consistently', 'Adequate protein', 'Notice changes'] },
      { name: 'Peak', hours: [72, 96], icon: '💪', color: 'text-emerald-400', bgColor: 'bg-emerald-500/10', borderColor: 'border-emerald-500/30', description: 'Peak Enanthate effect', whatsHappening: ['Peak concentration', 'Maximum anabolic window', 'Strongest effect of week'], whatToExpect: ['Peak energy and focus', 'Best performance', 'Possible acne/oily skin'], tips: ['Heavy training', 'Protein intake', 'Skin care if needed'] },
      { name: 'Cruise', hours: [96, 144], icon: '⚡', color: 'text-cyan-400', bgColor: 'bg-cyan-500/10', borderColor: 'border-cyan-500/30', description: 'Stable therapeutic range', whatsHappening: ['Stable elevated levels', 'Consistent anabolic support', 'Sustained energy and recovery'], whatToExpect: ['Excellent overall feeling', 'Stable energy', 'Good recovery'], tips: ['Progressive overload', 'Consistent schedule', 'Enjoy stability'] },
      { name: 'Declining', hours: [144, 168], icon: '📉', color: 'text-orange-400', bgColor: 'bg-orange-500/10', borderColor: 'border-orange-500/30', description: 'Levels declining', whatsHappening: ['Testosterone falling', 'Still above baseline', 'Effects reducing'], whatToExpect: ['Energy still good', 'Next dose approaching', 'Normal transition'], tips: ['Training still effective', 'Next injection soon'] },
      { name: 'Trough', hours: [168, 999], icon: '💉', color: 'text-red-400', bgColor: 'bg-red-500/10', borderColor: 'border-red-500/30', description: 'Next Enanthate dose due', whatsHappening: ['Trough levels', 'Re-dose for stability', 'Weekly cycle'], whatToExpect: ['Inject today', 'Consistent weekly timing', 'Rotate site'], tips: ['Weekly injection today', 'Same day each week', 'Rotate injection site'] }
    ]
  },
  'HCG': {
    phases: [
      { name: 'Rising', hours: [0, 12], icon: '⬆️', color: 'text-blue-400', bgColor: 'bg-blue-500/10', borderColor: 'border-blue-500/30', description: 'HCG absorbing and acting', whatsHappening: ['LH-like activity stimulating Leydig cells', 'Testosterone production increasing', 'Peak effect building'], whatToExpect: ['Effect within hours', 'Often dosed 2–3× per week', 'Supports natural T'], tips: ['Rotate sites', 'Consistent schedule', 'Track with other hormones if applicable'] },
      { name: 'Peak', hours: [12, 48], icon: '🎯', color: 'text-emerald-400', bgColor: 'bg-emerald-500/10', borderColor: 'border-emerald-500/30', description: 'Peak HCG effect', whatsHappening: ['Peak LH-like stimulation', 'Testicular function supported', 'Testosterone support'], whatToExpect: ['Maximum effect from this dose', 'Good window for fertility/T support', 'Next dose in 2–3 days typically'], tips: ['Follow protocol', 'Note mood/energy', 'Next dose on schedule'] },
      { name: 'Declining', hours: [48, 72], icon: '📉', color: 'text-orange-400', bgColor: 'bg-orange-500/10', borderColor: 'border-orange-500/30', description: 'HCG levels declining', whatsHappening: ['Levels dropping', 'Effect still present', 'Half-life ~33h'], whatToExpect: ['Still supportive', 'Next injection often in 2–3 days', 'Protocol-dependent'], tips: ['Stick to schedule', 'Rotate sites', 'Track in app'] },
      { name: 'Next dose', hours: [72, 999], icon: '💉', color: 'text-red-400', bgColor: 'bg-red-500/10', borderColor: 'border-red-500/30', description: 'Next HCG dose due', whatsHappening: ['Levels low', 'Time for next injection', '2–3× per week typical'], whatToExpect: ['Inject per protocol', 'Consistent timing', 'Rotate site'], tips: ['Next dose today or tomorrow', '2–3× per week typical', 'Rotate injection site'] }
    ]
  },
  'BPC-157': {
    phases: [
      { name: 'Rapid absorption', hours: [0, 2], icon: '⚡', color: 'text-yellow-400', bgColor: 'bg-yellow-500/10', borderColor: 'border-yellow-500/30', description: 'BPC-157 entering system', whatsHappening: ['Peptide absorbing from injection site', 'Repair pathways activating', 'Anti-inflammatory effects starting'], whatToExpect: ['Effects within 1–2 hours', 'Healing support begins', 'Often daily or EOD'], tips: ['Consistent dosing', 'Injection or oral per protocol', '4–6 week cycles common'] },
      { name: 'Peak activity', hours: [2, 8], icon: '🎯', color: 'text-emerald-400', bgColor: 'bg-emerald-500/10', borderColor: 'border-emerald-500/30', description: 'Peak BPC-157 effect', whatsHappening: ['Peak concentration', 'Tissue repair and gut healing supported', 'Growth factor signaling active'], whatToExpect: ['Strongest repair window', 'Cumulative over weeks', 'Well tolerated'], tips: ['Rest/recovery important', 'Combine with good nutrition', 'Track injury/recovery'] },
      { name: 'Active phase', hours: [8, 24], icon: '⚡', color: 'text-cyan-400', bgColor: 'bg-cyan-500/10', borderColor: 'border-cyan-500/30', description: 'Sustained BPC-157 effect', whatsHappening: ['Levels declining but active', 'Repair processes continuing', 'Effects cumulative'], whatToExpect: ['Healing support continues', 'Next dose tomorrow or EOD', 'Build over 4–6 weeks'], tips: ['Daily or EOD typical', 'Rotate injection sites', 'Patience for tissue repair'] },
      { name: 'Next dose', hours: [24, 999], icon: '💉', color: 'text-orange-400', bgColor: 'bg-orange-500/10', borderColor: 'border-orange-500/30', description: 'Time for next BPC-157 dose', whatsHappening: ['Peptide mostly cleared', 'Cumulative benefits from repeated dosing', 'Next dose maintains cycle'], whatToExpect: ['Inject or take oral per protocol', 'Daily or EOD', 'Consistency matters'], tips: ['Next dose today or tomorrow', '4–6 week cycles', 'Rotate sites if injecting'] }
    ]
  },
  'TB-500': {
    phases: [
      { name: 'Absorption', hours: [0, 12], icon: '⬆️', color: 'text-blue-400', bgColor: 'bg-blue-500/10', borderColor: 'border-blue-500/30', description: 'TB-500 entering system', whatsHappening: ['Long half-life peptide absorbing', 'Angiogenesis and repair pathways activating', 'Levels building'], whatToExpect: ['Peak within ~24 hours', 'Effects build over weeks', 'Often 2–3× per week'], tips: ['Loading phase 2–4 weeks', 'Then maintenance', 'Track recovery'] },
      { name: 'Peak', hours: [12, 48], icon: '🎯', color: 'text-emerald-400', bgColor: 'bg-emerald-500/10', borderColor: 'border-emerald-500/30', description: 'Peak TB-500 effect', whatsHappening: ['Peak concentration', 'Tissue repair and flexibility support', 'Sustained presence'], whatToExpect: ['Maximum effect from this dose', 'Benefits accumulate over weeks', 'Well tolerated'], tips: ['Consistent schedule', 'Combine with BPC-157 if protocol', 'Patience for results'] },
      { name: 'Sustained', hours: [48, 168], icon: '⚡', color: 'text-cyan-400', bgColor: 'bg-cyan-500/10', borderColor: 'border-cyan-500/30', description: 'TB-500 long tail', whatsHappening: ['Long half-life; levels still present', 'Ongoing repair support', 'Next dose often in 2–7 days'], whatToExpect: ['Sustained benefit', 'Protocol-dependent frequency', 'Cumulative over cycle'], tips: ['2–3× per week common', 'Loading then maintenance', 'Rotate sites'] },
      { name: 'Next dose', hours: [168, 999], icon: '💉', color: 'text-orange-400', bgColor: 'bg-orange-500/10', borderColor: 'border-orange-500/30', description: 'Next TB-500 dose', whatsHappening: ['Levels declining', 'Next injection due', 'Maintenance phase typical'], whatToExpect: ['Inject per protocol', '1–2× per week maintenance', 'Rotate site'], tips: ['Next dose this week', 'Rotate injection site', 'Track recovery'] }
    ]
  },
  'Ipamorelin': {
    phases: [
      { name: 'Rapid rise', hours: [0, 1], icon: '⚡', color: 'text-yellow-400', bgColor: 'bg-yellow-500/10', borderColor: 'border-yellow-500/30', description: 'Ipamorelin GH pulse', whatsHappening: ['GH release from pituitary', 'Peak within ~1 hour', 'Short half-life'], whatToExpect: ['GH pulse within 1 hour', 'Best taken fasted, before bed', 'No steady state—per dose'], tips: ['Fasted state', 'Before bed common', 'Daily or 2× daily per protocol'] },
      { name: 'Peak', hours: [1, 2], icon: '🎯', color: 'text-emerald-400', bgColor: 'bg-emerald-500/10', borderColor: 'border-emerald-500/30', description: 'Peak GH release', whatsHappening: ['Peak GH concentration', 'Fat loss and recovery support', 'Pulse declining'], whatToExpect: ['Maximum GH from this dose', 'Short-lived', 'Next dose tomorrow'], tips: ['Consistent timing', 'Avoid carbs around dose', 'Track sleep/recovery'] },
      { name: 'Clearance', hours: [2, 4], icon: '📉', color: 'text-cyan-400', bgColor: 'bg-cyan-500/10', borderColor: 'border-cyan-500/30', description: 'Ipamorelin clearing', whatsHappening: ['GH back to baseline', 'Effect from pulse complete', 'Next dose next day'], whatToExpect: ['Back to baseline', 'Daily dosing typical', 'No residual'], tips: ['Same time tomorrow', 'Rotate sites', 'Consistency'] },
      { name: 'Next dose', hours: [4, 999], icon: '💉', color: 'text-orange-400', bgColor: 'bg-orange-500/10', borderColor: 'border-orange-500/30', description: 'Next Ipamorelin dose', whatsHappening: ['Ready for next pulse', 'Daily or BID per protocol', 'Pulse-based effect'], whatToExpect: ['Next dose tomorrow (or BID)', 'Fasted, before bed', 'Rotate sites'], tips: ['Daily injection', 'Fasted + before bed', 'Rotate injection site'] }
    ]
  },
  'CJC-1295': {
    phases: [
      { name: 'Rising', hours: [0, 4], icon: '📈', color: 'text-blue-400', bgColor: 'bg-blue-500/10', borderColor: 'border-blue-500/30', description: 'CJC-1295 releasing GH', whatsHappening: ['Sustained GH release', 'Peak 2–4 hours', 'Long-acting analog'], whatToExpect: ['GH elevated for hours', 'Often paired with Ipamorelin', '1–2× per week common'], tips: ['Often post-workout or before bed', 'Follow protocol', 'Rotate sites'] },
      { name: 'Peak', hours: [4, 12], icon: '🎯', color: 'text-emerald-400', bgColor: 'bg-emerald-500/10', borderColor: 'border-emerald-500/30', description: 'Peak CJC-1295 effect', whatsHappening: ['Peak GH release', 'Fat loss and recovery', 'Sustained elevation'], whatToExpect: ['Strongest effect', 'May feel flush/hunger', 'Well tolerated for most'], tips: ['Hydrate', 'Avoid high carbs around dose', 'Note numbness/tingling'] },
      { name: 'Declining', hours: [12, 24], icon: '📉', color: 'text-cyan-400', bgColor: 'bg-cyan-500/10', borderColor: 'border-cyan-500/30', description: 'GH levels declining', whatsHappening: ['GH returning to baseline', 'Effect from dose tapering', 'Next dose in days'], whatToExpect: ['Back toward baseline', '1–2× per week typical', 'Cumulative over weeks'], tips: ['Next dose in 2–7 days', 'Rotate sites', 'Track body comp'] },
      { name: 'Next dose', hours: [24, 999], icon: '💉', color: 'text-orange-400', bgColor: 'bg-orange-500/10', borderColor: 'border-orange-500/30', description: 'Next CJC-1295 dose', whatsHappening: ['Ready for next dose', '1–2× per week typical', 'Build over weeks'], whatToExpect: ['Inject per schedule', 'Often with Ipamorelin', 'Rotate site'], tips: ['Weekly or 2× per week', 'Rotate injection site', 'Consistent timing'] }
    ]
  },
  'Tesamorelin': {
    phases: [
      { name: 'Rapid peak', hours: [0, 1], icon: '⚡', color: 'text-yellow-400', bgColor: 'bg-yellow-500/10', borderColor: 'border-yellow-500/30', description: 'Tesamorelin GH release', whatsHappening: ['Very short half-life', 'Peak GH ~15–30 min', 'Once daily injection'], whatToExpect: ['Quick peak', 'Daily dosing', 'Visceral fat focus over time'], tips: ['Same time daily', 'Before bed or AM per Rx', 'Rotate sites'] },
      { name: 'Active', hours: [1, 4], icon: '🎯', color: 'text-emerald-400', bgColor: 'bg-emerald-500/10', borderColor: 'border-emerald-500/30', description: 'GH effect active', whatsHappening: ['GH elevated', 'Effects on fat/metabolism', 'Clearing'], whatToExpect: ['Effect from dose', 'Body composition over months', 'Daily consistency'], tips: ['Daily injection', 'Track waist/visceral fat', 'Patience'] },
      { name: 'Next dose', hours: [4, 999], icon: '💉', color: 'text-orange-400', bgColor: 'bg-orange-500/10', borderColor: 'border-orange-500/30', description: 'Next daily Tesamorelin', whatsHappening: ['Cleared', 'Next dose tomorrow', 'Daily rhythm'], whatToExpect: ['Inject tomorrow same time', 'Daily use', 'Rotate site'], tips: ['Daily dose', 'Same time', 'Rotate injection site'] }
    ]
  },
  'KLOW': {
    phases: [
      { name: 'Absorption', hours: [0, 2], icon: '⚡', color: 'text-yellow-400', bgColor: 'bg-yellow-500/10', borderColor: 'border-yellow-500/30', description: 'KLOW blend entering system', whatsHappening: ['GHK-Cu, BPC-157, KPV, TB-500 absorbing', 'Tissue repair and anti-inflammatory pathways', 'Peak within 1–2 hours'], whatToExpect: ['Healing blend active', 'Daily dosing typical', '8–16 week protocols'], tips: ['Daily injection', 'Rotate sites', 'Track recovery'] },
      { name: 'Peak activity', hours: [2, 8], icon: '🎯', color: 'text-emerald-400', bgColor: 'bg-emerald-500/10', borderColor: 'border-emerald-500/30', description: 'Peak KLOW effect', whatsHappening: ['Blend at peak concentration', 'Repair and inflammation support', 'BPC-157 dominates duration'], whatToExpect: ['Strongest window', 'Cumulative over weeks', 'Well tolerated'], tips: ['Consistent dosing', 'Good nutrition', 'Patience for tissue repair'] },
      { name: 'Next dose', hours: [8, 999], icon: '💉', color: 'text-orange-400', bgColor: 'bg-orange-500/10', borderColor: 'border-orange-500/30', description: 'Time for next KLOW dose', whatsHappening: ['Levels declining', 'Next dose tomorrow', 'Daily rhythm'], whatToExpect: ['Inject daily per protocol', 'Rotate sites', 'Build over 8–16 weeks'], tips: ['Daily dose', 'Same time', 'Rotate injection site'] }
    ]
  },
  'Tesa/Ipa Blend (5mg/5mg)': {
    phases: [
      { name: 'Rapid rise', hours: [0, 0.5], icon: '⚡', color: 'text-yellow-400', bgColor: 'bg-yellow-500/10', borderColor: 'border-yellow-500/30', description: 'Tesa + Ipa GH pulse', whatsHappening: ['Tesamorelin peak ~15–30 min', 'Ipamorelin rising', 'Combined GH release'], whatToExpect: ['Fast peak from Tesa', 'Ipa extends pulse', 'Best fasted, before bed'], tips: ['Fasted state', 'Before bed common', 'Daily typical'] },
      { name: 'Peak', hours: [0.5, 2], icon: '🎯', color: 'text-emerald-400', bgColor: 'bg-emerald-500/10', borderColor: 'border-emerald-500/30', description: 'Peak GH from blend', whatsHappening: ['Ipamorelin peak ~1 h', 'Combined GH elevation', 'Fat loss and recovery support'], whatToExpect: ['Maximum GH from dose', 'Short-lived', 'Next dose tomorrow'], tips: ['Avoid carbs around dose', 'Rotate sites', 'Track sleep/recovery'] },
      { name: 'Clearance', hours: [2, 6], icon: '📉', color: 'text-cyan-400', bgColor: 'bg-cyan-500/10', borderColor: 'border-cyan-500/30', description: 'Blend clearing', whatsHappening: ['Levels declining', 'Effect from pulse complete', 'Next dose next day'], whatToExpect: ['Back toward baseline', 'Daily dosing typical', 'Consistency matters'], tips: ['Same time tomorrow', 'Rotate sites', 'Daily injection'] },
      { name: 'Next dose', hours: [6, 999], icon: '💉', color: 'text-orange-400', bgColor: 'bg-orange-500/10', borderColor: 'border-orange-500/30', description: 'Next Tesa/Ipa dose', whatsHappening: ['Ready for next pulse', 'Daily injection', '5/5 mg blend'], whatToExpect: ['Inject tomorrow', 'Fasted, before bed', 'Rotate injection site'], tips: ['Daily dose', '5mg/5mg', 'Rotate injection site'] }
    ]
  },
  'CJC/Ipa Blend (10mg/10mg)': {
    phases: [
      { name: 'Rise', hours: [0, 1], icon: '⚡', color: 'text-yellow-400', bgColor: 'bg-yellow-500/10', borderColor: 'border-yellow-500/30', description: 'CJC (no DAC) + Ipa GH pulse', whatsHappening: ['Ipamorelin selective GH secretagogue', 'Mod GRF 1–29 (no DAC) synergizes with Ipa', 'Combined GH release'], whatToExpect: ['Ipa peak ~1 h', 'Often fasted, before bed', 'Daily or 5 days on / 2 off'], tips: ['Fasted state', 'Before bed common', 'Rotate sites'] },
      { name: 'Peak', hours: [1, 3], icon: '🎯', color: 'text-emerald-400', bgColor: 'bg-emerald-500/10', borderColor: 'border-emerald-500/30', description: 'Peak GH from blend', whatsHappening: ['Maximum GH from this dose', 'Fat loss and recovery support', 'Short-lived pulse'], whatToExpect: ['Strongest effect window', 'May feel flush/hunger', 'Next dose per schedule'], tips: ['Avoid high carbs around dose', 'Hydrate', 'Track sleep'] },
      { name: 'Clearance', hours: [3, 8], icon: '📉', color: 'text-cyan-400', bgColor: 'bg-cyan-500/10', borderColor: 'border-cyan-500/30', description: 'Blend clearing', whatsHappening: ['GH returning toward baseline', 'Effect from pulse tapering', 'Ready for next dose'], whatToExpect: ['Per-dose effect', 'Consistency matters', 'Rotate injection site'], tips: ['Same time next dose', '20 mg total in vial ÷ 2 mL BAC → 10 mg/mL; many protocols use 4 U for ~200 mcg each', 'U-100: units÷100 × mg/mL = mg drawn'] },
      { name: 'Next dose', hours: [8, 999], icon: '💉', color: 'text-orange-400', bgColor: 'bg-orange-500/10', borderColor: 'border-orange-500/30', description: 'Next CJC/Ipa dose', whatsHappening: ['Ready for next injection', 'Daily or 5/2 typical', 'Premixed convenience'], whatToExpect: ['Inject per protocol', 'Fasted timing if used', 'Rotate site'], tips: ['Daily or Mon–Fri', '10mg/10mg label', 'Follow prescriber'] }
    ]
  },
  'Tesa/Ipa/CJC Blend (6mg/3mg/3mg)': {
    phases: [
      { name: 'Rapid rise', hours: [0, 0.5], icon: '⚡', color: 'text-yellow-400', bgColor: 'bg-yellow-500/10', borderColor: 'border-yellow-500/30', description: 'Triple GH-axis blend', whatsHappening: ['Tesamorelin rapid peak', 'Ipamorelin rising', 'CJC no DAC + Ipa synergy'], whatToExpect: ['Fast Tesa contribution', 'Combined secretagogue stack', 'Follow medical protocol'], tips: ['Strong GH-axis effect', 'Monitoring matters', 'Rotate sites'] },
      { name: 'Peak', hours: [0.5, 2], icon: '🎯', color: 'text-emerald-400', bgColor: 'bg-emerald-500/10', borderColor: 'border-emerald-500/30', description: 'Peak GH window', whatsHappening: ['Ipamorelin peak ~1 h', 'Sustained GH elevation from blend', 'Recovery and composition support'], whatToExpect: ['Maximum effect from dose', 'Short-lived pulse', 'Daily or scheduled'], tips: ['Avoid stacking redundant secretagogues elsewhere', 'Track sides', 'Consistency'] },
      { name: 'Clearance', hours: [2, 8], icon: '📉', color: 'text-cyan-400', bgColor: 'bg-cyan-500/10', borderColor: 'border-cyan-500/30', description: 'Blend clearing', whatsHappening: ['Levels declining', 'Pulse completing', 'Next dose per plan'], whatToExpect: ['Back toward baseline', 'Per-dose effect', 'Rotate site'], tips: ['Total vial mg = 6+3+3 = 12', 'Recon concentration from total ÷ BAC', 'U-100 units supported'] },
      { name: 'Next dose', hours: [8, 999], icon: '💉', color: 'text-orange-400', bgColor: 'bg-orange-500/10', borderColor: 'border-orange-500/30', description: 'Next triple blend dose', whatsHappening: ['Ready for next injection', 'Protocol-dependent timing', 'Premix convenience'], whatToExpect: ['Inject per schedule', 'Medical oversight', 'Rotate injection site'], tips: ['6/3/3 mg totals', 'Do not duplicate with separate GH peptides blindly', 'Follow prescriber'] }
    ]
  },
  'BPC/TB Blend (5mg/5mg)': {
    phases: [
      { name: 'Absorption', hours: [0, 2], icon: '⚡', color: 'text-yellow-400', bgColor: 'bg-yellow-500/10', borderColor: 'border-yellow-500/30', description: 'BPC + TB entering system', whatsHappening: ['BPC-157 and TB-500 absorbing', 'Repair and angiogenesis pathways', 'Peak BPC ~1–2 h'], whatToExpect: ['Healing blend active', 'Often daily or EOD', 'Well tolerated'], tips: ['Rotate sites', 'Total mg = 10 for recon', 'Consistent schedule'] },
      { name: 'Peak activity', hours: [2, 12], icon: '🎯', color: 'text-emerald-400', bgColor: 'bg-emerald-500/10', borderColor: 'border-emerald-500/30', description: 'Repair window', whatsHappening: ['BPC at peak; TB longer half-life building', 'Tissue repair cumulative'], whatToExpect: ['Strongest acute window', 'Benefits over weeks', 'Injection site usually mild'], tips: ['Nutrition and rest', 'Patience for tendons/ligaments', 'Track injury recovery'] },
      { name: 'Next dose', hours: [12, 999], icon: '💉', color: 'text-orange-400', bgColor: 'bg-orange-500/10', borderColor: 'border-orange-500/30', description: 'Next BPC/TB dose', whatsHappening: ['TB-500 persists longer than BPC', 'Next dose per protocol'], whatToExpect: ['Daily or EOD typical', 'Loading vs maintenance per plan', 'Rotate injection site'], tips: ['5mg/5mg premix', 'Total 10 mg vial for math', 'Follow protocol'] }
    ]
  },
  'Sermorelin': {
    phases: [
      { name: 'Pulse', hours: [0, 0.5], icon: '⚡', color: 'text-yellow-400', bgColor: 'bg-yellow-500/10', borderColor: 'border-yellow-500/30', description: 'Sermorelin GH pulse', whatsHappening: ['Very short half-life', 'Peak GH within minutes', 'Brief pulse'], whatToExpect: ['Rapid GH pulse', 'Effect 1–2 hours', 'Daily typical'], tips: ['Timing consistent', 'Before bed common', 'Rotate sites'] },
      { name: 'Clearance', hours: [0.5, 2], icon: '📉', color: 'text-cyan-400', bgColor: 'bg-cyan-500/10', borderColor: 'border-cyan-500/30', description: 'Sermorelin clearing', whatsHappening: ['GH returning to baseline', 'Pulse complete', 'Next dose next day'], whatToExpect: ['Back to baseline', 'Daily dosing', 'Per-dose effect'], tips: ['Next dose tomorrow', 'Same time', 'Rotate site'] },
      { name: 'Next dose', hours: [2, 999], icon: '💉', color: 'text-orange-400', bgColor: 'bg-orange-500/10', borderColor: 'border-orange-500/30', description: 'Next Sermorelin dose', whatsHappening: ['Ready for next pulse', 'Daily injection', 'Pulse-based'], whatToExpect: ['Inject tomorrow', 'Daily', 'Rotate injection site'], tips: ['Daily dose', 'Before bed', 'Rotate injection site'] }
    ]
  },
  'MK-677': {
    phases: [
      { name: 'Absorption', hours: [0, 2], icon: '⬆️', color: 'text-blue-400', bgColor: 'bg-blue-500/10', borderColor: 'border-blue-500/30', description: 'MK-677 absorbing (oral)', whatsHappening: ['Oral absorption', 'GH secretagogue acting', 'IGF-1 will rise over days'], whatToExpect: ['Take same time daily', 'Peak IGF-1 in 1–2 weeks', 'Increased hunger common'], tips: ['Same time daily', 'Monitor blood sugar', 'Hydrate'] },
      { name: 'Active', hours: [2, 24], icon: '🎯', color: 'text-emerald-400', bgColor: 'bg-emerald-500/10', borderColor: 'border-emerald-500/30', description: 'MK-677 active', whatsHappening: ['Sustained GH/IGF-1 support', 'Appetite increase', 'Sleep support'], whatToExpect: ['Hunger may be high', 'Good sleep possible', 'IGF-1 builds over weeks'], tips: ['Control portions', 'Quality sleep', 'Track weight'] },
      { name: 'Next dose', hours: [24, 999], icon: '💊', color: 'text-orange-400', bgColor: 'bg-orange-500/10', borderColor: 'border-orange-500/30', description: 'Next daily MK-677', whatsHappening: ['Take next oral dose', 'Daily consistency', 'Steady state in 2–4 weeks'], whatToExpect: ['Same time tomorrow', 'Daily oral', 'IGF-1 steady state in weeks'], tips: ['Daily oral dose', 'Same time', 'Monitor glucose if relevant'] }
    ]
  },
  'AOD-9604': {
    phases: [
      { name: 'Rapid', hours: [0, 2], icon: '⚡', color: 'text-yellow-400', bgColor: 'bg-yellow-500/10', borderColor: 'border-yellow-500/30', description: 'AOD-9604 peak', whatsHappening: ['Short half-life', 'Peak 1–2 hours', 'Lipolysis support'], whatToExpect: ['Peak effect soon', 'Daily dosing typical', 'Well tolerated'], tips: ['Daily injection', 'Consistent time', 'Rotate sites'] },
      { name: 'Declining', hours: [2, 8], icon: '📉', color: 'text-cyan-400', bgColor: 'bg-cyan-500/10', borderColor: 'border-cyan-500/30', description: 'AOD-9604 clearing', whatsHappening: ['Levels declining', 'Effect tapering', 'Next dose tomorrow'], whatToExpect: ['Back to baseline', 'Daily use', 'Body comp over weeks'], tips: ['Next dose tomorrow', 'Rotate site', 'Track progress'] },
      { name: 'Next dose', hours: [8, 999], icon: '💉', color: 'text-orange-400', bgColor: 'bg-orange-500/10', borderColor: 'border-orange-500/30', description: 'Next AOD-9604 dose', whatsHappening: ['Ready for next dose', 'Daily typical', 'Cumulative effect'], whatToExpect: ['Inject tomorrow', 'Daily', 'Rotate injection site'], tips: ['Daily dose', 'Same time', 'Rotate injection site'] }
    ]
  },
  'Melanotan II': {
    phases: [
      { name: 'Rising', hours: [0, 12], icon: '⬆️', color: 'text-yellow-400', bgColor: 'bg-yellow-500/10', borderColor: 'border-yellow-500/30', description: 'Melanotan II building', whatsHappening: ['Peptide absorbing', 'Melanocortin receptors activating', 'Tanning and other effects building'], whatToExpect: ['Nausea common early', 'Flushing/yawning possible', 'Tan builds over days'], tips: ['Start low dose', 'Take before bed to reduce sides', 'Hydrate'] },
      { name: 'Peak', hours: [12, 48], icon: '🎯', color: 'text-emerald-400', bgColor: 'bg-emerald-500/10', borderColor: 'border-emerald-500/30', description: 'Peak Melanotan II effect', whatsHappening: ['Peak concentration', 'Tanning and libido effects', 'Half-life ~1–2 days'], whatToExpect: ['Strongest effect', 'Tanning continues', 'Maintenance 1–2× per week'], tips: ['Sun exposure per protocol', 'Maintenance dosing', 'Rotate sites'] },
      { name: 'Declining', hours: [48, 168], icon: '📉', color: 'text-cyan-400', bgColor: 'bg-cyan-500/10', borderColor: 'border-cyan-500/30', description: 'Levels declining', whatsHappening: ['Levels dropping', 'Tan persists', 'Next dose in days'], whatToExpect: ['Effect tapering', 'Maintenance 1–2× per week', 'Rotate sites'], tips: ['Maintenance schedule', 'Rotate injection site', 'Track dosing'] },
      { name: 'Next dose', hours: [168, 999], icon: '💉', color: 'text-orange-400', bgColor: 'bg-orange-500/10', borderColor: 'border-orange-500/30', description: 'Next Melanotan II dose', whatsHappening: ['Maintenance dose due', 'Often weekly or 2× per week', 'Tan maintenance'], whatToExpect: ['Inject per protocol', 'Maintenance phase', 'Rotate site'], tips: ['Weekly or 2× per week', 'Rotate injection site', 'Sun protocol'] }
    ]
  },
  'PT-141': {
    phases: [
      { name: 'Onset', hours: [0, 0.5], icon: '⚡', color: 'text-yellow-400', bgColor: 'bg-yellow-500/10', borderColor: 'border-yellow-500/30', description: 'PT-141 onset', whatsHappening: ['Rapid absorption', 'Melanocortin receptors activating', 'Onset 15–45 min'], whatToExpect: ['Effect within 15–45 min', 'Flushing, yawning possible', 'On-demand use'], tips: ['On-demand, not daily', 'Allow 15–45 min', 'Hydrate'] },
      { name: 'Peak', hours: [0.5, 4], icon: '🎯', color: 'text-emerald-400', bgColor: 'bg-emerald-500/10', borderColor: 'border-emerald-500/30', description: 'Peak PT-141 effect', whatsHappening: ['Peak effect', 'Duration several hours', 'No steady state'], whatToExpect: ['Maximum effect', 'Lasts several hours', 'Do not redose same day'], tips: ['Single use per occasion', 'No daily use', 'Follow guidance'] },
      { name: 'Clearance', hours: [4, 999], icon: '📉', color: 'text-cyan-400', bgColor: 'bg-cyan-500/10', borderColor: 'border-cyan-500/30', description: 'PT-141 cleared', whatsHappening: ['Cleared', 'Next use on another occasion', 'Not for daily use'], whatToExpect: ['Back to baseline', 'Next use when needed', 'Space out use'], tips: ['As-needed only', 'No steady state', 'Space doses'] }
    ]
  },
  'Enclomiphene (Enclo)': {
    phases: [
      { name: 'Absorption', hours: [0, 6], icon: '⬆️', color: 'text-blue-400', bgColor: 'bg-blue-500/10', borderColor: 'border-blue-500/30', description: 'Oral Enclomiphene absorbing', whatsHappening: ['Enclomiphene absorbing from gut', 'Estrogen receptor blockade beginning', 'Pituitary signaling shifting'], whatToExpect: ['No immediate effect', 'Take same time daily', 'Consistent timing helps'], tips: ['Same time each day', 'With or without food per Rx', 'Note any visual changes'] },
      { name: 'Rising', hours: [6, 12], icon: '📈', color: 'text-yellow-400', bgColor: 'bg-yellow-500/10', borderColor: 'border-yellow-500/30', description: 'LH/FSH stimulation building', whatsHappening: ['Estrogen receptors blocked in hypothalamus/pituitary', 'LH and FSH increasing', 'Natural testosterone production ramping'], whatToExpect: ['Effects building', 'Steady state in 1–2 weeks', 'Cumulative over days'], tips: ['1–2 weeks for steady state', 'Track mood/energy', 'Report visual symptoms'] },
      { name: 'Peak', hours: [12, 24], icon: '🎯', color: 'text-emerald-400', bgColor: 'bg-emerald-500/10', borderColor: 'border-emerald-500/30', description: 'Therapeutic effect before next dose', whatsHappening: ['Sustained LH/FSH elevation', 'Natural testosterone support', 'Estrogen modulation active'], whatToExpect: ['Stable with daily use', 'Long half-life—levels build', 'Take next dose on time'], tips: ['Next dose at usual time', 'Consistency matters', 'Labs per doctor'] },
      { name: 'Next dose', hours: [24, 999], icon: '💊', color: 'text-orange-400', bgColor: 'bg-orange-500/10', borderColor: 'border-orange-500/30', description: 'Time for next daily Enclo', whatsHappening: ['Levels still present (long half-life)', 'Cumulative effect with daily dosing', 'Next dose maintains steady state'], whatToExpect: ['Take today’s dose', 'Same time daily', 'If missed, take when remembered per protocol'], tips: ['Daily dose today', 'Same time', 'Don’t double up'] }
    ]
  },
  'Kisspeptin': {
    phases: [
      { name: 'Pulse', hours: [0, 2], icon: '⚡', color: 'text-yellow-400', bgColor: 'bg-yellow-500/10', borderColor: 'border-yellow-500/30', description: 'Kisspeptin LH pulse', whatsHappening: ['GnRH release', 'LH/FSH pulse within 1–2 hours', 'Short half-life'], whatToExpect: ['Peak LH ~1–2 hours', 'Often 2–3× per week', 'Testosterone support'], tips: ['Follow protocol', '2–3× per week typical', 'Rotate sites'] },
      { name: 'Declining', hours: [2, 8], icon: '📉', color: 'text-cyan-400', bgColor: 'bg-cyan-500/10', borderColor: 'border-cyan-500/30', description: 'Kisspeptin clearing', whatsHappening: ['Pulse complete', 'Levels declining', 'Next dose in days'], whatToExpect: ['Effect from pulse', 'Protocol-dependent', 'No steady state'], tips: ['Next dose in 2–3 days', 'Rotate site', 'Track with other hormones'] },
      { name: 'Next dose', hours: [8, 999], icon: '💉', color: 'text-orange-400', bgColor: 'bg-orange-500/10', borderColor: 'border-orange-500/30', description: 'Next Kisspeptin dose', whatsHappening: ['Ready for next pulse', '2–3× per week typical', 'Pulse-based effect'], whatToExpect: ['Inject per schedule', '2–3× per week', 'Rotate injection site'], tips: ['2–3× per week', 'Rotate injection site', 'Consistent timing'] }
    ]
  },
  'Gonadorelin': {
    phases: [
      { name: 'Pulse', hours: [0, 1], icon: '⚡', color: 'text-yellow-400', bgColor: 'bg-yellow-500/10', borderColor: 'border-yellow-500/30', description: 'Gonadorelin GnRH pulse', whatsHappening: ['Very short half-life', 'Peak LH/FSH ~30–60 min', 'GnRH analog'], whatToExpect: ['Rapid pulse', 'Peak within 1 hour', '2–3× per week typical'], tips: ['Timing per protocol', '2–3× per week', 'Rotate sites'] },
      { name: 'Clearance', hours: [1, 4], icon: '📉', color: 'text-cyan-400', bgColor: 'bg-cyan-500/10', borderColor: 'border-cyan-500/30', description: 'Gonadorelin clearing', whatsHappening: ['Rapid clearance', 'Pulse complete', 'Next dose in days'], whatToExpect: ['Back to baseline', 'Effect per injection', 'Protocol-dependent'], tips: ['Next dose 2–3× per week', 'Rotate site', 'Track'] },
      { name: 'Next dose', hours: [4, 999], icon: '💉', color: 'text-orange-400', bgColor: 'bg-orange-500/10', borderColor: 'border-orange-500/30', description: 'Next Gonadorelin dose', whatsHappening: ['Next pulse in 2–3 days', 'Pulse-based', 'No steady state'], whatToExpect: ['Inject per schedule', '2–3× per week', 'Rotate injection site'], tips: ['2–3× per week', 'Rotate injection site', 'Consistent timing'] }
    ]
  },
  'Fragment 176-191': {
    phases: [
      { name: 'Rapid peak', hours: [0, 2], icon: '⚡', color: 'text-yellow-400', bgColor: 'bg-yellow-500/10', borderColor: 'border-yellow-500/30', description: 'Fragment 176-191 peak', whatsHappening: ['Short half-life', 'Peak 1–2 hours', 'Lipolysis support'], whatToExpect: ['Peak soon', 'Often daily or BID', 'Fat loss support'], tips: ['Daily or BID per protocol', 'Rotate sites', 'Track body comp'] },
      { name: 'Active', hours: [2, 8], icon: '🎯', color: 'text-emerald-400', bgColor: 'bg-emerald-500/10', borderColor: 'border-emerald-500/30', description: 'Fragment effect active', whatsHappening: ['Levels declining', 'Effect tapering', 'Next dose same day or next'], whatToExpect: ['BID or daily typical', 'Body comp over 4–8 weeks', 'Well tolerated'], tips: ['Consistent dosing', 'Rotate sites', 'Patience'] },
      { name: 'Next dose', hours: [8, 999], icon: '💉', color: 'text-orange-400', bgColor: 'bg-orange-500/10', borderColor: 'border-orange-500/30', description: 'Next Fragment dose', whatsHappening: ['Next dose today or tomorrow', 'Daily or BID', 'Cumulative effect'], whatToExpect: ['Inject per protocol', 'Daily or BID', 'Rotate injection site'], tips: ['Daily or BID', 'Rotate injection site', 'Track progress'] }
    ]
  },
  'GHK-Cu': {
    phases: [
      { name: 'Peak', hours: [0, 2], icon: '⚡', color: 'text-yellow-400', bgColor: 'bg-yellow-500/10', borderColor: 'border-yellow-500/30', description: 'GHK-Cu peak', whatsHappening: ['Peak 1–2 hours', 'Skin repair and collagen', 'Local and systemic'], whatToExpect: ['Peak effect soon', 'Daily or EOD typical', 'Healing over weeks'], tips: ['Daily or EOD', 'Rotate sites', 'Note blue-green at site'] },
      { name: 'Declining', hours: [2, 24], icon: '📉', color: 'text-cyan-400', bgColor: 'bg-cyan-500/10', borderColor: 'border-cyan-500/30', description: 'GHK-Cu clearing', whatsHappening: ['Levels declining', 'Repair ongoing', 'Next dose tomorrow or EOD'], whatToExpect: ['Cumulative skin/healing', 'Consistent dosing', 'Weeks for visible results'], tips: ['Next dose tomorrow or EOD', 'Rotate site', 'Patience'] },
      { name: 'Next dose', hours: [24, 999], icon: '💉', color: 'text-orange-400', bgColor: 'bg-orange-500/10', borderColor: 'border-orange-500/30', description: 'Next GHK-Cu dose', whatsHappening: ['Next dose due', 'Daily or EOD', 'Healing support'], whatToExpect: ['Inject per protocol', 'Daily or EOD', 'Rotate injection site'], tips: ['Daily or EOD', 'Rotate injection site', 'Track skin/recovery'] }
    ]
  },
  'Semax': {
    phases: [
      { name: 'Rapid onset', hours: [0, 0.5], icon: '⚡', color: 'text-yellow-400', bgColor: 'bg-yellow-500/10', borderColor: 'border-yellow-500/30', description: 'Semax onset', whatsHappening: ['Very short half-life', 'Peak 30–60 min', 'Cognitive/neuro support'], whatToExpect: ['Effect within 30–60 min', '1–2× daily or as needed', 'No steady state'], tips: ['Nasal or inject per form', 'Timing as needed', 'Consistent if daily'] },
      { name: 'Active', hours: [0.5, 2], icon: '🎯', color: 'text-emerald-400', bgColor: 'bg-emerald-500/10', borderColor: 'border-emerald-500/30', description: 'Semax active', whatsHappening: ['Peak effect', 'Focus and neuroprotection', 'Clearing'], whatToExpect: ['Maximum effect', 'Short-lived', 'Next dose later or tomorrow'], tips: ['1–2× daily if scheduled', 'Note focus/mood', 'Follow protocol'] },
      { name: 'Next dose', hours: [2, 999], icon: '💉', color: 'text-orange-400', bgColor: 'bg-orange-500/10', borderColor: 'border-orange-500/30', description: 'Next Semax dose', whatsHappening: ['Cleared', 'Next dose per protocol', 'As-needed or 1–2× daily'], whatToExpect: ['Next dose when needed or scheduled', 'Nasal/inject per form', 'Rotate if injecting'], tips: ['As-needed or 1–2× daily', 'Rotate if injecting', 'Track response'] }
    ]
  },
  'Epithalon': {
    phases: [
      { name: 'Rapid', hours: [0, 2], icon: '⚡', color: 'text-yellow-400', bgColor: 'bg-yellow-500/10', borderColor: 'border-yellow-500/30', description: 'Epithalon peak', whatsHappening: ['Short half-life', 'Peak ~1 hour', 'Often 10–20 day cycles'], whatToExpect: ['Peak soon', '1× daily in cycle', 'Cycle-based use'], tips: ['10–20 day cycles common', 'Same time daily', 'Rotate sites'] },
      { name: 'Clearance', hours: [2, 24], icon: '📉', color: 'text-cyan-400', bgColor: 'bg-cyan-500/10', borderColor: 'border-cyan-500/30', description: 'Epithalon clearing', whatsHappening: ['Cleared', 'Cumulative over cycle', 'Next dose tomorrow'], whatToExpect: ['Daily in cycle', 'No traditional steady state', 'Cycle length per protocol'], tips: ['Daily during cycle', 'Track cycle days', 'Rotate site'] },
      { name: 'Next dose', hours: [24, 999], icon: '💉', color: 'text-orange-400', bgColor: 'bg-orange-500/10', borderColor: 'border-orange-500/30', description: 'Next Epithalon dose', whatsHappening: ['Next dose in cycle', 'Daily during cycle', 'Cycle-based'], whatToExpect: ['Inject tomorrow if in cycle', 'Follow cycle protocol', 'Rotate injection site'], tips: ['Daily in cycle', 'Rotate injection site', 'Cycle protocol'] }
    ]
  },
  'BPC-157 (Oral)': {
    phases: [
      { name: 'Absorption', hours: [0, 2], icon: '⬆️', color: 'text-blue-400', bgColor: 'bg-blue-500/10', borderColor: 'border-blue-500/30', description: 'Oral BPC-157 absorbing', whatsHappening: ['Gut absorption', 'Peak 1–2 hours', 'Systemic and gut healing'], whatToExpect: ['Peak 1–2 hours', 'Daily dosing', '4–6 week cycles common'], tips: ['Same time daily', 'With or without food', 'Consistency'] },
      { name: 'Peak', hours: [2, 6], icon: '🎯', color: 'text-emerald-400', bgColor: 'bg-emerald-500/10', borderColor: 'border-emerald-500/30', description: 'Peak oral BPC-157', whatsHappening: ['Peak concentration', 'Healing support', 'Well tolerated'], whatToExpect: ['Maximum effect from dose', 'Cumulative over weeks', 'Gut and systemic'], tips: ['Daily dose', '4–6 week cycles', 'Track gut/recovery'] },
      { name: 'Next dose', hours: [6, 999], icon: '💊', color: 'text-orange-400', bgColor: 'bg-orange-500/10', borderColor: 'border-orange-500/30', description: 'Next oral BPC-157 dose', whatsHappening: ['Clearing', 'Next dose tomorrow', 'Daily rhythm'], whatToExpect: ['Take tomorrow same time', 'Daily oral', 'Cycle length per protocol'], tips: ['Daily oral', 'Same time', '4–6 week cycles'] }
    ]
  },
  'Anamorelin': {
    phases: [
      { name: 'Rising', hours: [0, 1], icon: '⬆️', color: 'text-blue-400', bgColor: 'bg-blue-500/10', borderColor: 'border-blue-500/30', description: 'Anamorelin absorbing', whatsHappening: ['Ghrelin agonist', 'Peak 1–2 hours', 'Appetite and lean mass support'], whatToExpect: ['Peak 1–2 hours', 'Daily typical', 'Appetite increase'], tips: ['Same time daily', 'Monitor glucose', 'Track weight'] },
      { name: 'Peak', hours: [1, 4], icon: '🎯', color: 'text-emerald-400', bgColor: 'bg-emerald-500/10', borderColor: 'border-emerald-500/30', description: 'Peak Anamorelin effect', whatsHappening: ['Peak concentration', 'Appetite and anabolic support', 'Short half-life'], whatToExpect: ['Maximum effect', 'Appetite/weight over weeks', 'Daily use'], tips: ['Daily dose', 'Adequate nutrition', 'Track appetite/weight'] },
      { name: 'Next dose', hours: [4, 999], icon: '💊', color: 'text-orange-400', bgColor: 'bg-orange-500/10', borderColor: 'border-orange-500/30', description: 'Next Anamorelin dose', whatsHappening: ['Cleared', 'Next dose tomorrow', 'Daily oral'], whatToExpect: ['Take tomorrow', 'Daily oral', 'Consistency'], tips: ['Daily oral', 'Same time', 'Track progress'] }
    ]
  }
};

/**
 * What clinical trials and people commonly report by day in the injection cycle.
 * Used for "Side effects by day in cycle" reference (not user-reported data).
 */
export const TYPICAL_SIDE_EFFECTS_BY_DAY = {
  'Semaglutide': [
    { day: 'Day 0 (injection day)', effects: ['Nausea', 'Injection site reaction', 'Fatigue', 'Heartburn'] },
    { day: 'Days 1–2', effects: ['Nausea may peak', 'GI upset', 'Decreased appetite', 'Fullness'] },
    { day: 'Days 3–7', effects: ['Often improves', 'Constipation possible', 'Mild fatigue'] }
  ],
  'Tirzepatide': [
    { day: 'Day 0 (injection day)', effects: ['Nausea', 'Injection site reaction', 'GI upset'] },
    { day: 'Days 1–3', effects: ['Nausea can peak', 'Diarrhea or constipation', 'Decreased appetite'] },
    { day: 'Days 4–7', effects: ['Usually improves', 'Some fatigue', 'Titration-dependent'] }
  ],
  'Liraglutide': [
    { day: 'Day 0 (each day)', effects: ['Nausea', 'Injection site reaction', 'Headache'] },
    { day: 'Within 24h', effects: ['Peak nausea often first 1–2 weeks', 'GI effects', 'Improves over time'] }
  ],
  'Dulaglutide': [
    { day: 'Day 0 (injection day)', effects: ['Nausea', 'Injection site reaction', 'Abdominal discomfort'] },
    { day: 'Days 1–3', effects: ['Nausea may peak 24–72h', 'Diarrhea or constipation'] },
    { day: 'Days 4–7', effects: ['Often improves', 'Decreased appetite can persist'] }
  ],
  'Retatrutide': [
    { day: 'Day 0 (injection day)', effects: ['Nausea', 'Injection site reaction', 'Fatigue'] },
    { day: 'Days 1–3', effects: ['Nausea/GI common in trials', 'Increased heart rate in some'] },
    { day: 'Days 4–7', effects: ['Titration-dependent', 'Often improves with time'] }
  ],
  'Testosterone Cypionate': [
    { day: 'Day 0 (injection day)', effects: ['Injection site pain', 'Mild soreness', 'Possible mood lift'] },
    { day: 'Days 1–3', effects: ['Peak levels ~24–48h', 'Energy/mood can peak', 'Acne or oiliness in some'] },
    { day: 'Days 4–7', effects: ['Levels decline toward next dose', 'Some report "trough" fatigue'] }
  ],
  'Testosterone Enanthate': [
    { day: 'Day 0 (injection day)', effects: ['Injection site pain', 'Mild soreness'] },
    { day: 'Days 1–3', effects: ['Peak levels ~2–3 days', 'Energy/mood', 'Acne in some'] },
    { day: 'Days 4–7', effects: ['Shorter ester than cypionate', 'Trough before next dose'] }
  ],
  'HCG': [
    { day: 'Day 0 (injection day)', effects: ['Injection site reaction', 'Mild headache possible'] },
    { day: 'Days 1–2', effects: ['Peak effect 24–48h', 'Mood/energy in some'] }
  ],
  'BPC-157': [
    { day: 'Day 0 (injection)', effects: ['Injection site discomfort rare', 'Generally well tolerated'] },
    { day: 'Ongoing', effects: ['Healing effects build over days–weeks', 'Minimal side effects in studies'] }
  ],
  'TB-500': [
    { day: 'Day 0 (injection)', effects: ['Injection site reactions possible', 'Generally well tolerated'] },
    { day: 'Ongoing', effects: ['Effects accumulate over weeks', 'Rare systemic side effects'] }
  ],
  'MOTS-C': [
    { day: 'Day 0 (injection)', effects: ['Injection site possible', 'Generally well tolerated'] },
    { day: 'Ongoing', effects: ['Often 2–3×/week', 'Mitochondrial/metabolic support'] }
  ],
  'KLOW': [
    { day: 'Day 0 (injection)', effects: ['Injection site possible', 'Blend (GHK-Cu, BPC-157, KPV, TB-500)'] },
    { day: 'Ongoing', effects: ['Tissue repair builds', 'Daily dosing typical', '8–16 week protocols'] }
  ],
  'Tesa/Ipa Blend (5mg/5mg)': [
    { day: 'Day 0 (injection)', effects: ['Flushing possible', 'Hunger increase in some'] },
    { day: 'Within hours', effects: ['GH pulse', 'Best fasted, before bed', 'Daily typical'] }
  ],
  'CJC/Ipa Blend (10mg/10mg)': [
    { day: 'Day 0 (injection)', effects: ['Flushing', 'Hunger increase', 'Injection site reaction possible'] },
    { day: 'Within 1–2h', effects: ['GH pulse', 'Example protocol: 4 U from 2 mL recon → ~200 mcg each', 'Often before bed per plan'] }
  ],
  'Tesa/Ipa/CJC Blend (6mg/3mg/3mg)': [
    { day: 'Day 0 (injection)', effects: ['Flushing', 'Hunger', 'Injection site reactions', 'Fluid retention possible'] },
    { day: 'Within hours', effects: ['Strong GH-axis blend—follow prescriber', 'Do not duplicate secretagogues blindly'] }
  ],
  'BPC/TB Blend (5mg/5mg)': [
    { day: 'Day 0 (injection)', effects: ['Injection site mild', 'Generally well tolerated'] },
    { day: 'Ongoing', effects: ['Repair builds over weeks', 'Daily or EOD common', 'Total vial mg = both peptides'] }
  ],
  'Ipamorelin': [
    { day: 'Day 0 (each dose)', effects: ['Flushing', 'Hunger increase', 'Generally well tolerated'] },
    { day: 'Within 1–2h', effects: ['GH pulse', 'Short-lived', 'Daily or BID typical'] }
  ],
  'Tesamorelin': [
    { day: 'Day 0 (injection)', effects: ['Injection site reactions', 'Joint pain in some', 'Fluid retention'] },
    { day: 'Ongoing', effects: ['Example: separate 10 mg vial + 2 mL BAC; 18 U ≈ ~1 mg in many quick refs', 'Daily dosing; timing per Rx (e.g. before bed)'] }
  ],
  'CJC-1295': [
    { day: 'Day 0 (injection)', effects: ['Flushing', 'Hunger', 'Numbness/tingling in some'] },
    { day: 'Hours to days', effects: ['Sustained GH release', '1–2× per week common'] }
  ],
  'MK-677': [
    { day: 'Daily (oral)', effects: ['Increased hunger', 'Water retention', 'Blood sugar effects possible'] },
    { day: 'Ongoing', effects: ['IGF-1 builds over 1–2 weeks', 'Take same time daily'] }
  ],
  'Melanotan II': [
    { day: 'Day 0 (injection)', effects: ['Nausea', 'Flushing', 'Yawning', 'Facial flushing'] },
    { day: 'Ongoing', effects: ['Tan builds over days', 'Often 1–2× per week'] }
  ],
  'Rybelsus (Oral Semaglutide)': [
    { day: 'Daily', effects: ['Nausea', 'GI upset', 'Take on empty stomach'] },
    { day: 'Within 1–4h', effects: ['Peak blood levels', 'Wait 30 min before eating'] }
  ]
};
