import express from "express";
import cors, { CorsOptions } from "cors";
import cookieParser from "cookie-parser";
import rateLimit from "express-rate-limit";
import { errorHandler } from "./middlewares/error-middleware";
import { PLATFORM_NAME } from "./utils/globals";
import logger from "morgan";
import path from "path";

import { sequelize } from "./config/db";
// @ts-ignore
global.PLATFORM_NAME = PLATFORM_NAME;
const app = express();

app.use(cookieParser());
const whitelist = [
  "http://localhost:3000",
  "http://localhost:3001",
  "http://localhost:4000",
  process.env.FORWARDED_URL,
];

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin) {
      //for bypassing postman req with  no origin
      return callback(null, true);
    }
    if (whitelist.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
} as CorsOptions;
if (process.env.NODE_ENV === "production") {
  corsOptions.credentials = true;
}

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
// {
//   origin: 'http://localhost:3000',
//   methods:['GET','POST','PATCH','DELETE','OPTIONS'],
//   allowedHeaders:['Content-Type','Authorization'],
//   credentials:true
// }
app.use(cors());
// ASSOCIATIONS
import "./utils/associations";
app.use("/media", express.static(path.join(__dirname, "media")));
app.use(express.text());
// Routes
import authRoutes from "./routes/auth";
import userRoutes from "./routes/user";
import vendorRoutes from "./routes/vendor";
import vendorSocialRoutes from "./routes/vendor-social";
import addressRoutes from "./routes/address";
import categoryRoutes from "./routes/category";
import filterRoutes from "./routes/filter";
// product
import productRoutes from "./routes/product/product";
import brandRoutes from "./routes/product/brand";
import productVariantRoutes from "./routes/product/productVariant";
import attributeRoutes from "./routes/attribute";
import optionRoutes from "./routes/option";
import productSkuRoutes from "./routes/product/productSku";
import productReviewRoutes from "./routes/product/productReview";
import productFavouritesRoutes from "./routes/product/productFavourites";
import productQuestionRoutes from "./routes/product/productQuestion";
import productAnswerRoutes from "./routes/product/productAnswer";
// cart
import cartRoutes from "./routes/cart/cart";
import cartItemRoutes from "./routes/cart/cartItem";
import paymentRoutes from "./routes/payment";


//attribute
app.use("/v1/api/attribute", attributeRoutes);
app.use("/v1/api/option", optionRoutes);


import couponRoutes from "./routes/coupon";
import shippingRoutes from "./routes/shipping";

app.use("/v1/api/auth", authRoutes);
app.use("/v1/api/user", userRoutes);
app.use("/v1/api/vendor", vendorRoutes);
app.use("/v1/api/vendor/social", vendorSocialRoutes);
app.use("/v1/api/address", addressRoutes);
app.use("/v1/api/category", categoryRoutes);
app.use("/v1/api/filter", filterRoutes);

app.use("/v1/api/brand", brandRoutes);


// product
app.use("/v1/api/product", productRoutes);


app.use("/v1/api/product/review", productReviewRoutes);
app.use("/v1/api/product/sku", productSkuRoutes);
app.use("/v1/api/product/variant", productVariantRoutes);
app.use("/v1/api/product/wishlist", productFavouritesRoutes);
app.use("/v1/api/product/question", productQuestionRoutes);
app.use("/v1/api/product/answer", productAnswerRoutes);

// cart
app.use('/v1/api/cart', cartRoutes);
app.use('/v1/api/cart-item', cartItemRoutes);

//coupon
// app.use('/v1/api/coupon',couponRoutes);

//shipping
app.use("/v1/api/payment", paymentRoutes);
app.use("/v1/api/shipping", shippingRoutes);

//Error Handler
app.use(errorHandler);

const port = process.env.PORT;

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 50, // Limit each IP to 100 requests per `window` (here, per 15 minutes)
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

// Apply the rate limiting middleware to all requests
// app.use(limiter);
try {
  sequelize.authenticate().then(() => {
    // await sequelize.sync({alter:true})
    console.log("Connection has been established successfully.");
    app.listen(port);
    console.log("listening to port ", port);
  });
} catch (error) {
  console.error("Unable to connect to the database:", error);
}
export default app;
