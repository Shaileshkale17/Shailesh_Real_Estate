const trim = (x) => String(Math.round(x * 100) / 100);
/** 32000000 -> "₹3.2 Cr", 8500000 -> "₹85 L" */
export function formatPrice(n) {
  if (!Number.isFinite(n)) return '';
  if (n >= 1e7) return `₹${trim(n / 1e7)} Cr`;
  if (n >= 1e5) return `₹${trim(n / 1e5)} L`;
  return `₹${n.toLocaleString('en-IN')}`;
}
