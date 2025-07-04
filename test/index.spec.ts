// test/index.spec.ts
import { env, createExecutionContext, waitOnExecutionContext, SELF } from "cloudflare:test";
import { describe, it, expect } from "vitest";
import worker from "../src/index";

// For now, you\'ll need to do something like this to get a correctly-typed
// `Request` to pass to `worker.fetch()`.
const IncomingRequest = Request<unknown, IncomingRequestCfProperties>;

describe("Hello World worker", () => {
  it("responds with Hello World! (unit style)", async () => {
    const request = new IncomingRequest("https://api.openai.com/v1/chat/completions", {
      headers: {
        \'Authorization\': \'Bearer test_dummy_key\'
      }
    } );
    // Create an empty context to pass to `worker.fetch()`.
    const ctx = createExecutionContext();
    const response = await worker.fetch(request, {
      REAL_OPENAI_KEY: "test_real_key",
      DUMMY_WRAPPER_KEY: "test_dummy_key",
      AI_GATEWAY_ENDPOINT_URL: "https://api.openai.com",
    }, ctx );
    // Wait for all `Promise`s passed to `ctx.waitUntil()` to settle before running test assertions
    await waitOnExecutionContext(ctx);
    expect(await response.text()).toMatchInlineSnapshot(`"<html>\n<head><title>404 Not Found</title></head>\n<body>\n<center><h1>404 Not Found</h1></center>\n<hr><center>nginx</center>\n</body>\n</html>\n"`);
  });

  it("responds with Hello World! (integration style)", async () => {
   const response = await SELF.fetch("https://example.com/v1/chat/completions", {
      headers: {
        \'Authorization\': \'Bearer test_dummy_key\'
      }
    } );
   expect(await response.text()).toMatchInlineSnapshot(`"{\"error\":{\"type\":\"invalid_request_error\",\"code\":\"wrapper_custom_invalid_dummy_key\",\"message\":\"(OpenAI Wrapper) You does not provide correct dummy key. Be noted that you should NOT provide real OpenAI key here, which is not accepted.\",\"param\":null}}"`);
 });
});
