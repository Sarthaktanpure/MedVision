require("dotenv").config();

const { connectDatabase } = require("../config/db");
const { ensureDemoData } = require("../services/store");

async function main() {
  await connectDatabase();
  await ensureDemoData();
  console.log("Demo data seeded.");
  process.exit(0);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
