import SunCalc from 'suncalc';

export type SunTimes = {
  sunrise: string;
  sunset: string;
  goldenHourAM: string;
  goldenHourPM: string;
};

function formatTime(d: Date): string {
  return d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
}

export function getSunTimesForSpot(lat: number, lng: number, date: Date = new Date()): SunTimes {
  const times = SunCalc.getTimes(date, lat, lng);
  const sunrise = times.sunrise;
  const sunset = times.sunset;
  const goldenStart = new Date(sunrise);
  goldenStart.setMinutes(goldenStart.getMinutes() + 30);
  const goldenEnd = new Date(sunset);
  goldenEnd.setMinutes(goldenEnd.getMinutes() - 30);
  return {
    sunrise: formatTime(sunrise),
    sunset: formatTime(sunset),
    goldenHourAM: `${formatTime(goldenStart)} – ${formatTime(sunrise)}`,
    goldenHourPM: `${formatTime(goldenEnd)} – ${formatTime(sunset)}`,
  };
}
