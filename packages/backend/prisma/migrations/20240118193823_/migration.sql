-- CreateTable
CREATE TABLE "simple_example" (
    "id" UUID NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "date" TIMESTAMP NOT NULL,
    "comment" TEXT,
    "is_a_bool" BOOLEAN NOT NULL,

    CONSTRAINT "simple_example_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "simple_example_id_key" ON "simple_example"("id");
