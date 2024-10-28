
-- product, category, rating,media
SELECT p."uuid",p."title",p."status",p."slug",p."overview",p."highlights",p."sku",p."currentPrice",p."oldPrice",p."quantity",p."features",p."sold",p."hasVariants",p."createdAt",
    json_build_object(
    'total',COUNT(DISTINCT pr."id"),
    'average', COALESCE(ROUND(CAST(AVG(pr."rating") AS NUMERIC), 1), 0)
    ) as "rating",
     json_build_object('title',c."title",'slug',c."slug") as "category"
    FROM public."Products" as p
       JOIN "Categories" as c ON p."CategoryId" = c."id"
       JOIN "ProductReview" as pr ON pr."ProductId" = p."id"
    WHERE p."id"=12
    GROUP BY p."uuid",p."hasVariants",p."title",p."status",p."slug",p."overview",p."highlights",p."sku",p."currentPrice",p."oldPrice",p."quantity",p."features",p."sold",p."createdAt",c."title",c."slug";


   SELECT  pm."uuid","url","width","height","size","mime","name" from "Media" as pm
   JOIN "Products" as p ON pm."mediaableId" = p."id"
   WHERE p."id"= 12 AND pm."mediaableType"='Product' AND  pm."mediaableId" = p."id";



-- product_sku, attribute,options,media

   SELECT  psm."uuid","url","width","height","size","mime","name" from "Media" as psm
   JOIN "ProductSkus" as ps ON psm."mediaableId" = ps."id"
   WHERE ps."ProductId"= 12 AND psm."mediaableType"='ProductSku' AND  psm."mediaableId" = ps."id";


   SELECT json_build_object('uuid', ps."uuid",'isDefault',ps."isDefault",'sku', ps."sku",'oldPrice',ps."oldPrice",'currentPrice',ps."currentPrice",'quantity',ps."quantity") as "sku",array_agg(json_build_object('productVariantValueUniqueId',pvv."uuid",'option',o."value",'optionUniqueId',o."uuid",'attribute',a."title",'type',a."type",'attributeUniqeId',a."uuid",'skuVariantUniqueId',sv."uuid")) as "attributeOptions"
                FROM "SkuVariations" as sv
                    JOIN "ProductSkus" as ps ON sv."ProductSkuId" = ps."id"
                    JOIN "ProductVariantValues" as pvv ON sv."ProductVariantValueId" = pvv."id"
                    JOIN "Options" as o ON pvv."OptionId" = o."id"
                    JOIN "Attributes" as a ON pvv."AttributeId" = a."id"
                WHERE ps."ProductId"=12
                GROUP BY  ps."uuid",ps."sku",ps."oldPrice",ps."currentPrice",ps."quantity",ps."uuid",ps."isDefault";





ALTER Table public."ProductSkus" DROP CONSTRAINT "ProductSkus_sku_key4";


SELECT * 
FROM "SkuVariations" 
WHERE "ProductSkuId" = ANY(ARRAY[16]::int[]);





SELECT p."uuid",p."title",p."status",p."slug",p."overview",p."highlights",p."sku",p."currentPrice",p."oldPrice",p."quantity",p."features",p."sold",p."hasVariants",p."createdAt",
                array_agg(
                DISTINCT jsonb_build_object(
                'id',pm."id",'url',pm."url",'width',pm."width",'height',pm."height",'size',pm."size",'mime',pm."mime",'name',pm."name") 
                ) as "media",
                Select pvv."uuid" WHERE ps."isDefault" = TRUE,
                json_build_object(
                'total',COUNT(DISTINCT pr."id"),
                'average', COALESCE(ROUND(CAST(AVG(pr."rating") AS NUMERIC), 1), 0)
                ) as "rating",
                 json_build_object('title',c."title",'slug',c."slug") as "category",
                 json_build_object('uuid',ps."uuid",'sku',ps."sku",'oldPrice',ps."oldPrice",'currentPrice',ps."currentPrice",'quantity',ps."quantity",'isDefault',ps."isDefault") as "sku"
                FROM public."Products" as p
                   LEFT  JOIN "Media" as pm ON pm."mediaableId" = p."id" AND pm."mediaableType"='Product'
                   LEFT  JOIN "Categories" as c ON p."CategoryId" = c."id"
                   LEFT  JOIN "ProductSkus" as ps ON ps."ProductId" = p."id"
                   LEFT  JOIN "SkuVariations" as sv ON sv."ProductId" = p."id"
                   LEFT  JOIN "ProductVariantValues" as pvv ON sv."ProductVariantValueId" = pvv."id"
                   LEFT  JOIN "Options" as o ON pvv."OptionId" = o."id"
                   LEFT  JOIN "Attributes" as a ON pvv."AttributeId" = a."id"
                   LEFT  JOIN "ProductReview" as pr ON pr."ProductId" = p."id"
                WHERE (ps."isDefault" = TRUE OR ps."id" IS NULL)
                GROUP BY p."uuid",p."hasVariants",p."title",p."status",p."slug",p."overview",p."highlights",p."sku",p."currentPrice",p."oldPrice",p."quantity",p."features",p."sold",p."createdAt",c."title",c."slug",ps."uuid",ps."sku",ps."oldPrice",ps."currentPrice",ps."quantity",ps."uuid",ps."isDefault";




                SELECT "uuid", "combinationIds", "createdAt", "updatedAt", "ProductSkuId" FROM "SkuVariations" AS "SkuVariations" WHERE "SkuVariations"."combinationIds" = ARRAY[24,25]::INTEGER[];





SELECT p."uuid",p."title",p."status",p."slug",p."overview",p."highlights",p."sku",p."currentPrice",p."oldPrice",p."quantity",p."features",p."sold",p."hasVariants",p."createdAt",
     jsonb_build_object(
    'total',COUNT(DISTINCT pr."id"),
    'average', COALESCE(ROUND(CAST(AVG(pr."rating") AS NUMERIC), 1), 0)
    ) as "rating",
     json_build_object('title',c."title",'slug',c."slug") as "category"
    FROM public."Products" as p
      LEFT JOIN "Categories" as c ON p."CategoryId" = c."id"
      LEFT JOIN "ProductReview" as pr ON pr."ProductId" = p."id"
    WHERE p."uuid"='de24acd9-642d-41d9-b410-b8ffa2ef38ef'
    GROUP BY p."uuid",p."hasVariants",p."title",p."status",p."slug",p."overview",p."highlights",p."sku",p."currentPrice",p."oldPrice",p."quantity",p."features",p."sold",p."createdAt",c."title",c."slug",pr."ProductSkuId"
    HAVING pr."ProductSkuId"='34';



    SELECT p."uuid",p."title",p."status",p."slug",p."overview",p."highlights",p."sku",p."currentPrice",p."oldPrice",p."quantity",p."features",p."sold",p."hasVariants",p."createdAt",
    json_build_object(
    'total',COUNT(DISTINCT pr."id"),
    'average', COALESCE(ROUND(CAST(AVG(pr."rating") AS NUMERIC), 1), 0)
    ) as "rating",
     json_build_object('title',c."title",'slug',c."slug") as "category"
    FROM public."Products" as p
      LEFT JOIN "Categories" as c ON p."CategoryId" = c."id"
      LEFT JOIN "ProductReview" as pr ON pr."ProductId" = p."id"
    WHERE p."uuid"='de24acd9-642d-41d9-b410-b8ffa2ef38ef'
    GROUP BY p."uuid",p."hasVariants",p."title",p."status",p."slug",p."overview",p."highlights",p."sku",p."currentPrice",p."oldPrice",p."quantity",p."features",p."sold",p."createdAt",c."title",c."slug",pr."ProductSkuId"
    HAVING pr."ProductSkuId"='34';


    Select json_build_object(
    'total',COUNT(DISTINCT pr."id"),
    'average', COALESCE(ROUND(CAST(AVG(pr."rating") AS NUMERIC), 1), 0)  
    ) as "rating" from "ProductReview" as pr
    ;



    alter Table "ProductReview" ADD CONSTRAINT ProductReview_UserId_fkey FOREIGN key("UserId") REFERENCES "Users"(id);

    ALTER TABLE "ProductReview"
    ADD COLUMN "UserId" INTEGER;
    ALTER TABLE "ProductReview"
    ADD CONSTRAINT ProductReview_UserId_fkey
    FOREIGN KEY ("UserId") REFERENCES "Users"(id);


    SELECT COUNT(pr."rating") as rating_count,ROUND((COUNT(pr."rating")::decimal / SUM(COUNT(pr."rating")) OVER ()) * 100)  AS percentage, pr."rating" from "ProductReview" as pr GROUP BY pr."rating";