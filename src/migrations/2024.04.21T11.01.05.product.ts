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
      allowNull:false,
    },
    status: {
      type: DataTypes.STRING,
      // allowNull: false,
    },
    brand: {
      type: DataTypes.STRING,
      allowNull: false,
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
    sku: {
      type: DataTypes.STRING, // can be null if product has a variant
      unique: true,
    },
    basePrice: {
      //can be null if product has a variant
      type: DataTypes.DECIMAL(12, 2),
    },
    oldPrice: {
      //can be null if product has a variant
      type: DataTypes.DECIMAL(12, 2),
    },
    baseQuantity: {
      //can be null if product has a variant
      type: DataTypes.INTEGER,
    },
    multipart: {
      type: DataTypes.BOOLEAN(),
      defaultValue:false,
    },
    highlights: {
      type: DataTypes.ARRAY(DataTypes.STRING),
    },
    specifications:{
      type:DataTypes.JSONB(),
      allowNull:false
    },

    CategoryId: {
      type: DataTypes.INTEGER,
      references: {
        model: "Categories",
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
