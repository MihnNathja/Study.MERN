import { Dialect } from "sequelize";
import dotenv from "dotenv";

dotenv.config();

interface DBConfig {
  username: string;
  password: string;
  database: string;
  host: string;
  port: number;
  dialect: Dialect;
}

const config: { [key: string]: DBConfig } = {
  development: {
    username: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "123456",
    database: process.env.DB_NAME || "crud_ts",
    host: process.env.DB_HOST || "127.0.0.1",
    port: Number(process.env.DB_PORT) || 3306,
    dialect: "mysql",
  },
};

export default config;
