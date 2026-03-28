import Database from 'better-sqlite3';
import fs from 'fs';
const db = new Database('cricplay.db');
let out = '--- USERS SCHEMA ---\n';
out += JSON.stringify(db.prepare("SELECT sql FROM sqlite_master WHERE type='table' AND name='users'").get(), null, 2) + '\n';
out += '--- ALL USERS ---\n';
out += JSON.stringify(db.prepare("SELECT * FROM users").all(), null, 2) + '\n';
fs.writeFileSync('db_output2.txt', out, 'utf-8');
