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
 * Build PDF bytes for the Insights "Weekly dose & weight change" table.
 * @returns {{ blob: Blob, filename: string } | null}
 */
export function buildWeeklyDoseWeightPdf({
  rows,
  visibleMeds,
  weekStartsOnLabel,
  totalWeightChange,
  appVersion,
}) {
  if (!rows?.length) return null;

  const doc = new jsPDF({
    unit: 'pt',
    format: 'letter',
    orientation: 'landscape',
  });

  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();
  const margin = 36;
  const tableW = pageW - margin * 2;
  const startColW = 40;
  const endColW = 40;
  const deltaColW = 36;
  const hasMeds = visibleMeds.length > 0;
  const weekColW = hasMeds ? Math.min(108, tableW * 0.16) : tableW - startColW - endColW - deltaColW - 16;
  const medColW = hasMeds
    ? Math.max(48, (tableW - weekColW - startColW - endColW - deltaColW) / visibleMeds.length)
    : 0;
  const headerMedChars = !hasMeds ? 0 : medColW < 52 ? 10 : medColW < 72 ? 16 : 24;

  const truncate = (str, maxLen) => {
    if (!str || str.length <= maxLen) return str;
    return `${str.slice(0, Math.max(0, maxLen - 1))}…`;
  };

  let y = 40;

  const titleAndMeta = () => {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(28, 28, 32);
    doc.text('PepTalk — Weekly dose & weight change', margin, y);
    y += 16;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(70, 70, 78);
    doc.text(`Week starts on: ${weekStartsOnLabel} · Start / End = scale anchor for that week window`, margin, y);
    y += 12;
    const tw = totalWeightChange;
    const twStr = tw === 0 ? '0.0 lb' : `${tw > 0 ? '+' : ''}${tw.toFixed(1)} lb`;
    doc.text(`Total weight change (rows shown): ${twStr}`, margin, y);
    y += 11;
    doc.setFontSize(8);
    doc.setTextColor(120, 120, 128);
    doc.text(`Generated ${new Date().toLocaleString()} · PepTalk v${appVersion || ''}`, margin, y);
    y += 20;
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
    doc.text('Start', x, y);
    x += startColW;
    doc.text('End', x, y);
    x += endColW;
    doc.text('Δ', x, y);
    y += 7;
    doc.setDrawColor(200, 200, 210);
    doc.line(margin, y, margin + tableW, y);
    y += 11;
    doc.setFont('helvetica', 'normal');
  };

  titleAndMeta();
  tableHeader();

  const rowHeight = 13;
  rows.forEach((row) => {
    if (y > pageH - 36) {
      doc.addPage();
      y = 36;
      tableHeader();
    }

    doc.setFontSize(8);
    doc.setTextColor(35, 35, 42);
    let x = margin;
    const weekText = truncate(`W${row.weekIndex}  ${row.weekLabel}`, 42);
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

    doc.text(row.weekStartWeight != null ? row.weekStartWeight.toFixed(1) : '—', x, y);
    x += startColW;
    doc.text(row.weekEndWeight != null ? row.weekEndWeight.toFixed(1) : '—', x, y);
    x += endColW;

    const wc = row.weightChange;
    const deltaStr = wc == null ? '—' : `${wc > 0 ? '+' : ''}${wc.toFixed(1)}`;
    doc.text(deltaStr, x, y);

    y += rowHeight;
  });

  const filename = `PepTalk-weekly-dose-weight-${new Date().toISOString().slice(0, 10)}.pdf`;
  const blob = doc.output('blob');
  return { blob, filename };
}
