import { config } from 'dotenv'
import { PrismaClient } from '@prisma/client'

// Load environment variables from .env.local
config({ path: '.env.local' })

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting database seed...')

  // Create a demo company (just create, don't upsert)
  const company = await prisma.company.create({
    data: {
      name: 'Demo Landscaping Co',
      email: 'demo@routeretain.com',
      phone: '(555) 123-4567'
    }
  })

  console.log('✅ Created company:', company.name)

  // Create a demo user
  const user = await prisma.user.create({
    data: {
      email: 'admin@demo.com',
      firstName: 'John',
      lastName: 'Admin',
      role: 'owner',
      companyId: company.id
    }
  })

  console.log('✅ Created user:', user.firstName, user.lastName)

  // Create demo customers
  const customer1 = await prisma.customer.create({
    data: {
      firstName: 'Sarah',
      lastName: 'Johnson',
      email: 'sarah@example.com',
      phone: '(555) 234-5678',
      address: '123 Oak Street',
      city: 'Dallas',
      state: 'TX',
      zipCode: '75201',
      companyId: company.id
    }
  })

  const customer2 = await prisma.customer.create({
    data: {
      firstName: 'Mike',
      lastName: 'Davis',
      email: 'mike@example.com',
      phone: '(555) 345-6789',
      address: '456 Pine Avenue',
      city: 'Dallas',
      state: 'TX',
      zipCode: '75202',
      companyId: company.id
    }
  })

  console.log('✅ Created customers:', customer1.firstName, 'and', customer2.firstName)

  // Create demo jobs
  const job1 = await prisma.job.create({
    data: {
      title: 'Weekly Lawn Maintenance',
      description: 'Mow, edge, and trim bushes',
      type: 'maintenance',
      priority: 'NORMAL',
      status: 'SCHEDULED',
      address: '123 Oak Street',
      city: 'Dallas',
      state: 'TX',
      zipCode: '75201',
      estimatedCost: 150.00,
      scheduledStart: new Date('2024-06-12T09:00:00'),
      companyId: company.id,
      customerId: customer1.id,
      createdById: user.id
    }
  })

  const job2 = await prisma.job.create({
    data: {
      title: 'Tree Removal Service',
      description: 'Remove large oak tree in backyard',
      type: 'removal',
      priority: 'HIGH',
      status: 'SCHEDULED',
      address: '456 Pine Avenue',
      city: 'Dallas',
      state: 'TX',
      zipCode: '75202',
      estimatedCost: 850.00,
      scheduledStart: new Date('2024-06-13T08:00:00'),
      companyId: company.id,
      customerId: customer2.id,
      createdById: user.id
    }
  })

  console.log('✅ Created jobs:', job1.title, 'and', job2.title)
  console.log('🎉 Database seed completed successfully!')
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })