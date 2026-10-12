import { urlSegura } from "./urlSegura";

// Issue #197: URL vinda de dado não pode virar `javascript:` num `href`.

describe("urlSegura", () => {
  it.each([
    ["/mock/exame-anexo-exemplo.png"],
    ["https://bucket.exemplo.com/anexo.pdf?X-Amz-Signature=abc"],
    ["blob:https://rastria.up.railway.app/0f1e2d3c-4b5a-6978-8a9b-0c1d2e3f4a5b"],
    ["blob:http://localhost:5173/0f1e2d3c-4b5a-6978-8a9b-0c1d2e3f4a5b"],
  ])("aceita %s", (url) => {
    expect(urlSegura(url)).toBeDefined();
  });

  it.each([
    ["javascript:alert(1)"],
    ["JaVaScRiPt:alert(1)"],
    ["  javascript:alert(1)"],
    ["\tjavascript:alert(1)"],
    ["\u0001javascript:alert(1)"],
    ["java\nscript:alert(1)"],
    ["data:text/html,<script>alert(1)</script>"],
    ["vbscript:msgbox(1)"],
    ["http://evil.com/x.pdf"],
    ["file:///etc/passwd"],
    ["//evil.com/x.pdf"],
    ["/\\evil.com/x.pdf"],
    ["/javascript:alert(1)"],
    ["blob:http://evil.com/uuid"],
    ["blob:null/uuid"],
    ["anexo.pdf"],
  ])("recusa %j", (url) => {
    expect(urlSegura(url)).toBeUndefined();
  });

  it("recusa o que não é string", () => {
    expect(urlSegura(undefined)).toBeUndefined();
    expect(urlSegura(null)).toBeUndefined();
    expect(urlSegura("")).toBeUndefined();
    expect(urlSegura({ toString: () => "https://x.com" })).toBeUndefined();
  });
});
