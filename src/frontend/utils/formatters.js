/**
 * Format angka atau string ke mata uang Rupiah Indonesia (Rp)
 */
export function formatRupiah(val) {
  if (val === undefined || val === null || val === '') return 'Rp 0';
  const num = parseFloat(val);
  if (isNaN(num)) return 'Rp 0';
  if (num === 0) return '-';
  const formatted = Math.abs(num).toLocaleString('id-ID', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  });
  return (num < 0 ? '-Rp ' : 'Rp ') + formatted;
}
