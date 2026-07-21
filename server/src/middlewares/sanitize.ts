import { Request, Response, NextFunction } from 'express';

const sanitizeValue = (val: any): any => {
  if (typeof val === 'string') {
    // Strip malicious script tags while preserving URLs, slashes, quotes, and password characters
    return val.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '').trim();
  }
  if (Array.isArray(val)) {
    return val.map(sanitizeValue);
  }
  if (val && typeof val === 'object') {
    const cleaned: any = {};
    for (const key in val) {
      if (Object.prototype.hasOwnProperty.call(val, key)) {
        cleaned[key] = sanitizeValue(val[key]);
      }
    }
    return cleaned;
  }
  return val;
};

export const sanitizeMiddleware = (req: Request, res: Response, next: NextFunction) => {
  if (req.body) req.body = sanitizeValue(req.body);
  if (req.query) req.query = sanitizeValue(req.query);
  if (req.params) req.params = sanitizeValue(req.params);
  next();
};
