export function formatWeight(weight: number, unit: string = 'kg', decimals: number = 2): string {
    if (weight === undefined || weight === null) return '0.00';

    const formatted = Number(weight).toFixed(decimals);

    // Optional: add thousands separator if needed
    // return formatted.replace(/\B(?=(\d{3})+(?!\d))/g, ",");

    return formatted;
}
