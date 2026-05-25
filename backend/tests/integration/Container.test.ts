import { describe, it, expect, beforeEach } from 'vitest';
import { Container } from '../../src/infrastructure/di/container.js';

interface IService {
  getValue(): string;
}

class ServiceA implements IService {
  getValue() { return 'A'; }
}

class ServiceB implements IService {
  getValue() { return 'B'; }
}

describe('Container', () => {
  let container: Container;

  beforeEach(() => {
    container = new Container();
  });

  it('should resolve a registered singleton', () => {
    container.registerSingleton<IService>('IService', () => new ServiceA());
    const service = container.resolve<IService>('IService');
    expect(service.getValue()).toBe('A');
  });

  it('should return the same instance for singletons', () => {
    container.registerSingleton<IService>('IService', () => new ServiceA());
    const a = container.resolve<IService>('IService');
    const b = container.resolve<IService>('IService');
    expect(a).toBe(b);
  });

  it('should return different instances for transient registrations', () => {
    container.registerTransient<IService>('IService', () => new ServiceA());
    const a = container.resolve<IService>('IService');
    const b = container.resolve<IService>('IService');
    expect(a).not.toBe(b);
  });

  it('should throw when resolving an unregistered token', () => {
    expect(() => container.resolve('UnknownService')).toThrow(
      'No registration found for token: UnknownService'
    );
  });

  it('should report has() correctly', () => {
    container.registerSingleton('MyService', () => new ServiceA());
    expect(container.has('MyService')).toBe(true);
    expect(container.has('OtherService')).toBe(false);
  });

  it('should clear all registrations', () => {
    container.registerSingleton('MyService', () => new ServiceA());
    container.clear();
    expect(container.has('MyService')).toBe(false);
  });

  it('should support symbol tokens', () => {
    const TOKEN = Symbol('IService');
    container.registerSingleton<IService>(TOKEN, () => new ServiceB());
    const service = container.resolve<IService>(TOKEN);
    expect(service.getValue()).toBe('B');
  });

  it('should support class constructor tokens', () => {
    container.registerSingleton(ServiceA, () => new ServiceA());
    const service = container.resolve(ServiceA);
    expect(service.getValue()).toBe('A');
  });
});
