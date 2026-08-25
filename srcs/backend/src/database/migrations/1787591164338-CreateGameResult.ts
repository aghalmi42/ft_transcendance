import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateGameResult1787591164338 implements MigrationInterface {
    name = 'CreateGameResult1787591164338'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."game_results_result_enum" AS ENUM('win', 'draw')`);
        await queryRunner.query(`CREATE TABLE "game_results" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "playerXId" uuid NOT NULL, "playerOId" uuid NOT NULL, "winnerId" uuid, "result" "public"."game_results_result_enum" NOT NULL, CONSTRAINT "PK_d45049161e874555e7cfe325afe" PRIMARY KEY ("id"))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "game_results"`);
        await queryRunner.query(`DROP TYPE "public"."game_results_result_enum"`);
    }

}
