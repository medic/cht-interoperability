import url from 'url';
import path from 'path';

export function generateBasicAuthUrl(endpoint: string, username: string, password: string) {
  if (!username || !password) {
    throw new Error("Invalid username and password");
  }

  const parsedUrl = url.parse(endpoint);
  const urlParts = [];

  const { protocol, hostname, port, path } = parsedUrl;

  urlParts.push(`${protocol}//`)
  urlParts.push(`${username}:${password}@`)
  urlParts.push(`${hostname}`)

  if (port) {
    urlParts.push(`:${port}`)
  }

  urlParts.push(path)

  return urlParts.join("");
}

export const generateChtRecordsApiUrl = (chtUrl: string, username: string, password: string) => {
  const endpoint = generateBasicAuthUrl(chtUrl, username, password);
  return path.join(endpoint, "/api/v2/records");
}
