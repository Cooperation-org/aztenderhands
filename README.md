# Rovicare Notifier

Notify email/SMS whenever a new referral is found in Rovicare

## Getting started

To start the script

```bash
pnpm i
pnpm start
```

test the notification

```bash
pnpm test:notifications
```

Server Operations

Checking logs

```bash
cat logs/main.log
```

check avaiable process mangers (pm2)

```bash
pm2 list
```

to start pm2

```bash
pm2 start src/main.mjs --name rovicare-notifier
```

to stop pm2

```bash
pm2 stop rovicare-notifier
```

to delete pm2 operation

```bash
pm2 delete rovicare-notifier
```

to restart running script

```bash
pm2 restart rovicare-notifier
```

then save

```bash
pm2 save
```
