// Netlify Function: Bruecke zwischen RalphiApp und Claude API
exports.handler = async (event) => {
    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, body: JSON.stringify({ error: 'Nur POST erlaubt' }) };
    }
    const apiKey = process.env.CLAUDE_API_KEY;
    if (!apiKey) {
        return { statusCode: 500, body: JSON.stringify({ error: 'Kein API-Key konfiguriert.' }) };
    }
    try {
        const { message, user } = JSON.parse(event.body || '{}');
        if (!message) {
            return { statusCode: 400, body: JSON.stringify({ error: 'Keine Nachricht' }) };
        }
        let identInfo = 'Du weisst nicht sicher, ob gerade Raphy oder Kathi schreibt. Frag freundlich nach, wer da ist.';
        if (user === 'raphy') {
            identInfo = 'Die Person, mit der du JETZT schreibst, ist DEFINITIV Raphy (Raphael), der diese App gemacht hat. Wenn er fragt wer er ist, antworte klar: Raphy. Verwechsle ihn NICHT mit Kathi.';
        } else if (user === 'kathi') {
            identInfo = 'Die Person, mit der du JETZT schreibst, ist DEFINITIV Kathi (Katharina), Raphys Freundin. Wenn sie fragt wer sie ist, antworte klar: Kathi. Verwechsle sie NICHT mit Raphy.';
        }
        const response = await fetch('https://api.anthropic.com/v1/messages', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': apiKey,
                'anthropic-version': '2023-06-01'
            },
            body: JSON.stringify({
                model: 'claude-opus-4-6',
                max_tokens: 400,
                system: 'Du bist RalphiApp, die persoenliche Helfer-App fuer Raphy (Raphael) und seine Freundin Kathi (Katharina). ' + identInfo + ' Antworte kurz, herzlich und im lockeren oberoesterreichischen Dialekt. Max 2-3 Saetze, gelegentlich Emojis.',
                messages: [{ role: 'user', content: message }]
            })
        });
        if (!response.ok) {
            const errText = await response.text();
            return { statusCode: response.status, body: JSON.stringify({ error: 'Claude API Fehler: ' + errText }) };
        }
        const data = await response.json();
        return { statusCode: 200, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ reply: data.content[0].text }) };
    } catch (e) {
        return { statusCode: 500, body: JSON.stringify({ error: 'Server-Fehler: ' + e.message }) };
    }
};
