const express = require("express");
const configuracionSchema = require("../models/configuracion");
const router = express.Router();
const PDFDocument = require("pdfkit");
const ExcelJS = require("exceljs");

//get all configurations
router.get("/gestion_configuracion", (req, res) => {
    configuracionSchema
        .find()
        .then((data) => res.json(data))
        .catch((error) => res.json({message: error}))
});

//get a configuration
router.get("/gestion_configuracion/:id", (req, res) => {
    const { id } = req.params;
    configuracionSchema
        .findById(id)
        .then((data) => res.json(data))
        .catch((error) => res.json({message: error}))
});

// create configuration
router.post("/gestion_configuracion", (req, res) => {
    const { rol, permisos, nombre, correo, documento, contraseña, estado_usuario } = req.body;
    const configuracion = new configuracionSchema({ rol, permisos, nombre, correo, documento, contraseña, estado_usuario });

    configuracion
        .save()
        .then((data) => res.json(data))
        .catch((error) => res.json({ message: error }));
});

// update a configuration
router.put("/gestion_configuracion/:id", (req, res) => {
    const { id } = req.params;
    const { rol, permisos, nombre, correo, documento, contraseña, estado_usuario } = req.body;
    configuracionSchema
        .updateOne({ _id: id }, { $set: { rol, permisos, nombre, correo, documento, contraseña, estado_usuario } })
        .then((data) => res.json(data))
        .catch((error) => res.json({ message: error }));
});
//delete a configuration
router.delete("/gestion_configuracion/:id", (req, res) => {
    const { id } = req.params;
    configuracionSchema
      .deleteOne({ _id: id })
      .then((data) => res.json(data))
      .catch((error) => res.json({ message: error }));
  });

module.exports = router;