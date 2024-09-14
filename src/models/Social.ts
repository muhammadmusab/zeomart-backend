import { sequelize } from "../config/db";
import {
  Model,
  DataTypes,
  CreationOptional,
  InferAttributes,
  InferCreationAttributes,
  UUIDV4,
} from "sequelize";
interface SocialModel
  extends Model<
    InferAttributes<SocialModel>,
    InferCreationAttributes<SocialModel>
  > {
  id?: CreationOptional<number>;
  uuid: CreationOptional<string>;
  name: string;
  url?: string;
  VendorId?: number;
}
export const Social = sequelize.define<SocialModel>(
  "Social",
  {
    uuid: {
      type: DataTypes.UUID,
      defaultValue: UUIDV4,
      unique: true,
    },
    url: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    name: {
      type: DataTypes.STRING,
      unique:true,
    },
    VendorId: {
      type: DataTypes.INTEGER,
      references: {
        model: "Vendors",
        key: "id",
      },
    },
  },
  {
    freezeTableName:true,
    defaultScope: {
      attributes: { exclude: ["id", "VendorId"] },
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
