import { create, Whatsapp } from '@wppconnect-team/wppconnect';
import { Client } from 'pg';
import { dbConfig } from '../db/dbConfig';

const MESSAGE_INTERVAL = 5 * 60 * 1000; // Intervalo de 5 minutos entre mensagens

// Dicionário para armazenar o estágio de cada contato
const contactStages: { [key: string]: number } = {};

// Mensagens do funil
const funnelMessages = [
    `Certo! Antes de eu te explicar como você vai fazer pra lucrar ainda hoje, preciso que você me adicione como contato aqui no WhatsApp, pra eu conseguir te chamar depois caso você ganhe a banca de hoje, ok?`,
    `🚨 Lembrando que são APENAS 3 VAGAS 100% GRATUITAS então peço que você faça o seu cadastro para garantir a sua sem custo algum, fechou? Só um momentinho que vou liberar o seu acesso... 🤑`,
    `✅ SEU ACESSO VIP JÁ FOI LIBERADO! 🤩\n\n👆🏻 ASSISTA O VÍDEO ACIMA PARA APRENDER A LUCRAR COM O APP! 👆🏻\n\nCrie o seu cadastro no primeiro link abaixo para garantir o seu BÔNUS EXCLUSIVO e a sua vaga gratuita, depois basta acessar o aplicativo hacker no segundo link pra já começar a lucrar! 💰 🎁 LINK DE CADASTRO BÔNUS:\n\nhttps://onabet.link/cadastro/\n\n 🤖 LINK DO APLICATIVO DE JOGADAS CERTAS:\n\n https://appdebet.com/oficial \n\n⚠️ IMPORTANTE: Depositando em até 30 minutos as suas chances de ganhar aumentam e você ganha um cupom para o sorteio do iPhone 15 Pro de hoje! 💎\n\n`,
    `🎁Ahh e tenho mais um presente pra você: vou liberar seu acesso ao grupo de sorteios e estratégias onde todos os dias rolam sorteios de banca, lives, estratégias validadas pra ganhar com os jogos (além do APP que já vai te mostrar as jogadas certas)\n\nLINK GRUPO\nhttps://t.me/telegr0navip`
];

async function main1() {
    const dbClient = new Client(dbConfig);
    await dbClient.connect();

    const res = await dbClient.query('SELECT * FROM app_control_contacts WHERE message_sent IS NULL');
    const contacts = res.rows;

    const devices = ['session_device1', 'session_device2', 'session_device3', 'session_device4', 'session_device5'];

    const tasks = devices.map(async (device, index) => {
        const client: Whatsapp = await create({
            session: device,
            puppeteerOptions: { headless: true },
        });

        // Função de auto-resposta (antes do loop de envio)
        client.onMessage(async (message) => {
            const from = message.from;

            if (!message.body) {
                console.warn(`Mensagem de ${from} não contém texto.`);
                return;
            }

            if (!contactStages[from]) {
                contactStages[from] = 0; // Iniciar no estágio 0 (primeira mensagem)
            }

            const currentStage = contactStages[from];
            try {
                if (currentStage === 0) {
                    await new Promise(resolve => setTimeout(resolve, 0.30 * 60 * 1000));
                    await client.sendText(from, funnelMessages[0]);
                    console.log(`Primeira mensagem enviada para ${from}`);
                    contactStages[from] = 1;
                    await new Promise(resolve => setTimeout(resolve, 1 * 60 * 1000));
                    await client.sendFile(from, './video/video1.mp4');
                    console.log(`Segunda mensagem enviada para ${from}`);
                    await new Promise(resolve => setTimeout(resolve, 0.30 * 60 * 1000));
                    await client.sendFile(from, './img/img1.jpeg');
                    console.log(`Terceira mensagem enviada para ${from}`);
                    contactStages[from] = 2;
                    await new Promise(resolve => setTimeout(resolve, 0.30 * 60 * 1000));
                    await client.sendText(from, funnelMessages[1]);
                    console.log(`Quarta mensagem enviada para ${from}`);
                    contactStages[from] = 3;
                    await new Promise(resolve => setTimeout(resolve, 1 * 60 * 1000));
                    await client.sendText(from, funnelMessages[2]);
                    console.log(`Quinta mensagem enviada para ${from}`);
                    contactStages[from] = 3;
                    await new Promise(resolve => setTimeout(resolve, 0.30 * 60 * 1000));
                    await client.sendText(from, funnelMessages[3]);
                    console.log(`Sexta mensagem enviada para ${from}`);
                    contactStages[from] = 4;
                }
            } catch (error) {
                console.error(`Erro ao enviar mensagem para ${from}:`, error);
            }
        });

        // Loop para enviar mensagens após configurar o auto-responder
        const contactsPerDevice = Math.ceil(contacts.length / devices.length);
        const start = index * contactsPerDevice;
        const end = start + contactsPerDevice;
        const deviceContacts = contacts.slice(start, end);
        console.log(`${device} will handle ${deviceContacts.length} contacts`);

        // Função para enviar mensagens
        for (const row of deviceContacts) {
            const { serialized } = row;

            try {
                /* Envia a primeira mensagem */
                await client.sendText(serialized, `Eiii, tudo bem? Me chamo Fernanda, sou da equipe de suporte ao cliente 🤍 Posso liberar o seu acesso ao Aplicativo de Inteligência Artificial que vai te mostrar as jogadas e horários certos pra você conseguir finalmente lucrar nesse mercado? Caso tenha interesse, digite ”SIM” que eu te ensino agora mesmo! (Apenas 3 vagas disponíveis) 💰`);
                
                const updateQuery = 'UPDATE app_control_contacts SET message_sent = TRUE, send_date = CURRENT_TIMESTAMP WHERE serialized = $1';
                await dbClient.query(updateQuery, [serialized]);
                console.log(`Message sent to ${serialized} by ${device}. Waiting for 5 minutes before sending the next one.`);

                /* Intervalo de 25 minutos entre cada mensagem */
                await new Promise(resolve => setTimeout(resolve, 25 * 60 * 1000));
            } catch (error) {
                console.error(`Failed to send message to ${serialized} by ${device}:`, error);
            }
        }
    });

    await Promise.all(tasks);
    await dbClient.end();
}

main1().catch(console.error);
