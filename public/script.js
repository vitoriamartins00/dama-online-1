
//funcao que envia os dados de cadastro para API
async function handleCadastro(nomeusuario, email, senha) {
    // conectando com a rota 
    const response = await fetch('/api/auth/cadastro', {
        method: 'POST',     //enviando os dados
        headers: {
            'content-type': 'application/json',     //dizendo ao servidor que estamos enviando json
        },
        body: JSON.stringify({nomeusuario, email, senha}),  //conversao de dados
    });
    //verificando status da resposta
    if (response.status === 201){
        //sucesso
        const data = await response.json();
        window.alert(`Cadastro realizado com sucesso! ${data.nomeusuario}`);
        
        //redireciona para a pag login
        window.location.replace('/login');  
    } else if(response.status === 400){
        //trata o erro 400 Bad Request (usuario já existe)
        const errorData = await response.json();
        //exibe a mensagem ao usuario
        window.alert(`Falha no cadastro: ${errorData.message}`);

    } else{
        //tratamento de outros erros inesperados (500)
        const errorData = await response.json(); 
        window.alert(`Erro no servidor: ${errorData.message}`);
        
    }
}
// funcao para enviar os dados de login para api
async function handleLogin(email, senha) {
    const response = await fetch('/api/auth/login',{
        method: 'POST',
        headers: {
            'content-type': 'application/json', 
        },
        body: JSON.stringify({email, senha}),
    });
    //verificando o status de login
    if(response.status === 200) {
        const data = await response.json();
        window.alert(`Bem-vindo, ${data.nomeusuario}`);
        //redirecionando para pagina principal
        window.location.replace('jogo.html');       //verificar com o nicolas onde está a pagina do jogo//
        //trata dados inválidos
    } else if (response.status === 401){
        const errorData = await response.json();
        window.alert(`Falha no login: ${errorData.message}`);
    } else{
        //trata os outros erros (500)
        const errorData = await response.json();
        window.alert(`Erro no servidor (Status ${response.status}): ${errorData.message || 'Ocorreu um erro'}`);
    }
}

//funcao teste
async function accessProtectedData() {
    const response = await fetch('/api/dados/protegidos', {
        method: 'GET',      //buscar dados
        headers: { 'Content-Type': 'application/json' },
        // diz ao navegador para incluir o cookie da sessão automaticamente
        credentials: 'include' 
    });
    //verificação de status
    if (response.status === 200) {
        const data = await response.json();
        alert(`SUCESSO! ${data.message}`);
        console.log("Dados recebidos:", data);
    } else {
        alert("FALHA! Acesso negado. Você não está logado.");
        console.log("Status:", response.status);
    }
}
//funcao logout
async function handleLogout() {
    const response = await fetch('/api/auth/logout', {
        method: 'POST',             //executa a acao e limpa o cookie
        credentials: 'include'      //envia o cookie para ser excluido
    });
    // status de sucesso, cookie limpo
    if (response.status === 200){
        alert("Sessão encerrada");
        window.location.replace('/login');
    } else{
        alert("Não foi possível encerrar sua sessão");
    }
}

//encontra o formulario  de cadastro no html
const cadastroForm = document.getElementById('formCadastro');
//verifica se o form existe na pagina atual
if (cadastroForm) {
    // conecta com o evento 'submit' quando o usuario clica em 'cadastrar' a funcao é executada
    cadastroForm.addEventListener('submit', async(e) =>{
        e.preventDefault();
        
        const nomeusuario = document.getElementById('username').value;
        const email = document.getElementById('email').value;
        const senha = document.getElementById('pwd').value;

        console.log("Dados enviados:", {nomeusuario, email, senha});
        console.log("JSON body:", JSON.stringify({nomeusuario, email, senha}));
        // chama a funcao que faz a req 'fetch' para a api, 'await' pausa a execucao até que a api responda
        await handleCadastro(nomeusuario, email, senha);
    });
}

//encontra o formulario de login no html
const loginForm = document.getElementById('loginForm');
//verifica se o form existe na pagina atual
if (loginForm){
    //adiciona o listener para o evento de 'submit' do form de login
    loginForm.addEventListener('submit', async(e) =>{
        e.preventDefault();

        const email = document.getElementById('email').value;
        const senha = document.getElementById('password').value;

        console.log("Usuario logado: ", {email, senha})

        await handleLogin(email, senha);
    });
}
