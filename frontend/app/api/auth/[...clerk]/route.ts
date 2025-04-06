import { authMiddleware } from '@clerk/nextjs/server';

export const GET = authMiddleware();
export const POST = authMiddleware();
