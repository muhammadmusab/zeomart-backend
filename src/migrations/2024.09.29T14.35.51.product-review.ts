import type { Migration } from '../umguz';
import { DataTypes, Sequelize, UUIDV4 } from 'sequelize';

export const up: Migration = async ({ context }: { context: Sequelize }) => {
  await context.getQueryInterface().createTable('ProductReview', {
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
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    title: {
      type: DataTypes.STRING,
    },
    body: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    UserId: {
      type: DataTypes.INTEGER,
      references: {
        model: "ProductReview",
        key: "id",
      },
      allowNull: false,
    },
    rating: {
      type: DataTypes.DECIMAL(2, 1),
      allowNull: false,
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
    createdAt: {
      type: DataTypes.DATE,
    },
    updatedAt: {
      type: DataTypes.DATE,
    },
  });
};

export const down: Migration = async ({ context }: { context: Sequelize }) => {
  await context.getQueryInterface().dropTable('ProductReview');
};
