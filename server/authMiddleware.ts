import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { db, UserRecord } from './db.js';
import { UserRole, AuthUser } from '../src/types.js';

const JWT_SECRET = process.env.SESSION_SECRET || 'blueprint_realty_secure_jwt_secret_key_2026_dev';

export interface AuthenticatedRequest extends Request {
  user?: AuthUser;
  rawUser?: UserRecord;
}

export function generateToken(user: UserRecord, rememberMe = false): string {
  const expiresIn = rememberMe ? '30d' : '12h';
  return jwt.sign(
    {
      userId: user.id,
      email: user.email,
      role: user.role
    },
    JWT_SECRET,
    { expiresIn }
  );
}

// Middleware: Authenticate JWT from Authorization header
export function requireAuth(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      error: 'Authentication required. Please sign in to access this feature.'
    });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string; email: string; role: UserRole };
    const userRecord = db.findUserById(decoded.userId);

    if (!userRecord) {
      return res.status(401).json({ error: 'User session invalid. Account may have been removed.' });
    }

    if (userRecord.status === 'SUSPENDED' || userRecord.status === 'DISABLED') {
      return res.status(403).json({ error: 'Your account has been suspended. Please contact your brokerage agent.' });
    }

    req.user = db.sanitizeUser(userRecord);
    req.rawUser = userRecord;
    next();
  } catch (err: any) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Session expired. Please sign in again.' });
    }
    return res.status(401).json({ error: 'Invalid authentication token.' });
  }
}

// Optional Auth (populates req.user if valid token provided, but doesn't block)
export function optionalAuth(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next();
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
    const userRecord = db.findUserById(decoded.userId);
    if (userRecord && userRecord.status === 'ACTIVE') {
      req.user = db.sanitizeUser(userRecord);
      req.rawUser = userRecord;
    }
  } catch {
    // Ignore invalid tokens for optional auth
  }
  next();
}

// Middleware: Enforce Specific Role ('AGENT' | 'CLIENT')
export function requireRole(allowedRole: UserRole) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required.' });
    }

    if (req.user.role !== allowedRole) {
      return res.status(403).json({
        error: `Access forbidden: This action is restricted to users with the ${allowedRole} role.`
      });
    }

    next();
  };
}
