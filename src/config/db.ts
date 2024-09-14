import { Dialect, Sequelize } from "sequelize";
export const sequelize = new Sequelize(
  process.env.DB_NAME as string,
  process.env.USER_NAME as string,
  process.env.PASSWORD as string,
  {
    logging: console.log,
    host: process.env.HOSTNAME,
    dialect: process.env.DILECT as Dialect,
    port: process.env.DB_PORT as any,
    dialectOptions:
      process.env.NODE_ENV === "production"
        ? {
            ssl: {
              require: true,
              rejectUnauthorized: false,
            },
          }
        : undefined,
  }
);


export const queryInterface = sequelize.getQueryInterface();
sequelize.addHook("beforeCount", function (this: any, options: any) {
  if (this._scope.include && this._scope.include.length > 0) {
    options.distinct = true;
    options.col =
      this._scope.col || options.col || `"${this.options.name.singular}".id`;
  }
  if (options.include && options.include.length > 0) {
    options.include = null;
  }
});
