import type { service } from "@restatedev/restate-sdk"
import internals from "../internals"

export function Service(
  options: Partial<Omit<Parameters<typeof service>[0], "handlers">> = {}
): ClassDecorator {
  return (target: Function) => {
    if (!options.name) {
      options.name = target.name
    }

    Reflect.defineMetadata(internals.config.metadata.SERVICE, options, target)
  }
}
