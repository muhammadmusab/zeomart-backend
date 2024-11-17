import { sequelize } from "../config/db";
import {
  Model,
  DataTypes,
  CreationOptional,
  InferAttributes,
  InferCreationAttributes,
  UUIDV4,
} from "sequelize";
interface CartModel
  extends Model<
    InferAttributes<CartModel>,
    InferCreationAttributes<CartModel>
  > {
  id?: CreationOptional<number>;
  uuid: CreationOptional<string>;
  totalPrice?: number;
  subTotal: number;
  taxAmount: number;
  shippingCost: number;
  discountAmount: number;
  status?: string;
  UserId?: CreationOptional<number>;
}
export const Cart = sequelize.define<CartModel>(
  "Cart",
  {
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
      defaultValue: "PENDING",
    },
    UserId: {
      type: DataTypes.INTEGER,
      references: {
        model: "Users",
        key: "id",
      },
    },
  },
  {
    freezeTableName: true,
    defaultScope: {
      attributes: { exclude: ["id", "UserId"] },
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
