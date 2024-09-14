import { sequelize } from "../config/db";
import {
  Model,
  DataTypes,
  CreationOptional,
  InferAttributes,
  InferCreationAttributes,
  UUIDV4,
} from "sequelize";
interface ProductImageModel
  extends Model<
    InferAttributes<ProductImageModel>,
    InferCreationAttributes<ProductImageModel>
  > {
  id?: CreationOptional<number>;
  uuid: CreationOptional<string>;
  url: string | null;
  alt?: CreationOptional<string>;
  ProductSkuId?: CreationOptional<number | null>;
  ProductId?: number;
}
export const ProductImage = sequelize.define<ProductImageModel>(
  "ProductImage",
  {
    uuid: {
      type: DataTypes.UUID,
      defaultValue: UUIDV4,
      unique: true,
    },
    url: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    alt: {
      type: DataTypes.STRING,
    },
    ProductSkuId: {
      type: DataTypes.INTEGER,
      references: {
        model: "ProductSkus",
        key: "id",
      },
    },
    ProductId: {
      type: DataTypes.INTEGER,
      references: {
        model: "Products",
        key: "id",
      },
      allowNull: false,
    },
  },
  {
    freezeTableName: true,
    defaultScope: {
      attributes: { exclude: ["id", "ProductSkuId", "ProductId"] },
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
