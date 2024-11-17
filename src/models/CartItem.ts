import { sequelize } from "../config/db";
import {
  Model,
  DataTypes,
  CreationOptional,
  InferAttributes,
  InferCreationAttributes,
  UUIDV4,
} from "sequelize";
interface CartItemModel
  extends Model<
    InferAttributes<CartItemModel>,
    InferCreationAttributes<CartItemModel>
  > {
  id?: CreationOptional<number>;
  uuid: CreationOptional<string>;
  subTotal?: number;
  quantity?: number;
  ProductId?: number | null;
  MediaId?: number | null;
  CartId?: number | null;
  ProductSkuId?: number | null;
  VendorId:number;
}
export const CartItem = sequelize.define<CartItemModel>(
  "CartItem",
  {
    uuid: {
      type: DataTypes.UUID,
      defaultValue: UUIDV4,
      unique: true,
    },
    subTotal: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
    },
    quantity: {
      type: DataTypes.INTEGER,
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
    ProductId: {
      type: DataTypes.INTEGER,
      references: {
        model: "Products",
        key: "id",
      },
      allowNull: false,
    },
    VendorId: {
      type: DataTypes.INTEGER,
      references: {
        model: "Vendors",
        key: "id",
      },
      allowNull: false,
    },
    ProductSkuId: {
      type: DataTypes.INTEGER,
      references: {
        model: "ProductSkus",
        key: "id",
      },
    }
  },
  {
    freezeTableName: true,
    defaultScope: {
      attributes: { exclude: [], },
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
