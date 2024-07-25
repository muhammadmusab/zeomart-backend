
import { v4 as uuidv4 } from 'uuid';
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
const seedProductVariant = [
  {
    id: 1,
    uuid: uuidv4(),
    type: "base",
    ProductId: 1,
    createdAt: formatDate(new Date()),
  },
  {
    id: 2,
    uuid: uuidv4(),
    type: "color",
    ProductId: 2,
    createdAt: formatDate(new Date()),
  },
  {
    id: 3,
    uuid: uuidv4(),
    type: "internal_memory",
    ProductId: 2,
    createdAt: formatDate(new Date()),
  },
  {
    id: 4,
    uuid: uuidv4(),
    type: "version",
    ProductId: 2,
    createdAt: formatDate(new Date()),
  },
];

export const up: Seeder = async ({ context: sequelize }) => {
  await sequelize.getQueryInterface().bulkInsert("ProductVariant", seedProductVariant);
};

export const down: Seeder = async ({ context: sequelize }) => {
  await sequelize
    .getQueryInterface()
    .bulkDelete("ProductVariant", { id: seedProductVariant.map((u) => u.id) });
};
