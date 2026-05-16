/**
 * Escape user-provided text before injecting into HTML.
 * Astro escapes by default, but we need this for innerHTML usage in client scripts.
 */
export function escapeHtml(s: string | null | undefined): string {
  if (s == null) return '';
  return String(s).replace(/[&<>"']/g, (c) => {
    const map: Record<string, string> = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;',
    };
    return map[c] ?? c;
  });
}

/** Generate a customer-facing order ID like CLV-123456. */
export function generateOrderId(): string {
  return 'CLV-' + Date.now().toString().slice(-6);
}

/** Format a price as `PKR 2,400`. */
export function formatPkr(amount: number): string {
  return `PKR ${amount.toLocaleString('en-PK')}`;
}

/** Format a date in Pakistan locale. */
export function formatDate(iso: string | Date): string {
  return new Date(iso).toLocaleString('en-PK');
}

/** Show a toast message via the global #toast element (defined in BaseLayout). */
export function showToast(message: string, durationMs = 3000) {
  if (typeof document === 'undefined') return;
  const el = document.getElementById('toast');
  if (!el) return;
  el.textContent = message;
  el.classList.add('show');
  window.setTimeout(() => el.classList.remove('show'), durationMs);
}
