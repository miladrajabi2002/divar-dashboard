const FA_DIGITS = "۰۱۲۳۴۵۶۷۸۹";

export function faToNumber(fa: string): number {
  const normalized = fa
    .replace(/[۰-۹]/g, (d) => String(FA_DIGITS.indexOf(d)))
    .replace(/[٬,،]/g, "")
    .replace(/[^0-9.-]/g, "");
  return parseInt(normalized, 10) || 0;
}

export function numberToFa(n: number): string {
  return n.toString().replace(/[0-9]/g, (d) => FA_DIGITS[parseInt(d)]);
}

export function toEnglishDigits(s: string): string {
  return s.replace(/[۰-۹]/g, (d) => String(FA_DIGITS.indexOf(d)));
}

export function formatNumber(n: number): string {
  return n.toLocaleString("en-US");
}

// Persian (Jalali) date labels from Divar look like "۰۳/۲۳" (month/day, no year).
// Returns a sortable key (month * 100 + day) — good enough for sorting within a year.
export function parsePersianDateLabel(label: string): number {
  const [m, d] = toEnglishDigits(label).split("/").map((x) => parseInt(x, 10) || 0);
  return m * 100 + d;
}

export function parseJwtExpiry(token: string): Date {
  try {
    const payload = JSON.parse(
      Buffer.from(token.split(".")[1], "base64url").toString()
    );
    return new Date(payload.exp * 1000);
  } catch {
    // default 3 hours if parse fails
    return new Date(Date.now() + 3 * 60 * 60 * 1000);
  }
}

export function extractPhoneFromJwt(token: string): string | null {
  try {
    const payload = JSON.parse(
      Buffer.from(token.split(".")[1], "base64url").toString()
    );
    return payload.phoneNumber ?? null;
  } catch {
    return null;
  }
}
