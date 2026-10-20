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
  'gaziimerve@gmail.com',
  'mervegazi@gmail.com',
  'mervegazi',
  'gaziimervee',
  'sarah.zelikovitz@csi.cuny.edu',
  'sarah.zelikovitz',
];

/**
 * Checks whether the current user is authorized to view real corporate entity names.
 * Strictly restricted to Merve and Prof. Sarah Zelikovitz.
 * @param {object|null} user - Current user object from AuthContext
 * @returns {boolean}
 */
export function isEnterpriseDataAuthorized(user) {
  if (!user) return false;

  // Unauthenticated / Quick Demo session without password is never authorized
  if (user.email === 'demo@cashpredix.com' || user.id === 'demo-exec-uuid-999') {
    return false;
  }

  if (user.user_metadata?.is_authorized_enterprise === true) {
    return true;
  }

  if (user.id === 'merve-owner-uuid-001' || user.id === 'f1fca857-ef42-40ae-8537-2daf6ba7c937' || user.id === 'sarah-prof-uuid-002') {
    return true;
  }

  const email = (user.email || user.user_metadata?.email || '').toLowerCase().trim();
  if (!email) return false;

  // Match authorized accounts
  return AUTHORIZED_ENTERPRISE_EMAILS.some((allowed) => {
    const cleanAllowed = allowed.toLowerCase().trim();
    if (email === cleanAllowed) return true;
    if (email.startsWith(cleanAllowed) || cleanAllowed.startsWith(email)) return true;
    if (email.includes('gaziimerve') || email.includes('mervegazi') || email.includes('sarah.zelikovitz')) return true;
    return false;
  });
}

/**
 * Resolves the isolated data tenant scope for the current user.
 * Guarantees that:
 * 1. Merve and Prof. Sarah access their enterprise corporate portfolio.
 * 2. Every other / new user receives their own isolated blank/custom dataset.
 * 3. Demo users operate in their synthetic sandbox.
 * @param {object|null} user
 * @returns {{ type: 'enterprise'|'regular'|'demo', key: string, email: string, isEnterprise: boolean }}
 */
export function getUserScope(user) {
  if (!user || (!user.email && !user.id)) {
    return { type: 'demo', key: 'demo', email: 'demo@cashpredix.com', isEnterprise: false };
  }

  const email = (user.email || user.user_metadata?.email || '').toLowerCase().trim();

  // Explicit demo session
  if (email === 'demo@cashpredix.com' || user.id === 'demo-exec-uuid-999') {
    return { type: 'demo', key: 'demo', email: 'demo@cashpredix.com', isEnterprise: false };
  }

  // Enterprise Authorized: Merve Gazi or Prof. Sarah Zelikovitz
  if (isEnterpriseDataAuthorized(user)) {
    const isSarah = email.includes('sarah.zelikovitz') || email.includes('zelikovitz') || user.id === 'sarah-prof-uuid-002';
    if (isSarah) {
      return {
        type: 'enterprise',
        key: 'sarah_enterprise',
        email: 'sarah.zelikovitz@csi.cuny.edu',
        isEnterprise: true,
      };
    }
    return {
      type: 'enterprise',
      key: 'merve_enterprise',
      email: 'gaziimervee@gmail.com',
      isEnterprise: true,
    };
  }

  // Regular / New Registered User: completely isolated storage
  const rawId = email || user.id || 'anonymous_user';
  const sanitized = rawId.replace(/[^a-z0-9]/gi, '_').toLowerCase();
  return {
    type: 'regular',
    key: `usr_${sanitized}`,
    email,
    isEnterprise: false,
  };
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
