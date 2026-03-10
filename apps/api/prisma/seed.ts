import { PrismaClient, ApprovalState, AssetKind, CampaignState, CommentAuthorType, UserRole } from "@prisma/client";
import * as bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash("admin123", 10);

  const admin = await prisma.user.upsert({
    where: { email: "admin@creativeflow.com" },
    update: {},
    create: {
      name: "CreativeFlow Admin",
      email: "admin@creativeflow.com",
      passwordHash,
      role: UserRole.AGENCY_ADMIN
    }
  });

  const client = await prisma.client.create({
    data: {
      name: "Laura Gómez",
      company: "Andes Coffee",
      email: "marketing@andescoffee.co",
      logoUrl: "https://images.unsplash.com/photo-1517705008128-361805f42e86"
    }
  });

  const campaign = await prisma.campaign.create({
    data: {
      clientId: client.id,
      name: "Lanzamiento Cold Brew 2026",
      description: "Campaña omnicanal para lanzamiento de nuevo producto",
      startDate: new Date(),
      state: CampaignState.ACTIVE
    }
  });

  const asset = await prisma.creativeAsset.create({
    data: {
      campaignId: campaign.id,
      title: "Hero Banner Home",
      kind: AssetKind.IMAGE,
      currentState: ApprovalState.PENDING_REVIEW
    }
  });

  const version = await prisma.assetVersion.create({
    data: {
      assetId: asset.id,
      versionNum: 1,
      fileUrl: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085",
      state: ApprovalState.PENDING_REVIEW
    }
  });

  await prisma.comment.create({
    data: {
      versionId: version.id,
      authorType: CommentAuthorType.AGENCY_USER,
      authorUserId: admin.id,
      body: "Revisar contraste del CTA en esta zona.",
      x: 62.5,
      y: 48.2
    }
  });

  const reviewToken = "demo-review-token";
  await prisma.reviewLink.upsert({
    where: { token: reviewToken },
    update: { assetId: asset.id, isActive: true },
    create: {
      assetId: asset.id,
      token: reviewToken,
      isActive: true
    }
  });
}

main()
  .then(async () => prisma.$disconnect())
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
