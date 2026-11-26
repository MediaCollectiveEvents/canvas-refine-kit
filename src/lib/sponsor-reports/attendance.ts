export const attendanceLabels = {
  attended: 'Attended',
  unable_to_attend: 'Unable to attend',
  no_show: 'No show',
  unconfirmed: 'Unconfirmed',
} as const;

export type AttendanceStatus = keyof typeof attendanceLabels;
export type AttendanceReport = {
  closesAt: string | null;
  statuses: Record<string, AttendanceStatus>;
};
