import { InjectDataSource } from '@nestjs/typeorm';
import { Injectable } from '@nestjs/common';
import { DataSource, EntityManager } from 'typeorm';
import { txStorage } from '@infrastructure/database/transactions/transaction-context.storage';
import type { UnitOfWork } from '@application/contracts/unit-of-work.interface';

@Injectable()
export class TypeOrmUnitOfWork implements UnitOfWork {
  constructor(@InjectDataSource() private readonly dataSource: DataSource) {}

  public async execute<T>(work: () => Promise<T>): Promise<T> {
    return this.dataSource.transaction(async (manager: EntityManager) =>
      txStorage.run(manager, work),
    );
  }
}
