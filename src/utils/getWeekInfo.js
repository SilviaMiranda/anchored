/**
 * Unified helper to get week information (custody status, mode, display names)
 * Checks exception override first, then falls back to routine data
 */

function getModeName(mode, kidsWeek) {
  if (kidsWeek) {
    if (mode === 'regular') return { emoji: '🟢', name: 'Regular' };
    if (mode === 'hard') return { emoji: '🟡', name: 'Hard' };
    if (mode === 'hardest') return { emoji: '🔴', name: 'Survival' };
  } else {
    if (mode === 'regular') return { emoji: '🟢', name: 'Regular Solo' };
    if (mode === 'hard') return { emoji: '🟡', name: 'Recovery' };
    if (mode === 'hardest') return { emoji: '🔴', name: 'Hustle' };
  }
  return { emoji: '🟢', name: 'Regular' };
}

export function getWeekInfo(routine, custodySettings = null) {
  if (!routine) {
    return {
      hasKids: true,
      custodyDisplay: '👨‍👩‍👧‍👦 Kids with you',
      mode: 'regular',
      modeDisplay: { emoji: '🟢', name: 'Regular' }
    };
  }

  // Check exception first - it overrides everything
  if (routine?.weekException?.kidsWithYou !== undefined) {
    const kidsWithYou = routine.weekException.kidsWithYou;
    const mode = routine.mode || 'regular';
    return {
      hasKids: kidsWithYou,
      custodyDisplay: kidsWithYou 
        ? '👶 Kids with you this week' 
        : '🏠 Kids at dad\'s this week',
      mode: mode,
      modeDisplay: getModeName(mode, kidsWithYou)
    };
  }

  // Otherwise use routine's stored value
  const kidsWithYou = routine?.kidsWithUser !== false;
  const mode = routine.mode || 'regular';
  return {
    hasKids: kidsWithYou,
    custodyDisplay: kidsWithYou 
      ? '👨‍👩‍👧‍👦 Kids with you this week' 
      : '🏠 Kids at dad\'s this week',
    mode: mode,
    modeDisplay: getModeName(mode, kidsWithYou)
  };
}

