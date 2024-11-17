import type { Migration } from "../umguz";
import { DataTypes, Sequelize, UUIDV4 } from "sequelize";

export const up: Migration = async ({ context }: { context: Sequelize }) => {
  await context.getQueryInterface().createTable("Media", {
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
    url: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    width: {
      type: DataTypes.STRING,
    },
    height: {
      type: DataTypes.STRING,
    },
    size: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    mime: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    mediaableType: {
      type: DataTypes.STRING, // 'Product' or 'Category'
      allowNull: false,
    },
    mediaableId: {
      type: DataTypes.INTEGER, // stores the product/category id
      allowNull: false,
    },
    default: {
      type: DataTypes.BOOLEAN,
      defaultValue:false,
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
  await context.getQueryInterface().dropTable("Media");
};
