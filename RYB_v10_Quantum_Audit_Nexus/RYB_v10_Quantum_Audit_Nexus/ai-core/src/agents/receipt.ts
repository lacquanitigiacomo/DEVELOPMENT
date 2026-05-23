export const receiptAgent = {
  async scan(imageBase64OrUrl: string) {
    // Zero-cash: simula OCR con dati strutturati
    // In produzione: Tesseract.js (client-side, free) o Ollama vision

    const mockItems = [
      { name: 'Pane', price: 2.50 },
      { name: 'Latte', price: 1.80 },
      { name: 'Pasta', price: 1.20 },
      { name: 'Yogurt', price: 3.40 },
    ];

    const total = mockItems.reduce((s, i) => s + i.price, 0);

    return {
      merchant: 'Supermercato Demo',
      date: new Date().toISOString().split('T')[0],
      items: mockItems,
      total,
      currency: 'EUR',
      category: 'Alimentari',
      confidence: 0.92,
      raw: imageBase64OrUrl.slice(0, 50) + '...',
    };
  },
};
