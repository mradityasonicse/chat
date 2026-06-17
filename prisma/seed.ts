import { PrismaClient } from '@prisma/client';
import { hashPassword } from '../src/lib/password';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  try {
    // Create test users
    const user1 = await prisma.user.upsert({
      where: { email: 'alice@example.com' },
      update: {},
      create: {
        email: 'alice@example.com',
        passwordHash: await hashPassword('password123'),
        role: 'user',
        isActive: true,
        profile: {
          create: {
            displayName: 'Alice',
            username: 'alice_demo',
            bio: 'Welcome to Chat With You!'
          }
        },
        settings: {
          create: {}
        }
      }
    });

    const user2 = await prisma.user.upsert({
      where: { email: 'bob@example.com' },
      update: {},
      create: {
        email: 'bob@example.com',
        passwordHash: await hashPassword('password123'),
        role: 'user',
        isActive: true,
        profile: {
          create: {
            displayName: 'Bob',
            username: 'bob_demo',
            bio: 'Testing the app'
          }
        },
        settings: {
          create: {}
        }
      }
    });

    console.log(`✅ Created test users:`);
    console.log(`   - ${user1.email} (password: password123)`);
    console.log(`   - ${user2.email} (password: password123)`);

    // Create a conversation between them
    const conversation = await prisma.conversation.create({
      data: {
        creatorId: user1.id,
        participants: {
          createMany: {
            data: [
              { userId: user1.id },
              { userId: user2.id }
            ]
          }
        }
      }
    });

    console.log(`✅ Created test conversation`);

    // Create sample messages
    const message1 = await prisma.message.create({
      data: {
        conversationId: conversation.id,
        senderId: user1.id,
        content: 'Hey Bob! Welcome to Chat With You 👋',
        status: 'read',
        sentAt: new Date(Date.now() - 5 * 60000), // 5 mins ago
        deliveredAt: new Date(Date.now() - 4 * 60000),
        readAt: new Date(Date.now() - 3 * 60000)
      }
    });

    const message2 = await prisma.message.create({
      data: {
        conversationId: conversation.id,
        senderId: user2.id,
        content: 'Thanks Alice! This looks amazing!',
        status: 'read',
        sentAt: new Date(Date.now() - 4 * 60000),
        deliveredAt: new Date(Date.now() - 2 * 60000),
        readAt: new Date(Date.now() - 1 * 60000)
      }
    });

    console.log(`✅ Created sample messages`);

    console.log(`
🎉 Database seeded successfully!

Test Credentials:
  Email: alice@example.com
  Password: password123
  
  Email: bob@example.com
  Password: password123

You can now log in and test the chat between these two accounts!
    `);

  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
