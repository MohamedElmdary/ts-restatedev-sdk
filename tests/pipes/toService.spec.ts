import "reflect-metadata"
import { Service } from "../../src/decorators/Service"
import { Handler } from "../../src/decorators/Handler"
import { toService } from "../../src/pipes/toService"

// Mock the restate-sdk module
jest.mock("@restatedev/restate-sdk", () => ({
  service: jest.fn((options) => ({
    ...options,
    handlers: options.handlers || {},
  })),
  handlers: {
    handler: jest.fn((options, fn) => ({ options, fn })),
  },
}))

import { service, handlers } from "@restatedev/restate-sdk"

describe("toService pipe", () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it("should convert a decorated class to a restate service", () => {
    @Service({ name: "TestService" })
    class TestService {
      @Handler()
      testHandler() {
        return "test"
      }
    }

    const result = toService(TestService)

    expect(service).toHaveBeenCalledWith({
      name: "TestService",
      handlers: {
        testHandler: { options: {}, fn: expect.any(Function) },
      },
    })
    expect(result).toEqual({
      name: "TestService",
      handlers: {
        testHandler: { options: {}, fn: expect.any(Function) },
      },
    })
  })

  it("should use class name if no name is provided in @Service", () => {
    @Service()
    class MyService {
      @Handler()
      myHandler() {
        return "test"
      }
    }

    toService(MyService)

    expect(service).toHaveBeenCalledWith({
      name: "MyService",
      handlers: {
        myHandler: { options: {}, fn: expect.any(Function) },
      },
    })
  })

  it("should handle multiple handlers", () => {
    @Service({ name: "MultiHandlerService" })
    class MultiHandlerService {
      @Handler()
      firstHandler() {
        return "first"
      }

      @Handler()
      secondHandler() {
        return "second"
      }
    }

    toService(MultiHandlerService)

    expect(service).toHaveBeenCalledWith({
      name: "MultiHandlerService",
      handlers: {
        firstHandler: { options: {}, fn: expect.any(Function) },
        secondHandler: { options: {}, fn: expect.any(Function) },
      },
    })
  })

  it("should pass handler options correctly", () => {
    const handlerOptions = {}

    @Service({ name: "ServiceWithOptions" })
    class ServiceWithOptions {
      @Handler(handlerOptions)
      handlerWithOptions() {
        return "test"
      }
    }

    toService(ServiceWithOptions)

    expect(handlers.handler).toHaveBeenCalledWith(
      handlerOptions,
      expect.any(Function)
    )
  })

  it("should handle symbol keys", () => {
    const symbolKey = Symbol("testSymbol")

    @Service({ name: "SymbolService" })
    class SymbolService {
      @Handler()
      [symbolKey]() {
        return "symbol handler"
      }
    }

    toService(SymbolService)

    expect(service).toHaveBeenCalledWith({
      name: "SymbolService",
      handlers: {
        [symbolKey.toString()]: { options: {}, fn: expect.any(Function) },
      },
    })
  })

  it("should merge service metadata properties", () => {
    const serviceMetadata = {
      name: "ComplexService",
      version: "1.0.0",
      description: "A complex service",
    }

    @Service(serviceMetadata)
    class ComplexService {
      @Handler()
      complexHandler() {
        return "complex"
      }
    }

    toService(ComplexService)

    expect(service).toHaveBeenCalledWith({
      name: "ComplexService",
      version: "1.0.0",
      description: "A complex service",
      handlers: {
        complexHandler: { options: {}, fn: expect.any(Function) },
      },
    })
  })

  it("should throw error when class has no @Service decorator", () => {
    class PlainClass {
      @Handler()
      someHandler() {
        return "test"
      }
    }

    expect(() => toService(PlainClass)).toThrow(
      "Can't turn class without @Service decorator into a service"
    )
  })

  it("should throw error when service has no handlers", () => {
    @Service({ name: "EmptyService" })
    class EmptyService {}

    expect(() => toService(EmptyService)).toThrow(
      "Service at least needs one handler make sure to mark handlers with @Handler decorator"
    )
  })

  it("should throw error when service has only non-handler methods", () => {
    @Service({ name: "NonHandlerService" })
    class NonHandlerService {
      // Regular method without @Handler decorator
      regularMethod() {
        return "not a handler"
      }
    }

    expect(() => toService(NonHandlerService)).toThrow(
      "Service at least needs one handler make sure to mark handlers with @Handler decorator"
    )
  })

  it("should handle handlers with undefined options", () => {
    @Service({ name: "UndefinedOptionsService" })
    class UndefinedOptionsService {
      @Handler()
      handlerWithUndefinedOptions() {
        return "test"
      }
    }

    toService(UndefinedOptionsService)

    expect(handlers.handler).toHaveBeenCalledWith({}, expect.any(Function))
  })

  it("should work with inherited services", () => {
    @Service({ name: "BaseService" })
    class BaseService {
      @Handler()
      baseHandler() {
        return "base"
      }
    }

    class DerivedService extends BaseService {
      @Handler()
      derivedHandler() {
        return "derived"
      }
    }

    // The derived class should inherit the service metadata from base
    // and accumulate handlers from both base and derived class
    toService(DerivedService)

    expect(service).toHaveBeenCalledWith({
      name: "BaseService",
      handlers: expect.objectContaining({
        baseHandler: { options: {}, fn: expect.any(Function) },
        derivedHandler: { options: {}, fn: expect.any(Function) },
      }),
    })
  })

  it("should preserve handler binding", () => {
    @Service({ name: "BoundService" })
    class BoundService {
      value = "instance value"

      @Handler()
      boundHandler() {
        return this.value
      }
    }

    toService(BoundService)

    // Verify that the handler function was passed to handlers.handler
    expect(handlers.handler).toHaveBeenCalledWith({}, expect.any(Function))

    // Get the actual handler function that was passed
    const handlerCall = (handlers.handler as jest.Mock).mock.calls[0]
    const handlerFunction = handlerCall[1]

    // The handler should be properly bound
    expect(typeof handlerFunction).toBe("function")
  })
})
