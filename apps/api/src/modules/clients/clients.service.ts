import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../../common/prisma.service";
import { CreateClientDto } from "./dto";

@Injectable()
export class ClientsService {
  constructor(private readonly prisma: PrismaService) {}

  list() {
    return this.prisma.client.findMany({
      include: {
        campaigns: true
      },
      orderBy: {
        createdAt: "desc"
      }
    });
  }

  async getById(id: string) {
    const client = await this.prisma.client.findUnique({
      where: { id },
      include: {
        campaigns: {
          include: {
            assets: true
          }
        }
      }
    });
    if (!client) {
      throw new NotFoundException("Cliente no encontrado");
    }
    return client;
  }

  create(dto: CreateClientDto) {
    return this.prisma.client.create({
      data: dto
    });
  }
}
