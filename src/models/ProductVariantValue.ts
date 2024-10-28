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
  OptionId?: number | null;
  AttributeId?: number | null;
  label?: string;
}
export const ProductVariantValues = sequelize.define<ProductVariantValuesModel>(
  "ProductVariantValues",
  {
    uuid: {
      type: DataTypes.UUID,
      defaultValue: UUIDV4,
      unique: true,
    },
    label:{
      type:DataTypes.STRING,
    },
    OptionId: {
      type: DataTypes.INTEGER,
      references: {
        model: "Options",
        key: "id",
      },
      allowNull: false,
    },
    AttributeId: {
      type: DataTypes.INTEGER,
      references: {
        model: "Attributes",
        key: "id",
      },
      allowNull: false,
    },
  },
  {
    freezeTableName: true,
    // defaultScope: {
    //   attributes: { exclude: ["id", "AttributeId", "OptionId"] },
    // },
    // scopes: {
    //   withId: {
    //     attributes: {
    //       exclude: [],
    //     },
    //   },
    // },
  }
);
