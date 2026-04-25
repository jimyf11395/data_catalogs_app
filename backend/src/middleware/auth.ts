import { createClient, User } from '@supabase/supabase-js';
import { Request, Response, NextFunction } from 'express';

declare global {
  namespace Express {
    interface Request {
      user: User;
    }
  }
}

export const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SECRET_KEY!
);

export async function requireAdmin(req: Request, res: Response, next: NextFunction) {
  const { data } = await supabase
    .from('user_roles')
    .select('role')
    .eq('user_id', req.user.id)
    .single();
  if (data?.role !== 'Admin') {
    res.status(403).json({ error: 'Forbidden: Admin access required' });
    return;
  }
  next();
}

export async function requireAuth(req: Request, res: Response, next: NextFunction) {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }

  const { data: { user }, error } = await supabase.auth.getUser(token);
  if (error || !user) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }

  req.user = user;
  next();
}
