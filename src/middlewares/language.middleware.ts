import { Request, Response, NextFunction } from "express";
import i18n from "../config/i18n";

const languageMiddleware = (req: Request, res: Response, next: NextFunction) => {
    const preferredLanguage = req.headers["preferred-language"] as string;

    if (preferredLanguage && i18n.getLocales().includes(preferredLanguage)) {
        req.setLocale(preferredLanguage);
    } 

    next();
};

export default languageMiddleware;
