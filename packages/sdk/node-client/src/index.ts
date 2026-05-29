/**
 * This is the API reference for the LaunchDarkly Client-Side SDK for Node.js.
 *
 * In typical usage you will call {@link createClient} once at startup time to obtain an
 * instance of {@link LDClient}, then call `client.start()` to begin initialization.
 *
 * @packageDocumentation
 */
import type { LDContext } from '@launchdarkly/js-client-sdk-common';

import basicLogger from './basicLogger';
import type { LDClient, LDStartOptions } from './LDClient';
import type { LDPlugin } from './LDPlugin';
import { makeClient } from './NodeClient';
import type { LDTLSOptions, NodeOptions } from './NodeOptions';

export * from './LDCommon';

/** @internal */
export { resetNodeStorage } from './platform/NodeStorage';

export type {
  NodeOptions as LDOptions,
  LDClient,
  LDPlugin,
  LDStartOptions,
  LDTLSOptions,
};

export { basicLogger };

export const version = '0.0.2'; // x-release-please-version
