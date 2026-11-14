const bcrypt = require("bcryptjs");

const users = [
  { userId: "john123",    password: "123456", nric: "S1234567A" },
  { userId: "emily123",   password: "123456", nric: "S7654321B" },
  { userId: "albert123",  password: "123456", nric: "S1122334C" },
  { userId: "ben123",     password: "123456", nric: "S5566778D" },
  { userId: "crystal123", password: "123456", nric: "S1111111E" },
];

async function main() {
  const rows = [];
  for (const u of users) {
    const hash = await bcrypt.hash(u.password, 10);
    rows.push(`\t('${u.userId}', '${hash}', '${u.nric}')`);
  }

  console.log("insert into UserLogin (UserID, PasswordHash, NRIC)\n\tvalues");
  console.log(rows.join(",\n") + ";");
}

main();