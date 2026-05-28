# reduce-configs

Merge an initial configuration object with one or more configuration objects, functions, or arrays of configuration objects/functions.

<p>
  <a href="https://npmjs.com/package/reduce-configs">
   <img src="https://img.shields.io/npm/v/reduce-configs?style=flat-square&colorA=564341&colorB=EDED91" alt="npm version" />
  </a>
  <img src="https://img.shields.io/badge/License-MIT-blue.svg?style=flat-square&colorA=564341&colorB=EDED91" alt="license" />
</p>

## Install

```bash
npm add reduce-configs -D
```

## reduceConfigs

The `reduceConfigs` function merges one or more configuration objects into a final configuration. It also allows modifying the configuration object via functions that may be async.

- **Type:**

```ts
type OneOrMany<T> = T | T[];
type MaybePromise<T> = T | Promise<T>;

type ConfigChain<T> = OneOrMany<T | ((config: T) => MaybePromise<T | void>)>;

function reduceConfigs<T>(options: {
  /**
   * Initial configuration object.
   */
  initial: T;
  /**
   * The configuration object, function, or array of configuration objects/functions
   * to be merged into the initial configuration.
   */
  config?: ConfigChain<T> | undefined;
  /**
   * The function used to merge configuration objects.
   * @default Object.assign
   */
  mergeFn?: typeof Object.assign;
}): Promise<T>;
```

- **Example:**

```ts
import { reduceConfigs } from 'reduce-configs';

const initial = { a: 1, b: 2 };

// Merging an object
const finalConfig1 = await reduceConfigs({
  initial,
  config: { b: 3, c: 4 },
});
// -> { a: 1, b: 3, c: 4 }

// Using a function to modify the config
const finalConfig2 = await reduceConfigs({
  initial,
  config: (config) => ({ ...config, b: 5, d: 6 }),
});
// -> { a: 1, b: 5, d: 6 }

// Using a function that returns a Promise
const finalConfig3 = await reduceConfigs({
  initial,
  config: async (config) => ({ ...config, c: await loadValue() }),
});
// -> { a: 1, b: 2, c: ... }

// Merging an array of objects/functions
const finalConfig4 = await reduceConfigs({
  initial,
  config: [
    { b: 7 },
    (config) => ({ ...config, c: 8 }),
    async (config) => ({ ...config, d: await loadValue() }),
  ],
});
// -> { a: 1, b: 7, c: 8, d: ... }
```

## reduceConfigsWithContext

The `reduceConfigsWithContext` function is similar to `reduceConfigs`, and passes an additional `context` object to each configuration function.

- **Type:**

```ts
type OneOrMany<T> = T | T[];
type MaybePromise<T> = T | Promise<T>;

type ConfigChainWithContext<T, Ctx> = OneOrMany<
  T | ((config: T, ctx: Ctx) => MaybePromise<T | void>)
>;

function reduceConfigsWithContext<T, Ctx>(options: {
  /**
   * Initial configuration object.
   */
  initial: T;
  /**
   * The configuration object, function, or array of configuration objects/functions
   * to be merged into the initial configuration.
   */
  config?: ConfigChainWithContext<T, Ctx> | undefined;
  /**
   * Context object that can be used within the configuration functions.
   */
  ctx?: Ctx;
  /**
   * The function used to merge configuration objects.
   * @default Object.assign
   */
  mergeFn?: typeof Object.assign;
}): Promise<T>;
```

- **Example:**

```ts
import { reduceConfigsWithContext } from 'reduce-configs';

const initial = { a: 1, b: 2 };
const context = { user: 'admin' };

const finalConfig = await reduceConfigsWithContext({
  initial,
  config: [
    { b: 3 },
    (config, ctx) => ({ ...config, c: ctx.user === 'admin' ? 99 : 4 }),
    async (config, ctx) => ({ ...config, d: await loadValue(ctx.user) }),
  ],
  ctx: context,
});
// -> { a: 1, b: 3, c: 99, d: ... }
```

## reduceConfigsWithMergedContext

The `reduceConfigsWithMergedContext` function passes a single merged object to each configuration function. The object contains the current value under `value`, plus all fields from `ctx`.

- **Type:**

```ts
type OneOrMany<T> = T | T[];
type MaybePromise<T> = T | Promise<T>;

type ConfigChainWithMergedContext<T, Ctx> = OneOrMany<
  T | ((merged: { value: T } & Ctx) => MaybePromise<T | void>)
>;

function reduceConfigsWithMergedContext<T, Ctx>(options: {
  /**
   * Initial configuration object.
   */
  initial: T;
  /**
   * The configuration object, function, or array of configuration objects/functions
   * to be merged into the initial configuration.
   */
  config?: ConfigChainWithMergedContext<T, Ctx> | undefined;
  /**
   * Context object that will be merged with the current value and passed to configuration functions.
   */
  ctx?: Ctx;
  /**
   * The function used to merge configuration objects.
   * @default Object.assign
   */
  mergeFn?: typeof Object.assign;
}): Promise<T>;
```

- **Example:**

```ts
import { reduceConfigsWithMergedContext } from 'reduce-configs';

const initial = './index.html';
const context = { entryName: 'admin' };

const template = await reduceConfigsWithMergedContext({
  initial,
  config: async ({ value, entryName }) => {
    const templates = await loadTemplates();
    return templates[entryName] || value;
  },
  ctx: context,
});
// -> './admin.html'
```

## License

[MIT](./LICENSE).
