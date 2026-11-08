import { Service } from '@angular/core';
import { Session } from '../../models/session.model';

@Service()
export class TokenStorage {
    private readonly SESSION_KEY = 'worklink_session'

    saveSession(session : Session) : void{
        localStorage.setItem(this.SESSION_KEY, JSON.stringify(session))
    }

    getSession(): Session | null {
        const raw = localStorage.getItem(this.SESSION_KEY)
        return raw ? JSON.parse(raw) : null
    }

    getToken(): string | null {
        return this.getSession()?.token ?? null;
    }

    getJwtRol(): string | null {
        const token = this.getToken()
        if (!token) return null
        try {
            const parts = token.split('.')
            if (parts.length < 2) return null
            const payload = JSON.parse(atob(parts[1]))
            return payload.rol || payload.role || payload.authorities?.[0] || payload.scope || null
        } catch {
            return null
        }
    }

    clear() : void{
        localStorage.removeItem(this.SESSION_KEY)
    }
}
