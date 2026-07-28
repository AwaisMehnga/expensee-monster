/** Dollars string → integer cents. */
export const toCents = (v: string) => Math.round(Number(v || 0) * 100)
