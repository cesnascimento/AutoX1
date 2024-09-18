import { create, Whatsapp } from '@wppconnect-team/wppconnect';

const MESSAGE_INTERVAL = 5 * 60 * 1000; // Intervalo de 5 minutos entre mensagens

// Dicionário para armazenar o estágio de cada contato
const contactStages: { [key: string]: number } = {};

// Mensagens do funil
const funnelMessages = [
    `Certo! Antes de eu te explicar como você vai fazer pra lucrar ainda hoje, preciso que você me adicione como contato aqui no WhatsApp, pra eu conseguir te chamar depois caso você ganhe a banca de hoje, ok?`,
    `🚨 Lembrando que são APENAS 3 VAGAS 100% GRATUITAS então peço que você faça o seu cadastro para garantir a sua sem custo algum, fechou? Só um momentinho que vou liberar o seu acesso... 🤑`,
    `✅ SEU ACESSO VIP JÁ FOI LIBERADO! 🤩

👆🏻 ASSISTA O VÍDEO ACIMA PARA APRENDER A LUCRAR COM O APP! 👆🏻

Crie o seu cadastro no primeiro link abaixo para garantir o seu BÔNUS EXCLUSIVO e a sua vaga gratuita, depois basta acessar o aplicativo hacker no segundo link pra já começar a lucrar! 💰

🎁 LINK DE CADASTRO BÔNUS:
https://onabet.link/cadastro/ 

🤖 LINK DO APLICATIVO DE JOGADAS CERTAS: 
https://appdebet.com/oficial 

⚠️ IMPORTANTE: Depositando em até 30 minutos as suas chances de ganhar aumentam e você ganha um cupom para o sorteio do iPhone 15 Pro de hoje! 💎`,
    `🎁Ahh e tenho mais um presente pra você: vou liberar seu acesso ao grupo de sorteios e estratégias onde todos os dias rolam sorteios de banca, lives, estratégias validadas pra ganhar com os jogos (além do APP que já vai te mostrar as jogadas certas)

LINK GRUPO
https://chat.whatsapp.com/DdO1PKyZj839akHAxxeewq`
];

async function initAutoResponse(device: string) {
    const client: Whatsapp = await create({
        session: device,
        puppeteerOptions: { headless: true },
    });

    client.onMessage(async (message) => {
        const from = message.from; // Número do contato

        if (!message.body) {
            console.warn(`Mensagem de ${from} não contém texto.`);
            return; // Sai da função se não houver corpo de texto
        }

        const body = message.body.toUpperCase(); // Conteúdo da mensagem

        if (!contactStages[from]) {
            contactStages[from] = 0; // Iniciar no estágio 0 (primeira mensagem)
        }

        const currentStage = contactStages[from]; // Obter o estágio atual do contato

        try {
            if (currentStage === 0) {
                await client.sendText(from, funnelMessages[0]);
                console.log(`Primeira mensagem enviada para ${from}`);
                contactStages[from] = 1; // Avança para o estágio 1
            } else if (currentStage === 1) {
                await client.sendFile(from, './video/video1.mp4', 'video.mp4', 'Assista o vídeo para mais informações.');
                console.log(`Terceira mensagem enviada para ${from}`);
                contactStages[from] = 2; // Avança para o estágio 3
            } else if (currentStage === 2) {
                await client.sendFile(from, './img/img1.jpeg', 'photo.jpg', 'Veja a imagem abaixo.');
                console.log(`Quarta mensagem enviada para ${from}`);
                contactStages[from] = 3; // Avança para o estágio 4
            } else if (currentStage === 3) {
                await client.sendText(from, funnelMessages[2]);
                console.log(`Quinta mensagem enviada para ${from}`);
                contactStages[from] = 4; // Avança para o estágio 5
            } else if (currentStage === 4) {
                await client.sendFile(from, './video/video2.mp4', 'video.mp4', `✅ SEU ACESSO VIP JÁ FOI LIBERADO! 🤩`);
                await client.sendText(from, funnelMessages[3]);
                console.log(`Sexta mensagem enviada para ${from}`);
                contactStages[from] = 5; // Avança para o estágio 6
            } else if (currentStage === 5) {
                await client.sendText(from, funnelMessages[6]);
                console.log(`Sétima mensagem enviada para ${from}`);
                contactStages[from] = 6; // Finaliza o funil
            }
        } catch (error) {
            console.error(`Erro ao enviar mensagem para ${from}:`, error);
        }
    });

    console.log(`Sessão ${device} pronta para responder automaticamente.`);
}

async function main() {
    const devices = ['session_device1', 'session_device2', 'session_device3', 'session_device4', 'session_device5'];
    
    const tasks = devices.map(device => initAutoResponse(device));
    
    await Promise.all(tasks);
}

main().catch(console.error);
