declare module "bun:test" {
  type TestBody = () => void | Promise<void>

  interface Matchers {
    not: Matchers
    toBe(expected: unknown): void
    toContain(expected: unknown): void
    toHaveLength(expected: number): void
  }

  export function describe(name: string, body: TestBody): void
  export function test(name: string, body: TestBody): void
  export function expect(value: unknown): Matchers
}
