const express = require("express")
const cors = require("cors")
const body_parse = require("body-parser")
const path = require("path")
const reservasService = require("./reservasService.js")

const app = express()
const port = 8082


app.use(cors())
app.use(body_parse.json())

const pathName = "/reservas"


app.get(pathName,
    (req, res)=>{
        console.log("Recibimos peticion")
        console.log(req)
        res.send(reservasService.reservasgetExport())
}
)


app.get(pathName+"pendientes/idcliente",
    (req, res)=>{
        console.log("Recibimos Petición")
        console.log(req)
        idcliente = req.query.id
        res.send(reservasService.reservasPendientesIdgetExport(id))
}
)

app.post(pathName,
    async (req, res)=>{
        console.log("Recibimos peticion")
        console.log(req.body)
        let reservas = await reservasService.reservasSetExport(req.body)
        res.send({"mensaje":"Reserva Guardada","reservas":reservas})
}
)
app.delete(pathName,
(req, res)=>{
    console.log("Recibimos peticion")
    let id =req.query.id
    console.log(id)
    let reservas = reservasService.reservasDeleteExport(id)
    res.send({"mensaje":"reserva Guardada","reservas":reservas})
    }
)

app.put(pathName,
    (req, res)=>{
        console.log("Recibimos peticion")
        console.log(req.body)
        res.send("Finalizada")
}
)

app.patch(pathName+"/reservas/estado",
    (req, res)=>{
        console.log("Recibimos peticion")
        console.log(req.body)
        res.send(reservasService.setEstadoReservaExport(req.body))
}
)

app.listen(port, 
    ()=>{
        console.log("Subio el app reserva en el puerto "+port)
    }
)