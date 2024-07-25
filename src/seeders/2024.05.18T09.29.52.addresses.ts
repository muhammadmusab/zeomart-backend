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
const seedAddresses = [
  {
    id: 1,
    uuid: uuidv4(),
    name: "Musab",
    city: "Hyd",
    UserId:1,
    country: "Pakistan",
    address1: "B A2, Flat 3 Alrehman Appt",
    address2: "Near Saima Plaza",
    postalCode: "71000",
    createdAt: formatDate(new Date()),
  },
  {
    id: 2,
    uuid: uuidv4(),
    name: "Musab",
    city: "Hyd",
    UserId:1,
    country: "Pakistan",
    address1: "B 213, phase 2 Qadir Avenue",
    address2: "Near National Super Market",
    postalCode: "71000",
    createdAt: formatDate(new Date()),
  },
];

export const up: Seeder = async ({ context: sequelize }) => {
  await sequelize.getQueryInterface().bulkInsert("Addresses", seedAddresses);
};

export const down: Seeder = async ({ context: sequelize }) => {
  await sequelize
    .getQueryInterface()
    .bulkDelete("Addresses", { id: seedAddresses.map((u) => u.id) });
};
