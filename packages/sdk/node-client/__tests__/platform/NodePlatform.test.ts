import * as fs from 'fs/promises';
import * as os from 'os';
import * as path from 'path';

import type { Storage } from '@launchdarkly/js-client-sdk-common';

import { createMockLogger } from '../testHelpers';
import { resetNodeStorage } from '../../src/platform/NodeStorage';
import NodePlatform from '../../src/platform/NodePlatform';

let tmpRoot: string;
let logger: ReturnType<typeof createMockLogger>;

beforeEach(async () => {
  tmpRoot = await fs.mkdtemp(path.join(os.tmpdir(), 'node-platform-test-'));
  resetNodeStorage();
  logger = createMockLogger();
});

afterEach(async () => {
  resetNodeStorage();
  await fs.rm(tmpRoot, { recursive: true, force: true });
});

it('exposes info, crypto, encoding, storage, and requests', () => {
  const platform = new NodePlatform(logger, { storage: { type: 'file', localStoragePath: tmpRoot } });
  expect(platform.info).toBeDefined();
  expect(platform.crypto).toBeDefined();
  expect(platform.encoding).toBeDefined();
  expect(platform.storage).toBeDefined();
  expect(platform.requests).toBeDefined();
});

it('round-trips storage values through the file-backed NodeStorage', async () => {
  const platform = new NodePlatform(logger, { storage: { type: 'file', localStoragePath: tmpRoot } });
  await platform.storage.set('alpha', 'one');
  await expect(platform.storage.get('alpha')).resolves.toBe('one');
  await platform.storage.clear('alpha');
  await expect(platform.storage.get('alpha')).resolves.toBeNull();
});

it('forwards the logger to NodeStorage so storage failures surface', async () => {
  const platform = new NodePlatform(logger, {
    storage: { type: 'file', localStoragePath: path.join(tmpRoot, 'never-created', '\0bad') },
  });
  await expect(platform.storage.get('alpha')).resolves.toBeNull();
  expect(logger.error).toHaveBeenCalledWith(
    expect.stringContaining('Error getting key from storage'),
  );
});

it('defaults to the file-backed NodeStorage when no storage option is provided', () => {
  const platform = new NodePlatform(logger, {});
  expect(platform.storage).toBeDefined();
});

it('uses a custom storage implementation when provided', async () => {
  const calls: string[] = [];
  const implementation: Storage = {
    get: async (key) => {
      calls.push(`get:${key}`);
      return key === 'present' ? 'value' : null;
    },
    set: async (key, value) => {
      calls.push(`set:${key}=${value}`);
    },
    clear: async (key) => {
      calls.push(`clear:${key}`);
    },
  };
  const platform = new NodePlatform(logger, { storage: { type: 'custom', implementation } });

  await expect(platform.storage.get('present')).resolves.toBe('value');
  await platform.storage.set('alpha', 'one');
  await platform.storage.clear('alpha');

  expect(calls).toEqual(['get:present', 'set:alpha=one', 'clear:alpha']);
});
