import './style.css'

const apiUrl = "https://rickandmortyapi.com/api/character";
const main = document.getElementById("app");
const search = document.getElementById("search");
const button = document.getElementById("btnSearch");
const filter = document.getElementById("filtrado");
const ordenar = document.getElementById("ordenar");
const btnFav = document.getElementById("ver-favoritos");
const btnPrev = document.getElementById("prev");
const btnNext = document.getElementById("next");
const paginaActual = document.getElementById("pagina-actual");

let personajesBase = []; // personajes obtenidos (búsqueda o todos)
let personajesFiltrados = []; // personajes después del filtrados
let currentPage = 1;
let totalPages = 1;

let favoritos = JSON.parse(localStorage.getItem("favoritos")) || [];//guarda el personaje favorito
let mostrandoFavoritos = false;

export function createCardErr(msj) {//crea una card/mensaje de error
  main.innerHTML = ` 
    <div>
      <p>${msj}</p>
    </div>
  `;
}

function createCardUser(user) {//crea la card del personaje 
  const cardUser = document.createElement("div");
  cardUser.className = "cardUser";
  const esFavorito = favoritos.some(fav => fav.id === user.id); // revisa si ya está

  cardUser.innerHTML = `
    <h3>${user.name}</h3>
    <img src="${user.image}" alt="${user.name}">
    <p>${user.status}</p>
    <button class="btn-fav">${esFavorito ? "★" : "☆"}</button>
  `;

cardUser.querySelector(".btn-fav").addEventListener("click", (e) => {
  e.stopPropagation();
  toggleFavorito(user);

  if (mostrandoFavoritos) {
    // si estamos viendo favoritos, actualizar la vista de favoritos
    main.innerHTML = '';
    if (favoritos.length === 0) {
      createCardErr("Aún no tienes personajes favoritos.");
    } else {
      favoritos.forEach(user => createCardUser(user));
    }
  } else {
    aplicarFiltroYOrden(); // en modo normal, aplicar filtros
  }
});

  cardUser.addEventListener("click", () => mostrarDetalle(user));
  main.appendChild(cardUser);
}


async function mostrarTodos(pagina = 1) {
  main.innerHTML = '';
  try {
    const res = await fetch(`${apiUrl}?page=${pagina}`);
    const data = await res.json();
    personajesBase = data.results;
    totalPages = data.info.pages;
    currentPage = pagina;
    aplicarFiltroYOrden();
    actualizarPaginacion();
  } catch (e) {
    createCardErr("Error al cargar los personajes");
    console.error(e);
  }
}


mostrarTodos();//llamado a la funcion

button.addEventListener("click", async (e) => {
  e.preventDefault();
  const valorInput = search.value.trim().toLowerCase();
  if (valorInput === "") {
    mostrarTodos(1); // vuelve a modo normal
    return;
  }

  main.innerHTML = '';
  try {
    let resultados = [];
    let pagina = 1;
    let continuar = true;

    while (continuar) {
      const res = await fetch(`${apiUrl}?page=${pagina}`);
      const data = await res.json();
      const coincidencias = data.results.filter(user =>
        user.name.toLowerCase().includes(valorInput)
      );
      resultados = resultados.concat(coincidencias);

      if (!data.info.next) {
        continuar = false;
      } else {
        pagina++;
      }
    }

    personajesBase = resultados;
    currentPage = 1;
    totalPages = 1;
    if (resultados.length === 0) {
      createCardErr("No se encontraron personajes con ese nombre");
    } else {
      aplicarFiltroYOrden();
    }

    actualizarPaginacion();
  } catch (error) {
    createCardErr("Error al cargar los datos");
    console.error(error);
  }
});


search.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    button.click();
  }//con el boton enter tmb puedo ejecutar la busqueda
});

filter.addEventListener("change", aplicarFiltroYOrden);
ordenar.addEventListener("change", aplicarFiltroYOrden);

function aplicarFiltroYOrden() {
  // 1. Filtro por estado
  const estado = filter.value;
  if (estado === "") {
    personajesFiltrados = [...personajesBase];
  } else {
    personajesFiltrados = personajesBase.filter(user =>
      user.status.toLowerCase() === estado.toLowerCase()
    );
  }

  // 2. Ordenamiento
  const orden = ordenar.value;
  if (orden === "A-Z") {
    personajesFiltrados.sort((a, b) => a.name.localeCompare(b.name));
  } else if (orden === "Z-A") {
    personajesFiltrados.sort((a, b) => b.name.localeCompare(a.name));
  }

  // 3. Mostrar
  main.innerHTML = '';
  if (personajesFiltrados.length === 0) {
    createCardErr("No se encontraron personajes con esos criterios");
  } else {
    personajesFiltrados.forEach(user => createCardUser(user));
  }
}

function mostrarDetalle(user) {//captura el evento click sobr euna card y mustra otra card con mas detalles 
  const detalle = document.getElementById("detalle-container");
  detalle.classList.remove("oculto");
  detalle.innerHTML = `
    <img src="${user.image}" alt="${user.name}">
    <h2>${user.name}</h2>
    <p><strong>Status:</strong> ${user.status}</p>
    <p><strong>Species:</strong> ${user.species}</p>
    <p><strong>Gender:</strong> ${user.gender}</p>
    <p><strong>Origin:</strong> ${user.origin.name}</p>
    <button id="cerrar-detalle">Cerrar</button>
  `;

  document.getElementById("cerrar-detalle").addEventListener("click", () => {
    detalle.classList.add("oculto");
    detalle.innerHTML = "";
  });
//scroll para ver el detalle de la card 
  detalle.scrollIntoView({ behavior: "smooth" });
}


function toggleFavorito(user) {//agregar o eliminar el personaje de favorito
  const index = favoritos.findIndex(fav => fav.id === user.id);
  if (index === -1) {
    favoritos.push(user);
  } else {
    favoritos.splice(index, 1);
  }
  localStorage.setItem("favoritos", JSON.stringify(favoritos));
}


function actualizarPaginacion() {
  paginaActual.textContent = `Página ${currentPage} de ${totalPages}`;
  btnPrev.disabled = currentPage === 1;
  btnNext.disabled = currentPage === totalPages;
}
btnNext.addEventListener("click", () => {
  if (currentPage < totalPages) {
    mostrarTodos(currentPage + 1);
  }
});

btnPrev.addEventListener("click", () => {
  if (currentPage > 1) {
    mostrarTodos(currentPage - 1);
  }
});

btnFav.addEventListener("click", () => {
  main.innerHTML = '';
  mostrandoFavoritos = !mostrandoFavoritos;

  const paginacion = document.getElementById("paginacion");
  paginacion.style.display = mostrandoFavoritos ? "none" : "flex";

  if (mostrandoFavoritos) {
    btnFav.textContent = "Volver";
    if (favoritos.length === 0) {
      createCardErr("Aún no tienes personajes favoritos.");
    } else {
      favoritos.forEach(user => createCardUser(user));
    }
  } else {
    btnFav.textContent = "Ver Favoritos";
    filter.value = "";
    ordenar.value = "";
    mostrarTodos(currentPage);
    setTimeout(() => {
  paginacion.style.display = "flex";
  paginacion.style.justifyContent = "center";
}, 0);
  }
});