import { PrismaClient } from "../src/generated/prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  // Admin user
  const hashedPassword = await bcrypt.hash("admin123", 12);
  const admin = await prisma.user.upsert({
    where: { email: "admin@example.com" },
    update: {},
    create: {
      name: "管理者",
      email: "admin@example.com",
      hashedPassword,
      role: "ADMIN",
    },
  });

  // Staff user
  const staffPassword = await bcrypt.hash("staff123", 12);
  const staff = await prisma.user.upsert({
    where: { email: "staff@example.com" },
    update: {},
    create: {
      name: "スタッフ田中",
      email: "staff@example.com",
      hashedPassword: staffPassword,
      role: "STAFF",
    },
  });

  // Artists
  const artists = await Promise.all([
    prisma.artist.upsert({
      where: { id: "artist-1" },
      update: {},
      create: {
        id: "artist-1",
        name: "山田太郎",
        email: "yamada@example.com",
        phone: "090-1234-5678",
        equipment: "マイク持参",
        bankInfo: "みずほ銀行 渋谷支店 普通 1234567",
      },
    }),
    prisma.artist.upsert({
      where: { id: "artist-2" },
      update: {},
      create: {
        id: "artist-2",
        name: "佐藤花子",
        email: "sato@example.com",
        phone: "090-9876-5432",
        equipment: "ギター、エフェクター",
        bankInfo: "三菱UFJ銀行 新宿支店 普通 7654321",
      },
    }),
    prisma.artist.upsert({
      where: { id: "artist-3" },
      update: {},
      create: {
        id: "artist-3",
        name: "鈴木一郎",
        email: "suzuki@example.com",
        phone: "080-1111-2222",
        equipment: "DJ機材一式",
      },
    }),
    prisma.artist.upsert({
      where: { id: "artist-4" },
      update: {},
      create: {
        id: "artist-4",
        name: "高橋めぐみ",
        email: "takahashi@example.com",
        phone: "070-3333-4444",
      },
    }),
  ]);

  // Projects
  const project1 = await prisma.project.upsert({
    where: { id: "project-1" },
    update: {},
    create: {
      id: "project-1",
      name: "Summer Music Festival 2026",
      description: "夏の野外音楽フェスティバル。3ステージ、20組以上が出演予定。",
      eventDate: new Date("2026-08-15"),
      venueName: "代々木公園野外ステージ",
      venueAddress: "東京都渋谷区代々木神園町",
      status: "ACTIVE",
    },
  });

  const project2 = await prisma.project.upsert({
    where: { id: "project-2" },
    update: {},
    create: {
      id: "project-2",
      name: "Spring Jazz Night",
      description: "ジャズライブイベント。ディナー付き。",
      eventDate: new Date("2026-04-20"),
      venueName: "Blue Note Tokyo",
      venueAddress: "東京都港区南青山6-3-16",
      status: "ACTIVE",
    },
  });

  // Project Artists
  const pa1 = await prisma.projectArtist.upsert({
    where: { projectId_artistId: { projectId: project1.id, artistId: artists[0].id } },
    update: {},
    create: {
      projectId: project1.id,
      artistId: artists[0].id,
      artistStatus: "CONFIRMED",
      paymentStatus: "UNPAID",
      guaranteeAmount: 150000,
      settlementMethod: "BANK_TRANSFER",
    },
  });

  const pa2 = await prisma.projectArtist.upsert({
    where: { projectId_artistId: { projectId: project1.id, artistId: artists[1].id } },
    update: {},
    create: {
      projectId: project1.id,
      artistId: artists[1].id,
      artistStatus: "AWAITING_REPLY",
      paymentStatus: "UNPAID",
      guaranteeAmount: 100000,
      settlementMethod: "BANK_TRANSFER",
    },
  });

  await prisma.projectArtist.upsert({
    where: { projectId_artistId: { projectId: project1.id, artistId: artists[2].id } },
    update: {},
    create: {
      projectId: project1.id,
      artistId: artists[2].id,
      artistStatus: "CANDIDATE",
      paymentStatus: "UNPAID",
    },
  });

  await prisma.projectArtist.upsert({
    where: { projectId_artistId: { projectId: project2.id, artistId: artists[3].id } },
    update: {},
    create: {
      projectId: project2.id,
      artistId: artists[3].id,
      artistStatus: "CONFIRMED",
      paymentStatus: "INVOICED",
      guaranteeAmount: 80000,
      settlementMethod: "BANK_TRANSFER",
    },
  });

  // Status histories
  await prisma.statusHistory.createMany({
    data: [
      {
        projectArtistId: pa1.id,
        changedById: admin.id,
        fieldName: "artistStatus",
        oldValue: "CANDIDATE",
        newValue: "OFFER_SENT",
        comment: "オファーメール送信",
      },
      {
        projectArtistId: pa1.id,
        changedById: admin.id,
        fieldName: "artistStatus",
        oldValue: "OFFER_SENT",
        newValue: "CONFIRMED",
        comment: "出演確定の返信あり",
      },
    ],
    skipDuplicates: true,
  });

  // Tasks
  await prisma.task.createMany({
    data: [
      {
        projectId: project1.id,
        title: "ステージ機材手配",
        priority: "HIGH",
        status: "IN_PROGRESS",
        dueDate: new Date("2026-07-30"),
        assigneeId: staff.id,
      },
      {
        projectId: project1.id,
        title: "出演者控室の確保",
        priority: "MEDIUM",
        status: "TODO",
        dueDate: new Date("2026-08-01"),
        assigneeId: staff.id,
      },
      {
        projectId: project1.id,
        projectArtistId: pa2.id,
        title: "佐藤花子さんへのオファー返信フォロー",
        priority: "URGENT",
        status: "TODO",
        dueDate: new Date("2026-03-15"),
        assigneeId: admin.id,
      },
      {
        projectId: project2.id,
        title: "フライヤー制作",
        priority: "MEDIUM",
        status: "TODO",
        dueDate: new Date("2026-03-20"),
      },
    ],
    skipDuplicates: true,
  });

  // Timetable entries
  await prisma.timetableEntry.createMany({
    data: [
      {
        projectId: project1.id,
        artistName: "山田太郎",
        startTime: new Date("2026-08-15T14:00:00"),
        performanceMinutes: 45,
        changeoverMinutes: 15,
        sortOrder: 1,
      },
      {
        projectId: project1.id,
        artistName: "佐藤花子",
        startTime: new Date("2026-08-15T15:00:00"),
        performanceMinutes: 60,
        changeoverMinutes: 20,
        sortOrder: 2,
      },
    ],
    skipDuplicates: true,
  });

  // Budget items
  await prisma.budgetItem.createMany({
    data: [
      {
        projectId: project1.id,
        type: "INCOME",
        category: "チケット売上",
        description: "前売り2000枚 × ¥5,000",
        amount: 10000000,
        isEstimate: true,
      },
      {
        projectId: project1.id,
        type: "INCOME",
        category: "スポンサー",
        description: "メインスポンサー協賛金",
        amount: 3000000,
        isEstimate: false,
      },
      {
        projectId: project1.id,
        type: "EXPENSE",
        category: "会場費",
        description: "代々木公園使用料",
        amount: 2000000,
        isEstimate: false,
      },
      {
        projectId: project1.id,
        type: "EXPENSE",
        category: "機材レンタル",
        description: "音響・照明機材一式",
        amount: 1500000,
        isEstimate: true,
      },
    ],
    skipDuplicates: true,
  });

  // Email templates
  await prisma.emailTemplate.createMany({
    data: [
      {
        name: "出演オファー（基本）",
        type: "OFFER",
        subject: "【出演依頼】{{project_name}}へのご出演のお願い",
        body: `{{artist_name}} 様

お世話になっております。
この度、{{event_date}}に開催予定の「{{project_name}}」につきまして、
{{artist_name}}様にご出演いただきたくご連絡差し上げました。

会場: {{venue_name}}
日時: {{event_date}}
集合時間: {{call_time}}

ご検討のほど、よろしくお願いいたします。`,
        createdById: admin.id,
      },
      {
        name: "出演確定のご連絡",
        type: "CONFIRMED",
        subject: "【出演確定】{{project_name}} 出演のご確認",
        body: `{{artist_name}} 様

お世話になっております。
「{{project_name}}」へのご出演が確定いたしましたのでご連絡いたします。

会場: {{venue_name}}
日時: {{event_date}}
集合時間: {{call_time}}

当日はよろしくお願いいたします。`,
        createdById: admin.id,
      },
    ],
    skipDuplicates: true,
  });

  console.log("Seed data created successfully!");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
