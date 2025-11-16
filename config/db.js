const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    // acessando a variavel .env (MONGO_URI)
    const conn = await mongoose.connect(process.env.MONGO_URI);

    console.log(`MongoDB conectado: ${conn.connection.host}`);
  } catch (err) {
    console.error("Erro na conexao com MongoDB:", err.message);
    process.exit(1);
  }
};

module.exports = connectDB;
