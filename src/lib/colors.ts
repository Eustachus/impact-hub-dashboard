// List of bright, professional luxury palette colors
const luxuryColors = [
  { bg: 'bg-[#FF3366]', text: 'text-white', light: 'bg-[#FF3366]/10', border: 'border-[#FF3366]' },   // Vibrant Pink
  { bg: 'bg-[#00D4FF]', text: 'text-white', light: 'bg-[#00D4FF]/10', border: 'border-[#00D4FF]' },   // Cyan
  { bg: 'bg-[#6C5CE7]', text: 'text-white', light: 'bg-[#6C5CE7]/10', border: 'border-[#6C5CE7]' },   // Purple
  { bg: 'bg-[#FFB86C]', text: 'text-rich',  light: 'bg-[#FFB86C]/10', border: 'border-[#FFB86C]' },   // Soft Orange
  { bg: 'bg-[#2ECC71]', text: 'text-white', light: 'bg-[#2ECC71]/10', border: 'border-[#2ECC71]' },   // Green
  { bg: 'bg-[#E84393]', text: 'text-white', light: 'bg-[#E84393]/10', border: 'border-[#E84393]' },   // Rose
  { bg: 'bg-[#0984E3]', text: 'text-white', light: 'bg-[#0984E3]/10', border: 'border-[#0984E3]' },   // Strong Blue
  { bg: 'bg-[#F1C40F]', text: 'text-rich',  light: 'bg-[#F1C40F]/10', border: 'border-[#F1C40F]' },   // Gold
  { bg: 'bg-[#FD79A8]', text: 'text-white', light: 'bg-[#FD79A8]/10', border: 'border-[#FD79A8]' },   // Pink/Peach
  { bg: 'bg-[#1ABC9C]', text: 'text-white', light: 'bg-[#1ABC9C]/10', border: 'border-[#1ABC9C]' },   // Teal
];

export function getTaskColor(id: string) {
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = id.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash % luxuryColors.length);
  return luxuryColors[index];
}
