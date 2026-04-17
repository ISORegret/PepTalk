import { jsPDF } from 'jspdf';

const WEEK_START_LABELS = {
  0: 'Sunday',
  1: 'Monday',
  2: 'Tuesday',
  3: 'Wednesday',
  4: 'Thursday',
  5: 'Friday',
  6: 'Saturday',
};

/** Matches Insights week-start dropdown labels */
export function getWeekStartsOnLabel(dayIndex) {
  return WEEK_START_LABELS[dayIndex] ?? `Day ${dayIndex}`;
}

/**
 * Vector PDF of the Insights "Weekly dose & weight change" table (matches on-screen visible meds).
 */
export function downloadWeeklyDoseWeightPdf({
  rows,
  visibleMeds,
  weekStartsOnLabel,
  totalWeightChange,
  appVersion,
}) {
  if (!rows?.length) return false;

  const landscape = visibleMeds.length > 4;
  const doc = new jsPDF({
    unit: 'pt',
    format: 'letter',
    orientation: landscape ? 'landscape' : 'portrait',
  });

  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();
  const margin = 40;
  const tableW = pageW - margin * 2;
  const deltaColW = 44;
  const hasMeds = visibleMeds.length > 0;
  const weekColW = hasMeds ? Math.min(118, tableW * 0.2) : tableW - deltaColW - 16;
  const medColW = hasMeds ? (tableW - weekColW - deltaColW) / visibleMeds.length : 0;
  const headerMedChars = !hasMeds ? 0 : medColW < 52 ? 10 : medColW < 72 ? 16 : 24;

  const truncate = (str, maxLen) => {
    if (!str || str.length <= maxLen) return str;
    return `${str.slice(0, Math.max(0, maxLen - 1))}…`;
  };

  let y = 44;

  const titleAndMeta = () => {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(28, 28, 32);
    doc.text('PepTalk — Weekly dose & weight change', margin, y);
    y += 18;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(70, 70, 78);
    doc.text(`Week starts on: ${weekStartsOnLabel}`, margin, y);
    y += 13;
    const tw = totalWeightChange;
    const twStr = tw === 0 ? '0.0 lb' : `${tw > 0 ? '+' : ''}${tw.toFixed(1)} lb`;
    doc.text(`Total weight change (rows shown): ${twStr}`, margin, y);
    y += 13;
    doc.setFontSize(8);
    doc.setTextColor(120, 120, 128);
    doc.text(`Generated ${new Date().toLocaleString()} · PepTalk v${appVersion || ''}`, margin, y);
    y += 22;
  };

  const tableHeader = () => {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(45, 45, 52);
    let x = margin;
    doc.text('Week', x, y);
    x += weekColW;
    if (hasMeds) {
      visibleMeds.forEach((name) => {
        doc.text(truncate(name, headerMedChars), x, y, { maxWidth: medColW - 2 });
        x += medColW;
      });
    }
    doc.text('Δ lb', x, y);
    y += 8;
    doc.setDrawColor(200, 200, 210);
    doc.line(margin, y, margin + tableW, y);
    y += 12;
    doc.setFont('helvetica', 'normal');
  };

  titleAndMeta();
  tableHeader();

  const rowHeight = 14;
  rows.forEach((row) => {
    if (y > pageH - 36) {
      doc.addPage();
      y = 44;
      tableHeader();
    }

    doc.setFontSize(8);
    doc.setTextColor(35, 35, 42);
    let x = margin;
    const weekText = truncate(`W${row.weekIndex}  ${row.weekLabel}`, 48);
    doc.text(weekText, x, y, { maxWidth: weekColW - 2 });
    x += weekColW;

    if (hasMeds) {
      visibleMeds.forEach((medName) => {
        const mg = row.perMed?.[medName]?.doseMg;
        const cell = mg != null && mg > 0 ? mg.toFixed(2) : '—';
        doc.text(cell, x, y, { maxWidth: medColW - 2 });
        x += medColW;
      });
    }

    const wc = row.weightChange;
    const deltaStr = wc == null ? '—' : `${wc > 0 ? '+' : ''}${wc.toFixed(1)}`;
    doc.text(deltaStr, x, y);

    y += rowHeight;
  });

  doc.save(`PepTalk-weekly-dose-weight-${new Date().toISOString().slice(0, 10)}.pdf`);
  return true;
}
