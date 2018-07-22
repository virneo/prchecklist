heroku config:set APP_ID=15006 WEBHOOK_SECRET=Vir_10243822 PRIVATE_KEY="$(cat ./key/private-key.pem)"
git add .
git commit -m "Heroku push"
git push heroku master