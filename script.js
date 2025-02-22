// Funciones para el form
function agregarFila() {
    // Obtiene el cuerpo de la tabla
    var table = document.getElementById("tablaIngredientes").getElementsByTagName('tbody')[0];

    // Crea una nueva fila
    var newRow = table.insertRow();

    // Crea las celdas para la fila
    var cell1 = newRow.insertCell(0);
    var cell2 = newRow.insertCell(1);
    var cell3 = newRow.insertCell(2);

    // Añade los inputs para ingrediente y cantidad en las celdas
    cell1.innerHTML = '<input type="text" name="ingredientes[]" required>';
    cell2.innerHTML = '<input type="text" name="cantidades[]" required>';
    cell3.innerHTML = '<button type="button" onclick="eliminarFila(this)">🗑️</button>';
}
        
function eliminarFila(boton) {
    // Elimina la fila en la que está el botón de eliminar
    var row = boton.parentNode.parentNode;
    row.parentNode.removeChild(row);
}

//Funciones para la API
function ObtenerProductos(ingrediente) {
    fetch("https://dummyjson.com/c/5092-fe35-4c6e-9ad0")
        .then(response => response.json())
        .then(data => {
            console.log(data);
            const productosRelacionados = data.products.filter(producto =>
                producto.title.toLowerCase().includes(ingrediente.toLowerCase())
            );

            if (productosRelacionados.length > 0) {
                mostrarProductos(productosRelacionados);
            } else {
                console.log("No se encontraron productos relacionados con: " + ingrediente);
                document.getElementById("productos-recomendados").innerHTML = 
                "<h2>Productos recomendados</h2> No hay ingredientes para estas recetas";
            }
        })
        .catch(error => console.error("Error al obtener productos:", error));
}

function mostrarProductos(productos){
    const contenedor=document.getElementById("productos-recomendados");
    productos.slice(0, 3).forEach(producto => {
        const productoHTML = `
            <div class="producto">
                <img src="${producto.image}" alt="${producto.title}" >
                <button class="boton-comprar">Comprar</button>
                <h3>${producto.title}</h3>
                <p>Precio: ${producto.price}</p>
            </div>
        `;
        contenedor.innerHTML += productoHTML;
    });
}
const rutaActual = window.location.pathname;

const ingredientesPorPagina = {
    "recetas_rapidas.html": ["Avocado", "Tomatoes", "Salmon"],
    "recetas_partido.html": ["Tortillas", "puff pastry", "bao bread"],
    "postres.html": ["Whipped cream", "Cinamon", "Cocoa powder"],
    "recetas_internacionales.html": ["bomb rice", "Peppers", "octopus"]
};

for (const [pagina, ingredientes] of Object.entries(ingredientesPorPagina)) {
    if (rutaActual.includes(pagina)) {
        ingredientes.forEach(ingrediente => ObtenerProductos(ingrediente));
    }
}



document.addEventListener("DOMContentLoaded", function() {
    cargarReceta();
});

function cargarReceta() {
    fetch("https://www.themealdb.com/api/json/v1/1/random.php")
        .then(respuesta => respuesta.json())
        .then(datos => {
            const receta = datos.meals[0];
            
            document.getElementById("nombre").textContent = receta.strMeal;

            document.getElementById("tipo").innerHTML= `<strong>Categoría:</strong> ${receta.strCategory}`;
            document.getElementById("Nac").innerHTML=`<strong>Area:</strong> ${receta.strArea}`;
            
            document.getElementById("imagen").src = receta.strMealThumb;

            const listaIngredientes = document.getElementById("ingredientes");
            const cabeceras = `
                <tr>
                    <th>Ingrediente</th>
                    <th>Cantidad</th>
                </tr>
            `;
            listaIngredientes.innerHTML = cabeceras;

            for (let i = 1; i <= 20; i++) {
                const ingrediente = receta[`strIngredient${i}`];
                const medida = receta[`strMeasure${i}`];

                if (ingrediente && ingrediente.trim() !== "") {
                    const fila = document.createElement("tr");
                    const tdIngrediente = document.createElement("td");
                    const tdCantidad = document.createElement("td");
                    
                    tdIngrediente.textContent = ingrediente;
                    tdCantidad.textContent = medida;
                    
                    fila.appendChild(tdIngrediente);
                    fila.appendChild(tdCantidad);
                    listaIngredientes.appendChild(fila);
                }
            }

            const pasos = receta.strInstructions;
            const pasosLista = document.getElementById("pasos");
            pasosLista.innerHTML = ""; 

            const pasosConNumeros = pasos.split("\n").map(paso => paso.trim()).filter(paso => paso.length > 0);
            let pasosNumerados = pasosConNumeros.every(paso => paso.match(/^[0-9]+\./));

            if (pasosNumerados) {
                pasosConNumeros.forEach((paso, index) => {
                    const li = document.createElement("li");
                    li.innerHTML = `👨‍🍳  ${paso}`;
                    pasosLista.appendChild(li);
                });
            } else {
                const pasosArray = pasos.split(".").map(paso => paso.trim()).filter(paso => paso.length > 0);
                pasosArray.forEach((paso, index) => {
                    const li = document.createElement("li");
                    li.innerHTML = `👨‍🍳 ${paso}.`;
                    pasosLista.appendChild(li);
                });
            }
        })
        .catch(error => {
            console.error("Error al obtener la receta:", error);
        });
}
