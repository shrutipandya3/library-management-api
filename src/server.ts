import app from "./app";
import dotenv from "dotenv";
dotenv.config();

const port = process.env.PORT;

app.listen(port, () => {
  return console.log(`Express is listening at http://localhost:${port}`);
});
