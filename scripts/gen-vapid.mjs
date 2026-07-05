// Erzeugt ein VAPID-Schlüsselpaar für Web Push.
// Nutzung:  npm run gen:vapid
// Danach die Ausgabe in die Vercel-Env (bzw. .env.local) eintragen.
import webpush from "web-push";

const keys = webpush.generateVAPIDKeys();
console.log("# Web-Push VAPID Keys – in die Umgebungsvariablen eintragen:");
console.log("NEXT_PUBLIC_VAPID_PUBLIC_KEY=" + keys.publicKey);
console.log("VAPID_PRIVATE_KEY=" + keys.privateKey);
console.log('VAPID_SUBJECT=mailto:office@gschpusi.com');
