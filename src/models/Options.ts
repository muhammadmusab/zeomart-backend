import { sequelize } from "../config/db";
import {
  Model,
  DataTypes,
  CreationOptional,
  InferAttributes,
  InferCreationAttributes,
  UUIDV4,
} from "sequelize";

interface OptionModel
  extends Model<
    InferAttributes<OptionModel>,
    InferCreationAttributes<OptionModel>
  > {
  id?: CreationOptional<number>;
  uuid: CreationOptional<string>;
  value: any;
}
export const Option = sequelize.define<OptionModel>(
  "Option",
  {
    uuid: {
      type: DataTypes.UUID,
      defaultValue: UUIDV4,
      unique: true,
    },
    value: {
      type: DataTypes.STRING,
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
