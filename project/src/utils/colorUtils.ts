export function getEventColor(baseColor: string, eventType: 'hold' | 'book' | 'paid'): string {
  const hex = baseColor.replace('#', '');
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);

  switch (eventType) {
    case 'book':
      return `rgb(${r}, ${g}, ${b})`;
    case 'hold':
      const holdR = Math.min(255, r + (255 - r) * 0.5);
      const holdG = Math.min(255, g + (255 - g) * 0.5);
      const holdB = Math.min(255, b + (255 - b) * 0.5);
      return `rgb(${Math.round(holdR)}, ${Math.round(holdG)}, ${Math.round(holdB)})`;
    case 'paid':
      const paidR = Math.round(r * 0.6);
      const paidG = Math.round(g * 0.6);
      const paidB = Math.round(b * 0.6);
      return `rgb(${paidR}, ${paidG}, ${paidB})`;
    default:
      return baseColor;
  }
}

export function getEventBorderColor(baseColor: string, eventType: 'hold' | 'book' | 'paid'): string {
  const hex = baseColor.replace('#', '');
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);

  const darkerR = Math.round(r * 0.7);
  const darkerG = Math.round(g * 0.7);
  const darkerB = Math.round(b * 0.7);

  return `rgb(${darkerR}, ${darkerG}, ${darkerB})`;
}
