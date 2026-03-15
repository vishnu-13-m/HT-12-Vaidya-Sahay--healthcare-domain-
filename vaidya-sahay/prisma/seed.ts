import { PrismaClient } from '@prisma/client'
import { MOCK_HOSPITALS, MOCK_RESOURCES, MOCK_INVENTORY, MOCK_HOSPITAL_ADMINS } from '../src/lib/db'

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding database...')

  // Create hospitals
  for (const hospital of MOCK_HOSPITALS) {
    await prisma.hospital.upsert({
      where: { id: hospital.id },
      update: hospital,
      create: hospital,
    })
  }

  // Create hospital admins
  for (const admin of MOCK_HOSPITAL_ADMINS) {
    await prisma.hospitalAdmin.upsert({
      where: { id: admin.id },
      update: admin,
      create: admin,
    })
  }

  // Create resources
  for (const resource of MOCK_RESOURCES) {
    await prisma.resource.upsert({
      where: { id: resource.id },
      update: resource,
      create: resource,
    })
  }

  // Create inventory
  for (const inventory of MOCK_INVENTORY) {
    await prisma.inventory.upsert({
      where: { id: inventory.id },
      update: inventory,
      create: inventory,
    })
  }

  console.log('Database seeded successfully!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })