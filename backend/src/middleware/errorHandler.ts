import { Request, Response, NextFunction } from 'express';

// ─── Error Handler Middleware ────────────────────────────────────────────────

export function errorHandler(err: Error, req: Request, res: Response, next: NextFunction) {
  console.error(`[${new Date().toISOString()}] ${req.method} ${req.path}:`, err.message);

  // Prisma errors
  if (err.name === 'PrismaClientKnownRequestError') {
    const prismaErr = err as any;
    switch (prismaErr.code) {
      case 'P2002':
        return res.status(409).json({ error: 'Duplicate entry', field: prismaErr.meta?.target });
      case 'P2025':
        return res.status(404).json({ error: 'Not found' });
      default:
        return res.status(400).json({ error: 'Database error', code: prismaErr.code });
    }
  }

  // Validation errors
  if (err.name === 'ValidationError') {
    return res.status(400).json({ error: err.message });
  }

  // Default
  res.status(500).json({ error: 'Internal server error' });
}

// ─── 404 Handler ─────────────────────────────────────────────────────────────

export function notFound(req: Request, res: Response) {
  res.status(404).json({ error: 'Not found' });
}
