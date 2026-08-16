import { InjectDataSource } from '@nestjs/typeorm';
import { Injectable } from '@nestjs/common';
import { DataSource, EntityManager } from 'typeorm';
import type {
  TransactionContext,
  UnitOfWork,
} from '@application/common/contracts/unit-of-work.port';

@Injectable()
export class TypeOrmUnitOfWork implements UnitOfWork {
  constructor(@InjectDataSource() private readonly dataSource: DataSource) {}

  public async execute<T>(
    work: (tx: TransactionContext) => Promise<T>,
  ): Promise<T> {
    return this.dataSource.transaction(async (manager: EntityManager) =>
      work(manager as unknown as TransactionContext),
    );
  }
}
