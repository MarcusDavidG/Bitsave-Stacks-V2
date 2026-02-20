export const CONTRACT_ERRORS = {
  100: 'No amount provided',
  101: 'Already deposited',
  102: 'Already withdrawn',
  103: 'Lock period still active',
  104: 'No deposit found',
  105: 'Not authorized',
  106: 'Contract paused',
  107: 'Below minimum deposit',
  108: 'Exceeds maximum deposit',
  109: 'Cooldown period active',
  110: 'Invalid lock period',
  111: 'Goal not reached',
  112: 'Invalid referrer'
} as const;

export function getErrorMessage(code: number): string {
  return CONTRACT_ERRORS[code as keyof typeof CONTRACT_ERRORS] || `Unknown error (${code})`;
}
