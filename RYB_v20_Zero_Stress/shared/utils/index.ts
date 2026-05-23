export const formatCurrency = (amount: number, currency = 'EUR') => {
  return new Intl.NumberFormat('it-IT', { style: 'currency', currency }).format(amount);
};

export const formatDate = (date: string | Date) => {
  return new Intl.DateTimeFormat('it-IT', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(new Date(date));
};

export const clamp = (val: number, min: number, max: number) => Math.min(Math.max(val, min), max);

export const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));
