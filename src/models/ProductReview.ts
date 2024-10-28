import { sequelize } from "../config/db";
import {
  Model,
  DataTypes,
  CreationOptional,
  InferAttributes,
  InferCreationAttributes,
  UUIDV4,
} from "sequelize";
interface ProductReviewModel
  extends Model<
    InferAttributes<ProductReviewModel>,
    InferCreationAttributes<ProductReviewModel>
  > {
  id?: CreationOptional<number>;
  uuid: CreationOptional<string>;
  name: string;
  title: string;
  body: string;
  UserId: number;
  rating: number;
  ProductId?: number | null;
  ProductSkuId?: number | null;
}
export const ProductReview = sequelize.define<ProductReviewModel>(
  "ProductReview",
  {
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
  },
  {
    freezeTableName: true,
    defaultScope: {
      attributes: { exclude: [] },
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
