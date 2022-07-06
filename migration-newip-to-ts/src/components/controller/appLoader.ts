import Loader from './loader';

class AppLoader extends Loader {
    constructor() {
        super('https://newsapi.org/v2/', {
            apiKey: '829a66c700824e9b8c8efa96b12c8353', // получите свой ключ https://newsapi.org/
        });
    }
}

export default AppLoader;
