/**
 * CashPredix - Enterprise Dataset Access Whitelist & Privacy Policy
 * Controls access to proprietary/real enterprise counterparty names (e.g. Tier-1 banks, conglomerates).
 * 
 * Rules:
 * 1. Authorized accounts (Merve & Professor) have full access to canonical Tier-1 corporate customer portfolios.
 * 2. Unauthenticated exploration, guest sessions, and 'Quick Demo' sessions receive realistic synthetic anonymized data.
 * 3. Temporary test/scratch companies created during testing are filtered out from the official view.
 */

export const AUTHORIZED_ENTERPRISE_EMAILS = [
  'gaziimervee@gmail.com',
  'gaziimervee@gmail',
  'sarah.zelikovitz@csi.cuny.edu',
];

/**
 * Checks whether the current user is authorized to view real corporate entity names.
 * Strictly restricted to Merve (gaziimervee@gmail.com) and Prof. Sarah Zelikovitz (sarah.zelikovitz@csi.cuny.edu).
 * @param {object|null} user - Current user object from AuthContext
 * @returns {boolean}
 */
export function isEnterpriseDataAuthorized(user) {
  if (!user || !user.email) return false;

  // Unauthenticated / Quick Demo session without password is never authorized
  if (user.email === 'demo@cashpredix.com' || user.id === 'demo-exec-uuid-999') {
    return false;
  }

  const emailLower = user.email.toLowerCase().trim();

  // Strict equality check against authorized accounts
  return AUTHORIZED_ENTERPRISE_EMAILS.some((allowed) => {
    const cleanAllowed = allowed.toLowerCase().trim();
    if (emailLower === cleanAllowed) return true;
    // Allow gaziimervee@gmail to match gaziimervee@gmail.com
    if (cleanAllowed === 'gaziimervee@gmail' && emailLower === 'gaziimervee@gmail.com') return true;
    if (cleanAllowed === 'gaziimervee@gmail.com' && emailLower === 'gaziimervee@gmail') return true;
    return false;
  });
}

/**
 * Filter out scratch test companies created during development testing.
 * Keeps canonical companies and legitimate user-added companies.
 * @param {object} company
 * @returns {boolean} true if company is a temporary test artifact
 */
export function isTestCompany(company) {
  if (!company) return true;
  const id = (company.id || '').toLowerCase().trim();
  const name = (company.name || '').toLowerCase().trim();

  // Canonical companies are always preserved
  if (['comp-cashpredix', 'comp-apex', 'comp-vanguard', 'comp-quantum'].includes(id)) {
    return false;
  }

  // Check for test keywords
  const testKeywords = ['test', 'deneme', 'sample', 'asdasd', 'demo-company', 'foo', 'bar'];
  return testKeywords.some((kw) => name.includes(kw) || id.includes(kw)) || name.length < 3;
}
