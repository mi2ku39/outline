FROM busybox:stable-musl AS busybox
FROM cloudflare/cloudflared:latest

# The official cloudflared image is distroless (no shell), so a shell is
# copied in to read the tunnel token from a Docker secret file at startup.
COPY --from=busybox /bin/sh /bin/sh
COPY --from=busybox /bin/cat /bin/cat

ENTRYPOINT ["/bin/sh", "-c", "export TUNNEL_TOKEN=\"$(cat /run/secrets/cloudflare_tunnel_token)\"; exec cloudflared tunnel --no-autoupdate run"]
