import "module-alias/register";
import app from "./app";
import dotenv from "dotenv";
dotenv.config();

const port = process.env.PORT || 3000;

app.listen(port, '0.0.0.0', () => {
  console.log(`Express is listening on port ${port}`);
});
