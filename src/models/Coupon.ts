import { sequelize } from "../config/db";
import {
  Model,
  DataTypes,
  CreationOptional,
  InferAttributes,
  InferCreationAttributes,
  UUIDV4,
} from "sequelize";
interface CouponsModel
  extends Model<
    InferAttributes<CouponsModel>,
    InferCreationAttributes<CouponsModel>
  > {
  id?: CreationOptional<number>;
  uuid: CreationOptional<string>;
  code: string;
  discountAmount: number;
  discountType: string; // 'fixed' or 'percentage'
  expirationDate: string; // date at which coupon will expire
  usageLimit: number; // (for example this coupon can be used 3 times total)
  timesUsed: number; // ( how many times used , if it exceeds the usageLimit then it will be considered expired)
}
export const Coupons = sequelize.define<CouponsModel>(
  "Coupons",
  {
    uuid: {
      type: DataTypes.UUID,
      defaultValue: UUIDV4,
      unique: true,
    },
    code: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    discountAmount: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
    },
    discountType: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    expirationDate: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    usageLimit: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    timesUsed: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  },
  {
    freezeTableName: true,
    defaultScope: {
      attributes: { exclude: ["id"] },
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
