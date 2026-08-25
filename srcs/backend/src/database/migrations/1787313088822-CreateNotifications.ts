import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateNotifications1787313088822 implements MigrationInterface {
    name = 'CreateNotifications1787313088822'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."notifications_type_enum" AS ENUM('POST_LIKED', 'POST_COMMENTED', 'COMMENT_LIKED', 'FRIEND_REQUEST', 'FRIEND_ACCEPTED', 'MESSAGE')`);
        await queryRunner.query(`CREATE TABLE "notifications" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "type" "public"."notifications_type_enum" NOT NULL, "entityId" uuid, "read" boolean NOT NULL DEFAULT false, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "recipientId" uuid, "actorId" uuid, CONSTRAINT "PK_6a72c3c0f683f6462415e653c3a" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_db873ba9a123711a4bff527ccd" ON "notifications" ("recipientId") `);
        await queryRunner.query(`ALTER TABLE "notifications" ADD CONSTRAINT "FK_db873ba9a123711a4bff527ccd5" FOREIGN KEY ("recipientId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "notifications" ADD CONSTRAINT "FK_44412a2d6f162ff4dc1697d0db7" FOREIGN KEY ("actorId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "notifications" DROP CONSTRAINT "FK_44412a2d6f162ff4dc1697d0db7"`);
        await queryRunner.query(`ALTER TABLE "notifications" DROP CONSTRAINT "FK_db873ba9a123711a4bff527ccd5"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_db873ba9a123711a4bff527ccd"`);
        await queryRunner.query(`DROP TABLE "notifications"`);
        await queryRunner.query(`DROP TYPE "public"."notifications_type_enum"`);
    }

}
