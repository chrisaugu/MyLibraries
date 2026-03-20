import { EventEmitter } from 'node:events';

// types.ts
interface EventMap {
  'user:created': { id: string; name: string; email: string };
  'user:deleted': { id: string };
  'order:placed': { orderId: string; userId: string; total: number };
}

class EventBus<T, V> extends EventEmitter {
  constructor() {
    super();

    // Increase max listeners if you have many subscribers
    // Default is 10, which may cause warnings in larger apps
    this.setMaxListeners(50);
  }

  // Wrapper method that logs all emitted events for debugging
  // Useful for tracing event flow in development
  emitWithLogging(event: string, ...args: string[]) {
    console.log(`[EventBus] Emitting: ${event}`, args);
    this.emit(event, ...args);
  }

  // Register a one-time listener that automatically removes itself
  // Perfect for events you only need to handle once
  onceAsync(event: string) {
    return new Promise((resolve) => {
      this.once(event, resolve);
    });
  }
}

class TypedEventBus {
  private emitter = new EventEmitter();

  // Generic emit method that enforces payload types
  // TypeScript will error if payload doesn't match EventMap
  emit<K extends keyof EventMap>(event: K, payload: EventMap[K]): void {
    this.emitter.emit(event, payload);
  }

  // Generic listener registration with typed callback
  // Handler receives correctly typed payload automatically
  on<K extends keyof EventMap>(
    event: K,
    handler: (payload: EventMap[K]) => void
  ): void {
    this.emitter.on(event, handler);
  }

  // Remove a specific handler from an event
  off<K extends keyof EventMap>(
    event: K,
    handler: (payload: EventMap[K]) => void
  ): void {
    this.emitter.off(event, handler);
  }
}

export { EventBus, TypedEventBus };
