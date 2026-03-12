import { createApp } from "./app";
import { env } from "./config/env";

const app = createApp();

/* REQUIRED for Railway / reverse proxies */
app.set("trust proxy", 1);

app.listen(env.PORT, env.HOST, () => {
  console.log(`MANABU backend_api listening on http://${env.HOST}:${env.PORT}`);
});