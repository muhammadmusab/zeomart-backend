import { sequelize } from "../config/db";
import {
  Model,
  DataTypes,
  CreationOptional,
  InferAttributes,
  InferCreationAttributes,
  UUIDV4,
} from "sequelize";
interface FilterModel
  extends Model<
    InferAttributes<FilterModel>,
    InferCreationAttributes<FilterModel>
  > {
  id?: CreationOptional<number>;
  uuid: CreationOptional<string>;
  title: string;
  additionalTitle?: CreationOptional<string>;
  type: string;
}
export const Filter = sequelize.define<FilterModel>(
  "Filter",
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
    additionalTitle: {
      type: DataTypes.STRING,
    },
    type: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
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
