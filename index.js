const express = require("express");
const path = require("path");
const fs = require("fs").promises;

let rutaArchivo = path.resolve(__dirname, "./content/deportes.json")

const app = express();
const PORT = 3000;

app.listen(PORT, () => {
    console.log("Servidor en http://localhost:" + PORT)
})

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(express.static("public"))

app.post("/deportes", async (req, res) => {
    try {
        let data = JSON.parse(await fs.readFile(rutaArchivo, "utf-8"));
        res.status(200).json({
            mensaje: `Archivo cargado correctamente desde la ruta ${rutaArchivo}.`,
            deportes: data.deportes
        })
    } catch (error) {
        console.log(error);
        res.status(500).json({
            mensaje: `Error al cargar el archivo desde la ruta ${rutaArchivo}.`
        })
    }

})

app.post("/agregar", async (req, res) => {
    try {
        let { nombre, precio } = req.query;
        precio = Number(precio);
        let nuevoDeporte = { nombre, precio };

        if(!nombre){
            return res.status(400).json({
                mensaje: "Debe ingresar al menos el nombre del deporte."
            });
        }

        let data = JSON.parse(await fs.readFile(rutaArchivo, "utf-8"));
        data.deportes.push(nuevoDeporte);
        await fs.writeFile(rutaArchivo, JSON.stringify(data, null, 4), "utf-8");

        res.status(200).json({
            mensaje: `${nombre} agregado correctamente.`,
            deportes: data.deportes
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            mensaje: `Error al agregar el deporte ${nombre}.`
        })
    }

})

app.delete("/eliminar", async (req, res) => {
    try {
        let { nombre } = req.query;

        let data = JSON.parse(await fs.readFile(rutaArchivo, "utf-8"));

        let index = data.deportes.findIndex(deporte => deporte.nombre == nombre)

        data.deportes.splice(index, 1);
        await fs.writeFile(rutaArchivo, JSON.stringify(data, null, 4), "utf-8");

        res.status(200).json({
            mensaje: `${nombre} eliminado correctamente.`,
            deportes: data.deportes
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            mensaje: `Error al eliminar el deporte ${nombre}.`
        })
    }

})

app.put("/editar", async (req, res) => {
    try {
        let { nombre, precio } = req.query;
        precio = Number(precio);

        let data = JSON.parse(await fs.readFile(rutaArchivo, "utf-8"));

        let deporteBuscado = data.deportes.find(deporte => deporte.nombre == nombre);

        if(deporteBuscado.precio == precio){
            return res.status(400).json({
                mensaje: `El precio ingresado debe ser distinto al original.`
            })
        }

        deporteBuscado.precio = precio;

        await fs.writeFile(rutaArchivo, JSON.stringify(data, null, 4), "utf-8");

        res.status(200).json({
            mensaje: `Precio de ${nombre} modificado correctamente.`,
            deportes: data.deportes
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            mensaje: `Error al editar el deporte ${nombre}.`
        })
    }

})

app.get("*", (req, res) => {
    res.status(404).sendFile(path.resolve(__dirname, "./public/404.html"))
})