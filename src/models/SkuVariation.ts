import { sequelize } from "../config/db";
import {
  Model,
  DataTypes,
  CreationOptional,
  InferAttributes,
  InferCreationAttributes,
  UUIDV4,
} from "sequelize";
interface SkuVariationsModel
  extends Model<
    InferAttributes<SkuVariationsModel>,
    InferCreationAttributes<SkuVariationsModel>
  > {
  id?: CreationOptional<number>;
  uuid: CreationOptional<string>;
  ProductVariantValueId?: number | null;
  ProductId?: number | null;
  ProductSkuId?: number | null;
  combinationIds?: number[];
}
export const SkuVariations = sequelize.define<SkuVariationsModel>(
  "SkuVariations",
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
    ProductVariantValueId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "ProductVariantValues",
        key: "id",
      },
    },
    ProductSkuId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "ProductSkus",
        key: "id",
      },
    },
    combinationIds: {
      type: DataTypes.ARRAY(DataTypes.INTEGER),
      allowNull: false,
    },
  },
  {
    freezeTableName: true,
    defaultScope: {
      attributes: {
        exclude: ["id", "ProductId", "ProductSkuId", "ProductVariantValueId"],
      },
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
