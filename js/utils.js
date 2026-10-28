export function formatCurrency(amount) {
    const value = Number(amount);
    if (!Number.isFinite(value)) {
        return "₹0";
    }
    if (Math.abs(value) >= 10000000) {
        return "₹"+(value / 10000000).toFixed(2)+" Cr";
    }
    if (Math.abs(value) >= 100000) {
        return "₹"+(value / 100000).toFixed(2)+" L";
    }
    return new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 0
    }).format(value);
}
