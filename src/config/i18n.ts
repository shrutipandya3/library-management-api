import { I18n } from "i18n";
import path from "path";

const i18n = new I18n({
    locales: ["en", "hi"],
    directory: path.join(__dirname, "..", "translation"),
    defaultLocale: "en",
    objectNotation: true,
});

export default i18n;
