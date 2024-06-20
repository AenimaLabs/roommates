const express = require("express");
const fs = require("fs");
const { v4: uuidv4 } = require("uuid");
const axios = require("axios");

const app = express();
const port = 3000;



app.use(express.json());

// Funciones para obtener datos de roommates y gastos
const getRoommates = async () => {
  try {
    const roommatesData = fs.readFileSync("roommates.json", "utf8");
    return JSON.parse(roommatesData);
  } catch (error) {
    console.error("Error al leer roommates.json:", error);
    return [];
  }
};

// const getRoommates = async () => {
//     const res = await fetch("https://randomuser.me/api");
//     const data = await res.json();
//     roommates = data.results.map((user) => {
//       return {
//         nombre: user.name.first,
//         debe: 0,
//         recibe: 0
//       };
//     });
//   };

const getGastos = async () => {
  try {
    const gastosData = fs.readFileSync("gastos.json", "utf8");
    return JSON.parse(gastosData);
  } catch (error) {
    console.error("Error al leer gastos.json:", error);
    return [];
  }
};

// Funciones para guardar roommates y gastos
const saveRoommates = async (roommates) => {
  try {
    fs.writeFileSync("roommates.json", JSON.stringify(roommates, null, 2), "utf8");
  } catch (error) {
    console.error("Error al guardar roommates.json:", error);
  }
};

const saveGastos = async (gastos) => {
  try {
    fs.writeFileSync("gastos.json", JSON.stringify(gastos, null, 2), "utf8");
  } catch (error) {
    console.error("Error al guardar gastos.json:", error);
  }
};


// Rutas para la API REST
app.get("/", async (req, res) => {
  try {
    const html = fs.readFileSync("index.html", "utf8");
    res.send(html);
  } catch (error) {
    console.error("Error al leer index.html:", error);
    res.status(500).send("Error interno del servidor");
  }
});

app.post("/roommate", async (req, res) => {
  try {
    const response = await axios.get("https://randomuser.me/api");
    const roommate = response.data.results[0];
    const newRoommate = {
      id: uuidv4(),
      nombre: `${roommate.name.first} ${roommate.name.last}`,
      debe: 0,
      recibe: 0,
    };
    const roommates = await getRoommates();
    roommates.push(newRoommate);
    await saveRoommates(roommates);
    // res.status(201).send("Roommate agregado exitosamente");
    res.status(201).json({ message: "Roommate agregado exitosamente", roommate: newRoommate });
  } catch (error) {
    console.error("Error al agregar roommate:", error);
    res.status(500).send("Error interno del servidor");
  }
});

app.get("/roommates", async (req, res) => {
  try {
    const roommates = await getRoommates();
    res.json({ roommates });
  } catch (error) {
    console.error("Error al obtener roommates:", error);
    res.status(500).send("Error interno del servidor");
  }
});

app.get("/gastos", async (req, res) => {
  try {
    const gastos = await getGastos();
    res.json({ gastos });
  } catch (error) {
    console.error("Error al obtener gastos:", error);
    res.status(500).send("Error interno del servidor");
  }
});

app.post("/gasto", async (req, res) => {
  try {
    const { roommate, descripcion, monto } = req.body;
    const newGasto = {
      id: uuidv4(),
      roommate,
      descripcion,
      monto,
    };
    const gastos = await getGastos();
    gastos.push(newGasto);
    await saveGastos(gastos);
    res.status(201).send("Gasto agregado exitosamente");
  } catch (error) {
    console.error("Error al agregar gasto:", error);
    res.status(500).send("Error interno del servidor");
  }
});

// app.post("/gasto", async (req, res) => {
//     try {
//       const { roommate, descripcion, monto } = req.body;
  
//       // Validate the incoming data
//       if (!roommate || !descripcion || !monto) {
//         return res.status(400).json({ error: "Faltan datos necesarios" });
//       }
  
//       // Create the new expense object
//       const newGasto = {
//         id: uuidv4(),
//         roommate,
//         descripcion,
//         monto: parseFloat(monto),  // Ensure the amount is a number
//       };
  
//       // Get the existing expenses
//       const gastos = await getGastos();
      
//       // Add the new expense
//       gastos.push(newGasto);
  
//       // Save the updated expenses
//       await saveGastos(gastos);
  
//       res.status(201).json({ message: "Gasto agregado exitosamente", gasto: newGasto });
//     } catch (error) {
//       console.error("Error al agregar gasto:", error);
//       res.status(500).json({ error: "Error interno del servidor" });
//     }
//   });
  

app.put("/gasto", async (req, res) => {
  try {
    const { id } = req.query;
    const { roommate, descripcion, monto } = req.body;
    const gastos = await getGastos();
    const gastoIndex = gastos.findIndex((g) => g.id === id);
    if (gastoIndex !== -1) {
      gastos[gastoIndex] = {
        id,
        roommate,
        descripcion,
        monto,
      };
      await saveGastos(gastos);
      res.status(200).send("Gasto actualizado exitosamente");
    } else {
      res.status(404).send("Gasto no encontrado");
    }
  } catch (error) {
    console.error("Error al actualizar gasto:", error);
    res.status(500).send("Error interno del servidor");
  }
});

app.delete("/gasto", async (req, res) => {
  try {
    const { id } = req.query;
    const gastos = await getGastos();
    const gastoIndex = gastos.findIndex((g) => g.id === id);
    if (gastoIndex !== -1) {
      gastos.splice(gastoIndex, 1);
      await saveGastos(gastos);
      res.status(200).send("Gasto eliminado exitosamente");
    } else {
      res.status(404).send("Gasto no encontrado");
    }
  } catch (error) {
    console.error("Error al eliminar gasto:", error);
    res.status(500).send("Error interno del servidor");
  }
});



// Iniciar el servidor
app.listen(port, () => {
  console.log(`Servidor escuchando en el puerto ${port}`);
});
