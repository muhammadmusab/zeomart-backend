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
  options: Record<string, any>[];  //{label:string;value:string|number}[]
  type: string;
  CategoryId: number | null;
}
export const Filter = sequelize.define<FilterModel>(
  "Filter",
  {
    uuid: {
      type: DataTypes.UUID,
      defaultValue: UUIDV4,
      unique: true,
    },
    options: {
      type: DataTypes.JSON,
      allowNull: false,
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    additionalTitle: {
      type: DataTypes.STRING,
    },
    type: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    CategoryId: {
      type: DataTypes.INTEGER,
      references: {
        model: "Categories",
        key: "id",
      },
    },
  },
  {
    defaultScope: {
      attributes: { exclude: ["id", "CategoryId"] },
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
