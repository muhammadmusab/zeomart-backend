import type { Seeder } from "../umguz";
import { v4 as uuidv4 } from "uuid";
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
const seedCategories = [
  {
    id: 1,
    uuid: uuidv4(),
    title: "Men",
    parentId: null,
    createdAt: formatDate(new Date()),
  },
  {
    id: 2,
    uuid: uuidv4(),
    title: "Women",
    parentId: null,
    createdAt: formatDate(new Date()),
  },
  {
    id: 3,
    uuid: uuidv4(),
    title: "Electronics",
    parentId: null,
    createdAt: formatDate(new Date()),
  },
  {
    id: 4,
    uuid: uuidv4(),
    title: "T-Shirts",
    parentId: 1,
    createdAt: formatDate(new Date()),
  },
  {
    id: 5,
    uuid: uuidv4(),
    title: "Activewear",
    parentId: 1,
    createdAt: formatDate(new Date()),
  },
  {
    id: 6,
    uuid: uuidv4(),
    title: "Pants-And-Trousers",
    parentId: 1,
    createdAt: formatDate(new Date()),
  },
  {
    id: 7,
    uuid: uuidv4(),
    title: "Men-Shirts",
    parentId: 1,
    createdAt: formatDate(new Date()),
  },
  {
    id: 8,
    uuid: uuidv4(),
    title: "Women-Shirts",
    parentId: 2,
    createdAt: formatDate(new Date()),
  },
  {
    id: 9,
    uuid: uuidv4(),
    title: "T-Shirts",
    parentId: 2,
    createdAt: formatDate(new Date()),
  },
  {
    id: 10,
    uuid: uuidv4(),
    title: "Activewear",
    parentId: 2,
    createdAt: formatDate(new Date()),
  },
  {
    id: 11,
    uuid: uuidv4(),
    title: "Shoes",
    parentId: 2,
    createdAt: formatDate(new Date()),
  },
  {
    id: 12,
    uuid: uuidv4(),
    title: "Laptops",
    parentId: 3,
    createdAt: formatDate(new Date()),
  },
  {
    id: 13,
    uuid: uuidv4(),
    title: "Printers",
    parentId: 3,
    createdAt: formatDate(new Date()),
  },
  {
    id: 14,
    uuid: uuidv4(),
    title: "Mobile-Phones",
    parentId: 3,
    createdAt: formatDate(new Date()),
  },

];

export const up: Seeder = async ({ context: sequelize }) => {
  await sequelize.getQueryInterface().bulkInsert("Categories", seedCategories);
};

export const down: Seeder = async ({ context: sequelize }) => {
  await sequelize
    .getQueryInterface()
    .bulkDelete("Categories", { id: seedCategories.map((u) => u.id) });
};
