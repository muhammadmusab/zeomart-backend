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
  AttributeId: number;
  additionalTitle?: CreationOptional<string>;
  ui?: CreationOptional<string>;
}
export const Filter = sequelize.define<FilterModel>(
  "Filter",
  {
    uuid: {
      type: DataTypes.UUID,
      defaultValue: UUIDV4,
      unique: true,
    },
    AttributeId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "Attributes",
        key: "id",
      },
    },
    additionalTitle: {
      type: DataTypes.STRING,
    },
    ui: {
      type: DataTypes.STRING,
    }
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
  }
);
