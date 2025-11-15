const jwt = require('jsonwebtoken');

//funcao de middleware, recebe req, res e next
const protect = (req, res, next) =>{
    //a variavel que vai armazenar o token
    let token;
    //verifica o cookie-parser coloca os cookies em req.cookies
    if (req.cookies.sessionToken){
        token = req.cookies.sessionToken;
    }
    // se o token nao foi encontrado no cookie
    if(!token){
        //encerra a requisicao
        return res.status(401).json({message: 'Acesso negado. Nenhum token de sessão encontrado.'})
    }
    try{
        const decoded = jwt.verify(
            token, 
            process.env.JWT_SECRET ||'08304b48f517247ad7af5f57'
        );
        // anexando o id do usuario a req p saber quem está logado
        req.userId = decoded.id;
        // se a verificacao tiver sucesso passa para a proxima funcao
        next();
    } catch (error){
        // se tiver algum erro na verificacao
        console.error('Erro de autenticação: ', error.message);
        //força o usuario a logar novamente
        return res.status(401).json({message: 'Token de sessão inválido ou expirado. Faça login novamente.'});
    }
};

module.exports = protect;