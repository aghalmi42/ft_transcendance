import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateTournaments1787754029892 implements MigrationInterface {
    name = 'CreateTournaments1787754029892'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."tournaments_status_enum" AS ENUM('REGISTRATION', 'IN_PROGRESS', 'COMPLETED')`);
        await queryRunner.query(`CREATE TABLE "tournaments" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, "size" integer NOT NULL, "status" "public"."tournaments_status_enum" NOT NULL DEFAULT 'REGISTRATION', "championId" uuid, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "creatorId" uuid, CONSTRAINT "PK_tournaments_id" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "tournaments" ADD CONSTRAINT "FK_tournaments_creator" FOREIGN KEY ("creatorId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "tournaments" ADD CONSTRAINT "FK_tournaments_champion" FOREIGN KEY ("championId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);

        await queryRunner.query(`CREATE TABLE "tournament_participants" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "seed" integer NOT NULL, "eliminated" boolean NOT NULL DEFAULT false, "joinedAt" TIMESTAMP NOT NULL DEFAULT now(), "tournamentId" uuid, "userId" uuid, CONSTRAINT "UQ_tournament_participants_tournament_user" UNIQUE ("tournamentId", "userId"), CONSTRAINT "PK_tournament_participants_id" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "tournament_participants" ADD CONSTRAINT "FK_tournament_participants_tournament" FOREIGN KEY ("tournamentId") REFERENCES "tournaments"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "tournament_participants" ADD CONSTRAINT "FK_tournament_participants_user" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);

        await queryRunner.query(`CREATE TABLE "tournament_matches" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "round" integer NOT NULL, "matchNumber" integer NOT NULL, "player1Id" uuid, "player2Id" uuid, "score1" integer NOT NULL DEFAULT 0, "score2" integer NOT NULL DEFAULT 0, "winnerId" uuid, "isCompleted" boolean NOT NULL DEFAULT false, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "tournamentId" uuid, CONSTRAINT "PK_tournament_matches_id" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "tournament_matches" ADD CONSTRAINT "FK_tournament_matches_tournament" FOREIGN KEY ("tournamentId") REFERENCES "tournaments"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "tournament_matches" ADD CONSTRAINT "FK_tournament_matches_player1" FOREIGN KEY ("player1Id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "tournament_matches" ADD CONSTRAINT "FK_tournament_matches_player2" FOREIGN KEY ("player2Id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "tournament_matches" ADD CONSTRAINT "FK_tournament_matches_winner" FOREIGN KEY ("winnerId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "tournament_matches" DROP CONSTRAINT "FK_tournament_matches_winner"`);
        await queryRunner.query(`ALTER TABLE "tournament_matches" DROP CONSTRAINT "FK_tournament_matches_player2"`);
        await queryRunner.query(`ALTER TABLE "tournament_matches" DROP CONSTRAINT "FK_tournament_matches_player1"`);
        await queryRunner.query(`ALTER TABLE "tournament_matches" DROP CONSTRAINT "FK_tournament_matches_tournament"`);
        await queryRunner.query(`DROP TABLE "tournament_matches"`);

        await queryRunner.query(`ALTER TABLE "tournament_participants" DROP CONSTRAINT "FK_tournament_participants_user"`);
        await queryRunner.query(`ALTER TABLE "tournament_participants" DROP CONSTRAINT "FK_tournament_participants_tournament"`);
        await queryRunner.query(`DROP TABLE "tournament_participants"`);

        await queryRunner.query(`ALTER TABLE "tournaments" DROP CONSTRAINT "FK_tournaments_champion"`);
        await queryRunner.query(`ALTER TABLE "tournaments" DROP CONSTRAINT "FK_tournaments_creator"`);
        await queryRunner.query(`DROP TABLE "tournaments"`);
        await queryRunner.query(`DROP TYPE "public"."tournaments_status_enum"`);
    }
}
