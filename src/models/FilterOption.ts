import { sequelize } from "../config/db";
import {
  Model,
  DataTypes,
  CreationOptional,
  InferAttributes,
  InferCreationAttributes,
  UUIDV4,
} from "sequelize";
interface FilterOptionModel
  extends Model<
    InferAttributes<FilterOptionModel>,
    InferCreationAttributes<FilterOptionModel>
  > {
  id?: CreationOptional<number>;
  uuid: CreationOptional<string>;

  OptionId: number | null;
  FilterId: number | null;
}
export const FilterOption = sequelize.define<FilterOptionModel>(
  "FilterOption",
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
    // //   attributes: { exclude: ["id", "FilterId", "OptionId"] },
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
