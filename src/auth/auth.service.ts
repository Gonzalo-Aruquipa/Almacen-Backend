import {
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { CreateUsuarioDto } from './dto/create-usuario.dto';
import { UpdateUsuarioDto } from './dto/update-usuario.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Usuario } from './entities/usuario.entity';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { PaginationDto } from 'src/common/dtos/pagination.dto';
import { LoginUsuarioDto } from './dto/login-usuario.dto';

@Injectable()
export class UsuariosService {
  constructor(
    @InjectRepository(Usuario)
    private readonly usuarioRepository: Repository<Usuario>,
  ) {}

  async login(LoginUsuarioDto: LoginUsuarioDto) {
    const { username, password } = LoginUsuarioDto;

    // Buscar usuario
    const usuario = await this.usuarioRepository.findOne({
      where: { username },
      select: ['id', 'username', 'password', 'rol', 'state'],
    });

    if (!usuario) {
      throw new UnauthorizedException('Usuario incorrecto');
    }

    const passwordValido = await bcrypt.compare(password, usuario.password);
    console.log(passwordValido);
    if (!passwordValido) {
      throw new UnauthorizedException('Contraseña Incorrecta');
    }

    // // Verificar estado
    // if (usuario.state == false) {
    //   throw new UnauthorizedException('Usuario inactivo');
    // }

    // Generar JWT
    // const payload = {
    //   sub: usuario.id,
    //   username: usuario.username,
    //   rol: usuario.rol,
    // };

    // return {
    //   // access_token: this.jwtService.sign(payload),
    //   usuario: {
    //     id: usuario.id,
    //     name: usuario.name,
    //     username: usuario.username,
    //     rol: usuario.rol,
    //   },
    // };
    return usuario;
  }

  async create(createUsuarioDto: CreateUsuarioDto): Promise<Usuario> {
    const { password, ...rest } = createUsuarioDto;

    const exists = await this.usuarioRepository.findOne({
      where: { username: rest.username },
    });

    if (exists) {
      throw new ConflictException('El usuario ya existe');
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const usuario = this.usuarioRepository.create({
      ...rest,
      password: hashedPassword,
    });

    return await this.usuarioRepository.save(usuario);
  }

  async findAll(PaginationDto: PaginationDto): Promise<Usuario[]> {
    const { limit = 10, offset = 0 } = PaginationDto;
    return await this.usuarioRepository.find({
      take: limit,
      skip: offset,
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

  async update(
    id: number,
    updateUsuarioDto: UpdateUsuarioDto,
  ): Promise<Usuario> {
    const usuario = await this.usuarioRepository.findOne({
      where: { id: id },
    });

    if (!usuario) {
      throw new NotFoundException(`Usuario con id ${id} no encontrado`);
    }

    // Si viene password nueva, la hasheamos
    if (updateUsuarioDto.password) {
      updateUsuarioDto.password = await bcrypt.hash(
        updateUsuarioDto.password,
        10,
      );
    }

    Object.assign(usuario, updateUsuarioDto);
    return this.usuarioRepository.save(usuario);
  }

  async remove(id: number): Promise<Usuario> {
    const usuario = await this.usuarioRepository.findOne({ where: { id: id } });
    if (!usuario) {
      throw new NotFoundException(`Usuario con ID ${id} no existe`);
    }
    return await this.usuarioRepository.remove(usuario);
  }
}
