const axios = require('axios');

// Función para esperar un tiempo en milisegundos
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function checkJobStatus(runtime_job_id, runtimeToken) {
  const mlUrl = 'https://us-south.ml.cloud.ibm.com/ml/v4/deployment_jobs';
  let status = 'running';  // Inicializamos el estado como "running"

  try {
    // Hacemos la reconsulta del segundo endpoint hasta que el estado cambie
    while (status === 'running') {
      const mlResponse = await axios.get(mlUrl, {
        params: {
          space_id: process.env.SPACE_ID,
          deployment_id: 'bdf299f5-72fa-4306-9f88-57081437ece2',
          version: '2020-09-01'
        },
        headers: {
          Authorization: `Bearer ${runtimeToken}`
        }
      });

      // Buscar el job de ejecución específico
      const job_execution = mlResponse.data.resources.find((x) => x.metadata.id == runtime_job_id);
      
      if (job_execution) {
        status = job_execution.entity.decision_optimization.status.state;  // Obtener el estado de la ejecución del job
      }

      if (status === 'running') {
        console.log('El job aún está en ejecución, esperando 10 segundos...');
        await sleep(10000);  // Espera de 10 segundos antes de la siguiente reconsulta
      }
    }

    return { status };  // Devolver el estado final
  } catch (error) {
    console.error("❌ Error en checkJobStatusService:", error.response?.data || error);
    throw new Error("Error consultando el estado del job");
  }
}

module.exports = { checkJobStatus };
