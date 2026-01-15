"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function () { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function () { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var client_1 = require("@prisma/client");
var bcrypt_1 = require("bcrypt");
var prisma = new client_1.PrismaClient();
function main() {
    return __awaiter(this, void 0, void 0, function () {
        var settings, _i, settings_1, setting, adminEmail, adminPassword, passwordHash, standardShipping, expressShipping;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    settings = [
                        // General
                        { key: 'general.site_name', value: 'WorkIt Store' },
                        { key: 'general.site_logo_url', value: '/logo.png' },
                        { key: 'general.default_language', value: 'en' },
                        { key: 'general.timezone', value: 'UTC' },
                        // Payments
                        { key: 'payments.default_currency', value: 'USD' },
                        { key: 'payments.payment_methods', value: JSON.stringify(['stripe', 'paypal']) },
                        { key: 'payments.stripe_api_key', value: '' },
                        { key: 'payments.paypal_client_id', value: '' },
                        // Roles
                        { key: 'roles.admin_email', value: 'admin@example.com' },
                        { key: 'roles.user_roles', value: JSON.stringify(['admin', 'customer']) },
                        { key: 'roles.permissions', value: JSON.stringify({ admin: ['all'], customer: ['read'] }) },
                        // Shipping & Delivery
                        { key: 'shipping.default_shipping_method', value: 'standard' },
                        { key: 'shipping.shipping_zones', value: JSON.stringify([]) },
                        { key: 'shipping.free_shipping_threshold', value: '100' },
                        { key: 'shipping.handling_fee', value: '0' },
                        // Taxes & Duties
                        { key: 'taxes.tax_enabled', value: 'false' },
                        { key: 'taxes.default_tax_rate', value: '0' },
                        { key: 'taxes.duty_enabled', value: 'false' },
                        { key: 'taxes.duty_rates', value: JSON.stringify([]) },
                        // Policies
                        { key: 'policies.privacy_policy', value: 'Privacy Policy...' },
                        { key: 'policies.terms_of_service', value: 'Terms of Service...' },
                        { key: 'policies.return_policy', value: 'Return Policy...' },
                    ];
                    console.log('Seeding settings...');
                    _i = 0, settings_1 = settings;
                    _a.label = 1;
                case 1:
                    if (!(_i < settings_1.length)) return [3 /*break*/, 4];
                    setting = settings_1[_i];
                    return [4 /*yield*/, prisma.setting.upsert({
                        where: { key: setting.key },
                        update: {}, // Don't overwrite if exists
                        create: {
                            key: setting.key,
                            value: setting.value,
                        },
                    })];
                case 2:
                    _a.sent();
                    _a.label = 3;
                case 3:
                    _i++;
                    return [3 /*break*/, 1];
                case 4:
                    console.log('Settings seeded.');
                    // Seed admin user
                    console.log('Seeding admin user...');
                    adminEmail = 'admin@workit.com';
                    adminPassword = 'admin123456';
                    return [4 /*yield*/, bcrypt_1.default.hash(adminPassword, 10)];
                case 5:
                    passwordHash = _a.sent();
                    return [4 /*yield*/, prisma.adminUser.upsert({
                        where: { email: adminEmail },
                        update: {}, // Don't overwrite if exists
                        create: {
                            email: adminEmail,
                            passwordHash: passwordHash,
                            firstName: 'Admin',
                            lastName: 'User',
                            role: 'SUPER_ADMIN',
                            enabled: true,
                        },
                    })];
                case 6:
                    _a.sent();
                    console.log('Admin user seeded.');
                    console.log('Email:', adminEmail);
                    console.log('Password:', adminPassword);
                    // Seed shipping methods
                    console.log('Seeding shipping methods...');
                    return [4 /*yield*/, prisma.shippingMethod.upsert({
                        where: { id: 'standard' },
                        update: {
                            code: 'standard',
                            name: 'Standard Shipping',
                            description: 'Regular delivery within 3-5 business days',
                            enabled: true,
                            isExpress: false,
                        },
                        create: {
                            id: 'standard',
                            code: 'standard',
                            name: 'Standard Shipping',
                            description: 'Regular delivery within 3-5 business days',
                            enabled: true,
                            isExpress: false,
                        },
                    })];
                case 7:
                    standardShipping = _a.sent();
                    return [4 /*yield*/, prisma.shippingMethod.upsert({
                        where: { id: 'express' },
                        update: {
                            code: 'express',
                            name: 'Express Shipping',
                            description: 'Fast delivery within 1-2 business days',
                            enabled: true,
                            isExpress: true,
                        },
                        create: {
                            id: 'express',
                            code: 'express',
                            name: 'Express Shipping',
                            description: 'Fast delivery within 1-2 business days',
                            enabled: true,
                            isExpress: true,
                        },
                    })
                        // Add sample zones for Nairobi
                    ];
                case 8:
                    expressShipping = _a.sent();
                    // Add sample zones for Nairobi
                    return [4 /*yield*/, prisma.shippingZone.upsert({
                        where: { id: 'nairobi-standard' },
                        update: {},
                        create: {
                            id: 'nairobi-standard',
                            shippingMethodId: standardShipping.id,
                            county: 'Nairobi',
                            cities: {
                                create: [
                                    { cityTown: 'Westlands', price: 27000 }, // 270 KES in cents
                                    { cityTown: 'Kilimani', price: 27000 },
                                    { cityTown: 'Parklands', price: 30000 },
                                ],
                            },
                        },
                    })];
                case 9:
                    // Add sample zones for Nairobi
                    _a.sent();
                    return [4 /*yield*/, prisma.shippingZone.upsert({
                        where: { id: 'nairobi-express' },
                        update: {},
                        create: {
                            id: 'nairobi-express',
                            shippingMethodId: expressShipping.id,
                            county: 'Nairobi',
                            cities: {
                                create: [
                                    { cityTown: 'Westlands', price: 50000 }, // 500 KES in cents
                                    { cityTown: 'Kilimani', price: 50000 },
                                    { cityTown: 'Parklands', price: 55000 },
                                ],
                            },
                        },
                    })];
                case 10:
                    _a.sent();
                    console.log('Shipping methods seeded.');
                    return [2 /*return*/];
            }
        });
    });
}
main()
    .catch(function (e) {
        console.error(e);
        process.exit(1);
    })
    .finally(function () {
        return __awaiter(void 0, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, prisma.$disconnect()];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    });
