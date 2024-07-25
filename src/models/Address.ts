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
  name: string;
  address1: string;
  address2: string;
  postalCode: string;
  city: string;
  country: string;
  // CompanyId?: number;
  UserId?: number;
}
export const Address = sequelize.define<AddressModel>(
  "Address",
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
    address1: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    address2: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    postalCode: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    city: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    country: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    // CompanyId: {
    //   type: DataTypes.INTEGER,
    //   references: {
    //     model: 'Companies',
    //     key: 'id',
    //   },
    // },
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
      attributes: { exclude: ["id", "UserId"] },
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
