import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity('verification_tokens')
export class VerificationTokenEntity {
  @PrimaryColumn({ type: 'uuid' })
  token: string;

  @Column({ name: 'user_id', type: 'uuid' })
  userId: string;

  @Column({ name: 'expires_at', type: 'timestamptz' })
  expiresAt: Date;
}
