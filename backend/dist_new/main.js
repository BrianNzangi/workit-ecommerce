"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const core_1 = require("@nestjs/core");
const app_module_1 = require("./app.module");
const cookie_parser_1 = __importDefault(require("cookie-parser"));
async function bootstrap() {
    try {
        const app = await core_1.NestFactory.create(app_module_1.AppModule);
        app.use((0, cookie_parser_1.default)());
        app.enableCors({
            origin: ['http://127.0.0.1:3000', 'http://localhost:3000', 'http://127.0.0.1:3002', 'http://localhost:3002'],
            credentials: true,
        });
        const port = process.env.PORT ?? 3001;
        await app.listen(port);
        console.log(`Backend is running on port ${port}`);
    }
    catch (err) {
        console.error('Error during backend bootstrap:', err);
        process.exit(1);
    }
}
bootstrap();
//# sourceMappingURL=main.js.map