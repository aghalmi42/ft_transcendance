import { MigrationInterface, QueryRunner } from "typeorm";

export class Friendship1786120688122 implements MigrationInterface {
    name = 'Friendship1786120688122'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."friendships_status_enum" AS ENUM('PENDING', 'ACCEPTED', 'BLOCKED')`);
        await queryRunner.query(`CREATE TABLE "friendships" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "status" "public"."friendships_status_enum" NOT NULL DEFAULT 'PENDING', "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "senderId" uuid, "receiverId" uuid, CONSTRAINT "UQ_d835391f2aa7c31bcc5f86d72ec" UNIQUE ("senderId", "receiverId"), CONSTRAINT "PK_08af97d0be72942681757f07bc8" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "friendships" ADD CONSTRAINT "FK_02ebdc40b6af5b1621300a3bf38" FOREIGN KEY ("senderId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "friendships" ADD CONSTRAINT "FK_76977c4ed1415e3b1cdf7848a8c" FOREIGN KEY ("receiverId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "friendships" DROP CONSTRAINT "FK_76977c4ed1415e3b1cdf7848a8c"`);
        await queryRunner.query(`ALTER TABLE "friendships" DROP CONSTRAINT "FK_02ebdc40b6af5b1621300a3bf38"`);
        await queryRunner.query(`DROP TABLE "friendships"`);
        await queryRunner.query(`DROP TYPE "public"."friendships_status_enum"`);
    }

}
