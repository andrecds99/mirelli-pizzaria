// database.js
const mongoose = require("mongoose");

mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => console.log("✅ MongoDB conectado"))
  .catch(err => console.error("❌ Erro ao conectar no MongoDB:", err));

module.exports = mongoose;
