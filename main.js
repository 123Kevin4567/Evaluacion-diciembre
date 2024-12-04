const solicitud = async (url) => {
    const respuesta = await fetch(url);
    return await respuesta.json();
  };
  

  const usuarios = async () => await solicitud('http://127.0.0.1:3000/usuarios');
  const ciudades = async () => await solicitud('http://127.0.0.1:3000/ciudades');
  const materias = async () => await solicitud('http://127.0.0.1:3000/materias');
  const notas = async () => await solicitud('http://127.0.0.1:3000/notas');
  const materiaUsuario = async () => await solicitud('http://127.0.0.1:3000/materia_usuario');

  const cargar = async () => {

    const users = await usuarios();
    const ciudadecitas = await ciudades();
    const subjects = await materias();
    const grades = await notas();
    const userSubjects = await materiaUsuario();
  

    const cityMap = ciudadecitas.reduce((acc, city) => {
      acc[city.id] = city.name;
      return acc;
    }, {});
  

    const subjectMap = userSubjects.reduce((acc, item) => {
      if (!acc[item.userId]) acc[item.userId] = [];
      acc[item.userId].push(item.subjectId);
      return acc;
    }, {});
  

    const gradeMap = grades.reduce((acc, grade) => {
      if (!acc[grade.userId]) acc[grade.userId] = [];
      acc[grade.userId].push(grade.note);
      return acc;
    }, {});
  

    const respuesta = await Promise.all(
      users.map(async (user) => {
  
        const ciudad = cityMap[user.cityId];
  

        const materiasDelUsuario = (subjectMap[user.id] || []).map(subjectId => {
          return subjects.find(subject => subject.id === subjectId);
        });
  

        const notasUsuario = gradeMap[user.id] || [];
        const promedioNota = notasUsuario.length > 0
          ? (notasUsuario.reduce((sum, nota) => sum + nota, 0) / notasUsuario.length).toFixed(2)
          : 'No disponible';
  

        const sinMaterias = materiasDelUsuario.length === 0;
  

        return {...user,ciudad: ciudad,materias: materiasDelUsuario,promedio: promedioNota,sinMaterias,
        };
      })
    );
  

    const usuariosSinMaterias = respuesta.filter(user => user.sinMaterias);
  
    return {
      todosUsuarios: respuesta,
      usuariosSinMaterias: usuariosSinMaterias,
    };
  };
  

  cargar().then(respuesta => {
    console.log('Todos los usuarios con detalles:', respuesta.todosUsuarios);
    console.log('Usuarios sin materias:', respuesta.usuariosSinMaterias);
  }).catch(error => {
    console.error('Error al cargar los datos:', error);
  });





