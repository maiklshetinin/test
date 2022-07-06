import AppLoader from './appLoader';
import { RequestParams } from '../types/loader';
import { IAppView } from '../types/appView';

class AppController extends AppLoader {
    getSources(callback: (data?: IAppView) => void) {
        super.getResp(
            {
                endpoint: RequestParams.sources,
            },
            callback
        );
    }

    getNews(e: Event, callback: (data?: IAppView) => void) {
        let target = e.target as HTMLElement;
        const newsContainer = e.currentTarget as HTMLElement;

        while (target !== newsContainer) {
            if (target.classList.contains('source__item')) {
                const sourceId = target.getAttribute('data-source-id') as string;
                if (newsContainer.getAttribute('data-source') !== sourceId) {
                    newsContainer.setAttribute('data-source', sourceId);
                    super.getResp(
                        {
                            endpoint: RequestParams.everything,
                            options: {
                                sources: sourceId,
                            },
                        },
                        callback
                    );
                }
                return;
            }
            target = target.parentNode as HTMLElement;
        }
    }
}

export default AppController;
