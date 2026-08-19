import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableForeignKey,
  TableIndex,
} from 'typeorm';

export class CreateUsersAndVerificationTokens1786912047680 implements MigrationInterface {
  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'users',
        columns: [
          { name: 'id', type: 'uuid', isPrimary: true },
          { name: 'email', type: 'varchar', length: '255', isUnique: true },
          { name: 'username', type: 'varchar', length: '64', isUnique: true },
          { name: 'password_hash', type: 'varchar', length: '255' },
          { name: 'account_state', type: 'varchar', length: '32' },
          { name: 'email_verified_at', type: 'timestamptz', isNullable: true },
          { name: 'created_at', type: 'timestamptz' },
          { name: 'updated_at', type: 'timestamptz' },
        ],
      }),
      true,
    );

    await queryRunner.createTable(
      new Table({
        name: 'verification_tokens',
        columns: [
          { name: 'token', type: 'uuid', isPrimary: true },
          { name: 'user_id', type: 'uuid' },
          { name: 'expires_at', type: 'timestamptz' },
        ],
      }),
      true,
    );

    await queryRunner.createForeignKey(
      'verification_tokens',
      new TableForeignKey({
        columnNames: ['user_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'users',
        onDelete: 'CASCADE',
      }),
    );

    await queryRunner.createIndex(
      'verification_tokens',
      new TableIndex({
        name: 'IDX_VERIFICATION_TOKENS_USER_ID',
        columnNames: ['user_id'],
      }),
    );
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    const tokens = await queryRunner.getTable('verification_tokens');
    const fk = tokens?.foreignKeys.find((f) =>
      f.columnNames.includes('user_id'),
    );

    if (fk) {
      await queryRunner.dropForeignKey('verification_tokens', fk);
    }

    await queryRunner.dropIndex(
      'verification_tokens',
      'IDX_VERIFICATION_TOKENS_USER_ID',
    );
    await queryRunner.dropTable('verification_tokens');
    await queryRunner.dropTable('users');
  }
}
