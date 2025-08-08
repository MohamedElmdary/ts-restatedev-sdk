import { serve, type Context } from "@restatedev/restate-sdk"
import { Service, Handler, toService } from "../src"

function service() {
  console.log("Running service Example")
  @Service({
    metadata: { version: "0.0.1" },
  })
  class Greeter {
    // @ts-ignore
    @Handler()
    public async greet(_: Context, name: string) {
      return `Hello ${name}!`
    }
  }

  serve({ services: [toService(Greeter)], port: 9080 })
}

switch (process.env.EXAMPLE) {
  default:
    service()
}
