export function discountFromEnv(): { discountCode: string; discountPercent: number } {
  return {
    discountCode: (process.env.DISCOUNT_CODE ?? "").trim().toUpperCase(),
    discountPercent: Number(process.env.DISCOUNT_PERCENT ?? "0"),
  };
}
