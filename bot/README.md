# GoWA — WhatsApp Web Multi-Device

Esta carpeta solo levanta el servicio **GoWA** que conecta con WhatsApp.
La lógica del bot (webhook, envío de mensajes, integración con n8n) vive en el **backend Python**.

## Arquitectura

```
WhatsApp ←→ GoWA (:3000) ←→ Backend FastAPI (:8000) ←→ n8n Cloud / DittoApp
```

## Inicio rápido

1. Levanta el backend (en otra terminal):

```bash
cd ../backend
cp .env.example .env
pip install -r requirements.txt
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

2. Levanta GoWA:

```bash
docker compose up -d
```

3. Escanea el QR en http://localhost:3000

## Configuración del webhook

GoWA envía mensajes entrantes al backend:

```
POST http://host.docker.internal:8000/api/whatsapp/webhook
```

El secreto (`secret`) debe coincidir con `GOWA_WEBHOOK_SECRET` en `backend/.env`.

## Endpoints del bot (backend)

| Endpoint | Descripción |
|----------|-------------|
| `POST /api/whatsapp/webhook` | Recibe eventos de GoWA |
| `POST /api/whatsapp/messages/send` | Envía mensajes por WhatsApp |

## Variables en backend/.env

```env
GOWA_BASE_URL=http://localhost:3000
GOWA_WEBHOOK_SECRET=secret
N8N_WEBHOOK_URL=https://tu-instancia.app.n8n.cloud/webhook/whatsapp-incoming
WHATSAPP_API_KEY=clave-para-n8n
```

## Enviar mensaje de prueba

```bash
curl -X POST http://localhost:8000/api/whatsapp/messages/send \
  -H "Content-Type: application/json" \
  -d '{"phone": "5215512345678", "message": "Hola"}'
```

## Referencias

- [GoWA](https://github.com/aldinokemal/go-whatsapp-web-multidevice)
- [Documentación GoWA](https://aldinokemal-go-whatsapp-web-multidevice.mintlify.app/)
