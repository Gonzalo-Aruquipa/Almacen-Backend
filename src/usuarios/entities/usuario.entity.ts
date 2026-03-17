import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Usuario {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('text')
  name: string;

  @Column('text')
  username: string;

  @Column('text')
  password: string;
}
