import { v4 as uuidv4 } from "uuid";
import type { Seeder } from "../umguz";
function formatDate(date: Date) {
  var year = date.getFullYear();
  var month = ("0" + (date.getMonth() + 1)).slice(-2);
  var day = ("0" + date.getDate()).slice(-2);
  var hour = ("0" + date.getHours()).slice(-2);
  var minute = ("0" + date.getMinutes()).slice(-2);
  var second = ("0" + date.getSeconds()).slice(-2);
  return (
    year + "-" + month + "-" + day + " " + hour + ":" + minute + ":" + second
  );
}
const seedProductVariantValues = [
  {
    id: 1,
    uuid: uuidv4(),
    ProductVariantId: 1,
    value: null, // if variant type is 'base'
    sku: "OMEN",
    oldVariantPrice: null,
    variantPrice: null,
    variantQuantity: 0,
    createdAt: formatDate(new Date()),
  },
  {
    id: 2,
    uuid: uuidv4(),
    ProductVariantId: 2,
    value: "Titanium Black", //  variant type is 'color'
    sku: "SM-S928BZKWMEA",
    oldPrice: "4486",
    currentPrice: "3833",
    totalQuantity: 2,
    createdAt: formatDate(new Date()),
  },
  {
    id: 3,
    uuid: uuidv4(),
    ProductVariantId: 2,
    value: "Titanium Gray", //  variant type is 'color'
    sku: "SM-S928BZKQMEA",
    oldPrice: "4382",
    currentPrice: "3970",
    totalQuantity: 3,
    createdAt: formatDate(new Date()),
  },
];

export const up: Seeder = async ({ context: sequelize }) => {
  await sequelize
    .getQueryInterface()
    .bulkInsert("ProductVariantValues", seedProductVariantValues);
};

export const down: Seeder = async ({ context: sequelize }) => {
  await sequelize.getQueryInterface().bulkDelete("ProductVariantValues", {
    id: seedProductVariantValues.map((u) => u.id),
  });
};
