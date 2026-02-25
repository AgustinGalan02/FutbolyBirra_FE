import axios from 'axios';

const FOOTBALL_API_KEY = import.meta.env.FOOTBALL_API_KEY;
const API_BASE_URL = import.meta.env.FOOTBALL_API_URL;

const footballApi = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'x-apisports-key': FOOTBALL_API_KEY
  }
});

export const getArgentineTeams = async () => {
  try {
    // League 128
    const response = await footballApi.get('/teams', {
      params: { league: '128', season: '2024' } 
    });
    console.log(response) 
    return response.data.response;
  } catch (error) {
    console.error("Error cargando equipos:", error);
    console.log(response) 
    return [];
  }
};