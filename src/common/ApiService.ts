import {Observable} from 'rxjs/index';
import {fromPromise} from 'rxjs/internal/observable/fromPromise';
import {pluck, switchMap} from 'rxjs/internal/operators';
import {IState} from './state.model';
import {Inject} from './InjectDectorator';
import {Environment} from './Environment';
import {Room} from "../../server/Room";
import {RoomModel} from "../../server/models/RoomModel";

export class ApiService {

    @Inject(Environment) private environment: Environment;

    getLeaderBoard(): Observable<IState[]> {
        return this.get<IState[]>('/leaderboard');
    }

    createRoom(name: string): Observable<void> {
        return this.post<void>(`/rooms/${name}`).pipe(pluck('result'));
    }

    getRoom(name: string): Observable<RoomModel> {
        return this.get<RoomModel>(`/rooms/${name}`).pipe(pluck('result'));
    }

    deleteRoom(name: string): Observable<void> {
        return this.delete<void>(`/rooms/${name}`).pipe(pluck('result'));
    }

    getAllRooms(): Observable<{[key: string]: RoomModel}> {
        return this.get<{[key: string]: RoomModel}>(`/rooms`).pipe(pluck('result'));
    }

    private get<T>(url: string): Observable<T> {
        return this.makeRequest<T>('GET', url);
    }

    private post<T>(url: string, body?: any): Observable<T> {
        return this.makeRequest<T>('POST', url, body);
    }

    private put<T>(url: string, body?: any): Observable<T> {
        return this.makeRequest<T>('PUT', url, body);
    }

    private delete<T>(url: string): Observable<T> {
        return this.makeRequest<T>('DELETE', url);
    }

    private makeRequest<T>(method: string, url: string, body?: any): Observable<T> {
        const fetchPromise = fetch(`${this.environment.config.api}${url}`, {method, body});

        return fromPromise<Response>(fetchPromise)
            .pipe(
                switchMap<Response, T>(reponse => fromPromise(reponse.json()))
            );
    }

}