/** @type {import('eslint').Linter.FlatConfig[]} */
module.exports = [
  {
    files: ['**/*.{js,jsx,ts,tsx}'],
    extends: ['next/core-web-vitals', 'next/typescript'],
    rules: {
      // 필요한 경우 커스텀 규칙 추가
    },
  },
];
