node migrate --help # show CLI help

node migrate up # apply migrations
node migrate down # revert the last migration
node migrate down --to 0 # revert all migrations
node migrate up --step 2 # run only two migrations

first time:
node migrate create --name my-migration.js --folder ./migrations # create a new folder & migration file

subsequent times:
node migrate create --name my-migration.ts  # create a new migration file OR npm run migrate:create:dev "file-name.ts"

//to pass argument in cmd
//npm run create-migration -- --name my-migration.ts


//to run up migration command for UP or DOWN action for particular file do the following : 
node migrate up --name "migration-file-name.ts"



//
node migrate up --name "2023.01.29T12.23.52.auth.ts"


--------------------------------Seeders-----------------------
# show help for each script
node migrate --help
node seed --help

node seed up # will fail, since tables haven't been created yet

node migrate up # creates tables
node seed up # inserts seed data

node seed down --to 0 # removes all seed data

node seed create --name more-seed-data.ts # create a placeholder migration file for inserting more seed data.






----continue from here

https://www.noon.com/uae-en/omen-gaming-laptop-with-16-1-inch-display-core-i5-13500hx-processor-32gb-ram-2tb-ssd-8gb-nvidia-geforce-rtx-4060-graphics-card-windows-11-english-black/N70064265V/p/?o=b444aed048e79a5e


https://www.noon.com/uae-en/galaxy-s24-ultra-dual-sim-titanium-black-12gb-ram-512gb-5g-middle-east-version/N70035269V/p/?o=abc203442556d71e


https://www.noon.com/uae-en/2-pack-logo-crew-neck-t-shirt/ZC2A72A4E6F29267F7B6AZ/p/?o=zc2a72a4e6f29267f7b6az-1



-------------------------------------------------------------------------------------------------------------------------

1) Product Table: it will show only the common properties for the product.
- id: id of the product
- title: only bases title will be in the product table, we will add attributes to make it dynamic further
- brand
- slug: it will be based on the title + variant values 
- CategoryId: category of the product
- overview
- highlights



2) Product Variant Table: it will have the type of the variant and relation with productid
- type:  // 'ssd' | 'ram' | 'color' | 'size' | 'base' this type will be taken from ProductVariantType table (so that everytime user does not change the type value like for example "ram" or "RAM" next time.
						      NOTE: here 'base' is not a variant but it is for the product which has no variant and it is general product without variant. This type will be set automatically if product has no variant so that we have atleast one entry for base product attributes/properties like price, quantity		
- ProductId: Product Relation with Product Variant Table

3) Product Variant Value Table:
- old price: can be null
- current price
- quantity
- sku
- value : "12GB" | "LARGE" | "RED" can be any value based on type of variant option, NOTE: this will be null if the type of variant is "base"
- ProductVariantId: relation with Product Variant table, this can be null of the variant type is base

4) ProductSpecifications table (to get general values specifications of the product)

   - key // it is the type column from the "Product Variant" Table
   - value // value will be added based on the values from the "Product Variant Values"
   - ProductId : relation with product table to get general specifications

5) ProductVariantAttribute pivot table (to get variant specifications)

   - ProductVariantId : relation with variant table to get the specific variant relation key/value pair of specifications NOTE: we can get the normal attributes separately, and then specific(variant) attributes separately based on the selected variant ids sent by FE.

   - ProductVariantValueId :relation with variant value table to get the specific variant value relation key/value pair of specifications NOTE: we can get the normal attributes separately, and then specific(variant) attributes separately based on the selected variant value ids sent by FE.



6) ProductImage table
   - imageUrl
   - imageAlt (optional)
   - ProductVariantId (if no variant or in other words if the variant type is base then we get images via ProductId)
   - ProductId

7) Product Reviews table (based on different variants) :
   - name
   - title
   - body
   - email
   - rating
   - ProductId
   - ProductVariantId	
   - ProductVariantValueId

8) ProductVariantType table (general table to add type of variants for all products) 
   - type (unique)





-----------------------------------------------------------------------------------------------------------
To handle quantities for product variants in addition to prices, you can extend the database design to include quantity fields in the relevant tables. Here is an updated schema:

Updated Database Schema
Products Table:

id (Primary Key)
name (e.g., "Mobile", "Shirt", "Monitor", "Shoes")
base_price (The base price for the product, which can be used as a reference point)
base_quantity (The base quantity for the product, used as a reference point)
ProductVariants Table:

id (Primary Key)
product_id (Foreign Key referencing Products Table)
variant_type (e.g., "Color", "Size", "Storage")
variant_value (e.g., "Yellow", "256GB", "Large")
price_adjustment (The price adjustment for this variant, can be positive or negative)
quantity_adjustment (The quantity adjustment for this variant, can be positive or negative)
ProductVariantCombinations Table (To store the specific combinations of variants and their final prices and quantities):

id (Primary Key)
product_id (Foreign Key referencing Products Table)
combination (JSON or a similar format to store the combination of variants)
final_price (The final price for this combination)
final_quantity (The final quantity for this combination)

- start from migration, seeding 
- then write code in controllers and test on postman.


// start by creating table productAttributeCombination table , put sku, quantity , price there
https://chatgpt.com/share/59ac2f99-ebdc-4ef8-afd0-a6875671f234



https://www.youtube.com/watch?v=WBGZbNnPa3w



----NEXT week (6-may-2024)
- start from the PRODUCT COMPBINATION TABLE (think about following) : 
  - cartisan products of variant values
  - controllers, routes,schema validation of this table