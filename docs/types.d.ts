// Docs site type declarations
// This file exists to satisfy TypeScript's requirement for at least one input file.
// The docs site uses .mdx pages via Nextra and has no TypeScript source files.

declare module '*.mdx' {
  import type { ComponentType } from 'react';
  const component: ComponentType;
  export default component;
}
