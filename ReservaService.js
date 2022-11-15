const getMongo = require("./mongodb.js")
let request = require("axios")

async function getConexiones() {
    const nameDb = "aerolineaG1y2"
    const client = await getMongo.getClientnExport(nameDb)
    const collection = await getMongo.getCollectionExport(client, nameDb)
    return { collection, client }
}

const reservasGet = async (idcliente) =>{
    const { collection, client } = await getConexiones()
    const reservas = collection.find({"idcliente":idcliente})
    const reservasList = await reservas.toArray()
    await getMongo.closeClientExport(client)
    return reservasList
}

const setEstadoReserva = async(reservaPago) =>{
    const { collection, client } = await getConexiones()
    
    /*for(let i = 0; i < reservas.length; i++){
        if(reservas[i].id === reservaPago.idreserva){
            reservas[i].estadoPago = reservaPago.estadoReserva
            i = reservas.length
        }
    }*/

    collection.updateOne({"_id":reservaPago.idreserva},{"$set":{"estadoPago":reservaPago.estadoReserva}})
    await getMongo.closeClientExport(client)
    return "Reserva con pago confirmado"
}

const reservasSet = async (reserva) =>{
    const { collection, client } = await getConexiones()
    console.log("llama a reserva a guadar")
    const vuelo = request.get(
        "http:localhost:8081/vuelos/id/?id="+reserva.idvuelo
    )

    const cliente = request.get(
        "http:localhost:8082/clientes/id/?id="+reserva.idcliente
    )

    const reservaVuelo = request.patch(
        "http:localhost:8081/vuelos/sillas?id="+reserva.idvuelo,
        reserva.sillas
    )

    await request.all([vuelo,cliente,reservaVuelo])
    .then(
        (res)=>{
            console.log("recibimos llamada del vuelo")
            console.log(res[0].data)
            console.log(res[1].data)
            console.log(res[2].data)
            reserva.vuelo = res[0].data
            reserva.cliente = res[1].data
            reserva.mensaje = res[2].data
        }
    )
    .catch(
        (res)=>{
            console.log("Error")
        }
    )

    for(let i = 0; i < reserva.sillas.length; i++ ){
        reserva.sillas[i].cancelada = true
    }

    console.log(reserva)

    await collection.insertOne(reserva).then(
        (resultado)=>{
            console.log(resultado)
        }
    )

    await getMongo.closeClientExport(client)

    return reserva

}
    

const reservasDelete = (id) =>{
    console.log(reservas)
    reservas = reservas.filter((vuel)=>{
        return vuel.id != id
    }
    )
    console.log(reservas)
    return reservas
}

const reservasPendientesIdget = async (idcliente) =>{
    const { collection, client } = await getConexiones()
    const reservasCliente = collection.find({"estadoPago":"Pendiente","idcliente":idcliente})
    const reservasClienteList = reservasCliente.toArray()
    await getMongo.closeClientExport(client)
    return reservasClienteList
}

    const reservasACancelar = async () =>{
        const { collection, client } = await getConexiones()
        const reservasCanceladas = collection.find({"estadoPago":"Pendiente"})
        const reservasCanceladaslist = await reservasCanceladas.toArray()
        for (let i = 0 ; i < reservasCanceladaslist.length; i++) {
            let reserva = reservasCanceladaslist[i]
            await request.patch(
                "http://localhost:8081/vuelos/sillas?id="+reserva.idvuelo,
                reserva.sillas
            ).then(
                async()=> {
                    await collection.updateOne({"_id":reserva._id},{"$set":{"estadoPago":"Cancelada"}})
                }
            )
        };
        await getMongo.closeClientExport(client)
        return "Reservas Canceladas"
            
            
    }
    

module.exports.reservasgetExport = reservasGet;
module.exports.reservasSetExport = reservasSet;
module.exports.reservasDeleteExport = reservasDelete;
module.exports.reservasPendientesIdgetExport = reservasPendientesIdget;
module.exports.setEstadoReservaExport = setEstadoReserva;
module.exports.reservasACancelarExport = reservasACancelar;