// ritualScheduler.ts
export interface ScheduledRitual {
  ritualId: string;
  creatorId: string;
  artifactId: string;
  scheduledTime: number;
  type: 'tribute' | 'campaign' | 'remix';
}

const ritualQueue: ScheduledRitual[] = [];

export function scheduleRitual(ritual: ScheduledRitual) {
  ritualQueue.push(ritual);
}

export function getUpcomingRituals(): ScheduledRitual[] {
  const now = Date.now();
  return ritualQueue.filter(r => r.scheduledTime > now);
}
