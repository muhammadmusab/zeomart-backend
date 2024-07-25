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
const seedProductVariantTypes = [
  {
    id: 1,
    uuid: uuidv4(),
    type: "base",
    label:"Base",
    createdAt: formatDate(new Date()),
  },
  {
    id: 1,
    uuid: uuidv4(),
    type: "ram_size",
    label:"Ram Size",
    createdAt: formatDate(new Date()),
  },
  {
    id: 1,
    uuid: uuidv4(),
    type: "storage_type",
    label:"Storage Type",
    createdAt: formatDate(new Date()),
  },
  {
    id: 1,
    uuid: uuidv4(),
    type: "version",
    label:"Version",
    createdAt: formatDate(new Date()),
  },
  {
    id: 1,
    uuid: uuidv4(),
    type: "internal_memory",
    label:"Internal Memory",
    createdAt: formatDate(new Date()),
  },
  {
    id: 1,
    uuid: uuidv4(),
    type: "color",
    label:"Color",
    createdAt: formatDate(new Date()),
  }
];

export const up: Seeder = async ({ context: sequelize }) => {
  await sequelize
    .getQueryInterface()
    .bulkInsert("ProductVariantTypes", seedProductVariantTypes);
};

export const down: Seeder = async ({ context: sequelize }) => {
  await sequelize
    .getQueryInterface()
    .bulkDelete("ProductVariantTypes", {
      id: seedProductVariantTypes.map((u) => u.id),
    });
};
