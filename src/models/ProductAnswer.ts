import { sequelize } from "../config/db";
import {
  Model,
  DataTypes,
  CreationOptional,
  InferAttributes,
  InferCreationAttributes,
  NonAttribute,
  UUIDV4,
} from "sequelize";

interface ProductAnswerModel
  extends Model<
    InferAttributes<ProductAnswerModel>,
    InferCreationAttributes<ProductAnswerModel>
  > {
  id?: CreationOptional<number>;
  uuid: CreationOptional<string>;
  answer: string;
  ProductId?: number;
}
export const ProductAnswer = sequelize.define<ProductAnswerModel>(
  "ProductAnswer",
  {
    uuid: {
      type: DataTypes.UUID,
      defaultValue: UUIDV4,
      unique: true,
    },
    answer: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    ProductId: {
      type: DataTypes.INTEGER,
      references: {
        model: "Products",
        key: "id",
      },
      allowNull: false,
    },
  },
  {
    freezeTableName: true,
  }
);
