import "ts-node/register";
import { sequelize } from "./config/db";
import path from "path";
import fs from "fs";
import { Umzug, SequelizeStorage } from "umzug";

export const migrator = new Umzug({
  migrations: {
    glob: ["migrations/*.ts", { cwd: __dirname }],
  },
  context: sequelize,
  storage: new SequelizeStorage({
    sequelize,
  }),

  create: {
    folder: "src/migrations",
    template: (filepath: string) => [
      // read template from filesystem
      [
        filepath,
        fs
          .readFileSync(path.join(__dirname, "utils/migration-template.ts"))
          .toString(),
      ],
    ],
  },
  logger: console,
});

export const seeder = new Umzug({
  migrations: {
    glob: ["seeders/*.ts", { cwd: __dirname }],
  },
  context: sequelize,
  storage: new SequelizeStorage({
    sequelize,
		modelName: 'seeder_meta',
  }),
  create: {
    folder: "src/seeders",
    template: (filepath: string) => [
      // read template from filesystem
      [
        filepath,
        fs
          .readFileSync(path.join(__dirname, "utils/seed-template.ts"))
          .toString(),
      ],
    ],
  },
  logger: console,
});

export type Migration = typeof migrator._types.migration;
export type Seeder = typeof seeder._types.migration;