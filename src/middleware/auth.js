import { verifyFirebaseToken } from '../utils/firebase.js';
export function enforceRole(requiredRole) {
    return async (req, res, next) => {
        const token = req.headers.authorization;
        const user = await verifyFirebaseToken(token);
        if (!user.roles.includes(requiredRole)) {
            return res.status(403).json({ error: 'Access denied' });
        }
        next();
    };
}
//# sourceMappingURL=auth.js.map