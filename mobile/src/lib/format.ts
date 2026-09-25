/** Money and percentage formatting, French style (10 000,00 $). */
const usd = new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'USD' });

export function formatUsd(value: number): string {
  return usd.format(value);
}

export function formatPercent(value: number): string {
  const sign = value > 0 ? '+' : '';
  return `${sign}${value.toFixed(2).replace('.', ',')} %`;
}
