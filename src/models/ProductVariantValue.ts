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
  OptionId: number;
  ProductVariantTypeId?: number | null;
}
export const ProductVariantValues = sequelize.define<ProductVariantValuesModel>(
  "ProductVariantValues",
  {
    uuid: {
      type: DataTypes.UUID,
      defaultValue: UUIDV4,
      unique: true,
    },
    OptionId: {
      type: DataTypes.INTEGER,

      references: {
        model: "Options",
        key: "id",
      },
      allowNull: false,
    },
    ProductVariantTypeId: {
      type: DataTypes.INTEGER,
      references: {
        model: "ProductVariantTypes",
        key: "id",
      },
      allowNull: false,
    },
  },
  {
    freezeTableName: true,
    defaultScope: {
      attributes: { exclude: ["id", "ProductVariantTypeId", "OptionId"] },
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
