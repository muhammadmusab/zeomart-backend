import { sequelize } from "../config/db";
import {
  Model,
  DataTypes,
  CreationOptional,
  InferAttributes,
  InferCreationAttributes,
  UUIDV4,
} from "sequelize";
interface ProductVariantValuesModel
  extends Model<
    InferAttributes<ProductVariantValuesModel>,
    InferCreationAttributes<ProductVariantValuesModel>
  > {
  id?: CreationOptional<number>;
  uuid: CreationOptional<string>;
  value: string;
  ProductVariantTypeId?: number | null;
  // ProductId?: number | null;
}
export const ProductVariantValues = sequelize.define<ProductVariantValuesModel>(
  "ProductVariantValues",
  {
    uuid: {
      type: DataTypes.UUID,
      defaultValue: UUIDV4,
      unique: true,
    },
    value: {
      type: DataTypes.STRING,
    },
    ProductVariantTypeId: {
      type: DataTypes.INTEGER,
      references: {
        model: "ProductVariantTypes",
        key: "id",
      },
      allowNull:false
    },
    // ProductId: {
    //   type: DataTypes.INTEGER,
    //   references: {
    //     model: "Products",
    //     key: "id",
    //   },
    //   allowNull:false
    // },
  },
  {
    freezeTableName: true,
    defaultScope: {
      attributes: { exclude: ["id", "ProductVariantTypeId","ProductId"] },
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
