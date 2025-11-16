const jwt = require("jsonwebtoken");
const User = require("../models/user");

//funcao de middleware, recebe req, res e next
const protect = async (req, res, next) => {
  //a variavel que vai armazenar o token
  let token;
  //verifica o cookie-parser coloca os cookies em req.cookies
  if (req.cookies.sessionToken) {
    token = req.cookies.sessionToken;
  }
  // se o token nao foi encontrado no cookie
  if (!token) {
    return res.redirect("/login");
  }
  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "08304b48f517247ad7af5f57"
    );

    const user = await User.findById(decoded.id).select(
      "nomeusuario email partidas_vencidas partidas_jogadas"
    );
    if (!user) {
      return res.redirect("/cadastro");
    }
    // anexando o id do usuario a req p saber quem está logado
    req.usuario = user;
    req.userId = decoded.id;
    // se a verificacao tiver sucesso passa para a proxima funcao
    next();
  } catch (error) {
    // se tiver algum erro na verificacao
    console.error("Erro de autenticação: ", error.message);
    res.clearCookie("sessionToken");
    //força o usuario a logar novamente
    return res.redirect("/login");
  }
};

module.exports = protect;
