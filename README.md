# Arkania Bot

Arkania Bot es un bot de Discord diseñado para el servidor de Discord Arkania. Ofrece una variedad de comandos para la gestión de roles, la visualización de niveles de experiencia y la realización de sorteos.

## Tabla de Contenidos

- [Descripción](#descripción)
- [Características](#características)
- [Instalación](#instalación)
- [Uso](#uso)
- [Contribuciones](#contribuciones)
- [Licencia](#licencia)

## Descripción

Arkania Bot proporciona funcionalidades personalizadas para mejorar la experiencia de los miembros en el servidor de Discord **Arkania**. Entre sus características se incluyen comandos para moderar a los usuarios, realizar sorteos y _(todavía en desarrollo)_ un sistema de niveles en conjunto con uno de economía.

## Características

- **mod:** Para moderar el servidor.
- **info:** Para ver información sobre el servidor y los usuarios.
- **sorteo:** Crea sorteos y permite a los usuarios participar.

## Instalación

1. Clona el repositorio:

   ```bash
   git clone https://github.com/tu_usuario/arkania-bot.git
   ```

2. Navega al directorio del proyecto:
   ```bash
   cd arkania-bot
   ```
3. Instala las dependencias:
   ```bash
   npm install
   ```
   ```bash
   npm install dotenv
   ```
4. Crea un archivo `.env` en el directorio raíz y añade tus variables de entorno:
   ```
   TOKEN=tu_token_de_discord
   CLIENT_ID=tu_client_id
   GUILD_ID=tu_guild_id
   ```

## Uso

Inicia el bot utilizando

```
npm start
```

Comandos disponibles:

- `mod`
- `info`
- `sorteo`
- Otros más.

## Licencia

Este proyecto está licenciado bajo la [Licencia MIT](licencia.md).
