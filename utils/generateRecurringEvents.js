// utils/generateRecurringEvents.js

export function generateRecurringEvents(baseDate, frequency, endDate = null, selectedDates = []) {
  const [year, month, day] = baseDate.split('-').map(Number);
  const start = new Date(year, month - 1, day);
  const results = [];

  const pad = (n) => n.toString().padStart(2, '0');
  const format = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

  const isBeforeOrSame = (a, b) => a.getTime() <= b.getTime();
  const limitDate = endDate ? new Date(...endDate.split('-').map((n, i) => i === 1 ? Number(n) - 1 : Number(n))) : null;
  const maxIterations = 36; // fallback to max 36 recurrences if no endDate (3 years worth monthly)

  switch (frequency) {
    case 'One Time':
      return [format(start)];

    case 'Weekly': {
      for (let i = 0; i < maxIterations; i++) {
        const next = new Date(start.getFullYear(), start.getMonth(), start.getDate() + i * 7);
        if (limitDate && !isBeforeOrSame(next, limitDate)) break;
        results.push(format(next));
        if (!limitDate && results.length === 6) break;
      }
      break;
    }

    case 'Bi-Weekly': {
      for (let i = 0; i < maxIterations; i++) {
        const next = new Date(start.getFullYear(), start.getMonth(), start.getDate() + i * 14);
        if (limitDate && !isBeforeOrSame(next, limitDate)) break;
        results.push(format(next));
        if (!limitDate && results.length === 6) break;
      }
      break;
    }

    case 'Same Day of the Month': {
      const dayOfMonth = start.getDate();
      for (let i = 0; i < maxIterations; i++) {
        const next = new Date(start.getFullYear(), start.getMonth() + i, dayOfMonth);
        if (next.getDate() !== dayOfMonth) continue;
        if (limitDate && !isBeforeOrSame(next, limitDate)) break;
        results.push(format(next));
        if (!limitDate && results.length === 6) break;
      }
      break;
    }

    case 'Same Weekday of the Month': {
      const weekday = start.getDay();
      const weekIndex = Math.floor((start.getDate() - 1) / 7);
      for (let i = 0; i < maxIterations; i++) {
        const targetMonth = start.getMonth() + i;
        const targetYear = start.getFullYear();
        let count = 0;
        for (let d = 1; d <= 31; d++) {
          const current = new Date(targetYear, targetMonth, d);
          if (current.getMonth() !== (targetMonth % 12)) break;
          if (current.getDay() === weekday) {
            if (count === weekIndex) {
              if (limitDate && !isBeforeOrSame(current, limitDate)) break;
              results.push(format(current));
              break;
            }
            count++;
          }
        }
        if (!limitDate && results.length === 6) break;
      }
      break;
    }

    case 'Select Multiple Dates': {
      return selectedDates.map((d) => {
        const [y, m, da] = d.split('-').map(Number);
        return format(new Date(y, m - 1, da));
      });
    }

    default:
      return [format(start)];
  }

  return results;
}
