export const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);

    // Formato DD-MM-AA
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = String(date.getFullYear()).slice(-2); // Toma los últimos 2 dígitos

    // Formato HH:mm
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');

    return `${day}-${month}-${year} ${hours}:${minutes}`;
};

export default formatDate;