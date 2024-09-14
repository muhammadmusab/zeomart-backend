import { sequelize } from "../config/db";
import {
  Model,
  DataTypes,
  CreationOptional,
  InferAttributes,
  InferCreationAttributes,
  UUIDV4,
} from "sequelize";
import { Media } from "./Media";
import { ProductSkus } from "./ProductSku";
import { ProductVariantType } from "./ProductVariantType";
interface ProductModel
  extends Model<
    InferAttributes<ProductModel>,
    InferCreationAttributes<ProductModel>
  > {
  id?: CreationOptional<number>;
  uuid: CreationOptional<string>;
  title: string;
  slug: string;
  hasVariants: boolean;
  highlights?: string;
  overview: string;
  currentPrice: CreationOptional<number | null>;
  oldPrice: CreationOptional<number | null>;
  quantity: CreationOptional<number | null>;
  status?: CreationOptional<string>;
  CategoryId?: number | null;
  VendorId?: number | null;
  sku?: CreationOptional<string>;
  features: Record<string, any>[];
  BrandId?: number;
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
      type: DataTypes.STRING,
    },
    sku: {
      type: DataTypes.STRING, // can be null (optional)
      unique: true,
    },
    currentPrice: {
      //can be null if product has a variant
      type: DataTypes.DECIMAL(12, 2),
    },
    oldPrice: {
      //can be null if product has a variant
      type: DataTypes.DECIMAL(12, 2),
    },
    quantity: {
      //can be null if product has a variant
      type: DataTypes.INTEGER,
    },
    features: {
      type: DataTypes.JSONB(),
    },
    hasVariants: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      set(value) {
        if (value == "true") {
          this.setDataValue("hasVariants", true);
          this.setDataValue("currentPrice", null);
          this.setDataValue("quantity", null);
          this.setDataValue("oldPrice", null);
        } else {
          this.setDataValue("hasVariants", false);
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
    VendorId: {
      type: DataTypes.INTEGER,
      references: {
        model: "Vendors",
        key: "id",
      },
    },
    BrandId: {
      type: DataTypes.INTEGER,
      references: {
        model: "Brands",
        key: "id",
      },
    },
  },
  {
    defaultScope: {
      attributes: { exclude: ["id", "CategoryId", "VendorId", "BrandId"] },
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

Product.beforeBulkDestroy((options: any) => {
  options.individualHooks = true;
  return options;
});
async function deleteDependecies(product: any, options: any) {
  const instance = await Product.scope("withId").findOne({
    where: {
      uuid: product.uuid,
    },
  });
  if (instance) {
    await Media.destroy({
      where: {
        mediaableId: instance?.id,
        mediaableType: "Product",
      },
    });
    await ProductSkus.destroy({
      where: {
        ProductId: instance?.id,
      },
    });

    await ProductVariantType.destroy({
      where: {
        ProductId: instance?.id,
      },
    });
  }
}
Product.beforeDestroy(deleteDependecies);
