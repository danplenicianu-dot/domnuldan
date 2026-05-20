# GPT Lite • Domnul Dan

Micro webapp optimizat pentru Meta Ray-Ban Display glasses.

## URL probabil pentru GitHub Pages

Dacă GitHub Pages este activ pe repository-ul `domnuldan`, aplicația va fi disponibilă la:

https://danplenicianu-dot.github.io/domnuldan/meta-gpt-lite/

Dacă ai domeniul personal mapat pe acest repository, poate funcționa și ca:

https://domnuldan.com/meta-gpt-lite/

## Ce face acum

- UI 600x600 px, gândit pentru Meta Ray-Ban Display.
- Fundal negru, text mare, contrast ridicat.
- Navigare cu tastatură / D-pad: săgeți + Enter.
- Ecran de dictare dacă browserul suportă Web Speech API.
- Fallback către ChatGPT web.
- Câmp de setare pentru un backend securizat OpenAI.

## Important

Nu pune cheia OpenAI direct în browser. Pentru răspunsuri reale în webapp trebuie un endpoint backend, de exemplu:

POST /api/chat

Body:

```json
{
  "message": "întrebarea utilizatorului",
  "system": "instrucțiuni sistem"
}
```

Response:

```json
{
  "reply": "răspunsul pentru utilizator"
}
```

## Cum îl adaugi în Meta AI app

1. Deschide Meta AI app.
2. Devices.
3. Display Glasses settings.
4. App connections.
5. Web apps.
6. Add a web app.
7. Pune numele `GPT Lite` și URL-ul public.
