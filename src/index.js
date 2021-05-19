const express = require('express');
const {uuid, isUuid} = require('uuidv4') 
const cors = require('cors');

const app = express();

app.use(cors()); 
app.use(express.json());

/**
 * Métodos HTTP
 * 
 * GET: Buscar info do back-end
 * POST: Criar uma info no back-end
 * PUT/PATCH: Alterar info no back-end
 * DELETE: Deletar info back-end 
 * 
 */

/**
 * Tipos de parâmetros
 *  
 * Query Params: Filtros e paginação (GET)
 * Route Params: Identificar recursos (Atualizar/Deletar)(PUT/DELETE)
 * Request Body: Conteúdo na hora de criar(POST) ou editar(PUT) um recurso (Json)
 * 
 */

/**
 * Middleware
 * 
 * Interceptador de requisiçoes que interrompe totalmente a requisicao ou alterar dados da requisicao
 */

//Armazena as infos
const projectsArray = [];

//Middleware
function logRequest(request, response, next){
  const { method, url  } = request;

  const logLabel = `[${method.toUpperCase()}] - ${url}`;

  console.time(logLabel)

  // é necessário retornar essa função para a aplicação continue seu fluxo:
  next();

  console.timeEnd(logLabel)

}

//Middleware de validação
function validateProjectId(request, response, next){
  const { id } = request.params;

  if(!isUuid(id)){
    return response.status(400).json({error: 'Invalid project ID.'});
  }

  return next();
}

app.use(logRequest);// identifica que o middleware será chamado em todas as rotas
app.use('/projects/:id', validateProjectId);//Utilizando Midd apenas em rotas com o formato do 1° parametro

//Pesquisando (Lista)
app.get('/projects', (request, response) => {
  const { title } = request.query;

  const results = title
   ? projectsArray.filter(project => project.title.includes(title))//caso seja preenchido pelo usuario
   : projectsArray;//se nao for

  return response.json(results);
});

//Criando
app.post('/projects', (request, response) => {
  const {title, owner} = request.body;//corpo de solicitação

  const project = {id: uuid(), title, owner};

  projectsArray.push(project); 
  
  return response.json(project)
});

//Atualizando
app.put('/projects/:id', (request, response) => {
  const {id} = request.params;
  const {title, owner} = request.body;

  const projectIndex = projectsArray.findIndex(project => project.id == id);

  if(projectIndex < 0){
    return response.status(400).json({error: 'Project not found'})
  }

  const project ={
    id,
    title,
    owner,
  };

  projectsArray[projectIndex] = project;

  return response.json(project)
});

//Apagando
app.delete('/projects/:id', (request, response) => {
  const {id} = request.params;

  const projectIndex = projectsArray.findIndex(project => project.id == id);

  if(projectIndex < 0){
    return response.status(400).json({error: 'Project not found'})
  }else{
    projectsArray.splice(projectIndex, 1);//1 remove apenas a info contida no index
  }

  
  return response.status(204).send()
});

app.listen(3333, () =>{
  console.log('Back-end started!')
});