import { Request as ExpressRequest } from 'express';

export interface RequestWithCookies extends ExpressRequest {
  cookies: Record<string, string>;
}
