import type { Migration } from "../umguz";
import { DataTypes, Sequelize, UUIDV4 } from "sequelize";

export const up: Migration = async ({ context }: { context: Sequelize }) => {
  await context.getQueryInterface().createTable("Favourites", {
    id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true,
    },
    uuid: {
      type: DataTypes.UUID,
      defaultValue: UUIDV4,
      unique: true,
    },
    state: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    ProductId: {
      type: DataTypes.INTEGER,
      references: {
        model: "Products",
        key: "id",
      },
    },
    ProductSkuId: {
      type: DataTypes.INTEGER,
      references: {
        model: "ProductSkus",
        key: "id",
      },
    },
    UserId: {
      type: DataTypes.INTEGER,
      references: {
        model: "Users",
        key: "id",
      },
      allowNull: false,
    },
    createdAt: {
      type: DataTypes.DATE,
    },
    updatedAt: {
      type: DataTypes.DATE,
    },
  });
};

export const down: Migration = async ({ context }: { context: Sequelize }) => {
  await context.getQueryInterface().dropTable("Favourites");
};
