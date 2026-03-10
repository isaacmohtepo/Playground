import { Injectable, Logger } from "@nestjs/common";
import { NotificationType } from "@prisma/client";
import { PrismaService } from "../../common/prisma.service";

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(private readonly prisma: PrismaService) {}

  async enqueue(type: NotificationType, recipient: string, payload: Record<string, unknown>) {
    const event = await this.prisma.notificationEvent.create({
      data: {
        type,
        recipient,
        payload
      }
    });

    this.logger.log(`Email pendiente [${type}] para ${recipient} (${event.id})`);
    return event;
  }
}
