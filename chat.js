// Netlify Function: Sichere Brücke zwischen RalphiApp und Claude API
// Der API-Key liegt sicher bei Netlify (Umgebungsvariable), nicht im Browser.

exports.handler = async (event) => {
    // Nur POST erlauben
    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, body: JSON.stringify({ error: 'Nur POST erlaubt' }) };
    }

    const apiKey = process.env.CLAUDE_API_KEY;
    if (!apiKey) {
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Kein API-Key konfiguriert. CLAUDE_API_KEY bei Netlify hinterlegen.' })
        };
    }

    try {
        const { message, user } = JSON.parse(event.body || '{}');
        if (!message) {
            return { statusCode: 400, body: JSON.stringify({ error: 'Keine Nachricht' }) };
        }

        // Wer schreibt gerade? (raphy oder kathi)
        let wer = 'einer der beiden (Raphy oder Kathi)';
        if (user === 'raphy') wer = 'Raphy (Raphael)';
        else if (user === 'kathi') wer = 'Kathi (Katharina), Raphys Freundin';

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
                system: 'Du bist RalphiApp, die persoenliche Helfer-App von Raphy fuer ihn und seine Freundin Kathi. Du schreibst gerade mit: ' + wer + '. Sprich die Person ruhig mit Namen an. Antworte kurz, herzlich und im lockeren oberoesterreichischen Dialekt. Max 2-3 Saetze, gelegentlich Emojis.',
                messages: [{ role: 'user', content: message }]
            })
        });

        if (!response.ok) {
            const errText = await response.text();
            return { statusCode: response.status, body: JSON.stringify({ error: 'Claude API Fehler: ' + errText }) };
        }

        const data = await response.json();
        const reply = data.content[0].text;

        return {
            statusCode: 200,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ reply })
        };
    } catch (e) {
        return { statusCode: 500, body: JSON.stringify({ error: 'Server-Fehler: ' + e.message }) };
    }
};
