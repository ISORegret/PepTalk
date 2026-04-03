/**
 * Goal → peptide education (curated). Names must match MEDICATIONS[].name in App.jsx.
 * Not medical advice; for orientation and discussion with a licensed clinician only.
 */

export const GOAL_GUIDE_DISCLAIMER =
  'Educational overview only. Not medical advice. Peptides and GLP-1 drugs require a qualified prescriber. PepTalk does not recommend doses or stacks—use this to learn terms and talk with your clinician.';

export const GOAL_CATEGORIES = [
  {
    id: 'fat-loss',
    title: 'Lose weight or body fat',
    description: 'Medications and peptides commonly discussed for appetite, satiety, or metabolic support alongside lifestyle change.',
    clinicianTips: [
      'Ask your prescriber what timeline and side effects to expect on GLP-1 therapy, and when to check labs.',
      'If you also use peptides, ask whether timing, nausea, or supplements need adjustment.',
      'Discuss maintenance plans after you reach a goal weight—not everyone stays on the same dose forever.',
    ],
    items: [
      {
        medicationName: 'Tirzepatide',
        explain:
          'GLP-1/GIP dual agonist used for weight management under prescription; reduces appetite and improves glycemic control for many people.',
        stacksWellWith: [
          { medicationName: 'BPC-157', why: 'Sometimes discussed for tissue support during rapid weight change—not a weight-loss drug itself.' },
          { medicationName: 'MOTS-C', why: 'Research peptide tied to metabolic/mitochondrial themes; sometimes mentioned in longevity/fat-loss communities.' },
        ],
      },
      {
        medicationName: 'Semaglutide',
        explain:
          'GLP-1 agonist (injectable or oral Rybelsus) prescribed for obesity and diabetes; strong evidence for weight loss with medical oversight.',
        stacksWellWith: [
          { medicationName: 'BPC-157', why: 'Occasionally paired in discussion for GI comfort or recovery; verify interactions with your prescriber.' },
        ],
      },
      {
        medicationName: 'Retatrutide',
        explain:
          'Triple agonist (GLP-1/GIP/glucagon) studied for weight loss; use only as prescribed and titrated by a clinician.',
        stacksWellWith: [
          { medicationName: 'BPC-157', why: 'Community discussion of supportive peptides during aggressive loss—clinical guidance required.' },
        ],
      },
      {
        medicationName: 'AOD-9604',
        explain:
          'Fragment-related peptide explored in research for fat metabolism; not a substitute for GLP-1 therapy where indicated.',
        stacksWellWith: [
          { medicationName: 'Fragment 176-191', why: 'Another fragment class sometimes grouped in “fat mobilization” discussions.' },
          { medicationName: 'MOTS-C', why: 'Sometimes combined in metabolic “stack” talk; evidence and safety are not the same as approved drugs.' },
        ],
      },
      {
        medicationName: 'Fragment 176-191',
        explain:
          'GH fragment historically discussed for lipolysis research; quality and regulation vary—treat as experimental in research contexts.',
        stacksWellWith: [
          { medicationName: 'AOD-9604', why: 'Often mentioned in the same research/fitness peptide conversations.' },
        ],
      },
      {
        medicationName: 'MOTS-C',
        explain:
          'Mitochondrial-derived peptide studied for metabolic health and exercise response; research-stage, not a first-line weight drug.',
        stacksWellWith: [
          { medicationName: 'AOD-9604', why: 'Sometimes paired in “metabolic peptide” discussions.' },
        ],
      },
      {
        medicationName: 'Tesamorelin',
        explain:
          'GHRH analog that raises GH/IGF-1; FDA-approved for HIV-associated lipodystrophy (visceral fat)—off-label use elsewhere requires specialist care.',
        stacksWellWith: [
          { medicationName: 'Ipamorelin', why: 'Both touch GH axis; combining is not automatic—endocrine oversight is critical.' },
        ],
      },
    ],
  },
  {
    id: 'heal-recover',
    title: 'Heal faster / injury recovery',
    description: 'Peptides often discussed for soft-tissue repair, training recovery, and gut lining support.',
    clinicianTips: [
      'Mention the injury or procedure and any imaging or PT so your clinician can judge if peptides fit your plan.',
      'Ask about injection site rotation, travel, and combining with NSAIDs or other meds.',
      'Human evidence for many repair peptides is limited—treat community stacks as hypotheses, not guarantees.',
    ],
    items: [
      {
        medicationName: 'BPC-157',
        explain:
          'Body protection compound studied in animals for tendons, gut, and angiogenesis; human data are limited—common in recovery-focused protocols.',
        stacksWellWith: [
          { medicationName: 'TB-500', why: 'Classic “repair stack” in peptide communities (thymosin beta-4–related).' },
          { medicationName: 'GHK-Cu', why: 'Tissue remodeling/collagen support angle; overlaps with skin and wound-healing interest.' },
        ],
      },
      {
        medicationName: 'TB-500',
        explain:
          'Promotes cell migration and repair in research models; used in athletic recovery discussion alongside BPC-157.',
        stacksWellWith: [
          { medicationName: 'BPC-157', why: 'Most common pairing for soft-tissue recovery talk.' },
          { medicationName: 'GHK-Cu', why: 'Extracellular matrix / remodeling theme.' },
        ],
      },
      {
        medicationName: 'GHK-Cu',
        explain:
          'Copper tripeptide associated with collagen, elastin, and tissue remodeling; used for skin and sometimes systemic repair narratives.',
        stacksWellWith: [
          { medicationName: 'BPC-157', why: 'Frequent combo in “GLOW/KLOW” style blends and recovery stacks.' },
          { medicationName: 'KLOW', why: 'Premixed blend that often includes GHK-Cu + BPC + TB + KPV for repair + inflammation balance.' },
        ],
      },
      {
        medicationName: 'KLOW',
        explain:
          'Blend (typically GHK-Cu, BPC-157, TB-500, KPV) aimed at repair, inflammation modulation, and remodeling in community protocols.',
        stacksWellWith: [
          { medicationName: 'BPC-157', why: 'If not using a blend, single BPC is the core repair peptide many start with.' },
        ],
      },
      {
        medicationName: 'BPC-157 (Oral)',
        explain:
          'Oral formulation discussion for gut-focused goals; absorption and evidence differ from injectable—ask your clinician.',
        stacksWellWith: [
          { medicationName: 'BPC-157', why: 'Compare routes and goals (local vs systemic) with professional guidance.' },
        ],
      },
    ],
  },
  {
    id: 'skin-hair',
    title: 'Tighter skin / collagen / cosmetic tissue',
    description: 'Peptides discussed for skin quality, healing after procedures, and copper-dependent remodeling.',
    clinicianTips: [
      'If you had a cosmetic procedure, confirm when injectables or peptides are allowed with the treating clinician.',
      'Copper-containing peptides (e.g. GHK-Cu) may not suit every skin condition—ask if you have sensitivity or disease.',
      'Tanning peptides carry distinct risks; legality and side effects vary by region.',
    ],
    items: [
      {
        medicationName: 'GHK-Cu',
        explain:
          'Widely used in skincare and injectable protocols for collagen synthesis and matrix support.',
        stacksWellWith: [
          { medicationName: 'BPC-157', why: 'Repair + remodeling combination in many aesthetic/recovery threads.' },
          { medicationName: 'KLOW', why: 'All-in-one blend when multiple mechanisms are desired.' },
        ],
      },
      {
        medicationName: 'BPC-157',
        explain:
          'Angiogenesis and tissue repair angle can support healing after microneedling or injury when prescribed appropriately.',
        stacksWellWith: [
          { medicationName: 'GHK-Cu', why: 'Structural/cosmetic remodeling pairing.' },
        ],
      },
      {
        medicationName: 'Melanotan II',
        explain:
          'Melanocortin agonist used for tanning and sometimes libido effects; has well-known side effect profile—legal status varies.',
        stacksWellWith: [
          { medicationName: 'PT-141', why: 'Different melanocortin pathway drug (prescription) for sexual function; not interchangeable.' },
        ],
      },
    ],
  },
  {
    id: 'gh-sleep',
    title: 'Sleep, recovery, GH pulses',
    description: 'Secretagogues and GHRH analogs discussed for sleep quality, recovery, and pituitary GH release.',
    clinicianTips: [
      'Anything that raises GH/IGF-1 can affect glucose, water retention, and sleep—baseline labs and follow-up matter.',
      'Ask how secretagogues interact with diabetes meds, thyroid treatment, or prior cancer history.',
      'Avoid stacking multiple GH-axis agents without endocrine guidance—effects add up.',
    ],
    items: [
      {
        medicationName: 'Ipamorelin',
        explain:
          'Selective GH secretagogue with relatively mild ghrelin mimicry; often used for sleep and recovery in peptide protocols.',
        stacksWellWith: [
          { medicationName: 'CJC-1295', why: 'Classic “CJC + Ipamorelin” pairing to extend GH pulse (DAC vs no-DAC is a separate discussion).' },
          { medicationName: 'Tesa/Ipa Blend (5mg/5mg)', why: 'Premixed tesamorelin/ipamorelin–style convenience where legally prescribed.' },
        ],
      },
      {
        medicationName: 'CJC-1295',
        explain:
          'GHRH analog that amplifies natural GH bursts, especially when timed with a secretagogue.',
        stacksWellWith: [
          { medicationName: 'Ipamorelin', why: 'Most referenced stack in GH-secretagogue communities.' },
        ],
      },
      {
        medicationName: 'Sermorelin',
        explain:
          'Shorter-acting GHRH fragment; historically used for GH stimulation in clinical settings.',
        stacksWellWith: [
          { medicationName: 'Ipamorelin', why: 'Sometimes rotated or combined per prescriber protocols.' },
        ],
      },
      {
        medicationName: 'Tesa/Ipa Blend (5mg/5mg)',
        explain:
          'Combines tesamorelin-like GHRH activity with ipamorelin secretagogue in one vial where offered.',
        stacksWellWith: [
          { medicationName: 'Ipamorelin', why: 'Understand overlap so you are not unknowingly doubling secretagogues.' },
        ],
      },
      {
        medicationName: 'MK-677',
        explain:
          'Oral ghrelin mimetic (Ibutamoren); raises GH/IGF-1 with sides like appetite and water retention—needs monitoring.',
        stacksWellWith: [
          { medicationName: 'CJC-1295', why: 'Sometimes stacked cautiously; IGF-1 and glucose monitoring matter.' },
        ],
      },
      {
        medicationName: 'Tesamorelin',
        explain:
          'Potent GHRH analog; prescription-grade tool for specific indications, strong GH/IGF-1 effect.',
        stacksWellWith: [
          { medicationName: 'Ipamorelin', why: 'Occasionally discussed together; endocrine supervision is essential.' },
        ],
      },
    ],
  },
  {
    id: 'muscle-strength',
    title: 'Muscle, strength, anabolic support',
    description: 'Hormones and secretagogues discussed alongside training—not replacements for training or nutrition.',
    clinicianTips: [
      'Testosterone therapy requires monitoring (hematocrit, PSA strategy, symptoms); fertility goals change the plan.',
      'Ask how TRT interacts with sleep apnea, prostate history, and cardiovascular risk.',
      'Oral ghrelin mimetics (e.g. MK-677) often raise appetite—discuss if weight or glucose is a concern.',
    ],
    items: [
      {
        medicationName: 'Testosterone Cypionate',
        explain:
          'Primary male sex hormone replacement when deficient; improves muscle, bone, and energy in appropriate patients.',
        stacksWellWith: [
          { medicationName: 'HCG', why: 'Sometimes used to support fertility/LH axis on TRT—specialist protocol.' },
          { medicationName: 'Enclomiphene (Enclo)', why: 'Alternative path to raise endogenous T in some male hypogonadism approaches.' },
        ],
      },
      {
        medicationName: 'Testosterone Enanthate',
        explain:
          'Another common testosterone ester with similar TRT role; dosing interval differs from cypionate.',
        stacksWellWith: [
          { medicationName: 'HCG', why: 'Same fertility/pituitary considerations as other TRT bases.' },
        ],
      },
      {
        medicationName: 'Anamorelin',
        explain:
          'Ghrelin agonist studied for appetite in cachexia; GH axis effects—distinct from classic TRT.',
        stacksWellWith: [
          { medicationName: 'MK-677', why: 'Both increase appetite via ghrelin pathway; not automatically combined.' },
        ],
      },
      {
        medicationName: 'MK-677',
        explain:
          'Increases GH/IGF-1 and appetite; used in “gaining” phases in some communities with monitoring.',
        stacksWellWith: [
          { medicationName: 'Ipamorelin', why: 'GH-axis theme; redundant stimulation possible—medical oversight required.' },
        ],
      },
    ],
  },
  {
    id: 'energy-focus',
    title: 'Energy, focus, cognition',
    description: 'Compounds discussed for mental clarity, mitochondria, or daytime performance.',
    clinicianTips: [
      'Mention anxiety, blood pressure, or stimulant use—some cognitive peptides are not neutral for everyone.',
      'Ask what evidence exists for your specific compound; many are research-stage.',
      'Sleep, nutrition, and training still dominate energy—peptides are rarely a solo fix.',
    ],
    items: [
      {
        medicationName: 'Semax',
        explain:
          'ACTH-derived neuropeptide used in some countries for cognitive support; mechanism involves BDNF/trkB themes in research.',
        stacksWellWith: [
          { medicationName: 'MOTS-C', why: 'Occasionally grouped as “mitochondrial + cognitive” in biohacking discussion.' },
        ],
      },
      {
        medicationName: 'MOTS-C',
        explain:
          'Mitochondrial peptide linked to metabolic flexibility and exercise in rodent/human pilot work.',
        stacksWellWith: [
          { medicationName: 'Semax', why: 'Performance/cognition angle in some stacks.' },
        ],
      },
      {
        medicationName: 'Epithalon',
        explain:
          'Telomerase/pineal research peptide; long-cycle discussion in anti-aging forums—human evidence is thin.',
        stacksWellWith: [
          { medicationName: 'GHK-Cu', why: 'Sometimes listed in broad “longevity peptide” lists together.' },
        ],
      },
    ],
  },
  {
    id: 'hormone-fertility',
    title: 'Hormone axis / fertility support',
    description: 'Tools discussed for testosterone optimization, fertility, or pituitary signaling—prescription contexts vary.',
    clinicianTips: [
      'Fertility and TRT are tightly linked—ask explicitly about sperm preservation if pregnancy is possible.',
      'SERMs, HCG, and kisspeptin-style protocols need specialist oversight; don’t self-adjust.',
      'Bring a timeline of prior labs (LH, FSH, testosterone, estradiol) if you have them.',
    ],
    items: [
      {
        medicationName: 'Enclomiphene (Enclo)',
        explain:
          'SERM that raises LH/FSH and endogenous testosterone in some men; alternative to exogenous T for fertility goals.',
        stacksWellWith: [
          { medicationName: 'HCG', why: 'Sometimes combined in male fertility or PCT-style protocols under specialist care.' },
        ],
      },
      {
        medicationName: 'HCG',
        explain:
          'Mimics LH to support testicular function and fertility, often alongside or instead of testosterone.',
        stacksWellWith: [
          { medicationName: 'Testosterone Cypionate', why: 'Classic TRT + HCG discussion for fertility preservation.' },
          { medicationName: 'Kisspeptin', why: 'Hypothalamic signaling research; advanced reproductive endocrinology territory.' },
        ],
      },
      {
        medicationName: 'Kisspeptin',
        explain:
          'Stimulates GnRH release in research; explored for reproductive axis modulation.',
        stacksWellWith: [
          { medicationName: 'Gonadorelin', why: 'Both sit on GnRH/LH axis science; clinical use is highly specialized.' },
        ],
      },
      {
        medicationName: 'Gonadorelin',
        explain:
          'GnRH analog context in fertility and diagnostic testing—not casual supplementation.',
        stacksWellWith: [
          { medicationName: 'HCG', why: 'Different layer of axis support; endocrinologist-directed only.' },
        ],
      },
    ],
  },
];

/** Shortcuts into PepTalk tabs while viewing a goal (tab bar + optional More sub-section). */
export const GOAL_TRACK_ACTIONS = {
  'fat-loss': [
    { label: 'Weight', tab: 'weight', moreSection: null, openInjectionForm: false },
    { label: 'Journal', tab: 'journal', moreSection: null, openInjectionForm: false },
    { label: 'Injections', tab: 'injections', moreSection: null, openInjectionForm: true },
    { label: 'Measurements', tab: 'more', moreSection: 'body', openInjectionForm: false },
  ],
  'heal-recover': [
    { label: 'Log injection', tab: 'injections', moreSection: null, openInjectionForm: true },
    { label: 'Journal', tab: 'journal', moreSection: null, openInjectionForm: false },
    { label: 'Body', tab: 'more', moreSection: 'body', openInjectionForm: false },
  ],
  'skin-hair': [
    { label: 'Log injection', tab: 'injections', moreSection: null, openInjectionForm: true },
    { label: 'Measurements', tab: 'more', moreSection: 'body', openInjectionForm: false },
    { label: 'Progress photos', tab: 'more', moreSection: 'body', openInjectionForm: false },
  ],
  'gh-sleep': [
    { label: 'Journal', tab: 'journal', moreSection: null, openInjectionForm: false },
    { label: 'Log injection', tab: 'injections', moreSection: null, openInjectionForm: true },
    { label: 'Weight', tab: 'weight', moreSection: null, openInjectionForm: false },
  ],
  'muscle-strength': [
    { label: 'Weight', tab: 'weight', moreSection: null, openInjectionForm: false },
    { label: 'Log injection', tab: 'injections', moreSection: null, openInjectionForm: true },
    { label: 'Journal', tab: 'journal', moreSection: null, openInjectionForm: false },
  ],
  'energy-focus': [
    { label: 'Journal', tab: 'journal', moreSection: null, openInjectionForm: false },
    { label: 'Log injection', tab: 'injections', moreSection: null, openInjectionForm: true },
    { label: 'Daily', tab: 'more', moreSection: 'daily', openInjectionForm: false },
  ],
  'hormone-fertility': [
    { label: 'Log injection', tab: 'injections', moreSection: null, openInjectionForm: true },
    { label: 'Labs', tab: 'more', moreSection: 'labs', openInjectionForm: false },
    { label: 'Journal', tab: 'journal', moreSection: null, openInjectionForm: false },
  ],
};

/**
 * Peptides/meds that pair with what's already in the user's stack (from guide data only).
 * @param {string[]} stackMedNames
 * @returns {{ medicationName: string, reasons: string[] }[]}
 */
export function getStackSuggestions(stackMedNames) {
  const stack = new Set((stackMedNames || []).filter(Boolean));
  const reasonMap = new Map();

  const add = (name, reason) => {
    if (!name || stack.has(name)) return;
    if (!reasonMap.has(name)) reasonMap.set(name, new Set());
    reasonMap.get(name).add(reason);
  };

  for (const cat of GOAL_CATEGORIES) {
    for (const item of cat.items) {
      const stacks = item.stacksWellWith || [];
      if (stack.has(item.medicationName)) {
        for (const sw of stacks) {
          add(sw.medicationName, `Pairs with ${item.medicationName} (${cat.title}): ${sw.why}`);
        }
      }
      for (const sw of stacks) {
        if (stack.has(sw.medicationName)) {
          add(item.medicationName, `${sw.medicationName} is often combined with ${item.medicationName} (${cat.title}): ${sw.why}`);
        }
      }
    }
  }

  return Array.from(reasonMap.entries())
    .map(([medicationName, reasons]) => ({ medicationName, reasons: Array.from(reasons) }))
    .sort((a, b) => a.medicationName.localeCompare(b.medicationName));
}

/**
 * All guide mentions of a medication (primary entries + stack context).
 * @param {string} medicationName
 * @returns {{ goalId: string, goalTitle: string, explain: string, role: 'primary' | 'stack' }[]}
 */
export function getMedicationEducation(medicationName) {
  const hits = [];
  for (const cat of GOAL_CATEGORIES) {
    for (const item of cat.items) {
      if (item.medicationName === medicationName) {
        hits.push({ goalId: cat.id, goalTitle: cat.title, explain: item.explain, role: 'primary' });
      }
      const sw = (item.stacksWellWith || []).find((x) => x.medicationName === medicationName);
      if (sw) {
        hits.push({
          goalId: cat.id,
          goalTitle: cat.title,
          explain: `${sw.why} (alongside ${item.medicationName} in this guide.)`,
          role: 'stack',
        });
      }
    }
  }
  return hits;
}
