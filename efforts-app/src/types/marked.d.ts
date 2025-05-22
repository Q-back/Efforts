// This is a minimal type declaration file for marked
declare module 'marked' {
  export function marked(text: string, options?: any): string;
  export function parse(text: string, options?: any): string;
  export namespace marked {
    export function parse(text: string, options?: any): string;
  }
  export default marked;
}
