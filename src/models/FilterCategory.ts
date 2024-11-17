import { sequelize } from "../config/db";
import {
  Model,
  DataTypes,
  CreationOptional,
  InferAttributes,
  InferCreationAttributes,
  UUIDV4,
} from "sequelize";
interface FilterCategoryModel
  extends Model<
    InferAttributes<FilterCategoryModel>,
    InferCreationAttributes<FilterCategoryModel>
  > {
  id?: CreationOptional<number>;
  uuid: CreationOptional<string>;

  CategoryId: number | null;
  FilterId: number | null;
}
export const FilterCategory = sequelize.define<FilterCategoryModel>(
  "FilterCategory",
  {
    uuid: {
      type: DataTypes.UUID,
      defaultValue: UUIDV4,
      unique: true,
    },

    CategoryId: {
      type: DataTypes.INTEGER,
      references: {
        model: "Categories",
        key: "id",
      },
    },
    FilterId: {
      type: DataTypes.INTEGER,
      references: {
        model: "Filters",
        key: "id",
      },
    },
  },
  {
    // defaultScope: {
    //   attributes: { exclude: [] },
    // },
    // scopes: {
    //   withId: {
    //     attributes: {
    //       exclude: [],
    //     },
    //   },
    // },
    freezeTableName: true,
  }
);
