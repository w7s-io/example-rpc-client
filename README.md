# example-rpc-client

Small W7S backend that exposes a public endpoint and gets the current datetime from [`w7s-io/example-rpc-datetime`](https://github.com/w7s-io/example-rpc-datetime) through W7S backend RPC.

## Public endpoints

```text
GET https://w7s-io.w7s.cloud/example-rpc-client/
GET https://w7s-io.w7s.cloud/example-rpc-client/datetime
GET https://w7s-io.w7s.cloud/example-rpc-client/health
```

`/datetime` calls:

```text
env.W7S_RPC.fetch("https://w7s.internal/api/v1/rpc/w7s-io/example-rpc-datetime/now")
```

and returns the datetime service response together with the client app metadata.

## Deploy

This repo deploys on every push with:

```yaml
- uses: w7s-io/w7s-cloud@v1
  with:
    token: ${{ github.token }}
```

The workflow smoke test calls the public `/datetime` endpoint after deployment. That verifies the client backend can reach the datetime backend through W7S RPC.
