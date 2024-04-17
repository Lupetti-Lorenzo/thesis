import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
async function main() {
    await prisma.certificates.create({
        data: {
            id: "c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
            creator_id: "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
            name: "AWS Certified Solutions Architect - Associate",
            company: "Test",
            level: 1,
            validity: 24,
        },
    });
}