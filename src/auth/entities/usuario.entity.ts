import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum Rol {
  ADMIN = 'admin',
  ALMACEN = 'almacen',
  SOLICITADOR = 'solicitador',
  APROBADOR = 'aprobador',
  AUDITOR = 'auditor',
}
@Entity('usuarios')
export class Usuario {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('text')
  name: string;

  @Column('text', {
    unique: true,
  })
  username: string;

  @Column({ select: false })
  password: string;

  @Column({
    type: 'enum',
    enum: Rol,
    nullable: false,
  })
  rol: Rol;

  @Column({
    default: true,
  })
  state: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
