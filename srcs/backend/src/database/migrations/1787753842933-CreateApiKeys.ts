import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateApiKeys1787753842933 implements MigrationInterface {
    name = 'CreateApiKeys1787753842933'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "api_keys" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "key" character varying NOT NULL, "label" character varying NOT NULL, "revoked" boolean NOT NULL DEFAULT false, "lastUsedAt" TIMESTAMP, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "ownerId" uuid, CONSTRAINT "UQ_api_keys_key" UNIQUE ("key"), CONSTRAINT "PK_api_keys_id" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "api_keys" ADD CONSTRAINT "FK_api_keys_owner" FOREIGN KEY ("ownerId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "api_keys" DROP CONSTRAINT "FK_api_keys_owner"`);
        await queryRunner.query(`DROP TABLE "api_keys"`);
    }
}
