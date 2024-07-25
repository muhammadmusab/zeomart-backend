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
const seedFilters = [
  {
    id: 1,
    uuid: uuidv4(),
    options: JSON.stringify([
      { label: "ASUS", value: "asus" },
      { label: "HP", value: "hp" },
      { label: "Lenovo", value: "lenovo" },
      { label: "DELL", value: "dell" },
      { label: "microsoft", value: "Microsoft" },
    ]),
    title: "Brand",
    // additionalTitle: null,
    type: "checkbox",
    CategoryId: 12,
    createdAt: formatDate(new Date()),
  },
  {
    id: 2,
    uuid: uuidv4(),
    options: JSON.stringify([
      { label: "min", value: 0 },
      { label: "max", value: 18000 },
    ]),
    title: "Price",
    // additionalTitle: null,
    type: "range",
    CategoryId: 12,
    createdAt: formatDate(new Date()),
  },
  {
    id: 3,
    uuid: uuidv4(),
    options: JSON.stringify([
      { label: "NVIDIA GeForce RTX", value: "nvidia_geforce_rtx" },
      { label: "Intel Iris", value: "intel_iris" },
      { label: "Intel UHD", value: "intel_uhd" },
      { label: "NVIDIA GeForce GTX", value: "nvidia_geforce_gtx" },
      { label: "AMD Radeon", value: "amd_radeon" },
      { label: "AMD Radeon RX", value: "amd_radeon_rx" },
    ]),
    title: "Graphics Processor Series",
    // additionalTitle: null,
    type: "checkbox",
    CategoryId: 12,
    createdAt: formatDate(new Date()),
  },
  {
    id: 4,
    uuid: uuidv4(),
    options: JSON.stringify([
      { label: "GeForce RTX 1650", value: "geforce_rtx_1650" },
      { label: "GeForce RTX 2050", value: "geforce_rtx_2050" },
      { label: "GeForce RTX 2060", value: "geforce_rtx_2060" },
      { label: "GeForce RTX 2070", value: "geforce_rtx_2070" },
      { label: "GeForce RTX 2070 Super", value: "geforce_rtx_2070_super" },
      { label: "GeForce RTX 2080 Super", value: "geforce_rtx_2080_super" },
      { label: "GeForce RTX 3050", value: "geforce_rtx_3050" },
      { label: "GeForce RTX 3050 Ti", value: "geforce_rtx_3050_ti" },
      { label: "GeForce RTX 3060", value: "geforce_rtx_3060" },
      { label: "GeForce RTX 3070", value: "geforce_rtx_3070" },
      { label: "GeForce RTX 3070 Ti", value: "geforce_rtx_3070_ti" },
      { label: "GeForce RTX 3080", value: "geforce_rtx_3080" },
      { label: "GeForce RTX 3080 Ti", value: "geforce_rtx_3080_ti" },
      { label: "GeForce RTX 4050", value: "geforce_rtx_4050" },
      { label: "GeForce RTX 4060", value: "geforce_rtx_4060" },
      { label: "GeForce RTX 4070", value: "geforce_rtx_4070" },
      { label: "GeForce RTX 4080", value: "geforce_rtx_4080" },
      { label: "GeForce RTX 4090", value: "geforce_rtx_4090" },
    ]),
    title: "Graphics Processor Version",
    // additionalTitle: null,
    type: "checkbox",
    CategoryId: 12,
    createdAt: formatDate(new Date()),
  },
  {
    id: 5,
    uuid: uuidv4(),
    options: JSON.stringify([
      { label: "Core i9", value: "core_i9" },
      { label: "Core i7", value: "core_i7" },
      { label: "Core i5", value: "core_i5" },
      { label: "Ryzen 5", value: "ryzen_5" },
      { label: "Ryzen 7", value: "ryzen_7" },
      { label: "Ryzen 9", value: "ryzen_9" },
    ]),
    title: "Processor Type",
    // additionalTitle: null,
    type: "checkbox",
    CategoryId: 12,
    createdAt: formatDate(new Date()),
  },
  {
    id: 6,
    uuid: uuidv4(),
    options: JSON.stringify([
      { label: "8 GB", value: "8_gb" },
      { label: "16 GB", value: "16_gb" },
      { label: "32 GB", value: "32_gb_and_more" },
    ]),
    title: "Ram Size",
    // additionalTitle: null,
    type: "checkbox",
    CategoryId: 12,
    createdAt: formatDate(new Date()),
  },
  {
    id: 7,
    uuid: uuidv4(),
    options: JSON.stringify([
      { label: "500 GB", value: "500_gb" },
      { label: "Between 500GB-1TB", value: "between_500gb_1tb" },
      { label: "1 TB", value: "1_tb" },
      { label: "1.5 TB", value: "1.5_tb_and_more" },
    ]),
    title: "Storage Size",
    // additionalTitle: null,
    type: "checkbox",
    CategoryId: 12,
    createdAt: formatDate(new Date()),
  },
  {
    id: 8,
    uuid: uuidv4(),
    options: JSON.stringify([
      { label: "SSD", value: "ssd" },
      { label: "HDD", value: "hdd" },
      { label: "SSD+HDD(Hybrid)", value: "hybrid" },
    ]),
    title: "Storage Type",
    // additionalTitle: null,
    type: "checkbox",
    CategoryId: 12,
    createdAt: formatDate(new Date()),
  },
];

export const up: Seeder = async ({ context: sequelize }) => {
  await sequelize.getQueryInterface().bulkInsert("Filters", seedFilters);
};

export const down: Seeder = async ({ context: sequelize }) => {
  await sequelize
    .getQueryInterface()
    .bulkDelete("Filters", { id: seedFilters.map((u) => u.id) });
};
