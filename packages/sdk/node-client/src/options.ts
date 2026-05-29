import {
  ConnectionMode,
  LDLogger,
  LDOptions as LDOptionsBase,
  OptionMessages,
  TypeValidator,
  TypeValidators,
} from '@launchdarkly/js-client-sdk-common';

import type { LDStorageOptions, LDTLSOptions, NodeOptions } from './NodeOptions';
import type { LDPlugin } from './LDPlugin';

class ConnectionModeValidator implements TypeValidator {
  is(u: unknown): u is ConnectionMode {
    return u === 'offline' || u === 'streaming' || u === 'polling';
  }
  getType(): string {
    return 'ConnectionMode (offline | streaming | polling)';
  }
}

class StorageOptionsValidator implements TypeValidator {
  is(u: unknown): u is LDStorageOptions {
    if (typeof u !== 'object' || u === null) {
      return false;
    }
    const candidate = u as { type?: unknown; localStoragePath?: unknown; implementation?: unknown };
    if (candidate.type === 'file') {
      return candidate.localStoragePath === undefined || typeof candidate.localStoragePath === 'string';
    }
    if (candidate.type === 'custom') {
      const impl = candidate.implementation;
      return (
        typeof impl === 'object' &&
        impl !== null &&
        typeof (impl as { get?: unknown }).get === 'function' &&
        typeof (impl as { set?: unknown }).set === 'function' &&
        typeof (impl as { clear?: unknown }).clear === 'function'
      );
    }
    return false;
  }
  getType(): string {
    return "LDStorageOptions ({ type: 'file', localStoragePath? } | { type: 'custom', implementation })";
  }
}

export interface ValidatedOptions {
  tlsParams?: LDTLSOptions;
  enableEventCompression?: boolean;
  initialConnectionMode: ConnectionMode;
  plugins: LDPlugin[];
  storage?: LDStorageOptions;
  hash?: string;
}

const optDefaults: ValidatedOptions = {
  tlsParams: undefined,
  enableEventCompression: undefined,
  initialConnectionMode: 'streaming',
  plugins: [],
  storage: undefined,
  hash: undefined,
};

const validators: { [Property in keyof NodeOptions]: TypeValidator | undefined } = {
  tlsParams: TypeValidators.Object,
  enableEventCompression: TypeValidators.Boolean,
  initialConnectionMode: new ConnectionModeValidator(),
  plugins: TypeValidators.createTypeArray('LDPlugin[]', {}),
  storage: new StorageOptionsValidator(),
  hash: TypeValidators.String,
};

export function filterToBaseOptions(opts: NodeOptions): LDOptionsBase {
  const baseOptions: LDOptionsBase = { ...opts };

  // Strip Node-specific keys so the common options validator does not warn about them.
  Object.keys(optDefaults).forEach((key) => {
    delete (baseOptions as any)[key];
  });
  return baseOptions;
}

export default function validateOptions(opts: NodeOptions, logger: LDLogger): ValidatedOptions {
  const output: ValidatedOptions = { ...optDefaults };

  Object.entries(validators).forEach((entry) => {
    const [key, validator] = entry as [keyof NodeOptions, TypeValidator];
    const value = opts[key];
    if (value !== undefined) {
      if (validator.is(value)) {
        // @ts-ignore The type inference has some problems here.
        output[key as keyof ValidatedOptions] = value as any;
      } else {
        logger.warn(OptionMessages.wrongOptionType(key, validator.getType(), typeof value));
      }
    }
  });

  return output;
}
