import { sequelize } from "../config/db";
import {
  Model,
  DataTypes,
  CreationOptional,
  InferAttributes,
  InferCreationAttributes,
  UUIDV4,
} from "sequelize";

interface MediaModel
  extends Model<
    InferAttributes<MediaModel>,
    InferCreationAttributes<MediaModel>
  > {
  id?: CreationOptional<number>;
  uuid: CreationOptional<string>;
  url: string;
  width?: string;
  height?: string;
  size: string;
  mime: string;
  name: string;
  mediaableType: string;
  mediaableId?: number;
}
export const Media = sequelize.define<MediaModel>(
  "Media",
  {
    uuid: {
      type: DataTypes.UUID,
      defaultValue: UUIDV4,
      unique: true,
    },
    url: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    width: {
      type: DataTypes.STRING,
    },
    height: {
      type: DataTypes.STRING,
    },
    size: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    mime: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    mediaableType: {
      type: DataTypes.STRING, // 'Product' or 'Category'
      allowNull: false,
    },
    mediaableId: {
      type: DataTypes.INTEGER, // stores the product/category id
      allowNull: false,
    },
  },
  {
    defaultScope: {
      attributes: { exclude: ["id", "mediaableId"] },
    },
    scopes: {
      withId: {
        attributes: {
          exclude: [],
        },
      },
    },
    freezeTableName: true,
  }
);
