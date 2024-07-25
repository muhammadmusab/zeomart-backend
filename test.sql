-- Active: 1703704184946@@127.0.0.1@5432@phm@public
SELECT "SkuVariations"."ProductSkuId",
    json_agg(
        json_build_object(
            'uuid',
            ps."uuid",
            'oldPrice',
            ps."oldPrice",
            'currentPrice',
            ps."currentPrice",
            'quantity',
            ps."quantity",
            'sku',
            ps."sku",
            'ProductVariantValue',
            json_build_object(
                'uuid',
                pvv."uuid",
                'value',
                pvv."value"
            ),
            'variations',
            json_build_object(
                'uuid',
                sv."uuid"
            )
        )
    )
FROM "SkuVariations" as sv
    JOIN "ProductSkus" as ps ON sv."ProductSkuId" = ps."id"
    JOIN "ProductVariantValues" as pvv ON sv."ProductVariantValueId" = pvv."id"
WHERE sv."ProductId" = 2
GROUP BY sv."ProductSkuId";
-- 
SELECT ps.sku,
    ps."oldPrice",
    ps."currentPrice",
    ps.quantity,
    array_agg(
        json_build_object(
            'uuid',
            pvv.uuid,
            'value',
            pvv."value",
            'skuVariantUniqueId',
            sv.uuid,
            'skuUniqueId',
            ps.uuid
        )
    ) as "variantValues"
from "SkuVariations" as sv
    JOIN "ProductSkus" as ps ON sv."ProductSkuId" = ps."id"
    JOIN "ProductVariantValues" as pvv ON sv."ProductVariantValueId" = pvv."id"
WHERE sv."ProductId" = 2
GROUP BY "ProductSkuId",
    ps.sku,
    ps."oldPrice",
    ps."currentPrice",
    ps.quantity,
    ps.uuid;
--
SELECT json_build_object('product',p.id), array_agg(
        json_build_object(
            'productVariantValueUniqueId',
            pvv.uuid,
            'skuUniqueId',
            ps.uuid,
            'value',
            pvv."value",
            'elementType',
            pvt."elementType",
            'type',
            pt."type",
            'skuVariantUniqueId',
            sv.uuid,
            'skuUniqueId',
            ps.uuid
        )
    )
FROM "Products" p
    JOIN "Categories" c ON p."CategoryId" = c.id
    JOIN "SkuVariations" sv ON sv."ProductId" = p.id
    JOIN "ProductSkus" as ps ON sv."ProductSkuId" = ps."id"
    JOIN "ProductVariantValues" as pvv ON sv."ProductVariantValueId" = pvv."id"
    JOIN "ProductVariantTypes" as pvt ON pvv."ProductVariantTypeId" = pvt."id"
    JOIN "ProductTypes" as pt ON pvt."ProductTypeId" = pt."id"
    JOIN "ProductImage" pi ON pi."ProductVariantValueId" = pvv.id
GROUP BY p."id";










SELECT ps.sku,
    ps."oldPrice",
    ps."currentPrice",
    ps.quantity,
    array_agg(
        json_build_object(
            'productVariantValueUniqueId',
            pvv.uuid,
            'skuUniqueId',
            ps.uuid,
            'value',
            pvv."value",
            'elementType',
            pvt."elementType",
            'type',
            pt."type",
            'skuVariantUniqueId',
            sv.uuid,
            'skuUniqueId',
            ps.uuid
        )
    ) as "variantValues"
FROM "SkuVariations" as sv
    JOIN "ProductSkus" as ps ON sv."ProductSkuId" = ps."id"
    JOIN "ProductVariantValues" as pvv ON sv."ProductVariantValueId" = pvv."id"
    JOIN "ProductVariantTypes" as pvt ON pvv."ProductVariantTypeId" = pvt."id"
    JOIN "ProductTypes" as pt ON pvt."ProductTypeId" = pt."id"
WHERE $ {
where }
GROUP BY "ProductSkuId",
    ps.sku,
    ps."oldPrice",
    ps."currentPrice",
    ps.quantity,
    ps.uuid;



    ALTER TABLE "ProductReview" ALTER COLUMN email SET NOT NULL;

    ALTER TABLE "Tax" ADD CONSTRAINT region_unique UNIQUE (region);
    ALTER TABLE "Coupons" ADD CONSTRAINT code_unique UNIQUE (code);



    ALTER TABLE "Cart" ADD COLUMN "discountPrice" NUMERIC(12,2);
    ALTER TABLE "Shipping" ADD COLUMN "CartId" INTEGER  NOT NULL;