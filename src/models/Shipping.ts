import { sequelize } from "../config/db";
import {
  Model,
  DataTypes,
  CreationOptional,
  InferAttributes,
  InferCreationAttributes,
  UUIDV4,
} from "sequelize";
interface ShippingModel
  extends Model<
    InferAttributes<ShippingModel>,
    InferCreationAttributes<ShippingModel>
  > {
  id?: CreationOptional<number>;
  uuid: CreationOptional<string>;
  CartId?: CreationOptional<number>;
  cost: number;
  estimatedDeliveryTime: string;
}
export const Shipping = sequelize.define<ShippingModel>(
  "Shipping",
  {
    uuid: {
      type: DataTypes.UUID,
      defaultValue: UUIDV4,
      unique: true,
    },
    cost: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
    },
    estimatedDeliveryTime: {
      // this will be set automatically when order is placed , and estimated time is added within working days
      type: DataTypes.STRING,
      allowNull: false,
    },
    CartId: {
      type: DataTypes.INTEGER,
      references: {
        model: "Cart",
        key: "id",
      },
      allowNull: false,
    },
  },
  {
    freezeTableName: true,
    defaultScope: {
      attributes: { exclude: ["id", "CartId"] },
    },
    scopes: {
      withId: {
        attributes: {
          exclude: [],
        },
      },
    },
  }
);
