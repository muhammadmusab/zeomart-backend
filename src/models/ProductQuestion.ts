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

interface ProductQuestionModel
  extends Model<
    InferAttributes<ProductQuestionModel>,
    InferCreationAttributes<ProductQuestionModel>
  > {
  id?: CreationOptional<number>;
  uuid: CreationOptional<string>;
  question: string;
  answer?: string;
  ProductId?: CreationOptional<number>;
  ProductAnswerId?: number;
  UserId?: number;
}
export const ProductQuestion = sequelize.define<ProductQuestionModel>(
  "ProductQuestion",
  {
    uuid: {
      type: DataTypes.UUID,
      defaultValue: UUIDV4,
      unique: true,
    },
    question: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    answer: {
      type: DataTypes.TEXT,
    },
    ProductId: {
      type: DataTypes.INTEGER,
      references: {
        model: "Products",
        key: "id",
      },
      allowNull: false,
    },
    UserId: {
      type: DataTypes.INTEGER,
      references: {
        model: "Users",
        key: "id",
      },
    },
  },
  {
    freezeTableName: true,
  }
);
