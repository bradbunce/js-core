import type { Storage } from '@launchdarkly/js-client-sdk-common';

import validateOptions from '../src/options';
import { createMockLogger } from './testHelpers';

let logger: ReturnType<typeof createMockLogger>;

beforeEach(() => {
  logger = createMockLogger();
});

it('leaves storage undefined when no option is provided', () => {
  const validated = validateOptions({}, logger);
  expect(validated.storage).toBeUndefined();
  expect(logger.warn).not.toHaveBeenCalled();
});

it('accepts { type: "file" } with no localStoragePath', () => {
  const validated = validateOptions({ storage: { type: 'file' } }, logger);
  expect(validated.storage).toEqual({ type: 'file' });
  expect(logger.warn).not.toHaveBeenCalled();
});

it('accepts { type: "file", localStoragePath } with a string path', () => {
  const validated = validateOptions(
    { storage: { type: 'file', localStoragePath: '/var/cache/ld' } },
    logger,
  );
  expect(validated.storage).toEqual({ type: 'file', localStoragePath: '/var/cache/ld' });
  expect(logger.warn).not.toHaveBeenCalled();
});

it('accepts { type: "custom", implementation } with a valid Storage shape', () => {
  const implementation: Storage = {
    get: async () => null,
    set: async () => {},
    clear: async () => {},
  };
  const validated = validateOptions({ storage: { type: 'custom', implementation } }, logger);
  expect(validated.storage).toEqual({ type: 'custom', implementation });
  expect(logger.warn).not.toHaveBeenCalled();
});

it('rejects an unknown discriminator value and warns', () => {
  const validated = validateOptions(
    { storage: { type: 'memory' as any, localStoragePath: '/tmp' } } as any,
    logger,
  );
  expect(validated.storage).toBeUndefined();
  expect(logger.warn).toHaveBeenCalledWith(expect.stringContaining('storage'));
});

it('rejects { type: "file", localStoragePath: number } and warns', () => {
  const validated = validateOptions(
    { storage: { type: 'file', localStoragePath: 12345 as any } } as any,
    logger,
  );
  expect(validated.storage).toBeUndefined();
  expect(logger.warn).toHaveBeenCalledWith(expect.stringContaining('storage'));
});

it('rejects { type: "custom", implementation: invalid } and warns', () => {
  const validated = validateOptions(
    { storage: { type: 'custom', implementation: { get: 'not-a-fn' } as any } } as any,
    logger,
  );
  expect(validated.storage).toBeUndefined();
  expect(logger.warn).toHaveBeenCalledWith(expect.stringContaining('storage'));
});

it('rejects a non-object storage value and warns', () => {
  const validated = validateOptions({ storage: 'file' as any }, logger);
  expect(validated.storage).toBeUndefined();
  expect(logger.warn).toHaveBeenCalledWith(expect.stringContaining('storage'));
});
