import { Client } from 'pg';
import { dbConfig } from './dbConfig';

export async function readGroupsDB(): Promise<string[]> {
    const dbClient = new Client(dbConfig);

    try {
        await dbClient.connect();
        console.log("Connected to the database.");

        const res = await dbClient.query('SELECT invite_link FROM app_control_group');
        await dbClient.end();

        return res.rows.map(row => row.invite_link);
    } catch (error) {
        console.error('Failed to fetch invite links from database:', error);
        throw new Error('Failed to fetch invite links from database');
    }
}
