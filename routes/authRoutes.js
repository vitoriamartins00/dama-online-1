const express = require("express");
const router = express.Router();
const User = require("../models/user");
const jwt = require("jsonwebtoken");
const protect = require("../middleware/authmiddle");

router.post("/cadastro", async (req, res) => {
  const { nomeusuario, email, senha } = req.body;
  try {
    //procura usuario com mesmo email ou nome
    const userExists = await User.findOne({
      $or: [{ email }, { nomeusuario }],
    });

    if (userExists) {
      return res.status(400).json({
        message: "E-mail ou nome de usuário já possui cadastro",
      });
    }

    const newUser = new User({ nomeusuario, email, senha });

    const savedUser = await newUser.save();

    res.status(201).json({
      _id: savedUser._id,
      nomeusuario: savedUser.nomeusuario,
    });
  } catch (error) {
    console.error("Erro no cadastro", error);
    res.status(500).json({
      message: "Erro do servidor",
      error: error.message,
    });
  }
});

//rota login
router.post("/login", async (req, res) => {
  const { email, senha } = req.body;
  //verificando se os campos foram preenchidos
  if (!email || !senha) {
    return res.status(400).json({
      message: "E-mail e senha são obrigatórios",
    });
  }
  try {
    //buscando o usuario no bd
    const user = await User.findOne({ email });
    //verificando se o usuario existe
    if (!user) {
      return res.status(401).json({
        message: "Usuário inválido",
      });
    }
    const isMatch = await user.matchPassword(senha);
    //comparando a senha informada com a salva no bd
    if (!isMatch) {
      return res.status(401).json({ message: "Senha inválida" });
    }
    // se as infos estiverem corretaas, o token será gerado
    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET || "08304b48f517247ad7af5f57",
      { expiresIn: "1h" }
    );
    //enviando o token no cookie httponly
    res.cookie("sessionToken", token, {
      httpOnly: true, //protege contra ataques
      secure: process.env.NODE_ENV === "production", //assume o valor true somente em prod
      maxAge: 3600000, //duracao de 1h
      sameSite: "strict",
    });
    // enviando o status de confirmacao, com msg de confirmacao e nome do usuario
    res.status(200).json({
      message: "Login realizado",
      nomeusuario: user.nomeusuario,
    });
  } catch (error) {
    console.error("Erro no login", error);
    res.status(500).json({
      message: "Erro do servidor",
      error: error.message,
    });
  }
});

router.post("/atualizar-conta", protect, async (req, res) => {
  try {
    const userId = req.usuario._id;
    const { novoNomeusuario } = req.body;

    if (!novoNomeusuario || novoNomeusuario.trim().length < 3) {
      return res
        .status(400)
        .json({ message: "O novo nome deve conter pelo menos 3 caracteres" });
    }

    const updateUser = await User.findByIdAndUpdate(
      userId,
      { nomeusuario: novoNomeusuario },
      { new: true, runValidators: true }
    );

    if (!updateUser) {
      return res.status(404).json({ message: "Usuário não encontrado." });
    }

    res.status(200).json({
      success: true,
      message: "Nome de usuário atualizado com sucesso",
      novoNome: updateUser.nomeusuario,
    });
  } catch (error) {
    console.error("Erro ao atualizar nome do usuário: ", error);
    res
      .status(500)
      .json({
        message: "Erro do servidor ao processar a atualização.",
        error: error.message,
      });
  }
});

router.post("/excluir-conta", protect, async (req, res) => {
  try {
    const userId = req.usuario._id;

    const deleteUser = await User.findByIdAndDelete(userId);

    if (!deleteUser) {
      return res.status(404).json({ message: "Usuário não encontrado" });
    }

    res.clearCookie("sessionToken");

    res.status(200).json({
      success: true,
      message: "Conta, excluída permanentemente",
    });
  } catch (error) {
    console.error("Error ao excluir conta: ", error);
    res.status(500).json({ message: "Erro do servidor ao excluir conta." });
  }
});

// é uma rota post pq é uma acao
router.post("/logout", (req, res) => {
  //o cookie de autenticacao no navegador do usuario
  res.cookie("sessionToken", "", {
    //troca o valor para uma string vazia
    httpOnly: true, //mantém o httponly
    expires: new Date(0), //o navegador deleta o cookie
  });

  res.status(200).json({
    message: "Encerrando seu acesso, até logo",
  });
});

module.exports = router;
