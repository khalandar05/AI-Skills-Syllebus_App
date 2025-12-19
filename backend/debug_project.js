
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const prisma = require('./src/lib/prisma');

async function debugProject() {
    const id = 'f3f4b069-b3da-4d8f-a809-02f2e5678587';
    console.log("Checking project:", id);
    const p = await prisma.project.findUnique({ where: { id } });
    console.log(p);
    const up = await prisma.userProject.findMany({ where: { projectId: id } });
    console.log("UserProjects:", up);
}

debugProject()
  .catch(e => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });
