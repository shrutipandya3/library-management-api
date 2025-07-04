import express from "express";
import routes from "./routes";
import { errorHandler } from "./middlewares/error.middleware";
import languageMiddleware from "./middlewares/language.middleware";
import i18n from "./config/i18n";

const app = express();

app.use(express.json());

app.use(i18n.init);
app.use(languageMiddleware);

app.use("/api", routes);

app.use(errorHandler);

export default app;
