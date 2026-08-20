import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableForeignKey,
  TableIndex,
} from 'typeorm';

export class CreatePasswordResetTokens1787255315309 implements MigrationInterface {
  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'password_reset_tokens',
        columns: [
          { name: 'token', type: 'uuid', isPrimary: true },
          { name: 'user_id', type: 'uuid' },
          { name: 'expires_at', type: 'timestamptz' },
        ],
      }),
      true,
    );

    await queryRunner.createForeignKey(
      'password_reset_tokens',
      new TableForeignKey({
        columnNames: ['user_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'users',
        onDelete: 'CASCADE',
      }),
    );

    await queryRunner.createIndex(
      'password_reset_tokens',
      new TableIndex({
        name: 'IDX_PASSWORD_RESET_TOKENS_USER_ID',
        columnNames: ['user_id'],
      }),
    );
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    const tokens = await queryRunner.getTable('password_reset_tokens');
    const fk = tokens?.foreignKeys.find((f) =>
      f.columnNames.includes('user_id'),
    );

    if (fk) {
      await queryRunner.dropForeignKey('password_reset_tokens', fk);
    }

    await queryRunner.dropIndex(
      'password_reset_tokens',
      'IDX_PASSWORD_RESET_TOKENS_USER_ID',
    );
    await queryRunner.dropTable('password_reset_tokens');
  }
}
