ARG NODE_VERSION=20-alpine
FROM node:${NODE_VERSION} AS base

WORKDIR /usr/src/app

RUN apk add --no-cache curl tzdata \
 && ln -snf /usr/share/zoneinfo/Europe/Madrid /etc/localtime \
 && echo "Europe/Madrid" > /etc/timezone

# pnpm
ENV PNPM_HOME="/root/.local/share/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

ENV NODE_ICU_DATA=node_modules/full-icu

FROM base AS development

RUN apk add --no-cache python3 make g++ git

ARG USER_ID=1000
ARG USER_NAME=node
RUN if [ "${USER_ID}" != "1000" ]; then \
      addgroup -g ${USER_ID} ${USER_NAME} || true && \
      adduser -D -G ${USER_NAME} -u ${USER_ID} ${USER_NAME} || true ; \
    fi && \
    chown -R ${USER_NAME}:${USER_NAME} /usr/src/app

USER ${USER_NAME}

COPY --chown=${USER_NAME}:${USER_NAME} package.json pnpm-lock.yaml ./
RUN pnpm fetch && pnpm install --frozen-lockfile

ENV NODE_ENV=development
EXPOSE 3080 9229

CMD ["pnpm","dev"]


FROM base AS runtime

COPY package.json pnpm-lock.yaml ./
RUN pnpm fetch && pnpm install --prod --frozen-lockfile

COPY . .

ENV NODE_ENV=production
EXPOSE 3080
CMD ["pnpm","start"]
