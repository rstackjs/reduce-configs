import { define } from 'rstack';

define.lib({
  lib: [{ syntax: 'es2023', dts: true }],
});

define.lint(async () => {
  const { js, ts } = await import('rstack/lint');

  return [
    js.configs.recommended,
    ts.configs.recommended,
    {
      rules: {
        '@typescript-eslint/no-explicit-any': 'off',
      },
    },
  ];
});
