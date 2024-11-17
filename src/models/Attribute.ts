import { sequelize } from "../config/db";
import {
  Model,
  DataTypes,
  CreationOptional,
  InferAttributes,
  InferCreationAttributes,
  UUIDV4,
} from "sequelize";
interface AttributeModel
  extends Model<
    InferAttributes<AttributeModel>,
    InferCreationAttributes<AttributeModel>
  > {
  id?: CreationOptional<number>;
  uuid: CreationOptional<string>;
  title: string; // 'ssd' | 'ram' | 'color' | 'size'
  type?: string;
}
export const Attribute = sequelize.define<AttributeModel>(
  "Attribute",
  {
    uuid: {
      type: DataTypes.UUID,
      defaultValue: UUIDV4,
      unique: true,
    },
    title: {
      //general table for adding all the types of the products
      // 'ssd' | 'ram' | 'color' | 'size'
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    type: {
      type: DataTypes.STRING,
    },
  },
  // {
  
  //   defaultScope: {
  //     attributes: { exclude: ["id"] },
  //   },
  //   scopes: {
  //     withId: {
  //       attributes: {
  //         exclude: [],
  //       },
  //     },
  //   },
  // }
);
