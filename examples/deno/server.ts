import { serve } from 'https://deno.land/std@0.224.0/http/server.ts';

const port = 3000;

async function handleRequest(request: Request): Promise<Response> {
  const url = new URL(request.url);
  let filepath = url.pathname;
  if (filepath === '/') {
    filepath = '/index.html';
  }

  try {
    const file = await Deno.readFile(`.${filepath}`);
    return new Response(file);
  } catch {
    return new Response('404 Not Found', { status: 404 });
  }
}

await serve(handleRequest, { port });
