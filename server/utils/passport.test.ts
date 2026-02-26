import http from "node:http";
import Koa from "koa";
import Router from "koa-router";
import { StateStore } from "./passport";

describe("StateStore host resolution", () => {
  it("uses X-Forwarded-Host for state cookie domain when proxy is trusted", async () => {
    const app = new Koa();
    const router = new Router();
    const stateStore = new StateStore();

    app.proxy = true;

    router.get("/auth/discord", (ctx) => {
      stateStore.store(ctx, (err, token) => {
        if (err || !token) {
          throw err;
        }

        ctx.body = token;
      });
    });

    router.get("/auth/discord.callback", (ctx) => {
      stateStore.verify(ctx, String(ctx.query.state), (err) => {
        if (err) {
          ctx.status = 400;
          return;
        }

        ctx.status = 204;
      });
    });

    app.use(router.routes());

    const server = http.createServer(app.callback());
    await new Promise<void>((resolve) => {
      server.listen(0, resolve);
    });

    try {
      const address = server.address();

      if (!address || typeof address === "string") {
        throw new Error("server address unavailable");
      }

      const baseUrl = `http://127.0.0.1:${address.port}`;

      const start = await fetch(`${baseUrl}/auth/discord`, {
        headers: {
          Host: "internal.test",
          "X-Forwarded-Host": "team.outline.dev",
        },
      });

      expect(start.status).toEqual(200);

      const stateCookie = start.headers.get("set-cookie");

      expect(stateCookie).toBeTruthy();
      expect(stateCookie).toContain("domain=outline.dev");

      if (!stateCookie) {
        throw new Error("state cookie missing");
      }

      const cookie = stateCookie.match(/state=[^;]+/)?.[0];

      if (!cookie) {
        throw new Error("state cookie value missing");
      }
      const stateToken = await start.text();

      const callback = await fetch(
        `${baseUrl}/auth/discord.callback?state=${stateToken}`,
        {
          headers: {
            Host: "internal.test",
            "X-Forwarded-Host": "team.outline.dev",
            Cookie: cookie,
          },
        }
      );

      expect(callback.status).toEqual(204);
    } finally {
      await new Promise<void>((resolve, reject) => {
        server.close((err) => {
          if (err) {
            reject(err);
            return;
          }

          resolve();
        });
      });
    }
  });
});
