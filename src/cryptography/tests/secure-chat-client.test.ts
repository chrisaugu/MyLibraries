import { test } from 'bun:test';
import { SecureChatClient } from '../secure-chat-client';

test.skip('example usage (requires running socket.io server)', async () => {
  const secureChatClient = new SecureChatClient(
    'https://localhost:8443',
    'abc123',
    'abc123'
  );

  await secureChatClient.connect();
  await secureChatClient.sendMessage('abc12', 'hello world');
});
