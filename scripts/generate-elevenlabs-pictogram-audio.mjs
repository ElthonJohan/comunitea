#!/usr/bin/env node
/**
 * Genera MP3 de pictogramas con ElevenLabs y los guarda en assets/audio/{femenina|masculina}/...
 * según las rutas definidas en constants/AudioAssets.ts.
 *
 * Voces (ComuniTEA):
 *   - Femenina: Samanta
 *   - Masculina: Luis
 *
 * Requisitos:
 *   - ELEVENLABS_API_KEY en el entorno o en .env en la raíz del repo
 *
 * Uso:
 *   node scripts/generate-elevenlabs-pictogram-audio.mjs
 *   node scripts/generate-elevenlabs-pictogram-audio.mjs --profile femenina
 *   node scripts/generate-elevenlabs-pictogram-audio.mjs --profile masculina
 *   node scripts/generate-elevenlabs-pictogram-audio.mjs --profile both --force
 *   node scripts/generate-elevenlabs-pictogram-audio.mjs --dry-run
 *   node scripts/generate-elevenlabs-pictogram-audio.mjs --id desayuno --profile both
 *
 * Opciones:
 *   --profile femenina|masculina|both   (default: both)
 *   --force                             Sobrescribe MP3 existentes
 *   --dry-run                           Solo lista lo que haría
 *   --delay-ms N                        Pausa entre llamadas API (default: 400)
 *   --id ID                             Solo este id de vocabulario (puede repetirse)
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { phraseForId } from './lib/build-pictogram-phrases.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');

const VOICES = {
    femenina: {
        id: 'qBvury71WUJfVeT1STkG',
        label: 'Samanta',
    },
    masculina: {
        id: 'WEXRePkZGpmcFLvCOaB1',
        label: 'Luis',
    },
};

const DEFAULT_MODEL = process.env.ELEVENLABS_MODEL?.trim() || 'eleven_multilingual_v2';

function loadDotEnv() {
    const envPath = path.join(ROOT, '.env');
    if (!fs.existsSync(envPath)) return;
    const text = fs.readFileSync(envPath, 'utf8');
    for (const line of text.split(/\r?\n/)) {
        const t = line.trim();
        if (!t || t.startsWith('#')) continue;
        const i = t.indexOf('=');
        if (i === -1) continue;
        const k = t.slice(0, i).trim();
        let v = t.slice(i + 1).trim();
        if (
            (v.startsWith('"') && v.endsWith('"')) ||
            (v.startsWith("'") && v.endsWith("'"))
        ) {
            v = v.slice(1, -1);
        }
        if (process.env[k] === undefined) process.env[k] = v;
    }
}

function parseArgs(argv) {
    const out = {
        profile: 'both',
        force: false,
        dryRun: false,
        delayMs: 400,
        ids: /** @type {string[]} */ ([]),
    };
    for (let i = 2; i < argv.length; i++) {
        const a = argv[i];
        if (a === '--force') out.force = true;
        else if (a === '--dry-run') out.dryRun = true;
        else if (a === '--profile' && argv[i + 1]) {
            out.profile = argv[++i];
        } else if (a === '--delay-ms' && argv[i + 1]) {
            out.delayMs = Math.max(0, parseInt(argv[++i], 10) || 0);
        } else if (a === '--id' && argv[i + 1]) {
            out.ids.push(argv[++i]);
        } else if (a === '--help' || a === '-h') {
            console.log(`Uso: node scripts/generate-elevenlabs-pictogram-audio.mjs [opciones]
  --profile femenina|masculina|both   (default: both)
  --force          Sobrescribe MP3 existentes
  --dry-run        Solo lista acciones
  --delay-ms N     Pausa entre llamadas (default: 400)
  --id ID          Solo un id (repetible)
Requiere ELEVENLABS_API_KEY en .env o en el entorno.`);
            process.exit(0);
        }
    }
    if (!['femenina', 'masculina', 'both'].includes(out.profile)) {
        console.error('Error: --profile debe ser femenina, masculina o both');
        process.exit(1);
    }
    return out;
}

/**
 * @returns {{ id: string, relPath: string }[]}
 */
function parseAudioAssetsFemenina() {
    const tsPath = path.join(ROOT, 'constants', 'AudioAssets.ts');
    const text = fs.readFileSync(tsPath, 'utf8');
    const re =
        /^\s+'([^']+)':\s*require\('\.\.\/assets\/audio\/femenina\/([^']+)'\)/gm;
    const list = [];
    let m;
    while ((m = re.exec(text))) {
        list.push({ id: m[1], relPath: m[2] });
    }
    if (list.length === 0) {
        throw new Error('No se encontraron entradas femenina en AudioAssets.ts');
    }
    return list;
}

function sleep(ms) {
    return new Promise((r) => setTimeout(r, ms));
}

/**
 * @param {string} text
 * @param {string} voiceId
 */
async function synthesize(text, voiceId) {
    const apiKey = process.env.ELEVENLABS_API_KEY;
    if (!apiKey?.trim()) {
        throw new Error('Falta ELEVENLABS_API_KEY');
    }
    const url = `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`;
    const body = {
        text: text.trim(),
        model_id: DEFAULT_MODEL,
        voice_settings: {
            stability: 0.5,
            similarity_boost: 0.75,
            style: 0.0,
            use_speaker_boost: true,
            speed: 1.0,
        },
    };
    const res = await fetch(url, {
        method: 'POST',
        headers: {
            Accept: 'audio/mpeg',
            'xi-api-key': apiKey.trim(),
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
    });
    if (!res.ok) {
        const errText = await res.text();
        throw new Error(`ElevenLabs ${res.status}: ${errText.slice(0, 500)}`);
    }
    return Buffer.from(await res.arrayBuffer());
}

async function main() {
    loadDotEnv();
    const opts = parseArgs(process.argv);
    const entries = parseAudioAssetsFemenina();
    const idFilter =
        opts.ids.length > 0 ? new Set(opts.ids.map((x) => x.trim()).filter(Boolean)) : null;

    const profiles =
        opts.profile === 'both' ? /** @type {const} */ (['femenina', 'masculina']) : [opts.profile];

    console.log(`Modelo: ${DEFAULT_MODEL}`);
    console.log(
        profiles
            .map((p) => `${p}: ${VOICES[p].label} (${VOICES[p].id})`)
            .join('\n'),
    );
    console.log('---');

    let done = 0;
    let skipped = 0;
    let errors = 0;
    let considered = 0;

    for (const { id, relPath } of entries) {
        if (idFilter && !idFilter.has(id)) continue;
        considered++;

        const text = phraseForId(id);
        if (!text?.trim()) {
            console.error(`Sin frase para id "${id}"`);
            errors++;
            continue;
        }

        for (const profile of profiles) {
            const outPath = path.join(ROOT, 'assets', 'audio', profile, relPath);
            if (!opts.force && fs.existsSync(outPath)) {
                console.log(`⏭️  existe  [${profile}] ${relPath}`);
                skipped++;
                continue;
            }
            if (opts.dryRun) {
                console.log(`🔍 dry-run [${profile}] ${relPath} ← "${text}"`);
                continue;
            }

            try {
                const mp3 = await synthesize(text, VOICES[profile].id);
                fs.mkdirSync(path.dirname(outPath), { recursive: true });
                fs.writeFileSync(outPath, mp3);
                console.log(`✅ [${profile}] ${relPath}`);
                done++;
                if (opts.delayMs > 0) await sleep(opts.delayMs);
            } catch (e) {
                console.error(`❌ [${profile}] ${relPath}:`, e instanceof Error ? e.message : e);
                errors++;
            }
        }
    }

    console.log('---');
    console.log(
        opts.dryRun
            ? `Dry-run terminado (${considered} entradas × ${profiles.length} perfil(es)).`
            : `Generados: ${done}, omitidos: ${skipped}, errores: ${errors}`,
    );
    if (errors > 0) process.exit(1);
}

main().catch((e) => {
    console.error(e);
    process.exit(1);
});
