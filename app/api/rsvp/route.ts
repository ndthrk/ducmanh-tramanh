import { createRsvpHandler } from '@/src/lib/rsvp-handler';

export const runtime = 'nodejs';
export const maxDuration = 30;

export async function POST(request: Request) {
  return createRsvpHandler({
    url: process.env.RSVP_APPS_SCRIPT_URL,
    secret: process.env.RSVP_APPS_SCRIPT_SECRET,
  })(request);
}
