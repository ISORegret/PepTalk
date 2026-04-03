import { jsPDF } from 'jspdf';

/**
 * Build a simple text PDF for clinician visits (no images).
 * @param {object} data
 */
export function downloadClinicianSummaryPdf(data) {
  const {
    generatedAt = new Date().toISOString(),
    userProfile = {},
    weightEntries = [],
    injectionEntries = [],
    journalEntries = [],
    labEntries = [],
    glucoseEntries = [],
    sleepEntries = [],
    goalStack = [],
  } = data;

  const doc = new jsPDF({ unit: 'pt', format: 'letter' });
  const pageW = doc.internal.pageSize.getWidth();
  let y = 48;
  const margin = 48;
  const lineH = 14;
  const maxW = pageW - margin * 2;

  const addLine = (text, size = 10, bold = false) => {
    doc.setFont('helvetica', bold ? 'bold' : 'normal');
    doc.setFontSize(size);
    const lines = doc.splitTextToSize(String(text), maxW);
    for (const line of lines) {
      if (y > doc.internal.pageSize.getHeight() - 50) {
        doc.addPage();
        y = 48;
      }
      doc.text(line, margin, y);
      y += lineH;
    }
  };

  addLine('PepTalk — personal health log summary', 14, true);
  addLine(`Generated: ${new Date(generatedAt).toLocaleString()}`, 9);
  addLine('For discussion with a licensed clinician only. Not a diagnosis or prescription.', 9);
  y += 8;

  addLine('Profile (self-reported)', 11, true);
  addLine(`Height: ${userProfile.height ?? '—'} in · Goal weight: ${userProfile.goalWeight ?? '—'} lbs`);
  y += 6;

  if (goalStack?.length) {
    addLine('Goal stack (self-selected, not a prescription)', 11, true);
    addLine(goalStack.join(', '));
    y += 6;
  }

  const wDesc = [...weightEntries].sort((a, b) => String(b.date).localeCompare(String(a.date))).slice(0, 14);
  addLine(`Recent weight (${wDesc.length} newest)`, 11, true);
  if (!wDesc.length) addLine('No weight entries.');
  else wDesc.forEach((e) => addLine(`${e.date}: ${e.weight} lbs`));
  y += 6;

  const injDesc = [...injectionEntries].sort((a, b) => String(b.date).localeCompare(String(a.date))).slice(0, 20);
  addLine(`Recent injections (${injDesc.length} newest)`, 11, true);
  if (!injDesc.length) addLine('No injections logged.');
  else {
    injDesc.forEach((e) => {
      const se = (e.sideEffects || []).length
        ? ` · SE: ${e.sideEffects.map((s) => (e.sideEffectSeverity?.[s] != null ? `${s} (${e.sideEffectSeverity[s]}/5)` : s)).join(', ')}`
        : '';
      addLine(`${e.date} ${e.time || ''}: ${e.type} ${e.dose} ${e.unit || ''}${e.site ? ` · ${e.site}` : ''}${se}`);
    });
  }
  y += 6;

  const labs = [...labEntries].sort((a, b) => String(b.date).localeCompare(String(a.date))).slice(0, 15);
  addLine(`Recent labs (${labs.length} newest)`, 11, true);
  if (!labs.length) addLine('No lab entries.');
  else labs.forEach((e) => addLine(`${e.date}: ${e.type} ${e.value} ${e.unit || ''}`));
  y += 6;

  const gluc = [...glucoseEntries].sort((a, b) => String(b.date).localeCompare(String(a.date))).slice(0, 10);
  if (gluc.length) {
    addLine('Recent glucose', 11, true);
    gluc.forEach((e) => addLine(`${e.date}: ${e.value} mg/dL (${e.type || '—'})`));
    y += 6;
  }

  const sleep = [...sleepEntries].sort((a, b) => String(b.date).localeCompare(String(a.date))).slice(0, 14);
  if (sleep.length) {
    addLine('Recent sleep', 11, true);
    sleep.forEach((e) =>
      addLine(`${e.date}: bed ${e.bedTime} → wake ${e.wakeTime} · quality ${e.quality}/5${e.hours != null ? ` · ~${e.hours}h` : ''}`)
    );
    y += 6;
  }

  const journ = [...journalEntries].sort((a, b) => String(b.date).localeCompare(String(a.date))).slice(0, 8);
  if (journ.length) {
    addLine('Recent journal (snippet)', 11, true);
    journ.forEach((e) => {
      const snippet = (e.content || '').replace(/\s+/g, ' ').slice(0, 200);
      addLine(`${e.date} [${e.mood || ''}]: ${snippet}${e.content?.length > 200 ? '…' : ''}`);
    });
  }

  addLine('', 10);
  addLine('Disclaimer: Values are user-entered. Verify critical numbers against original records.', 8);

  const safeName = `PepTalk-clinician-summary-${String(generatedAt).slice(0, 10)}.pdf`;
  doc.save(safeName);
}
