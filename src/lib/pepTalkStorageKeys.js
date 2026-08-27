/**
 * All localStorage keys PepTalk uses for health data (cloud backup restores these).
 */
export const PEPTALK_HEALTH_STORAGE_KEYS = [
  'health-weight-entries',
  'health-injection-entries',
  'health-user-profile',
  'health-measurements',
  'health-photos',
  'health-schedules',
  'health-titration',
  'health-journal',
  'health-fasting-entries',
  'health-notification-settings',
  'health-daily-track',
  'health-glucose-entries',
  'health-a1c-entries',
  'health-lab-entries',
  'health-vials',
  'health-blend-conversions',
  'health-insights-inactive-meds',
  'health-weekly-dose-weight-excluded-meds',
  'health-goals-user-stack',
  'health-sleep-entries',
];

/** Optional UI prefs (small; safe to sync) */
export const PEPTALK_OPTIONAL_STORAGE_KEYS = [
  'peptalk-welcome-version',
  'peptalk-welcome-hide-forever',
  'health-weekly-dose-week-starts-on',
  'peptalk-cloud-opt-out',
];
