import * as passport from 'passport';
import * as dotenv from 'dotenv';
import {Strategy as CookieStrategy} from 'passport-cookie';
import {Strategy as LocalStrategy} from 'passport-local';
import {Client} from "./clients/Client";
import {Admin} from "./clients/Admin";

type doneFunction = (error: any, result: Client) => any;

const config = dotenv.config({path: './.data/.env'});

const localConfig = {
};

const cookieConfig = {
    session: false,
    signed: true
};

const admin = new Admin();

export class AuthController {

    sessions = new Map<string, any>();
    lastToken = '';

    constructor() {
        passport.serializeUser((user: any, done: any) => {
            done(null, user.login);
        });

        passport.deserializeUser((id, done) => {
            done(null, admin);
        });
    }

    authenticate(): any {
        return passport.authenticate('local', localConfig);
    }

    checkAuth(): any {
        return passport.authenticate('cookie', cookieConfig);
    }

    localMiddleware(): LocalStrategy {
        return new LocalStrategy((username: string, password: string, done: doneFunction) => {
            const result = this.findUser(username, password);

            this.lastToken = Math.random().toString(36).substr(2);

            if (result) {
                this.sessions.set(this.lastToken, result);
            }

            return done(null, result);
        });
    }

    cookiesMiddleware(): CookieStrategy {
        return new CookieStrategy(cookieConfig, (token: string, done: doneFunction) => {
            const result = this.sessions.get(token);

            return done(null, result);
        });
    }

    private findUser(username: string, password: string): any {
        if (username === 'admin' && password === config.parsed.ADMIN_PASSWORD) {
            return {isAdmin: true, login: 'admin'};
        }

        return;
    }

}