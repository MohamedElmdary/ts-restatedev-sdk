import { service, handlers as _handlers } from "@restatedev/restate-sdk"
import internals from "../internals"

export function toService<T extends { new (...args: any[]): any }>(ctor: T) {
  const serviceMetadata = Reflect.getMetadata(
    internals.config.metadata.SERVICE,
    ctor
  )
  if (!serviceMetadata) {
    throw new Error(
      "Can't turn class without @Service decorator into a service"
    )
  }

  const handlers = internals.utils.getHandlers(ctor)
  if (handlers.length === 0) {
    throw new Error(
      "Service at least needs one handler make sure to mark handlers with @Handler decorator"
    )
  }

  return service({
    ...serviceMetadata,
    handlers: handlers.reduce((r, h) => {
      r[h.key.toString()] = _handlers.handler(h.options || {}, h.handler as any)
      return r
    }, {} as { [key: string]: Function }),
  }) as { name: string; handlers: InstanceType<T> }
}
