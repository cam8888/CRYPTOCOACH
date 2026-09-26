/** Money and percentage formatting, French style (10 000,00 $). */
const usd = new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'USD' });

export function formatUsd(value: number): string {
  return usd.format(value);
}

export function formatPercent(value: number): string {
  const sign = value > 0 ? '+' : '';
  return `${sign}${value.toFixed(2).replace('.', ',')} %`;
}

/** Big amounts in short form: 1,2 k$ / 45,3 M$ / 1 234 Md$. */
export function formatCompactUsd(value: number): string {
  const units: [number, string][] = [[1e9, ' Md$'], [1e6, ' M$'], [1e3, ' k$']];
  for (const [size, label] of units) {
    if (Math.abs(value) >= size) {
      return `${(value / size).toLocaleString('fr-FR', { maximumFractionDigits: 1 })}${label}`;
    }
  }
  return formatUsd(value);
}
