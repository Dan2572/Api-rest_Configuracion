import React, { useState, useEffect } from 'react';
import axios from 'axios';
import jsPDF from 'jspdf';
import Modal from 'react-modal';
import './App.css';

Modal.setAppElement('#root');

function App() {
  const [configuraciones, setConfiguraciones] = useState([]);
  const [nuevaConfiguracion, setNuevaConfiguracion] = useState({
    rol: [],
    permisos: [],
    nombre: '',
    correo: '',
    documento: 0,
    contraseña: 0,
    estado_usuario: true,
  });
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(4);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    axios
      .get('http://localhost:9000/api/gestion_configuracion')
      .then((response) => {
        setConfiguraciones(response.data);
      })
      .catch((error) => {
        console.error('Error fetching data:', error);
      });
  }, []);

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      const filtered = configuraciones.filter((configuracion) =>
        configuracion.documento.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setConfiguraciones(filtered);
    }
  };

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = configuraciones.slice(indexOfFirstItem, indexOfLastItem);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNuevaConfiguracion({ ...nuevaConfiguracion, [name]: value });
  };

  const crearConfiguracion = () => {
    axios
      .post('http://localhost:9000/api/gestion_configuracion', nuevaConfiguracion)
      .then((response) => {
        setConfiguraciones([...configuraciones, response.data]);
        setNuevaConfiguracion({
          rol: [],
          permisos: [],
          nombre: '',
          correo: '',
          documento: 0,
          contraseña: 0,
          estado_usuario: true,
        });
        setModalIsOpen(false);
      })
      .catch((error) => {
        console.error('Error creating configuracion:', error);
      });
  };

  const generarReportePDF = () => {
    if (Array.isArray(currentItems)) {
      const doc = new jsPDF();
      let y = 15;

      doc.text('Reporte de Configuraciones', 15, 10);

      currentItems.forEach((configuracion) => {
        doc.text(`Nombre: ${configuracion.nombre}`, 15, y);
        doc.text(`Correo: ${configuracion.correo}`, 15, y + 10);
        doc.text(`Documento: ${configuracion.documento}`, 15, y + 20);
        doc.text(`Contraseña: ${configuracion.contraseña}`, 15, y + 30);
        doc.text(`Estado de Usuario: ${configuracion.estado_usuario ? 'Activo' : 'Inactivo'}`, 15, y + 40);
        doc.text(`Roles: ${configuracion.rol.map((r) => r.nombre_rol).join(', ')}`, 15, y + 50);
        doc.text(`Permisos: ${configuracion.permisos.map((p) => p.nombre_permiso).join(', ')}`, 15, y + 60);

        y += 80;
        if (y >= 280) {
          doc.addPage();
          y = 15;
        }
      });

      doc.save('reporte_configuraciones.pdf');
    } else {
      console.error('currentItems no es un array:', currentItems);
    }
  };

  return (
    <div>
      <h1>Configuraciones</h1>
      <input
        type="text"
        placeholder="Buscar por documento"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        onKeyPress={handleKeyPress}
      />

      <button onClick={() => setModalIsOpen(true)}>Agregar Nueva Configuración</button>

      <table>
        <thead>
          <tr>
            <th>Nombre</th>
            <th>Correo</th>
            <th>Documento</th>
            <th>Contraseña</th>
            <th>Estado de Usuario</th>
            <th>Roles</th>
            <th>Permisos</th>
          </tr>
        </thead>
        <tbody>
          {currentItems.map((configuracion) => (
            <tr key={configuracion._id}>
              <td>{configuracion.nombre}</td>
              <td>{configuracion.correo}</td>
              <td>{configuracion.documento}</td>
              <td>{configuracion.contraseña}</td>
              <td>{configuracion.estado_usuario ? 'Activo' : 'Inactivo'}</td>
              <td>{configuracion.rol.map((r) => r.nombre_rol).join(', ')}</td>
              <td>{configuracion.permisos.map((p) => p.nombre_permiso).join(', ')}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="pagination">
        {Array.from({ length: Math.ceil(configuraciones.length / itemsPerPage) }, (_, index) => (
          <button key={index + 1} onClick={() => paginate(index + 1)}>
            {index + 1}
          </button>
        ))}
      </div>

      <button onClick={generarReportePDF}>Generar Reporte PDF</button>

      <Modal
        isOpen={modalIsOpen}
        onRequestClose={() => setModalIsOpen(false)}
      >
        <h2>Agregar Nueva Configuración</h2>
        <form onSubmit={crearConfiguracion}>
          <input
            type="text"
            placeholder="Nombre"
            name="nombre"
            value={nuevaConfiguracion.nombre}
            onChange={handleInputChange}
          />

          <input
            type="text"
            placeholder="Correo"
            name="correo"
            value={nuevaConfiguracion.correo}
            onChange={handleInputChange}
          />

          <input
            type="number"
            placeholder="Documento"
            name="documento"
            value={nuevaConfiguracion.documento}
            onChange={handleInputChange}
          />

          <input
            type="number"
            placeholder="Contraseña"
            name="contraseña"
            value={nuevaConfiguracion.contraseña}
            onChange={handleInputChange}
          />

          <div>
            <p>Selecciona un rol:</p>
            <select
              name="rol"
              onChange={(e) =>
                setNuevaConfiguracion({
                  ...nuevaConfiguracion,
                  rol: [{ nombre_rol: e.target.value, estado_rol: true }],
                })
              }
            >
              <option value="administrador">Administrador</option>
              <option value="cliente">Cliente</option>
            </select>
          </div>

          {/* Aquí puedes agregar la lógica para mostrar un modal de permisos */}
          {/* y permitir la selección de permisos al agregar y editar configuración */}

          <button type="submit">Crear Configuración</button>
        </form>
      </Modal>
    </div>
  );
}

export default App;
