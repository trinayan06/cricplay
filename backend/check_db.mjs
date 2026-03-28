import Database from 'better-sqlite3';
const db = new Database('cricplay.db');
console.log('--- USERS SCHEMA ---');
console.log(db.prepare("SELECT sql FROM sqlite_master WHERE type='table' AND name='users'").get());
console.log('--- ALL USERS ---');
console.log(db.prepare("SELECT * FROM users").all());
