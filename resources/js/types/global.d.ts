import type { route as routeFn } from "ziggy-js"

declare global {
  const route: typeof routeFn
}

// Add this to the global.d.ts file to make TypeScript happy with the __INITIAL_DATA__ property
interface Window {
  __INITIAL_DATA__?: {
    props?: {
      auth?: {
        user: any | null
      }
      [key: string]: any
    }
    [key: string]: any
  }
}
