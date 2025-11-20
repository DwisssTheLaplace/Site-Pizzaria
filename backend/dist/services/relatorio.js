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
Object.defineProperty(exports, "__esModule", { value: true });
exports.gerarRelatorioVendas = gerarRelatorioVendas;
const database_1 = require("../config/database");
function gerarRelatorioVendas() {
    return __awaiter(this, void 0, void 0, function* () {
        const client = yield database_1.pool.connect();
        try {
            const queryHoje = `
            SELECT COALESCE(SUM(pi.quantidade), 0) as total
            FROM pedido_itens pi
            JOIN pedidos p ON pi.pedido_id = p.id
            WHERE p.data_pedido >= date_trunc('day', NOW());
        `;
            const resHoje = yield client.query(queryHoje);
            const vendidosHoje = resHoje.rows[0].total;
            const queryMes = `
            SELECT COALESCE(SUM(pi.quantidade), 0) as total
            FROM pedido_itens pi
            JOIN pedidos p ON pi.pedido_id = p.id
            WHERE p.data_pedido >= date_trunc('month', NOW());
        `;
            const resMes = yield client.query(queryMes);
            const vendidosMes = resMes.rows[0].total;
            return { vendidosHoje, vendidosMes };
        }
        finally {
            client.release();
        }
    });
}
