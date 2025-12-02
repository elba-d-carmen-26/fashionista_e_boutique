const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const dotenv = require("dotenv");
const User = require("../models/User");

// Cargar variables de entorno
dotenv.config();

const createAdmin = async () => {
  try {
    // Conectar a MongoDB
    await mongoose.connect(
      process.env.MONGODB_URI || "mongodb://localhost:27017/fashionista",
      {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      }
    );

    console.log("✅ Conectado a MongoDB");

    // Verificar si ya existe un administrador con este email
    const existingUser = await User.findOne({ email: "elba1@admin.com" });
    if (existingUser) {
      if (existingUser.role === "admin") {
        console.log(
          "⚠️  Ya existe un usuario administrador con email: elba1@admin.com"
        );
        console.log("👤 Nombre:", existingUser.name);
        console.log("📧 Email:", existingUser.email);
        console.log("🔑 Usa la contraseña que configuraste anteriormente");
      } else {
        // Si existe pero no es admin, lo convertimos a admin
        existingUser.role = "admin";
        await existingUser.save();
        console.log("🔄 Usuario existente convertido a administrador");
        console.log("📧 Email: elba1@admin.com");
        console.log("🔑 Usa tu contraseña actual");
      }
      process.exit(0);
    }

    // Datos del administrador personalizado
    const adminData = {
      name: "Elba Administrador",
      email: "elba1@admin.com",
      password: "Elba123!",
      role: "admin",
      isActive: true,
    };

    // Crear usuario administrador
    const admin = new User(adminData);
    await admin.save();

    console.log("✅ Administrador creado exitosamente!");
    console.log("📧 Email: elba1@admin.com");
    console.log("🔑 Contraseña: Elba123!");
    console.log("👤 Nombre: Elba Administrador");
    console.log("");
    console.log(
      "⚠️  IMPORTANTE: Cambia la contraseña después del primer login"
    );
    console.log("🔐 Puedes hacer login en: http://localhost:3000/login");
  } catch (error) {
    console.error("❌ Error creando administrador:", error.message);
    if (error.code === 11000) {
      console.error('💡 El email "elba1" ya está registrado.');
    }
  } finally {
    mongoose.connection.close();
    console.log("🔌 Conexión a MongoDB cerrada");
  }
};

// Ejecutar función
createAdmin();
