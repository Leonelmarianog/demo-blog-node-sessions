import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity('remember_me_tokens')
export class RememberMeTokenEntity {
  @PrimaryColumn({ type: 'varchar', length: 64 })
  tokenHash: string;

  @Column({ name: 'user_id', type: 'uuid' })
  userId: string;

  @Column({ name: 'expires_at', type: 'timestamptz' })
  expiresAt: Date;
}
