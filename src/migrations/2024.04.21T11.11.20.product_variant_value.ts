import type { Migration } from "../umguz";
import { DataTypes, Sequelize, UUIDV4 } from "sequelize";

export const up: Migration = async ({ context }: { context: Sequelize }) => {
  await context.getQueryInterface().createTable("ProductVariantValues", {
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
    value: {
      type: DataTypes.STRING, // null if the type of ProductVariant is base (product has no variant)
    },
    ProductVariantTypeId: {
      type: DataTypes.INTEGER,
      references: {
        model: "ProductVariantTypes",
        key: "id",
      },
      allowNull:false
    },
    // ProductId: {
    //   type: DataTypes.INTEGER,
    //   references: {
    //     model: "Products",
    //     key: "id",
    //   },
    //   allowNull:false
    // },
    createdAt: {
      type: DataTypes.DATE,
    },
    updatedAt: {
      type: DataTypes.DATE,
    },
  });
};

export const down: Migration = async ({ context }: { context: Sequelize }) => {
  await context.getQueryInterface().dropTable("ProductVariantValues");
};
