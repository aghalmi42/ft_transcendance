import { MigrationInterface, QueryRunner } from "typeorm";

export class AddTournamentNotificationTypes1787754372455 implements MigrationInterface {
    name = 'AddTournamentNotificationTypes1787754372455'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TYPE "public"."notifications_type_enum" ADD VALUE IF NOT EXISTS 'TOURNAMENT_MATCH_READY'`);
        await queryRunner.query(`ALTER TYPE "public"."notifications_type_enum" ADD VALUE IF NOT EXISTS 'TOURNAMENT_ELIMINATED'`);
        await queryRunner.query(`ALTER TYPE "public"."notifications_type_enum" ADD VALUE IF NOT EXISTS 'TOURNAMENT_WON'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
    }
}
