// schoolMode.ts
export function activateSchoolMode(userId: string, role: 'teacher' | 'student') {
  const tier = role === 'teacher' ? 'legacy' : 'supporter';
  const access = {
    vault: role === 'teacher',
    moderation: role === 'teacher',
    creation: true,
    export: role === 'teacher',
  };

  return {
    userId,
    tier,
    access,
    sealed: true, // adult/illegal content blocked
    dashboard: role === 'teacher' ? 'classroom' : null,
  };
}
