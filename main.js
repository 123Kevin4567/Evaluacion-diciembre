const solicitud = async function(url) {
  try {
      const respuesta = await fetch(url);
      if (!respuesta.ok) {
          throw new Error("Error al cargar el archivo: " + url);
      }
      const data = await respuesta.json();
      return data;
  } catch (error) {
      console.error("Error al cargar los datos:", error);
      alert("No se pudo cargar el archivo: " + url);
      throw error;
  }
}

const ciudades = async () => await solicitud('http://127.0.0.1:3000/ciudades');
const usuario = async (cityId) => await solicitud(`http://127.0.0.1:3000/usuarios?cityId=${cityId}`);
const materiasUsuario = async (userId) => await solicitud(`http://127.0.0.1:3000/materia_usuario?userId=${userId}`);
const materias = async (ID) => await solicitud(`http://127.0.0.1:3000/materias?id=${ID}`);
const notas = async (subjectUserId) => await solicitud(`http://127.0.0.1:3000/notas?subjectUserId=${subjectUserId}`);

const ejecucion = async () => {
  const ciudad = await ciudades();
  const todosUsuarios = [];
  const usuariosSinMaterias = [];

  const datos = await Promise.all(
      ciudad.map(async (city) => {
          const users = await usuario(city.id);
          const datosUser = await Promise.all(
              users.map(async (user) => {
                  const materUsuario = await materiasUsuario(user.id);
                  
                  if (materUsuario.length === 0) {
                      const usuarioSinMaterias = {
                          ...user, 
                          Materias: "El Alumno no esta matriculado en ninguna materia"
                      };
                      usuariosSinMaterias.push(usuarioSinMaterias);
                      return usuarioSinMaterias;
                  }
                  
                  const materiasDeUser = await Promise.all(
                      materUsuario.map(async (Mat) => {
                          const subjects = await materias(Mat.subjectId);
                          const mark = await notas(Mat.id);
                          
                          let total = 0;
                          mark.forEach(({note}) => total += note);
                          const prom = mark.length > 0 ? total / mark.length : 0;
                          
                          return {
                              ...Mat, 
                              nombre_materia: subjects[0], 
                              notas: mark, 
                              promedio: prom.toFixed(2)
                          };
                      })
                  );

                  const usuarioConMaterias = {...user, Materias: materiasDeUser};
                  todosUsuarios.push(usuarioConMaterias);
                  return usuarioConMaterias;
              })
          );
          
          return { ...city, Usuarios: datosUser };
      })
  );

  const respuesta = {
      todosUsuarios,
      usuariosSinMaterias
  };

  console.log('Todos los usuarios con detalles:', respuesta.todosUsuarios);
  console.log('Usuarios sin materias:', respuesta.usuariosSinMaterias);
  
  return respuesta;
}

ejecucion().catch(error => {
  console.error('Error al cargar los datos:', error);
});




