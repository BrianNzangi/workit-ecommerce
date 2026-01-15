require('dotenv').config()
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
    const count = await prisma.setting.count()
    console.log('Count:', count)
    const all = await prisma.setting.findMany()
    console.log('All:', all)

    // also fetch from API
    try {
        const res = await fetch('http://localhost:3001/api/store/settings')
        const json = await res.json()
        console.log('API Response:', json)
    } catch (e) {
        console.log('API Error:', e.message)
    }
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect())
