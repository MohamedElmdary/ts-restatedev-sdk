import type { handlers } from "@restatedev/restate-sdk"
import internals from "../internals"

export function Handler(
  options: Parameters<typeof handlers.handler>[0] = {}
): MethodDecorator {
  return (target, key, descriptor) => {
    if (typeof descriptor.value !== "function") {
      throw new Error("Handler must be a function")
    }

    const handler = descriptor.value.bind(target)
    internals.utils.addHandler(target.constructor, { key, options, handler })
  }
}
