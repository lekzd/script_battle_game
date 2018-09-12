import {Observable, of, throwError} from 'rxjs/index';
import {fromPromise} from 'rxjs/internal/observable/fromPromise';
import {pluck, switchMap} from 'rxjs/internal/operators';
import {IState} from './state.model';
import {Inject} from './InjectDectorator';
import {Environment} from './Environment';
import {RoomModel} from "../../server/models/RoomModel";
import {IApiFullResponse} from '../../server/models/IApiFullResponse.model';

export class ApiService {

    @Inject(Environment) private environment: Environment;

    getLeaderBoard(): Observable<IState[]> {
        return this.get<IState[]>('/leaderboard').pipe(pluck('result'));
    }

    createRoom(id: string, title: string, token: string): Observable<void> {
        return this.post<void>(`/rooms/${id}`, {title, token}).pipe(pluck('result'));
    }

    getRoom(name: string): Observable<RoomModel> {
        return this.get<RoomModel>(`/rooms/${name}`).pipe(pluck('result'));
    }

    deleteRoom(name: string, token: string): Observable<void> {
        return this.delete<void>(`/rooms/${name}?token=${token}`).pipe(pluck('result'));
    }

    getAllRooms(): Observable<{[key: string]: RoomModel}> {
        return this.get<{[key: string]: RoomModel}>(`/rooms`).pipe(pluck('result'));
    }

    reloadRoomSession(id: string, token: string): Observable<string> {
        return this.post(`/rooms/${id}/reload`, {token}).pipe(pluck('result'));
    }

    private get<T>(url: string): Observable<T> {
        return this.makeRequest<T>('GET', url);
    }

    private post<T>(url: string, body?: any): Observable<T> {
        return this.makeRequest<T>('POST', url, JSON.stringify(body));
    }

    private put<T>(url: string, body?: any): Observable<T> {
        return this.makeRequest<T>('PUT', url, JSON.stringify(body));
    }

    private delete<T>(url: string): Observable<T> {
        return this.makeRequest<T>('DELETE', url);
    }

    private makeRequest<T>(method: string, url: string, body?: any): Observable<T> {
        const headers = new Headers({
            'content-type': 'application/json'
        });

        const fetchPromise = fetch(`${this.environment.config.api}${url}`, {method, body, headers});

        return fromPromise<Response>(fetchPromise)
            .pipe(
                switchMap<Response, IApiFullResponse>(reponse => fromPromise(reponse.json())),
                switchMap<IApiFullResponse, T>(response => {
                    if (response.success) {
                        return of(response);
                    }

                    return throwError(response);
                })
            );
    }

}