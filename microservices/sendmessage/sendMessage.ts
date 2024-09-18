import { create, Whatsapp } from '@wppconnect-team/wppconnect';
import { Client } from 'pg';
import { dbConfig } from '../db/dbConfig';

async function sendMessages(device: string, contacts: any[]) {
    const client: Whatsapp = await create({
        session: device,
        puppeteerOptions: { headless: true },
    });

    const dbClient = new Client(dbConfig);
    await dbClient.connect();

    for (const row of contacts) {
        const { serialized } = row;

        try {
            /* Altere o conteudo da mensagem aqui */
            /* Exemplo: await client.sendText(serialized, 'leo123'); */
            await client.sendText(serialized, `Eiii, tudo bem? Me chamo Fernanda, sou da equipe de suporte ao cliente 🤍
            Posso liberar o seu acesso ao Aplicativo de Inteligência Artificial que vai te mostrar as jogadas e horários certos pra você conseguir finalmente lucrar nesse mercado? (O APLICATIVO NÃO TEM CUSTO NENHUM!) 🚨
            Caso tenha interesse, digite ”SIM” que eu te ensino agora mesmo! (Apenas 3 vagas disponíveis) 💰`);
            
            const updateQuery = 'UPDATE app_control_contacts SET message_sent = TRUE, send_date = CURRENT_TIMESTAMP WHERE serialized = $1';
            await dbClient.query(updateQuery, [serialized]);
            console.log(`Message sent to ${serialized} by ${device}. Waiting for 5 minutes before sending the next one.`);


            /* Altere o tempo de intervalo a cada mensagem aqui. Por padrão é 5 minutos */
            /* Exemplo: await new Promise(resolve => setTimeout(resolve, AQUI O MINUTOS * 60 * 1000)); */
            await new Promise(resolve => setTimeout(resolve, 25 * 60 * 1000));
        } catch (error) {
            console.error(`Failed to send message to ${serialized} by ${device}:`, error);
        }
    }

    await dbClient.end();
    await client.close();
}

async function main() {
    const dbClient = new Client(dbConfig);
    await dbClient.connect();

    const res = await dbClient.query('SELECT * FROM app_control_contacts WHERE message_sent IS NULL');
    const contacts = res.rows;


    /* Lista de sessões de dispositivos. Adicione ou remova sessões conforme necessário. */
    /* Exemplo: const devices = ['session_device1', 'session_device2', 'session_device3'] */
    const devices = ['session_device1', 'session_device2', 'session_device3', 'session_device4', 'session_device5'];


    /* Divisão de contatos entre dispositivos */
    const contactsPerDevice = Math.ceil(contacts.length / devices.length);
    const tasks = devices.map((device, index) => {
        const start = index * contactsPerDevice;
        const end = start + contactsPerDevice;
        const deviceContacts = contacts.slice(start, end);
        console.log(`${device} will handle ${deviceContacts.length} contacts`);
        return sendMessages(device, deviceContacts);
    });

    await Promise.all(tasks);

    await dbClient.end();
}

main().catch(console.error);
