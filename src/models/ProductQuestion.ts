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
  ProductId?: CreationOptional<number>;
  AnswerId?: number;
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
    ProductId: {
      type: DataTypes.INTEGER,
      references: {
        model: "Products",
        key: "id",
      },
      allowNull: false,
    },
    AnswerId: {
        type: DataTypes.INTEGER,
        references: {
          model: "ProductAnswer",
          key: "id",
        },
        allowNull: false,
      },
  },
  {
    freezeTableName: true,
  }
);
