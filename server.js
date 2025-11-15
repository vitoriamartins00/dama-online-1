require('dotenv').config();     //carrega o env
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const config = require('./config/serverConfig');
const connectDB = require('./config/db');
const user = require('./models/user'); 
const authRoutes = require('./routes/authRoutes');
const protect = require('./middleware/authmiddle');
const path = require('path');
const express = require('express');
const { Server } = require("socket.io")
const {createServer} = require("http")
const { game } = require("./routes/virtual_game")
const { waiting_room } = require("./routes/waiting_room")


const app = express ();  

// estabelece a conexao com bd
connectDB();

app.use(bodyParser.json()); //cnoverte o corpo da requisicao (req.body) em um obj json
app.use(cookieParser());    //permite que o servidor acesse e manipule cookies
app.set('view engine', 'ejs');
app.use(express.static(path.join(__dirname, 'public')));  

//conectando - rota de autenticacao (cadastro, login...) 
app.use('/api/auth', authRoutes);

//redireciona o usuario para a pag de login
app.get('/', (req,res) =>{
    res.redirect('/login');
});

app.get('/cadastro', (req,res) =>{
    res.render('cadastro');
});

app.get('/login', (req, res) =>{
    res.render('login');
});

app.get('/desenvolvedores', (req, res) =>{
    res.render('desenvolvedores');
});

app.get('/documentacao', (req,res) =>{
    res.render('documentacao')
})

//rota de acesso ao jogo
app.get('/jogo', protect, (req, res) => {
    res.render('jogo');
});

//rota de teste de autenticacao 
app.get('/api/dados/protegidos', protect, (req, res) =>{
    res.json({
        message: `Autenticado, ${req.userId} `,
        data: 'Seus dados confidenciais'
    });
});

app.get("/waiting-room", protect, (req, res)=>{
    res.render("waiting-room")
})

app.get("/game-multiplayer", protect, (req, res)=>{
    res.render("game-multiplayer")
})

const httpServer = createServer(app)

const io = new Server(httpServer) 

game(io)

waiting_room(io)

httpServer.listen(config.PORT, () =>{
    console.log(config.SUCESSO_MSG(config.PORT));
})


