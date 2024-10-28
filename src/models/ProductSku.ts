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
interface ProductSkusModel
  extends Model<
    InferAttributes<ProductSkusModel>,
    InferCreationAttributes<ProductSkusModel>
  > {
  id?: CreationOptional<number>;
  uuid: CreationOptional<string>;
  oldPrice?: CreationOptional<number>;
  currentPrice: number;
  quantity: number;
  sku: CreationOptional<string>;
  ProductId?: number | null;
  isDefault?: boolean;
}
export const ProductSkus = sequelize.define<ProductSkusModel>(
  "ProductSkus",
  {
    uuid: {
      type: DataTypes.UUID,
      defaultValue: UUIDV4,
      unique: true,
    },
    ProductId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "Products",
        key: "id",
      },
    },
    sku: {
      type: DataTypes.STRING,
      unique: true,
    },
    oldPrice: {
      type: DataTypes.DECIMAL(12, 2),
    },

    currentPrice: {
      type: DataTypes.DECIMAL(12, 2),
    },
    quantity: {
      type: DataTypes.INTEGER,
    },
    isDefault: {
      type: DataTypes.BOOLEAN,
      defaultValue:false
    },
  },
  {
    freezeTableName: true,
    // defaultScope: {
    //   attributes: { exclude: ["id", "ProductId"] },
    // },
    // scopes: {
    //   withId: {
    //     attributes: {
    //       exclude: [],
    //     },
    //   },
    // },
  }
);





ProductSkus.beforeBulkDestroy((options: any) => {
  options.individualHooks = true;
  return options;
});
async function deleteMedia(category: any, options: any) {
  const instance = await ProductSkus.findOne({
    where: {
      uuid: category.uuid,
    },
  });
  if (instance) {
    await Media.destroy({
      where: {
        mediaableId: instance?.id,
        mediaableType: "ProductSkus",
      },
    });
  }
}
ProductSkus.beforeDestroy(deleteMedia);