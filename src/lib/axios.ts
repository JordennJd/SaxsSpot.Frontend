import axios from 'axios';


export const nanosystemApiClient = axios.create({
    baseURL: 'http://localhost:5062/api',
    timeout: 10000,
    headers: {
        'Accept': 'application/json'
    }
});

export const calculationApiClient = axios.create({
    baseURL: 'http://localhost:5067/api',
    timeout: 10000,
    headers: {
        'Accept': 'application/json'
    }
});

export const jobApiClient = axios.create({
    baseURL: 'http://localhost:8080',
    timeout: 5000,
    headers: {
        'Accept': 'application/json',
        'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiYWRtaW4iOnRydWUsImlhdCI6MTUxNjIzOTAyMn0.KMUFsIDTnFmyG3nMiGM6H9FNFUROf3wh7SmqJp-QV30' // если нужно
    }
});