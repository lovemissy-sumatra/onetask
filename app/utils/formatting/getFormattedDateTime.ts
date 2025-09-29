type DateType = {
    date: string | Date
}

export function getFormattedDateTime({ date }: DateType) {
    const d = new Date(date)

    return d.toLocaleString("en-PH", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    })
}
