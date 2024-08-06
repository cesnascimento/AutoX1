import { create, Whatsapp } from '@wppconnect-team/wppconnect';
import { Client } from 'pg';
import { dbConfig } from '../db/dbConfig';
import { readGroupsDB } from './readGroupsDB';

function randomDelay(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1) + min);
}

function delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function processGroup(client: Whatsapp, dbClient: Client, groupLink: string): Promise<void> {
    try {
        console.log(`Processing group ${groupLink}`);
        const groupInfo = await client.joinGroup(groupLink);
        let groupId = groupInfo.id;
        console.log('Joined group with ID:', groupId);

        const updateStatusQuery = `
            UPDATE app_control_group
            SET status_connect = TRUE
            WHERE invite_link = $1
        `;
        try {
            await dbClient.query(updateStatusQuery, [groupLink]);
            console.log(`Updated status_connect for group ${groupLink}`);
        } catch (updateError) {
            console.error(`Failed to update status_connect for group ${groupLink}:`, updateError);
        }

        const memberIds = await client.getGroupMembersIds(groupId);
        console.log(`Number of members in group ${groupLink}:`, memberIds.length);

        for (const member of memberIds) {
            const number = member.user;
            const serialized = member._serialized;
            const query = 'INSERT INTO app_control_contacts (number, serialized, collection_date) VALUES ($1, $2, CURRENT_TIMESTAMP)';

            try {
                await dbClient.query(query, [number, serialized]);
                console.log(`Inserted member ${number} into database.`);
            } catch (insertError) {
                console.error(`Failed to insert member ${number} into database:`, insertError);
            }
        }
    } catch (groupError) {
        console.error(`Failed to process group ${groupLink}:`, groupError);
    }
}

async function extractNumbersFromGroups(groups: string[]): Promise<void> {
    const client = await create({
        session: 'session_name',
        puppeteerOptions: { headless: true, args: ['--no-sandbox', '--disable-setuid-sandbox'] },
        catchQR: (qrCode) => {
            console.log(`QR Code: ${qrCode}`);
        },
    });
    const dbClient = new Client(dbConfig);

    try {
        await dbClient.connect();
        console.log("Connected to the database.");
    } catch (error) {
        console.error("Failed to connect to the database:", error);
        return;
    }

    for (const groupLink of groups) {
        await processGroup(client, dbClient, groupLink);
        const waitTime = randomDelay(120000, 420000);
        console.log(`Waiting for ${waitTime / 60000} minutes before processing the next group.`);
        await delay(waitTime);
    }

    try {
        await dbClient.end();
        console.log("Disconnected from the database.");
    } catch (endError) {
        console.error("Failed to disconnect from the database:", endError);
    }

    await client.close();
}

(async () => {
    try {
        const groups = await readGroupsDB();
        console.log('Groups:', groups);
        await extractNumbersFromGroups(groups);
        console.log('Extraction completed successfully.');
    } catch (error) {
        console.error('Error during extraction:', error);
    }
})();
