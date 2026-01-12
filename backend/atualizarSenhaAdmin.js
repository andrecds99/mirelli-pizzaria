require("dotenv").config();
require("./database");

const bcrypt = require("bcryptjs");
const Admin = require("./models/Admin");

(async () => {
  try {
    const novaSenha = "admin123";
    const senhaHash = await bcrypt.hash(novaSenha, 10);

    const admin = await Admin.findOneAndUpdate(
      { email: "admin@mirelli.com" },
      { senha: senhaHash }
    );

    if (admin) {
      console.log("✅ Senha do admin atualizada com sucesso!");
    } else {
      console.log("⚠️ Nenhum admin encontrado com esse e-mail.");
    }

    process.exit();
  } catch (err) {
    console.error("❌ Erro ao atualizar senha:", err);
    process.exit(1);
  }
})();