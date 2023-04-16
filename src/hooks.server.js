import { getCurrentUser } from '$lib/api';

export async function handle({ event, resolve }) {
  // Expose `as` cookie (holding the currently active guest origin) to locals
  event.locals.as = event.cookies.get('as');
  event.locals.user = await getCurrentUser(event.cookies.get('sessionid'));
  const response = await resolve(event);
  return response;
}
