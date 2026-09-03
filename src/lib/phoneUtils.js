/**
 * Format téléphonique officiel camerounais conforme : +237 6 XX XX XX XX
 */
export function formatCameroonPhone(raw) {
  if (!raw) return "";
  let s = String(raw).trim();
  if (s.includes("/")) {
    return s.split("/").map(p => formatCameroonPhone(p.trim())).join(" / ");
  }
  let digits = s.replace(/\D/g, "");
  if (digits.startsWith("237")) digits = digits.slice(3);
  if (digits.startsWith("0")) digits = digits.slice(1);

  if (digits.length === 9) {
    const d0 = digits[0];
    const p1 = digits.slice(1, 3);
    const p2 = digits.slice(3, 5);
    const p3 = digits.slice(5, 7);
    const p4 = digits.slice(7, 9);
    return `+237 ${d0} ${p1} ${p2} ${p3} ${p4}`;
  }
  if (digits.length === 8) {
    const p1 = digits.slice(0, 2);
    const p2 = digits.slice(2, 4);
    const p3 = digits.slice(4, 6);
    const p4 = digits.slice(6, 8);
    return `+237 6 ${p1} ${p2} ${p3} ${p4}`;
  }
  return s;
}

export const CAMEROON_PHONE_PLACEHOLDER = "+237 6 XX XX XX XX";
export const CAMEROON_PHONE_EXAMPLE = "+237 6 99 00 11 22";
