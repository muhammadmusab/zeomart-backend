import { sequelize } from "../config/db";
import {
  Model,
  DataTypes,
  CreationOptional,
  InferAttributes,
  InferCreationAttributes,
  UUIDV4,
} from "sequelize";

interface BrandModel
  extends Model<
    InferAttributes<BrandModel>,
    InferCreationAttributes<BrandModel>
  > {
  id?: CreationOptional<number>;
  uuid: CreationOptional<string>;
  title: string;
}
export const Brand = sequelize.define<BrandModel>(
  "Brand",
  {
    uuid: {
      type: DataTypes.UUID,
      defaultValue: UUIDV4,
      unique: true,
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
  },
  {
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
