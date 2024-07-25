import { sequelize } from "../config/db";
import {
  Model,
  DataTypes,
  CreationOptional,
  InferAttributes,
  InferCreationAttributes,
  UUIDV4,
} from "sequelize";
interface PaymentModel
  extends Model<
    InferAttributes<PaymentModel>,
    InferCreationAttributes<PaymentModel>
  > {
  id?: CreationOptional<number>;
  uuid: CreationOptional<string>;
  transactionId?: string;
  amount?: number;
  paymentStatus:string;
  paymentMethod:string;
  CartId?: number | null;
}
export const Payment = sequelize.define<PaymentModel>(
  "Payment",
  {
    uuid: {
      type: DataTypes.UUID,
      defaultValue: UUIDV4,
      unique: true,
    },
    amount: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
    },
    paymentStatus:{
        type: DataTypes.STRING,
        allowNull: false,
    },
    paymentMethod:{
        type: DataTypes.STRING,
        allowNull: false,
    },
    transactionId: { // transactionId is the id which we get when payment is completed 
      type: DataTypes.STRING,
      allowNull: false,
    },
    CartId: {
      type: DataTypes.INTEGER,
      references: {
        model: "Cart",
        key: "id",
      },
      allowNull: false,
    },
  },
  {
    freezeTableName: true,
    defaultScope: {
      attributes: { exclude: ["id", "CartId"] },
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
