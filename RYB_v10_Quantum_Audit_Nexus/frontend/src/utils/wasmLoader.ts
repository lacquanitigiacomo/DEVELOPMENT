// WebAssembly OCR Engine Loader (v10 innovation)
// Carica Tesseract WASM per processing locale ultra-veloce

let tesseractModule: typeof import('tesseract.js') | null = null;

export async function loadWasmOCR(): Promise<typeof import('tesseract.js')> {
  if (tesseractModule) return tesseractModule;

  // In v10, preferiamo la versione WASM bundle che gira nel worker
  const tesseract = await import('tesseract.js');
  tesseractModule = tesseract;
  return tesseract;
}

export async function recognizeLocal(imageData: ImageData, lang = 'ita'): Promise<string> {
  const tesseract = await loadWasmOCR();
  const worker = await tesseract.createWorker(lang);

  const canvas = document.createElement('canvas');
  canvas.width = imageData.width;
  canvas.height = imageData.height;
  const ctx = canvas.getContext('2d')!;
  ctx.putImageData(imageData, 0, 0);

  const result = await worker.recognize(canvas.toDataURL());
  await worker.terminate();

  return result.data.text;
}