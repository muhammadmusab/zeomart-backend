import type { Migration } from "../umguz";
import { DataTypes, Sequelize, UUIDV4 } from "sequelize";

export const up: Migration = async ({ context }: { context: Sequelize }) => {
  await context.getQueryInterface().createTable("ProductSkus", {
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
    ProductId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "Products",
        key: "id",
      },
    },
    sku: {
      type: DataTypes.STRING,
      unique: true,
    },
    oldPrice: {
      type: DataTypes.DECIMAL(12, 2),
    },

    currentPrice: {
      type: DataTypes.DECIMAL(12, 2),
    },
    quantity: {
      type: DataTypes.INTEGER,
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
  await context.getQueryInterface().dropTable("ProductSkus");
};
