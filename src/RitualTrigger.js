export function renderRitualTrigger(ritualName) {
  return `
    <button onclick="triggerRitual('${ritualName}')">Start ${ritualName}</button>
  `;
}
