import { DomainEvent } from '../../domain/shared/DomainEvent.js';
import { EventHandler, IEventBus } from '../../application/shared/IEventBus.js';

/**
 * Asynchronous event bus implementation using background workers.
 *
 * Decouples event publishing from event handling by processing events
 * asynchronously. Events are queued and processed by background workers
 * to avoid blocking request handling.
 *
 * In production, this would integrate with a message queue (RabbitMQ, Redis, etc.).
 * For now, we use a simple in-memory queue with async processing.
 *
 * Requirements: 5.9, 25.5
 */
export class AsyncEventBus implements IEventBus {
  private handlers = new Map<string, EventHandler[]>();
  private eventQueue: DomainEvent[] = [];
  private isProcessing = false;
  private readonly maxConcurrentHandlers: number;

  constructor(maxConcurrentHandlers: number = 5) {
    this.maxConcurrentHandlers = maxConcurrentHandlers;
  }

  subscribe<T extends DomainEvent>(eventType: string, handler: EventHandler<T>): void {
    if (!this.handlers.has(eventType)) {
      this.handlers.set(eventType, []);
    }
    this.handlers.get(eventType)!.push(handler as EventHandler);
  }

  async publish(events: DomainEvent[]): Promise<void> {
    // Queue the events for asynchronous processing
    this.eventQueue.push(...events);

    // Start processing if not already running
    if (!this.isProcessing) {
      this.processQueue();
    }
  }

  /**
   * Process queued events asynchronously.
   * Handles events in batches to avoid overwhelming the system.
   */
  private async processQueue(): Promise<void> {
    if (this.isProcessing) {
      return;
    }

    this.isProcessing = true;

    try {
      while (this.eventQueue.length > 0) {
        const batch = this.eventQueue.splice(0, this.maxConcurrentHandlers);
        await Promise.all(batch.map((event) => this.processEvent(event)));
      }
    } finally {
      this.isProcessing = false;
    }
  }

  /**
   * Process a single event by calling all registered handlers.
   */
  private async processEvent(event: DomainEvent): Promise<void> {
    const handlers = this.handlers.get(event.eventType) || [];

    // Execute all handlers for this event type in parallel
    const results = await Promise.allSettled(
      handlers.map((handler) =>
        Promise.resolve().then(() => handler(event)).catch((err) => {
          console.error(`Error handling event ${event.eventType}:`, err);
          throw err;
        }),
      ),
    );

    // Log any handler failures
    for (const result of results) {
      if (result.status === 'rejected') {
        console.error('Event handler failed:', result.reason);
      }
    }
  }

  /**
   * Wait for all queued events to be processed.
   * Useful for testing and graceful shutdown.
   */
  async waitForProcessing(): Promise<void> {
    while (this.isProcessing || this.eventQueue.length > 0) {
      await new Promise((resolve) => setTimeout(resolve, 10));
    }
  }
}
