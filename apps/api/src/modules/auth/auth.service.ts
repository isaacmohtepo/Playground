import { ConflictException, Injectable, OnModuleInit, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import * as bcrypt from "bcryptjs";
import { PrismaService } from "../../common/prisma.service";
import { LoginDto, RegisterDto } from "./dto";
import { UserRole } from "@prisma/client";

@Injectable()
export class AuthService implements OnModuleInit {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService
  ) {}

  async onModuleInit() {
    await this.ensureDefaultAdmin();
  }

  async register(dto: RegisterDto) {
    const exists = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (exists) {
      throw new ConflictException("El email ya está registrado");
    }

    const passwordHash = await bcrypt.hash(dto.password, 10);
    const user = await this.prisma.user.create({
      data: {
        name: dto.name,
        email: dto.email,
        passwordHash,
        role: UserRole.AGENCY_MEMBER
      }
    });
    return this.signToken(user.id, user.email, user.name);
  }

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (!user) {
      throw new UnauthorizedException("Credenciales inválidas");
    }
    const ok = await bcrypt.compare(dto.password, user.passwordHash);
    if (!ok) {
      throw new UnauthorizedException("Credenciales inválidas");
    }
    return this.signToken(user.id, user.email, user.name);
  }

  private signToken(userId: string, email: string, name: string) {
    const accessToken = this.jwtService.sign({ sub: userId, email });
    return {
      accessToken,
      user: {
        id: userId,
        email,
        name
      }
    };
  }

  private async ensureDefaultAdmin() {
    const email = process.env.DEFAULT_ADMIN_EMAIL ?? "admin@creativeflow.com";
    const password = process.env.DEFAULT_ADMIN_PASSWORD ?? "admin123";
    const name = process.env.DEFAULT_ADMIN_NAME ?? "CreativeFlow Admin";

    const exists = await this.prisma.user.findUnique({ where: { email } });
    if (exists) {
      return;
    }

    const passwordHash = await bcrypt.hash(password, 10);
    await this.prisma.user.create({
      data: {
        name,
        email,
        passwordHash,
        role: UserRole.AGENCY_ADMIN
      }
    });
  }
}
