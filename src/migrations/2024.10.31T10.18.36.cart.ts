import type { Migration } from "../umguz";
import { DataTypes, Sequelize, UUIDV4 } from "sequelize";

export const up: Migration = async ({ context }: { context: Sequelize }) => {
  await context.getQueryInterface().createTable("Cart", {
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
    totalPrice: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
    },
    subTotal: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
    },
    taxAmount: {
      type: DataTypes.DECIMAL(12, 2),
    },
    shippingCost: {
      type: DataTypes.DECIMAL(12, 2),
    },
    discountAmount: {
      type: DataTypes.DECIMAL(12, 2),
    },
    status: {
      type: DataTypes.STRING,
      defaultValue: "IN_CART",
    },
    paymentMethod: {
      type: DataTypes.STRING,
      defaultValue: "cash_on_delivery",
    },
    UserId: {
      type: DataTypes.INTEGER,
      references: {
        model: "Users",
        key: "id",
      },
    },
    trackingId: {
      type: DataTypes.STRING,
      unique: true,
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
  await context.getQueryInterface().dropTable("Cart");
};
