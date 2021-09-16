# StrangeTextRPG

---------

## ⚠️ Внимание! ⚠️

Мы ищем людей, кому нравится этот проект и хотели бы его развивать.

Если тебе это интересно пиши мне в телеграм [@ikostyakov](https://t.me/ikostyakov) или на почту [i.a.kostyakov@gmail.com](mailto:i.a.kostyakov@gmail.com)


[![Strange Text RPG Discord](https://discordapp.com/api/guilds/846656069177573408/widget.png?style=banner4)](https://discord.gg/NXWxjtyT8n)

[Strange Text RPG Discord Invite Link](https://discord.gg/NXWxjtyT8n)

---------

## Prod
Telegram Bot [@StrangeTextRPGBot](https://t.me/StrangeTextRPGBot)

---------

## Development
For start

1) copy .env.template.json to .env.json

1) fill up .env.json

1) run `docker-compose up -d` to start containers in detach mode

1) run `docker exec -i strpg-main npm run db:seed:up` to fill database by seed

1) run `docker attach strpg-main` to attach current terminal to node container (In case you want use NODE_UI)

1) run `docker logs strpg-main -f --tail=0` for get logs from the server

1) ...

1) profit

---------

## Production

For deploy on prod we need:
### On Local Machine

```bash
VERSION_TAG=3.0.0
docker build -t strpg-main-prod -f Dockerfile.prod .
docker image tag strpg-main-prod:latest ik0s/strange-text-rpg:$VERSION_TAG
docker login
docker push ik0s/strange-text-rpg:$VERSION_TAG
docker logout
```

### On Production VPS

```bash
docker login
docker pull ik0s/strange-text-rpg:latest
docker logout
docker-compose -f docker-compose.prod.yml down
docker-compose -f docker-compose.prod.yml up -d
```

---------

### Helpful links
[Name (actors, armor, etc.) generators](https://www.fantasynamegenerators.com/)
[Bestiary](https://dungeon.su/bestiary/)

----------

### Support
Игра бесплатна.
Проект развивается на энтузиазме создателей.
Если тебе нравится, что мы делаем, ты можешь поддержать проект.

[Задонатить разово](https://www.tinkoff.ru/sl/5ZlcyYuMcv5)

[Become a Patron!](https://www.patreon.com/StrangeTextRPG)
