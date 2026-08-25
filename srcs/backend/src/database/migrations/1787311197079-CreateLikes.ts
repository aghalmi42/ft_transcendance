import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateLikes1787311197079 implements MigrationInterface {
    name = 'CreateLikes1787311197079'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "comment_likes" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "userId" uuid, "commentId" uuid, CONSTRAINT "UQ_ec6698ead14ad945033ebb2f1b9" UNIQUE ("userId", "commentId"), CONSTRAINT "PK_2c299aaf1f903c45ee7e6c7b419" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "post_likes" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "userId" uuid, "postId" uuid, CONSTRAINT "UQ_30ee85070afe5b92b5920957b1c" UNIQUE ("userId", "postId"), CONSTRAINT "PK_e4ac7cb9daf243939c6eabb2e0d" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "comment_likes" ADD CONSTRAINT "FK_34d1f902a8a527dbc2502f87c88" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "comment_likes" ADD CONSTRAINT "FK_abbd506a94a424dd6a3a68d26f4" FOREIGN KEY ("commentId") REFERENCES "comments"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "post_likes" ADD CONSTRAINT "FK_37d337ad54b1aa6b9a44415a498" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "post_likes" ADD CONSTRAINT "FK_6999d13aca25e33515210abaf16" FOREIGN KEY ("postId") REFERENCES "posts"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "post_likes" DROP CONSTRAINT "FK_6999d13aca25e33515210abaf16"`);
        await queryRunner.query(`ALTER TABLE "post_likes" DROP CONSTRAINT "FK_37d337ad54b1aa6b9a44415a498"`);
        await queryRunner.query(`ALTER TABLE "comment_likes" DROP CONSTRAINT "FK_abbd506a94a424dd6a3a68d26f4"`);
        await queryRunner.query(`ALTER TABLE "comment_likes" DROP CONSTRAINT "FK_34d1f902a8a527dbc2502f87c88"`);
        await queryRunner.query(`DROP TABLE "post_likes"`);
        await queryRunner.query(`DROP TABLE "comment_likes"`);
    }

}
