import { cvToValue, hexToCV } from '@stacks/transactions';

export function parseContractResponse<T>(response: any): T | null {
  try {
    if (!response || !response.value) return null;
    const cv = hexToCV(response.value);
    return cvToValue(cv) as T;
  } catch (error) {
    console.error('Failed to parse contract response:', error);
    return null;
  }
}

export function extractErrorCode(error: any): number | null {
  try {
    if (error?.value?.value) {
      return Number(error.value.value);
    }
    return null;
  } catch {
    return null;
  }
}
