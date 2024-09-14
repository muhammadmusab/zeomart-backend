import { sequelize } from "../config/db";
import {
  Model,
  DataTypes,
  CreationOptional,
  InferAttributes,
  InferCreationAttributes,
  UUIDV4,
} from "sequelize";
interface AddressModel
  extends Model<
    InferAttributes<AddressModel>,
    InferCreationAttributes<AddressModel>
  > {
  id?: CreationOptional<number>;
  uuid: CreationOptional<string>;
  streetAddress: string;
  city: string;
  zip: string;
  state: string;
  type?: string;
  VendorId?: number;
  UserId?: number;
  default?:boolean;
}
export const Address = sequelize.define<AddressModel>(
  "Address",
  {
    uuid: {
      type: DataTypes.UUID,
      defaultValue: UUIDV4,
      unique: true,
    },
    streetAddress: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    city: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    zip: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    state: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    type: {
      type: DataTypes.STRING,
    },
    default:{
      type:DataTypes.BOOLEAN,
      defaultValue:false
    },
    VendorId: {
      type: DataTypes.INTEGER,
      references: {
        model: "Vendors",
        key: "id",
      },
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
    defaultScope: {
      attributes: { exclude: ["id", "UserId", "VendorId"] },
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
