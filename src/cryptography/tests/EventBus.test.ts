import { expect, test } from 'bun:test';
import { EventBus, TypedEventBus } from '../EventBus';

test('EventBus emits events', () => {
  const bus = new EventBus<string, any>();
  let handled = false;

  bus.on('user:created', (payload: any) => {
    handled = payload.name === 'Alice';
  });

  bus.emit('user:created', { name: 'Alice' });
  expect(handled).toBe(true);
});

test('TypedEventBus emits typed events', () => {
  const bus = new TypedEventBus();
  let handled = false;

  bus.on('user:created', (payload) => {
    handled = payload.name === 'Alice';
  });

  bus.emit('user:created', { id: '1', name: 'Alice', email: 'a@b.com' });
  expect(handled).toBe(true);
});
