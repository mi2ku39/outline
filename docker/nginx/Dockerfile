ARG APP_PATH=/opt/outline
ARG BASE_IMAGE=outlinewiki/outline-base

FROM ${BASE_IMAGE} AS base

FROM nginx:1.29-alpine

LABEL org.opencontainers.image.source="https://github.com/outline/outline"

ARG APP_PATH

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=base $APP_PATH/build/app /usr/share/nginx/html/static
COPY --from=base $APP_PATH/build/shared/i18n/locales /usr/share/nginx/html/locales
COPY --from=base $APP_PATH/public /usr/share/nginx/html

EXPOSE 80
