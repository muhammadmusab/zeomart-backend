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
interface CategoryModel
  extends Model<
    InferAttributes<CategoryModel>,
    InferCreationAttributes<CategoryModel>
  > {
  id?: CreationOptional<number>; // categoryId
  uuid: CreationOptional<string>;
  title: string;
  slug: string;
  image: string;
  parentId?: number | null;
}
export const Category = sequelize.define<CategoryModel>(
  "Category",
  {
    uuid: {
      type: DataTypes.UUID,
      defaultValue: UUIDV4,
      unique: true,
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    slug: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    image: {
      type: DataTypes.STRING,
    },
    parentId: {
      type: DataTypes.INTEGER,
      references: {
        model: "Categories",
        key: "id",
      },
    },
  },
  {
    defaultScope: {
     attributes: {
          exclude: [],
        },
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
Category.beforeBulkDestroy((options: any) => {
  options.individualHooks = true;
  return options;
});
async function deleteMedia(category: any, options: any) {
  const instance = await Category.scope("withId").findOne({
    where: {
      uuid: category.uuid,
    },
  });
  if (instance) {
    await Media.destroy({
      where: {
        mediaableId: instance?.id,
        mediaableType: "Category",
      },
    });
  }
}
Category.beforeDestroy(deleteMedia);
