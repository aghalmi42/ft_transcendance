import { MigrationInterface, QueryRunner } from "typeorm";

export class AddFriendRemovedNotificationType1788100000000 implements MigrationInterface {
    name = 'AddFriendRemovedNotificationType1788100000000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TYPE "public"."notifications_type_enum" ADD VALUE IF NOT EXISTS 'FRIEND_REMOVED'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
    }
}
