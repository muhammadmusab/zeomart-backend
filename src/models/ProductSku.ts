import { sequelize } from "../config/db";
import {
  Model,
  DataTypes,
  CreationOptional,
  InferAttributes,
  InferCreationAttributes,
  UUIDV4,
} from "sequelize";
interface ProductSkusModel
  extends Model<
    InferAttributes<ProductSkusModel>,
    InferCreationAttributes<ProductSkusModel>
  > {
  id?: CreationOptional<number>;
  uuid: CreationOptional<string>;
  oldPrice?: CreationOptional<number>;
  currentPrice: number;
  quantity: number;
  sku: CreationOptional<string>;
  ProductId?: number | null;
}
export const ProductSkus =
  sequelize.define<ProductSkusModel>(
    "ProductSkus",
    {
      uuid: {
        type: DataTypes.UUID,
        defaultValue: UUIDV4,
        unique: true,
      },
      ProductId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "Products",
          key: "id",
        },
      },
      sku: {
        type: DataTypes.STRING,
        unique: true,
      },
      oldPrice: {
        type: DataTypes.DECIMAL(12, 2),
      },

      currentPrice: {
        type: DataTypes.DECIMAL(12, 2),
      },
      quantity: {
        type: DataTypes.INTEGER,
      },
    },
    {
      freezeTableName: true,
      defaultScope: {
        attributes: { exclude: ["id", "ProductId"] },
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
