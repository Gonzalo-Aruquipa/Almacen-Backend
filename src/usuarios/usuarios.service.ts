import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateUsuarioDto } from './dto/create-usuario.dto';
import { UpdateUsuarioDto } from './dto/update-usuario.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Usuario } from './entities/usuario.entity';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsuariosService {
  constructor(
    @InjectRepository(Usuario)
    private readonly usuarioRepository: Repository<Usuario>,
  ) {}

  async create(createUsuarioDto: CreateUsuarioDto): Promise<Usuario> {
    const { password, ...rest } = createUsuarioDto;

    const exists = await this.usuarioRepository.findOne({
      where: { username: rest.username },
    });

    if (exists) {
      throw new ConflictException('El usuario ya está en uso');
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const usuario = this.usuarioRepository.create({
      ...rest,
      password: hashedPassword,
    });

    return await this.usuarioRepository.save(usuario);
  }

  async findAll(): Promise<Usuario[]> {
    return await this.usuarioRepository.find({
      order: { id: 'ASC' },
    });
  }

  async findOne(id: number): Promise<Usuario> {
    const usuario = await this.usuarioRepository.findOne({
      where: { id: id },
    });

    if (!usuario) {
      throw new NotFoundException(`Usuario con ID ${id} no encontrado`);
    }

    return usuario;
  }

  update(id: number, updateUsuarioDto: UpdateUsuarioDto) {
    return `This action updates a #${id} usuario`;
  }

  async remove(id: number): Promise<Usuario> {
    const usuario = await this.usuarioRepository.findOne({ where: { id: id } });
    if (!usuario) {
      throw new NotFoundException(`Usuario con ID ${id} no existe`);
    }
    return await this.usuarioRepository.remove(usuario);
  }
}
