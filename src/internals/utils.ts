import type { handlers } from "@restatedev/restate-sdk"
import { metadata } from "./config"

export interface Handler {
  key: string | symbol
  options?: Parameters<typeof handlers.handler>[0]
  handler: Function
}

export function addHandler(target: any, handler: Handler): void {
  const handlers = getHandlers(target)
  handlers.push(handler)
  Reflect.defineMetadata(metadata.HANDLERS, handlers, target)
}

export function getHandlers(target: any): Handler[] {
  return Reflect.getMetadata(metadata.HANDLERS, target) || []
}
