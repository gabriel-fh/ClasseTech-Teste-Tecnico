// Metro turns CSS files into modules, so TypeScript needs declarations for them.
declare module '*.module.css' {
  const classes: Record<string, string>;
  export default classes;
}

declare module '*.css';
