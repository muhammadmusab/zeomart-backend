import { sequelize } from "../config/db";
import {
  Model,
  DataTypes,
  CreationOptional,
  InferAttributes,
  InferCreationAttributes,
  UUIDV4,
} from "sequelize";
interface ProductModel
  extends Model<
    InferAttributes<ProductModel>,
    InferCreationAttributes<ProductModel>
  > {
  id?: CreationOptional<number>;
  uuid: CreationOptional<string>;
  title: string;
  slug: string;
  brand: string;
  multipart: boolean;
  highlights: string[];
  overview: string;
  basePrice: CreationOptional<number | null>;
  oldPrice: CreationOptional<number | null>;
  baseQuantity: CreationOptional<number | null>;
  status?: CreationOptional<string>;
  CategoryId?: number | null;
  sku: CreationOptional<string>;
  specifications:Record<string,any>[]
}
export const Product = sequelize.define<ProductModel>(
  "Product",
  {
    uuid: {
      type: DataTypes.UUID,
      defaultValue: UUIDV4,
      unique: true,
    },
    title: {
      type: DataTypes.TEXT,
    },
    brand: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    status: {
      type: DataTypes.STRING,
      // allowNull: false,
    },
    slug: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },

    overview: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    highlights: {
      type: DataTypes.ARRAY(DataTypes.STRING),
    },
    sku: {
      type: DataTypes.STRING, // can be null if product has a variant
      unique: true,
    },
    basePrice: {
      //can be null if product has a variant
      type: DataTypes.DECIMAL(12, 2),
    },
    oldPrice: {
      //can be null if product has a variant
      type: DataTypes.DECIMAL(12, 2),
    },
    baseQuantity: {
      //can be null if product has a variant
      type: DataTypes.INTEGER,
    },
    specifications:{
      type:DataTypes.JSONB(),
      allowNull:false
    },
    multipart: {
      type: DataTypes.BOOLEAN,
      defaultValue:false,
      set(this) {
        const multipart = this.getDataValue("multipart");

        if (multipart) {
          this.setDataValue("basePrice", null);
          this.setDataValue("baseQuantity", null);
          this.setDataValue("oldPrice", null);
        }
      },
    },
    CategoryId: {
      type: DataTypes.INTEGER,
      references: {
        model: "Categories",
        key: "id",
      },
    },
  },
  {
    defaultScope: {
      attributes: { exclude: ["id", "CategoryId"] },
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
