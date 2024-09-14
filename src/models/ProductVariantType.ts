import { sequelize } from "../config/db";
import {
  Model,
  DataTypes,
  CreationOptional,
  InferAttributes,
  InferCreationAttributes,
  UUIDV4,
} from "sequelize";
interface ProductVariantTypeModel
  extends Model<
    InferAttributes<ProductVariantTypeModel>,
    InferCreationAttributes<ProductVariantTypeModel>
  > {
  id?: CreationOptional<number>;
  ProductId?: CreationOptional<number>;
  uuid: CreationOptional<string>;
  ProductTypeId?: number;
}
export const ProductVariantType = sequelize.define<ProductVariantTypeModel>(
  "ProductVariantTypes",
  {
    uuid: {
      type: DataTypes.UUID,
      defaultValue: UUIDV4,
      unique: true,
    },
    ProductTypeId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "ProductTypes",
        key: "id",
      },
    },
    ProductId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "Products",
        key: "id",
      },
    },
  },
  {
    freezeTableName: true,
    defaultScope: {
      attributes: { exclude: ["id", "ProductId","ProductTypeId"] },
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
