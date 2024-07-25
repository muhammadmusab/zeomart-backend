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
const seedProductData = [
  {
    id: 1,
    uuid: uuidv4(),
    highlights: [
      "NVIDIA GeForce RTX 4060 Laptop GPU Realistic and immersive graphics deliver AI-accelerated performance for power-packed gaming, enhanced 3D rendering and hyper-efficient data processing.",
      "NVIDIA GeForce RTX 4060 Laptop GPU Realistic and immersive graphics deliver AI-accelerated performance for power-packed gaming, enhanced 3D rendering and hyper-efficient data processing",
      "Micro-edge display The 16.1-inch, FHD, 300-nit, 165Hz, anti-glare, micro-edge, and TUV Eyesafe certified display immerses you in action with a fast 7 ms response time and smooth frame rates.",
      "Keep all your conversations private with the help of an easy-to-activate mute button",
      "Keep all your conversations private with the help of an easy-to-activate mute button",
      "Long battery life Fast charge your device with from 0% to 50% in 30 mins and get back to your squad in no time. The durable 83Wh battery facilitates extended gaming sessions without interruptions.",
    ],
    overview:
      "OMEN Gaming Laptop 16, 13th Gen Intel Core i5-13500HX, 16.1-inch, NVIDIA GeForce 8GB-RTX 4060, FHD, 32 GB DDR5 RAM, 2 TB NVME SSD, RGB Backlit KB, Win 11 English Black.",
    specifications: JSON.stringify([
      {
        label: "Operating System Version",
        value: "Windows 11",
      },
      {
        label: "Display Resolution Type",
        value: "FHD+",
      },
      {
        label: "Processor Speed",
        value: "2.4 GHz",
      },
      {
        label: "Operating System",
        value: "Windows",
      },
      {
        label: "RAM Size",
        value: "32 GB",
      },
      {
        label: "Storage Type",
        value: "SSD",
      },
      {
        label: "Internal Memory",
        value: "2 TB",
      },
      {
        label: "Display Type",
        value: "FHD",
      },
      {
        label: "Version",
        value: "International Version",
      },
      {
        label: "Screen Size",
        value: "16 In",
      },
      {
        label: "Display Resolution",
        value: "1920x1080",
      },
      {
        label: "Colour Name",
        value: "Black",
      },
      {
        label: "Processor Type",
        value: "Intel Core I5",
      },
      {
        label: "Laptop Type",
        value: "Notebook",
      },
      {
        label: "Processor Version Number/Generation",
        value: "13 Generation",
      },
      {
        label: "Number Of Cores",
        value: "Quad Core",
      },
      {
        label: "RAM Type",
        value: "DDR5",
      },
      {
        label: "Processor Brand",
        value: "Intel",
      },
      {
        label: "External Graphics",
        value: "Integrated",
      },
      {
        label: "Average Battery Life",
        value: "8 Hours",
      },
      {
        label: "Keyboard Language",
        value: "English",
      },
      {
        label: "Graphics Processor Series",
        value: "NVIDIA GeForce RTX",
      },
      {
        label: "Graphics Processor Version",
        value: "GeForce RTX 4060",
      },
      {
        label: "Features",
        value: "Gaming",
      },
      {
        label: "Model Number",
        value: "OMEN",
      },
      {
        label: "Model Name",
        value: "OMEN",
      },
      {
        label: "HDMI Output",
        value: "Yes",
      },
      {
        label: "Number Of USB Ports",
        value: "2",
      },
      {
        label: "SD Card Slot",
        value: "Yes",
      },
      {
        label: "Processor Version",
        value: "Core I5-13500HX",
      },
    ]),
    ProductId: 1,
    createdAt: formatDate(new Date()),
  },
  {
    id: 2,
    uuid: uuidv4(),
    overview:"Galaxy S24 Ultra Dual SIM Titanium Black 12GB RAM 512GB 5G - Middle East Version",
    highlights: [
      "The samsung galaxy S24 is universally use the new snapdragon 8 gen 3 across the world",
      "The galaxy S24 have AI-optimized main camera photos. Night mode is also better. Nightography zoom will bring brighter nighttime photos with the zoom cameras",
      "The samsung galaxy S24 ultra comes with emergency texting via satellite support over the 3GPP standard",
    ],
    specifications: JSON.stringify([
      {
        label: "Secondary Camera Resolution",
        value: "12 MP",
      },
      {
        label: "Charging Type",
        value: "Type-C",
      },
      {
        label: "SIM Type",
        value: "Nano SIM",
      },
      {
        label: "SIM Count",
        value: "Dual SIM",
      },
      {
        label: "Operating System",
        value: "Android",
      },
      {
        label: "Secondary Camera",
        value: "12 - 15.9 MP",
      },
      {
        label: "RAM Size",
        value: "12 GB",
      },
      {
        label: "Battery Size",
        value: "5000 MAh",
      },
      {
        label: "Internal Memory",
        value: "512 GB",
      },
      {
        label: "Version",
        value: "Middle East Version",
      },
      {
        label: "Screen Size",
        value: "6.8 In",
      },
      {
        label: "Primary Camera Resolution",
        value: "200 MP",
      },
      {
        label: "Colour Name",
        value: "Titanium Black",
      },
      {
        label: "Network Frequency Band",
        value: "GSM/LTE/UMTS",
      },
      {
        label: "Camera Type",
        value: "Primary Camera + Secondary Camera",
      },
      {
        label: "Primary Camera Feature",
        value: "Triple",
      },
      {
        label: "Refresh Rates",
        value: "120Hz",
      },
      {
        label: "Network Type",
        value: "5G",
      },
      {
        label: "Condition",
        value: "New",
      },
      {
        label: "Model Number",
        value: "SM-S928BZKQMEA",
      },
      {
        label: "Model Name",
        value: "SM-S928BZKQMEA",
      },
      {
        label: "Primary Camera (MP)",
        value: "200+10+12",
      },
    ]),
    ProductId: 2,
    createdAt: formatDate(new Date()),
  },
];

export const up: Seeder = async ({ context: sequelize }) => {
  await sequelize
    .getQueryInterface()
    .bulkInsert("ProductData", seedProductData);
};

export const down: Seeder = async ({ context: sequelize }) => {
  await sequelize
    .getQueryInterface()
    .bulkDelete("ProductData", { id: seedProductData.map((u) => u.id) });
};
