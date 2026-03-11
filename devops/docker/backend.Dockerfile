FROM node:22-alpine
WORKDIR /app

ARG SERVICE_DIR

COPY package.json /app/package.json
COPY ../tsconfig.base.json /app/tsconfig.base.json
COPY packages /app/packages
COPY ${SERVICE_DIR} /app/service

RUN cd /app/packages/shared && npm install && npm run build
RUN cd /app/service && npm install

EXPOSE 7000
CMD ["sh", "-c", "cd /app/service && npm run dev"]