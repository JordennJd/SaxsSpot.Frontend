import axios from 'axios';

// Вариант 1: Жёстко заданный URL
axios.defaults.baseURL = 'http://localhost:5062/api';

// Дополнительные настройки (опционально)
axios.defaults.timeout = 10000;
axios.defaults.headers.common['Accept'] = 'application/json';