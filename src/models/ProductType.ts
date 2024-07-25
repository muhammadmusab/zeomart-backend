import { sequelize } from "../config/db";
import {
  Model,
  DataTypes,
  CreationOptional,
  InferAttributes,
  InferCreationAttributes,
  UUIDV4,
} from "sequelize";
interface ProductTypesModel
  extends Model<
    InferAttributes<ProductTypesModel>,
    InferCreationAttributes<ProductTypesModel>
  > {
  id?: CreationOptional<number>;
  uuid: CreationOptional<string>;
  type: string; // 'ssd' | 'ram' | 'color' | 'size'
}
export const ProductTypes = sequelize.define<ProductTypesModel>(
  "ProductTypes",
  {
    uuid: {
      type: DataTypes.UUID,
      defaultValue: UUIDV4,
      unique: true,
    },
    type: {
      //general table for adding all the types of the products
      // 'ssd' | 'ram' | 'color' | 'size'
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      get(this) {
        const value = this.getDataValue("type").replace("_", " ");
        return value
          .split(" ")
          .map((word) => {
            return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
          })
          .join(" ");
      },
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
