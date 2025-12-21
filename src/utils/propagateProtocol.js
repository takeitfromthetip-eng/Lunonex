import { streamBlob } from './blobStreamer';
import { proxyAgent } from './proxyAgent';

export const propagateProtocol = async (payload) => {
  const stream = await streamBlob(payload);
  const response = await fetch('https://sovereign.fortheweebs.app/propagate', {
    method: 'POST',
    body: stream,
    agent: proxyAgent(),
    headers: {
      'Content-Type': 'application/octet-stream',
    },
  });

  if (!response.ok) throw new Error('Protocol propagation failed');
  return await response.json();
};
