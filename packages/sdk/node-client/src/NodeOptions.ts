import {
  ConnectionMode,
  LDOptions as LDOptionsBase,
  Storage,
} from '@launchdarkly/js-client-sdk-common';

import type { LDPlugin } from './LDPlugin';

/**
 * Storage configuration for the SDK's persistent cache (anonymous-key
 * persistence and last-known flag values).
 *
 * Use `{ type: 'file' }` to use the default file-backed storage, optionally
 * overriding the directory with `localStoragePath`. Use `{ type: 'custom' }`
 * to inject a custom implementation -- for example, an in-memory store, an
 * encrypted-on-disk store, or a system keychain wrapper.
 */
export type LDStorageOptions =
  | {
      type: 'file';

      /**
       * The directory to use for the file-backed cache.
       *
       * Defaults to `<cwd>/ldclient-user-cache`.
       */
      localStoragePath?: string;
    }
  | {
      type: 'custom';

      /**
       * Custom storage implementation. Implementations may not throw
       * exceptions.
       */
      implementation: Storage;
    };

/**
 * Additional parameters to pass to the Node HTTPS API for secure requests.  These can include any
 * of the TLS-related parameters supported by `https.request()`, such as `ca`, `cert`, and `key`.
 *
 * For more information, see the Node documentation for `https.request()` and `tls.connect()`.
 */
export interface LDTLSOptions {
  ca?: string | string[] | Buffer | Buffer[];
  cert?: string | string[] | Buffer | Buffer[];
  checkServerIdentity?: (servername: string, cert: any) => Error | undefined;
  ciphers?: string;
  pfx?: string | string[] | Buffer | Buffer[] | object[];
  key?: string | string[] | Buffer | Buffer[] | object[];
  passphrase?: string;
  rejectUnauthorized?: boolean;
  secureProtocol?: string;
  servername?: string;
}

export interface NodeOptions extends LDOptionsBase {
  /**
   * Additional parameters to pass to the Node HTTPS API for secure requests.  These can include any
   * of the TLS-related parameters supported by `https.request()`, such as `ca`, `cert`, and `key`.
   *
   * For more information, see the Node documentation for `https.request()` and `tls.connect()`.
   */
  tlsParams?: LDTLSOptions;

  /**
   * Set to true to opt in to compressing event payloads if the SDK supports it.
   *
   * Defaults to false.
   */
  enableEventCompression?: boolean;

  /**
   * Sets the mode to use for connections when the SDK is initialized.
   *
   * @remarks
   * Possible values are offline, streaming, or polling. See {@link ConnectionMode} for more information.
   *
   * Defaults to streaming.
   */
  initialConnectionMode?: ConnectionMode;

  /**
   * A list of plugins to be used with the SDK.
   *
   * Plugin support is currently experimental and subject to change.
   */
  plugins?: LDPlugin[];

  /**
   * Storage configuration for the persistent flag and anonymous-key cache.
   *
   * If omitted, the SDK uses the file-backed default at
   * `<cwd>/ldclient-user-cache`.
   *
   * @see {@link LDStorageOptions}
   */
  storage?: LDStorageOptions;

  /**
   * The Secure Mode hash for the configured context.
   *
   * @see https://docs.launchdarkly.com/sdk/features/secure-mode
   */
  hash?: string;
}
