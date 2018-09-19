import * as passport from 'passport';
import {Strategy as LocalStrategy} from 'passport-local';
import {Client} from "./clients/Client";
import {Admin} from "./clients/Admin";

type doneFunction = (error: any, result: Client) => any;

const authConfig = {
    successRedirect: '/',
    failureRedirect: '/login'
};

const admin = new Admin();

export class AuthController {

    constructor() {
        passport.serializeUser((user: any, done: any) => {
            done(null, user.login);
        });

        passport.deserializeUser((id, done) => {
            done(null, admin);
        });
    }

    authenticate(): any {
        return passport.authenticate('local', authConfig);
    }

    middleware(): LocalStrategy {
        return new LocalStrategy((username: string, password: string, done: doneFunction) => {
            const result = this.findUser(username, password);

            return done(null, result);
        })
    }

    private findUser(username: string, password: string): any {
        if (username === 'admin' && password === 'admin') {
            return {isAdmin: true, login: 'admin'};
        }

        return;
    }

}