import { sequelize } from "../config/db";
import {
  Model,
  DataTypes,
  CreationOptional,
  InferAttributes,
  InferCreationAttributes,
  UUIDV4,
} from "sequelize";
interface VendorModel
  extends Model<
    InferAttributes<VendorModel>,
    InferCreationAttributes<VendorModel>
  > {
  id?: CreationOptional<number>;
  uuid: CreationOptional<string>;
  name: string;
  description?: string;
  phone?: string;
  coverPhoto?: string;
}
export const Vendor = sequelize.define<VendorModel>(
  "Vendor",
  {
    uuid: {
      type: DataTypes.UUID,
      defaultValue: UUIDV4,
      unique: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    coverPhoto: {
      type: DataTypes.STRING,
    },
    description: {
      type: DataTypes.STRING,
      // allowNull: false,
    },
    phone: {
      type: DataTypes.STRING,
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
