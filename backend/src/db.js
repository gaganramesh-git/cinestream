const oracledb = require('oracledb');
require('dotenv').config();

oracledb.fetchAsString = [oracledb.CLOB];
oracledb.fetchAsBuffer = [oracledb.BLOB];

// Attempt to enable "Thick mode" for older Oracle databases like 11g Express Edition
try {
    oracledb.initOracleClient();
    console.log('Oracle Thick mode enabled successfully.');
} catch (err) {
    console.error('Could not enable Oracle Thick mode. (If using Oracle 11g, you need the Oracle Instant Client in your PATH). Details:', err.message);
}

// Load the config from the environment variables
const dbConfig = {
    user: process.env.ORACLE_USER || 'admin',
    password: process.env.ORACLE_PASSWORD || 'password',
    connectString: process.env.ORACLE_CONNECT_STRING || 'localhost:1521/XEPDB1',
};

async function initDb() {
    try {
        await oracledb.createPool({
            ...dbConfig,
            poolMin: 2,
            poolMax: 10,
            poolIncrement: 2
        });
        console.log('Oracle DB connection pool started.');
    } catch (err) {
        console.error('initDb() error: ' + err.message);
    }
}

async function closeDb() {
    try {
        await oracledb.getPool().close(10);
        console.log('Oracle DB connection pool closed.');
    } catch (err) {
        console.error('closeDb() error: ' + err.message);
    }
}

async function executeQuery(sql, binds = [], options = {}) {
    let connection;
    try {
        connection = await oracledb.getConnection();
        options.outFormat = oracledb.OUT_FORMAT_OBJECT;
        const result = await connection.execute(sql, binds, options);
        return result;
    } catch (err) {
        console.error(err);
        throw err;
    } finally {
        if (connection) {
            try {
                await connection.close();
            } catch (err) {
                console.error(err);
            }
        }
    }
}

module.exports = { initDb, closeDb, executeQuery };
