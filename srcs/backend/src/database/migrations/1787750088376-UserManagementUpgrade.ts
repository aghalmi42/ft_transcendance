import { MigrationInterface, QueryRunner } from "typeorm";

export class UserManagementUpgrade1787750088376 implements MigrationInterface {
    name = 'UserManagementUpgrade1787750088376'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TYPE "public"."users_status_enum" ADD VALUE IF NOT EXISTS 'away'`);

        await queryRunner.query(`CREATE TYPE "public"."users_role_enum" AS ENUM('admin', 'moderator', 'user', 'guest')`);
        await queryRunner.query(`ALTER TABLE "users" ADD "role" "public"."users_role_enum" NOT NULL DEFAULT 'user'`);

        await queryRunner.query(`ALTER TABLE "users" ADD "wins" integer NOT NULL DEFAULT 0`);
        await queryRunner.query(`ALTER TABLE "users" ADD "losses" integer NOT NULL DEFAULT 0`);
        await queryRunner.query(`ALTER TABLE "users" ADD "draws" integer NOT NULL DEFAULT 0`);
        await queryRunner.query(`ALTER TABLE "users" ADD "level" integer NOT NULL DEFAULT 1`);
        await queryRunner.query(`ALTER TABLE "users" ADD "xp" integer NOT NULL DEFAULT 0`);
        await queryRunner.query(`ALTER TABLE "users" ADD "eloRating" integer NOT NULL DEFAULT 1000`);

        await queryRunner.query(`ALTER TABLE "users" ADD "oauthProvider" character varying`);
        await queryRunner.query(`ALTER TABLE "users" ADD "oauthId" character varying`);
        await queryRunner.query(`ALTER TABLE "users" ADD CONSTRAINT "UQ_users_oauth_provider_id" UNIQUE ("oauthProvider", "oauthId")`);
        await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "passwordHash" DROP NOT NULL`);

        await queryRunner.query(`ALTER TABLE "game_results" ADD "createdAt" TIMESTAMP NOT NULL DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "game_results" ADD CONSTRAINT "FK_game_results_playerX" FOREIGN KEY ("playerXId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "game_results" ADD CONSTRAINT "FK_game_results_playerO" FOREIGN KEY ("playerOId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "game_results" ADD CONSTRAINT "FK_game_results_winner" FOREIGN KEY ("winnerId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "game_results" DROP CONSTRAINT "FK_game_results_winner"`);
        await queryRunner.query(`ALTER TABLE "game_results" DROP CONSTRAINT "FK_game_results_playerO"`);
        await queryRunner.query(`ALTER TABLE "game_results" DROP CONSTRAINT "FK_game_results_playerX"`);
        await queryRunner.query(`ALTER TABLE "game_results" DROP COLUMN "createdAt"`);

        await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "passwordHash" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "users" DROP CONSTRAINT "UQ_users_oauth_provider_id"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "oauthId"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "oauthProvider"`);

        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "eloRating"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "xp"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "level"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "draws"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "losses"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "wins"`);

        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "role"`);
        await queryRunner.query(`DROP TYPE "public"."users_role_enum"`);
    }
}
