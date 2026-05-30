const DATE_LOCALE = "en-US";

type dateInput = string | null | undefined;

export function formatDateTime(dateStr: dateInput): string {
    if (!dateStr) return "";
    return new Date(dateStr).toLocaleString(DATE_LOCALE, {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });
}

export function formatDate(dateStr: dateInput): string {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    return d.toLocaleDateString(DATE_LOCALE, { month: "short", day: "numeric" });
}

export const getTimeStamp = (dateStr: dateInput): number => {
    if (!dateStr) return 0;
    return new Date(dateStr).getTime();
};
