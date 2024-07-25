import { sequelize } from "../config/db";
import {
  Model,
  DataTypes,
  CreationOptional,
  InferAttributes,
  InferCreationAttributes,
  UUIDV4,
} from "sequelize";
interface FavouritesModel
  extends Model<
    InferAttributes<FavouritesModel>,
    InferCreationAttributes<FavouritesModel>
  > {
  id?: CreationOptional<number>;
  uuid: CreationOptional<string>;
  state?: boolean;

  ProductVariantValueId?: CreationOptional<number | null>;
  ProductId?: number;
  UserId?: number;
}
export const Favourites = sequelize.define<FavouritesModel>(
  "Favourites",
  {
    uuid: {
      type: DataTypes.UUID,
      defaultValue: UUIDV4,
      unique: true,
    },
    state: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    ProductVariantValueId: {
      type: DataTypes.INTEGER,
      references: {
        model: "ProductVariantValues",
        key: "id",
      },
    },
    ProductId: {
      type: DataTypes.INTEGER,
      references: {
        model: "Products",
        key: "id",
      },
      allowNull: false,
    },
    UserId: {
      type: DataTypes.INTEGER,
      references: {
        model: "Users",
        key: "id",
      },
      allowNull: false,
    },
  },
  {
    freezeTableName: true,
    defaultScope: {
      attributes: {
        exclude: ["id", "ProductVariantValueId", "ProductId", "UserId"],
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
