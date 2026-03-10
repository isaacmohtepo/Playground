import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../../common/prisma.service";
import { CreateCampaignDto } from "./dto";

@Injectable()
export class CampaignsService {
  constructor(private readonly prisma: PrismaService) {}

  list(clientId?: string) {
    return this.prisma.campaign.findMany({
      where: clientId ? { clientId } : undefined,
      include: {
        client: true,
        assets: true
      },
      orderBy: {
        createdAt: "desc"
      }
    });
  }

  async getById(id: string) {
    const campaign = await this.prisma.campaign.findUnique({
      where: { id },
      include: {
        client: true,
        assets: {
          include: {
            versions: true
          }
        }
      }
    });
    if (!campaign) {
      throw new NotFoundException("Campaña no encontrada");
    }
    return campaign;
  }

  create(dto: CreateCampaignDto) {
    return this.prisma.campaign.create({
      data: {
        ...dto,
        startDate: dto.startDate ? new Date(dto.startDate) : undefined
      }
    });
  }
}
