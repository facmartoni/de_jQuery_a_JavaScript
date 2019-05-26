const key = '&apikey=14afd686';
const url = `http://www.omdbapi.com/`;
const urlUsers = `https://randomuser.me/api`;
const NUMBER_OF_USERS = 10; 

const $modal = document.getElementById('modal'); 
const $overlay = document.getElementById('overlay'); 
const $hideModal = document.getElementById('hide-modal');
const $modalImage = $modal.querySelector('img');
const $modalTitle = $modal.querySelector('h1');
const $modalDescription = $modal.querySelector('p');
const $actionContainer = document.querySelector('#action');
const $dramaContainer = document.querySelector('#drama');
const $animationContainer = document.querySelector('#animation');
const $featuringContainer = document.querySelector('#featuring');
const $formulario = document.querySelector('#form');
const $home = document.querySelector('#home');
const $myPlaylist = document.getElementById('myPlaylist');
const $usersContainer = document.getElementById('playlistFriends'); 

//const $home = $('.home .list #item') // Selector en jQuery

//Función que devuelve un string con su primera letra en mayúsculas
const firstLetterToUpperCase = (string) => {
  return string.charAt(0).toUpperCase() + string.slice(1);
};

//Función que crea un template string de un usuario
const userTemplate = (user) => {

  const{
    name: {
      first: nombre,
      last: apellido,
    },
    picture: {
      thumbnail: miniatura
    }
  } = user[0];

  return (
    `
    <li class="playlistFriends-item">
      <a href="#">
        <img src="${miniatura}" alt="user_image" />
        <span>
          ${firstLetterToUpperCase(nombre)} ${firstLetterToUpperCase(apellido)}
        </span>
      </a>
    </li>
    `
  )
}

//Función que crea un template string de una película de la playlist
const myPlaylistTemplate = ({Title, imdbID: id}, category) => {
  return (
    `
    <li class="myPlaylist-item" data-id="${id}" data-category="${category}">
      <a href="#">
        <span>
          ${Title}
        </span>
      </a>
    </li>
    `
  )
}

//Función que crea un elemento html con la información de una búsqueda
const featuringTemplate = (peli, finded = 'Película encontrada') => {

  const {
    Poster,
    Title
  } = peli; 

  return (
    `
    <div class="featuring">
        <div class="featuring-image">
          <img src="${Poster}" width="70" height="100" alt="">
        </div>
        <div class="featuring-content">
          <p class="featuring-title">${finded}</p>
          <p class="featuring-album">${Title}</p>
        </div>
      </div>
    `
  )
}

//Funcióm que coloca varios atributos en un elemento html
const setAttributes = ($element, attributes) => {
  for (const key in attributes){
    $element.setAttribute(key, attributes[key])
  }
}

//Al escucharse el evento submit, se ejecuta una función que busca una película en la base de datos de la API
$formulario.addEventListener('submit', async (event) =>{
  event.preventDefault(); 
  $home.classList.add('search-active');
  $featuringContainer.style.display = 'grid';
  const $loader = document.createElement('img');
  setAttributes($loader, {
    src: 'src/images/loader.gif',
    height: 50,
    width: 50
  })
  $featuringContainer.append($loader); 

  // Con el objeto FormData se traén los valores del formulario
  const data = new FormData($formulario); 

  const peli = await getData(`${url}?t=${data.get('name')}${key}`);

  //Si la respuesta es verdadera se muestra la película, en caso contrario un mensaje de error
  if(peli.Response != 'False'){
    const htmlString = featuringTemplate(peli); 
    $featuringContainer.innerHTML = htmlString;
  }
  else{
    const errorString = featuringTemplate({Title: 'Lo sentimos :('}, 'Película no encontrada');
    $featuringContainer.innerHTML = errorString;
  }

})

//Función que retorna un elemento buscado en una lista que cumpla la condición de tener un id igual al que se envía por parámetro
const findById = (list, id) => {
  return list.find(movie => movie.imdbID === id);
}

//Función que dependiendo de la categoría, llama a la función 'Buscar por id'
const findMovie = (id, category) =>{
  switch(category){
    case 'action':
      return findById(actionListGlobal, id);
    case 'drama':
      return findById(dramaListGlobal, id);
    default: 
      return findById(animationListGlobal, id);
  }
}

//Función que muestra un modal
const showModal = ($element, item, isUser = false) => {
  $overlay.classList.add('active');
  $modal.style.animation = 'modalIn .8s forwards';
  const {id, category} = $element.dataset;
  const data = findMovie(id, category);
  if(isUser){
    $modalTitle.textContent = `${firstLetterToUpperCase(item[0].name.first)} ${firstLetterToUpperCase(item[0].name.last)}`; 
    $modalImage.setAttribute('src', item[0].picture.large);
    $modalDescription.textContent = item[0].email; 
  }
  else{
    $modalTitle.textContent = data.Title;
    $modalImage.setAttribute('src', data.Poster);
    $modalDescription.textContent = data.Year;  
  }
}

//Función que cierra un modal
const hideModal = () => {
  setTimeout(() => $overlay.classList.remove('active'), 1000)
  $modal.style.animation = 'modalOut .8s forwards';
}

//Se añada el evento click al botón de 'Cerrar modal'
$hideModal.addEventListener('click', () =>{
  hideModal();
})

//Funcion que añade el elemento click a un elemento, y llama a la función 'Mostrar modal' a continuación
const addEventClick = ($element, item, isUser = false) =>{
  if(isUser)
  $element.addEventListener('click', () => showModal($element, item, true))
  else
  $element.addEventListener('click', () => showModal($element))
}

//Función que retorna un template string de un elemento html
const videoItemTemplate = (item, category) =>{

  const {
    Poster,
    Title,
    imdbID: Id,
  } = item; 

  return (
    `<div class="primaryPlaylistItem" data-id="${Id}" data-category=${category}>
      <div class="primaryPlaylistItem-image">
        <img src="${Poster}">
      </div>
      <h4 class="primaryPlaylistItem-title">
        ${Title}
      </h4>
    </div>`
  )
}

//Función que transforma un string en un elemento html
const createHtmlTemplate = (HTMLString) =>{
  const $html = document.implementation.createHTMLDocument();
  $html.body.innerHTML = HTMLString;
  return $html.body.children[0]; 
}

//Función que trae datos de un servidor, y retorna un JSON
const getData = async (url) =>{
  const response = await fetch(url)
  const data = await response.json();
  return data;  
}

//Función que renderiza las listas en pantalla
const renderPlaylist = (list, $container, category) =>{
  list.forEach((item) => {
    const htmlString = myPlaylistTemplate(item, category);
    const htmlTemplate = createHtmlTemplate(htmlString);
    $container.append(htmlTemplate);
    addEventClick(htmlTemplate); 
  })
}

//Función que renderiza los usuarios en pantalla
const renderUsers = (list, $container) => {
  list.forEach((item) => {
    const htmlString = userTemplate(item); 
    const htmlTemplate = createHtmlTemplate(htmlString);
    $container.append(htmlTemplate); 
    addEventClick(htmlTemplate, item, true); 
  })
}

//Función que renderiza las películas en pantalla
const renderMovieList = (list, $container, category) => {
  const loader = $container.children[0];
  loader.remove(); 
  list.forEach((item) =>  {
    const htmlString = videoItemTemplate(item, category); 
    const htmlTemplate = createHtmlTemplate(htmlString);
    $container.append(htmlTemplate); 

    //Lazy load
    const image = htmlTemplate.querySelector('img');
    image.addEventListener('load', () => {
      image.classList.add('fadeIn');
    })
    addEventClick(htmlTemplate);
  })
}

let actionListGlobal, dramaListGlobal, animationListGlobal, usersGlobal; // Se declaran las listas de manera global para poder acceder a ellas
// En cualquier parte del programa, cosa que se complicó por haber estado declaradas dentro la función 'load'

// Función principal
(async function load(){

  // Función que retorna un objeto del localStorage, y si no existe lo trae del servidor
  const cacheExist = async (category, search) => {
    const listName = `${category}List`;
    const cacheList = localStorage.getItem(listName);
    if(cacheList != "undefined" && cacheList !=null){
      return JSON.parse(cacheList); 
    }
    const {Search: data} = await getData(`${url}?s=${search}${key}`); 
    localStorage.setItem(listName, JSON.stringify(data));
    return data; 
  }

  const actionList = await cacheExist('action', 'avengers'); 
  renderMovieList(actionList, $actionContainer, 'action'); 

  const dramaList = await cacheExist('drama', 'x-men'); 
  renderMovieList(dramaList, $dramaContainer, 'drama'); 
  
  const animationList = await cacheExist('animation', 'hero'); 
  renderMovieList(animationList, $animationContainer, 'animation'); 

  actionListGlobal = actionList; 
  dramaListGlobal = dramaList;
  animationListGlobal = animationList; 

  renderPlaylist(actionListGlobal, $myPlaylist, 'action'); 

  usersGlobal = await generateListOfUsers();
  renderUsers(usersGlobal, $usersContainer); 

  console.log(actionList, dramaList, animationList)

})(); 

//Función que genera una lista de usuarios trayéndolos de la API de randomusers
const generateListOfUsers = async () => {
  const list = [];
  for (let i=0; i<NUMBER_OF_USERS; i++){
    const {results: users} = await getData(`${urlUsers}`); 
    list.push(users); 
  }
  return list; 
}