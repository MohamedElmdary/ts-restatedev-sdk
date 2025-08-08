import "reflect-metadata"
import { Handler } from "../../src/decorators/Handler"
import internals from "../../src/internals"

describe("Handler decorator", () => {
  beforeEach(() => {
    // Clear any existing metadata before each test
    jest.clearAllMocks()
  })

  it("should add handler metadata to the class", () => {
    class TestService {
      @Handler()
      testMethod() {
        return "test"
      }
    }

    const handlers = internals.utils.getHandlers(TestService)
    expect(handlers).toHaveLength(1)
    expect(handlers[0]?.key).toBe("testMethod")
    expect(handlers[0]?.options).toEqual({})
    expect(typeof handlers[0]?.handler).toBe("function")
  })

  it("should add handler with custom options", () => {
    const customOptions = {}

    class TestService {
      @Handler(customOptions)
      testMethod() {
        return "test"
      }
    }

    const handlers = internals.utils.getHandlers(TestService)
    expect(handlers).toHaveLength(1)
    expect(handlers[0]?.options).toBe(customOptions)
  })

  it("should bind the handler method to the target constructor", () => {
    class TestService {
      static value = "bound"

      @Handler()
      testMethod() {
        return TestService.value
      }
    }

    const handlers = internals.utils.getHandlers(TestService)

    // The handler should be bound to the constructor
    expect(typeof handlers[0]?.handler).toBe("function")
    expect(handlers[0]?.handler()).toBe("bound")
  })

  it("should handle multiple handlers on the same class", () => {
    class TestService {
      @Handler()
      firstMethod() {
        return "first"
      }

      @Handler()
      secondMethod() {
        return "second"
      }
    }

    const handlers = internals.utils.getHandlers(TestService)
    expect(handlers).toHaveLength(2)

    const firstHandler = handlers.find((h) => h.key === "firstMethod")
    const secondHandler = handlers.find((h) => h.key === "secondMethod")

    expect(firstHandler).toBeDefined()
    expect(secondHandler).toBeDefined()
  })

  it("should throw error when applied to non-function method", () => {
    expect(() => {
      class TestService {
        @Handler()
        get nonFunctionProperty() {
          return "not a function"
        }
      }
      // Use the class to trigger decorator execution
      new TestService()
    }).toThrow("Handler must be a function")
  })

  it("should work with symbol keys", () => {
    const symbolKey = Symbol("testSymbol")

    class TestService {
      @Handler()
      [symbolKey]() {
        return "symbol method"
      }
    }

    const handlers = internals.utils.getHandlers(TestService)
    expect(handlers).toHaveLength(1)
    expect(handlers[0]?.key).toBe(symbolKey)
  })

  it("should preserve original method descriptor properties", () => {
    class TestService {
      @Handler()
      testMethod() {
        return "test"
      }
    }

    const descriptor = Object.getOwnPropertyDescriptor(
      TestService.prototype,
      "testMethod"
    )
    expect(descriptor?.enumerable).toBe(false)
    expect(descriptor?.configurable).toBe(true)
    expect(typeof descriptor?.value).toBe("function")
  })

  it("should work with async methods", () => {
    class TestService {
      @Handler()
      async asyncMethod() {
        return Promise.resolve("async result")
      }
    }

    const handlers = internals.utils.getHandlers(TestService)
    expect(handlers).toHaveLength(1)
    expect(handlers[0]?.key).toBe("asyncMethod")
  })

  it("should work with methods that return functions", () => {
    class TestService {
      @Handler()
      methodReturningFunction() {
        return () => "arrow function"
      }
    }

    const handlers = internals.utils.getHandlers(TestService)
    expect(handlers).toHaveLength(1)
    expect(handlers[0]?.key).toBe("methodReturningFunction")
    expect(typeof handlers[0]?.handler).toBe("function")
  })

  it("should handle classes without inheritance conflicts", () => {
    class ServiceA {
      @Handler({ metadata: { name: "serviceA" } })
      methodA() {
        return "A"
      }
    }

    class ServiceB {
      @Handler({ metadata: { name: "serviceB" } })
      methodB() {
        return "B"
      }
    }

    const handlersA = internals.utils.getHandlers(ServiceA)
    const handlersB = internals.utils.getHandlers(ServiceB)

    expect(handlersA).toHaveLength(1)
    expect(handlersA[0]?.options?.metadata?.name).toBe("serviceA")

    expect(handlersB).toHaveLength(1)
    expect(handlersB[0]?.options?.metadata?.name).toBe("serviceB")
  })

  it("should handle metadata isolation between classes", () => {
    class FirstService {
      @Handler()
      firstMethod() {
        return "first"
      }
    }

    const firstHandlers = internals.utils.getHandlers(FirstService)
    expect(firstHandlers).toHaveLength(1)

    class SecondService {
      @Handler()
      secondMethod() {
        return "second"
      }
    }

    // First service should still only have one handler
    const firstHandlersAfter = internals.utils.getHandlers(FirstService)
    const secondHandlers = internals.utils.getHandlers(SecondService)

    expect(firstHandlersAfter).toHaveLength(1)
    expect(secondHandlers).toHaveLength(1)
  })
})
