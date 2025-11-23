const { startServer, stopServer } = require("../index");

const fetch = (...args) =>
  import("node-fetch").then(({ default: fetchImpl }) => fetchImpl(...args));

const baseUrl = "http://localhost:3000";

const captureCookie = (res) => {
  const rawHeader = res.headers.get("set-cookie");
  if (rawHeader) {
    return rawHeader.split(";")[0];
  }
  const rawFn = res.headers.raw ? res.headers.raw.bind(res.headers) : undefined;
  const all = rawFn ? rawFn()["set-cookie"] : undefined;
  return Array.isArray(all) ? all[0].split(";")[0] : undefined;
};

describe("Backend assignment flow", () => {
  let server;
  const username = `testUser${Date.now()}`;
  const password = "123";
  let cookie;
  let createdArticleId;

  const authedFetch = (path, options = {}) => {
    const opts = {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...(options.headers || {}),
      },
    };
    if (cookie) {
      opts.headers.cookie = cookie;
    }
    return fetch(`${baseUrl}${path}`, opts);
  };

  beforeAll(async () => {
    server = await startServer();
  });

  afterAll(async () => {
    await stopServer();
  });

  it("registers a unique user", async () => {
    const res = await fetch(`${baseUrl}/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.username).toBe(username);
    expect(body.result).toBe("success");
  });

  it("logs the user in and stores cookie", async () => {
    const res = await fetch(`${baseUrl}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });
    expect(res.status).toBe(200);
    cookie = captureCookie(res);
    expect(cookie).toBeDefined();
    const body = await res.json();
    expect(body.result).toBe("success");
  });

  it("returns zero articles for a new user", async () => {
    const res = await authedFetch("/articles");
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(Array.isArray(body.articles)).toBe(true);
    expect(body.articles.length).toBe(0);
  });

  it("creates an article and returns new list", async () => {
    const res = await authedFetch("/article", {
      method: "POST",
      body: JSON.stringify({ text: "My first message!" }),
    });
    expect(res.status).toBe(201);
    const body = await res.json();
    expect(Array.isArray(body.articles)).toBe(true);
    expect(body.articles.length).toBe(1);
    createdArticleId = body.articles[0].pid;
    expect(createdArticleId).toBeDefined();
  });

  it("fetches the created article by id", async () => {
    const res = await authedFetch(`/articles/${createdArticleId}`);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(Array.isArray(body.articles)).toBe(true);
    expect(body.articles[0].pid).toBe(createdArticleId);
  });

  it("updates headline and verifies change", async () => {
    const newHeadline = "Hello Ricebook";
    const updateRes = await authedFetch("/headline", {
      method: "PUT",
      body: JSON.stringify({ headline: newHeadline }),
    });
    expect(updateRes.status).toBe(200);
    const updateBody = await updateRes.json();
    expect(updateBody.headline).toBe(newHeadline);

    const getRes = await authedFetch("/headline");
    expect(getRes.status).toBe(200);
    const getBody = await getRes.json();
    expect(getBody.headline).toBe(newHeadline);
  });

  it("logs out and prevents further access", async () => {
    const res = await authedFetch("/logout", { method: "PUT" });
    expect(res.status).toBe(200);
    cookie = undefined;

    const articlesRes = await authedFetch("/articles");
    expect(articlesRes.status).toBe(401);
  });
});
