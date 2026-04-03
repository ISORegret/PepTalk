/** Hours slept from same-calendar bed date; wake next morning if wake clock ≤ bed clock. */
export function computeSleepHours(bedDateStr, bedTime, wakeTime) {
  if (!bedDateStr || !bedTime || !wakeTime) return null;
  const [bh, bm] = bedTime.split(':').map(Number);
  const [wh, wm] = wakeTime.split(':').map(Number);
  if (!Number.isFinite(bh) || !Number.isFinite(bm) || !Number.isFinite(wh) || !Number.isFinite(wm)) return null;
  const bed = new Date(bedDateStr + 'T12:00:00');
  bed.setHours(bh, bm, 0, 0);
  const wake = new Date(bedDateStr + 'T12:00:00');
  wake.setHours(wh, wm, 0, 0);
  if (wake.getTime() <= bed.getTime()) wake.setDate(wake.getDate() + 1);
  const h = (wake - bed) / (1000 * 60 * 60);
  return h > 0 && h <= 24 ? Math.round(h * 10) / 10 : null;
}
