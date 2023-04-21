import url from 'url';

export function generateBasicAuthUrl(endpoint: string, username: string, password: string) {
  if (!username || !password) {
    throw new Error('Invalid username and password');
  }

  const parsedUrl = url.parse(endpoint);
  const urlParts = [];

  const { protocol, hostname, port, path } = parsedUrl;

  urlParts.push(`${protocol}//`);
  urlParts.push(`${username}:${password}@`);
  urlParts.push(`${hostname}`);

  if (port) {
    urlParts.push(`:${port}`);
  }

  urlParts.push(path);

  return urlParts.join('');
}
