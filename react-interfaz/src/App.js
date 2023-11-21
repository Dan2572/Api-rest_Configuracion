import React, { useState, useEffect } from 'react';
import axios from 'axios';
import jsPDF from 'jspdf';
import Modal from 'react-modal';
import swal from 'sweetalert';


import './App.css';

Modal.setAppElement('#root');

function App() {
  const [configuraciones, setConfiguraciones] = useState([]);
  const [originalConfiguraciones, setOriginalConfiguraciones] = useState([]);
  const [nuevaConfiguracion, setNuevaConfiguracion] = useState({
    rol: [],
    permisos: [],
    nombre: '',
    correo: '',
    documento: 0,
    contraseña: '',
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
        setOriginalConfiguraciones(response.data); // Almacena el estado original
      })
      .catch((error) => {
        console.error('Error fetching data:', error);
      });
  }, []);

   const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    // Validación: Permitir solo letras en el nombre
    if (name === 'nombre' && !/^[A-Za-z]+$/.test(value)) {
      return;
    }
    
    setNuevaConfiguracion({ ...nuevaConfiguracion, [name]: value });
    
  };


  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      const filtered = originalConfiguraciones.filter((configuracion) =>
        String(configuracion.documento).toLowerCase().includes(searchTerm.toLowerCase())
      );
      setConfiguraciones(filtered);
    }
  };
  
  const resetSearch = () => {
    setSearchTerm('');
    setConfiguraciones(originalConfiguraciones);
  };

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = configuraciones.slice(indexOfFirstItem, indexOfLastItem);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

 
  const validarCorreo = () => {
    const correoValido =
      /^[A-Za-z0-9._%+-]+@(gmail\.com|hotmail\.com)$/i.test(nuevaConfiguracion.correo) ||
      nuevaConfiguracion.correo === ''; // Permitir campo vacío

    if (!correoValido) {
      swal('Error', 'Por favor, ingresa un correo válido (gmail.com o hotmail.com).', 'error');
    }
    return correoValido;
  };

  const crearConfiguracion = () => {
    if (!validarCorreo()) {
      return;
    }

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
        contraseña: '',
        estado_usuario: true,
      });
      setModalIsOpen(false);
     })
    .catch((error) => {
      console.error('Error creating configuracion:', error);
    });
};

  const agregarPermiso = () => {
    setNuevaConfiguracion({
      ...nuevaConfiguracion,
      permisos: [
        ...nuevaConfiguracion.permisos,
        { nombre_permiso: '', estado_permiso: true },
      ],
    });
  };

  const eliminarUltimoPermiso = () => {
    const nuevosPermisos = [...nuevaConfiguracion.permisos];
    nuevosPermisos.pop(); // Elimina el último permiso del array
    setNuevaConfiguracion({
      ...nuevaConfiguracion,
      permisos: nuevosPermisos,
    });
  };

  const editarConfiguracion = () => {
      if (!nuevaConfiguracion.nombre || !nuevaConfiguracion.correo || !nuevaConfiguracion.documento || !nuevaConfiguracion.contraseña) {
    alert('Todos los campos son obligatorios. Por favor, completa la información.');
    return;
  }

  if (isNaN(nuevaConfiguracion.documento) || isNaN(nuevaConfiguracion.contraseña)) {
    alert('El documento y la contraseña deben ser números.');
    return;
  }
    axios
      .put(`http://localhost:9000/api/gestion_configuracion/${nuevaConfiguracion._id}`, nuevaConfiguracion)
      .then((response) => {
        // Actualizar el estado de configuraciones manualmente
        const index = configuraciones.findIndex((config) => config._id === nuevaConfiguracion._id);
        const nuevasConfiguraciones = [...configuraciones];
        nuevasConfiguraciones[index] = response.data;
        setConfiguraciones(nuevasConfiguraciones);
        setModalIsOpen(false);
      })
      .catch((error) => {
        console.error('Error editando configuración:', error);
      });
  };
  
  

  const handleEditarConfiguracion = (configuracion) => {
    setNuevaConfiguracion({ ...configuracion });
    setModalIsOpen(true);
  };
  
 const handleEliminarConfiguracion = (configuracionId) => {
    // Confirmación antes de eliminar con sweetalert
    swal({
      title: '¿Estás seguro?',
      text: 'Una vez eliminada, no podrás recuperar esta configuración.',
      icon: 'warning',
      buttons: ['Cancelar', 'Eliminar'],
      dangerMode: true,
    }).then((willDelete) => {
      if (willDelete) {
        axios
          .delete(`http://localhost:9000/api/gestion_configuracion/${configuracionId}`)
          .then((response) => {
            setConfiguraciones(configuraciones.filter((config) => config._id !== configuracionId));
            swal('Éxito', 'La configuración se ha eliminado correctamente.', 'success');
          })
          .catch((error) => {
            console.error('Error deleting configuracion:', error);
            swal('Error', 'Hubo un problema al eliminar la configuración. Inténtalo de nuevo.', 'error');
          });
      } else {
        swal('La configuración no se ha eliminado.');
      }
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
      <button onClick={resetSearch}>Mostrar Todos</button>

      <button onClick={() => setModalIsOpen(true)}>Agregar Nueva Configuración</button>

      <table>
        <thead>
          <tr>
            <th>id</th>
            <th>Rol</th>
            <th>Nombre</th>
            <th>Correo</th>
            <th>Documento</th>
            <th>Contraseña</th>
            <th>Estado de Usuario</th>
            <th>Permisos</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {currentItems.map((configuracion) => (
            <tr key={configuracion._id}>
              <td>{configuracion._id}</td>
              <td>{configuracion.rol.map((r) => r.nombre_rol).join(', ')}</td>
              <td>{configuracion.nombre}</td>
              <td>{configuracion.correo}</td>
              <td>{configuracion.documento}</td>
              <td>{configuracion.contraseña}</td>
              <td>{configuracion.estado_usuario ? 'Activo' : 'Inactivo'}</td>
              <td>{configuracion.permisos.map((p) => p.nombre_permiso).join(', ')}</td>
              <td>
                <button onClick={() => handleEditarConfiguracion(configuracion)}>Editar</button>
                <button onClick={() => handleEliminarConfiguracion(configuracion._id)}>Eliminar</button>
              </td>
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
        <h2>{nuevaConfiguracion._id ? 'Editar Configuración' : 'Agregar Nueva Configuración'}</h2>
        <form onSubmit={nuevaConfiguracion._id ? editarConfiguracion : crearConfiguracion}>
        <div>
            <label>Selecciona un rol:</label>
            <select
              name="rol"
              onChange={(e) =>
                setNuevaConfiguracion({
                  ...nuevaConfiguracion,
                  rol: { nombre_rol: e.target.value, estado_rol: true },
                })
              }
            >
              <option value="">-- Seleccione un Rol --</option>
              <option value="administrador" selected={nuevaConfiguracion.rol.nombre_rol === 'administrador'}>
                Administrador
              </option>
              <option value="cliente" selected={nuevaConfiguracion.rol.nombre_rol === 'cliente'}>
                Cliente
              </option>
            </select>
          </div>
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

          <label>Documento:</label>
          <input
            type="number"
            placeholder="Documento"
            name="documento"
            value={nuevaConfiguracion.documento}
            onChange={handleInputChange}
          />

          <input
            type="text"
            placeholder="Contraseña"
            name="contraseña"
            value={nuevaConfiguracion.contraseña}
            onChange={handleInputChange}
          />

          <div>
            <label>Permisos:</label>
            {nuevaConfiguracion.permisos.map((permiso, index) => (
              <div key={index}>
                <input
                  type="text"
                  placeholder="Escribe el nombre del permiso"
                  value={permiso.nombre_permiso}
                  onChange={(e) => {
                    const nuevosPermisos = [...nuevaConfiguracion.permisos];
                    nuevosPermisos[index] = {
                      nombre_permiso: e.target.value,
                      estado_permiso: true,
                    };
                    setNuevaConfiguracion({
                      ...nuevaConfiguracion,
                      permisos: nuevosPermisos,
                    });
                  }}
                />
              </div>
            ))}
            <button type="button" onClick={() => agregarPermiso()}>Agregar Permiso</button>
            <button type="button" onClick={() => eliminarUltimoPermiso()}>Eliminar Último Permiso</button>
          </div>


          <button type="submit">{nuevaConfiguracion._id ? 'Editar Configuración' : 'Crear Configuración'}</button>
        </form>


      </Modal>

    </div>
  );
}

export default App;
