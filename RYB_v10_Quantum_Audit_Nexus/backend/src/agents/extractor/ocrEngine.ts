import Tesseract from 'tesseract.js';
import sharp from 'sharp';
import pdfParse from 'pdf-parse';
import { v4 as uuidv4 } from 'uuid';

export interface ExtractedDocument {
  id: string;
  rawText: string;
  confidence: number;
  pages: ExtractedPage[];
  classification: 'payroll' | 'timesheet' | 'cu' | 'unknown';
  fields: Record<string, string | number>;
}

interface ExtractedPage {
  pageNum: number;
  text: string;
  confidence: number;
}

export class OcrEngine {
  private worker: Tesseract.Worker | null = null;

  async initialize() {
    this.worker = await Tesseract.createWorker('ita+eng');
  }

  async processDocument(filePath: string, mimeType: string): Promise<ExtractedDocument> {
    const id = uuidv4();
    let pages: ExtractedPage[] = [];
    let classification: ExtractedDocument['classification'] = 'unknown';

    if (mimeType === 'application/pdf') {
      const pdfBuffer = await require('fs').promises.readFile(filePath);
      const pdfData = await pdfParse(pdfBuffer);

      // Se il PDF ha testo estraibile
      if (pdfData.text && pdfData.text.length > 100) {
        pages = [{
          pageNum: 1,
          text: pdfData.text,
          confidence: 95
        }];
      } else {
        // PDF scansionato — converti in immagini
        pages = await this.processScannedPdf(filePath);
      }
    } else {
      // Immagine diretta
      const processed = await this.preprocessImage(filePath);
      const result = await this.worker!.recognize(processed);
      pages = [{
        pageNum: 1,
        text: result.data.text,
        confidence: result.data.confidence
      }];
    }

    const rawText = pages.map(p => p.text).join('\n---\n');
    classification = this.classifyDocument(rawText);
    const fields = this.extractFields(rawText);
    const avgConfidence = pages.reduce((s, p) => s + p.confidence, 0) / pages.length;

    return {
      id,
      rawText,
      confidence: avgConfidence,
      pages,
      classification,
      fields
    };
  }

  private async preprocessImage(imagePath: string): Promise<string> {
    const tempPath = `/tmp/ryb_ocr_${Date.now()}.png`;
    await sharp(imagePath)
      .grayscale()
      .normalize()
      .sharpen({ sigma: 1.5, flat: 1, jagged: 2 })
      .modulate({ brightness: 1.1, contrast: 1.2 })
      .toFile(tempPath);
    return tempPath;
  }

  private async processScannedPdf(pdfPath: string): Promise<ExtractedPage[]> {
    // In v10, usiamo pdf2pic per estrarre immagini
    const { fromPath } = require('pdf2pic');
    const convert = fromPath(pdfPath, {
      density: 300,
      format: 'png',
      width: 2480,
      height: 3508,
      preserveAspectRatio: true
    });

    const images = await convert.bulk(-1);
    const pages: ExtractedPage[] = [];

    for (let i = 0; i < images.length; i++) {
      const processed = await this.preprocessImage(images[i].path);
      const result = await this.worker!.recognize(processed);
      pages.push({
        pageNum: i + 1,
        text: result.data.text,
        confidence: result.data.confidence
      });
    }

    return pages;
  }

  private classifyDocument(text: string): ExtractedDocument['classification'] {
    const lower = text.toLowerCase();
    if (lower.includes('cedolino') || lower.includes('busta paga') || lower.includes('retribuzione')) {
      return 'payroll';
    }
    if (lower.includes('orario') || lower.includes('timbratura') || lower.includes('badge')) {
      return 'timesheet';
    }
    if (lower.includes('certificazione unica') || lower.includes('modello cu')) {
      return 'cu';
    }
    return 'unknown';
  }

  private extractFields(text: string): Record<string, string | number> {
    const fields: Record<string, string | number> = {};
    const lines = text.split('\n');

    // Regex euristiche per buste paga italiane
    const patterns = [
      { key: 'employeeName', regex: /(?:dipendente|nominativo|cognome e nome)[\s:]*([A-Z][a-z]+(?:\s+[A-Z][a-z]+)+)/i },
      { key: 'fiscalCode', regex: /(?:codice fiscale|cf)[\s:]*([A-Z]{3}[A-Z]{3}\d{2}[A-Z]\d{2}[A-Z]\d{3}[A-Z])/i },
      { key: 'grossSalary', regex: /(?:retribuzione lorda|lordo)[\s:]*([\d.,]+)/i },
      { key: 'netSalary', regex: /(?:netto da pagare|importo netto)[\s:]*([\d.,]+)/i },
      { key: 'month', regex: /(?:mese di|riferimento al mese)[\s:]*(\d{1,2})/i },
      { key: 'year', regex: /(?:anno|riferimento all'anno)[\s:]*(\d{4})/i },
      { key: 'ccnl', regex: /(?:ccnl|contratto)[\s:]*([A-Z][A-Z\s]+)/i },
    ];

    for (const pattern of patterns) {
      const match = text.match(pattern.regex);
      if (match) {
        const value = match[1].replace(/\./g, '').replace(/,/g, '.');
        const numValue = parseFloat(value);
        fields[pattern.key] = isNaN(numValue) ? match[1] : numValue;
      }
    }

    return fields;
  }

  async terminate() {
    if (this.worker) {
      await this.worker.terminate();
    }
  }
}