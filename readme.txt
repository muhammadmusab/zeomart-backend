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



--------------------------------Seeders-----------------------
# show help for each script
node migrate --help
node seed --help

node seed up # will fail, since tables haven't been created yet

node migrate up # creates tables
node seed up # inserts seed data

node seed down --to 0 # removes all seed data

node seed create --name more-seed-data.ts # create a placeholder migration file for inserting more seed data.




// DISCUSS about assign variants with Shumas ( because of media )