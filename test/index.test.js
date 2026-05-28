import { assert, test } from '@rstest/core';
import {
  reduceConfigs,
  reduceConfigsWithContext,
  reduceConfigsWithMergedContext,
} from '../dist/index.js';

test('all reducers should return promises', () => {
  assert.strictEqual(
    typeof reduceConfigs({ initial: { value: 'a' } }).then,
    'function',
  );
  assert.strictEqual(
    typeof reduceConfigsWithContext({ initial: { value: 'a' } }).then,
    'function',
  );
  assert.strictEqual(
    typeof reduceConfigsWithMergedContext({ initial: { value: 'a' } }).then,
    'function',
  );
});

test('reduceConfigs should return initial config', async () => {
  assert.deepStrictEqual(await reduceConfigs({ initial: { value: 'a' } }), {
    value: 'a',
  });
});

test('reduceConfigs should merge initial config', async () => {
  assert.deepStrictEqual(
    await reduceConfigs({
      initial: { name: 'a' },
      config: {
        name: 'b',
        custom: 'c',
      },
    }),
    {
      name: 'b',
      custom: 'c',
    },
  );
});

test('reduceConfigs should support custom merge function', async () => {
  const merge = (target, source) => {
    for (const key in source) {
      if (Object.hasOwn(target, key)) {
        target[key] += source[key];
      } else {
        target[key] = source[key];
      }
    }
    return target;
  };

  assert.deepStrictEqual(
    await reduceConfigs({
      initial: {
        a: 1,
        b: 'b',
      },
      config: {
        a: 2,
        b: 'b',
        c: 'c',
      },
      mergeFn: merge,
    }),
    {
      a: 3,
      b: 'bb',
      c: 'c',
    },
  );
});

test('reduceConfigs should support function or object array', async () => {
  const initial = { a: 'a' };

  const config = [
    { b: 'b' },
    (o) => {
      o.c = 3;
    },
    async (o) => ({
      ...o,
      d: 'd',
    }),
    { e: 'e' },
  ];

  assert.deepStrictEqual(
    await reduceConfigs({
      initial,
      config,
    }),
    {
      a: 'a',
      b: 'b',
      c: 3,
      d: 'd',
      e: 'e',
    },
  );
});

test('reduceConfigsWithContext should support functions with context', async () => {
  const initial = { a: 'a' };

  const config = [
    { b: 'b' },
    async (o, { add }) => {
      o.c = await add(1, 2);
    },
    (o) => ({
      ...o,
      d: 'd',
    }),
    { e: 'e' },
  ];

  assert.deepStrictEqual(
    await reduceConfigsWithContext({
      initial,
      config,
      ctx: {
        add: async (a, b) => a + b,
      },
    }),
    {
      a: 'a',
      b: 'b',
      c: 3,
      d: 'd',
      e: 'e',
    },
  );
});

test('reduceConfigsWithContext should support multiple async functions in array', async () => {
  const initial = { value: 1 };

  const config = [
    async (o) => ({ ...o, value: o.value + 10 }),
    async (o) => ({ ...o, value: o.value * 2 }),
  ];

  assert.deepStrictEqual(
    await reduceConfigsWithContext({
      initial,
      config,
    }),
    { value: 22 },
  );
});

test('reduceConfigsWithMergedContext should support function and merged context', async () => {
  const initial = { a: 'a' };

  const config = [
    { b: 'b' },
    async ({ value, add }) => {
      value.c = await add(1, 2);
    },
    ({ value }) => ({
      ...value,
      d: 'd',
    }),
    { e: 'e' },
  ];

  assert.deepStrictEqual(
    await reduceConfigsWithMergedContext({
      initial,
      config,
      ctx: {
        add: async (a, b) => a + b,
      },
    }),
    {
      a: 'a',
      b: 'b',
      c: 3,
      d: 'd',
      e: 'e',
    },
  );
});

test('reduceConfigsWithMergedContext should handle single async function', async () => {
  const initial = { a: 1 };

  assert.deepStrictEqual(
    await reduceConfigsWithMergedContext({
      initial,
      config: async ({ value }) => ({ ...value, b: 2 }),
    }),
    { a: 1, b: 2 },
  );
});

test('reduceConfigs should allow false as config', async () => {
  assert.strictEqual(
    await reduceConfigs({
      initial: 'head',
      config: false,
    }),
    false,
  );

  assert.strictEqual(
    await reduceConfigs({
      initial: 'head',
      config: () => false,
    }),
    false,
  );

  assert.strictEqual(
    await reduceConfigs({
      initial: 'head',
      config: ['head', 'head', async () => false],
    }),
    false,
  );
});
