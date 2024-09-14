select * from public."Media"


SELECT
    con.constraint_name,
    con.constraint_type
FROM
    information_schema.table_constraints con
WHERE
    con.table_name = 'Media';

ALTER TABLE "Media"
DROP CONSTRAINT "Media_CategoryId_fkey",
ADD CONSTRAINT "Media_CategoryId_fkey"
FOREIGN KEY ("CategoryId") REFERENCES "Categories"("id")
ON DELETE CASCADE;

SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public';