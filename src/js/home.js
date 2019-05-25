const key = '&apikey=14afd686';
const url = `http://www.omdbapi.com/`;

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

// const $home = $('.home .list #item') // Selector en jQuery

// Evento submit del formulario

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

const setAttributes = ($element, attributes) => {
  for (const key in attributes){
    $element.setAttribute(key, attributes[key])
  }
}

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

  const data = new FormData($formulario); 

  const peli = await getData(`${url}?t=${data.get('name')}${key}`);
  if(peli.Response != 'False'){
    const htmlString = featuringTemplate(peli); 
    $featuringContainer.innerHTML = htmlString;
  }
  else{
    const errorString = featuringTemplate({Title: 'Lo sentimos :('}, 'Película no encontrada');
    $featuringContainer.innerHTML = errorString;
  }

})

const findById = (list, id) => {
  return list.find(movie => movie.imdbID === id);
}

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

const showModal = ($element) => {
  $overlay.classList.add('active');
  $modal.style.animation = 'modalIn .8s forwards';
  const {id, category} = $element.dataset;
  const data = findMovie(id, category);
  $modalTitle.textContent = data.Title;
  $modalImage.setAttribute('src', data.Poster);
  $modalDescription.textContent = data.Year;  
}

const hideModal = () => {
  setTimeout(() => $overlay.classList.remove('active'), 1000)
  $modal.style.animation = 'modalOut .8s forwards';
}

$hideModal.addEventListener('click', () =>{
  hideModal();
})

const addEventClick = ($element) =>{
  $element.addEventListener('click', () => showModal($element))
}

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

const createHtmlTemplate = (HTMLString) =>{
  const $html = document.implementation.createHTMLDocument();
  $html.body.innerHTML = HTMLString;
  return $html.body.children[0]; 
}

const getData = async (url) =>{
  const response = await fetch(url)
  const data = await response.json();
  return data;  
}

const renderMovieList = (list, $container, category) => {
  const loader = $container.children[0];
  loader.remove(); 
  list.forEach((item) =>  {
    const htmlString = videoItemTemplate(item, category); 
    const htmlTemplate = createHtmlTemplate(htmlString);
    $container.append(htmlTemplate); 
    const image = htmlTemplate.querySelector('img');
    image.addEventListener('load', () => {
      image.classList.add('fadeIn');
    })
    addEventClick(htmlTemplate);
  })
}

let actionListGlobal, dramaListGlobal, animationListGlobal;

(async function load(){

  const {Search: actionList} = await getData(`${url}?s=horse${key}`); 
  renderMovieList(actionList, $actionContainer, 'action'); 
  const {Search: dramaList} = await getData(`${url}?s=cow${key}`); 
  renderMovieList(dramaList, $dramaContainer, 'drama'); 
  const {Search: animationList} = await getData(`${url}?s=child${key}`); 
  renderMovieList(animationList, $animationContainer, 'animation'); 

  actionListGlobal = actionList; 
  dramaListGlobal = dramaList;
  animationListGlobal = animationList; 

  console.log(actionList, dramaList, animationList)

})(); 