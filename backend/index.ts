type Env = {
  W7S_RPC: Fetcher;
  W7S_RPC_TOKEN: string;
  W7S_OWNER: string;
  W7S_REPO: string;
  W7S_REPOSITORY: string;
  W7S_ENVIRONMENT: string;
};

const json = (body: unknown, init: ResponseInit = {}) => {
  const headers = new Headers(init.headers);
  headers.set("content-type", "application/json; charset=utf-8");
  headers.set("cache-control", "no-store");
  return new Response(JSON.stringify(body, null, 2), {
    ...init,
    headers
  });
};

const callDatetime = (env: Env) =>
  env.W7S_RPC.fetch(
    "https://w7s.internal/api/v1/rpc/w7s-io/example-rpc-datetime/now",
    {
      headers: {
        authorization: `Bearer ${env.W7S_RPC_TOKEN}`,
        "x-w7s-rpc-caller": env.W7S_REPOSITORY,
        "x-w7s-rpc-environment": env.W7S_ENVIRONMENT,
        accept: "application/json"
      }
    }
  );

const getDatetime = async (env: Env) => {
  const response = await callDatetime(env);
  const text = await response.text();
  let body: unknown = text;
  try {
    body = JSON.parse(text);
  } catch {
    // Keep the plain text body for easier debugging.
  }

  if (!response.ok) {
    return {
      ok: false,
      status: response.status,
      body
    };
  }

  return {
    ok: true,
    status: response.status,
    body
  };
};

export default {
  async fetch(_request: Request, env: Env) {
    const url = new URL(_request.url);

    if (url.pathname === "/health") {
      return json({
        status: "ok",
        service: "example-rpc-client"
      });
    }

    if (url.pathname !== "/" && url.pathname !== "/datetime") {
      return json(
        {
          status: "error",
          error: "Not found"
        },
        { status: 404 }
      );
    }

    const rpc = await getDatetime(env);
    if (!rpc.ok) {
      return json(
        {
          service: "example-rpc-client",
          status: "error",
          rpcTarget: "w7s-io/example-rpc-datetime",
          rpcStatus: rpc.status,
          rpcBody: rpc.body
        },
        { status: 502 }
      );
    }

    return json({
      service: "example-rpc-client",
      status: "ok",
      repository: env.W7S_REPOSITORY,
      environment: env.W7S_ENVIRONMENT,
      rpcTarget: "w7s-io/example-rpc-datetime",
      datetime: rpc.body
    });
  }
};
