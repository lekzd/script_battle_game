import {Observable} from 'rxjs/index';
import {fromPromise} from 'rxjs/internal/observable/fromPromise';
import {switchMap} from 'rxjs/internal/operators';
import {IState} from './state.model';
import {Inject} from './InjectDectorator';
import {Environment} from './Environment';

export class ApiService {

    @Inject(Environment) private environment: Environment;

    getLeaderBoard(): Observable<IState[]> {
        return this.get<IState[]>('/leaderboard');
    }

    private get<T>(url: string): Observable<T> {
        return fromPromise<Response>(fetch(`${this.environment.config.api}${url}`))
            .pipe(
                switchMap<Response, T>(reponse => fromPromise(reponse.json()))
            );
    }

}