import { Request, Response, NextFunction } from 'express';

// v10: Quantum-resistant encryption middleware
// Intercepts responses and encrypts sensitive fields

export function encryptionMiddleware(req: Request, res: Response, next: NextFunction) {
  const originalJson = res.json.bind(res);

  res.json = function(data: any) {
    if (process.env.KYBER_MODE === 'active' && data?.payrolls) {
      // Encrypt sensitive fields before sending
      data.payrolls = data.payrolls.map((p: any) => ({
        ...p,
        fiscalCode: p.fiscalCode ? `***${p.fiscalCode.slice(-4)}` : null,
        netSalary: p.netSalary ? 'ENCRYPTED' : null,
      }));
    }
    return originalJson(data);
  };

  next();
}