import { Auth } from "../../models/Auth";
import { User } from "../../models/User";
import { Token } from "../../models/Token";
import { Address } from "../../models/Address";
import { Category } from "../../models/Category";
import { Filter } from "../../models/Filter";
import { Product } from "../../models/Product";
import { ProductSkus } from "../../models/ProductSku";

import { ProductImage } from "../../models/ProductImage";
import { ProductReview } from "../../models/ProductReview";
import { ProductVariantType } from "../../models/ProductVariantType";
import { ProductTypes } from "../../models/ProductType";
import { ProductVariantValues } from "../../models/ProductVariantValue";
import { SkuVariations } from "../../models/SkuVariation";
import { Cart } from "../../models/Cart";
import { CartItem } from "../../models/CartItem";
import { Shipping } from "../../models/Shipping";
import { Coupons } from "../../models/Coupon";

import { Payment } from "../../models/Payment";
import { CouponCart } from "../../models/CouponCart";


User.hasMany(Auth);
Auth.belongsTo(User);

Auth.hasMany(Token);
Token.belongsTo(Auth);

// user profile related relations
User.hasMany(Address);
Address.belongsTo(User);

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

// user profile related relations
Category.hasMany(Filter);
Filter.belongsTo(Category); //categoryId in filter table

//-------------------Product relations
Category.hasMany(Product);
Product.belongsTo(Category); //categoryId in Product table

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

//----IMAGE:  product and product variant value relation with Image
Product.hasMany(ProductImage, { onDelete: "CASCADE" });
ProductImage.belongsTo(Product); //ProductId in ProductImage table
ProductVariantValues.hasMany(ProductImage, { onDelete: "CASCADE" });
ProductImage.belongsTo(ProductVariantValues); //productVariantValueId in ProductImage table

//--- REVIEWS
// review relation with product and ProductSkus.
Product.hasMany(ProductReview, { onDelete: "CASCADE" });
ProductReview.belongsTo(Product); //productId in ProductReview table

//change this relation from ProductSkus to Sku_Variation table later when table is created-------

ProductSkus.hasMany(ProductReview, { onDelete: "CASCADE" });
ProductReview.belongsTo(ProductSkus); //ProductSkuId in ProductReview Table

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



// CHECKOUT PROCESS FLOW RELATIONS
// -----Cart
User.hasMany(Cart, { onDelete: "CASCADE" });
Cart.belongsTo(User); //UserId in Cart table , here user also has relation with AuthId where creds of user are stored.

//------Cart Item
Cart.hasMany(CartItem, { onDelete: "CASCADE" });
CartItem.belongsTo(Cart); //CartId in CartItem table

Product.hasMany(CartItem, { onDelete: "CASCADE" });
CartItem.belongsTo(Product); //ProductId in CartItem table

ProductSkus.hasMany(CartItem, { onDelete: "CASCADE" });
CartItem.belongsTo(ProductSkus); //ProductSkuId in CartItem table
ProductImage.hasMany(CartItem, { onDelete: "CASCADE" });
CartItem.belongsTo(ProductImage); //ProductImageId in CartItem table





//-----Payment
Cart.hasMany(Payment, { onDelete: "CASCADE" });
Payment.belongsTo(Cart); //OrderId in Payment table


//-----Coupon
Coupons.belongsToMany(Cart, { through: CouponCart });
Cart.belongsToMany(Coupons, { through: CouponCart });

//-----Shipping
Cart.hasMany(Shipping, { onDelete: "CASCADE" });
Shipping.belongsTo(Cart); //OrderId in Shipping table


