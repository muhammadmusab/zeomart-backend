import { Auth } from "../../models/Auth";
import { User } from "../../models/User";
import { Vendor } from "../../models/Vendor";
import { Token } from "../../models/Token";
import { Address } from "../../models/Address";
import { Product } from "../../models/Product";
import { ProductSkus } from "../../models/ProductSku";
import { ProductVariantType } from "../../models/ProductVariantType";
import { ProductTypes } from "../../models/ProductType";
import { ProductVariantValues } from "../../models/ProductVariantValue";
import { SkuVariations } from "../../models/SkuVariation";
import { Category } from "../../models/Category";
import { Filter } from "../../models/Filter";
import { Social } from "../../models/Social";
import { Media } from "../../models/Media";
import { FilterCategory } from "../../models/FilterCategory";
import { Brand } from "../../models/Brand";
import { Option } from "../../models/Options";
import { FilterOption } from "../../models/FilterOption";

//-------self referencial tables---------

// relate a category to its parent:
Category.belongsTo(Category, {
  as: "parent",
  foreignKey: "parentId",
  targetKey: "id",
  onDelete: "CASCADE",
});

// relate parent to child Category:
Category.hasMany(Category, {
  as: "subCategories",
  foreignKey: "parentId",
  onDelete: "CASCADE",
});

// vendor profile related relations
Category.belongsToMany(Filter, {as:'filter', through: FilterCategory });
Filter.belongsToMany(Category, { as: "categories", through: FilterCategory });
Category.hasMany(FilterCategory);
FilterCategory.belongsTo(Category);
Filter.hasMany(FilterCategory);
FilterCategory.belongsTo(Filter);

//-------------------Product relations
Category.hasMany(Product);
Product.belongsTo(Category); //categoryId in Product table

User.hasMany(Auth, { onDelete: "CASCADE" });
Auth.belongsTo(User); // UserId in Auth Table

Vendor.hasMany(Auth, { onDelete: "CASCADE" });
Auth.belongsTo(Vendor); // VendorId in Auth Table

Auth.hasMany(Token, { onDelete: "CASCADE" });
Token.belongsTo(Auth);

// user profile related relations
User.hasMany(Address, { onDelete: "CASCADE" });
Address.belongsTo(User);

Vendor.hasMany(Address), { onDelete: "CASCADE" };
Address.belongsTo(Vendor);

// Product-VENDOR
Vendor.hasMany(Product);
Product.belongsTo(Vendor);

// Social-Vendor
Vendor.hasMany(Social);
Social.belongsTo(Vendor);

// ----PRODUCT VARIANT TYPE
// product and product variant type relation
Product.hasMany(ProductVariantType, { onDelete: "CASCADE" });
ProductVariantType.belongsTo(Product); //productId in ProductVariantType table

ProductTypes.hasMany(ProductVariantType, { onDelete: "CASCADE" });
ProductVariantType.belongsTo(ProductTypes); //productTypeId in ProductVariantType table

//-----PRODUCT VARIANT VALUE
// product variant type and product variant value relation
ProductVariantType.hasMany(ProductVariantValues, { onDelete: "CASCADE" });
ProductVariantValues.belongsTo(ProductVariantType); //ProductVariantTypeId in ProductVariantValues table

//---- PRODUCT SKU TABLE

// ProductSkus relation with product
Product.hasMany(ProductSkus, { onDelete: "CASCADE" });
ProductSkus.belongsTo(Product); //productId in ProductSkus table

//---- SKU VARIATION TABLE (ProductId,ProductSkuId,ProductVariantValueId) in variation table
ProductSkus.hasMany(SkuVariations, { onDelete: "CASCADE" });
SkuVariations.belongsTo(ProductSkus); //ProductSkuId in SkuVariations table

ProductVariantValues.hasMany(SkuVariations, { onDelete: "CASCADE" });
SkuVariations.belongsTo(ProductVariantValues); //ProductVariantValueId in SkuVariations table

Product.hasMany(SkuVariations, { onDelete: "CASCADE" });
SkuVariations.belongsTo(Product); //ProductId in SkuVariations table

// MEDIA

Product.hasMany(Media, {
  as: "media",
  foreignKey: "mediaableId",
  constraints: false,
  onUpdate: "CASCADE",
  onDelete: "CASCADE",
  scope: {
    mediaableType: "Product",
  },
});

Category.hasMany(Media, {
  as: "media",
  foreignKey: "mediaableId",
  constraints: false,
  onUpdate: "CASCADE",
  onDelete: "CASCADE",
  hooks: true,
  scope: {
    mediaableType: "Category",
  },
});

ProductSkus.hasMany(Media, {
  as: "media",
  foreignKey: "mediaableId",
  constraints: false,
  onUpdate: "CASCADE",
  onDelete: "CASCADE",
  scope: {
    mediaableType: "ProductSku",
  },
});

Media.belongsTo(Product, {
  foreignKey: "mediaableId",
  constraints: false,
  onUpdate: "CASCADE",
  onDelete: "CASCADE",
});
Media.belongsTo(Category, {
  foreignKey: "mediaableId",
  constraints: false,
  onUpdate: "CASCADE",
  onDelete: "CASCADE",
  hooks: true,
});
Media.belongsTo(ProductSkus, {
  foreignKey: "mediaableId",
  constraints: false,
  onUpdate: "CASCADE",
  onDelete: "CASCADE",
});


// BRAND
Brand.hasMany(Product);
Product.belongsTo(Brand); //BrandId in Product table

// options
Option.hasMany(ProductVariantValues);
ProductVariantValues.belongsTo(Option); //OptionId in ProductVariantValues table


Option.belongsToMany(Filter, {as:'filter', through: FilterOption });
Filter.belongsToMany(Option, { as: "options", through: FilterOption });
Option.hasMany(FilterOption);
FilterOption.belongsTo(Option);
Filter.hasMany(FilterOption);
FilterOption.belongsTo(Filter);