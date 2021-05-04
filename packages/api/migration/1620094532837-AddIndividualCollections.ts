import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddIndividualCollections1620094532837
  implements MigrationInterface {
  name = 'AddIndividualCollections1620094532837';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `
      insert into collection (name, user_id)
      select 'My Collection' as name, users.id as user_id
      from users
      where users.id not in (select user_id from collection)
      `,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {}
}
