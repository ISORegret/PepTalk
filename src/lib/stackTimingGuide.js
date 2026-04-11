/**
 * Educational timing / spacing notes for stacks. Not medical advice.
 */

export const STACK_TIMING_GENERAL = [
  'Keep each medication on the schedule your prescriber gave you. Do not change dose or frequency from an app.',
  'Many peptides are discussed as morning vs. evening or fasted vs. with food — confirm what applies to you with a clinician.',
  'If you use GLP-1 therapy, weekly consistency (same day) often matters for steady appetite and glucose effects.',
];

/** @type {Record<string, string>} */
export const MEDICATION_TIMING_HINTS = {
  Semaglutide: 'Typically once weekly — same weekday helps many people stay on schedule.',
  'Rybelsus (Oral Semaglutide)': 'Oral GLP-1 — follow label timing relative to food and water.',
  Tirzepatide: 'Typically once weekly — discuss nausea timing and meal patterns with your care team.',
  Liraglutide: 'Daily GLP-1 — same general time of day is a common adherence strategy.',
  Dulaglutide: 'Weekly GLP-1 — rotate injection sites as directed.',
  Retatrutide: 'Weekly triple agonist — titration is prescriber-managed only.',
  'Testosterone Cypionate': 'IM/SubQ hormone — interval and site rotation per your protocol.',
  'Testosterone Enanthate': 'IM/SubQ hormone — interval and site rotation per your protocol.',
  HCG: 'Frequency varies widely by indication — only as directed.',
  'BPC-157': 'Often discussed as daily or EOD SubQ; verify with your prescriber.',
  'TB-500': 'Community protocols vary; medical oversight is important.',
  Ipamorelin: 'GH secretagogue — timing vs. meals and sleep is often discussed with prescribers.',
  Tesamorelin: 'GHRH analog — timing per Rx (many plans use before bed). Example: 10 mg + 2 mL BAC, 18 U‑100 units ≈ ~1 mg.',
  'CJC/Ipa Blend (10mg/10mg)': 'Premixed CJC (no DAC) + ipamorelin — total mg = both peptides. Example: 10+10 mg + 2 mL, 4 U ≈ ~200 mcg each; before bed common in some protocols.',
  'Tesa/Ipa/CJC Blend (6mg/3mg/3mg)': 'Triple premix — follow prescriber; avoid unknowingly stacking other GH secretagogues.',
  'BPC/TB Blend (5mg/5mg)': 'Repair premix — total mg = BPC + TB for reconstitution; daily or EOD protocols vary.',
};

/** Pairs to flag (educational caution, not interaction claims). */
export const STACK_PAIR_NOTES = [
  {
    pair: ['Semaglutide', 'Tirzepatide'],
    note: 'Using two GLP-1-class drugs together is not a standard self-managed stack — only if explicitly directed by a specialist.',
  },
  {
    pair: ['Semaglutide', 'Liraglutide'],
    note: 'Multiple GLP-1 agonists together require explicit medical direction.',
  },
  {
    pair: ['Tirzepatide', 'Liraglutide'],
    note: 'Multiple incretin therapies together require explicit medical direction.',
  },
];

/**
 * @param {string[]} medicationNames
 * @returns {{ general: string[], perMed: string[], pairWarnings: string[] }}
 */
export function getStackTimingContent(medicationNames) {
  const names = [...new Set((medicationNames || []).filter(Boolean))];
  const perMed = [];
  const seen = new Set();
  for (const n of names) {
    const h = MEDICATION_TIMING_HINTS[n];
    if (h && !seen.has(n)) {
      perMed.push(`${n}: ${h}`);
      seen.add(n);
    }
  }
  const pairWarnings = [];
  const norm = (s) => s.toLowerCase();
  for (const { pair, note } of STACK_PAIR_NOTES) {
    const [a, b] = pair;
    if (names.some((x) => norm(x) === norm(a)) && names.some((x) => norm(x) === norm(b))) {
      pairWarnings.push(note);
    }
  }
  return { general: [...STACK_TIMING_GENERAL], perMed, pairWarnings };
}
