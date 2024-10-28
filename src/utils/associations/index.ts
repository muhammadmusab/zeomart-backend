import { Auth } from "../../models/Auth";
import { User } from "../../models/User";
import { Vendor } from "../../models/Vendor";
import { Token } from "../../models/Token";
import { Address } from "../../models/Address";
import { Product } from "../../models/Product";
import { ProductSkus } from "../../models/ProductSku";

import { Attribute } from "../../models/Attribute";
import { ProductVariantValues } from "../../models/ProductVariantValue";
import { SkuVariations } from "../../models/SkuVariation";
import { Category } from "../../models/Category";
import { Filter } from "../../models/Filter";
import { Social } from "../../models/Social";
import { Media } from "../../models/Media";
import { FilterCategory } from "../../models/FilterCategory";
import { Option } from "../../models/Options";
import { FilterOption } from "../../models/FilterOption";
import { ProductReview } from "../../models/ProductReview";
import { ProductQuestion } from "../../models/ProductQuestion";
import { ProductAnswer } from "../../models/ProductAnswer";



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
Category.belongsToMany(Filter, { as: "filter", through: FilterCategory });
Filter.belongsToMany(Category, { as: "categories", through: FilterCategory });
Category.hasMany(FilterCategory);
FilterCategory.belongsTo(Category);
Filter.hasMany(FilterCategory);
FilterCategory.belongsTo(Filter);

//-------------------Product relations
Category.hasMany(Product);
Product.belongsTo(Category,{as:"category",foreignKey:"CategoryId"}); //categoryId in Product table

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


//---- PRODUCT SKU TABLE

// ProductSkus relation with product
Product.hasMany(ProductSkus, {as:"skus", onDelete: "CASCADE" });
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


Option.hasMany(Product);
Product.belongsTo(Option,{as:"brand",foreignKey:"OptionId"}); //OptionId in Product table

Option.hasMany(ProductVariantValues,{as:'options'});
ProductVariantValues.belongsTo(Option,{as:'options',foreignKey:"OptionId"}); //OptionId in ProductVariantValue table

Attribute.hasMany(ProductVariantValues,{as:'attribute'});
ProductVariantValues.belongsTo(Attribute,{as:'attribute',foreignKey:"AttributeId"}); //AttributeId in ProductVariantValue table


Attribute.hasMany(Option,{as: "options"});
Option.belongsTo(Attribute); //AttributeId in Option table


// FilterOption
Option.belongsToMany(Filter, { as: "filters", through: FilterOption });
Filter.belongsToMany(Option, { as: "options", through: FilterOption });
Option.hasMany(FilterOption);
FilterOption.belongsTo(Option);
Filter.hasMany(FilterOption);
FilterOption.belongsTo(Filter);


Attribute.hasMany(Filter,{as: "filters"});
Filter.belongsTo(Attribute,{as:"attribute",foreignKey:"AttributeId"}); //AttributeId in Filter table


// REVIEWS
Product.hasMany(ProductReview, { as:"rating", onDelete: "CASCADE" });
ProductReview.belongsTo(Product); // ProductId in Review Table
ProductSkus.hasMany(ProductReview, { as:"rating", onDelete: "CASCADE" });
ProductReview.belongsTo(ProductSkus); // ProductId in Review Table
User.hasMany(ProductReview, { as:"rating", onDelete: "CASCADE" });
ProductReview.belongsTo(User); // UserId in Review Table


// FAQ
Product.hasMany(ProductQuestion, { as:"question", onDelete: "CASCADE" });
ProductQuestion.belongsTo(Product); // ProductId in Question Table
ProductAnswer.hasMany(ProductQuestion, { as:"question", onDelete: "CASCADE" });
ProductQuestion.belongsTo(ProductAnswer); // AnswerId in Question Table
Product.hasMany(ProductAnswer, { as:"answer", onDelete: "CASCADE" });
ProductAnswer.belongsTo(Product); // ProductId in Answer Table