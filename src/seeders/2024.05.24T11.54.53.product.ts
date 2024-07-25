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
const seedProducts = [
  {
    id: 1,
    uuid: uuidv4(),
    sku: "SM-S928BZKQMEA",
    brand: "ASUS",
    title:
      "Q540VJ Notebook With 15.6-Inch Display, Core i9-13900H Processor/16GB RAM/1TB SSD/6GB NVIDIA RTX 3050 Graphics Card/Windows 11 English Black",
    oldPrice: "6369",
    currentPrice: "3989",
    totalQuantity: "2",
    multipart: 0,
    status: "37% Off",
    highlights: [
      '2023 ASUS 15.6" OLED Laptop - Intel Core i9 - NVIDIA RTX3050',
      "16GB system memory for advanced multitasking",
      "A full set of I/O ports One ultrafast Thunderbolt 4 port for fast-charging devices can connect two 4K displays or one 8K display",
      "1TB PCIe SSD for wait-free app load and booting",
      "Long-lasting 70 Wh battery with its 12-hour battery life",
    ],
    overview:
      "Q540VJ Notebook With 15.6-Inch Display, Core i9-13900H Processor/16GB RAM/1TB SSD/6GB NVIDIA RTX 3050 Graphics Card/Windows 11 English Black",
    specifications: [
      { label: "Operating System Version", value: "Windows 11" },
      { label: "Display Resolution Type", value: "Full HD" },
      { label: "Processor Speed", value: "4.7 GHz" },
      { label: "Operating System", value: "Windows" },
      { label: "RAM Size", value: "16 GB" },
      { label: "Storage Type", value: "SSD" },
      { label: "Internal Memory", value: "1 TB" },
      { label: "Display Type", value: "OLED" },
      { label: "Screen Size", value: "15.6 In" },
      { label: "Display Resolution", value: "2880x1800" },
      { label: "Colour Name", value: "Black" },
      { label: "Processor Type", value: "Core I9" },
      { label: "Laptop Type", value: "Notebook" },
      { label: "Processor Version Number/Generation", value: "13th Gen" },
      { label: "What's In The Box", value: "Charger + Cable" },
      { label: "Number Of Cores", value: "14-Core" },
      { label: "RAM Type", value: "DDR5" },
      { label: "Processor Brand", value: "Intel" },
      { label: "External Graphics", value: "Graphic Card" },
      { label: "Usage Type", value: "Gaming" },
      { label: "Average Battery Life", value: "4 Hours" },
      { label: "Keyboard Language", value: "English" },
      { label: "Graphics Processor Series", value: "NVIDIA GeForce RTX" },
      { label: "Graphics Processor Version", value: "GeForce RTX 3050" },
      { label: "Graphic Memory", value: "6 GB" },
      { label: "Features", value: "Intel, Bluetooth" },
      { label: "Model Number", value: "Q540VJ-I93050" },
      { label: "Model Name", value: "Q540VJ-I93050" },
      { label: "HDMI Output", value: "YES" },
      { label: "Number Of USB Ports", value: "2" },
      { label: "SD Card Slot", value: "NO" },
      { label: "Number Of HDMI Ports", value: "1" },
      { label: "Processor Version", value: "Core I9-13900H" },
    ],

    CategoryId: 12,
    createdAt: formatDate(new Date()),
  },
  {
    id: 2,
    uuid: uuidv4(),

    brand: "Samsung",
    title:
      "Galaxy S24 Ultra Dual SIM Titanium Black 12GB RAM 512GB 5G - Middle East Version",
    slug: "Galaxy-S24-Ultra-Dual-SIM-Titanium-Black-12GB-RAM-512GB-5G-Middle-East-Version",
    overview:
      "Galaxy S24 Ultra Dual SIM Titanium Black 12GB RAM 512GB 5G - Middle East Version",
    highlights: [
      "The samsung galaxy S24 is universally use the new snapdragon 8 gen 3 across the world",
      "The galaxy S24 have AI-optimized main camera photos. Night mode is also better. Nightography zoom will bring brighter nighttime photos with the zoom cameras",
      "The samsung galaxy S24 ultra comes with emergency texting via satellite support over the 3GPP standard",
    ],
    basePrice: "3000",
    baseQuantity: 0, // because quantity will be decided based on the variant, so if product has variant we put 0 for baseQuantity.
    CategoryId: 14,
    createdAt: formatDate(new Date()),
  },
];

export const up: Seeder = async ({ context: sequelize }) => {
  await sequelize.getQueryInterface().bulkInsert("Products", seedProducts);
};

export const down: Seeder = async ({ context: sequelize }) => {
  await sequelize
    .getQueryInterface()
    .bulkDelete("Products", { id: seedProducts.map((u) => u.id) });
};
