import type { Migration } from "../umguz";
import { DataTypes, Sequelize, UUIDV4 } from "sequelize";

export const up: Migration = async ({ context }: { context: Sequelize }) => {
  await context.getQueryInterface().createTable("Products", {
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
    title: {
      type: DataTypes.TEXT,
    },
    status: {
      type: DataTypes.STRING,
      // allowNull: false,
    },
    slug: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    overview: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    highlights: {
      type: DataTypes.STRING,
    },
    sku: {
      type: DataTypes.STRING, // can be null (optional)
      unique: true,
    },
    currentPrice: {
      //can be null if product has a variant
      type: DataTypes.DECIMAL(12, 2),
    },
    oldPrice: {
      //can be null if product has a variant
      type: DataTypes.DECIMAL(12, 2),
    },
    quantity: {
      //can be null if product has a variant
      type: DataTypes.INTEGER,
    },
    features: {
      type: DataTypes.JSONB(),
    },
    hasVariants: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    sold:{
      type: DataTypes.INTEGER,
      defaultValue:0
    },
    CategoryId: {
      type: DataTypes.INTEGER,
      references: {
        model: "Categories",
        key: "id",
      },
    },
    VendorId: {
      type: DataTypes.INTEGER,
      references: {
        model: "Vendors",
        key: "id",
      },
    },
    OptionId: {
      type: DataTypes.INTEGER,
      references: {
        model: "Options",
        key: "id",
      },
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
  await context.getQueryInterface().dropTable("Products");
};
