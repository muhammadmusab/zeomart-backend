import { sequelize } from "../config/db";
import {
  Model,
  DataTypes,
  CreationOptional,
  InferAttributes,
  InferCreationAttributes,
  UUIDV4,
} from "sequelize";
interface CouponCartModel
  extends Model<
    InferAttributes<CouponCartModel>,
    InferCreationAttributes<CouponCartModel>
  > {
  id?: CreationOptional<number>;
  uuid: CreationOptional<string>;
  CartId: number;
  CouponId: number;
}
export const CouponCart = sequelize.define<CouponCartModel>(
  "CouponCart",
  {
    uuid: {
      type: DataTypes.UUID,
      defaultValue: UUIDV4,
      unique: true,
    },
    CartId: {
      type: DataTypes.INTEGER,
      references: {
        model: "Cart",
        key: "id",
      },
    },
    CouponId: {
      type: DataTypes.INTEGER,
      references: {
        model: "Coupons",
        key: "id",
      },
    },
  },
  {
    freezeTableName: true,
    defaultScope: {
      attributes: { exclude: ["id", "CartId", "CouponId"] },
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
