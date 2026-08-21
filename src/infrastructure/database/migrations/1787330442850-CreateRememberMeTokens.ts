import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableForeignKey,
  TableIndex,
} from 'typeorm';

export class CreateRememberMeTokens1787330442850 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'remember_me_tokens',
        columns: [
          {
            name: 'token_hash',
            type: 'varchar',
            length: '64',
            isPrimary: true,
          },
          { name: 'user_id', type: 'uuid' },
          { name: 'expires_at', type: 'timestamptz' },
        ],
      }),
      true,
    );

    await queryRunner.createForeignKey(
      'remember_me_tokens',
      new TableForeignKey({
        columnNames: ['user_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'users',
        onDelete: 'CASCADE',
      }),
    );

    await queryRunner.createIndex(
      'remember_me_tokens',
      new TableIndex({
        name: 'IDX_REMEMBER_ME_TOKENS_USER_ID',
        columnNames: ['user_id'],
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const tokens = await queryRunner.getTable('remember_me_tokens');
    const fk = tokens?.foreignKeys.find((f) =>
      f.columnNames.includes('user_id'),
    );

    if (fk) {
      await queryRunner.dropForeignKey('remember_me_tokens', fk);
    }

    await queryRunner.dropIndex(
      'remember_me_tokens',
      'IDX_REMEMBER_ME_TOKENS_USER_ID',
    );
    await queryRunner.dropTable('remember_me_tokens');
  }
}
