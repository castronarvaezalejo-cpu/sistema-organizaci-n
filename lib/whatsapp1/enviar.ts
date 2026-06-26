export async function enviarWhatsApp(
  telefono: string,
  mensaje: string
) {
  const respuesta = await fetch(
    `https://graph.facebook.com/v23.0/${process.env.WHATSAPP_PHONE_NUMBER_ID}/messages`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.WHATSAPP_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        to: telefono,
        type: "text",
        text: {
          body: mensaje,
        },
      }),
    }
  );

  return await respuesta.json();
}