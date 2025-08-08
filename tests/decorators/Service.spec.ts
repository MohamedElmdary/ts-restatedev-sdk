import "reflect-metadata"
import { Service } from "../../src/decorators/Service"
import internals from "../../src/internals"

describe("Service decorator", () => {
  it("Should add service metadata to the class", () => {
    @Service()
    class Greeter {}

    const metadata = Reflect.getMetadata(
      internals.config.metadata.SERVICE,
      Greeter
    )

    expect(metadata).toBeDefined()
  })

  it("should have same ref to metadata used object", () => {
    const md = {}

    @Service(md)
    class Greeter {}

    const metadata = Reflect.getMetadata(
      internals.config.metadata.SERVICE,
      Greeter
    )

    expect(metadata).toBe(md)
  })

  it("should use passed name if provided", () => {
    @Service({ name: "xyz" })
    class Greeter {}

    const metadata = Reflect.getMetadata(
      internals.config.metadata.SERVICE,
      Greeter
    )

    expect(metadata.name).toBe("xyz")
  })

  it("should use class name if no name is provided", () => {
    @Service()
    class Greeter {}

    const metadata = Reflect.getMetadata(
      internals.config.metadata.SERVICE,
      Greeter
    )

    expect(metadata.name).toBe("Greeter")
  })
})
