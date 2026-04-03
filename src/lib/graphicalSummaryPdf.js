import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

/**
 * Rasterize a DOM node (charts + chrome) to a multi-page letter PDF.
 */
export async function downloadGraphicalSummaryPdf(element) {
  if (!element) return false;
  const canvas = await html2canvas(element, {
    scale: 2,
    useCORS: true,
    logging: false,
    backgroundColor: '#f1f5f9',
    scrollX: 0,
    scrollY: -window.scrollY,
    windowWidth: element.scrollWidth,
    windowHeight: element.scrollHeight,
  });
  const imgData = canvas.toDataURL('image/png', 0.92);
  const pdf = new jsPDF({ unit: 'pt', format: 'letter', orientation: 'portrait' });
  const margin = 20;
  const pdfW = pdf.internal.pageSize.getWidth();
  const pdfH = pdf.internal.pageSize.getHeight();
  const imgW = pdfW - 2 * margin;
  const imgH = (canvas.height * imgW) / canvas.width;
  const pageContentH = pdfH - 2 * margin;
  let offset = 0;
  while (offset < imgH) {
    if (offset > 0) pdf.addPage();
    pdf.addImage(imgData, 'PNG', margin, margin - offset, imgW, imgH);
    offset += pageContentH;
  }
  pdf.save(`PepTalk-visual-summary-${new Date().toISOString().slice(0, 10)}.pdf`);
  return true;
}
