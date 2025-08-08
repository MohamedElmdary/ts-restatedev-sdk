import type { service } from "@restatedev/restate-sdk"
import internals from "../internals"

export function Service(
  options: Partial<Omit<Parameters<typeof service>[0], "handlers">>
): ClassDecorator {
  return (target: Function) => {
    Reflect.defineMetadata(
      internals.config.metadata.SERVICE,
      { ...options, name: options.name || target.name },
      target
    )
  }
}
