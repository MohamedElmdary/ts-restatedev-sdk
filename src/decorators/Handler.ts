import type { handlers } from "@restatedev/restate-sdk"
import internals from "../internals"

export function Handler(
  options?: Parameters<typeof handlers.handler>[0]
): MethodDecorator {
  return (target, propertyKey, descriptor) => {
    if (typeof descriptor.value !== "function") {
      throw new Error("Handler must be a function")
    }

    internals.utils.addHandler(target.constructor, {
      key: propertyKey.toString(),
      options: options || {},
      handler: descriptor.value.bind(target),
    })
  }
}
