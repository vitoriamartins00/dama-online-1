const mongoose = require ('mongoose');
const bcrypt = require('bcrypt');           //serve para cryptografar a senha enviada para o banco de dados

const schemaUsuario = new mongoose.Schema({
    nomeusuario: {
        type: String,
        require:[true, 'Campo obrigatório'],
        unique: true,   
        trim: true, //remove os espaços em branco antes e depois
        minlength: 3
    },
    email:{
        type: String,
        require: [true, 'Campo obrigatório'],
        unique: true,
        trim: true,
        lowercase: true //sempre salvar em minusculo, normaliza o e-mail antes de salvar
    },
    senha:{
        type: String,
        require: [true, 'A senha é obrigatória'],
    },
    // para verificar se o usuario está online
    isOnline:{
        type: Boolean,
        default: false  //define o status inicial do usuario
    }
});
// será executado antes que o doc seja salvo no mongo
schemaUsuario.pre('save', async function (next) {
    const user = this;
    // verifica se a senha foi alterada
    if (!user.isModified('senha')){
        return next ();
    }
    try{
        //gera o salt: string aleatória anexada a senha
        const salt = await bcrypt.genSalt(10);  //10 é padrão
        //combina a senha e o salt para criar a versão criptografada 
        user.senha = await bcrypt.hash(user.senha, salt);
        return next();
    } catch (err) {
        return next(err);
    }
});

//cria um método para instancia do usuario, usado na rota de login
schemaUsuario.methods.matchPassword = async function (senhaDigitada) {
    //compara a senha informada com o hash salvo (this.senha)
    return await bcrypt.compare(senhaDigitada, this.senha);
}

const User = mongoose.model('User', schemaUsuario);

module.exports = User;