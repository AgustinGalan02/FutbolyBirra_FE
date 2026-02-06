import axios from 'axios';

const footballApi = axios.create({
  baseURL: 'https://v3.football.api-sports.io',
  headers: {
    'x-apisports-key': '116cfd8d9e3257cb8c232951a15f7f13'
  }
});

export const getArgentineTeams = async () => {
  try {
    // League 128
    const response = await footballApi.get('/teams', {
      params: { league: '128', season: '2024' } 
    });
    return response.data.response;
  } catch (error) {
    console.error("Error cargando equipos:", error);
    return [];
  }
};